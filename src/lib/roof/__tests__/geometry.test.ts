import { describe, it, expect } from 'vitest';
import { latLngToLocal, processSegments } from '../geometry';
import type { RawRoofSegment } from '../types';

describe('latLngToLocal', () => {
  it('converts lat/lng to local meters relative to center', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const point = { latitude: 30.001, longitude: -97.001 };
    const local = latLngToLocal(point, center);
    expect(local.y).toBeCloseTo(111.32, 0);
    expect(Math.abs(local.x)).toBeCloseTo(96.4, 0);
  });

  it('returns origin for identical points', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const local = latLngToLocal(center, center);
    expect(local.x).toBeCloseTo(0);
    expect(local.y).toBeCloseTo(0);
  });
});

describe('processSegments', () => {
  it('produces facets from a simple 2-segment gable roof', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const segments: RawRoofSegment[] = [
      {
        pitchDegrees: 26.57, azimuthDegrees: 180,
        stats: { areaMeters2: 50 },
        center: { latitude: 30.0001, longitude: -97.0001 },
        boundingBox: { sw: { latitude: 29.9999, longitude: -97.0002 }, ne: { latitude: 30.0002, longitude: -97.0 } },
        planeHeightAtCenterMeters: 5,
      },
      {
        pitchDegrees: 26.57, azimuthDegrees: 0,
        stats: { areaMeters2: 50 },
        center: { latitude: 30.0001, longitude: -96.9999 },
        boundingBox: { sw: { latitude: 29.9999, longitude: -97.0 }, ne: { latitude: 30.0002, longitude: -96.9998 } },
        planeHeightAtCenterMeters: 5,
      },
    ];
    const facets = processSegments(segments, center);
    expect(facets).toHaveLength(2);
    facets.forEach((f) => {
      expect(f.vertices3D.length).toBeGreaterThanOrEqual(3);
      expect(f.pitchDegrees).toBeCloseTo(26.57);
      expect(f.widthMeters).toBeGreaterThan(0);
      expect(f.depthMeters).toBeGreaterThan(0);
    });
  });

  it('tilts north-facing facet correctly (high edge at back)', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const segments: RawRoofSegment[] = [
      {
        pitchDegrees: 30, azimuthDegrees: 0,
        stats: { areaMeters2: 50 },
        center: { latitude: 30.0001, longitude: -97.0 },
        boundingBox: { sw: { latitude: 29.9999, longitude: -97.0001 }, ne: { latitude: 30.0003, longitude: -96.9999 } },
        planeHeightAtCenterMeters: 5,
      },
    ];
    const facets = processSegments(segments, center);
    expect(facets).toHaveLength(1);
    const verts = facets[0].vertices3D;
    // North-facing: downslope toward north (-Z in Three.js), so southern edge (higher Z) should be higher Y
    const sortedByZ = [...verts].sort((a, b) => b[2] - a[2]);
    const southernY = sortedByZ[0][1];
    const northernY = sortedByZ[sortedByZ.length - 1][1];
    expect(southernY).toBeGreaterThan(northernY);
  });

  it('skips segments without boundingBox', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const segments: RawRoofSegment[] = [
      { pitchDegrees: 20, azimuthDegrees: 180, stats: { areaMeters2: 50 } },
    ];
    expect(processSegments(segments, center)).toHaveLength(0);
  });

  it('estimates height when planeHeightAtCenterMeters is missing', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const segments: RawRoofSegment[] = [
      {
        pitchDegrees: 26.57, azimuthDegrees: 180,
        stats: { areaMeters2: 50 },
        center: { latitude: 30.0001, longitude: -97.0001 },
        boundingBox: { sw: { latitude: 29.9999, longitude: -97.0002 }, ne: { latitude: 30.0002, longitude: -97.0 } },
      },
    ];
    const facets = processSegments(segments, center);
    expect(facets).toHaveLength(1);
    const maxY = Math.max(...facets[0].vertices3D.map((v) => v[1]));
    expect(maxY).toBeGreaterThan(0);
  });
});
