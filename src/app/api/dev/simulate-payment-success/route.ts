import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

// Only allow in development
const isDev = process.env.NODE_ENV === 'development';

/**
 * Generate a unique confirmation number in format RR-XXXXXXXX
 */
function generateConfirmationNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'RR-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/dev/simulate-payment-success
 *
 * DEV ONLY: Simulates a successful Stripe payment webhook.
 * Creates order, payment, and contract records as if payment succeeded.
 *
 * Body: { quoteId: string, depositAmount?: number }
 */
export async function POST(request: NextRequest) {
  // Block in production
  if (!isDev) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { quoteId, depositAmount: customDepositAmount } = body;

    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId is required' }, { status: 400 });
    }

    logger.info(`[DEV] Simulating payment success for quote ${quoteId}`);

    // Fetch the quote with its lead
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
      with: {
        lead: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check if order already exists (idempotency)
    const existingOrder = await db.query.orders.findFirst({
      where: eq(schema.orders.quoteId, quoteId),
    });

    if (existingOrder) {
      logger.info(`[DEV] Order already exists for quote ${quoteId}: ${existingOrder.confirmationNumber}`);
      return NextResponse.json({
        success: true,
        message: 'Order already exists',
        order: {
          id: existingOrder.id,
          confirmationNumber: existingOrder.confirmationNumber,
          status: existingOrder.status,
        },
        alreadyExisted: true,
      });
    }

    // Look up or create a contract for this quote
    let contract = await db.query.contracts.findFirst({
      where: eq(schema.contracts.quoteId, quoteId),
    });

    if (!contract) {
      // Create a placeholder contract
      // Use lead email, or fall back to dev bypass email for testing
      const customerEmail = quote.lead?.email || 'dev@example.com';

      const [newContract] = await db
        .insert(schema.contracts)
        .values({
          quoteId,
          customerEmail,
          status: 'pending',
          templateVersion: '1.0',
        })
        .returning();

      contract = newContract;
      logger.info(`[DEV] Created placeholder contract for quote ${quoteId}`);
    }

    // Calculate amounts
    const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
    // Use custom deposit amount, or fixed $500, or fall back to quote's depositAmount
    const depositAmount = customDepositAmount
      ? parseFloat(String(customDepositAmount))
      : 500; // Fixed $500 deposit
    const balanceDue = totalPrice - depositAmount;

    // Generate unique confirmation number
    const confirmationNumber = generateConfirmationNumber();

    // Create the order
    const [order] = await db
      .insert(schema.orders)
      .values({
        quoteId,
        contractId: contract.id,
        confirmationNumber,
        status: 'deposit_paid',
        customerEmail: contract.customerEmail,
        customerPhone: quote.lead?.phone || null,
        customerName: quote.lead?.firstName && quote.lead?.lastName
          ? `${quote.lead.firstName} ${quote.lead.lastName}`
          : 'Dev Customer',
        propertyAddress: quote.address,
        propertyCity: quote.city,
        propertyState: quote.state,
        propertyZip: quote.zip,
        selectedTier: quote.selectedTier || 'better',
        totalPrice: totalPrice.toString(),
        depositAmount: depositAmount.toString(),
        balanceDue: balanceDue.toString(),
        financingUsed: quote.financingStatus === 'approved' ? 'wisetack' : 'none',
        scheduledStartDate: quote.scheduledDate || null,
      })
      .returning();

    logger.info(`[DEV] Created order ${order.confirmationNumber} for quote ${quoteId}`);

    // Create the payment record
    const mockPaymentIntentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const [payment] = await db.insert(schema.payments).values({
      orderId: order.id,
      type: 'deposit',
      amount: depositAmount.toString(),
      currency: 'usd',
      stripePaymentIntentId: mockPaymentIntentId,
      stripeChargeId: `mock_ch_${Date.now()}`,
      status: 'succeeded',
      paymentMethod: 'card',
      processedAt: new Date(),
    }).returning();

    logger.info(`[DEV] Recorded deposit payment for order ${order.confirmationNumber}`);

    // Update quote status to 'converted'
    await db
      .update(schema.quotes)
      .set({
        status: 'converted',
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info(`[DEV] Updated quote ${quoteId} status to converted`);

    return NextResponse.json({
      success: true,
      message: 'Payment simulated successfully',
      order: {
        id: order.id,
        confirmationNumber: order.confirmationNumber,
        status: order.status,
        customerEmail: order.customerEmail,
        totalPrice: order.totalPrice,
        depositAmount: order.depositAmount,
        balanceDue: order.balanceDue,
        scheduledStartDate: order.scheduledStartDate,
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        stripePaymentIntentId: payment.stripePaymentIntentId,
      },
      contract: {
        id: contract.id,
        status: contract.status,
      },
    });
  } catch (error) {
    logger.error('[DEV] Simulate payment failed', error);
    return NextResponse.json(
      { error: 'Failed to simulate payment', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dev/simulate-payment-success
 * Returns usage info
 */
export async function GET() {
  if (!isDev) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    endpoint: '/api/dev/simulate-payment-success',
    method: 'POST',
    description: 'Simulates a successful Stripe payment webhook for testing',
    body: {
      quoteId: '(required) The UUID of the quote to convert',
      depositAmount: '(optional) Custom deposit amount, defaults to $500',
    },
    example: {
      quoteId: '90813387-fdfd-492d-b234-e8fde2b23825',
      depositAmount: 500,
    },
    notes: [
      'Only available in development mode (NODE_ENV=development)',
      'Creates: contract (if needed), order, payment records',
      'Updates quote status to "converted"',
      'Idempotent: calling twice with same quoteId returns existing order',
    ],
  });
}
