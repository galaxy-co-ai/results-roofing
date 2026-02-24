import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, eq } from '@/db';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PATCH /api/ops/documents/[id]
 * Update a document (rename, change folder, update status)
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

    if (body.name) updateData.name = body.name;
    if (body.folder) updateData.folder = body.folder;
    if (body.status) updateData.status = body.status;

    const [updated] = await db
      .update(schema.documents)
      .set(updateData)
      .where(eq(schema.documents.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, document: updated });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/documents/[id]
 * Delete a document record
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(schema.documents)
      .where(eq(schema.documents.id, id))
      .returning({ id: schema.documents.id });

    if (!deleted) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
