import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, eq } from '@/db';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PATCH /api/ops/invoices/[id]
 * Update an order's status (mark paid, void, etc.)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(schema.orders)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, invoice: { id: updated.id, status: updated.status } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
