import { db, schema, eq, desc } from '@/db/index';
import { logger } from '@/lib/utils';
import type { NewInvoice } from '@/db/schema/invoices';

/**
 * Generate next sequential invoice number: RR-INV-000001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const latest = await db.query.invoices.findFirst({
    orderBy: [desc(schema.invoices.createdAt)],
    columns: { invoiceNumber: true },
  });

  let nextNum = 1;
  if (latest?.invoiceNumber) {
    const match = latest.invoiceNumber.match(/RR-INV-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `RR-INV-${String(nextNum).padStart(6, '0')}`;
}

/**
 * Create a new invoice
 */
export async function createInvoice(params: {
  orderId: string;
  type: 'deposit' | 'balance' | 'full';
  amount: number;
  dueDate?: Date;
  notes?: string;
}): Promise<typeof schema.invoices.$inferSelect> {
  const invoiceNumber = await generateInvoiceNumber();

  const [invoice] = await db
    .insert(schema.invoices)
    .values({
      orderId: params.orderId,
      invoiceNumber,
      type: params.type,
      status: 'draft',
      amount: params.amount.toString(),
      dueDate: params.dueDate ?? null,
      notes: params.notes ?? null,
    })
    .returning();

  logger.info('[Invoicing] Invoice created', {
    invoiceId: invoice.id,
    invoiceNumber,
    orderId: params.orderId,
    type: params.type,
    amount: params.amount,
  });

  return invoice;
}

/**
 * Get all invoices for an order
 */
export async function getInvoicesByOrder(orderId: string) {
  return db.query.invoices.findMany({
    where: eq(schema.invoices.orderId, orderId),
    with: { payment: true },
    orderBy: [desc(schema.invoices.createdAt)],
  });
}

/**
 * Get single invoice with order + payment
 */
export async function getInvoiceById(invoiceId: string) {
  return db.query.invoices.findFirst({
    where: eq(schema.invoices.id, invoiceId),
    with: { order: true, payment: true },
  });
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: 'draft' | 'sent' | 'paid' | 'void',
  fields?: { paidAt?: Date; sentAt?: Date; paymentId?: string }
) {
  await db
    .update(schema.invoices)
    .set({
      status,
      ...fields,
      updatedAt: new Date(),
    })
    .where(eq(schema.invoices.id, invoiceId));

  logger.info('[Invoicing] Invoice status updated', { invoiceId, status });
}

/**
 * Link a payment to an invoice and mark it paid
 */
export async function linkPaymentToInvoice(invoiceId: string, paymentId: string) {
  await updateInvoiceStatus(invoiceId, 'paid', {
    paymentId,
    paidAt: new Date(),
  });
}
