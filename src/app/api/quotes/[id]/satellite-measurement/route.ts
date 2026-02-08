import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { fetchSolarMeasurement } from '@/lib/integrations/adapters/google-solar';
import { calculateQuotePricing } from '@/lib/pricing/calculate-quote';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

const GOOGLE_SOLAR_API_KEY = process.env.GOOGLE_SOLAR_API_KEY;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotes/[id]/satellite-measurement
 * Triggers a Google Solar API lookup for a quote, saves the measurement
 * to the DB, and recalculates pricing with real roof data.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: quoteId } = await params;

  if (!GOOGLE_SOLAR_API_KEY) {
    logger.error('[SatelliteMeasurement] GOOGLE_SOLAR_API_KEY not configured');
    return NextResponse.json(
      { error: 'Satellite measurement service not configured' },
      { status: 503 }
    );
  }

  try {
    // 1. Fetch the quote + lead to get lat/lng
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
      with: { lead: true },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const latitude = quote.lead?.lat ? parseFloat(quote.lead.lat) : null;
    const longitude = quote.lead?.lng ? parseFloat(quote.lead.lng) : null;

    // Fall back to body params if lead doesn't have coords
    let lat = latitude;
    let lng = longitude;

    if (!lat || !lng) {
      const body = await request.json().catch(() => ({}));
      lat = body.latitude;
      lng = body.longitude;
    }

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Location coordinates not available for this quote' },
        { status: 400 }
      );
    }

    // 2. Call Google Solar API
    const result = await fetchSolarMeasurement(lat, lng, GOOGLE_SOLAR_API_KEY);

    if (!result.success) {
      logger.warn(`[SatelliteMeasurement] Failed for quote ${quoteId}`, {
        code: result.error.code,
        message: result.error.message,
        billable: result.error.billable,
      });

      if (result.error.code === 'NOT_FOUND') {
        return NextResponse.json(
          {
            error: 'Building not found in satellite data',
            code: 'NOT_FOUND',
            fallback: 'manual_entry',
            message:
              'We couldn\'t find satellite data for this property. You can enter roof details manually for an accurate quote.',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: 502 }
      );
    }

    const measurement = result.data;

    // 3. Save measurement to DB
    const [savedMeasurement] = await db
      .insert(schema.measurements)
      .values({
        quoteId,
        sqftTotal: measurement.sqftTotal.toString(),
        sqftSteep: measurement.sqftSteep.toString(),
        sqftFlat: measurement.sqftFlat.toString(),
        pitchPrimary: measurement.pitchPrimary.toString(),
        pitchMin: measurement.pitchMin.toString(),
        pitchMax: measurement.pitchMax.toString(),
        facetCount: measurement.facetCount,
        complexity: measurement.complexity,
        confidence: measurement.confidence,
        imageryQuality: measurement.imageryQuality,
        imageryDate: measurement.imageryDate,
        vendor: 'google_solar',
        status: 'complete',
        rawResponse: measurement.rawResponse,
        completedAt: new Date(),
      })
      .returning();

    // 4. Recalculate quote pricing with real data
    const pricingTiers = await db.query.pricingTiers.findMany({
      where: eq(schema.pricingTiers.isActive, true),
      orderBy: (tiers, { asc }) => [asc(tiers.sortOrder)],
    });

    const updatedPricing = calculateQuotePricing(
      measurement.sqftTotal,
      pricingTiers,
      {
        complexity: measurement.complexity,
        pitchRatio: measurement.pitchPrimary,
        sqftSource: 'measured',
      }
    );

    // 5. Update quote with satellite data
    await db
      .update(schema.quotes)
      .set({
        sqftTotal: measurement.sqftTotal.toString(),
        pitchPrimary: measurement.pitchPrimary.toString(),
        complexity: measurement.complexity,
        status: 'measured',
        pricingData: {
          estimated: false,
          sqftTotal: measurement.sqftTotal,
          sqftSource: 'satellite',
          confidence: measurement.confidence,
          vendor: 'google_solar',
          tiers: updatedPricing.tiers,
          complexityMultiplier: updatedPricing.complexityMultiplier,
          pitchMultiplier: updatedPricing.pitchMultiplier,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info('[SatelliteMeasurement] Success', {
      quoteId,
      sqftTotal: measurement.sqftTotal,
      pitchPrimary: measurement.pitchPrimary,
      complexity: measurement.complexity,
      confidence: measurement.confidence,
    });

    // 6. Return measurement + updated pricing
    return NextResponse.json({
      success: true,
      measurement: {
        sqftTotal: measurement.sqftTotal,
        sqftSteep: measurement.sqftSteep,
        sqftFlat: measurement.sqftFlat,
        pitchPrimary: measurement.pitchPrimary,
        pitchMin: measurement.pitchMin,
        pitchMax: measurement.pitchMax,
        facetCount: measurement.facetCount,
        complexity: measurement.complexity,
        confidence: measurement.confidence,
        imageryQuality: measurement.imageryQuality,
        imageryDate: measurement.imageryDate,
      },
      pricing: updatedPricing,
      meta: {
        vendor: 'google_solar',
        source: 'satellite',
        measurementId: savedMeasurement.id,
      },
    });
  } catch (error) {
    logger.error('[SatelliteMeasurement] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
