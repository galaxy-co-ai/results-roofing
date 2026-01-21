import { pgTable, uuid, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { quotes } from './quotes';

/**
 * Contracts table - e-signature documents managed by Documenso
 * Links quotes to signed agreements
 */
export const contracts = pgTable(
  'contracts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quoteId: uuid('quote_id')
      .references(() => quotes.id)
      .notNull(),
    documensoDocumentId: text('documenso_document_id'),
    templateVersion: text('template_version'),
    status: text('status').default('draft').notNull(), // draft, pending, sent, viewed, signed, expired, declined
    customerEmail: text('customer_email').notNull(),
    // Signature tracking
    sentAt: timestamp('sent_at', { withTimezone: true }),
    viewedAt: timestamp('viewed_at', { withTimezone: true }),
    signedAt: timestamp('signed_at', { withTimezone: true }),
    signatureIp: text('signature_ip'),
    signatureUserAgent: text('signature_user_agent'),
    companySignedAt: timestamp('company_signed_at', { withTimezone: true }),
    // Signed document
    signedPdfUrl: text('signed_pdf_url'),
    signedPdfHash: text('signed_pdf_hash'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('contracts_quote_idx').on(table.quoteId),
    index('contracts_documenso_idx').on(table.documensoDocumentId),
    index('contracts_status_idx').on(table.status),
  ]
);

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
