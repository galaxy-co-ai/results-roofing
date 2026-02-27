import { pgTable, uuid, text, decimal, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { payments } from './payments';

export const invoiceTypeEnum = pgEnum('invoice_type', [
  'deposit',
  'balance',
  'full',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'void',
]);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id)
      .notNull(),
    paymentId: uuid('payment_id')
      .references(() => payments.id),
    invoiceNumber: text('invoice_number').notNull().unique(),
    type: invoiceTypeEnum('type').notNull(),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    // CRM sync references
    ghlContactId: text('ghl_contact_id'),
    ghlOpportunityId: text('ghl_opportunity_id'),
    notes: text('notes'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('invoices_order_idx').on(table.orderId),
    index('invoices_payment_idx').on(table.paymentId),
    index('invoices_status_idx').on(table.status),
    index('invoices_number_idx').on(table.invoiceNumber),
  ]
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
