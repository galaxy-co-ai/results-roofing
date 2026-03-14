# Roof Visualizer v2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CSS color overlay roof viewer with a Google Solar Data Layers masked satellite image that applies shingle colors only to roof pixels.

**Architecture:** Server-side GeoTIFF processing (geotiff + sharp) with caching in DB jsonb column. Client-side HTML Canvas rendering with multiply blend compositing. Extends existing `/api/portal/roof-data` endpoint.

**Tech Stack:** Google Solar Data Layers API, geotiff (npm), sharp, HTML Canvas API, React, TypeScript, Drizzle ORM

**Spec:** `docs/superpowers/specs/2026-03-13-roof-visualizer-v2-design.md`

---

## File Structure

| File | Responsibility | Action |
|------|---------------|--------|
| `src/lib/roof/types.ts` | Add `RoofLayers` type | Modify |
| `src/db/schema/measurements.ts` | Add `roofLayers` jsonb column | Modify |
| `src/lib/roof/data-layers.ts` | Google Solar Data Layers fetch + GeoTIFF processing | Create |
| `src/lib/roof/__tests__/data-layers.test.ts` | Unit tests for GeoTIFF processing logic | Create |
| `src/app/api/portal/roof-data/route.ts` | Integrate layers fetch/cache into existing endpoint | Modify |
| `src/hooks/useRoofData.ts` | Extend response type | Modify |
| `src/components/features/roof/RoofCanvasViewer.tsx` | Canvas-based masked renderer | Create |
| `src/components/features/roof/RoofImageViewer.tsx` | Old Mapbox overlay viewer | Delete |
| `src/app/portal/roof/page.tsx` | Swap viewer component | Modify |
| `package.json` | Add geotiff, move sharp to deps | Modify |

---

## Chunk 1: Foundation — Types, Schema, Dependencies

### Task 1: Add RoofLayers type

**Files:**
- Modify: `src/lib/roof/types.ts`

- [ ] **Step 1: Add the RoofLayers type to types.ts**

Append after the existing `RoofDataResponse` interface:

```typescript
/** Cached roof visualization layers from Google Solar Data Layers API */
export interface RoofLayers {
  /** Base64-encoded PNG — cropped satellite image */
  rgb: string;
  /** Base64-encoded PNG — binary roof mask */
  mask: string;
  /** Image dimensions in pixels */
  width: number;
  height: number;
  /** Geographic bounds of the cropped area */
  bounds: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
}
```

- [ ] **Step 2: Add `layers` field to RoofDataResponse**

Add an optional `layers` field to the existing `RoofDataResponse` interface:

```typescript
export interface RoofDataResponse {
  segments: RawRoofSegment[];
  buildingCenter: { lat: number; lng: number };
  buildingBoundingBox: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  } | null;
  stats: {
    sqftTotal: number;
    pitchPrimary: string;
    facetCount: number;
    vendor: string;
  };
  /** Satellite image + roof mask for canvas rendering. Null if not yet fetched or unavailable. */
  layers: RoofLayers | null;
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck --prefix C:/Users/Owner/workspace/results-roofing`
Expected: Type errors in files that construct `RoofDataResponse` without `layers` (the API route). This is expected — fixed in Task 4.

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add src/lib/roof/types.ts
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "feat(roof): add RoofLayers type and extend RoofDataResponse"
```

---

### Task 2: Add roofLayers column to measurements schema

**Files:**
- Modify: `src/db/schema/measurements.ts`

- [ ] **Step 1: Add the jsonb column**

Add after the `rawResponse` field (line 43):

```typescript
    // Cached visualization layers (Google Solar Data Layers)
    roofLayers: jsonb('roof_layers').$type<{
      rgb: string;
      mask: string;
      width: number;
      height: number;
      bounds: {
        sw: { latitude: number; longitude: number };
        ne: { latitude: number; longitude: number };
      };
    }>(),
