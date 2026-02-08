/**
 * Google Solar API Adapter
 *
 * Calls Google's buildingInsights.findClosest endpoint with lat/lng
 * and transforms the response into our MeasurementData shape.
 *
 * Docs: https://developers.google.com/maps/documentation/solar/building-insights
 * Pricing: ~$0.075/request, NOT_FOUND errors are free
 * Rate limit: 600 queries/minute
 * Coverage: 95%+ US buildings
 */

import { z } from 'zod';

// ============================================================
// Google Solar API Response Types
// ============================================================

const LatLngSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const LatLngBoxSchema = z.object({
  sw: LatLngSchema,
  ne: LatLngSchema,
});

const SizeAndSunshineStatsSchema = z.object({
  areaMeters2: z.number(),
  sunshineQuantiles: z.array(z.number()).optional(),
  groundAreaMeters2: z.number().optional(),
});

const RoofSegmentStatsSchema = z.object({
  pitchDegrees: z.number(),
  azimuthDegrees: z.number(),
  stats: SizeAndSunshineStatsSchema,
  center: LatLngSchema.optional(),
  boundingBox: LatLngBoxSchema.optional(),
  planeHeightAtCenterMeters: z.number().optional(),
});

const SolarPotentialSchema = z.object({
  maxArrayPanelsCount: z.number().optional(),
  maxArrayAreaMeters2: z.number().optional(),
  maxSunshineHoursPerYear: z.number().optional(),
  carbonOffsetFactorKgPerMwh: z.number().optional(),
  wholeRoofStats: SizeAndSunshineStatsSchema,
  roofSegmentStats: z.array(RoofSegmentStatsSchema).optional(),
  panelCapacityWatts: z.number().optional(),
  panelHeightMeters: z.number().optional(),
  panelWidthMeters: z.number().optional(),
  panelLifetimeYears: z.number().optional(),
});

const BuildingInsightsResponseSchema = z.object({
  name: z.string().optional(),
  center: LatLngSchema,
  boundingBox: LatLngBoxSchema.optional(),
  imageryDate: z.object({
    year: z.number(),
    month: z.number(),
    day: z.number(),
  }).optional(),
  imageryProcessedDate: z.object({
    year: z.number(),
    month: z.number(),
    day: z.number(),
  }).optional(),
  postalCode: z.string().optional(),
  administrativeArea: z.string().optional(),
  regionCode: z.string().optional(),
  solarPotential: SolarPotentialSchema,
  imageryQuality: z.enum(['HIGH', 'MEDIUM', 'BASE']).optional(),
});

type BuildingInsightsResponse = z.infer<typeof BuildingInsightsResponseSchema>;

// ============================================================
// Output Types (matches existing MeasurementData shape)
// ============================================================

export interface SolarMeasurementResult {
  /** Total roof area in sqft (converted from meters²) */
  sqftTotal: number;
  /** Steep roof area in sqft (segments with pitch > 25°) */
  sqftSteep: number;
  /** Flat/standard roof area in sqft (segments with pitch ≤ 25°) */
  sqftFlat: number;
  /** Predominant pitch in standard roof notation (e.g., 4, 6, 8, 10, 12) */
  pitchPrimary: number;
  /** Minimum pitch found across segments */
  pitchMin: number;
  /** Maximum pitch found across segments */
  pitchMax: number;
  /** Number of distinct roof segments/facets */
  facetCount: number;
  /** Roof complexity based on segment count and pitch variance */
  complexity: 'simple' | 'moderate' | 'complex';
  /** Data source identifier */
  source: 'satellite';
  /** Vendor identifier for DB storage */
  vendor: 'google_solar';
  /** Confidence level based on imagery quality */
  confidence: 'high' | 'medium' | 'low';
  /** Imagery quality from Google */
  imageryQuality: 'HIGH' | 'MEDIUM' | 'BASE';
  /** When the satellite imagery was captured */
  imageryDate: string | null;
  /** Raw API response for JSONB storage */
  rawResponse: BuildingInsightsResponse;
}

export interface SolarMeasurementError {
  code: 'NOT_FOUND' | 'API_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMITED';
  message: string;
  /** NOT_FOUND errors are free (no billing) */
  billable: boolean;
}

export type SolarMeasurementOutcome =
  | { success: true; data: SolarMeasurementResult }
  | { success: false; error: SolarMeasurementError };

// ============================================================
// Constants
// ============================================================

const SOLAR_API_BASE = 'https://solar.googleapis.com/v1';
const SQ_METERS_TO_SQ_FEET = 10.7639;

/**
 * Convert pitch in degrees to roof pitch notation (rise per 12 inches run).
 * Common roof pitches: 4/12 (18.4°), 6/12 (26.6°), 8/12 (33.7°),
 * 10/12 (39.8°), 12/12 (45°)
 */
function degreesToRoofPitch(degrees: number): number {
  const rise = Math.tan((degrees * Math.PI) / 180) * 12;
  const standardPitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18];
  return standardPitches.reduce((prev, curr) =>
    Math.abs(curr - rise) < Math.abs(prev - rise) ? curr : prev
  );
}

