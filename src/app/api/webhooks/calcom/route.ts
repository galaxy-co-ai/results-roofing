import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

const WEBHOOK_SECRET = process.env.CALCOM_WEBHOOK_SECRET || '';

/**
 * Cal.com Webhook Event Types
 */
type CalcomEventType = 
  | 'BOOKING_CREATED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_RESCHEDULED';

interface CalcomBooking {
  id: number;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  attendees: Array<{
    email: string;
    name: string;
    timeZone: string;
  }>;
  metadata?: {
    quoteId?: string;
    source?: string;
  };
  location?: string;
  responses?: {
    location?: {
      value: string;
    };
  };
}

interface CalcomWebhookPayload {
  triggerEvent: CalcomEventType;
  createdAt: string;
  payload: CalcomBooking;
}

/**
 * Verify Cal.com webhook signature
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    logger.warn('CALCOM_WEBHOOK_SECRET not configured');
    return true; // Allow in dev mode without secret
  }

  if (!signature) {
    return false;
  }

  const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * POST /api/webhooks/calcom
 * Handle Cal.com booking webhook events
 * 
 * Events handled:
 * - BOOKING_CREATED: New appointment booked
 * - BOOKING_CANCELLED: Appointment cancelled
 * - BOOKING_RESCHEDULED: Appointment rescheduled
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-cal-signature-256');

  // Verify webhook signature
  if (!verifySignature(body, signature)) {
    logger.error('Invalid Cal.com webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let webhookData: CalcomWebhookPayload;

  try {
    webhookData = JSON.parse(body);
  } catch {
    logger.error('Invalid JSON in Cal.com webhook');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { triggerEvent, payload } = webhookData;
  logger.info(`Received Cal.com webhook: ${triggerEvent}`, { 
    bookingId: payload.id,
    uid: payload.uid 
  });

  try {
    // Store the webhook event for audit trail
    await db.insert(schema.webhookEvents).values({
      source: 'calcom',
      eventType: triggerEvent,
      eventId: `cal-${payload.uid}-${Date.now()}`,
      payload: webhookData as unknown as Record<string, unknown>,
      processedAt: new Date(),
    });

    // Handle specific events
    switch (triggerEvent) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(payload);
        break;

      case 'BOOKING_CANCELLED':
        await handleBookingCancelled(payload);
        break;

      case 'BOOKING_RESCHEDULED':
        await handleBookingRescheduled(payload);
        break;

      default:
        logger.info(`Unhandled Cal.com event type: ${triggerEvent}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Cal.com webhook processing failed', error);
    // Return 200 to acknowledge receipt even if processing fails
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

/**
 * Handle BOOKING_CREATED event
 */
async function handleBookingCreated(booking: CalcomBooking) {
  const quoteId = booking.metadata?.quoteId;
  const attendee = booking.attendees[0];

  logger.info('New booking created', {
    bookingId: booking.id,
    uid: booking.uid,
    quoteId,
    attendee: attendee?.email,
    startTime: booking.startTime,
  });

  if (quoteId) {
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

    logger.info(`Quote ${quoteId} updated with booking ${booking.uid}`);
  }

  // TODO: Send confirmation email via Resend
  // TODO: Send confirmation SMS if consent given
  // TODO: Sync to JobNimbus CRM
}

/**
 * Handle BOOKING_CANCELLED event
 */
async function handleBookingCancelled(booking: CalcomBooking) {
  const quoteId = booking.metadata?.quoteId;

  logger.info('Booking cancelled', {
    bookingId: booking.id,
    uid: booking.uid,
    quoteId,
  });

  if (quoteId) {
    // Update quote to remove scheduling
    await db
      .update(schema.quotes)
      .set({
        status: 'selected', // Revert to tier selected
        scheduledSlotId: null,
        scheduledDate: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info(`Quote ${quoteId} scheduling cleared due to cancellation`);
  }

  // TODO: Send cancellation email
  // TODO: Update JobNimbus
}

/**
 * Handle BOOKING_RESCHEDULED event
 */
async function handleBookingRescheduled(booking: CalcomBooking) {
  const quoteId = booking.metadata?.quoteId;

  logger.info('Booking rescheduled', {
    bookingId: booking.id,
    uid: booking.uid,
    quoteId,
    newStartTime: booking.startTime,
  });

  if (quoteId) {
    // Update quote with new scheduling
    await db
      .update(schema.quotes)
      .set({
        scheduledDate: new Date(booking.startTime),
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info(`Quote ${quoteId} rescheduled to ${booking.startTime}`);
  }

  // TODO: Send reschedule confirmation email
  // TODO: Update JobNimbus
}
