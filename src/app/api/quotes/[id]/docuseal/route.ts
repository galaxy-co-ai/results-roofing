import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { docusealAdapter } from '@/lib/integrations/adapters/docuseal';
import { logger } from '@/lib/utils';

// Helper to save document record
async function saveDocumentRecord(params: {
  quoteId: string;
  customerName: string;
  customerEmail: string;
  propertyAddress: string;
  submissionId: number;
  slug: string;
  embedSrc: string;
  leadId?: string | null;
}) {
  try {
    await db.insert(schema.documents).values({
      name: `Deposit Authorization - ${params.propertyAddress}`,
      type: 'deposit_authorization',
      status: 'sent',
      folder: 'deposits',
      quoteId: params.quoteId,
      leadId: params.leadId || null,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      propertyAddress: params.propertyAddress,
      docusealSubmissionId: String(params.submissionId),
      docusealSlug: params.slug,
      docusealEmbedSrc: params.embedSrc,
    });
    logger.info('Document record created', { quoteId: params.quoteId, submissionId: params.submissionId });
  } catch (error) {
    logger.error('Failed to save document record', error);
    // Don't throw - this is non-critical
  }
}

// Request validation schema
const createSubmissionSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
});

/**
 * POST /api/quotes/[id]/docuseal
 * Creates a DocuSeal submission for deposit authorization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;

    // Validate request body
    const body = await request.json();
    const validation = createSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { customerName, customerEmail } = validation.data;

    // Fetch the quote
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Verify quote has necessary data
    if (!quote.selectedTier) {
      return NextResponse.json(
        { error: 'Quote must have a selected package' },
        { status: 400 }
      );
    }

    // Get the pricing tier info for display name
    const pricingTier = await db.query.pricingTiers.findFirst({
      where: eq(schema.pricingTiers.tier, quote.selectedTier),
    });

    const tierDisplayName = pricingTier?.displayName || quote.selectedTier;

    // Get total and deposit from quote (already calculated and stored)
    const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
    const depositAmount = quote.depositAmount ? parseFloat(quote.depositAmount) : Math.max(500, Math.round(totalPrice * 0.1));

    // Build full address
    const propertyAddress = `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`;

    // Create DocuSeal submission
    const submission = await docusealAdapter.createSubmission({
      templateId: 0, // Not used - we create from HTML
      customerName,
      customerEmail,
      propertyAddress,
      packageTier: tierDisplayName,
      totalPrice,
      depositAmount,
      installDate: quote.scheduledDate?.toISOString(),
      quoteId,
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Failed to create signing document' },
        { status: 500 }
      );
    }

    logger.info('DocuSeal submission created', {
      quoteId,
      submissionId: submission.id,
      email: customerEmail,
    });

    // Save document record for ops tracking
    await saveDocumentRecord({
      quoteId,
      customerName,
      customerEmail,
      propertyAddress,
      submissionId: submission.id,
      slug: submission.slug,
      embedSrc: submission.embed_src,
      leadId: quote.leadId,
    });

    return NextResponse.json({
      success: true,
      embedSrc: submission.embed_src,
      submissionId: submission.id,
      slug: submission.slug,
    });
  } catch (error) {
    logger.error('Failed to create DocuSeal submission', error);

    return NextResponse.json(
      { error: 'Failed to create signing document. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quotes/[id]/docuseal
 * Gets the status of an existing DocuSeal submission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;

    // Try to find existing submission by quote ID
    const submission = await docusealAdapter.getSubmissionByQuoteId(quoteId);

    if (!submission) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      status: submission.status,
      completedAt: submission.completed_at,
    });
  } catch (error) {
    logger.error('Failed to get DocuSeal submission status', error);

    return NextResponse.json(
      { error: 'Failed to check submission status' },
      { status: 500 }
    );
  }
}
