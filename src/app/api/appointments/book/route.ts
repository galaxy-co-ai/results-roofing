import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calcomAdapter } from '@/lib/integrations/adapters';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

/**
 * Booking request schema
 */
const bookingSchema = z.object({
  quoteId: z.string().uuid(),
  start: z.string().datetime(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  timezone: z.string().default('America/Chicago'),
});

/**
 * POST /api/appointments/book
 * Book an appointment slot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { quoteId, start, name, email, phone, notes, timezone } = parsed.data;

    // Verify quote exists and is in correct status
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Create booking via Cal.com
    const eventTypeId = parseInt(process.env.CALCOM_EVENT_TYPE_ID || '1', 10);
    const booking = await calcomAdapter.createBooking({
      eventTypeId,
      start,
      name,
      email,
      phone,
      notes,
      timeZone: timezone,
      metadata: {
        quoteId,
        source: 'results-roofing',
      },
    });

    // Update quote with scheduling info
    await db
      .update(schema.quotes)
      .set({
        status: 'scheduled',
        scheduledSlotId: booking.uid,
        scheduledDate: new Date(booking.startTime),
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info('Appointment booked', { quoteId, bookingId: booking.id });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        uid: booking.uid,
        start: booking.startTime,
        end: booking.endTime,
        status: booking.status,
      },
    });
  } catch (error) {
    logger.error('Error booking appointment', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}
