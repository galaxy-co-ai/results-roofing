import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrdersByUser, linkQuotesToUser, getPendingQuotesByUser } from '@/db/queries';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

/**
 * GET /api/portal/orders
 * Get current user's orders and pending quotes
 *
 * On first visit, attempts to link any unlinked quotes/orders by email match.
 * Returns both orders (paid) and pending quotes (not yet paid).
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
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ orders: [], pendingQuotes: [] });
    }

    // Attempt to link any unlinked quotes/orders to this user
    // This runs on every request but only links items that aren't already linked
    try {
      const linkResult = await linkQuotesToUser(userId, email);
      if (linkResult.linkedQuotes > 0 || linkResult.linkedOrders > 0) {
        logger.info('Linked items to user on portal visit', {
          userId,
          email,
          ...linkResult,
        });
      }
    } catch (linkError) {
      // Don't fail the request if linking fails
      logger.error('Failed to link quotes to user', linkError);
    }

    // Fetch orders using new user-based query (clerkUserId OR email)
    const orders = await getOrdersByUser(userId, email);

    // Fetch pending quotes that haven't been converted yet
    const pendingQuotes = await getPendingQuotesByUser(userId, email);

    // Map orders to response format
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

    // Map pending quotes to response format
    const formattedPendingQuotes = pendingQuotes.map((quote) => ({
      id: quote.id,
      status: quote.status,
      address: quote.address,
      city: quote.city,
      state: quote.state,
      zip: quote.zip,
      selectedTier: quote.selectedTier,
      totalPrice: quote.totalPrice ? parseFloat(quote.totalPrice) : null,
      depositAmount: quote.depositAmount ? parseFloat(quote.depositAmount) : null,
      scheduledDate: quote.scheduledDate,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    }));

    return NextResponse.json({
      orders: formattedOrders,
      pendingQuotes: formattedPendingQuotes,
    });
  } catch (error) {
    logger.error('Error fetching user orders', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
