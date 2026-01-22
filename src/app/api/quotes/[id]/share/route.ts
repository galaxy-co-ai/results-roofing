import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db';
import { getQuote } from '@/db/queries';
import { logger } from '@/lib/utils';
import crypto from 'crypto';

/**
 * POST /api/quotes/[id]/share
 * Generate a shareable link for a quote
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get quote
    const quote = await getQuote(id);
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check for existing valid share
    const existingShare = await db.query.quoteShares.findFirst({
      where: eq(schema.quoteShares.quoteId, id),
    });

    if (existingShare && new Date(existingShare.expiresAt) > new Date()) {
      // Return existing share if still valid
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quote/share/${existingShare.token}`;
      return NextResponse.json({
        shareUrl,
        token: existingShare.token,
        expiresAt: existingShare.expiresAt,
      });
    }

    // Generate new share token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create share record
    await db.insert(schema.quoteShares).values({
      quoteId: id,
      token,
      expiresAt,
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quote/share/${token}`;

    logger.info(`Quote share created for quote ${id}`);

    return NextResponse.json({
      shareUrl,
      token,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    logger.error('Error creating quote share', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
