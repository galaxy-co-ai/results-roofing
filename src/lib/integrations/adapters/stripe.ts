import Stripe from 'stripe';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY) {
    logger.warn('STRIPE_SECRET_KEY not configured');
    return null;
  }
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

export { getStripeClient };

/**
 * Get or create a Stripe Customer for a lead.
 * - If the lead already has a stripeCustomerId, returns it.
 * - Otherwise creates a new Stripe Customer and stores the ID on the lead.
 */
export async function getOrCreateStripeCustomer(lead: {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  stripeCustomerId: string | null;
}): Promise<string> {
  // Return existing customer ID if we have one
  if (lead.stripeCustomerId) {
    return lead.stripeCustomerId;
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  // Build customer name from lead fields
  const nameParts = [lead.firstName, lead.lastName].filter(Boolean);
  const name = nameParts.length > 0 ? nameParts.join(' ') : undefined;

  const customer = await stripe.customers.create({
    email: lead.email || undefined,
    name,
    metadata: {
      lead_id: lead.id,
      source: 'results-roofing',
    },
  });

  // Persist the Stripe Customer ID on the lead
  await db
    .update(schema.leads)
    .set({
      stripeCustomerId: customer.id,
      updatedAt: new Date(),
    })
    .where(eq(schema.leads.id, lead.id));

  logger.info(`Created Stripe Customer ${customer.id} for lead ${lead.id}`);

  return customer.id;
}
