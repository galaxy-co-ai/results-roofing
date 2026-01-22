import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { calculateDeposit } from '@/lib/pricing';

const selectTierSchema = z.object({
  tier: z.enum(['good', 'better', 'best']),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotes/[id]/select-tier
 * Handles package tier selection from the packages page
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: quoteId } = await params;

    // Parse form data (handles both FormData and JSON)
    let tier: string;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      tier = formData.get('tier') as string;
    } else {
      const body = await request.json();
      tier = body.tier;
    }

    // Validate tier
    const parsed = selectTierSchema.safeParse({ tier });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid tier selection. Must be good, better, or best.' },
        { status: 400 }
      );
    }

    // Fetch the quote
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check if quote is expired
    if (quote.expiresAt && new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This quote has expired. Please request a new quote.' },
        { status: 400 }
      );
    }

    // Get the pricing tier to calculate total price
    const pricingTier = await db.query.pricingTiers.findFirst({
      where: eq(schema.pricingTiers.tier, parsed.data.tier),
    });

    if (!pricingTier) {
      logger.error('Pricing tier not found', undefined, { tier: parsed.data.tier });
      return NextResponse.json(
        { error: 'Pricing configuration error' },
        { status: 500 }
      );
    }

    // Calculate total price based on sq ft and tier
    const sqft = quote.sqftTotal ? parseFloat(quote.sqftTotal) : 2500; // Default if no measurement
    const materialCost = sqft * parseFloat(pricingTier.materialPricePerSqft);
    const laborCost = sqft * parseFloat(pricingTier.laborPricePerSqft);
    const totalPrice = Math.round(materialCost + laborCost);
    const depositAmount = calculateDeposit(totalPrice);

    // Update the quote with selected tier
    await db
      .update(schema.quotes)
      .set({
        selectedTier: parsed.data.tier,
        tierSelectedAt: new Date(),
        totalPrice: totalPrice.toString(),
        depositAmount: depositAmount.toString(),
        status: 'selected',
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info('Package tier selected', {
      quoteId,
      tier: parsed.data.tier,
      totalPrice,
      depositAmount,
    });

    // For form submission, redirect to next step
    // For API calls, return JSON
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Redirect to checkout/scheduling page (to be built)
      redirect(`/quote/${quoteId}/checkout`);
    }

    return NextResponse.json({
      success: true,
      quoteId,
      selectedTier: parsed.data.tier,
      totalPrice,
      depositAmount,
      nextStep: `/quote/${quoteId}/checkout`,
    });
  } catch (error) {
    // Handle redirect (it throws)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    logger.error('Error selecting tier', error);
    return NextResponse.json(
      { error: 'Failed to select package' },
      { status: 500 }
    );
  }
}
