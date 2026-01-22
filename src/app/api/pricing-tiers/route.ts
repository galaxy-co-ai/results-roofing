import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';

/**
 * GET /api/pricing-tiers
 * Returns all active pricing tiers sorted by order
 * 
 * Cached for 1 hour via TanStack Query on client
 */
export async function GET() {
  try {
    const tiers = await db.query.pricingTiers.findMany({
      where: eq(schema.pricingTiers.isActive, true),
      orderBy: (tiers, { asc }) => [asc(tiers.sortOrder)],
    });

    return NextResponse.json(tiers, {
      headers: {
        // Cache for 1 hour at CDN level
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    logger.error('Error fetching pricing tiers', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing tiers' },
      { status: 500 }
    );
  }
}
