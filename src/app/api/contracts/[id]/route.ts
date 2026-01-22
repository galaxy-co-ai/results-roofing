import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db';
import { documensoAdapter } from '@/lib/integrations/adapters';
import { logger } from '@/lib/utils';

/**
 * GET /api/contracts/[id]
 * Get contract status and signing URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contract = await db.query.contracts.findFirst({
      where: eq(schema.contracts.id, id),
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Get signing URL from Documenso (if not already signed)
    let signingUrl = null;
    if (contract.status === 'pending' && contract.documensoDocumentId) {
      signingUrl = await documensoAdapter.getSigningUrl(
        contract.documensoDocumentId,
        '' // Would need recipient email
      );
    }

    return NextResponse.json({
      contract: {
        id: contract.id,
        quoteId: contract.quoteId,
        status: contract.status,
        signingUrl,
        signedAt: contract.signedAt,
        createdAt: contract.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error fetching contract', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}
