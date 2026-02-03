import { type NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
 * Handle contact-related events
 */
async function handleContactEvent(
  eventType: GHLEventType,
  payload: GHLWebhookPayload
) {
  const contactId = payload.contactId || payload.id;

  switch (eventType) {
    case 'ContactCreate':
      console.log(`[GHL Webhook] New contact created: ${contactId}`);
      // TODO: Sync with local database, send notifications
      break;

    case 'ContactUpdate':
      console.log(`[GHL Webhook] Contact updated: ${contactId}`);
      // TODO: Update local cache, refresh UI
      break;

    case 'ContactDelete':
      console.log(`[GHL Webhook] Contact deleted: ${contactId}`);
      // TODO: Remove from local cache
      break;

    case 'ContactTagUpdate':
      console.log(`[GHL Webhook] Contact tags updated: ${contactId}`);
      // TODO: Update contact tags in local cache
      break;

    case 'ContactDndUpdate':
      console.log(`[GHL Webhook] Contact DND updated: ${contactId}`);
      // TODO: Update DND status
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
      console.log(`[GHL Webhook] Inbound message for contact ${contactId}`);
      // TODO:
      // 1. Create support ticket if new conversation
      // 2. Add message to existing ticket
      // 3. Send notification to ops team
      // 4. Trigger auto-response if configured
      break;

    case 'OutboundMessage':
      console.log(`[GHL Webhook] Outbound message for contact ${contactId}`);
      // TODO: Update conversation history
      break;

    case 'ConversationUnreadUpdate':
      console.log(`[GHL Webhook] Unread count updated for ${conversationId}`);
      // TODO: Update unread badge in UI
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
      console.log(`[GHL Webhook] New opportunity: ${opportunityId}`);
      // TODO: Add to pipeline board
      break;

    case 'OpportunityUpdate':
      console.log(`[GHL Webhook] Opportunity updated: ${opportunityId}`);
      // TODO: Update pipeline card
      break;

    case 'OpportunityStageUpdate':
      console.log(`[GHL Webhook] Opportunity stage changed: ${opportunityId}`);
      // TODO: Move card on pipeline board, trigger automations
      break;

    case 'OpportunityDelete':
      console.log(`[GHL Webhook] Opportunity deleted: ${opportunityId}`);
      // TODO: Remove from pipeline
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
      console.log(`[GHL Webhook] New appointment: ${appointmentId}`);
      // TODO: Add to calendar, send confirmation
      break;

    case 'AppointmentUpdate':
      console.log(`[GHL Webhook] Appointment updated: ${appointmentId}`);
      // TODO: Update calendar, send notification
      break;

    case 'AppointmentDelete':
      console.log(`[GHL Webhook] Appointment deleted: ${appointmentId}`);
      // TODO: Remove from calendar
      break;
  }
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
      console.warn('[GHL Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  try {
    const payload: GHLWebhookPayload = JSON.parse(rawBody);
    const eventType = payload.type;

    console.log(`[GHL Webhook] Received event: ${eventType}`, {
      locationId: payload.locationId,
      id: payload.id,
      contactId: payload.contactId,
    });

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
      console.log(`[GHL Webhook] ${eventType}: ${payload.id}`);
      // TODO: Handle notes and tasks
    } else {
      console.log(`[GHL Webhook] Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true, type: eventType });
  } catch (error) {
    console.error('[GHL Webhook] Error processing webhook:', error);
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
