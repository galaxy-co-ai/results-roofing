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
