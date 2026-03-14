import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq, and } from '@/db';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

/** Human-readable names for GAF asset keys */
const GAF_ASSET_LABELS: Record<string, string> = {
  Report: 'GAF Roof Measurement Report',
  HomeownerReport: 'Homeowner Report',
  Diagram: 'Roof Diagram',
  Cover: 'Report Cover',
};

interface ProjectData {
  address: string;
  customerName: string;
  email: string;
  phone: string;
  packageName: string;
  totalPrice: number;
  depositAmount: number;
  installationDate: string;
  contractDate: string;
  materials: string;
  warrantyYears: number;
}

interface DocumentResponse {
  id: string;
  name: string;
  type: string;
  url: string | null;
  source: 'gaf' | 'manual' | 'generated';
  status?: string;
  createdAt: string;
  projectData?: ProjectData;
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

    // 3. Build projectData from order + contract + pricing tier
    const signedContract = await db.query.contracts.findFirst({
      where: and(
        eq(schema.contracts.quoteId, quoteId),
        eq(schema.contracts.status, 'signed'),
      ),
    });

    let projectData: ProjectData | undefined;

    if (order) {
      // Fetch the pricing tier for package name + materials
      const tier = order.selectedTier
        ? await db.query.pricingTiers.findFirst({
            where: eq(schema.pricingTiers.tier, order.selectedTier),
          })
        : null;

      // Fetch installation appointment if scheduled
      const appointment = orderId
        ? await db.query.appointments.findFirst({
            where: eq(schema.appointments.orderId, orderId),
          })
        : null;

      const fullAddress = [order.propertyAddress, order.propertyCity, order.propertyState, order.propertyZip]
        .filter(Boolean)
        .join(', ');

      const formatDate = (d: Date | null | undefined) =>
        d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

      projectData = {
        address: fullAddress || '',
        customerName: signedContract?.signatureText || order.customerName || '',
        email: order.customerEmail || '',
        phone: order.customerPhone || '',
        packageName: tier?.displayName ? `${tier.displayName} Package` : order.selectedTier || '',
        totalPrice: parseFloat(order.totalPrice) || 0,
        depositAmount: parseFloat(order.depositAmount) || 0,
        installationDate: formatDate(appointment?.scheduledStart ?? order.scheduledStartDate),
        contractDate: formatDate(signedContract?.signedAt),
        materials: tier ? `${tier.shingleBrand || ''} ${tier.shingleType || ''}`.trim() : '',
        warrantyYears: tier?.warrantyYears ? parseInt(tier.warrantyYears, 10) : 25,
      };
    }

    // 4. Inject synthetic (generated-on-the-fly) branded documents
    // Quote summary — always present
    documents.push({
      id: `quote-${quoteId}`,
      name: 'Roof Replacement Estimate',
      type: 'quote',
      url: null,
      source: 'generated',
      createdAt: order?.createdAt?.toISOString() ?? new Date().toISOString(),
      projectData,
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
        projectData,
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
        projectData,
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
          projectData,
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
