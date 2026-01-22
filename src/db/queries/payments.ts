/**
 * Payment database queries
 */

import { db, schema, eq, desc } from '@/db';

/**
 * Get payments by order ID
 */
export async function getPaymentsByOrder(orderId: string) {
  const payments = await db.query.payments.findMany({
    where: eq(schema.payments.orderId, orderId),
    orderBy: [desc(schema.payments.createdAt)],
  });
  return payments;
}

/**
 * Get a payment by ID
 */
export async function getPayment(paymentId: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(schema.payments.id, paymentId),
  });
  return payment ?? null;
}

/**
 * Get payment by Stripe Payment Intent ID
 */
export async function getPaymentByStripeIntent(stripeIntentId: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(schema.payments.stripePaymentIntentId, stripeIntentId),
  });
  return payment ?? null;
}

/**
 * Create a new payment record
 */
export async function createPayment(paymentData: {
  orderId: string;
  amount: number;
  type: 'deposit' | 'balance' | 'refund';
  stripePaymentIntentId: string;
}) {
  const result = await db
    .insert(schema.payments)
    .values({
      orderId: paymentData.orderId,
      amount: paymentData.amount.toString(),
      type: paymentData.type,
      stripePaymentIntentId: paymentData.stripePaymentIntentId,
      status: 'pending',
    })
    .returning();
  return result[0] ?? null;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  metadata?: {
    processedAt?: Date;
    failureCode?: string;
    failureMessage?: string;
  }
) {
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (metadata?.processedAt) {
    updateData.processedAt = metadata.processedAt;
  }
  if (metadata?.failureCode) {
    updateData.failureCode = metadata.failureCode;
  }
  if (metadata?.failureMessage) {
    updateData.failureMessage = metadata.failureMessage;
  }

  const result = await db
    .update(schema.payments)
    .set(updateData)
    .where(eq(schema.payments.id, paymentId))
    .returning();
  return result[0] ?? null;
}

/**
 * Get total paid amount for an order
 */
export async function getTotalPaidForOrder(orderId: string): Promise<number> {
  const payments = await db.query.payments.findMany({
    where: eq(schema.payments.orderId, orderId),
  });
  
  return payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
}
