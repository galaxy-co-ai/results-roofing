import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { resendAdapter, ghlMessagingAdapter } from '@/lib/integrations/adapters';

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

  let quote = null;

  if (quoteId) {
    // Fetch quote with lead info
    quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
      with: { lead: true },
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

    logger.info(`Quote ${quoteId} updated with booking ${booking.uid}`);
  }

  // Send booking confirmation email
  const customerEmail = attendee?.email || quote?.lead?.email;
  if (customerEmail) {
    try {
      const customerName = attendee?.name ||
        (quote?.lead?.firstName && quote?.lead?.lastName
          ? `${quote.lead.firstName} ${quote.lead.lastName}`
          : 'Valued Customer');

      const formattedDate = new Date(booking.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const address = quote
        ? `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`
        : booking.responses?.location?.value || 'Address on file';

      const emailResult = await resendAdapter.sendBookingConfirmation(
        customerEmail,
        {
          customerName,
          date: formattedDate,
          address,
          confirmationNumber: booking.uid,
        }
      );

      if (emailResult.success) {
        logger.info('Booking confirmation email sent', {
          emailId: emailResult.id,
          to: customerEmail,
          bookingUid: booking.uid,
        });
      } else {
        logger.error('Failed to send booking confirmation email', {
          error: emailResult.error,
          to: customerEmail,
        });
      }
    } catch (emailError) {
      logger.error('Exception sending booking confirmation email', emailError);
    }
  }

  // Send confirmation SMS if customer has phone
  const customerPhone = quote?.lead?.phone;
  if (customerPhone) {
    try {
      const smsResult = await ghlMessagingAdapter.sendBookingConfirmationSms(
        customerPhone,
        new Date(booking.startTime).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );

      if (smsResult.success) {
        logger.info('Booking confirmation SMS sent', {
          smsId: smsResult.id,
          to: customerPhone,
          bookingUid: booking.uid,
        });
      }
    } catch (smsError) {
      logger.error('Exception sending booking confirmation SMS', smsError);
    }
  }

  // Sync to GHL CRM with booking tag
  if (quote?.lead) {
    try {
      const crmResult = await ghlMessagingAdapter.syncCustomerToCRM({
        email: quote.lead.email || undefined,
        phone: quote.lead.phone || undefined,
        firstName: quote.lead.firstName || undefined,
        lastName: quote.lead.lastName || undefined,
        address: quote.address,
        city: quote.city,
        state: quote.state,
        postalCode: quote.zip,
        tags: ['booking-scheduled', 'results-roofing'],
        source: 'results-roofing-booking',
      });

      if (crmResult.success) {
        logger.info('Customer synced to GHL CRM after booking', {
          contactId: crmResult.contactId,
          bookingUid: booking.uid,
        });
      }
    } catch (crmError) {
      logger.error('Exception syncing to GHL CRM', crmError);
    }
  }
}

/**
 * Handle BOOKING_CANCELLED event
 */
async function handleBookingCancelled(booking: CalcomBooking) {
  const quoteId = booking.metadata?.quoteId;
  const attendee = booking.attendees[0];

  logger.info('Booking cancelled', {
    bookingId: booking.id,
    uid: booking.uid,
    quoteId,
  });

  let quote = null;

  if (quoteId) {
    // Fetch quote with lead info before updating
    quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
      with: { lead: true },
    });

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

  // Send cancellation notification email
  const customerEmail = attendee?.email || quote?.lead?.email;
  if (customerEmail) {
    try {
      const customerName = attendee?.name ||
        (quote?.lead?.firstName && quote?.lead?.lastName
          ? `${quote.lead.firstName} ${quote.lead.lastName}`
          : 'Valued Customer');

      const emailResult = await resendAdapter.sendProjectUpdate(
        customerEmail,
        {
          customerName,
          message: 'Your roofing installation appointment has been cancelled. If you did not request this cancellation or would like to reschedule, please contact us or visit your quote page to select a new date.',
          portalUrl: quoteId ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://results-roofing.vercel.app'}/quote/${quoteId}` : undefined,
        }
      );

      if (emailResult.success) {
        logger.info('Cancellation email sent', { emailId: emailResult.id, to: customerEmail });
      }
    } catch (emailError) {
      logger.error('Exception sending cancellation email', emailError);
    }
  }

  // Update GHL CRM with cancellation tag
  if (quote?.lead) {
    try {
      await ghlMessagingAdapter.syncCustomerToCRM({
        email: quote.lead.email || undefined,
        phone: quote.lead.phone || undefined,
        tags: ['booking-cancelled', 'results-roofing'],
        source: 'results-roofing-cancellation',
      });
    } catch (crmError) {
      logger.error('Exception updating GHL CRM for cancellation', crmError);
    }
  }
}

/**
 * Handle BOOKING_RESCHEDULED event
 */
async function handleBookingRescheduled(booking: CalcomBooking) {
  const quoteId = booking.metadata?.quoteId;
  const attendee = booking.attendees[0];

  logger.info('Booking rescheduled', {
    bookingId: booking.id,
    uid: booking.uid,
    quoteId,
    newStartTime: booking.startTime,
  });

  let quote = null;

  if (quoteId) {
    // Fetch quote with lead info
    quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
      with: { lead: true },
    });

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

  // Send reschedule confirmation email
  const customerEmail = attendee?.email || quote?.lead?.email;
  if (customerEmail) {
    try {
      const customerName = attendee?.name ||
        (quote?.lead?.firstName && quote?.lead?.lastName
          ? `${quote.lead.firstName} ${quote.lead.lastName}`
          : 'Valued Customer');

      const formattedDate = new Date(booking.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const address = quote
        ? `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`
        : 'Address on file';

      // Send as a new booking confirmation with the updated date
      const emailResult = await resendAdapter.sendBookingConfirmation(
        customerEmail,
        {
          customerName,
          date: formattedDate,
          address,
          confirmationNumber: booking.uid,
        }
      );

      if (emailResult.success) {
        logger.info('Reschedule confirmation email sent', {
          emailId: emailResult.id,
          to: customerEmail,
          newDate: formattedDate,
        });
      }
    } catch (emailError) {
      logger.error('Exception sending reschedule email', emailError);
    }
  }

  // Send reschedule SMS if customer has phone
  const customerPhone = quote?.lead?.phone;
  if (customerPhone) {
    try {
      const newDate = new Date(booking.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      await ghlMessagingAdapter.sendSmsByPhone(
        customerPhone,
        `Your roof installation has been rescheduled to ${newDate}. We'll see you then! - Results Roofing`
      );

      logger.info('Reschedule SMS sent', { to: customerPhone, newDate });
    } catch (smsError) {
      logger.error('Exception sending reschedule SMS', smsError);
    }
  }

  // Update GHL CRM with reschedule info
  if (quote?.lead) {
    try {
      await ghlMessagingAdapter.syncCustomerToCRM({
        email: quote.lead.email || undefined,
        phone: quote.lead.phone || undefined,
        tags: ['booking-rescheduled', 'results-roofing'],
        source: 'results-roofing-reschedule',
      });
    } catch (crmError) {
      logger.error('Exception updating GHL CRM for reschedule', crmError);
    }
  }
}
