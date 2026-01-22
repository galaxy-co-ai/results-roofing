import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calcomAdapter } from '@/lib/integrations/adapters';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

/**
 * Reschedule request schema
 */
const rescheduleSchema = z.object({
  quoteId: z.string().uuid(),
  newStart: z.string().datetime(),
  reason: z.string().optional(),
});

/**
 * POST /api/appointments/reschedule
 * Reschedule an existing appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = rescheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { quoteId, newStart, reason } = parsed.data;

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

    // Parse booking ID from slot ID
    const bookingIdStr = quote.scheduledSlotId.replace('mock-', '');
    const bookingId = parseInt(bookingIdStr, 10);

    let newBooking;

    if (isNaN(bookingId)) {
      // Handle mock bookings
      logger.info('Rescheduling mock appointment', { quoteId, newStart });
      newBooking = {
        uid: quote.scheduledSlotId,
        startTime: newStart,
        endTime: new Date(new Date(newStart).getTime() + 4 * 60 * 60 * 1000).toISOString(),
      };
    } else {
      // Reschedule via Cal.com
      newBooking = await calcomAdapter.rescheduleBooking(bookingId, newStart, reason);
    }

    // Update quote with new scheduling
    await db
      .update(schema.quotes)
      .set({
        scheduledDate: new Date(newStart),
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info('Appointment rescheduled', { quoteId, newStart, reason });

    return NextResponse.json({
      success: true,
      booking: {
        uid: newBooking.uid,
        start: newBooking.startTime,
        end: newBooking.endTime,
      },
    });
  } catch (error) {
    logger.error('Error rescheduling appointment', error);
    return NextResponse.json(
      { error: 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
}
