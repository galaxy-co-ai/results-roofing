import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
 * In-memory storage for development
 * In production, this would be stored in Redis or the database
 */
const checkpoints = new Map<string, { state: string; context: Record<string, unknown>; timestamp: Date }>();

/**
 * GET /api/quote-v2/[id]/checkpoint
 * Retrieve saved wizard state for a quote
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;

  const checkpoint = checkpoints.get(quoteId);

  if (!checkpoint) {
    return NextResponse.json(
      { error: 'Checkpoint not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    quoteId,
    state: checkpoint.state,
    context: checkpoint.context,
    savedAt: checkpoint.timestamp.toISOString(),
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

    // Save checkpoint
    checkpoints.set(quoteId, {
      state,
      context: context as Record<string, unknown>,
      timestamp: new Date(),
    });

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

  const existed = checkpoints.has(quoteId);
  checkpoints.delete(quoteId);

  return NextResponse.json({
    success: true,
    deleted: existed,
  });
}
