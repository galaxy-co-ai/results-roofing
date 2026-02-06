import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

const confirmSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().nullable().optional(),
});

/**
 * POST /api/quotes/[id]/confirm
 * Confirms a booking without payment - saves customer info
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;

    const body = await request.json();
    const validation = confirmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { fullName, email, phone } = validation.data;

    // Parse name
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Fetch the quote
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Verify quote has scheduling info
    if (!quote.scheduledDate || !quote.scheduledSlotId) {
      return NextResponse.json(
        { error: 'Quote must be scheduled before confirming' },
        { status: 400 }
      );
    }

    const timestamp = new Date();

    // Update the quote with customer info and mark as confirmed
    await db
      .update(schema.quotes)
      .set({
        status: 'confirmed',
        updatedAt: timestamp,
      })
      .where(eq(schema.quotes.id, quoteId));

    // Update lead if exists
    if (quote.leadId) {
      const lead = await db.query.leads.findFirst({
        where: eq(schema.leads.id, quote.leadId),
      });

      if (lead) {
        await db
          .update(schema.leads)
          .set({
            email: email,
            firstName: firstName || lead.firstName,
            lastName: lastName || lead.lastName,
            phone: phone || lead.phone,
            updatedAt: timestamp,
          })
          .where(eq(schema.leads.id, quote.leadId));
      }
    }

    logger.info('Booking confirmed', {
      quoteId,
      email,
      name: fullName,
    });

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed',
      quoteId,
    });
  } catch (error) {
    logger.error('Failed to confirm booking', error);
    return NextResponse.json(
      { error: 'Failed to confirm booking. Please try again.' },
      { status: 500 }
    );
  }
}
