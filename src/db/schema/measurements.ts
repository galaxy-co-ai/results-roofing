import { pgTable, uuid, text, decimal, timestamp, index, jsonb, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { quotes } from './quotes';

/**
 * Measurements table - roof measurement data from Roofr
 * Contains detailed roof specifications
 */
export const measurements = pgTable(
  'measurements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quoteId: uuid('quote_id')
      .references(() => quotes.id)
      .notNull(),
    vendor: text('vendor').default('roofr').notNull(),
    vendorJobId: text('vendor_job_id'),
    status: text('status').default('pending').notNull(), // pending, processing, complete, failed
    // Area measurements
    sqftTotal: decimal('sqft_total', { precision: 10, scale: 2 }),
    sqftSteep: decimal('sqft_steep', { precision: 10, scale: 2 }),
    sqftFlat: decimal('sqft_flat', { precision: 10, scale: 2 }),
    // Pitch measurements
    pitchPrimary: decimal('pitch_primary', { precision: 4, scale: 2 }),
    pitchMin: decimal('pitch_min', { precision: 4, scale: 2 }),
    pitchMax: decimal('pitch_max', { precision: 4, scale: 2 }),
    // Structural details
    facetCount: integer('facet_count'),
    ridgeLengthFt: decimal('ridge_length_ft', { precision: 10, scale: 2 }),
    valleyLengthFt: decimal('valley_length_ft', { precision: 10, scale: 2 }),
    eaveLengthFt: decimal('eave_length_ft', { precision: 10, scale: 2 }),
    hipLengthFt: decimal('hip_length_ft', { precision: 10, scale: 2 }),
    // Calculated complexity
    complexity: text('complexity'), // simple, moderate, complex
    // Raw vendor response
    rawResponse: jsonb('raw_response'),
    errorMessage: text('error_message'),
    // Timestamps
    requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('measurements_quote_idx').on(table.quoteId),
    index('measurements_vendor_job_idx').on(table.vendorJobId),
    index('measurements_status_idx').on(table.status),
  ]
);

export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;
