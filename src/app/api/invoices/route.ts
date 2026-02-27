import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED } from '@/lib/auth/dev-bypass';

/**
 * GET /api/invoices?orderId=xxx
 * List invoices for an order (portal use)
 */
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Auth check
    if (!DEV_BYPASS_ENABLED) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Verify the order belongs to this user
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        columns: { clerkUserId: true },
      });
      if (!order || order.clerkUserId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    const invoices = await db.query.invoices.findMany({
      where: eq(schema.invoices.orderId, orderId),
      with: { payment: true },
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    logger.error('[Invoices API] List failed', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
