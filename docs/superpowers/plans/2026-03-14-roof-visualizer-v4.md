# Roof Visualizer v4 — Parametric Facets Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the DSM mesh with clean parametric roof facets built from Google Solar segment data (pitch, azimuth, bounding box), using half-plane clipping to resolve overlaps.

**Architecture:** Client-side geometry engine takes `RawRoofSegment[]` + `buildingCenter`, projects to local meters, clips overlapping bounding boxes using plane-plane intersection lines, tilts facets into 3D, adds ridge/hip caps, outputs `Float32Array` buffers for Three.js. No server-side mesh generation needed.

**Tech Stack:** TypeScript (pure math, no dependencies), React Three Fiber (rendering), Vitest (testing)

**Spec:** `docs/superpowers/specs/2026-03-14-roof-visualizer-v4-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/roof/facet-geometry.ts` | Main pipeline: segments → clipped 3D facets → BufferGeometry arrays |
| Create | `src/lib/roof/clip.ts` | Sutherland-Hodgman polygon clipping against a half-plane |
| Create | `src/lib/roof/__tests__/facet-geometry.test.ts` | Tests with synthetic gable, hip, and single-segment roofs |
| Create | `src/lib/roof/__tests__/clip.test.ts` | Tests for polygon clipping utility |
| Modify | `src/lib/roof/types.ts` | Add `RoofGeometry`, remove `RoofMesh` from `RoofLayers` |
| Modify | `src/components/features/roof/RoofMeshViewer.tsx` | Accept typed arrays instead of base64 strings |
| Modify | `src/app/portal/roof/page.tsx` | Compute geometry client-side from segments |
| Modify | `src/db/schema/measurements.ts` | Remove `mesh` from `roofLayers` `$type<>()` |
| Modify | `src/app/api/portal/roof-data/route.ts` | Remove mesh cache-miss logic |
| Modify | `src/lib/roof/data-layers.ts` | Remove DSM download/parse/mesh generation |
| Delete | `src/lib/roof/dsm-mesh.ts` | DSM mesh generator (replaced) |
| Delete | `src/lib/roof/__tests__/dsm-mesh.test.ts` | DSM mesh tests |

---

## Chunk 1: Core Geometry Engine

### Task 1: Types — Add RoofGeometry, Clean Up

**Files:**
- Modify: `src/lib/roof/types.ts`
- Modify: `src/db/schema/measurements.ts`

- [ ] **Step 1: Update types.ts**

Remove `RoofMesh` interface. Remove `mesh` field from `RoofLayers`. Add `RoofGeometry`:

```typescript
/** Geometry output from the parametric facet engine — ready for Three.js */
export interface RoofGeometry {
  positions: Float32Array;   // [x,y,z, ...] — centered at origin, ~15 units span
  normals: Float32Array;     // [nx,ny,nz, ...] — per-vertex
  indices: Uint32Array;      // [i0,i1,i2, ...] — triangles
  vertexCount: number;
  triangleCount: number;
  facetCount: number;
}
```

Remove from `RoofLayers`:
```typescript
// DELETE this field:
mesh: RoofMesh | null;
```

- [ ] **Step 2: Update DB schema**

In `src/db/schema/measurements.ts`, remove the `mesh` field from the `$type<>()` on `roofLayers`. Revert to:

