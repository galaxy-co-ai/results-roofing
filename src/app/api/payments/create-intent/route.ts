import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { getStripeClient, getOrCreateStripeCustomer } from '@/lib/integrations/adapters';

/**
 * POST /api/payments/create-intent
 * Creates a Stripe Payment Intent for a deposit, balance, or full payment.
 * Attaches a Stripe Customer to the PaymentIntent for saved card display.
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
    const { quoteId, fixedAmount, paymentType } = body as {
      quoteId?: string;
      fixedAmount?: number;
      paymentType?: 'deposit' | 'balance' | 'full';
    };

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

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

    // Calculate the payment amount in cents
    const paymentAmount = fixedAmount
      ? parseFloat(String(fixedAmount))
      : (quote.depositAmount ? parseFloat(quote.depositAmount) : 0);

    if (paymentAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    const amountInCents = Math.round(paymentAmount * 100);

    // Get or create Stripe Customer from the lead
    let stripeCustomerId: string | undefined;
    if (quote.lead) {
      try {
        stripeCustomerId = await getOrCreateStripeCustomer({
          id: quote.lead.id,
          email: quote.lead.email,
          firstName: quote.lead.firstName,
          lastName: quote.lead.lastName,
          stripeCustomerId: quote.lead.stripeCustomerId,
        });
      } catch (err) {
        // Log but don't block payment — customer linkage is nice-to-have
        logger.error('Failed to get/create Stripe Customer', err);
      }
    }

    // Determine payment description
    const typeLabel = paymentType === 'balance' ? 'Balance payment'
      : paymentType === 'full' ? 'Full payment'
      : 'Deposit';

    // Create Payment Intent
    const idempotencyKey = `${paymentType || 'deposit'}-${quoteId}-${Date.now()}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency: 'usd',
        ...(stripeCustomerId && { customer: stripeCustomerId }),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          quote_id: quoteId,
          payment_type: paymentType || 'deposit',
          address: `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`,
          selected_tier: quote.selectedTier || 'unknown',
        },
        description: `Results Roofing - ${typeLabel} for ${quote.address}`,
      },
      {
        idempotencyKey,
      }
    );

    logger.info(`Created payment intent ${paymentIntent.id} for quote ${quoteId}`, {
      paymentType: paymentType || 'deposit',
      stripeCustomerId: stripeCustomerId || 'none',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentAmount,
      amountFormatted: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(paymentAmount),
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
