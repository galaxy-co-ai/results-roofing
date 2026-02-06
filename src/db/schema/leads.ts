import { pgTable, uuid, text, decimal, timestamp, index } from 'drizzle-orm/pg-core';

/**
 * Leads table - customer contact information captured when they enter their address
 * This is the entry point for all quote funnel data
 */
export const leads = pgTable(
  'leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email'),
    phone: text('phone'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    address: text('address').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(), // TX, GA, NC, AZ
    zip: text('zip').notNull(),
    lat: decimal('lat', { precision: 10, scale: 7 }),
    lng: decimal('lng', { precision: 10, scale: 7 }),
    // UTM tracking
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    utmTerm: text('utm_term'),
    // User identity (linked when user signs into portal)
    clerkUserId: text('clerk_user_id'),
    // CRM integration
    jobnimbusContactId: text('jobnimbus_contact_id'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('leads_email_idx').on(table.email),
    index('leads_clerk_user_idx').on(table.clerkUserId),
    index('leads_jobnimbus_idx').on(table.jobnimbusContactId),
    index('leads_created_idx').on(table.createdAt),
  ]
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