```typescript
roofLayers: jsonb('roof_layers').$type<{
  rgb: string;
  mask: string;
  width: number;
  height: number;
  bounds: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
}>(),
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/roof/types.ts src/db/schema/measurements.ts
git commit -m "feat(roof): add RoofGeometry type, remove RoofMesh from RoofLayers

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Polygon Clipping Utility

**Files:**
- Create: `src/lib/roof/clip.ts`
- Create: `src/lib/roof/__tests__/clip.test.ts`

Pure Sutherland-Hodgman clipping of a convex polygon against a half-plane. This is a small, focused utility — no roof-specific logic.

- [ ] **Step 1: Write failing tests**

Create `src/lib/roof/__tests__/clip.test.ts`:

```typescript
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
    expect(result.length).toBe(3); // triangle
  });

  it('returns empty for degenerate polygon', () => {
    const result = clipPolygonByLine([[0,0]], [0.5, 0], [0, 1], [1, 0]);
    expect(result.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests — verify fail**

Run: `npx vitest run src/lib/roof/__tests__/clip.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement clipPolygonByLine**

Create `src/lib/roof/clip.ts`:

```typescript
/**
 * Sutherland-Hodgman polygon clipping against a half-plane.
 *
 * Clips a convex polygon to keep only the side of a line that contains
 * the `keepSide` point.
 *
 * @param polygon - Array of [x, z] vertices (convex, CCW or CW)
 * @param linePoint - A point on the clipping line [x, z]
 * @param lineDir - Direction vector of the clipping line [dx, dz]
 * @param keepSide - A point on the side to keep [x, z]
 * @returns Clipped polygon vertices
 */
export function clipPolygonByLine(
  polygon: [number, number][],
  linePoint: [number, number],
  lineDir: [number, number],
  keepSide: [number, number],
): [number, number][] {
  if (polygon.length < 3) return [];

  // Normal to the line (perpendicular to direction)
  const nx = -lineDir[1];
  const nz = lineDir[0];

  // Determine sign for the "keep" side
  const keepDot = nx * (keepSide[0] - linePoint[0]) + nz * (keepSide[1] - linePoint[1]);
  if (Math.abs(keepDot) < 1e-10) return polygon; // keepSide is on the line — no clip
  const keepSign = keepDot > 0 ? 1 : -1;

  function signedDist(p: [number, number]): number {
    return keepSign * (nx * (p[0] - linePoint[0]) + nz * (p[1] - linePoint[1]));
  }

  const output: [number, number][] = [];
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % n];
    const dCurr = signedDist(current);
    const dNext = signedDist(next);

    if (dCurr >= 0) {
      // Current is inside
      output.push(current);
      if (dNext < 0) {
        // Next is outside — add intersection
        output.push(intersect(current, next, dCurr, dNext));
      }
    } else if (dNext >= 0) {
      // Current outside, next inside — add intersection
      output.push(intersect(current, next, dCurr, dNext));
    }
  }

  return output;
}

function intersect(
  a: [number, number],
  b: [number, number],
  dA: number,
  dB: number,
): [number, number] {
  const t = dA / (dA - dB);
  return [
    a[0] + t * (b[0] - a[0]),
    a[1] + t * (b[1] - a[1]),
  ];
}
```

- [ ] **Step 4: Run tests — verify pass**

Run: `npx vitest run src/lib/roof/__tests__/clip.test.ts`
Expected: All 5 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/roof/clip.ts src/lib/roof/__tests__/clip.test.ts
git commit -m "feat(roof): add Sutherland-Hodgman polygon clipping utility

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Facet Geometry Engine

**Files:**
- Create: `src/lib/roof/facet-geometry.ts`
- Create: `src/lib/roof/__tests__/facet-geometry.test.ts`

This is the core algorithm — projection, clipping, 3D tilt, normalization, triangulation, ridge caps.

- [ ] **Step 1: Write failing tests**

Create `src/lib/roof/__tests__/facet-geometry.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests — verify fail**

Run: `npx vitest run src/lib/roof/__tests__/facet-geometry.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement buildRoofGeometry**

Create `src/lib/roof/facet-geometry.ts`:

```typescript
/**
 * Parametric roof geometry engine.
 *
 * Converts Google Solar roofSegmentStats into a triangle mesh:
 * 1. Project lat/lng → local meters
 * 2. Generate bounding box polygons
 * 3. Half-plane clip overlapping segments
 * 4. Tilt facets into 3D using pitch/azimuth
 * 5. Normalize to scene units
 * 6. Detect shared edges, add ridge/hip caps
 * 7. Fan-triangulate and output BufferGeometry arrays
 *
 * Coordinate convention: X = east, Y = up, Z = south
 */

import type { RawRoofSegment, RoofGeometry } from './types';
import { clipPolygonByLine } from './clip';

type Pt2 = [number, number]; // [x, z] in local meters

// ── Projection ──────────────────────────────────────────────────────────────

const M_PER_DEG_LAT = 111_320;

function latLngToLocal(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
): Pt2 {
  const mPerDegLng = M_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  const x = (lng - centerLng) * mPerDegLng;  // east
  const z = (centerLat - lat) * M_PER_DEG_LAT; // south (lat decreases → z increases)
  return [x, z];
}

// ── Roof plane math ─────────────────────────────────────────────────────────

interface LocalSegment {
  center: Pt2;
  polygon: Pt2[];
  pitch: number;     // radians
  azimuth: number;   // radians
  height: number;    // meters at center
}

/** Downhill direction for a given azimuth in (X=east, Z=south) space */
function downhillDir(azRad: number): Pt2 {
  return [Math.sin(azRad), -Math.cos(azRad)];
}

/** Height of a roof plane at point (x,z) */
function planeHeightAt(seg: LocalSegment, x: number, z: number): number {
  const [dx, dz] = downhillDir(seg.azimuth);
  const dist = (x - seg.center[0]) * dx + (z - seg.center[1]) * dz;
  return seg.height - Math.tan(seg.pitch) * dist;
}

/**
 * Compute the 2D clipping line where two roof planes intersect.
 * Returns [pointOnLine, lineDirection] or null if planes are parallel.
 */
function planeIntersectionLine(
  a: LocalSegment,
  b: LocalSegment,
): { point: Pt2; dir: Pt2 } | null {
  // Height equations:
  // h_a(x,z) = a.height - tan(a.pitch) * dot((x-a.cx, z-a.cz), downhill_a)
  // h_b(x,z) = b.height - tan(b.pitch) * dot((x-b.cx, z-b.cz), downhill_b)
  // Setting equal: Ax + Bz + C = 0

  const [dax, daz] = downhillDir(a.azimuth);
  const [dbx, dbz] = downhillDir(b.azimuth);
  const tanA = Math.tan(a.pitch);
  const tanB = Math.tan(b.pitch);

  const A = -tanA * dax + tanB * dbx;
  const B = -tanA * daz + tanB * dbz;
  const C =
    a.height - tanA * (-(a.center[0]) * dax + -(a.center[1]) * daz) -
    (b.height - tanB * (-(b.center[0]) * dbx + -(b.center[1]) * dbz));

  // Actually let me derive this properly:
  // h_a = a.h - tanA * ((x - a.cx)*dax + (z - a.cz)*daz)
  //      = a.h - tanA*(x*dax + z*daz - a.cx*dax - a.cz*daz)
  // h_b = b.h - tanB*(x*dbx + z*dbz - b.cx*dbx - b.cz*dbz)
  // h_a = h_b:
  // a.h - tanA*(x*dax + z*daz) + tanA*(a.cx*dax + a.cz*daz)
  //   = b.h - tanB*(x*dbx + z*dbz) + tanB*(b.cx*dbx + b.cz*dbz)
  // Rearrange: (tanB*dbx - tanA*dax)*x + (tanB*dbz - tanA*daz)*z
  //   = b.h - a.h + tanA*(a.cx*dax + a.cz*daz) - tanB*(b.cx*dbx + b.cz*dbz)

  const coeffX = tanB * dbx - tanA * dax;
  const coeffZ = tanB * dbz - tanA * daz;
  const rhs =
    b.height - a.height +
    tanA * (a.center[0] * dax + a.center[1] * daz) -
    tanB * (b.center[0] * dbx + b.center[1] * dbz);

  // Line equation: coeffX * x + coeffZ * z = rhs
  // Direction along line: perpendicular to (coeffX, coeffZ)
  const len = Math.sqrt(coeffX ** 2 + coeffZ ** 2);
  if (len < 1e-10) return null; // parallel planes

  const dir: Pt2 = [-coeffZ / len, coeffX / len];

  // Find a point on the line
  let point: Pt2;
  if (Math.abs(coeffX) > Math.abs(coeffZ)) {
    point = [rhs / coeffX, 0];
  } else {
    point = [0, rhs / coeffZ];
  }

  return { point, dir };
}

// ── Main pipeline ───────────────────────────────────────────────────────────

export function buildRoofGeometry(
  segments: RawRoofSegment[],
  buildingCenter: { lat: number; lng: number },
): RoofGeometry | null {
  // 1. Filter and project segments to local coordinates
  const locals: LocalSegment[] = [];

  for (const seg of segments) {
    if (!seg.boundingBox) continue;

    const center = seg.center
      ? latLngToLocal(seg.center.latitude, seg.center.longitude, buildingCenter.lat, buildingCenter.lng)
      : latLngToLocal(
          (seg.boundingBox.sw.latitude + seg.boundingBox.ne.latitude) / 2,
          (seg.boundingBox.sw.longitude + seg.boundingBox.ne.longitude) / 2,
          buildingCenter.lat,
          buildingCenter.lng,
        );

    const sw = latLngToLocal(seg.boundingBox.sw.latitude, seg.boundingBox.sw.longitude, buildingCenter.lat, buildingCenter.lng);
    const ne = latLngToLocal(seg.boundingBox.ne.latitude, seg.boundingBox.ne.longitude, buildingCenter.lat, buildingCenter.lng);

    // Bounding box → rectangle polygon (CCW)
    const polygon: Pt2[] = [
      [sw[0], sw[1]], // SW
      [ne[0], sw[1]], // SE
      [ne[0], ne[1]], // NE
      [sw[0], ne[1]], // NW
    ];

    const pitch = seg.pitchDegrees < 2 ? 0 : (seg.pitchDegrees * Math.PI) / 180;
    const azimuth = (seg.azimuthDegrees * Math.PI) / 180;
    const height = seg.planeHeightAtCenterMeters ?? estimateHeight(seg);

    locals.push({ center, polygon, pitch, azimuth, height });
  }

  if (locals.length === 0) return null;

  // 2. Clip overlapping segments
  for (let i = 0; i < locals.length; i++) {
    for (let j = 0; j < locals.length; j++) {
      if (i === j) continue;
      if (!boxesOverlap(locals[i].polygon, locals[j].polygon)) continue;

      const line = planeIntersectionLine(locals[i], locals[j]);
      if (!line) continue;

      locals[i].polygon = clipPolygonByLine(
        locals[i].polygon,
        line.point,
        line.dir,
        locals[i].center,
      );
    }
  }

  // Remove degenerate facets
  const validFacets = locals.filter(s => s.polygon.length >= 3);
  if (validFacets.length === 0) return null;

  // 3. Tilt 2D polygons into 3D
  const allPositions: number[] = [];
  const allNormals: number[] = [];
  const allIndices: number[] = [];
  let vertexOffset = 0;

  for (const facet of validFacets) {
    const [dx, dz] = downhillDir(facet.azimuth);
    const tanP = Math.tan(facet.pitch);

    // Normal of the tilted plane
    const nx = tanP * dx;
    const ny = 1;
    const nz = tanP * dz;
    const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);

    // Add vertices
    const startIdx = vertexOffset;
    for (const [px, pz] of facet.polygon) {
      const dist = (px - facet.center[0]) * dx + (pz - facet.center[1]) * dz;
      const y = facet.height - tanP * dist;

      allPositions.push(px, y, pz);
      allNormals.push(nx / nLen, ny / nLen, nz / nLen);
      vertexOffset++;
    }

    // Fan triangulation (polygon is convex after S-H clipping)
    for (let k = 1; k < facet.polygon.length - 1; k++) {
      allIndices.push(startIdx, startIdx + k, startIdx + k + 1);
    }
  }

  // 4. Add ridge/hip cap geometry
  addRidgeHipCaps(validFacets, allPositions, allNormals, allIndices, vertexOffset);

  // 5. Normalize: center at origin, scale to ~15 units
  const positions = new Float32Array(allPositions);
  const normals = new Float32Array(allNormals);
  const indices = new Uint32Array(allIndices);

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    maxX = Math.max(maxX, positions[i]);
    minY = Math.min(minY, positions[i + 1]);
    minZ = Math.min(minZ, positions[i + 2]);
    maxZ = Math.max(maxZ, positions[i + 2]);
  }

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const maxSpan = Math.max(maxX - minX, maxZ - minZ, 1);
  const scale = 15 / maxSpan;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - centerX) * scale;
    positions[i + 1] = (positions[i + 1] - minY) * scale;
    positions[i + 2] = (positions[i + 2] - centerZ) * scale;
  }

  const vertexCount = positions.length / 3;
  return {
    positions,
    normals,
    indices,
    vertexCount,
    triangleCount: indices.length / 3,
    facetCount: validFacets.length,
  };
}

