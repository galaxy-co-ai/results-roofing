import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

// Check for Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe lazily
function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY) {
    logger.warn('STRIPE_SECRET_KEY not configured');
    return null;
  }
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

/**
 * POST /api/payments/create-intent
 * Creates a Stripe Payment Intent for a quote's deposit
 */
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    
    if (!stripe) {
      // Return mock data for development when Stripe is not configured
      logger.info('Stripe not configured - returning mock payment intent for development');
      return NextResponse.json({
        clientSecret: 'mock_client_secret_for_development',
        paymentIntentId: 'mock_pi_' + Date.now(),
        amount: 750,
        amountFormatted: '$750',
        mockMode: true,
      });
    }

    const body = await request.json();
    const { quoteId, fixedAmount } = body;

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    // Fetch the quote
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Calculate the deposit amount in cents
    // Use fixedAmount if provided, otherwise fall back to quote's depositAmount
    const depositAmount = fixedAmount
      ? parseFloat(String(fixedAmount))
      : (quote.depositAmount ? parseFloat(quote.depositAmount) : 0);

    if (depositAmount <= 0) {
      return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 400 });
    }

    const amountInCents = Math.round(depositAmount * 100);

    // Create Payment Intent with idempotency key to prevent duplicate charges
    const idempotencyKey = `deposit-${quoteId}-${Date.now()}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          quote_id: quoteId,
          payment_type: 'deposit',
          address: `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`,
          selected_tier: quote.selectedTier || 'unknown',
        },
        description: `Results Roofing - Deposit for ${quote.address}`,
      },
      {
        idempotencyKey,
      }
    );

    logger.info(`Created payment intent ${paymentIntent.id} for quote ${quoteId}`);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: depositAmount,
      amountFormatted: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(depositAmount),
    });
  } catch (error) {
    logger.error('Payment intent creation failed', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
