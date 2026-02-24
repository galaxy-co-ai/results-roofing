import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listMaterialOrders, createMaterialOrder } from '@/db/queries/materials';

/**
 * GET /api/ops/materials
 * List all material orders
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await listMaterialOrders();

  return NextResponse.json({
    orders,
    total: orders.length,
  });
}

/**
 * POST /api/ops/materials
 * Create a new material order
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const order = await createMaterialOrder({
      job: body.job,
      supplier: body.supplier,
      total: body.total,
      status: body.status || 'draft',
      notes: body.notes || null,
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create material order' },
      { status: 500 }
    );
  }
}
