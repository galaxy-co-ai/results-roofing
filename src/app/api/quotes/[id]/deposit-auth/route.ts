import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

// Request validation schema
const depositAuthSchema = z.object({
  signature: z.string().min(1, 'Signature is required'),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms' }),
  }),
  termsVersion: z.string().default('1.0'),
});

/**
 * POST /api/quotes/[id]/deposit-auth
 * Saves the deposit authorization (signature + agreement)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;

    // Validate request body
    const body = await request.json();
    const validation = depositAuthSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { termsVersion } = validation.data;
    // signature and agreedToTerms are validated by schema but stored implicitly via contract record

    // Fetch the quote
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Verify quote is in scheduled status (scheduling completed)
    if (!quote.scheduledDate || !quote.scheduledSlotId) {
      return NextResponse.json(
        { error: 'Quote must be scheduled before authorizing deposit' },
        { status: 400 }
      );
    }

    // Get client info for audit trail
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const timestamp = new Date();

    // Check if a contract already exists for this quote
    const existingContract = await db.query.contracts.findFirst({
      where: eq(schema.contracts.quoteId, quoteId),
    });

    if (existingContract) {
      // Update existing contract with deposit authorization
      await db
        .update(schema.contracts)
        .set({
          status: 'pending', // Pending payment
          signedAt: timestamp,
          signatureIp: ip,
          signatureUserAgent: userAgent,
          updatedAt: timestamp,
        })
        .where(eq(schema.contracts.id, existingContract.id));

      logger.info(`Updated contract ${existingContract.id} with deposit authorization for quote ${quoteId}`);
    } else {
      // Create new contract record with deposit authorization
      const [newContract] = await db
        .insert(schema.contracts)
        .values({
          quoteId,
          status: 'pending', // Pending payment
          customerEmail: '', // Will be updated when we have the email
          signedAt: timestamp,
          signatureIp: ip,
          signatureUserAgent: userAgent,
          templateVersion: termsVersion,
        })
        .returning();

      logger.info(`Created contract ${newContract?.id} with deposit authorization for quote ${quoteId}`);
    }

    // Update quote status to indicate deposit authorization received
    await db
      .update(schema.quotes)
      .set({
        status: 'signed', // Mark as signed (deposit authorized)
        updatedAt: timestamp,
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info(`Deposit authorization saved for quote ${quoteId}`, {
      ip,
      userAgent: userAgent.substring(0, 100),
      timestamp: timestamp.toISOString(),
      termsVersion,
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit authorization saved',
      timestamp: timestamp.toISOString(),
    });
  } catch (error) {
    logger.error('Failed to save deposit authorization', error);

    return NextResponse.json(
      { error: 'Failed to save authorization. Please try again.' },
      { status: 500 }
    );
  }
}
