import { describe, it, expect } from 'vitest';
import { clipPolygonByLine } from '../clip';

type Point2D = [number, number]; // [x, z]

describe('clipPolygonByLine', () => {
  // Unit square: (0,0), (1,0), (1,1), (0,1)
  const square: Point2D[] = [[0,0], [1,0], [1,1], [0,1]];

  it('returns full polygon when entirely on kept side', () => {
    // Line at x=-1, keep right side (where square is)
    const result = clipPolygonByLine(square, [-1, 0], [0, 1], [0.5, 0.5]);
    expect(result.length).toBe(4);
  });

  it('returns empty when entirely on clipped side', () => {
    // Line at x=2, keep right side (square is left)
    const result = clipPolygonByLine(square, [2, 0], [0, 1], [5, 0.5]);
    expect(result.length).toBe(0);
  });

  it('clips square in half vertically', () => {
    // Line at x=0.5, keep the right half (x > 0.5)
    const result = clipPolygonByLine(square, [0.5, 0], [0, 1], [1, 0.5]);
    expect(result.length).toBe(4); // rectangle
    // All x values should be >= 0.5
    for (const [x] of result) {
      expect(x).toBeGreaterThanOrEqual(0.5 - 0.001);
    }
  });

  it('clips square diagonally', () => {
    // Diagonal line from (0,0) to (1,1), keep upper-left triangle
    const result = clipPolygonByLine(square, [0, 0], [1, 1], [0, 1]);
    // Result may include collinear points on the clip line (vertices at distance 0)
    // but all points must be on or above the diagonal (x <= z)
    expect(result.length).toBeGreaterThanOrEqual(3);
    for (const [x, z] of result) {
      expect(x).toBeLessThanOrEqual(z + 0.001);
    }
  });

  it('returns empty for degenerate polygon', () => {
    const result = clipPolygonByLine([[0,0]], [0.5, 0], [0, 1], [1, 0]);
    expect(result.length).toBe(0);
  });
});
