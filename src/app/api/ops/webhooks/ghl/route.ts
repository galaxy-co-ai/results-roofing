import { type NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/utils';
import { db, schema } from '@/db/index';

/**
 * GHL Webhook Event Types
 */
type GHLEventType =
  | 'ContactCreate'
  | 'ContactUpdate'
  | 'ContactDelete'
  | 'ContactDndUpdate'
  | 'ContactTagUpdate'
  | 'NoteCreate'
  | 'NoteUpdate'
  | 'NoteDelete'
  | 'TaskCreate'
  | 'TaskUpdate'
  | 'TaskDelete'
  | 'OpportunityCreate'
  | 'OpportunityUpdate'
  | 'OpportunityDelete'
  | 'OpportunityStageUpdate'
  | 'InboundMessage'
  | 'OutboundMessage'
  | 'ConversationUnreadUpdate'
  | 'AppointmentCreate'
  | 'AppointmentUpdate'
  | 'AppointmentDelete';

interface GHLWebhookPayload {
  type: GHLEventType;
  locationId: string;
  id?: string;
  contactId?: string;
  conversationId?: string;
  opportunityId?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
}

/**
 * Verify the webhook signature from GHL
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Store webhook event for audit trail
 */
async function storeWebhookEvent(payload: GHLWebhookPayload): Promise<void> {
  try {
    await db.insert(schema.webhookEvents).values({
      source: 'ghl',
      eventType: payload.type,
      eventId: `ghl-${payload.id || payload.contactId || payload.opportunityId}-${Date.now()}`,
      payload: payload as unknown as Record<string, unknown>,
      processedAt: new Date(),
    });
  } catch (error) {
    logger.error('[GHL Webhook] Failed to store webhook event', error);
  }
}

/**
 * Handle contact-related events
 */
async function handleContactEvent(
  eventType: GHLEventType,
  payload: GHLWebhookPayload
) {
  const contactId = payload.contactId || payload.id;

  switch (eventType) {
    case 'ContactCreate':
      logger.info('[GHL Webhook] New contact created', { contactId, data: payload.data });
      // Contact created in GHL - could sync to local leads table if needed
      // For now, GHL is source of truth for contacts
      break;

    case 'ContactUpdate':
      logger.info('[GHL Webhook] Contact updated', { contactId, data: payload.data });
      // Contact updated - could update local cache if we maintain one
      break;

    case 'ContactDelete':
      logger.info('[GHL Webhook] Contact deleted', { contactId });
      // Contact deleted - handle cleanup if needed
      break;

    case 'ContactTagUpdate':
      logger.info('[GHL Webhook] Contact tags updated', { contactId, data: payload.data });
      // Tags updated - useful for tracking customer journey stages
      break;

    case 'ContactDndUpdate':
      logger.info('[GHL Webhook] Contact DND updated', { contactId, data: payload.data });
      // DND status changed - respect messaging preferences
      break;
  }
}

/**
 * Handle message-related events
 */
async function handleMessageEvent(
  eventType: GHLEventType,
  payload: GHLWebhookPayload
) {
  const conversationId = payload.conversationId;
  const contactId = payload.contactId;

  switch (eventType) {
    case 'InboundMessage':
      logger.info('[GHL Webhook] Inbound message received', {
        conversationId,
        contactId,
        data: payload.data,
      });
      // Inbound message - could create support ticket or notify ops team
      // The ops dashboard can poll conversations API for latest messages
      break;

    case 'OutboundMessage':
      logger.info('[GHL Webhook] Outbound message sent', { conversationId, contactId });
      // Outbound message logged - useful for conversation history
      break;

    case 'ConversationUnreadUpdate':
      logger.info('[GHL Webhook] Unread count updated', { conversationId });
      // Unread status changed - could trigger notification badge update
      break;
  }
}

/**
 * Handle opportunity/pipeline events
 */
async function handleOpportunityEvent(
  eventType: GHLEventType,
  payload: GHLWebhookPayload
) {
  const opportunityId = payload.opportunityId || payload.id;

  switch (eventType) {
    case 'OpportunityCreate':
      logger.info('[GHL Webhook] New opportunity created', {
        opportunityId,
        data: payload.data,
      });
      // New deal in pipeline - ops dashboard will show via API polling
      break;

    case 'OpportunityUpdate':
      logger.info('[GHL Webhook] Opportunity updated', {
        opportunityId,
        data: payload.data,
      });
      // Deal updated - could trigger notifications
      break;

    case 'OpportunityStageUpdate':
      logger.info('[GHL Webhook] Opportunity stage changed', {
        opportunityId,
        data: payload.data,
      });
      // Stage change - useful for triggering automations
      // e.g., "Won" stage could trigger celebration notification
      break;

    case 'OpportunityDelete':
      logger.info('[GHL Webhook] Opportunity deleted', { opportunityId });
      // Deal removed from pipeline
      break;
  }
}

/**
 * Handle appointment events
 */
async function handleAppointmentEvent(
  eventType: GHLEventType,
  payload: GHLWebhookPayload
) {
  const appointmentId = payload.id;

  switch (eventType) {
    case 'AppointmentCreate':
      logger.info('[GHL Webhook] New appointment created', {
        appointmentId,
        data: payload.data,
      });
      // Appointment booked via GHL Calendar
      // Note: We primarily use Cal.com for scheduling, but GHL appointments
      // could be used for sales calls or follow-ups
      break;

    case 'AppointmentUpdate':
      logger.info('[GHL Webhook] Appointment updated', {
        appointmentId,
        data: payload.data,
      });
      break;

    case 'AppointmentDelete':
      logger.info('[GHL Webhook] Appointment deleted', { appointmentId });
      break;
  }
}

/**
 * Handle note and task events
 */
async function handleNoteOrTaskEvent(
  eventType: GHLEventType,
  payload: GHLWebhookPayload
) {
  logger.info(`[GHL Webhook] ${eventType}`, {
    id: payload.id,
    contactId: payload.contactId,
    data: payload.data,
  });
  // Notes and tasks are managed in GHL
  // Could sync to local tasks table if needed for unified task management
}

/**
 * POST /api/ops/webhooks/ghl
 * Receive webhook events from GoHighLevel
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.GHL_WEBHOOK_SECRET;
  const rawBody = await request.text();

  // Verify webhook signature if secret is configured
  if (webhookSecret) {
    const signature = request.headers.get('x-ghl-signature');
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      logger.warn('[GHL Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  try {
    const payload: GHLWebhookPayload = JSON.parse(rawBody);
    const eventType = payload.type;

    logger.info(`[GHL Webhook] Received event: ${eventType}`, {
      locationId: payload.locationId,
      id: payload.id,
      contactId: payload.contactId,
      opportunityId: payload.opportunityId,
    });

    // Store webhook event for audit trail
    await storeWebhookEvent(payload);

    // Route to appropriate handler based on event type
    if (eventType.startsWith('Contact')) {
      await handleContactEvent(eventType, payload);
    } else if (
      eventType === 'InboundMessage' ||
      eventType === 'OutboundMessage' ||
      eventType === 'ConversationUnreadUpdate'
    ) {
      await handleMessageEvent(eventType, payload);
    } else if (eventType.startsWith('Opportunity')) {
      await handleOpportunityEvent(eventType, payload);
    } else if (eventType.startsWith('Appointment')) {
      await handleAppointmentEvent(eventType, payload);
    } else if (eventType.startsWith('Note') || eventType.startsWith('Task')) {
      await handleNoteOrTaskEvent(eventType, payload);
    } else {
      logger.info(`[GHL Webhook] Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true, type: eventType });
  } catch (error) {
    logger.error('[GHL Webhook] Error processing webhook', error);
    // Still return 200 to prevent retries for invalid payloads
    return NextResponse.json(
      { received: true, error: 'Processing error' },
      { status: 200 }
    );
  }
}

/**
 * GET /api/ops/webhooks/ghl
 * Health check / verification endpoint for GHL webhook setup
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'GHL webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
