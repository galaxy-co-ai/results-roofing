import { pgTable, uuid, text, timestamp, index, boolean } from 'drizzle-orm/pg-core';
import { leads } from './leads';

/**
 * SMS Consents table - TCPA compliance tracking for SMS communications
 */
export const smsConsents = pgTable(
  'sms_consents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    leadId: uuid('lead_id')
      .references(() => leads.id)
      .notNull(),
    phone: text('phone').notNull(), // E.164 format
    // Consent details
    consentGiven: boolean('consent_given').notNull(),
    consentSource: text('consent_source').notNull(), // web_form, verbal, imported
    consentText: text('consent_text'), // Exact text user agreed to
    // IP/device tracking
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    // Opt-out tracking
    optedOutAt: timestamp('opted_out_at', { withTimezone: true }),
    optOutSource: text('opt_out_source'), // stop_keyword, manual, complaint
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sms_consents_lead_idx').on(table.leadId),
    index('sms_consents_phone_idx').on(table.phone),
    index('sms_consents_created_idx').on(table.createdAt),
  ]
);

export type SmsConsent = typeof smsConsents.$inferSelect;
export type NewSmsConsent = typeof smsConsents.$inferInsert;
