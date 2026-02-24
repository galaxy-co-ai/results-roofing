import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

/**
 * Company settings — single row, global config
 */
export const companySettings = pgTable('company_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyName: text('company_name').notNull(),
  phone: text('phone'),
  address: text('address'),
  email: text('email'),
  licenseNumber: text('license_number'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Pipeline stages — configurable CRM pipeline
 */
export const pipelineStages = pgTable(
  'pipeline_stages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    position: integer('position').notNull(),
    color: text('color'),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('pipeline_stages_position_idx').on(table.position),
  ]
);

/**
 * Notification event type enum
 */
export const notificationEventTypeEnum = pgEnum('notification_event_type', [
  'new_lead',
  'proposal_signed',
  'payment_received',
  'invoice_overdue',
  'task_overdue',
]);

/**
 * Notification preferences — per-event-type toggle for email/sms
 */
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: notificationEventTypeEnum('event_type').notNull().unique(),
  emailEnabled: boolean('email_enabled').default(false).notNull(),
  smsEnabled: boolean('sms_enabled').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type CompanySettings = typeof companySettings.$inferSelect;
export type NewCompanySettings = typeof companySettings.$inferInsert;
export type PipelineStageRow = typeof pipelineStages.$inferSelect;
export type NewPipelineStage = typeof pipelineStages.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
