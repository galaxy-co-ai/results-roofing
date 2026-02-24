import {
  pgTable,
  uuid,
  text,
  integer,
  decimal,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';

/**
 * Team member role enum
 */
export const teamMemberRoleEnum = pgEnum('team_member_role', [
  'admin',
  'manager',
  'member',
]);

/**
 * Team members table — crew and staff tracking
 */
export const teamMembers = pgTable(
  'team_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    role: teamMemberRoleEnum('role').default('member').notNull(),
    activeJobs: integer('active_jobs').default(0).notNull(),
    revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0').notNull(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('team_members_email_idx').on(table.email),
    index('team_members_role_idx').on(table.role),
    index('team_members_created_idx').on(table.createdAt),
  ]
);

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
