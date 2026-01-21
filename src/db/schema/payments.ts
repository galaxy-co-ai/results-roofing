import { pgTable, uuid, text, decimal, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { orders } from './orders';

/**
 * Payment type enum
 */
export const paymentTypeEnum = pgEnum('payment_type', ['deposit', 'balance', 'refund']);

/**
 * Payments table - deposit and balance payment records via Stripe
 */
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id)
      .notNull(),
    type: paymentTypeEnum('type').notNull(), // deposit, balance, refund
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('usd').notNull(),
    // Stripe integration
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    stripeChargeId: text('stripe_charge_id'),
    stripeRefundId: text('stripe_refund_id'),
    status: text('status').default('pending').notNull(), // pending, processing, succeeded, failed, refunded
    // Payment method details
    paymentMethod: text('payment_method'), // card, bank_transfer, financing
    cardLast4: text('card_last4'),
    cardBrand: text('card_brand'),
    // Failure info
    failureCode: text('failure_code'),
    failureMessage: text('failure_message'),
    // Timestamps
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('payments_order_idx').on(table.orderId),
    index('payments_stripe_intent_idx').on(table.stripePaymentIntentId),
    index('payments_stripe_charge_idx').on(table.stripeChargeId),
    index('payments_status_idx').on(table.status),
  ]
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
