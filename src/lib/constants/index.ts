/**
 * Application constants for Results Roofing
 */

export { serverEnv, clientEnv, features } from './env';
export { TCPA_CONSENT_TEXT, TCPA_DISCLOSURE_SHORT } from './tcpa';
export {
  PRICING_CONFIG,
  DEPOSIT_CONFIG,
  FINANCING_TERMS,
  QUOTE_VALIDITY,
  COMPLEXITY_MULTIPLIERS,
  PITCH_ADJUSTMENTS,
  type FinancingTerm,
  type ComplexityLevel,
  type PitchCategory,
} from './pricing';

/**
 * Service area states
 */
export const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ', 'OK'] as const;
export type ServiceState = (typeof SERVICE_STATES)[number];

/**
 * Package tiers
 */
export const PACKAGE_TIERS = ['good', 'better', 'best'] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

/**
 * Quote status values
 */
export const QUOTE_STATUSES = [
  'preliminary',
  'measured',
  'selected',
  'financed',
  'scheduled',
  'signed',
  'converted',
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

/**
 * Replacement motivation options
 */
export const REPLACEMENT_MOTIVATIONS = [
  'pre_sale_prep',
  'roof_age',
  'carrier_requirement',
  'curb_appeal',
  'energy_efficiency',
  'other',
] as const;
export type ReplacementMotivation = (typeof REPLACEMENT_MOTIVATIONS)[number];

// Deposit calculation rules are now in ./pricing.ts as DEPOSIT_CONFIG

/**
 * API rate limits (requests per minute)
 */
export const RATE_LIMITS = {
  quoteCreation: 10,
  addressValidation: 30,
  webhooks: 1000,
} as const;
