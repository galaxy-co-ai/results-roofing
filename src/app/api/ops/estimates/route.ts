import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, eq, desc, and } from '@/db';

/**
 * GET /api/ops/estimates
 * List quotes as estimates with optional status/search filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  // Build filter conditions
  const conditions = [];
  if (status) {
    conditions.push(eq(schema.quotes.status, status as typeof schema.quotes.status.enumValues[number]));
  }

  const allQuotes = await db.query.quotes.findMany({
    with: { lead: true },
    orderBy: [desc(schema.quotes.createdAt)],
    ...(conditions.length > 0 ? { where: and(...conditions) } : {}),
  });

  // Filter by search in JS (customer name or address)
  let filtered = allQuotes;
  if (search) {
    const q = search.toLowerCase();
    filtered = allQuotes.filter((quote) => {
      const customer = [quote.lead?.firstName, quote.lead?.lastName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const addr = quote.address.toLowerCase();
      return customer.includes(q) || addr.includes(q);
    });
  }

  // Map to API shape
  const estimates = filtered.map((q) => ({
    id: q.id,
    customer:
      [q.lead?.firstName, q.lead?.lastName].filter(Boolean).join(' ') ||
      q.lead?.email ||
      'Unknown',
    address: q.address,
    city: q.city,
    state: q.state,
    zip: q.zip,
    sqftTotal: q.sqftTotal ? parseFloat(q.sqftTotal) : null,
    selectedTier: q.selectedTier,
    totalPrice: q.totalPrice ? parseFloat(q.totalPrice) : null,
    depositAmount: q.depositAmount ? parseFloat(q.depositAmount) : null,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
    expiresAt: q.expiresAt?.toISOString() ?? null,
  }));

  return NextResponse.json({ estimates, total: estimates.length });
}
