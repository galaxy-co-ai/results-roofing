import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';

const contractSchema = z.object({
  signature: z.string().min(3, 'Signature must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
  signedAt: z.string().datetime({ message: 'Invalid date format' }).optional(),
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

    const { signature, email, signedAt } = result.data;

    // Use email from request (provided during signature)
    const customerEmail = email;

    // Check if contract already exists for this quote
    const existingContract = await db.query.contracts.findFirst({
      where: eq(schema.contracts.quoteId, quoteId),
    });

    const signedAtDate = signedAt ? new Date(signedAt) : new Date();

    if (existingContract) {
      // Update existing contract with email and signed status
      await db
        .update(schema.contracts)
        .set({
          customerEmail,
          status: 'signed',
          signatureText: signature,
          signedAt: signedAtDate,
          updatedAt: new Date(),
        })
        .where(eq(schema.contracts.quoteId, quoteId));
    } else {
      // Create new contract record
      await db.insert(schema.contracts).values({
        quoteId,
        customerEmail,
        status: 'signed',
        signatureText: signature,
        signedAt: signedAtDate,
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

    // Also update the lead with the email if it doesn't have one
    if (quote.leadId && !quote.lead?.email) {
      await db
        .update(schema.leads)
        .set({
          email: customerEmail,
          updatedAt: new Date(),
        })
        .where(eq(schema.leads.id, quote.leadId));
    }

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
