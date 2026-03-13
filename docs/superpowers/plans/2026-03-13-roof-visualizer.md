# 3D Roof Visualizer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/portal/roof` page that renders an interactive 3D model of the homeowner's roof from Google Solar data, with shingle material/color selection per pricing tier.

**Architecture:** Client-side geometry generation from Google Solar `roofSegmentStats` stored in `measurements.rawResponse`. React Three Fiber renders the 3D scene. Half-plane clipping resolves overlapping axis-aligned bounding boxes into clean facets. Shingle catalog is a static config with placeholder textures.

**Tech Stack:** Next.js 14 App Router, React Three Fiber ^8.18.0, Drei ^9.122.0, Three.js ^0.170.0, Drizzle ORM, Clerk auth, React Query, Zod

**Spec:** `docs/superpowers/specs/2026-03-13-roof-visualizer-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/lib/roof/types.ts` | Shared types: RoofSegment, ProcessedFacet, CameraPreset, ShingleOption |
| `src/lib/roof/clip.ts` | Sutherland-Hodgman polygon clipping + adjacency detection |
| `src/lib/roof/geometry.ts` | Coordinate conversion, facet generation, overlap resolution |
| `src/lib/roof/shingle-catalog.ts` | Static shingle options per tier with hex + texture path |
| `src/lib/roof/__tests__/clip.test.ts` | Unit tests for polygon clipping |
| `src/lib/roof/__tests__/geometry.test.ts` | Unit tests for coordinate conversion + facet generation |
| `src/lib/roof/schema.ts` | Zod schema for validating rawResponse segment data |
| `src/hooks/useRoofGeometry.ts` | React hook: Zod-validate rawResponse → memoized facet geometry array |
| `src/hooks/useRoofData.ts` | React Query hook for `/api/portal/roof-data` |
| `src/components/features/roof/RoofViewer.tsx` | R3F Canvas, lights, shadows, CameraControls |
| `src/components/features/roof/RoofModel.tsx` | Roof mesh assembly (renders all facets) |
| `src/components/features/roof/RoofFacet.tsx` | Single facet mesh with texture |
| `src/components/features/roof/ShingleSelector.tsx` | Tier tabs + color swatches |
| `src/components/features/roof/RoofStats.tsx` | Measurement stats card |
| `src/components/features/roof/CameraPresets.tsx` | Preset view buttons with smooth camera transitions |
| `src/components/features/roof/RoofPageSkeleton.tsx` | Loading skeleton for all loading phases |
| `src/app/portal/roof/page.tsx` | Portal page: auth, phase gate, data fetch, dynamic R3F import |
| `src/app/portal/roof/page.module.css` | Page layout styles (desktop 65/35 split, mobile stack) |
| `src/app/api/portal/roof-data/route.ts` | API: extract segments from rawResponse, auth, return data |
| `public/textures/shingles/*.jpg` | ~18 placeholder solid-color textures (512x512) |

### Modified Files

| File | Change |
|------|--------|
| `src/components/features/portal/PortalSidebarV2/SidebarContext.tsx` | Add `hasRoofData: boolean` to context value |
| `src/components/features/portal/PortalSidebarV2/PortalSidebarV2.tsx` | Conditionally include "My Roof" nav item |
| `src/components/features/portal/BottomTabBar/BottomTabBar.tsx` | Add `useSidebar` import, conditionally include "My Roof" tab, icon-only CSS for <375px |
| `src/components/features/portal/PortalShell.tsx` | Fetch measurement status, pass `hasRoofData` into SidebarProvider |
| `src/app/api/portal/orders/[id]/route.ts` | Add `measurement: { vendor, status }` to response |
| `src/hooks/useOrders.ts` | Add `measurement` field to `OrderDetailsResponse` type |

---

## Chunk 1: Core Geometry Engine

### Task 1: Types

**Files:**
- Create: `src/lib/roof/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// src/lib/roof/types.ts

/** Raw segment from Google Solar roofSegmentStats */
export interface RawRoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  stats: { areaMeters2: number };
  center?: { latitude: number; longitude: number };
  boundingBox?: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
  planeHeightAtCenterMeters?: number;
}

/** 2D point in local meter coordinates */
export interface Point2D {
  x: number;
  y: number;
}

/** A polygon in local 2D space (before pitch tilt) */
export type Polygon2D = Point2D[];

/** Processed facet ready for Three.js rendering */
export interface ProcessedFacet {
  /** Clipped polygon vertices in local meters (2D, before tilt) */
  polygon: Polygon2D;
  /** Polygon vertices in 3D after pitch tilt and height placement */
  vertices3D: [number, number, number][];
  /** Pitch angle in degrees */
  pitchDegrees: number;
  /** Compass direction in degrees (0=N, 90=E, 180=S, 270=W) */
  azimuthDegrees: number;
  /** Facet width in meters (for UV repeat) */
  widthMeters: number;
  /** Facet depth in meters (for UV repeat) */
  depthMeters: number;
  /** Center point in local meters */
  center: Point2D;
}

/** Camera preset for the viewer */
export interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

/** Shingle option for the catalog */
export interface ShingleOption {
  id: string;
  tier: 'good' | 'better' | 'best';
  name: string;
  hex: string;
  texture: string;
  brand: string;
}

/** Response from /api/portal/roof-data */
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
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/roof/types.ts
git commit -m "feat(roof): add shared types for 3D roof visualizer"
```

---

### Task 2: Polygon Clipping Utility

**Files:**
- Create: `src/lib/roof/clip.ts`
- Create: `src/lib/roof/__tests__/clip.test.ts`

- [ ] **Step 1: Write failing tests for polygon clipping**

```typescript
// src/lib/roof/__tests__/clip.test.ts
import { describe, it, expect } from 'vitest';
import { clipPolygonByHalfPlane, findAdjacentPairs } from '../clip';
import type { Point2D, Polygon2D } from '../types';

describe('clipPolygonByHalfPlane', () => {
  it('clips a square in half along a vertical bisector', () => {
    const square: Polygon2D = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    // Bisector at x=5, keep left side (center A at x=2, center B at x=8)
    const centerA: Point2D = { x: 2, y: 5 };
    const centerB: Point2D = { x: 8, y: 5 };
    const clipped = clipPolygonByHalfPlane(square, centerA, centerB);

    // Should produce a rectangle from x=0 to x=5
    expect(clipped.length).toBe(4);
    expect(clipped.every((p) => p.x <= 5.01)).toBe(true);
    expect(clipped.every((p) => p.x >= -0.01)).toBe(true);
  });

  it('returns full polygon when entirely on its side', () => {
    const square: Polygon2D = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
    ];
    const centerA: Point2D = { x: 2, y: 2 };
    const centerB: Point2D = { x: 20, y: 2 };
    const clipped = clipPolygonByHalfPlane(square, centerA, centerB);
    expect(clipped.length).toBe(4);
  });

  it('returns empty polygon when entirely on the other side', () => {
    const square: Polygon2D = [
      { x: 20, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 10 },
      { x: 20, y: 10 },
    ];
    const centerA: Point2D = { x: 2, y: 5 };
    const centerB: Point2D = { x: 8, y: 5 };
    const clipped = clipPolygonByHalfPlane(square, centerA, centerB);
    expect(clipped.length).toBe(0);
  });

  it('clips a rectangle into a triangle for diagonal bisector', () => {
    const rect: Polygon2D = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    // Centers diagonally placed
    const centerA: Point2D = { x: 2, y: 2 };
    const centerB: Point2D = { x: 8, y: 8 };
    const clipped = clipPolygonByHalfPlane(rect, centerA, centerB);
    // Should keep the lower-left triangle portion
    expect(clipped.length).toBeGreaterThanOrEqual(3);
    expect(clipped.length).toBeLessThanOrEqual(5);
  });
});

describe('findAdjacentPairs', () => {
  it('detects two overlapping segments with centers on opposite sides', () => {
    const segments = [
      {
        center: { x: 2, y: 5 },
        bbox: { minX: 0, minY: 0, maxX: 6, maxY: 10 },
      },
      {
        center: { x: 8, y: 5 },
        bbox: { minX: 4, minY: 0, maxX: 10, maxY: 10 },
      },
    ];
    const pairs = findAdjacentPairs(segments);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toEqual([0, 1]);
  });

  it('does NOT pair segments that overlap but centers on same side', () => {
    const segments = [
      {
        center: { x: 2, y: 5 },
        bbox: { minX: 0, minY: 0, maxX: 8, maxY: 10 },
      },
      {
        center: { x: 3, y: 5 },
        bbox: { minX: 1, minY: 0, maxX: 9, maxY: 10 },
      },
    ];
    const pairs = findAdjacentPairs(segments);
    // Centers are on same side of the overlap — should not be paired
    // (both at x=2 and x=3, overlap from x=1 to x=8 — centers NOT on opposite sides)
    expect(pairs).toHaveLength(0);
  });

  it('returns empty for non-overlapping segments', () => {
    const segments = [
      {
        center: { x: 2, y: 5 },
        bbox: { minX: 0, minY: 0, maxX: 4, maxY: 10 },
      },
      {
        center: { x: 8, y: 5 },
        bbox: { minX: 6, minY: 0, maxX: 10, maxY: 10 },
      },
    ];
    const pairs = findAdjacentPairs(segments);
    expect(pairs).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx vitest run src/lib/roof/__tests__/clip.test.ts 2>&1 | tail -10`
