import { pgTable, uuid, text, decimal, timestamp, index, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { leads } from './leads';

/**
 * Quote status enum - tracks progression through the funnel
 */
export const quoteStatusEnum = pgEnum('quote_status', [
  'preliminary',
  'measured',
  'selected',
  'financed',
  'scheduled',
  'signed',
  'converted',
]);

/**
 * Package tier enum - Good/Better/Best pricing tiers
 */
export const tierEnum = pgEnum('tier', ['good', 'better', 'best']);

/**
 * Quotes table - central entity for roofing quotes
 * Tracks from preliminary estimate through signed/paid
 */
export const quotes = pgTable(
  'quotes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    leadId: uuid('lead_id').references(() => leads.id),
    status: quoteStatusEnum('status').default('preliminary').notNull(),
    // Address (denormalized from lead)
    address: text('address').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zip: text('zip').notNull(),
    // Customer motivation (F17)
    replacementMotivation: text('replacement_motivation'), // pre_sale_prep, roof_age, carrier_requirement, curb_appeal, energy_efficiency, other
    // Measurement data
    sqftTotal: decimal('sqft_total', { precision: 10, scale: 2 }),
    pitchPrimary: decimal('pitch_primary', { precision: 4, scale: 2 }),
    complexity: text('complexity'), // simple, moderate, complex
    // Pricing
    pricingData: jsonb('pricing_data'), // { good: {...}, better: {...}, best: {...} }
    selectedTier: tierEnum('selected_tier'),
    tierSelectedAt: timestamp('tier_selected_at', { withTimezone: true }),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
    depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
    // Financing
    financingStatus: text('financing_status'), // pending, approved, declined
    financingApplicationId: text('financing_application_id'),
    financingTerm: text('financing_term'), // 12, 24, 36, 48
    financingMonthlyPayment: decimal('financing_monthly_payment', { precision: 10, scale: 2 }),
    // Scheduling
    scheduledSlotId: text('scheduled_slot_id'),
    scheduledDate: timestamp('scheduled_date', { withTimezone: true }),
    // User identity (linked when user signs into portal)
    clerkUserId: text('clerk_user_id'),
    // CRM integration
    jobnimbusJobId: text('jobnimbus_job_id'),
    // Expiration
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('quotes_lead_idx').on(table.leadId),
    index('quotes_status_idx').on(table.status),
    index('quotes_clerk_user_idx').on(table.clerkUserId),
    index('quotes_created_idx').on(table.createdAt),
    index('quotes_jobnimbus_idx').on(table.jobnimbusJobId),
    index('quotes_expires_idx').on(table.expiresAt),
  ]
);

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