/**
 * Determine roof complexity based on segment count and pitch variance.
 * Aligns with existing complexity multipliers:
 * - simple: 1.0x (1-2 segments, low pitch variance)
 * - moderate: 1.1x (3-6 segments or moderate variance)
 * - complex: 1.3x (7+ segments or high variance)
 */
function determineComplexity(
  facetCount: number,
  pitchVariance: number
): 'simple' | 'moderate' | 'complex' {
  if (facetCount >= 7 || pitchVariance > 15) return 'complex';
  if (facetCount >= 3 || pitchVariance > 8) return 'moderate';
  return 'simple';
}

function qualityToConfidence(quality: string): 'high' | 'medium' | 'low' {
  switch (quality) {
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    default: return 'low';
  }
}

// ============================================================
// Main API Function
// ============================================================

/**
 * Fetch roof measurement data from Google Solar API.
 *
 * @param lat - Latitude of the property
 * @param lng - Longitude of the property
 * @param apiKey - Google Cloud API key with Solar API enabled
 * @returns Measurement result or error
 */
export async function fetchSolarMeasurement(
  lat: number,
  lng: number,
  apiKey: string
): Promise<SolarMeasurementOutcome> {
  const url = new URL(`${SOLAR_API_BASE}/buildingInsights:findClosest`);
  url.searchParams.set('location.latitude', lat.toFixed(5));
  url.searchParams.set('location.longitude', lng.toFixed(5));
  url.searchParams.set('requiredQuality', 'MEDIUM');
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 404) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No building found near this location. The property may not be in Google\'s coverage area.',
          billable: false,
        },
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Solar API rate limit reached. Please try again in a moment.',
          billable: false,
        },
      };
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: `Google Solar API error (${response.status}): ${errorBody}`,
          billable: false,
        },
      };
    }

    const rawJson = await response.json();

    const parseResult = BuildingInsightsResponseSchema.safeParse(rawJson);
    if (!parseResult.success) {
      console.error('[GoogleSolar] Validation error:', parseResult.error.flatten());
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Unexpected response shape from Google Solar API.',
          billable: true,
        },
      };
    }

    const data = parseResult.data;
    return {
      success: true,
      data: transformToMeasurement(data),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: `Failed to fetch solar data: ${message}`,
        billable: false,
      },
    };
  }
}

// ============================================================
// Transform Google Response → MeasurementData
// ============================================================

function transformToMeasurement(data: BuildingInsightsResponse): SolarMeasurementResult {
  const { solarPotential, imageryQuality, imageryDate } = data;
  const segments = solarPotential.roofSegmentStats ?? [];

  // Total roof area (whole roof stats from Google)
  const totalAreaM2 = solarPotential.wholeRoofStats.areaMeters2;
  const sqftTotal = Math.round(totalAreaM2 * SQ_METERS_TO_SQ_FEET);

  // Per-segment analysis
  const segmentData = segments.map((seg) => ({
    areaSqft: seg.stats.areaMeters2 * SQ_METERS_TO_SQ_FEET,
    pitchDegrees: seg.pitchDegrees,
    pitchRoof: degreesToRoofPitch(seg.pitchDegrees),
  }));

  // Steep threshold: > 25° (roughly > 6/12 pitch)
  const STEEP_THRESHOLD_DEGREES = 25;
  const sqftSteep = Math.round(
    segmentData
      .filter((s) => s.pitchDegrees > STEEP_THRESHOLD_DEGREES)
      .reduce((sum, s) => sum + s.areaSqft, 0)
  );
  const sqftFlat = sqftTotal - sqftSteep;

  // Pitch analysis — predominant pitch = pitch of the largest segment
  const sortedByArea = [...segmentData].sort((a, b) => b.areaSqft - a.areaSqft);
  const pitchPrimary = sortedByArea.length > 0 ? sortedByArea[0].pitchRoof : 4;

  const allPitches = segmentData.map((s) => s.pitchRoof);
  const pitchMin = allPitches.length > 0 ? Math.min(...allPitches) : pitchPrimary;
  const pitchMax = allPitches.length > 0 ? Math.max(...allPitches) : pitchPrimary;
  const pitchVariance = pitchMax - pitchMin;

  // Complexity & facet count
  const facetCount = segments.length || 1;
  const complexity = determineComplexity(facetCount, pitchVariance);

  // Imagery date
  const imageryDateStr = imageryDate
    ? `${imageryDate.year}-${String(imageryDate.month).padStart(2, '0')}-${String(imageryDate.day).padStart(2, '0')}`
    : null;

  return {
    sqftTotal,
    sqftSteep,
    sqftFlat,
    pitchPrimary,
    pitchMin,
    pitchMax,
    facetCount,
    complexity,
    source: 'satellite',
    vendor: 'google_solar',
    confidence: qualityToConfidence(imageryQuality ?? 'BASE'),
    imageryQuality: imageryQuality ?? 'BASE',
    imageryDate: imageryDateStr,
    rawResponse: data,
  };
}
