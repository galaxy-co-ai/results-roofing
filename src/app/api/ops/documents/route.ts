import { NextRequest, NextResponse } from 'next/server';
import { db, schema, eq, desc } from '@/db/index';
import { sql } from 'drizzle-orm';
import { logger } from '@/lib/utils';

/**
 * GET /api/ops/documents
 * List documents, optionally filtered by folder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');

    // Build query
    let query = db
      .select()
      .from(schema.documents)
      .orderBy(desc(schema.documents.createdAt));

    if (folder) {
      query = query.where(eq(schema.documents.folder, folder)) as typeof query;
    }

    const documents = await query.limit(100);

    // Get folder stats
    const folderStatsRaw = await db
      .select({
        folder: schema.documents.folder,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.documents)
      .groupBy(schema.documents.folder);

    // Ensure all default folders are present
    const defaultFolders = ['deposits', 'contracts', 'invoices', 'general'];
    const folderStats = defaultFolders.map((f) => ({
      folder: f,
      count: folderStatsRaw.find((s) => s.folder === f)?.count || 0,
    }));

    return NextResponse.json({
      documents,
      folderStats,
    });
  } catch (error) {
    logger.error('Failed to fetch documents', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/documents
 * Create a new document record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const [document] = await db
      .insert(schema.documents)
      .values({
        name: body.name,
        type: body.type || 'other',
        status: body.status || 'pending',
        folder: body.folder || 'general',
        quoteId: body.quoteId || null,
        leadId: body.leadId || null,
        customerName: body.customerName || null,
        customerEmail: body.customerEmail || null,
        propertyAddress: body.propertyAddress || null,
        docusealSubmissionId: body.docusealSubmissionId || null,
        docusealSlug: body.docusealSlug || null,
        docusealEmbedSrc: body.docusealEmbedSrc || null,
        docusealDocumentUrl: body.docusealDocumentUrl || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      })
      .returning();

    logger.info('Document created', { documentId: document.id, type: document.type });

    return NextResponse.json({ document });
  } catch (error) {
    logger.error('Failed to create document', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
