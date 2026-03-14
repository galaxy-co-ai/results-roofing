import { describe, it, expect } from 'vitest';
import { clipPolygonByHalfPlane, findAdjacentPairs } from '../clip';
import type { Point2D, Polygon2D } from '../types';

describe('clipPolygonByHalfPlane', () => {
  it('clips a square in half along a vertical bisector', () => {
    const square: Polygon2D = [
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 },
    ];
    const centerA: Point2D = { x: 2, y: 5 };
    const centerB: Point2D = { x: 8, y: 5 };
    const clipped = clipPolygonByHalfPlane(square, centerA, centerB);
    expect(clipped.length).toBe(4);
    expect(clipped.every((p) => p.x <= 5.01)).toBe(true);
    expect(clipped.every((p) => p.x >= -0.01)).toBe(true);
  });

  it('returns full polygon when entirely on its side', () => {
    const square: Polygon2D = [
      { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 },
    ];
    const clipped = clipPolygonByHalfPlane(square, { x: 2, y: 2 }, { x: 20, y: 2 });
    expect(clipped.length).toBe(4);
  });

  it('returns empty polygon when entirely on the other side', () => {
    const square: Polygon2D = [
      { x: 20, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }, { x: 20, y: 10 },
    ];
    const clipped = clipPolygonByHalfPlane(square, { x: 2, y: 5 }, { x: 8, y: 5 });
    expect(clipped.length).toBe(0);
  });
});

describe('findAdjacentPairs', () => {
  it('detects two overlapping segments with centers on opposite sides', () => {
    const segments = [
      { center: { x: 2, y: 5 }, bbox: { minX: 0, minY: 0, maxX: 6, maxY: 10 } },
      { center: { x: 8, y: 5 }, bbox: { minX: 4, minY: 0, maxX: 10, maxY: 10 } },
    ];
    const pairs = findAdjacentPairs(segments);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toEqual([0, 1]);
  });

  it('does NOT pair segments with centers on same side', () => {
    const segments = [
      { center: { x: 2, y: 5 }, bbox: { minX: 0, minY: 0, maxX: 8, maxY: 10 } },
      { center: { x: 3, y: 5 }, bbox: { minX: 1, minY: 0, maxX: 9, maxY: 10 } },
    ];
    expect(findAdjacentPairs(segments)).toHaveLength(0);
  });

  it('returns empty for non-overlapping segments', () => {
    const segments = [
      { center: { x: 2, y: 5 }, bbox: { minX: 0, minY: 0, maxX: 4, maxY: 10 } },
      { center: { x: 8, y: 5 }, bbox: { minX: 6, minY: 0, maxX: 10, maxY: 10 } },
    ];
    expect(findAdjacentPairs(segments)).toHaveLength(0);
  });
});
