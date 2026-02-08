import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db/index';
import { estimateRoofSqft, calculatePriceRanges } from '@/lib/pricing';
import { estimateSqftFromSatellite } from '@/lib/pricing/estimate-sqft';
import { calculateQuotePricing } from '@/lib/pricing/calculate-quote';
import { logger } from '@/lib/utils';

const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ', 'OK'];

interface AddressParts {
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface StructuredAddress {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  smsConsent?: {
    consented: boolean;
    consentText: string;
    timestamp: string;
  };
}

/**
 * Parse a full address string into components
 * Expected format: "123 Main St, City, State ZIP" or "123 Main St, City, State, ZIP"
 */
function parseAddress(fullAddress: string): AddressParts | null {
  // Remove extra whitespace and normalize
  const normalized = fullAddress.trim().replace(/\s+/g, ' ');

  // Try to extract ZIP code (5 digits, optionally with -4 extension)
  const zipMatch = normalized.match(/\b(\d{5}(?:-\d{4})?)\s*$/);
  if (!zipMatch) return null;

  const zip = zipMatch[1];
  const withoutZip = normalized.slice(0, -zipMatch[0].length).trim();

  // Try to extract state (2-letter abbreviation)
  const stateMatch = withoutZip.match(/,?\s*([A-Z]{2})\s*$/i);
  if (!stateMatch) return null;

  const state = stateMatch[1].toUpperCase();
  const withoutState = withoutZip.slice(0, -stateMatch[0].length).trim();

  // Split remaining by comma to get street address and city
  const parts = withoutState.split(',').map((p) => p.trim());
  if (parts.length < 2) return null;

  const city = parts.pop()!;
  const address = parts.join(', ');

  return { address, city, state, zip };
}

/**
 * Check if request body is structured address from Google Places
 */
function isStructuredAddress(body: unknown): body is StructuredAddress {
  if (typeof body !== 'object' || body === null) return false;
  const obj = body as Record<string, unknown>;
  return (
    typeof obj.streetAddress === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.zip === 'string'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let addressData: AddressParts;

    // Handle both structured address (from Google Places) and plain text
    if (isStructuredAddress(body)) {
      addressData = {
        address: body.streetAddress,
        city: body.city,
        state: body.state.toUpperCase(),
        zip: body.zip,
      };
    } else if (body.address && typeof body.address === 'string') {
      const parsed = parseAddress(body.address);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Invalid address format. Please enter a complete address with city, state, and ZIP.' },
          { status: 400 }
        );
      }
      addressData = parsed;
    } else {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Check if state is in service area
    if (!SERVICE_STATES.includes(addressData.state)) {
      return NextResponse.json(
        {
          error: `Sorry, we currently only serve ${SERVICE_STATES.join(', ')}. Your state (${addressData.state}) is not in our service area.`,
          outOfArea: true,
          state: addressData.state,
        },
        { status: 400 }
      );
    }

    // Estimate roof square footage for preliminary pricing
    const sqftEstimate = estimateRoofSqft(addressData.state, addressData.zip);

    // Get pricing tiers
    const pricingTiers = await db.query.pricingTiers.findMany({
      where: eq(schema.pricingTiers.isActive, true),
      orderBy: (tiers, { asc }) => [asc(tiers.sortOrder)],
    });

    // Calculate preliminary price ranges
    const priceRanges = calculatePriceRanges(
      sqftEstimate.sqftMin,
      sqftEstimate.sqftMax,
      pricingTiers
    );

    // Extract phone, lat/lng, and SMS consent from body
    const phone = isStructuredAddress(body) ? body.phone : undefined;
    const lat = isStructuredAddress(body) ? body.lat : undefined;
    const lng = isStructuredAddress(body) ? body.lng : undefined;
    const smsConsentData = isStructuredAddress(body) ? body.smsConsent : undefined;

    // Get IP and user agent for TCPA compliance tracking
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create lead first
    const [lead] = await db
      .insert(schema.leads)
      .values({
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        zip: addressData.zip,
        phone: phone || null,
        lat: lat?.toString() || null,
        lng: lng?.toString() || null,
      })
      .returning();

    // Create SMS consent record if provided (F26: TCPA Compliance)
    if (smsConsentData?.consented && phone) {
      await db.insert(schema.smsConsents).values({
        leadId: lead.id,
        phone: phone,
        consentGiven: true,
        consentSource: 'web_form',
        consentText: smsConsentData.consentText,
        ipAddress,
        userAgent,
      });
      logger.info('SMS consent recorded', { leadId: lead.id, phone });
    }

    // Create quote linked to lead with preliminary estimate
    const [quote] = await db
      .insert(schema.quotes)
      .values({
        leadId: lead.id,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        zip: addressData.zip,
        status: 'preliminary',
        sqftTotal: sqftEstimate.sqftEstimate.toString(),
        pricingData: {
          estimated: true,
          sqftEstimate: sqftEstimate.sqftEstimate,
          sqftMin: sqftEstimate.sqftMin,
          sqftMax: sqftEstimate.sqftMax,
          confidence: sqftEstimate.confidence,
          source: sqftEstimate.source,
          tiers: priceRanges,
        },
        // Set expiration to 30 days from now
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .returning();

    // Fire-and-forget: attempt satellite measurement in background
    // This upgrades the regional estimate with real satellite data
    if (lat && lng) {
      estimateSqftFromSatellite(Number(lat), Number(lng))
        .then(async (satelliteEstimate) => {
          if (!satelliteEstimate?.satelliteData) return;

          const m = satelliteEstimate.satelliteData;

          // Save measurement record
          await db.insert(schema.measurements).values({
            quoteId: quote.id,
            sqftTotal: m.sqftTotal.toString(),
            sqftSteep: m.sqftSteep.toString(),
            sqftFlat: m.sqftFlat.toString(),
            pitchPrimary: m.pitchPrimary.toString(),
            pitchMin: m.pitchMin.toString(),
            pitchMax: m.pitchMax.toString(),
            facetCount: m.facetCount,
            complexity: m.complexity,
            confidence: m.confidence,
            imageryQuality: m.imageryQuality,
            imageryDate: m.imageryDate,
            vendor: 'google_solar',
            status: 'complete',
            rawResponse: m.rawResponse,
            completedAt: new Date(),
          });

          // Recalculate pricing with satellite data
          const updatedPricing = calculateQuotePricing(
            m.sqftTotal,
            pricingTiers,
            {
              complexity: m.complexity,
              pitchRatio: m.pitchPrimary,
              sqftSource: 'measured',
            }
          );

          // Update quote with satellite measurements + recalculated pricing
          await db
            .update(schema.quotes)
            .set({
              sqftTotal: m.sqftTotal.toString(),
              pitchPrimary: m.pitchPrimary.toString(),
              complexity: m.complexity,
              status: 'measured',
              pricingData: {
                estimated: false,
                sqftTotal: m.sqftTotal,
                sqftSource: 'satellite',
                confidence: satelliteEstimate.confidence,
                vendor: 'google_solar',
                tiers: updatedPricing.tiers,
                complexityMultiplier: updatedPricing.complexityMultiplier,
                pitchMultiplier: updatedPricing.pitchMultiplier,
              },
              updatedAt: new Date(),
            })
            .where(eq(schema.quotes.id, quote.id));

          logger.info('[QuoteCreate] Satellite measurement saved in background', {
            quoteId: quote.id,
            sqftTotal: m.sqftTotal,
            confidence: satelliteEstimate.confidence,
          });
        })
        .catch((err) => {
          logger.warn('[QuoteCreate] Background satellite measurement failed', {
            quoteId: quote.id,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        });
    }

    return NextResponse.json({
      id: quote.id,
      status: quote.status,
      address: {
        street: quote.address,
        city: quote.city,
        state: quote.state,
        zip: quote.zip,
      },
      estimate: {
        sqft: sqftEstimate.sqftEstimate,
        sqftRange: { min: sqftEstimate.sqftMin, max: sqftEstimate.sqftMax },
        confidence: sqftEstimate.confidence,
        tiers: priceRanges,
      },
    });
  } catch (error) {
    logger.error('Error creating quote', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Quote ID is required' },
      { status: 400 }
    );
  }

  try {
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, id),
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    logger.error('Error fetching quote', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
