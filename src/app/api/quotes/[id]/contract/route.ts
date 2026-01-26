import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';

const contractSchema = z.object({
  signature: z.string().min(3, 'Signature must be at least 3 characters'),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
  signedAt: z.string().datetime({ message: 'Invalid date format' }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;

    // Verify quote exists and has a selected tier
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
      with: {
        lead: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!quote.selectedTier) {
      return NextResponse.json(
        { error: 'Please select a package first' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = contractSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { signedAt } = result.data;

    // Get customer email from lead or use placeholder
    const customerEmail = quote.lead?.email || `quote-${quoteId}@placeholder.local`;

    // Check if contract already exists for this quote
    const existingContract = await db.query.contracts.findFirst({
      where: eq(schema.contracts.quoteId, quoteId),
    });

    if (existingContract) {
      // Update existing contract
      await db
        .update(schema.contracts)
        .set({
          status: 'signed',
          signedAt: new Date(signedAt),
          updatedAt: new Date(),
        })
        .where(eq(schema.contracts.quoteId, quoteId));
    } else {
      // Create new contract record
      await db.insert(schema.contracts).values({
        quoteId,
        customerEmail,
        status: 'signed',
        signedAt: new Date(signedAt),
      });
    }

    // Update quote status to signed
    await db
      .update(schema.quotes)
      .set({
        status: 'signed',
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    return NextResponse.json({
      success: true,
      message: 'Contract signed successfully',
    });
  } catch (error) {
    console.error('Contract signing error:', error);
    return NextResponse.json(
      { error: 'Failed to save contract' },
      { status: 500 }
    );
  }
}
