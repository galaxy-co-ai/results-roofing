import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';

/**
 * Out of Area Leads table - captures email for potential customers outside service area
 * Used to notify them when we expand to their region
 */
export const outOfAreaLeads = pgTable(
  'out_of_area_leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    zip: text('zip'),
    state: text('state'),
    // Source tracking
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('out_of_area_leads_email_idx').on(table.email),
    index('out_of_area_leads_state_idx').on(table.state),
    index('out_of_area_leads_created_idx').on(table.createdAt),
  ]
);

export type OutOfAreaLead = typeof outOfAreaLeads.$inferSelect;
export type NewOutOfAreaLead = typeof outOfAreaLeads.$inferInsert;
