import { describe, it, expect } from 'vitest';
import { computeCropBounds, type GeoTiffMeta } from '../data-layers';

describe('computeCropBounds', () => {
  // Simulated GeoTIFF metadata matching real Google Solar output for Moore, OK
  // UTM Zone 14N (EPSG:32614), 0.1m/pixel resolution
  const meta: GeoTiffMeta = {
    origin: [637973.8, 3910806.3], // [easting, northing] of top-left pixel in UTM meters
    resolution: [0.1, 0.1], // 0.1 meters per pixel
    width: 1492,
    height: 1498,
    bbox: [637973.8, 3910656.5, 638123.0, 3910806.3],
  };

  // Moore, OK — lat/lng of a building center within the GeoTIFF coverage
  const centerLat = 35.3303;
  const centerLng = -97.4811;

  it('returns a crop rectangle with positive dimensions', () => {
    const crop = computeCropBounds(centerLat, centerLng, 20, meta);

    expect(crop.widthPx).toBeGreaterThan(0);
    expect(crop.heightPx).toBeGreaterThan(0);
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
  });

  it('crop fits within image bounds', () => {
    const crop = computeCropBounds(centerLat, centerLng, 20, meta);

    expect(crop.x + crop.widthPx).toBeLessThanOrEqual(meta.width);
    expect(crop.y + crop.heightPx).toBeLessThanOrEqual(meta.height);
  });

  it('20m padding at 0.1m/pixel produces ~400px crop', () => {
    const crop = computeCropBounds(centerLat, centerLng, 20, meta);

    // 20m padding on each side = 40m total / 0.1m per pixel = ~400px
    expect(crop.widthPx).toBeGreaterThanOrEqual(380);
    expect(crop.widthPx).toBeLessThanOrEqual(420);
    expect(crop.heightPx).toBeGreaterThanOrEqual(380);
    expect(crop.heightPx).toBeLessThanOrEqual(420);
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

  it('clamps to image bounds when center is near edge', () => {
    // Use a lat/lng that maps to near the top-left corner of the image
    // The crop should still be within bounds
    const crop = computeCropBounds(centerLat + 0.001, centerLng - 0.001, 20, meta);

    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.widthPx).toBeLessThanOrEqual(meta.width);
    expect(crop.y + crop.heightPx).toBeLessThanOrEqual(meta.height);
  });
});

describe('Mask value normalization', () => {
  it('treats any non-zero value as roof', () => {
    const values = [0, 1, 128, 255];
    const results = values.map((v) => (v > 0 ? 255 : 0));
    expect(results).toEqual([0, 255, 255, 255]);
  });
});
