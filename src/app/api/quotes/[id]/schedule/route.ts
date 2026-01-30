import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

const scheduleSchema = z.object({
  scheduledDate: z.string().datetime({ message: 'Invalid date format' }),
  timeSlot: z.enum(['morning', 'afternoon']),
  timezone: z.string().default('America/Chicago'),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotes/[id]/schedule
 * Sets the scheduled date and time slot for a quote
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: quoteId } = await params;
    const body = await request.json();

    // Validate input
    const parsed = scheduleSchema.safeParse(body);
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

    // Validate scheduled date is in the future
    const scheduledDate = new Date(parsed.data.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduledDate < today) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Generate a slot ID for the scheduled time
    const slotId = `${parsed.data.scheduledDate}-${parsed.data.timeSlot}`;

    // Update the quote with schedule info and return the updated row
    const [updatedQuote] = await db
      .update(schema.quotes)
      .set({
        scheduledDate,
        scheduledSlotId: slotId,
        status: quote.status === 'selected' || quote.status === 'financed' ? 'scheduled' : quote.status,
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId))
      .returning();

    if (!updatedQuote?.scheduledDate) {
      logger.error('Failed to update quote schedule', { quoteId, scheduledDate: parsed.data.scheduledDate });
      return NextResponse.json(
        { error: 'Failed to save schedule. Please try again.' },
        { status: 500 }
      );
    }

    logger.info('Quote scheduled', {
      quoteId,
      scheduledDate: parsed.data.scheduledDate,
      timeSlot: parsed.data.timeSlot,
    });

    return NextResponse.json({
      success: true,
      quoteId,
      scheduledDate: parsed.data.scheduledDate,
      timeSlot: parsed.data.timeSlot,
      slotId,
    });
  } catch (error) {
    logger.error('Error scheduling quote', error);
    return NextResponse.json(
      { error: 'Failed to schedule quote' },
      { status: 500 }
    );
  }
}
