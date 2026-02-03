import { NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';

/**
 * GET /api/ops/health
 * Check ops dashboard health and integration status
 */
export async function GET() {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check GHL configuration
  const ghlApiKey = process.env.GHL_API_KEY;
  const ghlLocationId = process.env.GHL_LOCATION_ID;
  const ghlConfigured = Boolean(ghlApiKey && ghlLocationId);

  // Test GHL connection if configured
  let ghlConnected = false;
  if (ghlConfigured) {
    try {
      const response = await fetch(
        `https://services.leadconnectorhq.com/locations/${ghlLocationId}`,
        {
          headers: {
            Authorization: `Bearer ${ghlApiKey}`,
            Version: '2021-07-28',
          },
        }
      );
      ghlConnected = response.ok;
    } catch {
      ghlConnected = false;
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ghl: {
      configured: ghlConfigured,
      connected: ghlConnected,
    },
    features: {
      contacts: ghlConnected,
      conversations: ghlConnected,
      pipelines: ghlConnected,
      analytics: ghlConnected,
    },
  });
}