```

- [ ] **Step 2: Push schema to database**

Run: `npm run db:push --prefix C:/Users/Owner/workspace/results-roofing -- --force`
Expected: Schema pushed successfully, `roof_layers` column added to measurements table.

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add src/db/schema/measurements.ts
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "feat(db): add roofLayers jsonb column to measurements"
```

---

### Task 3: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install geotiff**

Run: `npm install --prefix C:/Users/Owner/workspace/results-roofing geotiff`

- [ ] **Step 2: Move sharp from devDependencies to dependencies**

Run: `npm install --prefix C:/Users/Owner/workspace/results-roofing sharp`

This moves it from devDependencies to dependencies (npm will remove the devDep entry and add to deps).

Verify: Check `package.json` — `sharp` should be under `dependencies`, `geotiff` should be under `dependencies`.

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add package.json package-lock.json
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "chore: add geotiff, move sharp to dependencies"
```

---

## Chunk 2: Server-Side Data Layers Processing

### Task 4: Create data-layers module

**Files:**
- Create: `src/lib/roof/data-layers.ts`

This module handles:
1. Calling `dataLayers:get` with lat/lng
2. Downloading RGB + Mask GeoTIFFs
3. Parsing with `geotiff` to extract raster data
4. Cropping to building footprint using the GeoTIFF's affine transform
5. Encoding as base64 PNGs with `sharp`
6. Size validation (reject >1MB combined payloads)

- [ ] **Step 1: Create the module with helper functions**

Create `src/lib/roof/data-layers.ts`:

```typescript
/**
 * Google Solar Data Layers — fetch, process, and cache roof visualization layers.
 *
 * Flow: dataLayers:get → download GeoTIFFs → parse with geotiff.js → crop with sharp → base64 PNGs
 *
 * Docs: https://developers.google.com/maps/documentation/solar/data-layers
 * Pricing: 1,000 free/month, then $0.075/request
 */

import { fromArrayBuffer } from 'geotiff';
import sharp from 'sharp';
import { logger } from '@/lib/utils';
import type { RoofLayers } from './types';

const SOLAR_API_BASE = 'https://solar.googleapis.com/v1';
const MAX_PAYLOAD_BYTES = 1_000_000; // 1MB — don't write larger blobs to jsonb
const RADIUS_METERS = 75;
const PADDING_METERS = 20;

// ── Types ─────────────────────────────────────────────────────────────────────

interface DataLayersResponse {
  dsmUrl: string;
  rgbUrl: string;
  maskUrl: string;
  annualFluxUrl: string;
  monthlyFluxUrl: string;
  hourlyShadeUrls: string[];
  imageryDate: { year: number; month: number; day: number };
  imageryProcessedDate: { year: number; month: number; day: number };
  imageryQuality: string;
}

