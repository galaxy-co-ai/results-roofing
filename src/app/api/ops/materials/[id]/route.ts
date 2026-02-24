import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { updateMaterialOrder, deleteMaterialOrder } from '@/db/queries/materials';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PATCH /api/ops/materials/[id]
 * Update a material order
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const order = await updateMaterialOrder(id, body);
    if (!order) {
      return NextResponse.json({ error: 'Material order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update material order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/materials/[id]
 * Delete a material order
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteMaterialOrder(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete material order' },
      { status: 500 }
    );
  }
}