// ── Ridge/Hip Caps ──────────────────────────────────────────────────────────

function addRidgeHipCaps(
  facets: LocalSegment[],
  positions: number[],
  normals: number[],
  indices: number[],
  startVertex: number,
): void {
  const CAP_WIDTH = 0.15; // meters (will be scaled with mesh)
  const CAP_HEIGHT = 0.08;

  // Find shared edges between adjacent facets
  for (let i = 0; i < facets.length; i++) {
    for (let j = i + 1; j < facets.length; j++) {
      const edge = findSharedEdge(facets[i].polygon, facets[j].polygon);
      if (!edge) continue;

      // Check if this is a ridge/hip (convex) vs valley (concave)
      const [e0, e1] = edge;
      const midX = (e0[0] + e1[0]) / 2;
      const midZ = (e0[1] + e1[1]) / 2;
      const hI = planeHeightAt(facets[i], midX, midZ);
      const hJ = planeHeightAt(facets[j], midX, midZ);
      const avgH = (hI + hJ) / 2;

      // Sample a point slightly away from edge on each side
      const edgeDx = e1[0] - e0[0];
      const edgeDz = e1[1] - e0[1];
      const perpX = -edgeDz;
      const perpZ = edgeDx;
      const testI = planeHeightAt(facets[i], midX + perpX * 0.1, midZ + perpZ * 0.1);
      const testJ = planeHeightAt(facets[j], midX - perpX * 0.1, midZ - perpZ * 0.1);

      // Ridge/hip: both sides slope down from edge. Valley: both slope up.
      if (testI < avgH && testJ < avgH) {
        // Ridge or hip — add cap
        addCapGeometry(edge, avgH, CAP_WIDTH, CAP_HEIGHT, positions, normals, indices, startVertex);
        startVertex += 6; // cap adds 6 vertices
      }
      // Valley: skip (concave crease, no cap)
    }
  }
}

