import { pgTable, uuid, text, integer, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';

/**
 * Support ticket status enum
 */
export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'pending',
  'resolved',
  'closed',
]);

/**
 * Support ticket priority enum
 */
export const ticketPriorityEnum = pgEnum('ticket_priority_level', [
  'low',
  'medium',
  'high',
  'urgent',
]);

/**
 * Ticket origination channel enum
 */
export const ticketChannelEnum = pgEnum('ticket_channel', [
  'sms',
  'email',
  'phone',
  'web',
]);

/**
 * Message direction enum
 */
export const messageDirectionEnum = pgEnum('message_direction', [
  'inbound',
  'outbound',
  'note',
]);

/**
 * Message channel enum
 */
export const messageChannelEnum = pgEnum('message_channel', [
  'sms',
  'email',
  'phone',
  'note',
]);

/**
 * Message author type enum
 */
export const messageAuthorTypeEnum = pgEnum('message_author_type', [
  'contact',
  'agent',
]);

/**
 * Support tickets table — contractor-facing support inbox
 */
export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Ticket content
    subject: text('subject').notNull(),
    preview: text('preview').default(''),

    // Classification
    status: ticketStatusEnum('status').default('open').notNull(),
    priority: ticketPriorityEnum('priority').default('medium').notNull(),
    channel: ticketChannelEnum('channel').default('web').notNull(),

    // Contact info (denormalized for fast list queries)
    contactName: text('contact_name').notNull(),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    contactId: text('contact_id'), // Optional GHL contact ID for linking

    // Organization
    assignedTo: text('assigned_to'),
    tags: text('tags').array().default([]),

    // Counts (denormalized, updated via triggers or app logic)
    messageCount: integer('message_count').default(0).notNull(),
    unreadCount: integer('unread_count').default(0).notNull(),

    // Timestamps
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tickets_status_idx').on(table.status),
    index('tickets_priority_idx').on(table.priority),
    index('tickets_assigned_idx').on(table.assignedTo),
    index('tickets_contact_id_idx').on(table.contactId),
    index('tickets_created_idx').on(table.createdAt),
    index('tickets_last_message_idx').on(table.lastMessageAt),
  ]
);

/**
 * Ticket messages table — conversation thread per ticket
 */
export const ticketMessages = pgTable(
  'ticket_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent ticket
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),

    // Message content
    body: text('body').notNull(),
    html: text('html'),

    // Classification
    direction: messageDirectionEnum('direction').default('outbound').notNull(),
    channel: messageChannelEnum('channel').default('sms').notNull(),

    // Author
    authorId: text('author_id'),
    authorName: text('author_name'),
    authorType: messageAuthorTypeEnum('author_type'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('ticket_messages_ticket_idx').on(table.ticketId),
    index('ticket_messages_created_idx').on(table.createdAt),
  ]
);

export type SupportTicket = typeof tickets.$inferSelect;
export type NewSupportTicket = typeof tickets.$inferInsert;
export type SupportTicketMessage = typeof ticketMessages.$inferSelect;
export type NewSupportTicketMessage = typeof ticketMessages.$inferInsert;
