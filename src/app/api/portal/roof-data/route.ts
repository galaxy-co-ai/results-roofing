import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq } from '@/db';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { RoofDataResponse } from '@/lib/roof/types';

/**
 * GET /api/portal/roof-data?quoteId=xxx
 * Returns Google Solar segment data for the 3D roof visualizer.
 *
 * Auth chain (3 levels, checked in order):
 * 1. orders.clerkUserId WHERE orders.quoteId = quoteId
 * 2. quotes.clerkUserId WHERE quotes.id = quoteId
 * 3. leads.email via quotes.leadId → leads.id (only if user email available)
 *
 * Returns 404 (not 403) when unauthorized — prevents leaking existence.
 */
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (DEV_BYPASS_ENABLED) {
      userId = MOCK_USER.id;
      userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
    } else {
      const authResult = await auth();
      userId = authResult.userId;
      // userEmail populated below if needed for level-3 check
    }

    if (!userId && !DEV_BYPASS_ENABLED) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quoteId = request.nextUrl.searchParams.get('quoteId');
    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId is required' }, { status: 400 });
    }

    // ── Auth level 1: orders.clerkUserId ───────────────────────────────────
    let authorized = false;

    if (!DEV_BYPASS_ENABLED) {
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.quoteId, quoteId),
      });

      if (order?.clerkUserId && order.clerkUserId === userId) {
        authorized = true;
      }

      // ── Auth level 2: quotes.clerkUserId ─────────────────────────────────
      if (!authorized) {
        const quote = await db.query.quotes.findFirst({
          where: eq(schema.quotes.id, quoteId),
          with: { lead: true },
        });

        if (quote?.clerkUserId && quote.clerkUserId === userId) {
          authorized = true;
        }

        // ── Auth level 3: leads.email ───────────────────────────────────────
        if (!authorized && quote?.lead) {
          // Resolve caller's email if not already available
          if (!userEmail && userId) {
            try {
              const { clerkClient } = await import('@clerk/nextjs/server');
              const client = await clerkClient();
              const user = await client.users.getUser(userId);
              userEmail = user.emailAddresses[0]?.emailAddress ?? null;
            } catch {
              // non-fatal — fall through to 404
            }
          }

          if (userEmail && quote.lead.email === userEmail) {
            authorized = true;
          }
        }
      }

      if (!authorized) {
        // Return 404 to avoid leaking existence of the resource
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    // ── Fetch measurement ──────────────────────────────────────────────────
    const measurement = await db.query.measurements.findFirst({
      where: eq(schema.measurements.quoteId, quoteId),
    });

    if (!measurement) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (measurement.vendor !== 'google_solar') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (measurement.status !== 'complete') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // ── Extract Solar data from rawResponse ───────────────────────────────
    const raw = measurement.rawResponse as Record<string, unknown> | null;
    const solarPotential = raw?.solarPotential as Record<string, unknown> | undefined;
    const segments = (solarPotential?.roofSegmentStats as unknown[]) ?? [];
    const center = raw?.center as { latitude: number; longitude: number } | undefined;
    const bboxRaw = raw?.boundingBox as
      | { sw: { latitude: number; longitude: number }; ne: { latitude: number; longitude: number } }
      | undefined;

    if (!center || segments.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const response: RoofDataResponse = {
      segments: segments as RoofDataResponse['segments'],
      buildingCenter: { lat: center.latitude, lng: center.longitude },
      buildingBoundingBox: bboxRaw
        ? {
            sw: { lat: bboxRaw.sw.latitude, lng: bboxRaw.sw.longitude },
            ne: { lat: bboxRaw.ne.latitude, lng: bboxRaw.ne.longitude },
          }
        : null,
      stats: {
        sqftTotal: measurement.sqftTotal ? Number(measurement.sqftTotal) : 0,
        pitchPrimary: measurement.pitchPrimary ?? 'Unknown',
        facetCount: segments.length,
        vendor: 'google_solar',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching roof data', error);
    return NextResponse.json({ error: 'Failed to fetch roof data' }, { status: 500 });
  }
}