function findSharedEdge(
  polyA: Pt2[],
  polyB: Pt2[],
): [Pt2, Pt2] | null {
  const TOLERANCE = 0.3; // meters — tolerance for "same point"

  for (let i = 0; i < polyA.length; i++) {
    const a0 = polyA[i];
    const a1 = polyA[(i + 1) % polyA.length];

    for (let j = 0; j < polyB.length; j++) {
      const b0 = polyB[j];
      const b1 = polyB[(j + 1) % polyB.length];

      // Check if edges share endpoints (in either direction)
      if (
        (ptClose(a0, b0, TOLERANCE) && ptClose(a1, b1, TOLERANCE)) ||
        (ptClose(a0, b1, TOLERANCE) && ptClose(a1, b0, TOLERANCE))
      ) {
        return [a0, a1];
      }
    }
  }
  return null;
}

function ptClose(a: Pt2, b: Pt2, tol: number): boolean {
  return Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;
}

function addCapGeometry(
  edge: [Pt2, Pt2],
  height: number,
  width: number,
  capHeight: number,
  positions: number[],
  normals: number[],
  indices: number[],
  startIdx: number,
): void {
  const [e0, e1] = edge;
  const dx = e1[0] - e0[0];
  const dz = e1[1] - e0[1];
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.01) return;

  // Perpendicular direction (for cap width)
  const px = (-dz / len) * width / 2;
  const pz = (dx / len) * width / 2;

  // 6 vertices: 3 at each end of the edge (triangle cross-section)
  //   left-bottom, right-bottom, top (at each end)
  const verts = [
    // End 0
    [e0[0] - px, height, e0[1] - pz],         // left
    [e0[0] + px, height, e0[1] + pz],         // right
    [e0[0], height + capHeight, e0[1]],        // top
    // End 1
    [e1[0] - px, height, e1[1] - pz],         // left
    [e1[0] + px, height, e1[1] + pz],         // right
    [e1[0], height + capHeight, e1[1]],        // top
  ];

  for (const v of verts) {
    positions.push(v[0], v[1], v[2]);
    normals.push(0, 1, 0); // simplified upward normal
  }

  // 4 triangles forming the cap prism (left face, right face, top-left, top-right)
  const s = startIdx;
  indices.push(
    s, s + 3, s + 5,   // left face tri 1
    s, s + 5, s + 2,   // left face tri 2
    s + 1, s + 4, s + 5, // right face tri 1
    s + 1, s + 5, s + 2, // right face tri 2
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function estimateHeight(seg: RawRoofSegment): number {
  // Estimate height from pitch + bounding box width
  if (!seg.boundingBox) return 5;
  const latSpan = seg.boundingBox.ne.latitude - seg.boundingBox.sw.latitude;
  const halfWidth = (latSpan * M_PER_DEG_LAT) / 2;
  const pitch = (seg.pitchDegrees * Math.PI) / 180;
  return 3 + Math.tan(pitch) * halfWidth; // 3m base eave height
}

function boxesOverlap(polyA: Pt2[], polyB: Pt2[]): boolean {
  const [aMin, aMax] = polyBounds(polyA);
  const [bMin, bMax] = polyBounds(polyB);

  return !(aMax[0] < bMin[0] || bMax[0] < aMin[0] ||
           aMax[1] < bMin[1] || bMax[1] < aMin[1]);
}

function polyBounds(poly: Pt2[]): [Pt2, Pt2] {
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of poly) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  return [[minX, minZ], [maxX, maxZ]];
}
```

- [ ] **Step 4: Run tests — verify pass**

Run: `npx vitest run src/lib/roof/__tests__/facet-geometry.test.ts`
Expected: All 7 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/roof/facet-geometry.ts src/lib/roof/__tests__/facet-geometry.test.ts
git commit -m "feat(roof): add parametric facet geometry engine with half-plane clipping

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Chunk 2: Viewer + Page + Cleanup

### Task 4: Update RoofMeshViewer — Accept Typed Arrays

**Files:**
- Modify: `src/components/features/roof/RoofMeshViewer.tsx`

Remove base64 decode functions. Accept `RoofGeometry` props (raw typed arrays) instead of `RoofMesh` (base64 strings).

- [ ] **Step 1: Rewrite RoofMeshViewer**

Replace the component to accept `RoofGeometry` directly:

```typescript
'use client';

