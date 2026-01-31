import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

// Check for Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

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
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 *
 * Events handled:
 * - payment_intent.succeeded: Update quote status, send confirmation
 * - payment_intent.payment_failed: Log failure, update status
 */
export async function POST(request: NextRequest) {
  logger.info('[WEBHOOK] Incoming webhook request received');

  const stripe = getStripeClient();

  if (!stripe) {
    logger.error('[WEBHOOK] STRIPE_SECRET_KEY not configured');
    return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    logger.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Stripe webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  logger.info('[WEBHOOK] Request details', {
    hasBody: !!body,
    bodyLength: body.length,
    hasSignature: !!signature,
    webhookSecretPrefix: STRIPE_WEBHOOK_SECRET?.substring(0, 12) + '...',
  });

  if (!signature) {
    logger.error('[WEBHOOK] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    logger.info('[WEBHOOK] Signature verified successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[WEBHOOK] Signature verification failed:', message);
    logger.error(`[WEBHOOK] Signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  // Log the event for debugging
  logger.info(`[WEBHOOK] Processing event: ${event.type}`, { eventId: event.id });

  try {
    // Store the webhook event
    await db.insert(schema.webhookEvents).values({
      source: 'stripe',
      eventType: event.type,
      eventId: event.id,
      payload: event.data.object as unknown as Record<string, unknown>,
      processedAt: new Date(),
    });

    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', error);
    // Return 200 to acknowledge receipt even if processing fails
    // This prevents Stripe from retrying
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  logger.info('[WEBHOOK] handlePaymentSuccess called', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    metadata: paymentIntent.metadata,
  });

  const quoteId = paymentIntent.metadata.quote_id;

  if (!quoteId) {
    logger.error(`[WEBHOOK] Payment succeeded but no quote_id in metadata`, {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
    return;
  }

  logger.info(`[WEBHOOK] Processing payment for quote ${quoteId}`);

  // Fetch the quote with its lead
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
    with: {
      lead: true,
    },
  });

  if (!quote) {
    logger.error(`[WEBHOOK] Quote not found in database`, { quoteId });
    return;
  }

  logger.info(`[WEBHOOK] Found quote`, {
    quoteId,
    address: quote.address,
    totalPrice: quote.totalPrice,
    leadEmail: quote.lead?.email,
  });

  // Check if order already exists (idempotency)
  const existingOrder = await db.query.orders.findFirst({
    where: eq(schema.orders.quoteId, quoteId),
  });

  if (existingOrder) {
    logger.info(`[WEBHOOK] Order already exists (idempotent)`, {
      quoteId,
      orderId: existingOrder.id,
      confirmationNumber: existingOrder.confirmationNumber,
    });
    return;
  }

  logger.info(`[WEBHOOK] No existing order found, creating new order`);

  // Look up or create a contract for this quote
  let contract = await db.query.contracts.findFirst({
    where: eq(schema.contracts.quoteId, quoteId),
  });

  if (!contract) {
    // Create a placeholder contract if none exists
    // This handles cases where e-signature is pending but payment went through
    const customerEmail = quote.lead?.email || paymentIntent.receipt_email || 'customer@example.com';
    
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
    logger.info(`Created placeholder contract for quote ${quoteId}`);
  }

  // Calculate amounts
  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = paymentIntent.amount / 100; // Convert from cents
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
        : null,
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

  logger.info(`[WEBHOOK] Order created successfully`, {
    orderId: order.id,
    confirmationNumber: order.confirmationNumber,
    quoteId,
    customerEmail: order.customerEmail,
    totalPrice: order.totalPrice,
    depositAmount: order.depositAmount,
  });

  // Create the payment record
  await db.insert(schema.payments).values({
    orderId: order.id,
    type: 'deposit',
    amount: depositAmount.toString(),
    currency: 'usd',
    stripePaymentIntentId: paymentIntent.id,
    stripeChargeId: paymentIntent.latest_charge as string || null,
    status: 'succeeded',
    paymentMethod: 'card',
    processedAt: new Date(),
  });

  logger.info(`[WEBHOOK] Payment record created`, {
    orderId: order.id,
    confirmationNumber: order.confirmationNumber,
    amount: depositAmount,
  });

  // Update quote status to 'converted'
  await db
    .update(schema.quotes)
    .set({
      status: 'converted',
      updatedAt: new Date(),
    })
    .where(eq(schema.quotes.id, quoteId));

  logger.info(`[WEBHOOK] Quote status updated to 'converted'`, { quoteId });

  logger.info(`[WEBHOOK] Payment flow completed successfully`, {
    quoteId,
    orderId: order.id,
    confirmationNumber: order.confirmationNumber,
    customerEmail: order.customerEmail,
  });

  // TODO: Send confirmation email via Resend
  // TODO: Send confirmation SMS if consent given
  // TODO: Sync to JobNimbus CRM
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const quoteId = paymentIntent.metadata.quote_id;

  if (!quoteId) {
    logger.warn(`Payment failed but no quote_id in metadata: ${paymentIntent.id}`);
    return;
  }

  const lastError = paymentIntent.last_payment_error;

  logger.warn(`Payment failed for quote ${quoteId}: ${paymentIntent.id}`, {
    code: lastError?.code,
    message: lastError?.message,
  });

  // Note: We don't change quote status on failure - user can retry
  // The frontend will show the error from Stripe Elements
}

/**
 * Handle refund
 */
async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string' 
    ? charge.payment_intent 
    : charge.payment_intent?.id;

  logger.info(`Refund processed for charge ${charge.id}`, {
    paymentIntentId,
    amount: charge.amount_refunded,
  });

  // TODO: Update payment record status to 'refunded'
  // TODO: Send refund confirmation email
}
