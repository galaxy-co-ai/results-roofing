import { pgTable, uuid, text, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { feedback } from './feedback';

/**
 * Task status enum - kanban-style workflow
 */
export const taskStatusEnum = pgEnum('task_status', [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
]);

/**
 * Task priority enum
 */
export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

/**
 * Task category enum - type of development work
 */
export const taskCategoryEnum = pgEnum('task_category', [
  'feature',
  'bug',
  'refactor',
  'design',
  'docs',
  'test',
  'chore',
]);

/**
 * Dev tasks table - internal task tracking for project management
 */
export const devTasks = pgTable(
  'dev_tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // Task details
    title: text('title').notNull(),
    description: text('description'),
    // Classification
    status: taskStatusEnum('status').default('backlog').notNull(),
    priority: taskPriorityEnum('priority').default('medium').notNull(),
    category: taskCategoryEnum('category').default('feature').notNull(),
    // Linking
    feedbackId: uuid('feedback_id').references(() => feedback.id, { onDelete: 'set null' }),
    // Scheduling
    dueDate: timestamp('due_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('dev_tasks_status_idx').on(table.status),
    index('dev_tasks_priority_idx').on(table.priority),
    index('dev_tasks_category_idx').on(table.category),
    index('dev_tasks_feedback_idx').on(table.feedbackId),
    index('dev_tasks_created_idx').on(table.createdAt),
  ]
);

export type DevTask = typeof devTasks.$inferSelect;
export type NewDevTask = typeof devTasks.$inferInsert;