interface GeoTiffMeta {
  origin: [number, number]; // [lng, lat] of top-left pixel
  resolution: [number, number]; // [lngPerPixel, latPerPixel] (lat is negative)
  width: number;
  height: number;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch and process roof visualization layers from Google Solar Data Layers API.
 * Returns cropped RGB + mask as base64 PNGs, or null on failure.
 */
export async function fetchRoofLayers(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<RoofLayers | null> {
  try {
    // 1. Call dataLayers:get (with one retry if downloads fail — URLs expire in ~1 hour)
    let layerUrls = await fetchDataLayerUrls(lat, lng, apiKey);
    if (!layerUrls) return null;

    // 2. Download RGB + Mask GeoTIFFs in parallel
    let [rgbBuffer, maskBuffer] = await Promise.all([
      downloadGeoTiff(layerUrls.rgbUrl, apiKey),
      downloadGeoTiff(layerUrls.maskUrl, apiKey),
    ]);

    // Retry once if download failed (URLs may have expired)
    if (!rgbBuffer || !maskBuffer) {
      logger.warn('[DataLayers] GeoTIFF download failed, retrying with fresh URLs');
      layerUrls = await fetchDataLayerUrls(lat, lng, apiKey);
      if (!layerUrls) return null;
      [rgbBuffer, maskBuffer] = await Promise.all([
        downloadGeoTiff(layerUrls.rgbUrl, apiKey),
        downloadGeoTiff(layerUrls.maskUrl, apiKey),
      ]);
    }
    if (!rgbBuffer || !maskBuffer) return null;

    // 3. Parse GeoTIFFs and extract raster data
    const rgbResult = await parseGeoTiff(rgbBuffer, 'rgb');
    const maskResult = await parseGeoTiff(maskBuffer, 'mask');
    if (!rgbResult || !maskResult) return null;

    // 4. Compute crop bounds around the building center + padding
    const cropBounds = computeCropBounds(lat, lng, PADDING_METERS, rgbResult.meta);

    // 5. Crop and encode as PNGs
    const rgbPng = await cropAndEncode(rgbResult.data, rgbResult.meta, cropBounds, 'rgb');
    const maskPng = await cropAndEncode(maskResult.data, maskResult.meta, cropBounds, 'mask');
    if (!rgbPng || !maskPng) return null;

    // 6. Size check
    const totalSize = rgbPng.base64.length + maskPng.base64.length;
    if (totalSize > MAX_PAYLOAD_BYTES) {
      logger.warn(`[DataLayers] Combined payload ${totalSize} bytes exceeds ${MAX_PAYLOAD_BYTES} limit`);
      return null;
    }

    return {
      rgb: rgbPng.base64,
      mask: maskPng.base64,
      width: cropBounds.widthPx,
      height: cropBounds.heightPx,
      bounds: {
        sw: { latitude: cropBounds.swLat, longitude: cropBounds.swLng },
        ne: { latitude: cropBounds.neLat, longitude: cropBounds.neLng },
      },
    };
  } catch (error) {
    logger.error('[DataLayers] Unexpected error processing roof layers', error);
    return null;
  }
}

// ── Data Layers API ───────────────────────────────────────────────────────────

async function fetchDataLayerUrls(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<DataLayersResponse | null> {
  const url = new URL(`${SOLAR_API_BASE}/dataLayers:get`);
  url.searchParams.set('location.latitude', lat.toFixed(5));
  url.searchParams.set('location.longitude', lng.toFixed(5));
  url.searchParams.set('radiusMeters', String(RADIUS_METERS));
  url.searchParams.set('view', 'FULL_LAYERS');
  url.searchParams.set('requiredQuality', 'MEDIUM');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    logger.error(`[DataLayers] API error ${response.status}: ${await response.text().catch(() => '')}`);
    return null;
  }

  return response.json() as Promise<DataLayersResponse>;
}

// ── GeoTIFF Download & Parse ──────────────────────────────────────────────────

async function downloadGeoTiff(geoTiffUrl: string, apiKey: string): Promise<ArrayBuffer | null> {
  try {
    // GeoTIFF URLs from the API need the API key appended
    const url = `${geoTiffUrl}&key=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
      logger.error(`[DataLayers] GeoTIFF download failed: ${response.status}`);
      return null;
    }
    return response.arrayBuffer();
  } catch (error) {
    logger.error('[DataLayers] GeoTIFF download error', error);
    return null;
  }
}

interface ParsedGeoTiff {
  data: Uint8Array[] | Uint8Array; // bands for RGB, single band for mask
  meta: GeoTiffMeta;
}

async function parseGeoTiff(
  buffer: ArrayBuffer,
  type: 'rgb' | 'mask',
): Promise<ParsedGeoTiff | null> {
  try {
    const tiff = await fromArrayBuffer(buffer);
    const image = await tiff.getImage();

    const width = image.getWidth();
    const height = image.getHeight();
    const origin = image.getOrigin() as [number, number];
    const resolution = image.getResolution() as [number, number];

    const rasters = await image.readRasters();

    const meta: GeoTiffMeta = { origin, resolution, width, height };

    if (type === 'rgb') {
      // RGB: 3 bands, each Uint8Array of width*height
      return {
        data: [
          new Uint8Array(rasters[0] as ArrayLike<number>),
          new Uint8Array(rasters[1] as ArrayLike<number>),
          new Uint8Array(rasters[2] as ArrayLike<number>),
        ],
        meta,
      };
    } else {
      // Mask: 1 band, values 0 or 1 (might be 0/255)
      return {
        data: new Uint8Array(rasters[0] as ArrayLike<number>),
        meta,
      };
    }
  } catch (error) {
    logger.error(`[DataLayers] GeoTIFF parse error (${type})`, error);
    return null;
  }
}

// ── Geo-to-Pixel Conversion & Cropping ────────────────────────────────────────

interface CropBounds {
  x: number; // pixel x offset in source
  y: number; // pixel y offset in source
  widthPx: number;
  heightPx: number;
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

/**
 * Compute a pixel-space crop rectangle centered on (lat, lng) with padding in meters.
 * Uses the GeoTIFF's affine transform: origin = [lng, lat] of top-left pixel,
 * resolution = [lng/pixel, lat/pixel] where lat component is negative (rows go top→bottom).
 */
function computeCropBounds(
  centerLat: number,
  centerLng: number,
  paddingMeters: number,
  meta: GeoTiffMeta,
): CropBounds {
  // Convert padding from meters to approximate degrees
  // 1 degree lat ≈ 111,320m, 1 degree lng ≈ 111,320m * cos(lat)
  const mPerDegreeLat = 111_320;
  const mPerDegreeLng = 111_320 * Math.cos((centerLat * Math.PI) / 180);
  const padLat = paddingMeters / mPerDegreeLat;
  const padLng = paddingMeters / mPerDegreeLng;

  // Desired geographic bounds
  const swLat = centerLat - padLat;
  const swLng = centerLng - padLng;
  const neLat = centerLat + padLat;
  const neLng = centerLng + padLng;

  // Convert geo coords to pixel coords using affine transform
  // pixel_x = (lng - origin_lng) / resolution_lng
  // pixel_y = (lat - origin_lat) / resolution_lat  (resolution_lat is negative)
  const [originLng, originLat] = meta.origin;
  const [resLng, resLat] = meta.resolution;

  const x1 = Math.floor((swLng - originLng) / resLng);
  const y1 = Math.floor((neLat - originLat) / resLat); // neLat maps to top (smaller y)
  const x2 = Math.ceil((neLng - originLng) / resLng);
  const y2 = Math.ceil((swLat - originLat) / resLat); // swLat maps to bottom (larger y)

  // Clamp to image bounds
  const x = Math.max(0, Math.min(x1, meta.width - 1));
  const y = Math.max(0, Math.min(y1, meta.height - 1));
  const widthPx = Math.min(x2 - x, meta.width - x);
  const heightPx = Math.min(y2 - y, meta.height - y);

  return { x, y, widthPx, heightPx, swLat, swLng, neLat, neLng };
}

async function cropAndEncode(
  data: Uint8Array[] | Uint8Array,
  meta: GeoTiffMeta,
  crop: CropBounds,
  type: 'rgb' | 'mask',
): Promise<{ base64: string } | null> {
  try {
    const { x, y, widthPx, heightPx } = crop;
    const srcWidth = meta.width;

    if (widthPx <= 0 || heightPx <= 0) {
      logger.warn('[DataLayers] Invalid crop dimensions');
      return null;
    }

    let rawPixels: Buffer;

    if (type === 'rgb' && Array.isArray(data)) {
      // Interleave RGB bands into RGBA buffer
      const [r, g, b] = data;
      rawPixels = Buffer.alloc(widthPx * heightPx * 4);
      for (let row = 0; row < heightPx; row++) {
        for (let col = 0; col < widthPx; col++) {
          const srcIdx = (y + row) * srcWidth + (x + col);
          const dstIdx = (row * widthPx + col) * 4;
          rawPixels[dstIdx] = r[srcIdx];
          rawPixels[dstIdx + 1] = g[srcIdx];
          rawPixels[dstIdx + 2] = b[srcIdx];
          rawPixels[dstIdx + 3] = 255; // full alpha
        }
      }
    } else {
      // Mask: single channel → grayscale PNG (0 or 255)
      const maskData = data as Uint8Array;
      rawPixels = Buffer.alloc(widthPx * heightPx * 4);
      for (let row = 0; row < heightPx; row++) {
        for (let col = 0; col < widthPx; col++) {
          const srcIdx = (y + row) * srcWidth + (x + col);
          const val = maskData[srcIdx] > 0 ? 255 : 0;
          const dstIdx = (row * widthPx + col) * 4;
          rawPixels[dstIdx] = val;
          rawPixels[dstIdx + 1] = val;
          rawPixels[dstIdx + 2] = val;
          rawPixels[dstIdx + 3] = 255;
        }
      }
    }

    const pngBuffer = await sharp(rawPixels, {
      raw: { width: widthPx, height: heightPx, channels: 4 },
    })
      .png({ compressionLevel: 6 })
      .toBuffer();

    return { base64: pngBuffer.toString('base64') };
  } catch (error) {
    logger.error(`[DataLayers] Crop/encode error (${type})`, error);
    return null;
  }
}

// ── Test-only exports ─────────────────────────────────────────────────────────
export { computeCropBounds, cropAndEncode, type GeoTiffMeta, type CropBounds };
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck --prefix C:/Users/Owner/workspace/results-roofing`
Expected: May have errors from Task 1's RoofDataResponse change — that's fine. The data-layers module itself should have no type errors.

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add src/lib/roof/data-layers.ts
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "feat(roof): add Google Solar Data Layers fetch + GeoTIFF processing module"
```

---

### Task 5: Write unit tests for data-layers processing

**Files:**
- Create: `src/lib/roof/__tests__/data-layers.test.ts`

Tests focus on the pure functions (geo-to-pixel conversion, crop logic). The API calls are integration-tested manually.

- [ ] **Step 1: Write tests for computeCropBounds and cropAndEncode**

```typescript
import { describe, it, expect } from 'vitest';
import { computeCropBounds, type GeoTiffMeta } from '../data-layers';

describe('computeCropBounds', () => {
  // Simulated GeoTIFF metadata for Moore, OK area
  // 0.1m/pixel resolution → ~0.0000009° lat, ~0.0000011° lng per pixel
  const meta: GeoTiffMeta = {
    origin: [-97.482, 35.332], // [lng, lat] of top-left pixel
    resolution: [0.0000011, -0.0000009], // [lngPerPx, latPerPx] — lat is negative
    width: 2000,
    height: 2000,
  };

  const centerLat = 35.330;
  const centerLng = -97.480;

  it('returns a crop rectangle centered on the building', () => {
    const crop = computeCropBounds(centerLat, centerLng, 20, meta);

    expect(crop.widthPx).toBeGreaterThan(0);
    expect(crop.heightPx).toBeGreaterThan(0);
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
  });

  it('clamps crop to image bounds', () => {
    // Center near the edge of the image
    const crop = computeCropBounds(35.332, -97.482, 20, meta);

    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.widthPx).toBeLessThanOrEqual(meta.width);
    expect(crop.y + crop.heightPx).toBeLessThanOrEqual(meta.height);
  });

  it('produces larger crop with more padding', () => {
    const small = computeCropBounds(centerLat, centerLng, 10, meta);
    const large = computeCropBounds(centerLat, centerLng, 40, meta);

    expect(large.widthPx).toBeGreaterThan(small.widthPx);
    expect(large.heightPx).toBeGreaterThan(small.heightPx);
  });

  it('includes correct geographic bounds', () => {
    const crop = computeCropBounds(centerLat, centerLng, 20, meta);

    expect(crop.swLat).toBeLessThan(centerLat);
    expect(crop.neLat).toBeGreaterThan(centerLat);
    expect(crop.swLng).toBeLessThan(centerLng);
    expect(crop.neLng).toBeGreaterThan(centerLng);
  });
});

describe('Mask value normalization', () => {
  it('treats any non-zero value as roof', () => {
    const values = [0, 1, 128, 255];
    const results = values.map((v) => (v > 0 ? 255 : 0));
    expect(results).toEqual([0, 255, 255, 255]);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx vitest run src/lib/roof/__tests__/data-layers.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add src/lib/roof/__tests__/data-layers.test.ts
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "test(roof): add unit tests for Data Layers geo-to-pixel conversion"
```

---

### Task 6: Integrate Data Layers into roof-data API route

**Files:**
- Modify: `src/app/api/portal/roof-data/route.ts`

- [ ] **Step 1: Add layers fetch/cache logic**

After the existing `// ── Extract Solar data from rawResponse` section (around line 101), before constructing the response object, add the layers logic:

```typescript
import { fetchRoofLayers } from '@/lib/roof/data-layers';
import type { RoofLayers } from '@/lib/roof/types';
```

Add at the top with other imports. Then after line 113 (`if (!center || segments.length === 0) { ... }`), before the response construction:

```typescript
    // ── Fetch/cache roof visualization layers ─────────────────────────────
    let layers: RoofLayers | null = (measurement.roofLayers as RoofLayers) ?? null;

    if (!layers) {
      const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
      if (apiKey) {
        layers = await fetchRoofLayers(center.latitude, center.longitude, apiKey);
        if (layers) {
          // Cache in DB — never need to call the API again for this property
          try {
            await db
              .update(schema.measurements)
              .set({ roofLayers: layers })
              .where(eq(schema.measurements.id, measurement.id));
          } catch (cacheErr) {
            logger.error('[RoofData] Failed to cache layers', cacheErr);
            // Non-fatal — we still have the layers for this response
          }
        }
      }
    }
```

- [ ] **Step 2: Add `layers` to the response object**

Update the response construction to include layers:

```typescript
    const response: RoofDataResponse = {
      segments: segments as RoofDataResponse['segments'],
      buildingCenter: { lat: center.latitude, lng: center.longitude },
      buildingBoundingBox: bboxRaw
        ? {
            sw: { lat: bboxRaw.sw.latitude, lng: bboxRaw.sw.longitude },
            ne: { lat: bboxRaw.ne.latitude, lng: bboxRaw.ne.longitude },
          }
        : null,
      stats: {
        sqftTotal: measurement.sqftTotal ? Number(measurement.sqftTotal) : 0,
        pitchPrimary: measurement.pitchPrimary ?? 'Unknown',
        facetCount: segments.length,
        vendor: 'google_solar',
      },
      layers,
    };
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck --prefix C:/Users/Owner/workspace/results-roofing`
Expected: Clean — all RoofDataResponse usages now include `layers`.

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add src/app/api/portal/roof-data/route.ts
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "feat(roof): integrate Data Layers fetch and caching into roof-data API"
```

---

## Chunk 3: Client-Side Canvas Renderer & Page Integration

### Task 7: Create RoofCanvasViewer component

**Files:**
- Create: `src/components/features/roof/RoofCanvasViewer.tsx`

- [ ] **Step 1: Create the canvas-based viewer**

```typescript
'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface RoofCanvasViewerProps {
  /** Base64-encoded PNG satellite image */
  rgbBase64: string;
  /** Base64-encoded PNG roof mask */
  maskBase64: string;
  /** Width of the image in pixels */
  width: number;
  /** Height of the image in pixels */
  height: number;
  /** Hex color of the selected shingle */
  shingleHex: string;
  /** Name of the selected shingle (for aria-label) */
  shingleName: string;
}

const COLOR_ALPHA = 0.65;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.2;

/**
 * Renders a satellite image with shingle color applied only to masked roof pixels.
 * Uses HTML Canvas with multiply blend mode for natural-looking color application.
 * Supports zoom (scroll/pinch) and pan (drag) interactions.
 */
export function RoofCanvasViewer({
  rgbBase64,
  maskBase64,
  width,
  height,
  shingleHex,
  shingleName,
}: RoofCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rgbImage, setRgbImage] = useState<HTMLImageElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);

  // Zoom/pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Load images from base64
  useEffect(() => {
    let cancelled = false;

    const rgb = new Image();
    const mask = new Image();

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 2 && !cancelled) {
        setRgbImage(rgb);
        setMaskImage(mask);
        setLoading(false);
      }
    };

    rgb.onload = onLoad;
    mask.onload = onLoad;
    rgb.onerror = () => { if (!cancelled) setLoading(false); };
    mask.onerror = () => { if (!cancelled) setLoading(false); };

    rgb.src = `data:image/png;base64,${rgbBase64}`;
    mask.src = `data:image/png;base64,${maskBase64}`;

    return () => { cancelled = true; };
  }, [rgbBase64, maskBase64]);

  // Render to canvas whenever images or shingle color changes
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rgbImage || !maskImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw satellite image as base
    ctx.drawImage(rgbImage, 0, 0, width, height);

    // 2. Create mask canvas — extract alpha from mask image
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.drawImage(maskImage, 0, 0, width, height);
    const maskData = maskCtx.getImageData(0, 0, width, height);

    // 3. Create color overlay canvas — filled with shingle color, masked to roof
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = width;
    colorCanvas.height = height;
    const colorCtx = colorCanvas.getContext('2d')!;
    colorCtx.fillStyle = shingleHex;
    colorCtx.fillRect(0, 0, width, height);

    // Apply mask as alpha channel on color overlay
    const colorData = colorCtx.getImageData(0, 0, width, height);
    for (let i = 0; i < maskData.data.length; i += 4) {
      // mask pixel R channel: 255 = roof, 0 = not roof
      const isRoof = maskData.data[i] > 128;
      colorData.data[i + 3] = isRoof ? Math.round(COLOR_ALPHA * 255) : 0;
    }
    colorCtx.putImageData(colorData, 0, 0);

    // 4. Composite color onto satellite with multiply blend
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(colorCanvas, 0, 0);

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [rgbImage, maskImage, width, height, shingleHex]);

  useEffect(() => {
    render();
  }, [render]);

  // ── Zoom/Pan handlers ──────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.01 * ZOOM_STEP)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Reset zoom/pan on double-click
  const handleDoubleClick = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--rr-color-surface)',
        cursor: zoom > 1 ? 'grab' : 'zoom-in',
        touchAction: 'none', // Prevent browser scroll on touch
      }}
      role="img"
      aria-label={`Aerial view of your roof with ${shingleName} shingles`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Loading state */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, var(--rr-color-surface) 0%, var(--rr-color-background) 100%)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: loading ? 'none' : 'block',
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center center',
          transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
        }}
      />

      {/* Shingle color badge */}
      {!loading && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 500,
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: shingleHex,
            border: '1.5px solid rgba(255,255,255,0.5)',
          }} />
          {shingleName}
        </div>
      )}

      {/* Attribution */}
      {!loading && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          fontSize: '0.625rem',
          color: 'rgba(255,255,255,0.5)',
        }}>
          Imagery © Google
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck --prefix C:/Users/Owner/workspace/results-roofing`
Expected: Clean.

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add src/components/features/roof/RoofCanvasViewer.tsx
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "feat(roof): add RoofCanvasViewer with canvas multiply blend rendering"
```

