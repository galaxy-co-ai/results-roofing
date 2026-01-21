import { pgTable, uuid, text, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * Pricing Tiers table - Good/Better/Best package configuration
 */
export const pricingTiers = pgTable('pricing_tiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tier: text('tier').notNull().unique(), // good, better, best
  displayName: text('display_name').notNull(), // "Good", "Better", "Best"
  description: text('description'),
  // Pricing
  materialPricePerSqft: decimal('material_price_per_sqft', { precision: 10, scale: 2 }).notNull(),
  laborPricePerSqft: decimal('labor_price_per_sqft', { precision: 10, scale: 2 }).notNull(),
  // Materials
  shingleType: text('shingle_type').notNull(), // 3-tab, architectural, designer
  shingleBrand: text('shingle_brand'),
  underlaymentType: text('underlayment_type'),
  // Warranty
  warrantyYears: text('warranty_years').notNull(),
  warrantyType: text('warranty_type'), // limited, full, transferable
  // Lead time
  leadTimeWeeks: text('lead_time_weeks'),
  // Display
  isPopular: boolean('is_popular').default(false).notNull(),
  sortOrder: text('sort_order').default('0').notNull(),
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type PricingTier = typeof pricingTiers.$inferSelect;
export type NewPricingTier = typeof pricingTiers.$inferInsert;
