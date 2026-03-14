/**
 * POST /api/webhooks/gaf
 *
 * GAF QuickMeasure callback handler.
 * Called by GAF ~1hr after order placement with measurement results.
 *
 * Auth: client_id + client_secret headers (NOT bearer token)
 * Flow: validate auth -> parse payload -> download ALL assets -> store in Blob -> update measurement
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
// Callback payload shape (based on actual GAF callback samples)
// ============================================================

interface GAFCallbackPayload {
  SubscriberOrderNumber?: string;
  GAFOrderNumber?: number;
  Subscriber?: string;
  SubscriberReference?: string;
  Vendor?: string;
  VendorReference?: string;
  TrackingId?: string;
  RoofMeasurement?: {
    // Aggregated measurements
    Area?: number;
    TotalArea?: number;
    Eaves?: number;
    Hips?: number;
    Rakes?: number;
    Ridges?: number;
    Valleys?: number;
    Facets?: number;
    Pitch?: string;
    PredominantPitch?: string;
    Bends?: number;
    Flash?: number;
    Step?: number;
    DripEdge?: number;
    LeakBarrier?: number;
    RidgeCap?: number;
    Starter?: number;
    Parapets?: number;
    SuggestedWaste?: number;
    // Asset file references (key = asset type, value = filename)
    Assets?: Record<string, string>;
    // Per-pitch area breakdown
    PitchToArea?: string;
    // Full building data with geometry URLs
    Buildings?: string;
    // Legacy field names
    RidgeLength?: number;
    HipLength?: number;
    ValleyLength?: number;
    EaveRakeLength?: number;
    [key: string]: unknown;
  };
  // Some callbacks use Reports[] instead of RoofMeasurement.Assets
  Reports?: Array<{
    FileName?: string;
    FileType?: string;
    [key: string]: unknown;
  }>;
  ServerResponses?: Array<{
    Server?: string;
    ServerReference?: string;
    Timestamp?: string;
    Response?: Record<string, unknown>;
  }>;
  AdditionalProduct?: unknown;
  ProblemCode?: string;
  ProblemDescription?: string;
  Status?: string;
  [key: string]: unknown;
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

  // 2. Log the webhook event (store full payload for debugging)
  await db.insert(schema.webhookEvents).values({
    eventId: `gaf-${gafOrderNumber || subscriberOrderNumber}-${Date.now()}`,
    source: 'gaf',
    eventType: payload.ProblemCode ? 'order.failed' : 'order.complete',
    payload: payload as unknown as Record<string, unknown>,
    processed: false,
    relatedEntityType: 'quote',
  });

  // 3. Extract quoteId from SubscriberOrderNumber (format: "RR-{quoteId}")
  const quoteId = subscriberOrderNumber.replace(/^RR-/, '');
  if (!quoteId) {
    logger.error('[GAF Webhook] Cannot extract quoteId from SubscriberOrderNumber', {
      subscriberOrderNumber,
    });
    return NextResponse.json({ error: 'Invalid SubscriberOrderNumber' }, { status: 400 });
  }

  // 4. Find existing measurement for this quote
  const existingMeasurement = await db.query.measurements.findFirst({
    where: eq(schema.measurements.quoteId, quoteId),
  });

  if (!existingMeasurement) {
    logger.error('[GAF Webhook] No measurement record found for quote', { quoteId });
    return NextResponse.json({ error: 'Measurement not found' }, { status: 404 });
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

  // 6. Download ALL assets — from both RoofMeasurement.Assets AND Reports[]
  const gafAssets: Record<string, string> = {};

  // Source 1: RoofMeasurement.Assets (primary — has DXF, images, 3D report, etc.)
  const roofAssets = payload.RoofMeasurement?.Assets;
  if (roofAssets) {
    for (const [assetKey, filename] of Object.entries(roofAssets)) {
      if (!filename || typeof filename !== 'string') continue;

      // URLs (Report3D, model URLs) are stored directly, not downloaded
      if (filename.startsWith('http://') || filename.startsWith('https://')) {
        gafAssets[assetKey] = filename;
        logger.info('[GAF Webhook] Asset URL stored', { quoteId, assetKey, url: filename });
        continue;
      }

      try {
        const fileBuffer = await gafAdapter.downloadAsset(filename);
        const blobPath = `gaf/${quoteId}/${filename}`;
        const contentType = filename.endsWith('.pdf') ? 'application/pdf'
          : filename.endsWith('.xml') ? 'application/xml'
          : filename.endsWith('.dxf') ? 'application/dxf'
          : filename.endsWith('.jpg') ? 'image/jpeg'
          : filename.endsWith('.json') ? 'application/json'
          : 'application/octet-stream';

        const blob = await put(blobPath, fileBuffer, { access: 'public', contentType });
        gafAssets[assetKey] = blob.url;
        logger.info('[GAF Webhook] Asset stored in Blob', { quoteId, assetKey, filename, blobUrl: blob.url });
      } catch (err) {
        logger.error('[GAF Webhook] Failed to download asset', {
          quoteId, assetKey, filename,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  // Source 2: Reports[] (fallback for callbacks that use this format)
  if (payload.Reports && payload.Reports.length > 0) {
    for (const report of payload.Reports) {
      if (!report.FileName) continue;
      // Skip if we already got this from Assets
      if (gafAssets[report.FileName]) continue;

      try {
        const fileBuffer = await gafAdapter.downloadAsset(report.FileName);
        const blobPath = `gaf/${quoteId}/${report.FileName}`;
        const blob = await put(blobPath, fileBuffer, {
          access: 'public',
          contentType: report.FileType || 'application/pdf',
        });
        gafAssets[report.FileName] = blob.url;
        logger.info('[GAF Webhook] Report stored in Blob', { quoteId, filename: report.FileName, blobUrl: blob.url });
      } catch (err) {
        logger.error('[GAF Webhook] Failed to download report', {
          quoteId, filename: report.FileName,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  // Source 3: Extract model/geometry URLs from Buildings JSON string
  const buildingsStr = payload.RoofMeasurement?.Buildings;
  if (buildingsStr && typeof buildingsStr === 'string') {
    try {
      const buildings = JSON.parse(buildingsStr);
      if (Array.isArray(buildings) && buildings.length > 0) {
        const b = buildings[0];
        // Capture all useful URLs from the building data
        if (b.modelUrl) gafAssets['ModelUrl'] = b.modelUrl;
        if (b.dxfUrl) gafAssets['BuildingDxfUrl'] = b.dxfUrl;
        if (b.reportUrl) gafAssets['BuildingReportUrl'] = b.reportUrl;
        if (b.diagramUrl) gafAssets['BuildingDiagramUrl'] = b.diagramUrl;
        if (b.verticalImageUrl) gafAssets['VerticalImageUrl'] = b.verticalImageUrl;
        if (b.northImageUrl) gafAssets['NorthImageUrl'] = b.northImageUrl;
        if (b.eastImageUrl) gafAssets['EastImageUrl'] = b.eastImageUrl;
        if (b.southImageUrl) gafAssets['SouthImageUrl'] = b.southImageUrl;
        if (b.westImageUrl) gafAssets['WestImageUrl'] = b.westImageUrl;
        logger.info('[GAF Webhook] Building data extracted', { quoteId, keys: Object.keys(b).length });
      }
    } catch {
      logger.warn('[GAF Webhook] Failed to parse Buildings JSON', { quoteId });
    }
  }

  // 7. Extract measurement data from callback
  const roof = payload.RoofMeasurement;
  const totalAreaSqft = roof?.Area ?? roof?.TotalArea;
  const facetCount = roof?.Facets;

  // Parse pitch (e.g., "6/12" -> 6, or just "0" -> 0)
  let pitchValue: number | undefined;
  const pitchStr = roof?.Pitch ?? roof?.PredominantPitch;
  if (pitchStr) {
    const match = String(pitchStr).match(/^(\d+)/);
    if (match) pitchValue = parseInt(match[1], 10);
  }

  // 8. Update measurement record with ALL GAF data
  await db
    .update(schema.measurements)
    .set({
      gafOrderNumber: String(gafOrderNumber || ''),
      gafAssets: Object.keys(gafAssets).length > 0 ? gafAssets : undefined,
      ...(totalAreaSqft ? { sqftTotal: totalAreaSqft.toString() } : {}),
      ...(pitchValue !== undefined ? { pitchPrimary: pitchValue.toString() } : {}),
      ...(facetCount !== undefined ? { facetCount } : {}),
      ...(roof?.Ridges !== undefined || roof?.RidgeLength !== undefined
        ? { ridgeLengthFt: String(roof?.Ridges ?? roof?.RidgeLength) } : {}),
      ...(roof?.Valleys !== undefined || roof?.ValleyLength !== undefined
        ? { valleyLengthFt: String(roof?.Valleys ?? roof?.ValleyLength) } : {}),
      ...(roof?.Eaves !== undefined || roof?.EaveRakeLength !== undefined
        ? { eaveLengthFt: String(roof?.Eaves ?? roof?.EaveRakeLength) } : {}),
      ...(roof?.Hips !== undefined || roof?.HipLength !== undefined
        ? { hipLengthFt: String(roof?.Hips ?? roof?.HipLength) } : {}),
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

  logger.info('[GAF Webhook] Measurement updated with GAF data', {
    quoteId,
    gafOrderNumber,
    totalAreaSqft,
    pitch: pitchValue,
    facets: facetCount,
    assetCount: Object.keys(gafAssets).length,
    assetKeys: Object.keys(gafAssets),
  });

  return NextResponse.json({ received: true, status: 'complete' });
}
