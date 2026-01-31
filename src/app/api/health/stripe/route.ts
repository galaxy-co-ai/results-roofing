import { NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * GET /api/health/stripe
 *
 * Health check endpoint to verify Stripe configuration.
 * Returns status of all required Stripe environment variables
 * and tests API connectivity.
 */
export async function GET() {
  const checks: Record<string, { status: 'ok' | 'missing' | 'error'; message?: string }> = {};

  // Check environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  checks.STRIPE_SECRET_KEY = secretKey
    ? { status: 'ok', message: `Set (${secretKey.substring(0, 7)}...)` }
    : { status: 'missing', message: 'Not configured' };

  checks.STRIPE_WEBHOOK_SECRET = webhookSecret
    ? { status: 'ok', message: `Set (${webhookSecret.substring(0, 10)}...)` }
    : { status: 'missing', message: 'Not configured - webhooks will fail!' };

  checks.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = publishableKey
    ? { status: 'ok', message: `Set (${publishableKey.substring(0, 7)}...)` }
    : { status: 'missing', message: 'Not configured' };

  // Test Stripe API connectivity if secret key is available
  if (secretKey) {
    try {
      const stripe = new Stripe(secretKey, {
        apiVersion: '2025-02-24.acacia',
      });

      // Simple API call to verify connectivity
      const balance = await stripe.balance.retrieve();
      checks.API_CONNECTION = {
        status: 'ok',
        message: `Connected (${balance.available.length} currency balances)`
      };
    } catch (error) {
      checks.API_CONNECTION = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  } else {
    checks.API_CONNECTION = {
      status: 'missing',
      message: 'Cannot test - STRIPE_SECRET_KEY not set'
    };
  }

  // Determine overall health
  const allOk = Object.values(checks).every(c => c.status === 'ok');
  const hasCriticalMissing = !secretKey || !webhookSecret;

  return NextResponse.json({
    healthy: allOk,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    checks,
    webhookEndpoint: '/api/payments/webhook',
    requiredEvents: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'charge.refunded'
    ],
    ...(hasCriticalMissing && {
      action_required: 'Add missing environment variables to Vercel'
    })
  }, {
    status: allOk ? 200 : 503
  });
}
