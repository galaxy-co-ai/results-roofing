import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, desc } from '@/db';

/**
 * GET /api/ops/payments
 * List payments with optional status/method filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const method = searchParams.get('method') || undefined;
  const search = searchParams.get('search') || undefined;

  const allPayments = await db.query.payments.findMany({
    with: { order: true },
    orderBy: [desc(schema.payments.createdAt)],
  });

  // Filter in JS
  let filtered = allPayments;

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (method) {
    filtered = filtered.filter((p) => p.paymentMethod === method);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => {
      const customer = (p.order?.customerName || '').toLowerCase();
      const conf = (p.order?.confirmationNumber || '').toLowerCase();
      return customer.includes(q) || conf.includes(q);
    });
  }

  // Map to API shape
  const payments = filtered.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    type: p.type,
    amount: parseFloat(p.amount),
    status: p.status,
    paymentMethod: p.paymentMethod,
    cardLast4: p.cardLast4,
    cardBrand: p.cardBrand,
    customerName: p.order?.customerName || null,
    confirmationNumber: p.order?.confirmationNumber || null,
    processedAt: p.processedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  // Aggregate stats
  const totalReceived = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);
  const failedAmount = payments
    .filter((p) => p.status === 'failed')
    .reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    payments,
    total: payments.length,
    stats: { totalReceived, pendingAmount, failedAmount },
  });
}
