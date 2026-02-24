import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

/**
 * Automation status enum
 */
export const automationStatusEnum = pgEnum('automation_status', [
  'active',
  'paused',
]);

/**
 * Automations table — workflow triggers and actions
 */
export const automations = pgTable(
  'automations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    trigger: text('trigger').notNull(),
    actions: text('actions').notNull(),
    status: automationStatusEnum('status').default('active').notNull(),
    lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
    runs: integer('runs').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('automations_status_idx').on(table.status),
    index('automations_created_idx').on(table.createdAt),
  ]
);

export type Automation = typeof automations.$inferSelect;
export type NewAutomation = typeof automations.$inferInsert;