Expected: FAIL — module not found

- [ ] **Step 3: Implement polygon clipping**

```typescript
// src/lib/roof/clip.ts
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

  // Bisector midpoint and normal
  const mx = (centerA.x + centerB.x) / 2;
  const my = (centerA.y + centerB.y) / 2;
  // Normal pointing from B toward A (keeps A's side)
  const nx = centerA.x - centerB.x;
  const ny = centerA.y - centerB.y;

  // Signed distance from a point to the clipping line
  const dist = (p: Point2D) => (p.x - mx) * nx + (p.y - my) * ny;

  const output: Point2D[] = [];
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % n];
    const dCurrent = dist(current);
    const dNext = dist(next);

    if (dCurrent >= 0) {
      // Current is inside
      output.push(current);
      if (dNext < 0) {
        // Next is outside — add intersection
        output.push(intersect(current, next, dCurrent, dNext));
      }
    } else if (dNext >= 0) {
      // Current is outside, next is inside — add intersection
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

/** Axis-aligned bounding box */
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

      // Check bounding box overlap
      const overlapMinX = Math.max(a.bbox.minX, b.bbox.minX);
      const overlapMaxX = Math.min(a.bbox.maxX, b.bbox.maxX);
      const overlapMinY = Math.max(a.bbox.minY, b.bbox.minY);
      const overlapMaxY = Math.min(a.bbox.maxY, b.bbox.maxY);

      if (overlapMinX >= overlapMaxX || overlapMinY >= overlapMaxY) {
        continue; // No overlap
      }

      // Check centers are on opposite sides of the overlap region
      // Use the midpoint of the overlap as reference
      const overlapMidX = (overlapMinX + overlapMaxX) / 2;
      const overlapMidY = (overlapMinY + overlapMaxY) / 2;

      // Direction from overlap center to each segment center
      const dxA = a.center.x - overlapMidX;
      const dyA = a.center.y - overlapMidY;
      const dxB = b.center.x - overlapMidX;
      const dyB = b.center.y - overlapMidY;

      // Dot product of direction vectors — negative means opposite sides
      const dot = dxA * dxB + dyA * dyB;
      if (dot < 0) {
        pairs.push([i, j]);
      }
    }
  }

  return pairs;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx vitest run src/lib/roof/__tests__/clip.test.ts 2>&1 | tail -15`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/roof/clip.ts src/lib/roof/__tests__/clip.test.ts
git commit -m "feat(roof): add Sutherland-Hodgman polygon clipping + adjacency detection"
```

---

### Task 3: Geometry Engine

**Files:**
- Create: `src/lib/roof/geometry.ts`
- Create: `src/lib/roof/__tests__/geometry.test.ts`

- [ ] **Step 1: Write failing tests for geometry conversion**

```typescript
// src/lib/roof/__tests__/geometry.test.ts
import { describe, it, expect } from 'vitest';
import { latLngToLocal, processSegments } from '../geometry';
import type { RawRoofSegment } from '../types';

