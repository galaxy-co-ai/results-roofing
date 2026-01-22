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
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 * 
 * Events handled:
 * - payment_intent.succeeded: Update quote status, send confirmation
 * - payment_intent.payment_failed: Log failure, update status
 */
export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    logger.warn('Stripe webhook received but Stripe not configured');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    logger.warn('Webhook received without signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  // Log the event for debugging
  logger.info(`Received Stripe webhook: ${event.type}`);

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
  const quoteId = paymentIntent.metadata.quote_id;

  if (!quoteId) {
    logger.warn(`Payment succeeded but no quote_id in metadata: ${paymentIntent.id}`);
    return;
  }

  logger.info(`Payment succeeded for quote ${quoteId}: ${paymentIntent.id}`);

  // Update quote status to 'signed' (or next appropriate status after payment)
  await db
    .update(schema.quotes)
    .set({
      status: 'signed',
      updatedAt: new Date(),
    })
    .where(eq(schema.quotes.id, quoteId));

  // TODO: Create order record
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
