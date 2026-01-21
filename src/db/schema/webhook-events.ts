import { pgTable, uuid, text, timestamp, index, jsonb, boolean } from 'drizzle-orm/pg-core';

/**
 * Webhook Events table - audit log for all incoming webhooks
 * Used for idempotency and debugging
 */
export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: text('event_id').notNull(), // Vendor's event ID
    source: text('source').notNull(), // stripe, documenso, calcom, wisetack, roofr, signalwire, resend, clerk
    eventType: text('event_type').notNull(), // payment_intent.succeeded, document.signed, etc.
    // Payload
    payload: jsonb('payload').notNull(), // Full webhook payload
    // Processing status
    processed: boolean('processed').default(false).notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    processingError: text('processing_error'),
    // Retry tracking
    retryCount: text('retry_count').default('0'),
    // Related entity
    relatedEntityType: text('related_entity_type'), // quote, order, payment, contract
    relatedEntityId: uuid('related_entity_id'),
    // Timestamps
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('webhook_events_event_id_idx').on(table.eventId),
    index('webhook_events_source_idx').on(table.source),
    index('webhook_events_processed_idx').on(table.processed),
    index('webhook_events_received_idx').on(table.receivedAt),
  ]
);

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
