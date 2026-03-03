import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq } from '@/db';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

/** Human-readable names for GAF asset keys */
const GAF_ASSET_LABELS: Record<string, string> = {
  Report: 'GAF Roof Measurement Report',
  HomeownerReport: 'Homeowner Report',
  Diagram: 'Roof Diagram',
  Cover: 'Report Cover',
};

interface DocumentResponse {
  id: string;
  name: string;
  type: string;
  url: string | null;
  source: 'gaf' | 'manual';
  status?: string;
  createdAt: string;
}

/**
 * GET /api/portal/documents?orderId=xxx
 * Returns real documents for a customer's order:
 *   - GAF measurement assets (PDFs/images from Vercel Blob)
 *   - Manual documents (contracts, warranties, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    if (DEV_BYPASS_ENABLED) {
      userId = MOCK_USER.id;
    } else {
      const authResult = await auth();
      userId = authResult.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = request.nextUrl.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ documents: [], measurementStatus: null });
    }

    // Fetch the order to get the quoteId (and verify ownership)
    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
    });

    if (!order) {
      return NextResponse.json({ documents: [], measurementStatus: null });
    }

    // Verify the user owns this order (by clerkUserId)
    if (!DEV_BYPASS_ENABLED && order.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const quoteId = order.quoteId;
    const documents: DocumentResponse[] = [];

    // 1. Fetch GAF measurement assets
    const measurement = await db.query.measurements.findFirst({
      where: eq(schema.measurements.quoteId, quoteId),
    });

    const measurementStatus = measurement?.status ?? null;

    if (measurement?.gafAssets) {
      const assets = measurement.gafAssets;
      for (const [key, url] of Object.entries(assets)) {
        documents.push({
          id: `gaf-${key.toLowerCase()}`,
          name: GAF_ASSET_LABELS[key] ?? key,
          type: 'measurement',
          url,
          source: 'gaf',
          createdAt: (measurement.completedAt ?? measurement.requestedAt).toISOString(),
        });
      }
    }

    // 2. Fetch manual documents (contracts, warranties, etc.)
    const manualDocs = await db.query.documents.findMany({
      where: eq(schema.documents.quoteId, quoteId),
    });

    for (const doc of manualDocs) {
      documents.push({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.docusealDocumentUrl,
        source: 'manual',
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
      });
    }

    return NextResponse.json({ documents, measurementStatus });
  } catch (error) {
    logger.error('Error fetching portal documents', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
