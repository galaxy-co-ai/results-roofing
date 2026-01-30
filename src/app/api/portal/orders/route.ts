import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrdersByEmail } from '@/db/queries';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

/**
 * GET /api/portal/orders
 * Get current user's orders
 */
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    // In dev bypass mode, use mock user
    if (DEV_BYPASS_ENABLED) {
      userId = MOCK_USER.id;
    } else {
      // Get authenticated user from Clerk
      const authResult = await auth();
      userId = authResult.userId;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's email from query param
    // Note: In production, you'd fetch the user's email from Clerk
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      // Return empty array if no email provided
      return NextResponse.json({ orders: [] });
    }

    const orders = await getOrdersByEmail(email);

    // Map to response format
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      status: order.status,
      confirmationNumber: order.confirmationNumber,
      propertyAddress: order.propertyAddress,
      propertyCity: order.propertyCity,
      propertyState: order.propertyState,
      selectedTier: order.selectedTier,
      totalPrice: parseFloat(order.totalPrice),
      depositAmount: parseFloat(order.depositAmount),
      balanceDue: parseFloat(order.balanceDue),
      scheduledStartDate: order.scheduledStartDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    logger.error('Error fetching user orders', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
