import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db';
import { logger } from '@/lib/utils';

/**
 * GET /api/quotes/share/[token]
 * Get quote data via share token (read-only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find share by token
    const share = await db.query.quoteShares.findFirst({
      where: eq(schema.quoteShares.token, token),
    });

    if (!share) {
      return NextResponse.json(
        { error: 'Share link not found or expired' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      );
    }

    // Get quote
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, share.quoteId),
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Get pricing tier if selected
    let selectedTierData = null;
    if (quote.selectedTier) {
      selectedTierData = await db.query.pricingTiers.findFirst({
        where: eq(schema.pricingTiers.tier, quote.selectedTier),
      });
    }

    // Update view count
    await db
      .update(schema.quoteShares)
      .set({
        viewCount: (share.viewCount || 0) + 1,
        lastViewedAt: new Date(),
      })
      .where(eq(schema.quoteShares.id, share.id));

    logger.info(`Quote ${quote.id} viewed via share link`);

    // Return sanitized quote data
    return NextResponse.json({
      quote: {
        id: quote.id,
        status: quote.status,
        sqftTotal: quote.sqftTotal,
        totalPrice: quote.totalPrice,
        depositAmount: quote.depositAmount,
        expiresAt: quote.expiresAt,
        createdAt: quote.createdAt,
      },
      property: {
        address: quote.address,
        city: quote.city,
        state: quote.state,
        zip: quote.zip,
      },
      selectedTier: selectedTierData ? {
        displayName: selectedTierData.displayName,
        tier: selectedTierData.tier,
        shingleType: selectedTierData.shingleType,
        warrantyYears: selectedTierData.warrantyYears,
        warrantyType: selectedTierData.warrantyType,
      } : null,
      share: {
        expiresAt: share.expiresAt,
        readOnly: true,
      },
    });
  } catch (error) {
    logger.error('Error fetching shared quote', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
