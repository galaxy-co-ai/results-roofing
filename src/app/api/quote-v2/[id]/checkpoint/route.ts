import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';

/**
 * Checkpoint schema for validation
 */
const checkpointSchema = z.object({
  state: z.string(),
  context: z.object({
    quoteId: z.string().nullable(),
    address: z.object({
      streetAddress: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      formattedAddress: z.string(),
      lat: z.number(),
      lng: z.number(),
      placeId: z.string(),
    }).nullable(),
    propertyConfirmed: z.boolean(),
    sqftEstimate: z.number().nullable(),
    priceRanges: z.array(z.object({
      tierId: z.string(),
      tierName: z.string(),
      tier: z.enum(['good', 'better', 'best']),
      priceMin: z.number(),
      priceMax: z.number(),
      priceEstimate: z.number(),
    })).nullable(),
    selectedTier: z.enum(['good', 'better', 'best']).nullable(),
    selectedTierId: z.string().nullable(),
    scheduledDate: z.string().nullable(), // ISO string
    timeSlot: z.enum(['morning', 'afternoon']).nullable(),
    phone: z.string(),
    email: z.string(),
    smsConsent: z.boolean(),
    paymentIntentId: z.string().nullable(),
    paymentStatus: z.enum(['idle', 'processing', 'succeeded', 'failed']),
  }).partial(),
});

/**
 * GET /api/quote-v2/[id]/checkpoint
 * Retrieve saved wizard state for a quote
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;

  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
    columns: { wizardCheckpoint: true },
  });

  if (!quote?.wizardCheckpoint) {
    return NextResponse.json(
      { error: 'Checkpoint not found' },
      { status: 404 }
    );
  }

  const checkpoint = quote.wizardCheckpoint as { state: string; context: Record<string, unknown>; timestamp: string };

  return NextResponse.json({
    quoteId,
    state: checkpoint.state,
    context: checkpoint.context,
    savedAt: checkpoint.timestamp,
  });
}

/**
 * POST /api/quote-v2/[id]/checkpoint
 * Save wizard state for a quote
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;

  try {
    const body = await request.json();

    // Validate the checkpoint data
    const result = checkpointSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid checkpoint data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { state, context } = result.data;

    // Save checkpoint to quotes table
    await db
      .update(schema.quotes)
      .set({
        wizardCheckpoint: {
          state,
          context,
          timestamp: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    return NextResponse.json({
      success: true,
      quoteId,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving checkpoint:', error);
    return NextResponse.json(
      { error: 'Failed to save checkpoint' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quote-v2/[id]/checkpoint
 * Clear saved wizard state for a quote
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;

  await db
    .update(schema.quotes)
    .set({
      wizardCheckpoint: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.quotes.id, quoteId));

  return NextResponse.json({
    success: true,
    deleted: true,
  });
}
