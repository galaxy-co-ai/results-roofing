/**
 * Quote Pricing Engine
 *
 * Calculates Good/Better/Best tier pricing based on:
 * - Roof square footage (estimated or measured)
 * - Material costs per tier
 * - Labor costs
 * - Complexity and pitch adjustments (F29)
 *
 * Implements F27 (Deposit Calculation) and F28 (Tier Pricing)
 */

import type { PricingTier } from '@/db/schema';

// Deposit configuration (F27)
const DEPOSIT_CONFIG = {
  percentage: 0.1, // 10%
  minimum: 500,
  maximum: 2500,
};

// Complexity multipliers (F29)
const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
  simple: 1.0,
  moderate: 1.15,
  complex: 1.3,
};

// Pitch adjustments (F29)
const PITCH_ADJUSTMENTS: Record<string, number> = {
  standard: 1.0, // 4:12 to 7:12
  steep: 1.1, // 8:12 to 10:12
  very_steep: 1.2, // >10:12
};

export interface TierPricing {
  tier: string;
  displayName: string;
  description: string;
  basePrice: number;
  adjustedPrice: number;
  pricePerSqft: number;
  materialCost: number;
  laborCost: number;
  deposit: number;
  monthlyEstimate: number; // Simple estimate for display, not from Wisetack
}

export interface QuotePricing {
  sqft: number;
  sqftSource: 'estimated' | 'measured';
  complexity: string;
  pitch: string;
  complexityMultiplier: number;
  pitchMultiplier: number;
  tiers: TierPricing[];
  expiresAt: Date;
}

export interface PriceRangeResult {
  tier: string;
  displayName: string;
  description: string;
  priceMin: number;
  priceMax: number;
  depositMin: number;
  depositMax: number;
}

/**
 * Calculate deposit amount per F27 rules
 */
export function calculateDeposit(totalPrice: number): number {
  const deposit = totalPrice * DEPOSIT_CONFIG.percentage;
  return Math.min(Math.max(deposit, DEPOSIT_CONFIG.minimum), DEPOSIT_CONFIG.maximum);
}

/**
 * Get pitch category from pitch ratio (e.g., 6 for 6:12)
 */
export function getPitchCategory(pitchRatio: number): string {
  if (pitchRatio > 10) return 'very_steep';
  if (pitchRatio >= 8) return 'steep';
  return 'standard';
}

/**
 * Calculate preliminary price ranges (for F02)
 * Used when we only have estimated sq ft, not exact measurements
 */
export function calculatePriceRanges(
  sqftMin: number,
  sqftMax: number,
  pricingTiers: PricingTier[]
): PriceRangeResult[] {
  return pricingTiers.map((tier) => {
    const materialPrice = parseFloat(tier.materialPricePerSqft);
    const laborPrice = parseFloat(tier.laborPricePerSqft);
    const pricePerSqft = materialPrice + laborPrice;

    const priceMin = Math.round(sqftMin * pricePerSqft);
    const priceMax = Math.round(sqftMax * pricePerSqft);

    return {
      tier: tier.tier,
      displayName: tier.displayName,
      description: tier.description || '',
      priceMin,
      priceMax,
      depositMin: calculateDeposit(priceMin),
      depositMax: calculateDeposit(priceMax),
    };
  });
}

/**
 * Calculate exact quote pricing (for F03/F04)
 * Used when we have exact measurements from Roofr
 */
export function calculateQuotePricing(
  sqft: number,
  pricingTiers: PricingTier[],
  options: {
    complexity?: string;
    pitchRatio?: number;
    sqftSource?: 'estimated' | 'measured';
  } = {}
): QuotePricing {
  const {
    complexity = 'moderate',
    pitchRatio = 6,
    sqftSource = 'estimated',
  } = options;

  const pitchCategory = getPitchCategory(pitchRatio);
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[complexity] || 1.0;
  const pitchMultiplier = PITCH_ADJUSTMENTS[pitchCategory] || 1.0;
  const totalMultiplier = complexityMultiplier * pitchMultiplier;

  const tiers: TierPricing[] = pricingTiers.map((tier) => {
    const materialPrice = parseFloat(tier.materialPricePerSqft);
    const laborPrice = parseFloat(tier.laborPricePerSqft);

    const materialCost = Math.round(sqft * materialPrice);
    // Labor is affected by complexity/pitch
    const laborCost = Math.round(sqft * laborPrice * totalMultiplier);
    const basePrice = materialCost + Math.round(sqft * laborPrice);
    const adjustedPrice = materialCost + laborCost;

    const deposit = calculateDeposit(adjustedPrice);

    // Simple monthly estimate (48 months, no interest - just for display)
    const monthlyEstimate = Math.round(adjustedPrice / 48);

    return {
      tier: tier.tier,
      displayName: tier.displayName,
      description: tier.description || '',
      basePrice,
      adjustedPrice,
      pricePerSqft: Math.round((adjustedPrice / sqft) * 100) / 100,
      materialCost,
      laborCost,
      deposit,
      monthlyEstimate,
    };
  });

  // Quote valid for 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  return {
    sqft,
    sqftSource,
    complexity,
    pitch: pitchCategory,
    complexityMultiplier,
    pitchMultiplier,
    tiers,
    expiresAt,
  };
}
