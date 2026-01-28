import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

/**
 * Schema for manual roof measurement entry
 */
const manualMeasurementSchema = z.object({
  sqftTotal: z
    .number()
    .min(500, 'Roof size must be at least 500 sq ft')
    .max(15000, 'Roof size must be less than 15,000 sq ft'),
  pitchPrimary: z
    .number()
    .min(1, 'Pitch must be at least 1')
    .max(20, 'Pitch must be less than 20'),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  source: z.literal('manual'),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotes/[id]/manual-measurement
 * Accepts manual roof measurement entry when satellite measurement times out
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: quoteId } = await params;

    // Parse the request body
    const body = await request.json();
    const parsed = manualMeasurementSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { error: `Invalid measurement data: ${errors}` },
        { status: 400 }
      );
    }

    // Fetch the quote
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
        { status: 400 }
      );
    }

    const { sqftTotal, pitchPrimary, complexity } = parsed.data;

    // Update the quote with manual measurement data
    await db
      .update(schema.quotes)
      .set({
        sqftTotal: sqftTotal.toString(),
        pitchPrimary: pitchPrimary.toString(),
        complexity,
        status: 'measured',
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    // Create a measurement record with manual source
    await db.insert(schema.measurements).values({
      quoteId,
      vendor: 'manual',
      vendorJobId: `manual-${Date.now()}`,
      status: 'complete',
      sqftTotal: sqftTotal.toString(),
      pitchPrimary: pitchPrimary.toString(),
      complexity,
      rawResponse: {
        source: 'manual_entry',
        enteredAt: new Date().toISOString(),
      },
    });

    logger.info('Manual measurement saved', {
      quoteId,
      sqftTotal,
      pitchPrimary,
      complexity,
    });

    return NextResponse.json({
      success: true,
      quoteId,
      measurement: {
        sqftTotal,
        pitchPrimary,
        complexity,
        source: 'manual',
      },
      nextStep: `/quote/${quoteId}/customize`,
    });
  } catch (error) {
    logger.error('Error saving manual measurement', error);
    return NextResponse.json(
      { error: 'Failed to save measurement' },
      { status: 500 }
    );
  }
}
