import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calcomAdapter } from '@/lib/integrations/adapters';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

/**
 * Cancel request schema
 */
const cancelSchema = z.object({
  quoteId: z.string().uuid(),
  reason: z.string().optional(),
});

/**
 * POST /api/appointments/cancel
 * Cancel an existing appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cancelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { quoteId, reason } = parsed.data;

    // Get quote and booking info
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    if (!quote.scheduledSlotId) {
      return NextResponse.json(
        { error: 'No appointment found for this quote' },
        { status: 400 }
      );
    }

    // Parse booking ID from slot ID (format: mock-123 or actual ID)
    const bookingIdStr = quote.scheduledSlotId.replace('mock-', '');
    const bookingId = parseInt(bookingIdStr, 10);

    if (isNaN(bookingId)) {
      // Handle mock bookings
      logger.info('Cancelling mock appointment', { quoteId, slotId: quote.scheduledSlotId });
    } else {
      // Cancel via Cal.com
      await calcomAdapter.cancelBooking(bookingId, reason);
    }

    // Update quote to remove scheduling
    await db
      .update(schema.quotes)
      .set({
        status: 'selected', // Revert to tier selected status
        scheduledSlotId: null,
        scheduledDate: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info('Appointment cancelled', { quoteId, reason });

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    logger.error('Error cancelling appointment', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
