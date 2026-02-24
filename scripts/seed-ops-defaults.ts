/**
 * Seed script for ops dashboard defaults:
 *  - 10 pipeline stages
 *  - 5 notification preferences (all disabled)
 *
 * Run with: npx tsx scripts/seed-ops-defaults.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Define schemas inline (avoids path alias issues in scripts)
const pipelineStages = pgTable('pipeline_stages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  position: integer('position').notNull(),
  color: text('color'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

const notificationEventTypeEnum = pgEnum('notification_event_type', [
  'new_lead',
  'proposal_signed',
  'payment_received',
  'invoice_overdue',
  'task_overdue',
]);

const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: notificationEventTypeEnum('event_type').notNull().unique(),
  emailEnabled: boolean('email_enabled').default(false).notNull(),
  smsEnabled: boolean('sms_enabled').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const DEFAULT_STAGES = [
  { name: 'New Lead', position: 0 },
  { name: 'Appointment Scheduled', position: 1 },
  { name: 'Measurement Complete', position: 2 },
  { name: 'Proposal Sent', position: 3 },
  { name: 'Proposal Signed', position: 4 },
  { name: 'Pre-Production', position: 5 },
  { name: 'Materials Ordered', position: 6 },
  { name: 'In Progress', position: 7 },
  { name: 'Punch List', position: 8 },
  { name: 'Complete', position: 9 },
];

const NOTIFICATION_EVENTS = [
  'new_lead',
  'proposal_signed',
  'payment_received',
  'invoice_overdue',
  'task_overdue',
] as const;

async function seed() {
  // --- Pipeline Stages ---
  console.log('Seeding pipeline stages...');

  // Check if any stages already exist
  const existingStages = await db
    .select({ id: pipelineStages.id })
    .from(pipelineStages)
    .limit(1);

  if (existingStages.length > 0) {
    console.log('  Pipeline stages already exist, skipping.');
  } else {
    for (const stage of DEFAULT_STAGES) {
      await db.insert(pipelineStages).values({
        name: stage.name,
        position: stage.position,
        isDefault: true,
      });
      console.log(`  + ${stage.name}`);
    }
    console.log(`  Inserted ${DEFAULT_STAGES.length} pipeline stages.`);
  }

  // --- Notification Preferences ---
  console.log('Seeding notification preferences...');

  const existingPrefs = await db
    .select({ id: notificationPreferences.id })
    .from(notificationPreferences)
    .limit(1);

  if (existingPrefs.length > 0) {
    console.log('  Notification preferences already exist, skipping.');
  } else {
    for (const eventType of NOTIFICATION_EVENTS) {
      await db.insert(notificationPreferences).values({
        eventType,
        emailEnabled: false,
        smsEnabled: false,
      });
      console.log(`  + ${eventType}`);
    }
    console.log(`  Inserted ${NOTIFICATION_EVENTS.length} notification preferences.`);
  }

  console.log('\nDone! Ops defaults seeded.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
