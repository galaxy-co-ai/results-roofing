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
import type { RoofLayers, RoofMesh } from './types';
import { generateRoofMesh } from './dsm-mesh';

const SOLAR_API_BASE = 'https://solar.googleapis.com/v1';
const MAX_PAYLOAD_BYTES = 1_000_000; // 1MB — don't write larger blobs to jsonb
const MAX_MESH_BYTES = 1_000_000;  // 1MB — separate budget for mesh data
const DSM_STEP_INITIAL = 1;        // full resolution on cropped area (~200x200px)
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
  origin: [number, number]; // [easting, northing] of top-left pixel (UTM meters)
  resolution: [number, number]; // [metersPerPixelX, metersPerPixelY] (Y is positive, rows go top→bottom)
  width: number;
  height: number;
  bbox: [number, number, number, number]; // [minX, minY, maxX, maxY] in UTM
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

    // 2. Download RGB + Mask + DSM GeoTIFFs in parallel
    let [rgbBuffer, maskBuffer, dsmBuffer] = await Promise.all([
      downloadGeoTiff(layerUrls.rgbUrl, apiKey),
      downloadGeoTiff(layerUrls.maskUrl, apiKey),
      downloadGeoTiff(layerUrls.dsmUrl, apiKey),
    ]);

    // Retry once if download failed (URLs may have expired)
    if (!rgbBuffer || !maskBuffer) {
      logger.warn('[DataLayers] GeoTIFF download failed, retrying with fresh URLs');
      layerUrls = await fetchDataLayerUrls(lat, lng, apiKey);
      if (!layerUrls) return null;
      [rgbBuffer, maskBuffer, dsmBuffer] = await Promise.all([
        downloadGeoTiff(layerUrls.rgbUrl, apiKey),
        downloadGeoTiff(layerUrls.maskUrl, apiKey),
        downloadGeoTiff(layerUrls.dsmUrl, apiKey),
      ]);
    }
    if (!rgbBuffer || !maskBuffer) return null;

    // 3. Parse GeoTIFFs and extract raster data
    const rgbResult = await parseGeoTiff(rgbBuffer, 'rgb');
    const maskResult = await parseGeoTiff(maskBuffer, 'mask');
    if (!rgbResult || !maskResult) return null;

    // 4. Compute crop bounds around the building center + padding
    const cropBounds = computeCropBounds(lat, lng, PADDING_METERS, rgbResult.meta);

    // 3b. Parse DSM GeoTIFF and generate mesh from CROPPED area (non-fatal)
    let roofMesh: RoofMesh | null = null;
    if (dsmBuffer) {
      const dsmResult = await parseDsmGeoTiff(dsmBuffer);
      if (dsmResult && maskResult) {
        const dsmW = dsmResult.meta.width;
        const dsmH = dsmResult.meta.height;

        if (dsmW === maskResult.meta.width && dsmH === maskResult.meta.height) {
          // Crop DSM + mask to building area (same crop as RGB/mask PNGs)
          // This isolates just the target building, excluding neighboring houses
          const { x, y, widthPx, heightPx } = cropBounds;
          const croppedDsm = new Float32Array(widthPx * heightPx);
          const croppedMask = new Uint8Array(widthPx * heightPx);
          const maskData = maskResult.data as Uint8Array;

          for (let row = 0; row < heightPx; row++) {
            for (let col = 0; col < widthPx; col++) {
              const srcIdx = (y + row) * dsmW + (x + col);
              const dstIdx = row * widthPx + col;
              croppedDsm[dstIdx] = dsmResult.data[srcIdx];
              croppedMask[dstIdx] = maskData[srcIdx] > 0 ? 255 : 0;
            }
          }

          roofMesh = buildAndSerializeMesh(croppedDsm, croppedMask, widthPx, heightPx);
        } else {
          logger.warn(
            `[DataLayers] DSM/mask dimension mismatch: DSM=${dsmW}x${dsmH}, mask=${maskResult.meta.width}x${maskResult.meta.height}`,
          );
        }
      }
    }

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
      mesh: roofMesh,
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
    const bbox = image.getBoundingBox() as [number, number, number, number];

    const meta: GeoTiffMeta = { origin, resolution, width, height, bbox };

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

async function parseDsmGeoTiff(
  buffer: ArrayBuffer,
): Promise<{ data: Float32Array; meta: GeoTiffMeta } | null> {
  try {
    const tiff = await fromArrayBuffer(buffer);
    const image = await tiff.getImage();

    const width = image.getWidth();
    const height = image.getHeight();
    const origin = image.getOrigin() as [number, number];
    const resolution = image.getResolution() as [number, number];
    const bbox = image.getBoundingBox() as [number, number, number, number];

    const rasters = await image.readRasters();
    const meta: GeoTiffMeta = { origin, resolution, width, height, bbox };

    return {
      data: new Float32Array(rasters[0] as ArrayLike<number>),
      meta,
    };
  } catch (error) {
    logger.error('[DataLayers] DSM GeoTIFF parse error', error);
    return null;
  }
}

