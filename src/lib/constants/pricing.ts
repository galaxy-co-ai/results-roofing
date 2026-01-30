/**
 * Centralized Pricing Configuration
 *
 * Single source of truth for all pricing-related constants.
 * Used across quote calculation, display, and validation.
 */

/**
 * Deposit calculation rules per F27
 */
export const DEPOSIT_CONFIG = {
  /** Percentage of total price for deposit (5%) */
  percentage: 0.05,
  /** Minimum deposit amount in dollars */
  minimum: 500,
  /** Maximum deposit amount in dollars */
  maximum: 2500,
} as const;

/**
 * Financing terms and APR rates
 */
export const FINANCING_TERMS = {
  'pay-full': { apr: 0, label: 'Pay in Full', monthlyPayment: null },
  '12': { apr: 0, label: '12 months @ 0% APR', months: 12 },
  '24': { apr: 4.99, label: '24 months @ 4.99% APR', months: 24 },
  '36': { apr: 6.99, label: '36 months @ 6.99% APR', months: 36 },
  '48': { apr: 8.99, label: '48 months @ 8.99% APR', months: 48 },
} as const;

/**
 * Quote validity and expiration
 */
export const QUOTE_VALIDITY = {
  /** Number of days a quote is valid */
  validityDays: 30,
} as const;

/**
 * Complexity multipliers for labor costs (F29)
 */
export const COMPLEXITY_MULTIPLIERS = {
  simple: 1.0,
  moderate: 1.15,
  complex: 1.3,
} as const;

/**
 * Pitch adjustments for labor costs (F29)
 */
export const PITCH_ADJUSTMENTS = {
  /** Standard pitch: 4:12 to 7:12 */
  standard: 1.0,
  /** Steep pitch: 8:12 to 10:12 */
  steep: 1.1,
  /** Very steep pitch: >10:12 */
  very_steep: 1.2,
} as const;

/**
 * Combined pricing configuration object
 * For convenient import as a single config
 */
export const PRICING_CONFIG = {
  deposit: DEPOSIT_CONFIG,
  financing: FINANCING_TERMS,
  quote: QUOTE_VALIDITY,
  complexity: COMPLEXITY_MULTIPLIERS,
  pitch: PITCH_ADJUSTMENTS,
} as const;

export type FinancingTerm = keyof typeof FINANCING_TERMS;
export type ComplexityLevel = keyof typeof COMPLEXITY_MULTIPLIERS;
export type PitchCategory = keyof typeof PITCH_ADJUSTMENTS;
