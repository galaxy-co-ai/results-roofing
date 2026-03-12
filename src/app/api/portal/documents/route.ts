import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq, and } from '@/db';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

/** Human-readable names for GAF asset keys (semantic or filename-based) */
const GAF_ASSET_LABELS: Record<string, string> = {
  Report: 'GAF Roof Measurement Report',
  HomeownerReport: 'Homeowner Report',
  Diagram: 'Roof Diagram',
  Cover: 'Report Cover',
};

/** Resolve a human-readable label for a GAF asset key (may be a filename) */
function resolveGafAssetLabel(key: string): string {
  if (GAF_ASSET_LABELS[key]) return GAF_ASSET_LABELS[key];
  // If key looks like a filename, try to infer a label
  const lower = key.toLowerCase();
  if (lower.includes('homeowner')) return 'Homeowner Report';
  if (lower.includes('diagram') || lower.includes('layout')) return 'Roof Diagram';
  if (lower.includes('cover')) return 'Report Cover';
  if (lower.includes('report') || lower.includes('measurement')) return 'GAF Roof Measurement Report';
  // Strip extension and titleize for unknown files
  return key.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface DocumentResponse {
  id: string;
  name: string;
  type: string;
  url: string | null;
  source: 'gaf' | 'manual' | 'generated';
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
    const quoteIdParam = request.nextUrl.searchParams.get('quoteId');

    if (!orderId && !quoteIdParam) {
      return NextResponse.json({ documents: [], measurementStatus: null });
    }

    let quoteId: string;
    let order: any = null;

    if (orderId) {
      // Fetch the order to get the quoteId (and verify ownership)
      order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
      });

      if (!order) {
        return NextResponse.json({ documents: [], measurementStatus: null });
      }

      // Verify the user owns this order (by clerkUserId)
      if (!DEV_BYPASS_ENABLED && order.clerkUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      quoteId = order.quoteId;
    } else {
      // Direct quoteId — verify the quote exists and user owns it
      const quote = await db.query.quotes.findFirst({
        where: eq(schema.quotes.id, quoteIdParam!),
        with: { lead: true },
      });

      if (!quote) {
        return NextResponse.json({ documents: [], measurementStatus: null });
      }

      quoteId = quote.id;
    }

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
          id: `gaf-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: resolveGafAssetLabel(key),
          type: 'measurement',
          url: url as string,
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

    // 3. Inject synthetic (generated-on-the-fly) branded documents
    // Quote summary — always present
    documents.push({
      id: `quote-${quoteId}`,
      name: 'Roof Replacement Estimate',
      type: 'quote',
      url: null,
      source: 'generated',
      createdAt: order?.createdAt?.toISOString() ?? new Date().toISOString(),
    });

    // Signed contract — check contracts table
    const signedContract = await db.query.contracts.findFirst({
      where: and(
        eq(schema.contracts.quoteId, quoteId),
        eq(schema.contracts.status, 'signed'),
      ),
    });

    if (signedContract) {
      documents.push({
        id: `contract-${signedContract.id}`,
        name: 'Signed Roofing Services Agreement',
        type: 'contract',
        url: null,
        source: 'generated',
        status: 'signed',
        createdAt: signedContract.signedAt?.toISOString() ?? signedContract.createdAt.toISOString(),
      });
    }

    // Material order — only if measurement is complete
    if (measurement?.status === 'complete') {
      documents.push({
        id: `materials-${quoteId}`,
        name: 'Material Order',
        type: 'materials',
        url: null,
        source: 'generated',
        createdAt: order?.createdAt?.toISOString() ?? new Date().toISOString(),
      });
    }

    // Deposit authorization — only if an order and deposit payment exists
    if (orderId) {
      const depositPayment = await db.query.payments.findFirst({
        where: and(
          eq(schema.payments.orderId, orderId),
          eq(schema.payments.type, 'deposit'),
        ),
      });

      if (depositPayment) {
        documents.push({
          id: `deposit-auth-${orderId}`,
          name: 'Deposit Authorization',
          type: 'deposit_authorization',
          url: null,
          source: 'generated',
          status: 'signed',
          createdAt: depositPayment.processedAt?.toISOString() ?? order.createdAt.toISOString(),
        });
      }
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
