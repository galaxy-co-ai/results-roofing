import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, eq } from '@/db';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PATCH /api/ops/payments/[id]
 * Update a payment's status (e.g. mark as reconciled)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.status) updateData.status = body.status;

    const [updated] = await db
      .update(schema.payments)
      .set(updateData)
      .where(eq(schema.payments.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, payment: { id: updated.id, status: updated.status } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
