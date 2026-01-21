import { pgTable, uuid, text, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { orders } from './orders';

/**
 * Appointments table - scheduled inspection/installation via Cal.com
 */
export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id)
      .notNull(),
    type: text('type').default('installation').notNull(), // installation, inspection, follow_up
    // Cal.com integration
    calcomBookingId: text('calcom_booking_id'),
    calcomEventTypeId: text('calcom_event_type_id'),
    calcomUid: text('calcom_uid'),
    // Schedule details
    scheduledStart: timestamp('scheduled_start', { withTimezone: true }).notNull(),
    scheduledEnd: timestamp('scheduled_end', { withTimezone: true }).notNull(),
    timezone: text('timezone').default('America/Chicago').notNull(),
    // Attendee info
    attendeeName: text('attendee_name'),
    attendeeEmail: text('attendee_email'),
    attendeePhone: text('attendee_phone'),
    // Status
    status: text('status').default('scheduled').notNull(), // scheduled, confirmed, cancelled, completed, no_show
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancellationReason: text('cancellation_reason'),
    // Reschedule tracking
    rescheduleCount: integer('reschedule_count').default(0).notNull(),
    previousScheduledStart: timestamp('previous_scheduled_start', { withTimezone: true }),
    // Notes
    notes: text('notes'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('appointments_order_idx').on(table.orderId),
    index('appointments_calcom_booking_idx').on(table.calcomBookingId),
    index('appointments_status_idx').on(table.status),
    index('appointments_scheduled_idx').on(table.scheduledStart),
  ]
);

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
