import { describe, it, expect } from 'vitest';
import { buildRoofGeometry } from '../facet-geometry';
import type { RawRoofSegment } from '../types';

// Helper: create a segment with center offset from a base lat/lng
function makeSegment(
  pitchDeg: number,
  azimuthDeg: number,
  centerLatOffset: number,
  centerLngOffset: number,
  halfWidthDeg: number,
  planeHeight: number,
): RawRoofSegment {
  const baseLat = 35.3303;
  const baseLng = -97.4811;
  const lat = baseLat + centerLatOffset;
  const lng = baseLng + centerLngOffset;
  return {
    pitchDegrees: pitchDeg,
    azimuthDegrees: azimuthDeg,
    stats: { areaMeters2: 50 },
    center: { latitude: lat, longitude: lng },
    boundingBox: {
      sw: { latitude: lat - halfWidthDeg, longitude: lng - halfWidthDeg },
      ne: { latitude: lat + halfWidthDeg, longitude: lng + halfWidthDeg },
    },
    planeHeightAtCenterMeters: planeHeight,
  };
}

const buildingCenter = { lat: 35.3303, lng: -97.4811 };

describe('buildRoofGeometry', () => {
  it('returns null for empty segments', () => {
    const result = buildRoofGeometry([], buildingCenter);
    expect(result).toBeNull();
  });

  it('single flat segment produces a rectangular mesh', () => {
    const segments = [makeSegment(0, 0, 0, 0, 0.0001, 5)];
    const result = buildRoofGeometry(segments, buildingCenter)!;

    expect(result).not.toBeNull();
    expect(result.facetCount).toBe(1);
    expect(result.vertexCount).toBeGreaterThanOrEqual(4);
    expect(result.triangleCount).toBeGreaterThanOrEqual(2);
    expect(result.positions.length).toBe(result.vertexCount * 3);
    expect(result.normals.length).toBe(result.vertexCount * 3);
    expect(result.indices.length).toBe(result.triangleCount * 3);
  });

  it('simple gable: 2 segments with opposing azimuth produce 2 facets', () => {
    // North-facing slope + south-facing slope = gable roof
    const segments = [
      makeSegment(30, 0, 0.00005, 0, 0.0001, 5),   // north-facing
      makeSegment(30, 180, -0.00005, 0, 0.0001, 5), // south-facing
    ];
    const result = buildRoofGeometry(segments, buildingCenter)!;

    expect(result).not.toBeNull();
    expect(result.facetCount).toBe(2);
    expect(result.triangleCount).toBeGreaterThanOrEqual(4); // at least 2 triangles per facet
  });

  it('hip roof: 4 segments produce 4 facets', () => {
    const d = 0.00004;
    const segments = [
      makeSegment(30, 0, d, 0, 0.0001, 5),    // north
      makeSegment(30, 90, 0, d, 0.0001, 5),    // east
      makeSegment(30, 180, -d, 0, 0.0001, 5),  // south
      makeSegment(30, 270, 0, -d, 0.0001, 5),  // west
    ];
    const result = buildRoofGeometry(segments, buildingCenter)!;

    expect(result).not.toBeNull();
    expect(result.facetCount).toBe(4);
  });

  it('mesh is centered at origin', () => {
    const segments = [makeSegment(20, 180, 0, 0, 0.0001, 5)];
    const result = buildRoofGeometry(segments, buildingCenter)!;

    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < result.positions.length; i += 3) {
      minX = Math.min(minX, result.positions[i]);
      maxX = Math.max(maxX, result.positions[i]);
      minZ = Math.min(minZ, result.positions[i + 2]);
      maxZ = Math.max(maxZ, result.positions[i + 2]);
    }
    expect(Math.abs((minX + maxX) / 2)).toBeLessThan(0.1);
    expect(Math.abs((minZ + maxZ) / 2)).toBeLessThan(0.1);
  });

  it('normals have unit length', () => {
    const segments = [makeSegment(30, 180, 0, 0, 0.0001, 5)];
    const result = buildRoofGeometry(segments, buildingCenter)!;

    for (let i = 0; i < result.normals.length; i += 3) {
      const len = Math.sqrt(
        result.normals[i] ** 2 + result.normals[i + 1] ** 2 + result.normals[i + 2] ** 2,
      );
      expect(len).toBeCloseTo(1.0, 2);
    }
  });

  it('all indices reference valid vertices', () => {
    const d = 0.00004;
    const segments = [
      makeSegment(30, 0, d, 0, 0.0001, 5),
      makeSegment(30, 180, -d, 0, 0.0001, 5),
    ];
    const result = buildRoofGeometry(segments, buildingCenter)!;

    for (let i = 0; i < result.indices.length; i++) {
      expect(result.indices[i]).toBeLessThan(result.vertexCount);
    }
  });

  it('skips segments without boundingBox', () => {
    const segments: RawRoofSegment[] = [
      { pitchDegrees: 30, azimuthDegrees: 0, stats: { areaMeters2: 50 } },
    ];
    const result = buildRoofGeometry(segments, buildingCenter);
    expect(result).toBeNull();
  });
});
