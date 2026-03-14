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
export { computeCropBounds, cropAndEncode };
export type { GeoTiffMeta, CropBounds };