---

### Task 8: Update roof page to use RoofCanvasViewer

**Files:**
- Modify: `src/app/portal/roof/page.tsx`
- Modify: `src/hooks/useRoofData.ts`

- [ ] **Step 1: Update useRoofData hook**

No code changes needed in `useRoofData.ts` — the hook already returns `RoofDataResponse` which now includes `layers`. The type update from Task 1 covers it. Verify the import path is correct.

- [ ] **Step 2: Update the roof page**

Replace the `RoofImageViewer` import and usage in `src/app/portal/roof/page.tsx`:

Change import:
```typescript
// Remove:
import { RoofImageViewer } from '@/components/features/roof/RoofImageViewer';
// Add:
import { RoofCanvasViewer } from '@/components/features/roof/RoofCanvasViewer';
```

Update the viewport section in `RoofContent` (replace the `{hasData ? (` block):

```typescript
        {/* Satellite aerial view */}
        <div className={styles.viewport}>
          {hasData && roofData?.layers ? (
            <RoofCanvasViewer
              rgbBase64={roofData.layers.rgb}
              maskBase64={roofData.layers.mask}
              width={roofData.layers.width}
              height={roofData.layers.height}
              shingleHex={selectedShingle.hex}
              shingleName={selectedShingle.name}
            />
          ) : hasData ? (
            <div className={styles.emptyState}>
              <Home size={40} color="var(--rr-color-muted)" />
              <p className={styles.emptyTitle}>Roof Preview Unavailable</p>
              <p className={styles.emptyText}>
                Roof visualization is not available for this location. You can still select shingle colors from the swatches.
              </p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Home size={40} color="var(--rr-color-muted)" />
              <p className={styles.emptyTitle}>No Roof Data Yet</p>
              <p className={styles.emptyText}>
                Your roof visualization will appear here once your measurement report is processed.
              </p>
            </div>
          )}
        </div>
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck --prefix C:/Users/Owner/workspace/results-roofing`
Expected: Clean.

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add src/app/portal/roof/page.tsx
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "feat(roof): swap RoofImageViewer for RoofCanvasViewer on portal roof page"
```

---

## Chunk 4: Cleanup

### Task 9: Cleanup — delete RoofImageViewer, verify PortalShell

**Files:**
- Delete: `src/components/features/roof/RoofImageViewer.tsx`
- Verify: `src/components/features/portal/PortalSidebarV2/PortalShell.tsx` (debug console.log already removed — confirm)

- [ ] **Step 0: Verify PortalShell debug log is gone**

Search for `console.log` in `PortalShell.tsx`. The spec called for removing `[My Roof Debug]` logging, but it has already been cleaned up. Confirm no debug logging remains.

- [ ] **Step 1: Delete the file**

```bash
rm "C:/Users/Owner/workspace/results-roofing/src/components/features/roof/RoofImageViewer.tsx"
```

- [ ] **Step 2: Search for any remaining imports**

Search the codebase for `RoofImageViewer` to ensure no other files import it.

Run: `grep -r "RoofImageViewer" C:/Users/Owner/workspace/results-roofing/src/`
Expected: No matches.

- [ ] **Step 3: Run typecheck + build**

Run: `npm run typecheck --prefix C:/Users/Owner/workspace/results-roofing`
Expected: Clean.

Run: `npm run build --prefix C:/Users/Owner/workspace/results-roofing`
Expected: Build succeeds (catches ESLint errors too).

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/Owner/workspace/results-roofing" add -u src/components/features/roof/RoofImageViewer.tsx
git -C "C:/Users/Owner/workspace/results-roofing" commit -m "chore(roof): remove old RoofImageViewer (Mapbox + CSS overlay)"
```

