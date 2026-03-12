/**
 * POST /api/webhooks/gaf
 *
 * GAF QuickMeasure callback handler.
 * Called by GAF ~1hr after order placement with measurement results.
 *
 * Auth: client_id + client_secret headers (NOT bearer token)
 * Flow: validate auth -> parse payload -> download assets -> store in Blob -> update measurement
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { db, schema, eq } from '@/db/index';
import { gafAdapter } from '@/lib/integrations/adapters/gaf';
import { logger } from '@/lib/utils';

// ============================================================
// Auth validation
// ============================================================

function validateWebhookAuth(request: NextRequest): boolean {
  const clientId = request.headers.get('client_id') || request.headers.get('Client_Id');
  const clientSecret = request.headers.get('client_secret') || request.headers.get('Client_Secret');

  return (
    clientId === process.env.GAF_WEBHOOK_CLIENT_ID &&
    clientSecret === process.env.GAF_WEBHOOK_CLIENT_SECRET
  );
}

// ============================================================
// Callback payload shape
// ============================================================

interface GAFCallbackPayload {
  SubscriberOrderNumber?: string;
  GAFOrderNumber?: number;
  RoofMeasurement?: {
    TotalArea?: number;
    PredominantPitch?: string;
    RidgeLength?: number;
    HipLength?: number;
    ValleyLength?: number;
    EaveRakeLength?: number;
    [key: string]: unknown;
  };
  Reports?: Array<{
    FileName?: string;
    FileType?: string;
    [key: string]: unknown;
  }>;
  ProblemCode?: string;
  ProblemDescription?: string;
  Status?: string;
  [key: string]: unknown;
}

// ============================================================
// Helpers
// ============================================================

/** Infer a semantic asset key from the filename for portal display */
function inferAssetKey(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.includes('homeowner')) return 'HomeownerReport';
  if (lower.includes('diagram') || lower.includes('layout')) return 'Diagram';
  if (lower.includes('cover')) return 'Cover';
  if (lower.includes('report') || lower.includes('measurement')) return 'Report';
  return null;
}

// ============================================================
// Route handler
// ============================================================

