import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import {
  generateResumeToken,
  getResumeTokenExpiry,
} from '@/lib/quote-resume';
import { resendAdapter } from '@/lib/integrations/adapters/resend';
import { rateLimiters, getRequestIdentifier, rateLimitHeaders } from '@/lib/api/rate-limit';

const saveDraftSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quote-v2/[id]/save-draft
 * Saves a resume token for V2 wizard and sends resume email.
 * The wizard checkpoint is already persisted on the quote row.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const identifier = getRequestIdentifier(request);
    const rateLimitResult = rateLimiters.quoteOperations.check(identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const { id: quoteId } = await params;
    const body = await request.json();

    const parsed = saveDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Verify quote exists
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check for existing draft record
    const existingDraft = await db.query.quoteDrafts.findFirst({
      where: eq(schema.quoteDrafts.quoteId, quoteId),
    });

    let resumeToken: string;

    // V2 stores checkpoint on the quote itself, so draftState just records
    // that this is a V2 quote for the resume handler
    const draftState = {
      version: 'v2' as const,
      currentStage: 1 as const,
      currentStep: 0,
      lastUpdatedAt: new Date().toISOString(),
    };

    if (existingDraft) {
      resumeToken = existingDraft.resumeToken;
      await db
        .update(schema.quoteDrafts)
        .set({
          email,
          draftState,
          expiresAt: getResumeTokenExpiry(),
          updatedAt: new Date(),
        })
        .where(eq(schema.quoteDrafts.id, existingDraft.id));
      logger.info('V2 quote draft updated', { quoteId, email });
    } else {
      resumeToken = generateResumeToken();
      await db.insert(schema.quoteDrafts).values({
        quoteId,
        email,
        resumeToken,
        draftState,
        expiresAt: getResumeTokenExpiry(),
      });
      logger.info('V2 quote draft created', { quoteId, email });
    }

    // Update lead email if not set
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

    // Build resume URL pointing to V2 flow
    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://resultsroofing.com';
    const resumeUrl = `${base}/quote-v2/${quoteId}?token=${encodeURIComponent(resumeToken)}`;

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
      resumeUrl,
    });
  } catch (error) {
    logger.error('Error saving V2 quote draft', error);
    return NextResponse.json(
      { error: 'Failed to save quote. Please try again.' },
      { status: 500 }
    );
  }
}