describe('latLngToLocal', () => {
  it('converts lat/lng to local meters relative to center', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const point = { latitude: 30.001, longitude: -97.001 };
    const local = latLngToLocal(point, center);

    // ~111m per degree latitude
    expect(local.y).toBeCloseTo(111.32, 0);
    // longitude scaled by cos(30°) ≈ 0.866
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
        pitchDegrees: 26.57, // ~6/12
        azimuthDegrees: 180, // south-facing
        stats: { areaMeters2: 50 },
        center: { latitude: 30.0001, longitude: -97.0001 },
        boundingBox: {
          sw: { latitude: 29.9999, longitude: -97.0002 },
          ne: { latitude: 30.0002, longitude: -97.0 },
        },
        planeHeightAtCenterMeters: 5,
      },
      {
        pitchDegrees: 26.57,
        azimuthDegrees: 0, // north-facing
        stats: { areaMeters2: 50 },
        center: { latitude: 30.0001, longitude: -96.9999 },
        boundingBox: {
          sw: { latitude: 29.9999, longitude: -97.0 },
          ne: { latitude: 30.0002, longitude: -96.9998 },
        },
        planeHeightAtCenterMeters: 5,
      },
    ];

    const facets = processSegments(segments, center);
    expect(facets).toHaveLength(2);
    // Each facet should have 3D vertices
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
        pitchDegrees: 30,
        azimuthDegrees: 0, // north-facing: slopes down toward north
        stats: { areaMeters2: 50 },
        center: { latitude: 30.0001, longitude: -97.0 },
        boundingBox: {
          sw: { latitude: 29.9999, longitude: -97.0001 },
          ne: { latitude: 30.0003, longitude: -96.9999 },
        },
        planeHeightAtCenterMeters: 5,
      },
    ];
    const facets = processSegments(segments, center);
    expect(facets).toHaveLength(1);
    const verts = facets[0].vertices3D;
    // In Three.js: Y=up, Z=toward camera. North = -Z.
    // North-facing means downslope toward -Z, so the southern edge (higher Z) should be higher Y.
    const sortedByZ = [...verts].sort((a, b) => b[2] - a[2]); // highest Z first (south)
    const southernY = sortedByZ[0][1];
    const northernY = sortedByZ[sortedByZ.length - 1][1];
    expect(southernY).toBeGreaterThan(northernY);
  });

  it('skips segments without boundingBox', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const segments: RawRoofSegment[] = [
      {
        pitchDegrees: 20,
        azimuthDegrees: 180,
        stats: { areaMeters2: 50 },
        // no boundingBox or center
      },
    ];
    const facets = processSegments(segments, center);
    expect(facets).toHaveLength(0);
  });

  it('estimates height when planeHeightAtCenterMeters is missing', () => {
    const center = { latitude: 30.0, longitude: -97.0 };
    const segments: RawRoofSegment[] = [
      {
        pitchDegrees: 26.57,
        azimuthDegrees: 180,
        stats: { areaMeters2: 50 },
        center: { latitude: 30.0001, longitude: -97.0001 },
        boundingBox: {
          sw: { latitude: 29.9999, longitude: -97.0002 },
          ne: { latitude: 30.0002, longitude: -97.0 },
        },
        // no planeHeightAtCenterMeters
      },
    ];
    const facets = processSegments(segments, center);
    expect(facets).toHaveLength(1);
    // Height should be estimated, not zero
    const maxY = Math.max(...facets[0].vertices3D.map((v) => v[1]));
    expect(maxY).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx vitest run src/lib/roof/__tests__/geometry.test.ts 2>&1 | tail -10`
Expected: FAIL — module not found

- [ ] **Step 3: Implement geometry engine**

```typescript
// src/lib/roof/geometry.ts
import type { RawRoofSegment, Point2D, Polygon2D, ProcessedFacet } from './types';
import { clipPolygonByHalfPlane, findAdjacentPairs } from './clip';
import type { AABB } from './clip';

const METERS_PER_DEGREE = 111320;
const DEG_TO_RAD = Math.PI / 180;
const DEFAULT_EAVE_HEIGHT = 3; // meters

/** Convert a lat/lng point to local meters relative to a center point */
export function latLngToLocal(
  point: { latitude: number; longitude: number },
  center: { latitude: number; longitude: number },
): Point2D {
  const cosLat = Math.cos(center.latitude * DEG_TO_RAD);
  return {
    x: (point.longitude - center.longitude) * cosLat * METERS_PER_DEGREE,
    y: (point.latitude - center.latitude) * METERS_PER_DEGREE,
  };
}

/** Convert bounding box to local-space AABB */
function bboxToLocal(
  bbox: NonNullable<RawRoofSegment['boundingBox']>,
  center: { latitude: number; longitude: number },
): AABB {
  const sw = latLngToLocal(bbox.sw, center);
  const ne = latLngToLocal(bbox.ne, center);
  return {
    minX: Math.min(sw.x, ne.x),
    minY: Math.min(sw.y, ne.y),
    maxX: Math.max(sw.x, ne.x),
    maxY: Math.max(sw.y, ne.y),
  };
}

/** Convert AABB to polygon (CCW winding) */
function aabbToPolygon(aabb: AABB): Polygon2D {
  return [
    { x: aabb.minX, y: aabb.minY },
    { x: aabb.maxX, y: aabb.minY },
    { x: aabb.maxX, y: aabb.maxY },
    { x: aabb.minX, y: aabb.maxY },
  ];
}

/** Compute polygon width/depth from its bounding extents */
function polygonExtents(polygon: Polygon2D): { width: number; depth: number } {
  if (polygon.length === 0) return { width: 0, depth: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of polygon) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { width: maxX - minX, depth: maxY - minY };
}

/** Compute centroid of a polygon */
function polygonCenter(polygon: Polygon2D): Point2D {
  let sx = 0, sy = 0;
  for (const p of polygon) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / polygon.length, y: sy / polygon.length };
}

/**
 * Tilt a 2D polygon into 3D space by applying pitch and azimuth.
 * - azimuthDegrees: direction the facet faces (0=N, 90=E, 180=S, 270=W)
 * - pitchDegrees: slope angle
 * - baseHeight: ground-level Y offset
 */
function tiltPolygon(
  polygon: Polygon2D,
  pitchDegrees: number,
  azimuthDegrees: number,
  baseHeight: number,
): [number, number, number][] {
  const center = polygonCenter(polygon);
  const pitchRad = pitchDegrees * DEG_TO_RAD;
  const azRad = azimuthDegrees * DEG_TO_RAD;

  // Downslope direction in local 2D space (azimuth points downhill)
  // Azimuth: 0=N(+y), 90=E(+x), 180=S(-y), 270=W(-x)
  const downX = Math.sin(azRad);
  const downY = Math.cos(azRad); // +y = north in local space

  return polygon.map((p) => {
    // Offset from facet center
    const dx = p.x - center.x;
    const dy = p.y - center.y;

    // Project offset onto downslope axis
    const alongSlope = dx * downX + dy * downY;

    // Height varies along the slope direction
    const heightOffset = -alongSlope * Math.sin(pitchRad);

    // Three.js: X=right, Y=up, Z=toward camera
    return [p.x, baseHeight + heightOffset, -p.y] as [number, number, number];
  });
}

/**
 * Process raw Google Solar segments into renderable 3D facets.
 */
export function processSegments(
  segments: RawRoofSegment[],
  buildingCenter: { latitude: number; longitude: number },
): ProcessedFacet[] {
  // 1. Convert segments to local space, skip those without bounding boxes
  const localSegments: {
    polygon: Polygon2D;
    center: Point2D;
    bbox: AABB;
    raw: RawRoofSegment;
  }[] = [];

  for (const seg of segments) {
    if (!seg.boundingBox) continue;

    const bbox = bboxToLocal(seg.boundingBox, buildingCenter);
    const centerPoint = seg.center
      ? latLngToLocal(seg.center, buildingCenter)
      : { x: (bbox.minX + bbox.maxX) / 2, y: (bbox.minY + bbox.maxY) / 2 };

    localSegments.push({
      polygon: aabbToPolygon(bbox),
      center: centerPoint,
      bbox,
      raw: seg,
    });
  }

  if (localSegments.length === 0) return [];

  // 2. Find adjacent pairs and clip overlaps
  const segInfos = localSegments.map((s) => ({ center: s.center, bbox: s.bbox }));
  const pairs = findAdjacentPairs(segInfos);

  // Apply half-plane clipping for each adjacent pair
  for (const [i, j] of pairs) {
    localSegments[i].polygon = clipPolygonByHalfPlane(
      localSegments[i].polygon,
      localSegments[i].center,
      localSegments[j].center,
    );
    localSegments[j].polygon = clipPolygonByHalfPlane(
      localSegments[j].polygon,
      localSegments[j].center,
      localSegments[i].center,
    );
  }

  // 3. Determine base eave height
  const knownHeights = localSegments
    .map((s) => s.raw.planeHeightAtCenterMeters)
    .filter((h): h is number => h !== undefined);
  const baseEaveHeight = knownHeights.length > 0
    ? Math.min(...knownHeights)
    : DEFAULT_EAVE_HEIGHT;

  // 4. Build 3D facets
  return localSegments
    .filter((s) => s.polygon.length >= 3)
    .map((s) => {
      const { width, depth } = polygonExtents(s.polygon);
      const height = s.raw.planeHeightAtCenterMeters
        ?? (width / 2) * Math.tan(s.raw.pitchDegrees * DEG_TO_RAD) + baseEaveHeight;

      // Snap near-zero pitch to flat
      const pitch = s.raw.pitchDegrees < 2 ? 0 : s.raw.pitchDegrees;

      const vertices3D = tiltPolygon(s.polygon, pitch, s.raw.azimuthDegrees, height);

      return {
        polygon: s.polygon,
        vertices3D,
        pitchDegrees: pitch,
        azimuthDegrees: s.raw.azimuthDegrees,
        widthMeters: width,
        depthMeters: depth,
        center: polygonCenter(s.polygon),
      };
    });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx vitest run src/lib/roof/__tests__/geometry.test.ts 2>&1 | tail -15`
Expected: All tests PASS

- [ ] **Step 5: Run typecheck**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/roof/geometry.ts src/lib/roof/__tests__/geometry.test.ts
git commit -m "feat(roof): geometry engine — coordinate conversion, facet generation, overlap clipping"
```

---

### Task 4: Shingle Catalog

**Files:**
- Create: `src/lib/roof/shingle-catalog.ts`

- [ ] **Step 1: Create shingle catalog with placeholder textures**

```typescript
// src/lib/roof/shingle-catalog.ts
import type { ShingleOption } from './types';

export const SHINGLE_CATALOG: ShingleOption[] = [
  // Good — GAF Royal Sovereign (3-tab)
  { id: 'rs-slate',          tier: 'good', name: 'Slate',          hex: '#6b7280', texture: '/textures/shingles/rs-slate.jpg',          brand: 'GAF Royal Sovereign' },
  { id: 'rs-weathered-gray', tier: 'good', name: 'Weathered Gray', hex: '#9ca3af', texture: '/textures/shingles/rs-weathered-gray.jpg', brand: 'GAF Royal Sovereign' },
  { id: 'rs-autumn-brown',   tier: 'good', name: 'Autumn Brown',   hex: '#78716c', texture: '/textures/shingles/rs-autumn-brown.jpg',   brand: 'GAF Royal Sovereign' },
  { id: 'rs-charcoal',       tier: 'good', name: 'Charcoal',       hex: '#374151', texture: '/textures/shingles/rs-charcoal.jpg',       brand: 'GAF Royal Sovereign' },
  { id: 'rs-golden-cedar',   tier: 'good', name: 'Golden Cedar',   hex: '#a16207', texture: '/textures/shingles/rs-golden-cedar.jpg',   brand: 'GAF Royal Sovereign' },

  // Better — GAF Timberline HDZ (architectural)
  { id: 'hdz-charcoal',       tier: 'better', name: 'Charcoal',       hex: '#3a3a3c', texture: '/textures/shingles/hdz-charcoal.jpg',       brand: 'GAF Timberline HDZ' },
  { id: 'hdz-weathered-wood', tier: 'better', name: 'Weathered Wood', hex: '#8b7355', texture: '/textures/shingles/hdz-weathered-wood.jpg', brand: 'GAF Timberline HDZ' },
  { id: 'hdz-pewter-gray',    tier: 'better', name: 'Pewter Gray',    hex: '#7d8491', texture: '/textures/shingles/hdz-pewter-gray.jpg',    brand: 'GAF Timberline HDZ' },
  { id: 'hdz-barkwood',       tier: 'better', name: 'Barkwood',       hex: '#6d5c4b', texture: '/textures/shingles/hdz-barkwood.jpg',       brand: 'GAF Timberline HDZ' },
  { id: 'hdz-hickory',        tier: 'better', name: 'Hickory',        hex: '#5c4a3a', texture: '/textures/shingles/hdz-hickory.jpg',        brand: 'GAF Timberline HDZ' },
  { id: 'hdz-shakewood',      tier: 'better', name: 'Shakewood',      hex: '#a89279', texture: '/textures/shingles/hdz-shakewood.jpg',      brand: 'GAF Timberline HDZ' },
  { id: 'hdz-slate',          tier: 'better', name: 'Slate',          hex: '#4a5568', texture: '/textures/shingles/hdz-slate.jpg',          brand: 'GAF Timberline HDZ' },

  // Best — GAF Timberline AS II (designer)
  { id: 'as2-charcoal',       tier: 'best', name: 'Charcoal',        hex: '#2d2d30', texture: '/textures/shingles/as2-charcoal.jpg',       brand: 'GAF Timberline AS II' },
  { id: 'as2-pewter-gray',    tier: 'best', name: 'Pewter Gray',     hex: '#6b7280', texture: '/textures/shingles/as2-pewter-gray.jpg',    brand: 'GAF Timberline AS II' },
  { id: 'as2-barkwood',       tier: 'best', name: 'Barkwood',        hex: '#5c4a3a', texture: '/textures/shingles/as2-barkwood.jpg',       brand: 'GAF Timberline AS II' },
  { id: 'as2-weathered-wood', tier: 'best', name: 'Weathered Wood',  hex: '#7a6a55', texture: '/textures/shingles/as2-weathered-wood.jpg', brand: 'GAF Timberline AS II' },
  { id: 'as2-shakewood',      tier: 'best', name: 'Shakewood',       hex: '#9a8268', texture: '/textures/shingles/as2-shakewood.jpg',      brand: 'GAF Timberline AS II' },
  { id: 'as2-hunter-green',   tier: 'best', name: 'Hunter Green',    hex: '#2d4a3e', texture: '/textures/shingles/as2-hunter-green.jpg',   brand: 'GAF Timberline AS II' },
];

/** Get shingle options for a specific tier */
export function getShinglesForTier(tier: 'good' | 'better' | 'best'): ShingleOption[] {
  return SHINGLE_CATALOG.filter((s) => s.tier === tier);
}

/** Get all unique texture URLs for preloading */
export function getAllTextureUrls(): string[] {
  return SHINGLE_CATALOG.map((s) => s.texture);
}

/** Get the default shingle option for a tier (first in list) */
export function getDefaultShingle(tier: 'good' | 'better' | 'best'): ShingleOption {
  return SHINGLE_CATALOG.find((s) => s.tier === tier)!;
}
```

- [ ] **Step 2: Generate placeholder texture images**

Run: `cd C:/Users/Owner/workspace/results-roofing && mkdir -p public/textures/shingles`

Then create a one-off Node script to generate 512x512 solid-color placeholder JPEGs:

```bash
cd C:/Users/Owner/workspace/results-roofing && node -e "
const sharp = require('sharp');
const catalog = [
  ['rs-slate','#6b7280'],['rs-weathered-gray','#9ca3af'],['rs-autumn-brown','#78716c'],
  ['rs-charcoal','#374151'],['rs-golden-cedar','#a16207'],['hdz-charcoal','#3a3a3c'],
  ['hdz-weathered-wood','#8b7355'],['hdz-pewter-gray','#7d8491'],['hdz-barkwood','#6d5c4b'],
  ['hdz-hickory','#5c4a3a'],['hdz-shakewood','#a89279'],['hdz-slate','#4a5568'],
  ['as2-charcoal','#2d2d30'],['as2-pewter-gray','#6b7280'],['as2-barkwood','#5c4a3a'],
  ['as2-weathered-wood','#7a6a55'],['as2-shakewood','#9a8268'],['as2-hunter-green','#2d4a3e'],
];
const hexToRgb = (h) => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
Promise.all(catalog.map(([name, hex]) => {
  const {r,g,b} = hexToRgb(hex);
  return sharp({ create: { width: 512, height: 512, channels: 3, background: {r,g,b} } })
    .jpeg({ quality: 80 })
    .toFile('public/textures/shingles/' + name + '.jpg');
})).then(() => console.log('Generated ' + catalog.length + ' textures'));
"
```

If `sharp` is not installed, install it first: `npm install sharp --save-dev`, then run the script. Remove the dev dependency after generation if desired.

Expected output: 18 `.jpg` files in `public/textures/shingles/`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/roof/shingle-catalog.ts public/textures/shingles/
git commit -m "feat(roof): add shingle catalog with 18 color options across 3 tiers"
```

---

## Chunk 2: API + Data Hooks

### Task 5: Roof Data API Route

**Files:**
- Create: `src/app/api/portal/roof-data/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// src/app/api/portal/roof-data/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq } from '@/db';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { RoofDataResponse } from '@/lib/roof/types';

/**
 * GET /api/portal/roof-data?quoteId=xxx
 * Returns Google Solar roof segment data for 3D visualization.
 */
export async function GET(request: NextRequest) {
  try {
    // Auth
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (DEV_BYPASS_ENABLED) {
      userId = MOCK_USER.id;
      userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
    } else {
      const authResult = await auth();
      userId = authResult.userId;
      // Note: Clerk userId is available, email requires user fetch if needed for level 3
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quoteId = request.nextUrl.searchParams.get('quoteId');
    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId required' }, { status: 400 });
    }

    // Auth chain: verify user owns this quote (3 levels)
    let authorized = false;

    // Level 1: orders.clerkUserId
    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.quoteId, quoteId),
    });
    if (order?.clerkUserId === userId) {
      authorized = true;
    }

    // Level 2: quotes.clerkUserId
    if (!authorized) {
      const quote = await db.query.quotes.findFirst({
        where: eq(schema.quotes.id, quoteId),
      });
      if (quote?.clerkUserId === userId) {
        authorized = true;
      }
    }

    // Level 3: leads.email match (only if we have user email)
    if (!authorized && userEmail) {
      const quote = await db.query.quotes.findFirst({
        where: eq(schema.quotes.id, quoteId),
        with: { lead: true },
      });
      if (quote?.lead?.email === userEmail) {
        authorized = true;
      }
    }

    if (!authorized && !DEV_BYPASS_ENABLED) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch measurement
    const measurement = await db.query.measurements.findFirst({
      where: eq(schema.measurements.quoteId, quoteId),
    });

    if (!measurement || measurement.vendor !== 'google_solar' || measurement.status !== 'complete') {
      return NextResponse.json({ error: 'No roof visualization data available' }, { status: 404 });
    }

    // Extract segments from rawResponse
    const raw = measurement.rawResponse as Record<string, unknown> | null;
    const solarPotential = raw?.solarPotential as Record<string, unknown> | undefined;
    const segments = (solarPotential?.roofSegmentStats as unknown[]) ?? [];
    const center = raw?.center as { latitude: number; longitude: number } | undefined;
    const bbox = raw?.boundingBox as {
      sw: { latitude: number; longitude: number };
      ne: { latitude: number; longitude: number };
    } | undefined;

    if (!center || segments.length === 0) {
      return NextResponse.json({ error: 'Insufficient roof data' }, { status: 404 });
    }

    const response: RoofDataResponse = {
      segments: segments as RoofDataResponse['segments'],
      buildingCenter: { lat: center.latitude, lng: center.longitude },
      buildingBoundingBox: bbox
        ? {
            sw: { lat: bbox.sw.latitude, lng: bbox.sw.longitude },
            ne: { lat: bbox.ne.latitude, lng: bbox.ne.longitude },
          }
        : null,
      stats: {
        sqftTotal: parseFloat(measurement.sqftTotal ?? '0'),
        pitchPrimary: measurement.pitchPrimary ?? '0',
        facetCount: segments.length,
        vendor: measurement.vendor,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching roof data', error);
    return NextResponse.json({ error: 'Failed to fetch roof data' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/portal/roof-data/route.ts
git commit -m "feat(roof): add /api/portal/roof-data endpoint with 3-level auth chain"
```

---

### Task 6: React Query Hook for Roof Data

**Files:**
- Create: `src/hooks/useRoofData.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useRoofData.ts
import { useQuery } from '@tanstack/react-query';
import type { RoofDataResponse } from '@/lib/roof/types';

async function fetchRoofData(quoteId: string): Promise<RoofDataResponse> {
  const res = await fetch(`/api/portal/roof-data?quoteId=${quoteId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch roof data');
  }
  return res.json();
}

export function useRoofData(quoteId: string | null | undefined) {
  return useQuery<RoofDataResponse>({
    queryKey: ['roof-data', quoteId],
    queryFn: () => fetchRoofData(quoteId!),
    enabled: !!quoteId,
    staleTime: 5 * 60 * 1000, // 5 min — segment data doesn't change
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useRoofData.ts
git commit -m "feat(roof): add useRoofData React Query hook"
```

---

### Task 7: Zod Schema + useRoofGeometry Hook

**Files:**
- Create: `src/lib/roof/schema.ts`
- Create: `src/hooks/useRoofGeometry.ts`

- [ ] **Step 1: Create Zod schema for segment validation**

The `rawResponse` field is untyped `jsonb` — we need runtime validation before passing to the geometry engine.

```typescript
// src/lib/roof/schema.ts
import { z } from 'zod';

const LatLngSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const LatLngBoxSchema = z.object({
  sw: LatLngSchema,
  ne: LatLngSchema,
});

export const RoofSegmentSchema = z.object({
  pitchDegrees: z.number(),
  azimuthDegrees: z.number(),
  stats: z.object({ areaMeters2: z.number() }),
  center: LatLngSchema.optional(),
  boundingBox: LatLngBoxSchema.optional(),
  planeHeightAtCenterMeters: z.number().optional(),
});

export const RoofSegmentsArraySchema = z.array(RoofSegmentSchema);
```

- [ ] **Step 2: Create the hook with Zod validation**

```typescript
// src/hooks/useRoofGeometry.ts
import { useMemo } from 'react';
import { processSegments } from '@/lib/roof/geometry';
import { RoofSegmentsArraySchema } from '@/lib/roof/schema';
import type { ProcessedFacet } from '@/lib/roof/types';

/**
 * Validates raw segments with Zod, then converts to processed 3D facets.
 * Returns empty array on invalid data (graceful fallback).
 */
export function useRoofGeometry(
  segments: unknown[] | undefined,
  buildingCenter: { lat: number; lng: number } | undefined,
): ProcessedFacet[] {
  return useMemo(() => {
    if (!segments || !buildingCenter || segments.length === 0) return [];

    // Runtime validation of untyped jsonb data
    const parsed = RoofSegmentsArraySchema.safeParse(segments);
    if (!parsed.success) {
      console.error('[useRoofGeometry] Invalid segment data:', parsed.error.message);
      return [];
    }

    try {
      return processSegments(parsed.data, {
        latitude: buildingCenter.lat,
        longitude: buildingCenter.lng,
      });
    } catch (err) {
      console.error('[useRoofGeometry] Failed to process segments:', err);
      return [];
    }
  }, [segments, buildingCenter]);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/roof/schema.ts src/hooks/useRoofGeometry.ts
git commit -m "feat(roof): add Zod-validated useRoofGeometry hook"
```

---

## Chunk 3: 3D Scene Components

### Task 8: RoofFacet Component

**Files:**
- Create: `src/components/features/roof/RoofFacet.tsx`

- [ ] **Step 1: Create the facet mesh component**

```typescript
// src/components/features/roof/RoofFacet.tsx
'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import type { ProcessedFacet } from '@/lib/roof/types';

interface RoofFacetProps {
  facet: ProcessedFacet;
  textureUrl: string;
}

const SHINGLE_REPEAT_SCALE = 1 / 0.3; // ~1 repeat per 0.3m

export function RoofFacet({ facet, textureUrl }: RoofFacetProps) {
  const texture = useTexture(textureUrl);

  // Configure texture repeat based on facet dimensions
  useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(
      facet.widthMeters * SHINGLE_REPEAT_SCALE,
      facet.depthMeters * SHINGLE_REPEAT_SCALE,
    );
    texture.needsUpdate = true;
  }, [texture, facet.widthMeters, facet.depthMeters]);

  // Build geometry from vertices
  const geometry = useMemo(() => {
    const verts = facet.vertices3D;
    if (verts.length < 3) return null;

    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];

    // Triangulate as a fan from vertex 0
    for (let i = 1; i < verts.length - 1; i++) {
      positions.push(...verts[0], ...verts[i], ...verts[i + 1]);

      // Simple planar UV mapping
      uvs.push(0, 0);
      uvs.push((i) / (verts.length - 1), 0);
      uvs.push((i + 1) / (verts.length - 1), 1);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }, [facet.vertices3D]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/roof/RoofFacet.tsx
git commit -m "feat(roof): add RoofFacet 3D mesh component with texture mapping"
```

---

### Task 9: RoofModel Component

**Files:**
- Create: `src/components/features/roof/RoofModel.tsx`

- [ ] **Step 1: Create the roof model assembly**

```typescript
// src/components/features/roof/RoofModel.tsx
'use client';

import { Suspense } from 'react';
import type { ProcessedFacet } from '@/lib/roof/types';
import { RoofFacet } from './RoofFacet';

interface RoofModelProps {
  facets: ProcessedFacet[];
  textureUrl: string;
}

export function RoofModel({ facets, textureUrl }: RoofModelProps) {
  if (facets.length === 0) return null;

  return (
    <Suspense fallback={null}>
      <group>
        {facets.map((facet, i) => (
          <RoofFacet key={i} facet={facet} textureUrl={textureUrl} />
        ))}
      </group>
    </Suspense>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/roof/RoofModel.tsx
git commit -m "feat(roof): add RoofModel component that assembles all facets"
```

---

### Task 10: CameraPresets Component

**Files:**
- Create: `src/components/features/roof/CameraPresets.tsx`

- [ ] **Step 1: Create camera presets**

```typescript
// src/components/features/roof/CameraPresets.tsx
'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { CameraControls } from '@react-three/drei';
import type { CameraPreset } from '@/lib/roof/types';

const PRESETS: CameraPreset[] = [
  { id: 'aerial',  label: 'Aerial',  position: [0, 25, 0.1],  target: [0, 0, 0] },
  { id: 'front',   label: 'Front',   position: [0, 8, 20],    target: [0, 3, 0] },
  { id: 'back',    label: 'Back',    position: [0, 8, -20],   target: [0, 3, 0] },
  { id: 'side',    label: 'Side',    position: [20, 8, 0],    target: [0, 3, 0] },
];

interface CameraSetupProps {
  controlsRef: React.MutableRefObject<CameraControls | null>;
}

/** R3F component that provides CameraControls inside the Canvas */
export function CameraSetup({ controlsRef }: CameraSetupProps) {
  return (
    <CameraControls
      ref={controlsRef}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.05} // prevent flipping below ground
      minDistance={5}
      maxDistance={50}
    />
  );
}

interface CameraPresetsBarProps {
  controlsRef: React.MutableRefObject<CameraControls | null>;
}

/** HTML overlay component for camera preset buttons (outside Canvas) */
export function CameraPresetsBar({ controlsRef }: CameraPresetsBarProps) {
  const [activePreset, setActivePreset] = useState('aerial');
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goToPreset = useCallback(
    (preset: CameraPreset) => {
      const controls = controlsRef.current;
      if (!controls) return;

      setActivePreset(preset.id);
      const smooth = !prefersReducedMotion;
      controls.setLookAt(
        preset.position[0], preset.position[1], preset.position[2],
        preset.target[0], preset.target[1], preset.target[2],
        smooth,
      );
    },
    [controlsRef, prefersReducedMotion],
  );

  // Set initial camera position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      goToPreset(PRESETS[0]);
    }, 100);
    return () => clearTimeout(timer);
  }, [goToPreset]);

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => goToPreset(preset)}
          aria-label={`${preset.label} view`}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid var(--rr-color-border)',
            background: activePreset === preset.id
              ? 'var(--rr-color-primary)'
              : 'var(--rr-color-surface)',
            color: activePreset === preset.id
              ? 'var(--rr-color-primary-foreground)'
              : 'var(--rr-color-text)',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

export { PRESETS };
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/roof/CameraPresets.tsx
git commit -m "feat(roof): add CameraPresets with smooth transitions and reduced-motion support"
```

---

### Task 11: RoofViewer (Main R3F Scene)

**Files:**
- Create: `src/components/features/roof/RoofViewer.tsx`

- [ ] **Step 1: Create the viewer**

This is the main R3F canvas component. It's dynamically imported with `ssr: false` by the page.

```typescript
// src/components/features/roof/RoofViewer.tsx
'use client';

import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { CameraControls as CameraControlsType } from '@react-three/drei';
import type { ProcessedFacet } from '@/lib/roof/types';
import { getAllTextureUrls } from '@/lib/roof/shingle-catalog';
import { RoofModel } from './RoofModel';
import { CameraSetup, CameraPresetsBar } from './CameraPresets';

interface RoofViewerProps {
  facets: ProcessedFacet[];
  textureUrl: string;
}

// Preload all shingle textures at module scope (runs once when module loads)
getAllTextureUrls().forEach((url) => useTexture.preload(url));

export default function RoofViewer({ facets, textureUrl }: RoofViewerProps) {
  const controlsRef = useRef<CameraControlsType | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0, borderRadius: '12px', overflow: 'hidden' }}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ fov: 45, near: 0.1, far: 200 }}
          role="img"
          aria-label={`3D model of your roof`}
          style={{ background: 'linear-gradient(180deg, #e0e8f0 0%, #f5f7fa 100%)' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[15, 20, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#c8d6c0" />
          </mesh>

          {/* Roof */}
          <RoofModel facets={facets} textureUrl={textureUrl} />

          {/* Camera */}
          <CameraSetup controlsRef={controlsRef} />
        </Canvas>
      </div>
      <CameraPresetsBar controlsRef={controlsRef} />
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors (or minor R3F type issues to resolve)

- [ ] **Step 3: Commit**

```bash
git add src/components/features/roof/RoofViewer.tsx
git commit -m "feat(roof): add RoofViewer — main R3F canvas with lights, ground, and camera"
```

---

## Chunk 4: UI Controls + Page

### Task 12: ShingleSelector Component

**Files:**
- Create: `src/components/features/roof/ShingleSelector.tsx`

- [ ] **Step 1: Create the shingle selector**

```typescript
// src/components/features/roof/ShingleSelector.tsx
'use client';

import { useState, useCallback } from 'react';
import { getShinglesForTier, getDefaultShingle } from '@/lib/roof/shingle-catalog';
import type { ShingleOption } from '@/lib/roof/types';

interface ShingleSelectorProps {
  initialTier?: 'good' | 'better' | 'best';
  onSelect: (shingle: ShingleOption) => void;
}

const TIERS = ['good', 'better', 'best'] as const;
const TIER_LABELS: Record<typeof TIERS[number], string> = {
  good: 'Good',
  better: 'Better',
  best: 'Best',
};

export function ShingleSelector({ initialTier = 'better', onSelect }: ShingleSelectorProps) {
  const [activeTier, setActiveTier] = useState<typeof TIERS[number]>(initialTier);
  const [activeId, setActiveId] = useState(getDefaultShingle(initialTier).id);

  const options = getShinglesForTier(activeTier);

  const handleTierChange = useCallback(
    (tier: typeof TIERS[number]) => {
      setActiveTier(tier);
      const defaultShingle = getDefaultShingle(tier);
      setActiveId(defaultShingle.id);
      onSelect(defaultShingle);
    },
    [onSelect],
  );

  const handleColorSelect = useCallback(
    (shingle: ShingleOption) => {
      setActiveId(shingle.id);
      onSelect(shingle);
    },
    [onSelect],
  );

  return (
    <div>
      {/* Tier tabs */}
      <div role="tablist" aria-label="Shingle tier" style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {TIERS.map((tier) => (
          <button
            key={tier}
            role="tab"
            aria-selected={activeTier === tier}
            onClick={() => handleTierChange(tier)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--rr-color-border)',
              background: activeTier === tier ? 'var(--rr-color-primary)' : 'var(--rr-color-surface)',
              color: activeTier === tier ? 'var(--rr-color-primary-foreground)' : 'var(--rr-color-text)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTier === tier ? 600 : 400,
            }}
          >
            {TIER_LABELS[tier]}
          </button>
        ))}
      </div>

      {/* Brand label */}
      <p style={{
        fontSize: '0.75rem',
        color: 'var(--rr-color-muted)',
        marginBottom: '8px',
      }}>
        {options[0]?.brand}
      </p>

      {/* Color swatches */}
      <div role="radiogroup" aria-label="Shingle color" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {options.map((shingle) => (
          <button
            key={shingle.id}
            role="radio"
            aria-checked={activeId === shingle.id}
            aria-label={shingle.name}
            onClick={() => handleColorSelect(shingle)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              border: activeId === shingle.id
                ? '2px solid var(--rr-color-primary)'
                : '2px solid transparent',
              borderRadius: '8px',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: shingle.hex,
                border: '1px solid var(--rr-color-border)',
              }}
            />
            <span style={{ fontSize: '0.6875rem', color: 'var(--rr-color-text)' }}>
              {shingle.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/roof/ShingleSelector.tsx
git commit -m "feat(roof): add ShingleSelector — tier tabs + color swatches with a11y"
```

---

### Task 13: RoofStats + RoofPageSkeleton

**Files:**
- Create: `src/components/features/roof/RoofStats.tsx`
- Create: `src/components/features/roof/RoofPageSkeleton.tsx`

- [ ] **Step 1: Create RoofStats**

```typescript
// src/components/features/roof/RoofStats.tsx
'use client';

import { Ruler, Triangle, Layers } from 'lucide-react';

interface RoofStatsProps {
  sqftTotal: number;
  pitchPrimary: string;
  facetCount: number;
}

export function RoofStats({ sqftTotal, pitchPrimary, facetCount }: RoofStatsProps) {
  const stats = [
    { icon: Ruler, label: 'Total Area', value: `${sqftTotal.toLocaleString()} sqft` },
    { icon: Triangle, label: 'Primary Pitch', value: `${pitchPrimary}/12` },
    { icon: Layers, label: 'Roof Sections', value: String(facetCount) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rr-color-text)', margin: 0 }}>
        Roof Details
      </h3>
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon size={16} style={{ color: 'var(--rr-color-muted)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--rr-color-muted)' }}>{label}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--rr-color-text)' }}>{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create RoofPageSkeleton**

```typescript
// src/components/features/roof/RoofPageSkeleton.tsx
'use client';

export function RoofPageSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '24px', padding: '16px', height: '100%' }} aria-busy="true" aria-label="Loading roof visualizer">
      {/* Viewport skeleton */}
      <div style={{
        flex: '0 0 65%',
        borderRadius: '12px',
        background: 'var(--rr-color-surface)',
        minHeight: '400px',
        animation: 'pulse 2s ease-in-out infinite',
      }} />
      {/* Sidebar skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '40px', borderRadius: '8px', background: 'var(--rr-color-surface)' }} />
        <div style={{ height: '120px', borderRadius: '8px', background: 'var(--rr-color-surface)' }} />
        <div style={{ height: '100px', borderRadius: '8px', background: 'var(--rr-color-surface)' }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/roof/RoofStats.tsx src/components/features/roof/RoofPageSkeleton.tsx
git commit -m "feat(roof): add RoofStats card and RoofPageSkeleton loading state"
```

---

### Task 14: Portal Roof Page

**Files:**
- Create: `src/app/portal/roof/page.tsx`
- Create: `src/app/portal/roof/page.module.css`

- [ ] **Step 1: Create page styles**

```css
/* src/app/portal/roof/page.module.css */
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 0 0 16px;
}

.content {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.viewport {
  flex: 0 0 65%;
  min-height: 400px;
}

.sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
}

.emptyTitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--rr-color-text);
  margin: 0;
}

.emptyText {
  font-size: 0.875rem;
  color: var(--rr-color-muted);
  margin: 0;
  max-width: 400px;
}

/* Mobile */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }

  .viewport {
    flex: none;
    height: 50vh;
    min-height: 300px;
  }

  .sidebar {
    padding: 0 16px 16px;
  }
}
```

- [ ] **Step 2: Create the page component**

```typescript
// src/app/portal/roof/page.tsx
'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { useRoofData } from '@/hooks/useRoofData';
import { useRoofGeometry } from '@/hooks/useRoofGeometry';
import { getDefaultShingle } from '@/lib/roof/shingle-catalog';
import { ShingleSelector } from '@/components/features/roof/ShingleSelector';
import { RoofStats } from '@/components/features/roof/RoofStats';
import { RoofPageSkeleton } from '@/components/features/roof/RoofPageSkeleton';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { ShingleOption } from '@/lib/roof/types';
import styles from './page.module.css';

const RoofViewer = dynamic(
  () => import('@/components/features/roof/RoofViewer'),
  { ssr: false, loading: () => <RoofPageSkeleton /> },
);

function RoofContent({ email }: { email: string | null }) {
  const { isLoading: phaseLoading, order, quote } = usePortalPhase(email);
  const quoteId = quote?.id ?? order?.quoteId ?? null;
  const { data: roofData, isLoading: roofLoading } = useRoofData(quoteId);
  const facets = useRoofGeometry(roofData?.segments, roofData?.buildingCenter);

  const [selectedShingle, setSelectedShingle] = useState<ShingleOption>(
    getDefaultShingle('better'),
  );

  const handleSelect = useCallback((shingle: ShingleOption) => {
    setSelectedShingle(shingle);
  }, []);

  if (phaseLoading || roofLoading) {
    return (
      <div className={styles.page}>
        <PortalHeader title="My Roof" />
        <RoofPageSkeleton />
      </div>
    );
  }

  if (!roofData || facets.length === 0) {
    return (
      <div className={styles.page}>
        <PortalHeader title="My Roof" />
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Roof Model Unavailable</p>
          <p className={styles.emptyText}>
            We need satellite imagery to build your 3D roof model.
            This feature will be available once your measurement is complete.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PortalHeader title="My Roof" />
      <div className={styles.content}>
        <div className={styles.viewport}>
          <RoofViewer facets={facets} textureUrl={selectedShingle.texture} />
        </div>
        <div className={styles.sidebar}>
          <ShingleSelector initialTier="better" onSelect={handleSelect} />
          <RoofStats
            sqftTotal={roofData.stats.sqftTotal}
            pitchPrimary={roofData.stats.pitchPrimary}
            facetCount={roofData.stats.facetCount}
          />
        </div>
      </div>
    </div>
  );
}

function ClerkRoof() {
  const { user } = useUser();
  return <RoofContent email={user?.primaryEmailAddress?.emailAddress ?? null} />;
}

function DevRoof() {
  return <RoofContent email={MOCK_USER.primaryEmailAddress.emailAddress} />;
}

export default function RoofPage() {
  if (DEV_BYPASS_ENABLED) return <DevRoof />;
  return <ClerkRoof />;
}
```

- [ ] **Step 3: Verify typecheck**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/portal/roof/page.tsx src/app/portal/roof/page.module.css
git commit -m "feat(roof): add /portal/roof page with 3D viewer, shingle selector, and stats"
```

---

## Chunk 5: Portal Navigation Integration

### Task 15: Extend Order Details API with Measurement Data

**Files:**
- Modify: `src/app/api/portal/orders/[id]/route.ts`
- Modify: `src/hooks/useOrders.ts`

- [ ] **Step 1: Add measurement data to order details API response**

In `src/app/api/portal/orders/[id]/route.ts`, after the existing parallel queries (around line 60), add a measurement fetch:

```typescript
// Add to the parallel fetch block:
const measurement = order.quoteId
  ? await db.query.measurements.findFirst({
      where: eq(schema.measurements.quoteId, order.quoteId),
    })
  : null;
```

Then add to the JSON response object:

```typescript
measurement: measurement
  ? { vendor: measurement.vendor, status: measurement.status }
  : null,
```

- [ ] **Step 2: Update the `OrderDetailsResponse` type in `useOrders.ts`**

In `src/hooks/useOrders.ts`, add to the `OrderDetailsResponse` interface:

```typescript
measurement?: { vendor: string; status: string } | null;
```

Also update the `MOCK_ORDER_DETAILS` to include:

```typescript
measurement: { vendor: 'google_solar', status: 'complete' },
```

- [ ] **Step 3: Verify typecheck**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/portal/orders/[id]/route.ts src/hooks/useOrders.ts
git commit -m "feat(roof): extend order details API to include measurement vendor/status"
```

---

### Task 16: Extend SidebarContext + Nav Components

**Files:**
- Modify: `src/components/features/portal/PortalSidebarV2/SidebarContext.tsx`
- Modify: `src/components/features/portal/PortalSidebarV2/PortalSidebarV2.tsx`
- Modify: `src/components/features/portal/BottomTabBar/BottomTabBar.tsx`

- [ ] **Step 1: Add `hasRoofData` to SidebarContext**

In `src/components/features/portal/PortalSidebarV2/SidebarContext.tsx`:

Add `hasRoofData: boolean` to `SidebarContextValue` interface and the default context:

```typescript
interface SidebarContextValue {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  toggle: () => void;
  hasRoofData: boolean;
}
```

Update `SidebarProvider` to accept and pass `hasRoofData`:

```typescript
export function SidebarProvider({
  children,
  hasRoofData = false,
}: {
  children: ReactNode;
  hasRoofData?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <SidebarContext.Provider
      value={{
        expanded,
        setExpanded,
        toggle: () => setExpanded((v) => !v),
        hasRoofData,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
```

- [ ] **Step 2: Conditionally show "My Roof" in SidebarV2**

In `src/components/features/portal/PortalSidebarV2/PortalSidebarV2.tsx`:

Add `Home` import from lucide-react. Change `NAV_ITEMS` from a static const to computed inside the component:

```typescript
const { expanded, toggle, hasRoofData } = useSidebar();

const navItems = [
  { label: 'My Project', href: '/portal', icon: FolderKanban },
  ...(hasRoofData
    ? [{ label: 'My Roof', href: '/portal/roof', icon: Home }]
    : []),
  { label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { label: 'Documents', href: '/portal/documents', icon: FileText },
  { label: 'Schedule', href: '/portal/schedule', icon: Calendar },
];
```

Replace references to `NAV_ITEMS` with `navItems`.

- [ ] **Step 3: Conditionally show "My Roof" in BottomTabBar**

In `src/components/features/portal/BottomTabBar/BottomTabBar.tsx`:

**This component does NOT currently import or use `useSidebar`.** You must add the import:

```typescript
import { Home } from 'lucide-react';
import { useSidebar } from '@/components/features/portal/PortalSidebarV2/SidebarContext';
```

Then inside the component function, compute tabs conditionally:

```typescript
const { hasRoofData } = useSidebar();

const tabItems = [
  { label: 'Project', href: '/portal', icon: FolderKanban },
  ...(hasRoofData
    ? [{ label: 'My Roof', href: '/portal/roof', icon: Home }]
    : []),
  { label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { label: 'Documents', href: '/portal/documents', icon: FileText },
  { label: 'Schedule', href: '/portal/schedule', icon: Calendar },
];
```

Replace references to `TAB_ITEMS` with `tabItems`.

Also add CSS for icon-only tabs on narrow viewports in `BottomTabBar.module.css`:

```css
/* When 5 tabs present on narrow screens, hide labels */
@media (max-width: 374px) {
  .tabLabel {
    display: none;
  }
  .tabItem {
    padding: 8px 4px;
  }
}
```

Apply `tabLabel` class to the label `<span>` and `tabItem` class to each tab button. This implements the spec's requirement for icon-only tabs below 375px.

- [ ] **Step 4: Wire `hasRoofData` in PortalShell**

**Important:** `SidebarProvider` is NOT in `layout.tsx` — it is rendered inside `PortalShell.tsx` (`src/components/features/portal/PortalShell.tsx`). The layout is a Server Component and cannot call hooks.

In `src/components/features/portal/PortalShell.tsx`:

1. Read the file first to understand the current structure
2. Import `usePortalPhase` (or the relevant hook used by the shell)
3. Derive `hasRoofData` from the order details measurement data:

```typescript
// Inside PortalShell component, after existing hook calls:
// If PortalShell doesn't already have access to order details,
// add a lightweight fetch for measurement status:
const { details } = usePortalPhase(email); // or however the shell gets user context
const hasRoofData = details?.measurement?.vendor === 'google_solar'
  && details?.measurement?.status === 'complete';
```

4. Pass `hasRoofData` to `SidebarProvider`:

```typescript
<SidebarProvider hasRoofData={hasRoofData}>
  {children}
</SidebarProvider>
```

**Note:** The exact hook call depends on how `PortalShell` currently gets user context. Read the file before implementing — it may already have access to order data, or you may need to add a hook call. The key is that `PortalShell` is a `'use client'` component, so it CAN call hooks (unlike `layout.tsx`).

- [ ] **Step 5: Verify typecheck**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/features/portal/PortalSidebarV2/SidebarContext.tsx \
        src/components/features/portal/PortalSidebarV2/PortalSidebarV2.tsx \
        src/components/features/portal/BottomTabBar/BottomTabBar.tsx \
        src/components/features/portal/PortalShell.tsx
git commit -m "feat(roof): add conditional My Roof tab to portal sidebar and bottom bar"
```

---

## Chunk 6: Verification

### Task 17: Three.js Version Compatibility Check

- [ ] **Step 1: Verify R3F + Three.js work together**

Run: `cd C:/Users/Owner/workspace/results-roofing && npm run build 2>&1 | tail -20`

If there are Three.js/R3F compatibility errors:
- Try pinning: `npm install three@0.168.0 @types/three@0.168.0`
- Or upgrade R3F: `npm install @react-three/fiber@latest @react-three/drei@latest`

- [ ] **Step 2: Run all tests**

Run: `cd C:/Users/Owner/workspace/results-roofing && npx vitest run 2>&1 | tail -20`
Expected: All tests pass including new clip and geometry tests

- [ ] **Step 3: Run dev server and verify page loads**

Run: `cd C:/Users/Owner/workspace/results-roofing && npm run dev`

Navigate to `http://localhost:3000/portal/roof`. Verify:
- Page loads without SSR crash
- Loading skeleton appears during data fetch
- If dev bypass mode: 3D scene renders with facets (requires a measurement with Google Solar data in the dev database)
- Shingle selector shows 3 tier tabs
- Color swatches update the model texture
- Camera presets snap to correct angles
- Mobile: viewport stacks above controls

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(roof): resolve compatibility and integration issues from verification"
```

---

## Summary

| Chunk | Tasks | What it produces |
|-------|-------|-----------------|
| 1: Core Geometry | Tasks 1-4 | Types, clipping, geometry engine, shingle catalog |
| 2: API + Hooks | Tasks 5-7 | Roof data endpoint, React Query hook, geometry hook |
| 3: 3D Scene | Tasks 8-11 | RoofFacet, RoofModel, CameraPresets, RoofViewer |
| 4: UI + Page | Tasks 12-14 | ShingleSelector, RoofStats, skeleton, page |
| 5: Portal Nav | Tasks 15-16 | Order API extension, sidebar/tab bar integration |
| 6: Verification | Task 17 | Build check, test run, manual verification |
