import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, desc } from '@/db';

/**
 * GET /api/ops/invoices
 * List orders as invoices with optional status/search filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const allOrders = await db.query.orders.findMany({
    with: { payments: true },
    orderBy: [desc(schema.orders.createdAt)],
  });

  // Filter in JS
  let filtered = allOrders;

  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((o) => {
      const name = (o.customerName || '').toLowerCase();
      const conf = o.confirmationNumber.toLowerCase();
      const addr = o.propertyAddress.toLowerCase();
      return name.includes(q) || conf.includes(q) || addr.includes(q);
    });
  }

  // Map to API shape
  const invoices = filtered.map((o) => {
    const paidAmount = o.payments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return {
      id: o.id,
      confirmationNumber: o.confirmationNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      propertyAddress: o.propertyAddress,
      selectedTier: o.selectedTier,
      totalPrice: parseFloat(o.totalPrice),
      depositAmount: parseFloat(o.depositAmount),
      balanceDue: parseFloat(o.balanceDue),
      paidAmount,
      status: o.status,
      financingUsed: o.financingUsed,
      scheduledStartDate: o.scheduledStartDate?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    };
  });

  // Aggregate stats
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalPrice, 0);
  const outstanding = invoices
    .filter((i) => !['completed', 'cancelled', 'refunded'].includes(i.status))
    .reduce((sum, i) => sum + i.balanceDue, 0);
  const paid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);

  return NextResponse.json({
    invoices,
    total: invoices.length,
    stats: { totalInvoiced, outstanding, paid },
  });
}
