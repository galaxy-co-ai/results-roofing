import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

const financingSchema = z.object({
  financingTerm: z.enum(['pay-full', '12', '24']),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotes/[id]/financing
 * Sets the financing term selection for a quote
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: quoteId } = await params;
    const body = await request.json();

    // Validate input
    const parsed = financingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
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
        { status: 410 }
      );
    }

    // Calculate monthly payment if financing selected
    let monthlyPayment: number | null = null;
    const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;

    if (parsed.data.financingTerm !== 'pay-full' && totalPrice > 0) {
      const months = parseInt(parsed.data.financingTerm);
      monthlyPayment = Math.round(totalPrice / months);
    }

    // Update the quote with financing selection
    await db
      .update(schema.quotes)
      .set({
        financingTerm: parsed.data.financingTerm,
        financingMonthlyPayment: monthlyPayment?.toString() || null,
        financingStatus: parsed.data.financingTerm === 'pay-full' ? null : 'pending',
        status: quote.status === 'selected' ? 'financed' : quote.status,
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info('Financing selected', {
      quoteId,
      financingTerm: parsed.data.financingTerm,
      monthlyPayment,
    });

    return NextResponse.json({
      success: true,
      quoteId,
      financingTerm: parsed.data.financingTerm,
      monthlyPayment,
    });
  } catch (error) {
    logger.error('Error setting financing', error);
    return NextResponse.json(
      { error: 'Failed to set financing option' },
      { status: 500 }
    );
  }
}
