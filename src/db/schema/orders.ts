import { pgTable, uuid, text, decimal, timestamp, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { quotes } from './quotes';
import { contracts } from './contracts';

/**
 * Order status enum - fulfillment progression
 */
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'deposit_paid',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'refunded',
]);

/**
 * Orders table - confirmed roofing jobs after contract signing
 * Central record for fulfillment tracking
 */
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quoteId: uuid('quote_id')
      .references(() => quotes.id)
      .notNull(),
    contractId: uuid('contract_id')
      .references(() => contracts.id)
      .notNull(),
    confirmationNumber: text('confirmation_number').notNull().unique(), // RR-XXXXXX
    status: orderStatusEnum('status').default('pending').notNull(),
    // Customer info (denormalized)
    customerEmail: text('customer_email').notNull(),
    customerPhone: text('customer_phone'),
    customerName: text('customer_name'),
    clerkUserId: text('clerk_user_id'),
    // Property info (denormalized)
    propertyAddress: text('property_address').notNull(),
    propertyCity: text('property_city').notNull(),
    propertyState: text('property_state').notNull(),
    propertyZip: text('property_zip').notNull(),
    // Package details
    selectedTier: text('selected_tier').notNull(), // good, better, best
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }).notNull(),
    balanceDue: decimal('balance_due', { precision: 10, scale: 2 }).notNull(),
    // Financing
    financingUsed: text('financing_used'), // none, wisetack, hearth
    financingTermMonths: text('financing_term_months'),
    // Scheduling
    scheduledStartDate: timestamp('scheduled_start_date', { withTimezone: true }),
    estimatedCompletionDate: timestamp('estimated_completion_date', { withTimezone: true }),
    actualCompletionDate: timestamp('actual_completion_date', { withTimezone: true }),
    // CRM
    jobnimbusJobId: text('jobnimbus_job_id'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('orders_quote_idx').on(table.quoteId),
    uniqueIndex('orders_contract_idx').on(table.contractId),
    index('orders_confirmation_idx').on(table.confirmationNumber),
    index('orders_status_idx').on(table.status),
    index('orders_clerk_user_idx').on(table.clerkUserId),
    index('orders_created_idx').on(table.createdAt),
  ]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
