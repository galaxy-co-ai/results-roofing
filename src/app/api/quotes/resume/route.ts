import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { isTokenValid } from '@/lib/quote-resume';

/**
 * Query schema for resume request
 */
const resumeQuerySchema = z.object({
  token: z.string().min(1, 'Resume token is required'),
});

/**
 * GET /api/quotes/resume?token=xxx
 * Validates resume token and returns quote data with draft state
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    // Validate input
    const parsed = resumeQuerySchema.safeParse({ token });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid or missing resume token' },
        { status: 400 }
      );
    }

    // Find the draft by token
    const draft = await db.query.quoteDrafts.findFirst({
      where: eq(schema.quoteDrafts.resumeToken, parsed.data.token),
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'This resume link is invalid or has been used.' },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (!isTokenValid(draft.expiresAt)) {
      return NextResponse.json(
        {
          error: 'This resume link has expired. Please start a new quote.',
          expired: true,
        },
        { status: 410 }
      );
    }

    // Fetch the associated quote
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, draft.quoteId),
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'The associated quote no longer exists.' },
        { status: 404 }
      );
    }

    // Check if quote itself has expired
    if (quote.expiresAt && new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          error: 'Your quote has expired. Please start a new quote for current pricing.',
          expired: true,
        },
        { status: 410 }
      );
    }

    logger.info('Quote resumed via token', {
      quoteId: draft.quoteId,
      email: draft.email,
    });

    return NextResponse.json({
      success: true,
      quoteId: draft.quoteId,
      draftState: draft.draftState,
      quote: {
        id: quote.id,
        status: quote.status,
        address: quote.address,
        city: quote.city,
        state: quote.state,
        zip: quote.zip,
        sqftTotal: quote.sqftTotal,
        selectedTier: quote.selectedTier,
        totalPrice: quote.totalPrice,
        expiresAt: quote.expiresAt,
      },
      // Calculate where to redirect based on draft state
      redirectUrl: getResumeRedirectUrl(draft.quoteId, draft.draftState),
    });
  } catch (error) {
    logger.error('Error resuming quote', error);
    return NextResponse.json(
      { error: 'Failed to resume quote. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Determines the correct page to redirect to based on draft state
 */
function getResumeRedirectUrl(
  quoteId: string,
  draftState: { currentStage: number; selectedTier?: string }
): string {
  const baseUrl = `/quote/${quoteId}`;

  // If user has selected a tier, go to checkout
  if (draftState.selectedTier) {
    return `${baseUrl}/checkout`;
  }

  // Otherwise, based on stage
  switch (draftState.currentStage) {
    case 1:
      return `${baseUrl}/packages`;
    case 2:
      return `${baseUrl}/checkout`;
    case 3:
      return `${baseUrl}/contract`;
    default:
      return `${baseUrl}/packages`;
  }
}
