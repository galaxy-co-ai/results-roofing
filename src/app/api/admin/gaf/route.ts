/**
 * POST /api/admin/gaf
 * Manually trigger a GAF QuickMeasure order for a quote.
 * Also supports checking order status.
 *
 * GET /api/admin/gaf?quoteId=xxx
 * Check the GAF measurement status for a quote.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema, eq } from '@/db';
import { gafAdapter } from '@/lib/integrations/adapters/gaf';
import { logger } from '@/lib/utils';

async function validateAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_session')?.value;
  if (!adminToken) return false;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  return !!expected && adminToken === expected;
}

/**
 * GET /api/admin/gaf?quoteId=xxx
 * Check GAF measurement status for a quote
 */
export async function GET(request: NextRequest) {
  if (!(await validateAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const quoteId = request.nextUrl.searchParams.get('quoteId');
  if (!quoteId) {
    return NextResponse.json({ error: 'quoteId is required' }, { status: 400 });
  }

  const measurement = await db.query.measurements.findFirst({
    where: eq(schema.measurements.quoteId, quoteId),
  });

  if (!measurement) {
    return NextResponse.json({ measurement: null, message: 'No measurement found for this quote' });
  }

  return NextResponse.json({
    measurement: {
      id: measurement.id,
      vendor: measurement.vendor,
      status: measurement.status,
      gafOrderNumber: measurement.gafOrderNumber,
      gafAssets: measurement.gafAssets,
      sqftTotal: measurement.sqftTotal,
      pitchPrimary: measurement.pitchPrimary,
      confidence: measurement.confidence,
      ridgeLengthFt: measurement.ridgeLengthFt,
      valleyLengthFt: measurement.valleyLengthFt,
      eaveLengthFt: measurement.eaveLengthFt,
      hipLengthFt: measurement.hipLengthFt,
      errorMessage: measurement.errorMessage,
      requestedAt: measurement.requestedAt,
      completedAt: measurement.completedAt,
    },
  });
}

/**
 * POST /api/admin/gaf
 * Trigger a GAF QuickMeasure order for a quote
 *
 * Body: { quoteId: string }
 */
export async function POST(request: NextRequest) {
  if (!(await validateAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!gafAdapter.isConfigured()) {
    return NextResponse.json(
      {
        error: 'GAF QuickMeasure is not configured',
        missing: [
          !process.env.GAF_CLIENT_ID && 'GAF_CLIENT_ID',
          !process.env.GAF_CLIENT_SECRET && 'GAF_CLIENT_SECRET',
          !process.env.GAF_OKTA_TOKEN_URL && 'GAF_OKTA_TOKEN_URL',
          !process.env.GAF_API_URL && 'GAF_API_URL',
          !process.env.GAF_SUBSCRIBER_NAME && 'GAF_SUBSCRIBER_NAME',
          !process.env.GAF_PRODUCT_CODE && 'GAF_PRODUCT_CODE',
        ].filter(Boolean),
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const quoteId = body.quoteId;

    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId is required' }, { status: 400 });
    }

    // Fetch quote + lead
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
      with: { lead: true },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const lat = quote.lead?.lat ? parseFloat(quote.lead.lat) : null;
    const lng = quote.lead?.lng ? parseFloat(quote.lead.lng) : null;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Quote has no coordinates — cannot place GAF order without lat/lng' },
        { status: 400 }
      );
    }

    // Place the GAF order
    const gafResult = await gafAdapter.placeOrder({
      quoteId: quote.id,
      address1: quote.address!,
      city: quote.city!,
      state: quote.state!,
      zip: quote.zip!,
      lat,
      lng,
      fullAddress: `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`,
    });

    const gafOrderNumber = String(gafResult.OrderNumber || gafResult.orderId || '');

    // Update or create the measurement record
    const existingMeasurement = await db.query.measurements.findFirst({
      where: eq(schema.measurements.quoteId, quoteId),
    });

    if (existingMeasurement) {
      await db
        .update(schema.measurements)
        .set({
          gafOrderNumber,
          status: existingMeasurement.status === 'complete' ? 'complete' : 'processing',
        })
        .where(eq(schema.measurements.id, existingMeasurement.id));
    } else {
      await db.insert(schema.measurements).values({
        quoteId,
        vendor: 'google_solar',
        gafOrderNumber,
        status: 'processing',
      });
    }

    logger.info('[Admin GAF] QuickMeasure order placed', {
      quoteId,
      gafOrderNumber,
      address: `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`,
    });

    return NextResponse.json({
      success: true,
      gafOrderNumber,
      gafStatus: gafResult.Status,
      message: `GAF QuickMeasure order placed. Results will arrive via webhook in ~1 hour.`,
    });
  } catch (error) {
    logger.error('[Admin GAF] Failed to place order', error);
    return NextResponse.json(
      {
        error: 'Failed to place GAF order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
