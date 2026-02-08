/**
 * Smart Sqft Estimation
 *
 * Two-tier approach:
 * 1. Try Google Solar API for real satellite measurements (confidence: high/medium)
 * 2. Fall back to regional averages if satellite data unavailable (confidence: low)
 *
 * The satellite lookup runs async so it doesn't block the initial quote creation.
 * Regional averages are returned immediately, then upgraded when satellite data arrives.
 */

import { fetchSolarMeasurement, type SolarMeasurementResult } from '@/lib/integrations/adapters/google-solar';

// ============================================================
// Types
// ============================================================

export interface SqftEstimate {
  sqftTotal: number;
  sqftMin: number;
  sqftMax: number;
  pitchPrimary: number;
  complexity: 'simple' | 'moderate' | 'complex';
  confidence: 'high' | 'medium' | 'low';
  source: 'satellite' | 'regional_average';
  vendor: 'google_solar' | 'regional';
  /** Full satellite measurement data if available */
  satelliteData?: SolarMeasurementResult;
}

// ============================================================
// Regional Averages (kept as fallback)
// ============================================================

const REGIONAL_AVERAGES: Record<string, { avg: number; min: number; max: number }> = {
  TX: { avg: 2800, min: 1800, max: 4500 },
  GA: { avg: 2600, min: 1600, max: 4200 },
  NC: { avg: 2400, min: 1500, max: 4000 },
  AZ: { avg: 2500, min: 1500, max: 4200 },
  OK: { avg: 2600, min: 1600, max: 4200 },
};

const DEFAULT_REGIONAL = { avg: 2500, min: 1500, max: 4200 };

// ============================================================
// Regional Fallback (fast, used for initial quote display)
// ============================================================

export function estimateSqftFromRegion(state: string): SqftEstimate {
  const regional = REGIONAL_AVERAGES[state.toUpperCase()] ?? DEFAULT_REGIONAL;

  return {
    sqftTotal: regional.avg,
    sqftMin: regional.min,
    sqftMax: regional.max,
    pitchPrimary: 6, // Assume standard 6/12 pitch
    complexity: 'moderate', // Default assumption
    confidence: 'low',
    source: 'regional_average',
    vendor: 'regional',
  };
}

/**
 * Backward-compatible alias for estimateSqftFromRegion.
 * Maps the old return shape so existing consumers don't break.
 */
export function estimateRoofSqft(state: string, _zip?: string) {
  const est = estimateSqftFromRegion(state);
  return {
    sqftEstimate: est.sqftTotal,
    sqftMin: est.sqftMin,
    sqftMax: est.sqftMax,
    confidence: est.confidence,
    source: est.source,
  };
}

// ============================================================
// Satellite Measurement (accurate, used to upgrade the estimate)
// ============================================================

/**
 * Attempt to get real roof measurements from Google Solar API.
 * Returns null if the building isn't found or the API fails.
 *
 * Designed to be called AFTER the initial quote is created
 * with regional averages, so the user sees immediate pricing that
 * gets upgraded to satellite-accurate pricing within seconds.
 */
export async function estimateSqftFromSatellite(
  lat: number,
  lng: number
): Promise<SqftEstimate | null> {
  const apiKey = process.env.GOOGLE_SOLAR_API_KEY;

  if (!apiKey) {
    console.warn('[estimateSqft] GOOGLE_SOLAR_API_KEY not set, using regional fallback');
    return null;
  }

  const result = await fetchSolarMeasurement(lat, lng, apiKey);

  if (!result.success) {
    console.warn(`[estimateSqft] Satellite lookup failed: ${result.error.message}`);
    return null;
  }

  const m = result.data;

  return {
    sqftTotal: m.sqftTotal,
    sqftMin: Math.round(m.sqftTotal * 0.95), // 5% margin
    sqftMax: Math.round(m.sqftTotal * 1.05),
    pitchPrimary: m.pitchPrimary,
    complexity: m.complexity,
    confidence: m.confidence,
    source: 'satellite',
    vendor: 'google_solar',
    satelliteData: m,
  };
}

// ============================================================
// Combined Smart Estimation
// ============================================================

/**
 * Smart estimation: tries satellite first, falls back to regional averages.
 *
 * For synchronous usage (if you want to wait for satellite):
 *   const estimate = await estimateSqftSmart(lat, lng, state, { waitForSatellite: true });
 */
export async function estimateSqftSmart(
  lat: number,
  lng: number,
  state: string,
  options: { waitForSatellite?: boolean } = {}
): Promise<SqftEstimate> {
  if (options.waitForSatellite) {
    const satellite = await estimateSqftFromSatellite(lat, lng);
    if (satellite) return satellite;
  }

  return estimateSqftFromRegion(state);
}

/**
 * Calculate price range for a tier given sq ft estimate.
 * Kept for backward compatibility with tests.
 */
export function calculatePriceRange(
  sqftMin: number,
  sqftMax: number,
  materialPricePerSqft: number,
  laborPricePerSqft: number
): { min: number; max: number } {
  const pricePerSqft = materialPricePerSqft + laborPricePerSqft;
  return {
    min: Math.round(sqftMin * pricePerSqft),
    max: Math.round(sqftMax * pricePerSqft),
  };
}
