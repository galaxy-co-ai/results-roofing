/**
 * Drizzle ORM Relations
 * Defines relationships between tables for use with relational queries
 */

import { relations } from 'drizzle-orm';
import { leads } from './leads';
import { quotes } from './quotes';
import { quoteDrafts } from './quote-drafts';
import { measurements } from './measurements';
import { contracts } from './contracts';
import { orders } from './orders';
import { payments } from './payments';
import { appointments } from './appointments';
import { invoices } from './invoices';
import { tickets, ticketMessages } from './tickets';

/**
 * Lead relations
 */
export const leadsRelations = relations(leads, ({ many }) => ({
  quotes: many(quotes),
}));

/**
 * Quote relations
 */
export const quotesRelations = relations(quotes, ({ one, many }) => ({
  lead: one(leads, {
    fields: [quotes.leadId],
    references: [leads.id],
  }),
  measurement: one(measurements),
  contract: one(contracts),
  order: one(orders),
  drafts: many(quoteDrafts),
}));

/**
 * Quote draft relations
 */
export const quoteDraftsRelations = relations(quoteDrafts, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteDrafts.quoteId],
    references: [quotes.id],
  }),
}));

/**
 * Measurement relations
 */
export const measurementsRelations = relations(measurements, ({ one }) => ({
  quote: one(quotes, {
    fields: [measurements.quoteId],
    references: [quotes.id],
  }),
}));

/**
 * Contract relations
 */
export const contractsRelations = relations(contracts, ({ one }) => ({
  quote: one(quotes, {
    fields: [contracts.quoteId],
    references: [quotes.id],
  }),
  order: one(orders),
}));

/**
 * Order relations
 */
export const ordersRelations = relations(orders, ({ one, many }) => ({
  quote: one(quotes, {
    fields: [orders.quoteId],
    references: [quotes.id],
  }),
  contract: one(contracts, {
    fields: [orders.contractId],
    references: [contracts.id],
  }),
  payments: many(payments),
  invoices: many(invoices),
  appointments: many(appointments),
}));

/**
 * Payment relations
 */
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  invoice: one(invoices),
}));

/**
 * Invoice relations
 */
export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
  payment: one(payments, {
    fields: [invoices.paymentId],
    references: [payments.id],
  }),
}));

/**
 * Appointment relations
 */
export const appointmentsRelations = relations(appointments, ({ one }) => ({
  order: one(orders, {
    fields: [appointments.orderId],
    references: [orders.id],
  }),
}));

/**
 * Ticket relations
 */
export const ticketsRelations = relations(tickets, ({ many }) => ({
  messages: many(ticketMessages),
}));

/**
 * Ticket message relations
 */
export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
}));
