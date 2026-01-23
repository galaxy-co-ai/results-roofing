import { pgTable, uuid, text, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';

/**
 * Feedback status enum - tracks the lifecycle of feedback items
 */
export const feedbackStatusEnum = pgEnum('feedback_status', [
  'new',
  'reviewed',
  'in_progress',
  'resolved',
  'wont_fix',
]);

/**
 * Feedback reason enum - primary feedback category
 */
export const feedbackReasonEnum = pgEnum('feedback_reason', [
  'bug',
  'suggestion',
  'general',
]);

/**
 * Feedback table - stores user feedback from the feedback widget
 */
export const feedback = pgTable(
  'feedback',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // Feedback categorization
    reason: feedbackReasonEnum('reason').notNull(),
    subOption: text('sub_option').notNull(),
    customReason: text('custom_reason'),
    // User input
    notes: text('notes'),
    // Context
    page: text('page').notNull(),
    userAgent: text('user_agent'),
    feedbackTimestamp: timestamp('feedback_timestamp', { withTimezone: true }).notNull(),
    // Admin management
    status: feedbackStatusEnum('status').default('new').notNull(),
    adminNotes: text('admin_notes'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('feedback_status_idx').on(table.status),
    index('feedback_reason_idx').on(table.reason),
    index('feedback_created_idx').on(table.createdAt),
  ]
);

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