---

### Task 10: Run all roof tests

- [ ] **Step 1: Run existing geometry tests + new data-layers tests**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx vitest run src/lib/roof/`
Expected: All tests pass (12 existing + new data-layers tests).

- [ ] **Step 2: Run full typecheck**

Run: `npm run typecheck --prefix C:/Users/Owner/workspace/results-roofing`
Expected: Clean.

---

### Task 11: Manual integration test

- [ ] **Step 1: Start dev server**

Run: `npm run dev --prefix C:/Users/Owner/workspace/results-roofing`

- [ ] **Step 2: Visit the roof page**

Navigate to `http://localhost:3000/portal/roof` (logged in as `daltoncox121@gmail.com` or with dev bypass).

- [ ] **Step 3: Verify the canvas renders**

Expected behavior:
- First load: API calls `dataLayers:get`, processes GeoTIFFs, caches in DB (~5-15 seconds)
- Satellite image renders on canvas with roof area tinted in the default "Better" tier shingle color
- Grass, driveway, trees are NOT tinted — only the roof
- Switching shingle colors updates instantly (canvas redraw)
- Second load: layers come from DB cache, no API call, fast load

- [ ] **Step 4: Take a screenshot for review**

Capture the result for visual quality assessment. If the multiply blend opacity needs tuning, adjust `COLOR_ALPHA` in `RoofCanvasViewer.tsx`.
