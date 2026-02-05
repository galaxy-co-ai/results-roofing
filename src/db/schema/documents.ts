import { pgTable, uuid, text, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { quotes } from './quotes';
import { leads } from './leads';

/**
 * Document type enum
 */
export const documentTypeEnum = pgEnum('document_type', [
  'deposit_authorization',
  'contract',
  'invoice',
  'receipt',
  'change_order',
  'warranty',
  'other',
]);

/**
 * Document status enum
 */
export const documentStatusEnum = pgEnum('document_status', [
  'draft',
  'pending',
  'sent',
  'viewed',
  'signed',
  'completed',
  'declined',
  'expired',
]);

/**
 * Documents table - tracks all documents in the system
 * Integrates with DocuSeal for e-signatures
 */
export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Document info
    name: text('name').notNull(),
    type: documentTypeEnum('type').notNull(),
    status: documentStatusEnum('status').default('pending').notNull(),
    folder: text('folder').default('general').notNull(), // deposits, contracts, invoices, etc.

    // Relationships
    quoteId: uuid('quote_id').references(() => quotes.id),
    leadId: uuid('lead_id').references(() => leads.id),

    // Customer info (denormalized for quick access)
    customerName: text('customer_name'),
    customerEmail: text('customer_email'),
    propertyAddress: text('property_address'),

    // DocuSeal integration
    docusealSubmissionId: text('docuseal_submission_id'),
    docusealSlug: text('docuseal_slug'),
    docusealEmbedSrc: text('docuseal_embed_src'),
    docusealDocumentUrl: text('docuseal_document_url'), // URL to download signed PDF

    // Signing info
    signedAt: timestamp('signed_at', { withTimezone: true }),
    signedIp: text('signed_ip'),

    // Metadata
    metadata: text('metadata'), // JSON string for additional data

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('documents_quote_idx').on(table.quoteId),
    index('documents_lead_idx').on(table.leadId),
    index('documents_folder_idx').on(table.folder),
    index('documents_type_idx').on(table.type),
    index('documents_status_idx').on(table.status),
    index('documents_docuseal_idx').on(table.docusealSubmissionId),
    index('documents_created_idx').on(table.createdAt),
  ]
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
