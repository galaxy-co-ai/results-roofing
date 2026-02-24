import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, eq } from '@/db';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PATCH /api/ops/estimates/[id]
 * Update a quote's status (e.g. archive)
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
      .update(schema.quotes)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, estimate: { id: updated.id, status: updated.status } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update estimate' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/estimates/[id]
 * Delete a quote
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(schema.quotes)
      .where(eq(schema.quotes.id, id))
      .returning({ id: schema.quotes.id });

    if (!deleted) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete estimate' },
      { status: 500 }
    );
  }
}
