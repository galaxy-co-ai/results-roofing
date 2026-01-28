import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import {
  generateResumeToken,
  getResumeTokenExpiry,
  buildResumeUrl,
} from '@/lib/quote-resume';
import { resendAdapter } from '@/lib/integrations/adapters/resend';
import type { QuoteDraftState } from '@/types';

/**
 * Zod schema for save draft request
 */
const saveDraftSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  draftState: z.object({
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      placeId: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
    propertyConfirmed: z.boolean().optional(),
    selectedTier: z.enum(['good', 'better', 'best']).optional(),
    scheduledDate: z.string().optional(),
    timeSlot: z.enum(['morning', 'afternoon']).optional(),
    financingTerm: z.enum(['pay-full', '12', '24']).optional(),
    phone: z.string().optional(),
    smsConsent: z.boolean().optional(),
    currentStage: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    currentStep: z.number(),
    lastUpdatedAt: z.string(),
  }),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotes/[id]/save-draft
 * Saves the current quote progress and sends a resume email
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: quoteId } = await params;
    const body = await request.json();

    // Validate input
    const parsed = saveDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, draftState } = parsed.data;

    // Verify quote exists
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check if a draft already exists for this quote and email
    const existingDraft = await db.query.quoteDrafts.findFirst({
      where: eq(schema.quoteDrafts.quoteId, quoteId),
    });

    let resumeToken: string;
    let resumeUrl: string;

    if (existingDraft) {
      // Update existing draft
      resumeToken = existingDraft.resumeToken;
      resumeUrl = buildResumeUrl(resumeToken);

      await db
        .update(schema.quoteDrafts)
        .set({
          email,
          draftState: draftState as QuoteDraftState,
          expiresAt: getResumeTokenExpiry(),
          updatedAt: new Date(),
        })
        .where(eq(schema.quoteDrafts.id, existingDraft.id));

      logger.info('Quote draft updated', { quoteId, email });
    } else {
      // Create new draft
      resumeToken = generateResumeToken();
      resumeUrl = buildResumeUrl(resumeToken);

      await db.insert(schema.quoteDrafts).values({
        quoteId,
        email,
        resumeToken,
        draftState: draftState as QuoteDraftState,
        expiresAt: getResumeTokenExpiry(),
      });

      logger.info('Quote draft created', { quoteId, email });
    }

    // Update lead email if not already set
    if (quote.leadId) {
      const lead = await db.query.leads.findFirst({
        where: eq(schema.leads.id, quote.leadId),
      });

      if (lead && !lead.email) {
        await db
          .update(schema.leads)
          .set({ email, updatedAt: new Date() })
          .where(eq(schema.leads.id, quote.leadId));
      }
    }

    // Send resume email
    const expiresAt = getResumeTokenExpiry();
    await resendAdapter.sendQuoteResume(email, {
      resumeUrl,
      address: quote.address,
      city: quote.city,
      state: quote.state,
      expiresAt: expiresAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Quote saved! Check your email for a link to resume.',
      resumeUrl, // Include for dev/testing
    });
  } catch (error) {
    logger.error('Error saving quote draft', error);
    return NextResponse.json(
      { error: 'Failed to save quote. Please try again.' },
      { status: 500 }
    );
  }
}
