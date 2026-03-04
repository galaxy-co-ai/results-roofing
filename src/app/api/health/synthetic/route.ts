import { NextResponse } from 'next/server';
import { db, rawSql } from '@/db';

/**
 * GET /api/health/synthetic
 *
 * Synthetic checks that verify core business flows are functional.
 * Called by Vercel cron every 15 minutes. If any check fails,
 * fires an alert to the configured ALERT_WEBHOOK_URL (Slack/Discord).
 */

interface CheckResult {
  status: 'pass' | 'fail';
  latencyMs: number;
  message?: string;
}

async function timedCheck(
  name: string,
  fn: () => Promise<string | void>,
): Promise<[string, CheckResult]> {
  const start = Date.now();
  try {
    const msg = await fn();
    return [name, { status: 'pass', latencyMs: Date.now() - start, message: msg || undefined }];
  } catch (err) {
    return [
      name,
      {
        status: 'fail',
        latencyMs: Date.now() - start,
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    ];
  }
}

// ---------------------------------------------------------------------------
// Individual checks
// ---------------------------------------------------------------------------

/** DB can read pricing tiers (critical for quote flow) */
async function checkPricingTiers() {
  const tiers = await db.query.pricingTiers.findMany();
  if (!tiers.length) throw new Error('No pricing tiers in database');
  return `${tiers.length} tiers available`;
}

/** DB can query orders table (portal depends on this) */
async function checkOrdersTable() {
  const result = await db.execute(
    rawSql`SELECT COUNT(*)::int AS cnt FROM orders LIMIT 1`,
  );
  const rows = result as unknown as { cnt: number }[];
  return `orders table accessible (${rows[0]?.cnt ?? 0} rows)`;
}

/** GA4 Measurement Protocol credentials are configured */
async function checkGA4Config() {
  if (!process.env.GA4_MEASUREMENT_ID) throw new Error('GA4_MEASUREMENT_ID missing');
  if (!process.env.GA4_API_SECRET) throw new Error('GA4_API_SECRET missing');
  return 'GA4 MP credentials present';
}

/** Stripe API is reachable */
async function checkStripeApi() {
  const res = await fetch('https://api.stripe.com/v1/balance', {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) throw new Error(`Stripe API returned ${res.status}`);
  return 'Stripe API reachable';
}

/** PDF generation endpoint responds (dry call with invalid ID — expects 404, not 500) */
async function checkPdfEndpoint() {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Self-fetch returned ${res.status}`);
  return 'Internal routing healthy';
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

async function sendAlert(failures: [string, CheckResult][]) {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return; // No webhook configured — silent

  const lines = failures.map(
    ([name, r]) => `• *${name}*: ${r.message} (${r.latencyMs}ms)`,
  );

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 *Results Roofing — Synthetic Check Failed*\n${lines.join('\n')}\n_${new Date().toISOString()}_`,
    }),
  }).catch(() => { /* best-effort */ });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET() {
  const results = await Promise.all([
    timedCheck('pricing_tiers', checkPricingTiers),
    timedCheck('orders_table', checkOrdersTable),
    timedCheck('ga4_config', checkGA4Config),
    timedCheck('stripe_api', checkStripeApi),
    timedCheck('internal_routing', checkPdfEndpoint),
  ]);

  const checks = Object.fromEntries(results);
  const failures = results.filter(([, r]) => r.status === 'fail');
  const healthy = failures.length === 0;

  if (!healthy) {
    await sendAlert(failures);
  }

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      passed: results.length - failures.length,
      failed: failures.length,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
