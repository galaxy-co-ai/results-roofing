import { pgTable, uuid, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { quotes } from './quotes';
import type { QuoteDraftState } from '@/types';

/**
 * Quote Drafts table - saves user progress for resume functionality
 * Allows users to save their quote and return via email link
 */
export const quoteDrafts = pgTable(
  'quote_drafts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quoteId: uuid('quote_id')
      .references(() => quotes.id, { onDelete: 'cascade' })
      .notNull(),
    // Email for sending resume link
    email: text('email').notNull(),
    // Secure token for resuming quote (URL-safe, unique)
    resumeToken: text('resume_token').notNull().unique(),
    // JSON state of the quote flow progress
    draftState: jsonb('draft_state').$type<QuoteDraftState>().notNull(),
    // Expiration (drafts expire after 30 days)
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('quote_drafts_quote_idx').on(table.quoteId),
    index('quote_drafts_email_idx').on(table.email),
    index('quote_drafts_token_idx').on(table.resumeToken),
    index('quote_drafts_expires_idx').on(table.expiresAt),
  ]
);

export type QuoteDraftRecord = typeof quoteDrafts.$inferSelect;
export type NewQuoteDraft = typeof quoteDrafts.$inferInsert;
