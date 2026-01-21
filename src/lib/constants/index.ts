/**
 * Application constants for Results Roofing
 */

/**
 * Service area states
 */
export const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ'] as const;
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

/**
 * Deposit calculation rules
 */
export const DEPOSIT_RULES = {
  percentage: 0.1, // 10% of total
  minimum: 500,
  maximum: 2500,
} as const;

/**
 * API rate limits (requests per minute)
 */
export const RATE_LIMITS = {
  quoteCreation: 10,
  addressValidation: 30,
  webhooks: 1000,
} as const;
