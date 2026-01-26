/**
 * Preliminary roof sq ft estimation
 *
 * For MVP, we use regional averages since we don't have property data API yet.
 * This gives customers an instant ballpark before Roofr provides exact measurements.
 *
 * Future enhancements:
 * - Integrate with ATTOM Data, CoreLogic, or county assessor APIs
 * - Use Roofr instant estimate if available
 * - Allow user self-reporting as fallback
 */

interface EstimateResult {
  sqftEstimate: number;
  sqftMin: number;
  sqftMax: number;
  confidence: 'low' | 'medium' | 'high';
  source: 'regional_average' | 'property_data' | 'user_input';
}

// Regional average home sizes by state (roof sq ft, not floor sq ft)
// Roof sq ft is typically 1.1-1.4x floor sq ft depending on pitch
// Using conservative multiplier of 1.2 for initial estimates
const REGIONAL_AVERAGES: Record<string, { avgSqft: number; minSqft: number; maxSqft: number }> = {
  // Texas - large homes, especially in affluent areas
  TX: { avgSqft: 2800, minSqft: 1800, maxSqft: 4500 },
  // Georgia - Atlanta metro has larger homes
  GA: { avgSqft: 2600, minSqft: 1600, maxSqft: 4200 },
  // North Carolina - Wilmington area
  NC: { avgSqft: 2400, minSqft: 1500, maxSqft: 3800 },
  // Arizona - Phoenix metro
  AZ: { avgSqft: 2500, minSqft: 1600, maxSqft: 4000 },
  // Oklahoma - OKC and Tulsa metros
  OK: { avgSqft: 2400, minSqft: 1500, maxSqft: 3800 },
};

// Default for unknown states
const DEFAULT_AVERAGE = { avgSqft: 2500, minSqft: 1500, maxSqft: 4000 };

/**
 * Estimate roof square footage based on location
 *
 * @param state - Two-letter state code
 * @param zip - ZIP code (for future refinement)
 * @returns Estimated sq ft with confidence interval
 */
export function estimateRoofSqft(state: string, _zip?: string): EstimateResult {
  const stateUpper = state.toUpperCase();
  const regional = REGIONAL_AVERAGES[stateUpper] || DEFAULT_AVERAGE;

  // TODO: In the future, use ZIP code for more granular estimates
  // Affluent ZIPs tend to have larger homes

  return {
    sqftEstimate: regional.avgSqft,
    sqftMin: regional.minSqft,
    sqftMax: regional.maxSqft,
    confidence: 'low', // Regional averages have low confidence
    source: 'regional_average',
  };
}

/**
 * Calculate price range for a tier given sq ft estimate
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
