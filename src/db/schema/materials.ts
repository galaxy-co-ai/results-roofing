import {
  pgTable,
  uuid,
  text,
  decimal,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

/**
 * Material order status enum
 */
export const materialOrderStatusEnum = pgEnum('material_order_status', [
  'draft',
  'sent',
  'confirmed',
  'delivered',
  'cancelled',
]);

/**
 * Material orders table — tracks supplier orders for jobs
 */
export const materialOrders = pgTable(
  'material_orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    job: text('job').notNull(),
    supplier: text('supplier').notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    status: materialOrderStatusEnum('status').default('draft').notNull(),
    notes: text('notes'),
    orderedAt: timestamp('ordered_at', { withTimezone: true }),
    deliveryAt: timestamp('delivery_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('material_orders_status_idx').on(table.status),
    index('material_orders_created_idx').on(table.createdAt),
  ]
);

export type MaterialOrder = typeof materialOrders.$inferSelect;
export type NewMaterialOrder = typeof materialOrders.$inferInsert;