function buildAndSerializeMesh(
  dsm: Float32Array,
  mask: Uint8Array,
  width: number,
  height: number,
): RoofMesh | null {
  let step = DSM_STEP_INITIAL;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const mesh = generateRoofMesh(dsm, mask, width, height, step);
    if (!mesh) return null;

    const posB64 = Buffer.from(mesh.positions.buffer).toString('base64');
    const normB64 = Buffer.from(mesh.normals.buffer).toString('base64');
    const idxB64 = Buffer.from(mesh.indices.buffer).toString('base64');

    const totalBytes = posB64.length + normB64.length + idxB64.length;

    if (totalBytes <= MAX_MESH_BYTES) {
      return {
        positions: posB64,
        normals: normB64,
        indices: idxB64,
        vertexCount: mesh.vertexCount,
        triangleCount: mesh.triangleCount,
      };
    }

    logger.warn(
      `[DataLayers] Mesh ${totalBytes} bytes exceeds ${MAX_MESH_BYTES}, retrying with step=${step * 2}`,
    );
    step *= 2;
  }

  logger.warn('[DataLayers] Mesh still too large after max retries');
  return null;
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

// ── Lat/Lng to UTM Conversion ─────────────────────────────────────────────────

/**
 * Convert WGS84 lat/lng to UTM easting/northing.
 * Google Solar GeoTIFFs use UTM projected coordinates (e.g., EPSG:32614 for Zone 14N).
 */
function latLngToUtm(lat: number, lng: number): { easting: number; northing: number } {
  const a = 6378137; // WGS84 semi-major axis
  const f = 1 / 298.257223563;
  const k0 = 0.9996;

  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  const zone = Math.floor((lng + 180) / 6) + 1;
  const centralMeridian = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;

  const e = Math.sqrt(2 * f - f * f);
  const e2 = e * e;
  const ep2 = e2 / (1 - e2);

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = ep2 * Math.cos(latRad) ** 2;
  const A = Math.cos(latRad) * (lngRad - centralMeridian);

  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256) * latRad -
      ((3 * e2) / 8 + (3 * e2 ** 2) / 32 + (45 * e2 ** 3) / 1024) * Math.sin(2 * latRad) +
      ((15 * e2 ** 2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * latRad) -
      ((35 * e2 ** 3) / 3072) * Math.sin(6 * latRad));

  const easting =
    k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T ** 2 + 72 * C - 58 * ep2) * A ** 5) / 120) +
    500000;

  const northing =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        (A ** 2 / 2 +
          ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 +
          ((61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6) / 720));

  return { easting, northing: lat >= 0 ? northing : northing + 10000000 };
}

/**
 * Compute a pixel-space crop rectangle centered on (lat, lng) with padding in meters.
 *
 * Google Solar GeoTIFFs use UTM projected coordinates (meters), not WGS84 degrees.
 * Origin = [easting, northing] of top-left pixel in UTM.
 * Resolution = [metersPerPixelX, metersPerPixelY] (both positive, 0.1m typically).
 * Rows go top→bottom, so northing decreases as pixel Y increases.
 */
function computeCropBounds(
  centerLat: number,
  centerLng: number,
  paddingMeters: number,
  meta: GeoTiffMeta,
): CropBounds {
  // Convert building center from lat/lng to UTM
  const { easting, northing } = latLngToUtm(centerLat, centerLng);

  // UTM bounding box of the desired crop area (padding is already in meters)
  const cropMinE = easting - paddingMeters;
  const cropMaxE = easting + paddingMeters;
  const cropMinN = northing - paddingMeters;
  const cropMaxN = northing + paddingMeters;

  // GeoTIFF affine: origin is top-left corner [easting, northing]
  // pixel_x = (easting - origin_easting) / resolution_x
  // pixel_y = (origin_northing - northing) / resolution_y  (northing decreases downward)
  const [originE, originN] = meta.origin;
  const [resX, resY] = meta.resolution;

  const x1 = Math.floor((cropMinE - originE) / resX);
  const y1 = Math.floor((originN - cropMaxN) / resY); // higher northing = smaller y
  const x2 = Math.ceil((cropMaxE - originE) / resX);
  const y2 = Math.ceil((originN - cropMinN) / resY);

  // Clamp to image bounds
  const x = Math.max(0, Math.min(x1, meta.width - 1));
  const y = Math.max(0, Math.min(y1, meta.height - 1));
  const widthPx = Math.max(1, Math.min(x2 - x, meta.width - x));
  const heightPx = Math.max(1, Math.min(y2 - y, meta.height - y));

  // Store geographic bounds for the response
  const mPerDegreeLat = 111_320;
  const mPerDegreeLng = 111_320 * Math.cos((centerLat * Math.PI) / 180);
  const swLat = centerLat - paddingMeters / mPerDegreeLat;
  const swLng = centerLng - paddingMeters / mPerDegreeLng;
  const neLat = centerLat + paddingMeters / mPerDegreeLat;
  const neLng = centerLng + paddingMeters / mPerDegreeLng;

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
export { computeCropBounds, cropAndEncode };
export type { GeoTiffMeta, CropBounds };
