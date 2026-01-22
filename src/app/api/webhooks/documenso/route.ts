import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

const WEBHOOK_SECRET = process.env.DOCUMENSO_WEBHOOK_SECRET || '';

/**
 * Documenso Webhook Event Types
 */
type DocumensoEventType = 
  | 'document.signed'
  | 'document.completed'
  | 'document.sent'
  | 'document.opened';

interface DocumensoWebhookPayload {
  event: DocumensoEventType;
  data: {
    document: {
      id: number;
      title: string;
      status: string;
      createdAt: string;
      completedAt?: string;
    };
    recipient?: {
      id: number;
      email: string;
      name: string;
      signedAt?: string;
    };
    meta?: {
      quoteId?: string;
      source?: string;
    };
  };
  createdAt: string;
}

/**
 * Verify Documenso webhook signature
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) {
    logger.warn('Documenso webhook secret not configured or signature missing');
    return false;
  }

  const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Documenso sends signature in format: sha256=SIGNATURE
  const providedSig = signature.replace('sha256=', '');
  
  return expectedSignature === providedSig;
}

/**
 * POST /api/webhooks/documenso
 * Handle Documenso e-signature webhook events
 * 
 * Events handled:
 * - document.signed: Customer has signed the contract
 * - document.completed: All parties have signed
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-documenso-signature');

  // Verify webhook signature
  if (!verifySignature(body, signature)) {
    logger.error('Invalid Documenso webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: DocumensoWebhookPayload;

  try {
    payload = JSON.parse(body);
  } catch {
    logger.error('Invalid JSON in Documenso webhook');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, data } = payload;
  logger.info(`Received Documenso webhook: ${event}`, { documentId: data.document.id });

  try {
    // Store the webhook event for audit trail
    await db.insert(schema.webhookEvents).values({
      source: 'documenso',
      eventType: event,
      eventId: `doc-${data.document.id}-${Date.now()}`,
      payload: payload as unknown as Record<string, unknown>,
      processedAt: new Date(),
    });

    // Handle specific events
    switch (event) {
      case 'document.signed':
        await handleDocumentSigned(data);
        break;

      case 'document.completed':
        await handleDocumentCompleted(data);
        break;

      default:
        logger.info(`Unhandled Documenso event type: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Documenso webhook processing failed', error);
    // Return 200 to acknowledge receipt even if processing fails
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

/**
 * Handle document.signed event
 * Customer has signed the contract
 */
async function handleDocumentSigned(data: DocumensoWebhookPayload['data']) {
  const quoteId = data.meta?.quoteId;

  if (!quoteId) {
    logger.warn('Document signed but no quoteId in metadata', { 
      documentId: data.document.id,
      recipient: data.recipient?.email 
    });
    return;
  }

  logger.info(`Contract signed for quote ${quoteId}`, {
    documentId: data.document.id,
    signedBy: data.recipient?.email,
    signedAt: data.recipient?.signedAt,
  });

  // Update quote status to 'signed'
  await db
    .update(schema.quotes)
    .set({
      status: 'signed',
      updatedAt: new Date(),
    })
    .where(eq(schema.quotes.id, quoteId));

  // TODO: Send confirmation email to customer
  // TODO: Notify ops team via email/Slack
}

/**
 * Handle document.completed event
 * All parties have signed the contract
 */
async function handleDocumentCompleted(data: DocumensoWebhookPayload['data']) {
  const quoteId = data.meta?.quoteId;

  if (!quoteId) {
    logger.warn('Document completed but no quoteId in metadata', { 
      documentId: data.document.id 
    });
    return;
  }

  logger.info(`Contract completed for quote ${quoteId}`, {
    documentId: data.document.id,
    completedAt: data.document.completedAt,
  });

  // Update contract record with completion
  const contracts = await db.query.contracts.findFirst({
    where: eq(schema.contracts.quoteId, quoteId),
  });

  if (contracts) {
    await db
      .update(schema.contracts)
      .set({
        status: 'completed',
        signedAt: new Date(data.document.completedAt || Date.now()),
        updatedAt: new Date(),
      })
      .where(eq(schema.contracts.quoteId, quoteId));
  }

  // TODO: Trigger next step in checkout flow (payment)
  // TODO: Download signed PDF and store in Vercel Blob
  // TODO: Sync to JobNimbus CRM
}
