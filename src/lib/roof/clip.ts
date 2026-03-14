import type { Point2D, Polygon2D } from './types';

/**
 * Sutherland-Hodgman polygon clipping against a half-plane.
 * The half-plane is defined by the perpendicular bisector of centerA→centerB.
 * Keeps the side containing centerA.
 */
export function clipPolygonByHalfPlane(
  polygon: Polygon2D,
  centerA: Point2D,
  centerB: Point2D,
): Polygon2D {
  if (polygon.length === 0) return [];

  const mx = (centerA.x + centerB.x) / 2;
  const my = (centerA.y + centerB.y) / 2;
  const nx = centerA.x - centerB.x;
  const ny = centerA.y - centerB.y;

  const dist = (p: Point2D) => (p.x - mx) * nx + (p.y - my) * ny;

  const output: Point2D[] = [];
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % n];
    const dCurrent = dist(current);
    const dNext = dist(next);

    if (dCurrent >= 0) {
      output.push(current);
      if (dNext < 0) {
        output.push(intersect(current, next, dCurrent, dNext));
      }
    } else if (dNext >= 0) {
      output.push(intersect(current, next, dCurrent, dNext));
    }
  }

  return output;
}

function intersect(a: Point2D, b: Point2D, dA: number, dB: number): Point2D {
  const t = dA / (dA - dB);
  return {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };
}

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface SegmentInfo {
  center: Point2D;
  bbox: AABB;
}

/**
 * Find pairs of segments that are truly adjacent:
 * - Bounding boxes overlap
 * - Centers are on opposite sides of the overlap region
 */
export function findAdjacentPairs(segments: SegmentInfo[]): [number, number][] {
  const pairs: [number, number][] = [];

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const a = segments[i];
      const b = segments[j];

      const overlapMinX = Math.max(a.bbox.minX, b.bbox.minX);
      const overlapMaxX = Math.min(a.bbox.maxX, b.bbox.maxX);
      const overlapMinY = Math.max(a.bbox.minY, b.bbox.minY);
      const overlapMaxY = Math.min(a.bbox.maxY, b.bbox.maxY);

      if (overlapMinX >= overlapMaxX || overlapMinY >= overlapMaxY) {
        continue;
      }

      const overlapMidX = (overlapMinX + overlapMaxX) / 2;
      const overlapMidY = (overlapMinY + overlapMaxY) / 2;

      const dxA = a.center.x - overlapMidX;
      const dyA = a.center.y - overlapMidY;
      const dxB = b.center.x - overlapMidX;
      const dyB = b.center.y - overlapMidY;

      const dot = dxA * dxB + dyA * dyB;
      if (dot < 0) {
        pairs.push([i, j]);
      }
    }
  }

  return pairs;
}
