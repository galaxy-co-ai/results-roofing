/**
 * User linking queries
 * Links quotes/leads/orders to Clerk users on first portal visit
 */

import { db, schema, eq, and, isNull, or, desc } from '@/db';
import { logger } from '@/lib/utils';

/**
 * Link unlinked quotes to a Clerk user by email match
 * Called on first portal visit to establish the connection
 *
 * @returns Number of quotes linked
 */
export async function linkQuotesToUser(
  clerkUserId: string,
  email: string
): Promise<{ linkedQuotes: number; linkedLeads: number; linkedOrders: number }> {
  const timestamp = new Date();
  let linkedQuotes = 0;
  let linkedLeads = 0;
  let linkedOrders = 0;

  // Find leads by email that aren't already linked to a user
  const unlinkedLeads = await db.query.leads.findMany({
    where: and(
      eq(schema.leads.email, email),
      isNull(schema.leads.clerkUserId)
    ),
  });

  // Link leads
  if (unlinkedLeads.length > 0) {
    const leadIds = unlinkedLeads.map((l) => l.id);
    await db
      .update(schema.leads)
      .set({ clerkUserId, updatedAt: timestamp })
      .where(
        and(
          eq(schema.leads.email, email),
          isNull(schema.leads.clerkUserId)
        )
      );
    linkedLeads = unlinkedLeads.length;

    logger.info('Linked leads to user', {
      clerkUserId,
      email,
      leadIds,
    });
  }

  // Find quotes by lead email or direct clerkUserId match that aren't linked
  // A quote is linked to a lead, so we need to find quotes whose lead has this email
  const unlinkedQuotes = await db.query.quotes.findMany({
    where: isNull(schema.quotes.clerkUserId),
    with: {
      lead: true,
    },
  });

  const quotesToLink = unlinkedQuotes.filter(
    (q) => q.lead?.email === email
  );

  if (quotesToLink.length > 0) {
    const quoteIds = quotesToLink.map((q) => q.id);

    for (const quote of quotesToLink) {
      await db
        .update(schema.quotes)
        .set({ clerkUserId, updatedAt: timestamp })
        .where(eq(schema.quotes.id, quote.id));
    }

    linkedQuotes = quotesToLink.length;

    logger.info('Linked quotes to user', {
      clerkUserId,
      email,
      quoteIds,
    });
  }

  // Link orders by email that aren't already linked
  const unlinkedOrders = await db.query.orders.findMany({
    where: and(
      eq(schema.orders.customerEmail, email),
      isNull(schema.orders.clerkUserId)
    ),
  });

  if (unlinkedOrders.length > 0) {
    await db
      .update(schema.orders)
      .set({ clerkUserId, updatedAt: timestamp })
      .where(
        and(
          eq(schema.orders.customerEmail, email),
          isNull(schema.orders.clerkUserId)
        )
      );
    linkedOrders = unlinkedOrders.length;

    logger.info('Linked orders to user', {
      clerkUserId,
      email,
      orderIds: unlinkedOrders.map((o) => o.id),
    });
  }

  return { linkedQuotes, linkedLeads, linkedOrders };
}

/**
 * Get orders by Clerk user ID (primary) or email (fallback)
 */
export async function getOrdersByUser(
  clerkUserId: string,
  email: string
) {
  const orders = await db.query.orders.findMany({
    where: or(
      eq(schema.orders.clerkUserId, clerkUserId),
      eq(schema.orders.customerEmail, email)
    ),
    orderBy: [desc(schema.orders.createdAt)],
  });
  return orders;
}

/**
 * Get pending quotes by Clerk user ID (primary) or lead email (fallback)
 * Returns quotes that haven't been converted to orders yet
 */
export async function getPendingQuotesByUser(
  clerkUserId: string,
  email: string
) {
  // First try by clerkUserId
  let quotes = await db.query.quotes.findMany({
    where: eq(schema.quotes.clerkUserId, clerkUserId),
    with: {
      lead: true,
    },
    orderBy: [desc(schema.quotes.createdAt)],
  });

  // If no quotes found by clerkUserId, try by lead email
  if (quotes.length === 0) {
    const allQuotes = await db.query.quotes.findMany({
      with: {
        lead: true,
      },
      orderBy: [desc(schema.quotes.createdAt)],
    });

    quotes = allQuotes.filter((q) => q.lead?.email === email);
  }

  // Filter to only pending quotes (not converted)
  const pendingStatuses = ['preliminary', 'measured', 'selected', 'financed', 'scheduled', 'signed'];
  return quotes.filter((q) => pendingStatuses.includes(q.status));
}
