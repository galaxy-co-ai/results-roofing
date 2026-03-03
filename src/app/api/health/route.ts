import { NextResponse } from 'next/server';
import { db, rawSql } from '@/db';

const REQUIRED_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'CLERK_SECRET_KEY',
  'GAF_CLIENT_ID',
] as const;

export async function GET() {
  const checks = {
    db: false,
    env: false,
  };

  // Check database connectivity
  try {
    await db.execute(rawSql`SELECT 1`);
    checks.db = true;
  } catch {
    // db stays false
  }

  // Check required env vars exist
  checks.env = REQUIRED_ENV_VARS.every((key) => !!process.env[key]);

  const healthy = checks.db && checks.env;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
