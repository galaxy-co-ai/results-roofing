/**
 * Quote database queries
 */

import { db, schema, eq, desc } from '@/db';

/**
 * Get a quote by ID
 */
export async function getQuote(quoteId: string) {
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });
  return quote ?? null;
}

/**
 * Get a quote with its lead
 */
export async function getQuoteWithLead(quoteId: string) {
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
    with: {
      lead: true,
    },
  });
  return quote ?? null;
}

/**
 * Get quotes by lead ID
 */
export async function getQuotesByLead(leadId: string) {
  const quotes = await db.query.quotes.findMany({
    where: eq(schema.quotes.leadId, leadId),
    orderBy: [desc(schema.quotes.createdAt)],
  });
  return quotes;
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(
  quoteId: string,
  status: 'preliminary' | 'measured' | 'selected' | 'financed' | 'scheduled' | 'signed' | 'converted'
) {
  const result = await db
    .update(schema.quotes)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.quotes.id, quoteId))
    .returning();
  return result[0] ?? null;
}

/**
 * Update quote with selected tier
 */
export async function selectQuoteTier(
  quoteId: string,
  tier: 'good' | 'better' | 'best',
  tierPricing: {
    totalPrice: number;
    depositAmount: number;
  }
) {
  const result = await db
    .update(schema.quotes)
    .set({
      selectedTier: tier,
      totalPrice: tierPricing.totalPrice.toString(),
      depositAmount: tierPricing.depositAmount.toString(),
      tierSelectedAt: new Date(),
      status: 'selected',
      updatedAt: new Date(),
    })
    .where(eq(schema.quotes.id, quoteId))
    .returning();
  return result[0] ?? null;
}