import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RoofGeometry } from '@/lib/roof/types';

interface RoofMeshViewerProps {
  geometry: RoofGeometry;
  shingleHex: string;
}

function RoofScene({ geometry, shingleHex }: RoofMeshViewerProps) {
  const bufferGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(geometry.positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(geometry.normals, 3));
    geom.setIndex(new THREE.BufferAttribute(geometry.indices, 1));
    return geom;
  }, [geometry.positions, geometry.normals, geometry.indices]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(shingleHex),
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    material.color.set(shingleHex);
  }, [shingleHex, material]);

  useEffect(() => {
    return () => {
      bufferGeometry.dispose();
      material.dispose();
    };
  }, [bufferGeometry, material]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 8]} intensity={0.9} />
      <directionalLight position={[-8, 12, -6]} intensity={0.3} />

      <mesh geometry={bufferGeometry} material={material} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#e5e5e5" roughness={1} />
      </mesh>

      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export function RoofMeshViewer({ geometry, shingleHex }: RoofMeshViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Canvas
        camera={{ position: [12, 10, 12], fov: 50, near: 0.1, far: 200 }}
        style={{ background: 'var(--background, #f0f0f0)' }}
      >
        <RoofScene geometry={geometry} shingleHex={shingleHex} />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/roof/RoofMeshViewer.tsx
git commit -m "refactor(roof): RoofMeshViewer accepts typed arrays instead of base64

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Update Page — Client-Side Geometry

**Files:**
- Modify: `src/app/portal/roof/page.tsx`

Compute geometry client-side from segments, pass to viewer.

- [ ] **Step 1: Update page.tsx**

Key changes:
- Import `buildRoofGeometry` from `@/lib/roof/facet-geometry`
- Compute geometry with `useMemo` from `roofData.segments` + `roofData.buildingCenter`
- Pass `geometry` prop to `RoofMeshViewer` instead of `mesh`
- Remove the `layers?.mesh` check — geometry comes from segments, not layers

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { Home } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { ShingleSelector } from '@/components/features/roof/ShingleSelector';
import { RoofStats } from '@/components/features/roof/RoofStats';
import { RoofPageSkeleton } from '@/components/features/roof/RoofPageSkeleton';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { useRoofData } from '@/hooks/useRoofData';
import { getDefaultShingle } from '@/lib/roof/shingle-catalog';
import { buildRoofGeometry } from '@/lib/roof/facet-geometry';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { ShingleOption } from '@/lib/roof/types';
import styles from './page.module.css';

const RoofMeshViewer = dynamic(
  () => import('@/components/features/roof/RoofMeshViewer').then(m => ({ default: m.RoofMeshViewer })),
  { ssr: false, loading: () => <RoofPageSkeleton /> },
);

function RoofContent({ email }: { email: string | null }) {
  const { isLoading: phaseLoading, quote } = usePortalPhase(email);
  const quoteId = quote?.id ?? null;
  const { data: roofData, isLoading: dataLoading } = useRoofData(quoteId);

  const [selectedShingle, setSelectedShingle] = useState<ShingleOption>(
    () => getDefaultShingle('better'),
  );

  const roofGeometry = useMemo(() => {
    if (!roofData?.segments || !roofData?.buildingCenter) return null;
    return buildRoofGeometry(roofData.segments, roofData.buildingCenter);
  }, [roofData?.segments, roofData?.buildingCenter]);

  if (phaseLoading || dataLoading) {
    return <RoofPageSkeleton />;
  }

  const hasData = !!roofData?.buildingCenter;

  return (
    <div className={styles.page}>
      <PortalHeader title="My Roof" />

      <div className={styles.content}>
        <div className={styles.viewport}>
          {roofGeometry ? (
            <RoofMeshViewer
              geometry={roofGeometry}
              shingleHex={selectedShingle.hex}
            />
          ) : hasData ? (
            <div className={styles.emptyState}>
              <Home size={40} color="var(--rr-color-muted)" />
              <p className={styles.emptyTitle}>Roof Preview Unavailable</p>
              <p className={styles.emptyText}>
                Roof visualization is not available for this location. You can still select shingle colors from the swatches.
              </p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Home size={40} color="var(--rr-color-muted)" />
              <p className={styles.emptyTitle}>No Roof Data Yet</p>
              <p className={styles.emptyText}>
                Your roof visualization will appear here once your measurement report is processed.
              </p>
            </div>
          )}
        </div>

        <aside className={styles.sidebar}>
          <ShingleSelector
            initialTier="better"
            onSelect={setSelectedShingle}
          />

          {hasData && roofData && (
            <RoofStats
              sqftTotal={roofData.stats.sqftTotal}
              pitchPrimary={roofData.stats.pitchPrimary}
              facetCount={roofData.stats.facetCount}
            />
          )}
        </aside>
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

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/portal/roof/page.tsx
git commit -m "feat(roof): compute facet geometry client-side from segment data

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Clean Up DSM Code

**Files:**
- Modify: `src/lib/roof/data-layers.ts` — Remove DSM download/parse/mesh functions
- Modify: `src/app/api/portal/roof-data/route.ts` — Remove mesh cache-miss logic
- Delete: `src/lib/roof/dsm-mesh.ts`
- Delete: `src/lib/roof/__tests__/dsm-mesh.test.ts`

- [ ] **Step 1: Clean data-layers.ts**

Remove these functions and their references:
- `parseDsmGeoTiff` function
- `buildAndSerializeMesh` function
- `MAX_MESH_BYTES` and `DSM_STEP_INITIAL` constants
- Import of `generateRoofMesh` from `./dsm-mesh`
- Import of `RoofMesh` from `./types`
- The DSM download in `fetchRoofLayers` (remove `dsmBuffer` from `Promise.all`, remove the `3b. Parse DSM` section)
- Remove `mesh: roofMesh` from the return object

- [ ] **Step 2: Clean route.ts**

Remove the `else if (layers.mesh === undefined || layers.mesh === null)` branch (lines ~135-152). Keep only the simple `if (!layers)` check.

- [ ] **Step 3: Delete DSM files**

```bash
git rm src/lib/roof/dsm-mesh.ts src/lib/roof/__tests__/dsm-mesh.test.ts
```

- [ ] **Step 4: Run tests + typecheck**

Run: `npm run test && npm run typecheck`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/roof/data-layers.ts src/app/api/portal/roof-data/route.ts
git commit -m "chore(roof): remove DSM mesh pipeline, clean up data-layers

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Full Verification

- [ ] **Step 1: Run all tests**

Run: `npm run test`
Expected: All PASS (clip tests + facet-geometry tests + data-layers tests)

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: Clean

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, navigate to `/portal/roof`.
Expected:
- 3D roof with clean geometric facets (not noisy terrain)
- Visible slope angles matching the actual roof pitch
- Ridge/hip caps along shared edges
- Orbit controls work
- Shingle color changes when clicking swatches
- RoofStats shows correct data
