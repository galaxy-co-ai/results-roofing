/**
 * Order database queries
 */

import { db, schema, eq, desc } from '@/db';

/**
 * Get an order by ID
 */
export async function getOrder(orderId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
  });
  return order ?? null;
}

/**
 * Get orders by user email
 */
export async function getOrdersByEmail(email: string) {
  const orders = await db.query.orders.findMany({
    where: eq(schema.orders.customerEmail, email),
    orderBy: [desc(schema.orders.createdAt)],
  });
  return orders;
}

/**
 * Get order with quote
 */
export async function getOrderWithQuote(orderId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
    with: {
      quote: true,
    },
  });
  return order ?? null;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'deposit_paid' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
) {
  const result = await db
    .update(schema.orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.orders.id, orderId))
    .returning();
  return result[0] ?? null;
}

/**
 * Get payments by order ID
 */
export async function getPaymentsByOrderId(orderId: string) {
  const payments = await db.query.payments.findMany({
    where: eq(schema.payments.orderId, orderId),
    orderBy: [desc(schema.payments.createdAt)],
  });
  return payments;
}

/**
 * Get appointments by order ID
 */
export async function getAppointmentsByOrderId(orderId: string) {
  const appointments = await db.query.appointments.findMany({
    where: eq(schema.appointments.orderId, orderId),
  });
  return appointments;
}

/**
 * Get contracts by order ID (via quote)
 */
export async function getContractsByOrderId(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return [];
  
  const contracts = await db.query.contracts.findMany({
    where: eq(schema.contracts.quoteId, order.quoteId),
  });
  return contracts;
}
