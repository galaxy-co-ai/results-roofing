import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db/index';

/**
 * DEBUG: Test database write/read consistency
 * GET /api/debug/db-test?quoteId=xxx
 *
 * This tests if writes are actually persisting to the database.
 * DELETE THIS FILE AFTER DEBUGGING!
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quoteId = searchParams.get('quoteId');

  if (!quoteId) {
    return NextResponse.json({ error: 'quoteId required' }, { status: 400 });
  }

  // Extract host from DATABASE_URL for comparison
  const dbUrlHost = process.env.DATABASE_URL?.match(/@([^/]+)\//)?.[1] || 'unknown';

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    quoteId,
    databaseUrlHost: dbUrlHost,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  try {
    // Step 1: Read initial state
    const initialQuote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!initialQuote) {
      return NextResponse.json({
        error: 'Quote not found',
        quoteId,
        databaseUrl: results.databaseUrl
      }, { status: 404 });
    }

    results.step1_initialRead = {
      selectedTier: initialQuote.selectedTier,
      scheduledDate: initialQuote.scheduledDate,
      scheduledSlotId: initialQuote.scheduledSlotId,
      status: initialQuote.status,
      updatedAt: initialQuote.updatedAt,
    };

    // Step 2: Update with a test value
    const testTier = initialQuote.selectedTier === 'good' ? 'better' : 'good';
    const testTimestamp = new Date();

    const [updateResult] = await db
      .update(schema.quotes)
      .set({
        selectedTier: testTier,
        tierSelectedAt: testTimestamp,
        updatedAt: testTimestamp,
      })
      .where(eq(schema.quotes.id, quoteId))
      .returning();

    results.step2_updateReturning = {
      selectedTier: updateResult?.selectedTier,
      tierSelectedAt: updateResult?.tierSelectedAt,
      updatedAt: updateResult?.updatedAt,
    };

    // Step 3: Read again immediately
    const afterUpdateQuote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    results.step3_immediateRead = {
      selectedTier: afterUpdateQuote?.selectedTier,
      scheduledDate: afterUpdateQuote?.scheduledDate,
      scheduledSlotId: afterUpdateQuote?.scheduledSlotId,
      status: afterUpdateQuote?.status,
      updatedAt: afterUpdateQuote?.updatedAt,
    };

    // Step 4: Verify consistency
    results.step4_analysis = {
      writeReturned: updateResult?.selectedTier,
      readAfterWrite: afterUpdateQuote?.selectedTier,
      consistent: updateResult?.selectedTier === afterUpdateQuote?.selectedTier,
      tierChanged: initialQuote.selectedTier !== afterUpdateQuote?.selectedTier,
    };

    // Step 5: Restore original value (cleanup)
    if (initialQuote.selectedTier !== updateResult?.selectedTier) {
      await db
        .update(schema.quotes)
        .set({
          selectedTier: initialQuote.selectedTier,
          tierSelectedAt: initialQuote.tierSelectedAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.quotes.id, quoteId));
      results.step5_restored = true;
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      ...results,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
