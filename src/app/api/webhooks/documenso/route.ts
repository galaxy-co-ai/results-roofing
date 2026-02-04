import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { resendAdapter, ghlMessagingAdapter } from '@/lib/integrations/adapters';

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

  // Fetch the quote with lead info
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
    with: { lead: true },
  });

  // Update quote status to 'signed'
  await db
    .update(schema.quotes)
    .set({
      status: 'signed',
      updatedAt: new Date(),
    })
    .where(eq(schema.quotes.id, quoteId));

  // Send confirmation email to customer
  const customerEmail = data.recipient?.email || quote?.lead?.email;
  const customerName = data.recipient?.name ||
    (quote?.lead?.firstName && quote?.lead?.lastName
      ? `${quote.lead.firstName} ${quote.lead.lastName}`
      : 'Valued Customer');

  if (customerEmail) {
    try {
      const emailResult = await resendAdapter.sendProjectUpdate(
        customerEmail,
        {
          customerName,
          message: 'Thank you for signing your roofing contract! Your installation is now confirmed. Our team will be in touch shortly with next steps, including scheduling and payment details.',
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://results-roofing.vercel.app'}/quote/${quoteId}/deposit`,
        }
      );

      if (emailResult.success) {
        logger.info('Contract signed confirmation email sent', {
          emailId: emailResult.id,
          to: customerEmail,
          quoteId,
        });
      }
    } catch (emailError) {
      logger.error('Exception sending contract signed email', emailError);
    }
  }

  // Send SMS confirmation if phone available
  const customerPhone = quote?.lead?.phone;
  if (customerPhone) {
    try {
      await ghlMessagingAdapter.sendContractSignedSms(customerPhone);
      logger.info('Contract signed SMS sent', { to: customerPhone, quoteId });
    } catch (smsError) {
      logger.error('Exception sending contract signed SMS', smsError);
    }
  }

  // Notify ops team
  const opsEmail = process.env.OPS_NOTIFICATION_EMAIL;
  if (opsEmail) {
    try {
      await resendAdapter.send({
        to: opsEmail,
        subject: `Contract Signed - ${customerName}`,
        template: 'project_update',
        data: {
          customerName: 'Ops Team',
          message: `A new contract has been signed!\n\nCustomer: ${customerName}\nEmail: ${customerEmail || 'N/A'}\nPhone: ${customerPhone || 'N/A'}\nQuote ID: ${quoteId}\nDocument ID: ${data.document.id}\n\nPlease follow up to schedule payment.`,
        },
      });
    } catch (opsError) {
      logger.error('Exception notifying ops team', opsError);
    }
  }

  // Sync to GHL CRM with signed tag
  try {
    await ghlMessagingAdapter.syncCustomerToCRM({
      email: customerEmail || undefined,
      phone: customerPhone || undefined,
      firstName: quote?.lead?.firstName || undefined,
      lastName: quote?.lead?.lastName || undefined,
      tags: ['contract-signed', 'results-roofing'],
      source: 'results-roofing-contract',
    });
  } catch (crmError) {
    logger.error('Exception syncing to GHL CRM', crmError);
  }
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

  // Fetch the quote with lead info
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
    with: { lead: true },
  });

  // Update contract record with completion
  const contract = await db.query.contracts.findFirst({
    where: eq(schema.contracts.quoteId, quoteId),
  });

  if (contract) {
    await db
      .update(schema.contracts)
      .set({
        status: 'completed',
        signedAt: new Date(data.document.completedAt || Date.now()),
        updatedAt: new Date(),
      })
      .where(eq(schema.contracts.quoteId, quoteId));
  }

  // Quote stays in 'signed' status after contract completion
  // The status will move to 'converted' after payment
  // Note: At this point the contract flow is complete

  // Send email prompting customer to proceed to payment
  const customerEmail = quote?.lead?.email;
  const customerName = quote?.lead?.firstName && quote?.lead?.lastName
    ? `${quote.lead.firstName} ${quote.lead.lastName}`
    : 'Valued Customer';

  if (customerEmail) {
    try {
      const emailResult = await resendAdapter.sendProjectUpdate(
        customerEmail,
        {
          customerName,
          message: 'Great news! Your contract is now fully executed. You can proceed to the next step by submitting your deposit payment. Click below to continue.',
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://results-roofing.vercel.app'}/quote/${quoteId}/deposit`,
        }
      );

      if (emailResult.success) {
        logger.info('Contract complete + payment prompt email sent', {
          emailId: emailResult.id,
          to: customerEmail,
          quoteId,
        });
      }
    } catch (emailError) {
      logger.error('Exception sending contract complete email', emailError);
    }
  }

  // Sync to GHL CRM with completed tag
  try {
    await ghlMessagingAdapter.syncCustomerToCRM({
      email: customerEmail || undefined,
      phone: quote?.lead?.phone || undefined,
      firstName: quote?.lead?.firstName || undefined,
      lastName: quote?.lead?.lastName || undefined,
      address: quote?.address,
      city: quote?.city,
      state: quote?.state,
      postalCode: quote?.zip,
      tags: ['contract-complete', 'ready-for-payment', 'results-roofing'],
      source: 'results-roofing-contract-complete',
    });
  } catch (crmError) {
    logger.error('Exception syncing to GHL CRM', crmError);
  }

  // Note: Signed PDF download to Vercel Blob would require Documenso API credentials
  // When credentials are available, implement documensoAdapter.downloadDocument()
  // and store using @vercel/blob
}
