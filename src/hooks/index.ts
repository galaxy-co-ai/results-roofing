/**
 * Custom React Hooks
 * Centralized hook exports for the application
 */

// Quote hooks
export {
  useQuote,
  useCreateQuote,
  useSelectTier,
  quoteKeys,
  type QuoteEstimate,
  type CreateQuoteInput,
  type SelectTierInput,
  type TierPriceRange,
} from './useQuote';

// Pricing hooks
export {
  usePricingTiers,
  calculateTierPrice,
  getTierDisplayName,
  pricingKeys,
  type PricingTier,
} from './usePricingTiers';

// Portal hooks
export {
  useOrders,
  useOrderDetails,
  type Order,
  type OrderDetails,
  type TimelineStep,
  type Payment,
  type Appointment,
  type Contract,
} from './useOrders';
