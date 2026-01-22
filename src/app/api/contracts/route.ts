import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db';
import { getQuote } from '@/db/queries';
import { documensoAdapter } from '@/lib/integrations/adapters';
import { logger } from '@/lib/utils';
import { z } from 'zod';

const createContractSchema = z.object({
  quoteId: z.string().uuid(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
});

/**
 * POST /api/contracts
 * Generate a contract document for signing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createContractSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { quoteId, customerName, customerEmail } = validation.data;

    // Get quote
    const quote = await getQuote(quoteId);
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Get selected tier if any
    let selectedTierData = null;
    if (quote.selectedTier) {
      selectedTierData = await db.query.pricingTiers.findFirst({
        where: eq(schema.pricingTiers.tier, quote.selectedTier),
      });
    }

    // Create document via Documenso (or stub)
    const document = await documensoAdapter.createDocument({
      quoteId,
      customerName,
      customerEmail,
      propertyAddress: `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`,
      packageTier: selectedTierData?.displayName ?? 'Standard',
      totalPrice: parseFloat(quote.totalPrice || '0'),
      depositAmount: parseFloat(quote.depositAmount || '0'),
    });

    // Store contract record
    const contract = await db
      .insert(schema.contracts)
      .values({
        quoteId,
        customerEmail,
        documensoDocumentId: document.id.toString(),
        status: 'pending',
      })
      .returning();

    logger.info(`Contract created for quote ${quoteId}`);

    return NextResponse.json({
      contract: {
        id: contract[0].id,
        status: contract[0].status,
        signingUrl: document.signingUrl,
      },
    });
  } catch (error) {
    logger.error('Error creating contract', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}
