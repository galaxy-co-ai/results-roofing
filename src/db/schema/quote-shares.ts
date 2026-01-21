import { pgTable, uuid, text, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { quotes } from './quotes';

/**
 * Quote Shares table - shareable links for quotes (F21)
 */
export const quoteShares = pgTable(
  'quote_shares',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quoteId: uuid('quote_id')
      .references(() => quotes.id)
      .notNull(),
    token: text('token').notNull().unique(), // Random token for URL
    // Share metadata
    sharedByEmail: text('shared_by_email'),
    sharedToEmail: text('shared_to_email'),
    sharedToName: text('shared_to_name'),
    message: text('message'), // Optional personal message
    // Usage tracking
    viewCount: integer('view_count').default(0).notNull(),
    lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
    // Expiration
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('quote_shares_quote_idx').on(table.quoteId),
    index('quote_shares_token_idx').on(table.token),
    index('quote_shares_expires_idx').on(table.expiresAt),
  ]
);

export type QuoteShare = typeof quoteShares.$inferSelect;
export type NewQuoteShare = typeof quoteShares.$inferInsert;
