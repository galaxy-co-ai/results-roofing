import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

/**
 * DocuSeal Webhook Handler
 *
 * Receives notifications when documents are:
 * - viewed
 * - signed/completed
 * - declined
 *
 * @see https://www.docuseal.com/docs/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info('DocuSeal webhook received', {
      event: body.event_type,
      submissionId: body.data?.submission_id,
    });

    const { event_type, data } = body;

    if (!data?.submission_id) {
      return NextResponse.json({ error: 'Missing submission_id' }, { status: 400 });
    }

    const submissionId = String(data.submission_id);
    const timestamp = new Date();

    // Find the document by DocuSeal submission ID
    const existingDoc = await db.query.documents.findFirst({
      where: eq(schema.documents.docusealSubmissionId, submissionId),
    });

    if (!existingDoc) {
      logger.warn('Document not found for DocuSeal submission', { submissionId });
      return NextResponse.json({ received: true, matched: false });
    }

    // Handle different event types
    switch (event_type) {
      case 'form.viewed':
        await db
          .update(schema.documents)
          .set({
            status: 'viewed',
            updatedAt: timestamp,
          })
          .where(eq(schema.documents.id, existingDoc.id));
        break;

      case 'form.completed':
      case 'submission.completed':
        // Extract document URLs from the webhook data
        const documentUrl = data.documents?.[0]?.url || data.audit_log_url || null;

        await db
          .update(schema.documents)
          .set({
            status: 'completed',
            signedAt: timestamp,
            docusealDocumentUrl: documentUrl,
            updatedAt: timestamp,
          })
          .where(eq(schema.documents.id, existingDoc.id));

        // Also update the quote status if we have a quoteId
        if (existingDoc.quoteId) {
          await db
            .update(schema.quotes)
            .set({
              status: 'signed',
              updatedAt: timestamp,
            })
            .where(eq(schema.quotes.id, existingDoc.quoteId));
        }

        logger.info('Document marked as completed via webhook', {
          documentId: existingDoc.id,
          quoteId: existingDoc.quoteId,
          documentUrl,
        });
        break;

      case 'form.declined':
      case 'submission.declined':
        await db
          .update(schema.documents)
          .set({
            status: 'declined',
            updatedAt: timestamp,
          })
          .where(eq(schema.documents.id, existingDoc.id));
        break;

      default:
        logger.info('Unhandled DocuSeal webhook event', { event_type });
    }

    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    logger.error('DocuSeal webhook processing failed', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Allow GET for webhook verification if needed
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'docuseal-webhook' });
}
