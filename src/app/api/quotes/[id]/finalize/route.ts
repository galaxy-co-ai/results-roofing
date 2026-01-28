import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { TCPA_CONSENT_TEXT } from '@/lib/constants';
import { logger } from '@/lib/utils';

/**
 * Zod schema for the finalize checkout request
 * Consolidates contact, schedule, and financing data
 */
const finalizeSchema = z.object({
  // Contact info
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s()+-]+$/, 'Invalid phone number format'),
  smsConsent: z.boolean().default(false),

  // Schedule info
  scheduledDate: z.string().datetime({ message: 'Invalid date format' }),
  timeSlot: z.enum(['morning', 'afternoon'], {
    errorMap: () => ({ message: 'Please select a time slot' }),
  }),
  timezone: z.string().default('America/Chicago'),

  // Financing info
  financingTerm: z.enum(['pay-full', '12', '24'], {
    errorMap: () => ({ message: 'Please select a payment option' }),
  }),
});

export type FinalizeCheckoutInput = z.infer<typeof finalizeSchema>;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotes/[id]/finalize
 * 
 * Consolidates checkout into a single API call:
 * - Saves contact info (phone) to lead
 * - Records SMS consent if given
 * - Sets scheduled date and time slot
 * - Sets financing selection
 * 
 * This replaces the previous 3 sequential calls to:
 * - /api/quotes/[id]/contact
 * - /api/quotes/[id]/schedule
 * - /api/quotes/[id]/financing
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();

  try {
    const { id: quoteId } = await params;
    const body = await request.json();

    // Validate all input at once
    const parsed = finalizeSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten();
      return NextResponse.json(
        {
          error: 'Invalid checkout data',
          details: errors.fieldErrors,
        },
        { status: 400 }
      );
    }

    const { phone, smsConsent, scheduledDate, timeSlot, financingTerm } = parsed.data;

    // Fetch the quote with validation
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check if quote is expired
    if (quote.expiresAt && new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This quote has expired. Please request a new quote.' },
        { status: 410 }
      );
    }

    // Check if quote has a selected tier (required for checkout)
    if (!quote.selectedTier) {
      return NextResponse.json(
        { error: 'Please select a package before checkout' },
        { status: 400 }
      );
    }

    if (!quote.leadId) {
      return NextResponse.json(
        { error: 'Quote has no associated lead' },
        { status: 400 }
      );
    }

    // Validate scheduled date is in the future
    const scheduledDateObj = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduledDateObj < today) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Calculate monthly payment if financing selected
    let monthlyPayment: number | null = null;
    const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;

    if (financingTerm !== 'pay-full' && totalPrice > 0) {
      const months = parseInt(financingTerm);
      monthlyPayment = Math.round(totalPrice / months);
    }

    // Generate slot ID for scheduled time
    const slotId = `${scheduledDate}-${timeSlot}`;

    // Execute all updates in a transaction for atomicity
    await db.transaction(async (tx) => {
      // 1. Update lead with phone number
      await tx
        .update(schema.leads)
        .set({
          phone,
          updatedAt: new Date(),
        })
        .where(eq(schema.leads.id, quote.leadId!));

      // 2. Record SMS consent if given
      if (smsConsent) {
        const ipAddress =
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await tx.insert(schema.smsConsents).values({
          leadId: quote.leadId!,
          phone,
          consentGiven: true,
          consentSource: 'checkout_finalize',
          consentText: TCPA_CONSENT_TEXT,
          ipAddress,
          userAgent,
        });
      }

      // 3. Update quote with schedule and financing in one operation
      await tx
        .update(schema.quotes)
        .set({
          // Schedule fields
          scheduledDate: scheduledDateObj,
          scheduledSlotId: slotId,
          // Financing fields
          financingTerm,
          financingMonthlyPayment: monthlyPayment?.toString() || null,
          financingStatus: financingTerm === 'pay-full' ? null : 'pending',
          // Status update - move to 'scheduled' state
          status: 'scheduled',
          updatedAt: new Date(),
        })
        .where(eq(schema.quotes.id, quoteId));
    });

    const duration = Date.now() - startTime;
    logger.info('Checkout finalized', {
      quoteId,
      scheduledDate,
      timeSlot,
      financingTerm,
      monthlyPayment,
      smsConsent,
      durationMs: duration,
    });

    return NextResponse.json({
      success: true,
      quoteId,
      data: {
        scheduledDate,
        timeSlot,
        slotId,
        financingTerm,
        monthlyPayment,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error finalizing checkout', { error, durationMs: duration });

    return NextResponse.json(
      { error: 'Failed to complete checkout. Please try again.' },
      { status: 500 }
    );
  }
}