export async function POST(request: NextRequest) {
  // 1. Validate webhook auth
  if (!validateWebhookAuth(request)) {
    logger.warn('[GAF Webhook] Unauthorized callback attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: GAFCallbackPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const subscriberOrderNumber = payload.SubscriberOrderNumber || '';
  const gafOrderNumber = payload.GAFOrderNumber;

  logger.info('[GAF Webhook] Callback received', {
    subscriberOrderNumber,
    gafOrderNumber,
    status: payload.Status,
    problemCode: payload.ProblemCode,
  });

  // 2. Log the webhook event
  const webhookEventId = `gaf-${gafOrderNumber || subscriberOrderNumber}-${Date.now()}`;
  await db.insert(schema.webhookEvents).values({
    eventId: webhookEventId,
    source: 'gaf',
    eventType: payload.ProblemCode ? 'order.failed' : 'order.complete',
    payload: payload as unknown as Record<string, unknown>,
    processed: false,
    relatedEntityType: 'quote',
    relatedEntityId: subscriberOrderNumber.replace(/^RR-/, '') || undefined,
  });

  // 3. Extract quoteId from SubscriberOrderNumber (format: "RR-{quoteId}")
  const quoteId = subscriberOrderNumber.replace(/^RR-/, '');
  if (!quoteId) {
    logger.error('[GAF Webhook] Cannot extract quoteId from SubscriberOrderNumber', {
      subscriberOrderNumber,
    });
    return NextResponse.json({ error: 'Invalid SubscriberOrderNumber' }, { status: 400 });
  }

  // 4. Find or create measurement for this quote
  let existingMeasurement = await db.query.measurements.findFirst({
    where: eq(schema.measurements.quoteId, quoteId),
  });

  if (!existingMeasurement) {
    // Create a measurement record if one doesn't exist yet (e.g., Google Solar failed or raced)
    logger.info('[GAF Webhook] No measurement record found — creating one', { quoteId });
    const [created] = await db
      .insert(schema.measurements)
      .values({
        quoteId,
        vendor: 'gaf',
        gafOrderNumber: String(gafOrderNumber || ''),
        status: 'processing',
      })
      .returning();
    existingMeasurement = created;
  }

  // 5. Handle error case
  if (payload.ProblemCode) {
    logger.warn('[GAF Webhook] Order failed', {
      quoteId,
      problemCode: payload.ProblemCode,
      problemDescription: payload.ProblemDescription,
    });

    await db
      .update(schema.measurements)
      .set({
        status: 'failed',
        errorMessage: `GAF error ${payload.ProblemCode}: ${payload.ProblemDescription || 'Unknown error'}`,
        rawResponse: {
          ...(existingMeasurement.rawResponse as Record<string, unknown> || {}),
          gafCallback: payload,
        },
      })
      .where(eq(schema.measurements.id, existingMeasurement.id));

    return NextResponse.json({ received: true, status: 'error_recorded' });
  }

  // 6. Success path — download assets and store in Vercel Blob
  const gafAssets: Record<string, string> = {};

  if (payload.Reports && payload.Reports.length > 0) {
    for (const report of payload.Reports) {
      if (!report.FileName) continue;

      try {
        const fileBuffer = await gafAdapter.downloadAsset(report.FileName);
        const blobPath = `gaf/${quoteId}/${report.FileName}`;

        const blob = await put(blobPath, fileBuffer, {
          access: 'public',
          contentType: report.FileType || 'application/pdf',
        });

        // Use a semantic key derived from the report.
        // GAF reports may include a ReportType or Category field.
        // Fall back to inferring from filename, then use filename as-is.
        const reportType = (report as Record<string, unknown>).ReportType as string | undefined;
        const assetKey = reportType
          || inferAssetKey(report.FileName)
          || report.FileName;
        gafAssets[assetKey] = blob.url;

        logger.info('[GAF Webhook] Asset stored in Blob', {
          quoteId,
          filename: report.FileName,
          blobUrl: blob.url,
        });
      } catch (err) {
        logger.error('[GAF Webhook] Failed to download/store asset', {
          quoteId,
          filename: report.FileName,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  // 7. Extract measurement data from callback
  const roof = payload.RoofMeasurement;
  const totalAreaSqft = roof?.TotalArea;

  // Parse predominant pitch (e.g., "6/12" -> 6)
  let pitchValue: number | undefined;
  if (roof?.PredominantPitch) {
    const match = roof.PredominantPitch.match(/^(\d+)/);
    if (match) pitchValue = parseInt(match[1], 10);
  }

  // 8. Update measurement record with GAF data
  await db
    .update(schema.measurements)
    .set({
      gafOrderNumber: String(gafOrderNumber || ''),
      gafAssets: Object.keys(gafAssets).length > 0 ? gafAssets : undefined,
      // Only overwrite sqft if GAF provided it and we don't have a higher-confidence value
      ...(totalAreaSqft
        ? {
            sqftTotal: totalAreaSqft.toString(),
          }
        : {}),
      ...(pitchValue !== undefined
        ? {
            pitchPrimary: pitchValue.toString(),
          }
        : {}),
      ...(roof?.RidgeLength !== undefined
        ? { ridgeLengthFt: roof.RidgeLength.toString() }
        : {}),
      ...(roof?.ValleyLength !== undefined
        ? { valleyLengthFt: roof.ValleyLength.toString() }
        : {}),
      ...(roof?.EaveRakeLength !== undefined
        ? { eaveLengthFt: roof.EaveRakeLength.toString() }
        : {}),
      ...(roof?.HipLength !== undefined
        ? { hipLengthFt: roof.HipLength.toString() }
        : {}),
      status: 'complete',
      vendor: 'gaf',
      confidence: 'high',
      rawResponse: {
        ...(existingMeasurement.rawResponse as Record<string, unknown> || {}),
        gafCallback: payload,
      },
      completedAt: new Date(),
    })
    .where(eq(schema.measurements.id, existingMeasurement.id));

  // 9. Update quote sqft with GAF measurement (more accurate than estimate)
  if (totalAreaSqft) {
    await db
      .update(schema.quotes)
      .set({
        sqftTotal: totalAreaSqft.toString(),
        updatedAt: new Date(),
      })
      .where(eq(schema.quotes.id, quoteId));

    logger.info('[GAF Webhook] Quote sqft updated', { quoteId, sqftTotal: totalAreaSqft });
  }

  // Mark webhook event as processed
  await db
    .update(schema.webhookEvents)
    .set({ processed: true, processedAt: new Date() })
    .where(eq(schema.webhookEvents.eventId, webhookEventId));

  logger.info('[GAF Webhook] Measurement updated with GAF data', {
    quoteId,
    gafOrderNumber,
    totalAreaSqft,
    pitch: pitchValue,
    assetCount: Object.keys(gafAssets).length,
  });

  return NextResponse.json({ received: true, status: 'complete' });
}
