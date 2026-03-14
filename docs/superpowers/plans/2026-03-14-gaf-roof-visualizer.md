# GAF-Powered Roof Visualizer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Google Solar segment-based 3D visualizer with a DXF-based pipeline fed by GAF QuickMeasure reports, including wall extrusion from eave edges.

**Architecture:** Client fetches DXF file URL from the roof-data API → parses DXF text into 3DFACE vertices → converts to Three.js BufferGeometry with wall extrusion → renders in the existing RoofMeshViewer. Server-side: API returns GAF status and asset URLs from the measurement record.

**Tech Stack:** TypeScript, `dxf-parser` (npm), Three.js/R3F (existing), Vitest (testing)

**Spec:** `docs/superpowers/specs/2026-03-14-gaf-roof-visualizer-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/roof/dxf-parser.ts` | Parse DXF text → `DxfFacet[]` (vertices + normals per face) |
| Create | `src/lib/roof/dxf-to-geometry.ts` | Convert `DxfFacet[]` → `RoofGeometry` with wall extrusion |
| Create | `src/lib/roof/__tests__/dxf-parser.test.ts` | Tests with synthetic DXF strings |
| Create | `src/lib/roof/__tests__/dxf-to-geometry.test.ts` | Tests for geometry conversion + wall extrusion |
| Modify | `src/lib/roof/types.ts` | Add `DxfFacet`, add GAF fields to `RoofDataResponse` |
| Modify | `src/app/api/portal/roof-data/route.ts` | Return `gafStatus`, `gafDxfUrl`, `gafAssets` |
| Modify | `src/app/portal/roof/page.tsx` | DXF fetch/parse pipeline, loading states |
| Modify | `src/hooks/useRoofData.ts` | Shorter staleTime when GAF pending |
| Delete | `src/lib/roof/facet-geometry.ts` | Old Google Solar geometry engine |
| Delete | `src/lib/roof/clip.ts` | Old clipping utility |
| Delete | `src/lib/roof/__tests__/facet-geometry.test.ts` | Old geometry tests |
| Delete | `src/lib/roof/__tests__/clip.test.ts` | Old clipping tests |

---

## Chunk 1: Core DXF Pipeline

### Task 1: Install dxf-parser + Update Types

**Files:**
- Modify: `src/lib/roof/types.ts`
- Modify: `package.json`

- [ ] **Step 1: Install dxf-parser**

```bash
cd C:/Users/Owner/workspace/results-roofing
npm install dxf-parser
```

- [ ] **Step 2: Update types.ts**

Add `DxfFacet` interface and GAF fields to `RoofDataResponse`:

```typescript
/** Parsed 3D face from a DXF file */
export interface DxfFacet {
  vertices: [number, number, number][]; // [x, y, z] per vertex (3 or 4 points)
  normal: [number, number, number];     // unit normal of the face plane
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
  layers: RoofLayers | null;
  /** GAF QuickMeasure status */
  gafStatus: 'pending' | 'complete' | 'failed' | 'none';
  /** URL to DXF file in Vercel Blob (null if not yet available) */
  gafDxfUrl: string | null;
  /** All GAF asset URLs keyed by asset type */
  gafAssets: Record<string, string> | null;
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/lib/roof/types.ts
git commit -m "feat(roof): install dxf-parser, add DxfFacet type and GAF fields to RoofDataResponse"
```

---

### Task 2: DXF Parser

**Files:**
- Create: `src/lib/roof/dxf-parser.ts`
- Create: `src/lib/roof/__tests__/dxf-parser.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/roof/__tests__/dxf-parser.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseDxfToFacets } from '../dxf-parser';

// Minimal DXF with a single 3DFACE (triangle)
const SINGLE_TRIANGLE_DXF = `0
SECTION
2
ENTITIES
0
3DFACE
10
0.0
20
0.0
30
0.0
11
10.0
21
0.0
31
0.0
12
5.0
22
6.0
32
0.0
13
5.0
23
6.0
33
0.0
0
ENDSEC
0
EOF`;

// DXF with two 3DFACE entities (gable roof: two sloped triangles)
const GABLE_ROOF_DXF = `0
SECTION
2
ENTITIES
0
3DFACE
10
0.0
20
0.0
30
0.0
11
10.0
21
0.0
31
0.0
12
5.0
22
4.0
32
5.0
13
5.0
23
4.0
33
5.0
0
3DFACE
10
0.0
20
0.0
30
10.0
11
10.0
21
0.0
31
10.0
12
5.0
22
4.0
32
5.0
13
5.0
23
4.0
33
5.0
0
ENDSEC
0
EOF`;

describe('parseDxfToFacets', () => {
  it('returns empty array for empty DXF', () => {
    const result = parseDxfToFacets('');
    expect(result).toEqual([]);
  });

  it('parses a single 3DFACE triangle', () => {
    const facets = parseDxfToFacets(SINGLE_TRIANGLE_DXF);
    expect(facets.length).toBe(1);
    expect(facets[0].vertices.length).toBe(3);
    // Check vertex coordinates
    expect(facets[0].vertices[0]).toEqual([0, 0, 0]);
    expect(facets[0].vertices[1]).toEqual([10, 0, 0]);
    expect(facets[0].vertices[2]).toEqual([5, 6, 0]);
  });

  it('computes unit normal for each facet', () => {
    const facets = parseDxfToFacets(SINGLE_TRIANGLE_DXF);
    const [nx, ny, nz] = facets[0].normal;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    expect(len).toBeCloseTo(1.0, 4);
  });

  it('parses multiple 3DFACE entities (gable roof)', () => {
    const facets = parseDxfToFacets(GABLE_ROOF_DXF);
    expect(facets.length).toBe(2);
    // Each facet should have a non-zero normal
    for (const f of facets) {
      const len = Math.sqrt(f.normal[0] ** 2 + f.normal[1] ** 2 + f.normal[2] ** 2);
      expect(len).toBeCloseTo(1.0, 4);
    }
  });

  it('deduplicates 4th vertex when it equals the 3rd (triangle face)', () => {
    const facets = parseDxfToFacets(SINGLE_TRIANGLE_DXF);
    // 3DFACE has 4 vertex slots but when 3rd == 4th, it's a triangle
    expect(facets[0].vertices.length).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests — verify fail**

```bash
npx vitest run src/lib/roof/__tests__/dxf-parser.test.ts
```

- [ ] **Step 3: Implement parseDxfToFacets**

Create `src/lib/roof/dxf-parser.ts`:

```typescript
/**
 * Parse a DXF file string into roof facet polygons.
 *
 * Extracts 3DFACE entities (triangulated roof surfaces) from the DXF
 * and returns them as arrays of 3D vertices with computed face normals.
 *
 * Uses the `dxf-parser` npm package for DXF text parsing.
 */

import DxfParser from 'dxf-parser';
import type { DxfFacet } from './types';

type Vec3 = [number, number, number];

/**
 * Parse DXF text into an array of roof facets.
 * Each facet has 3 or 4 vertices and a unit normal.
 */
export function parseDxfToFacets(dxfText: string): DxfFacet[] {
  if (!dxfText.trim()) return [];

  const parser = new DxfParser();
  let dxf: ReturnType<DxfParser['parse']>;

  try {
    dxf = parser.parse(dxfText);
  } catch {
    return [];
  }

  if (!dxf?.entities) return [];

  const facets: DxfFacet[] = [];

  for (const entity of dxf.entities) {
    if (entity.type !== '3DFACE') continue;

    const verts = (entity as { vertices?: { x: number; y: number; z: number }[] }).vertices;
    if (!verts || verts.length < 3) continue;

    // Convert to [x, y, z] tuples
    const points: Vec3[] = verts.map(v => [v.x, v.y, v.z]);

    // Deduplicate 4th vertex if it matches the 3rd (triangle encoded as quad)
    if (points.length === 4) {
      const [ax, ay, az] = points[2];
      const [bx, by, bz] = points[3];
      if (Math.abs(ax - bx) < 1e-6 && Math.abs(ay - by) < 1e-6 && Math.abs(az - bz) < 1e-6) {
        points.pop();
      }
    }

    const normal = computeNormal(points[0], points[1], points[2]);
    facets.push({ vertices: points, normal });
  }

  return facets;
}

/** Compute unit normal from three vertices using cross product. */
function computeNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
  const acx = c[0] - a[0], acy = c[1] - a[1], acz = c[2] - a[2];

  const nx = aby * acz - abz * acy;
  const ny = abz * acx - abx * acz;
  const nz = abx * acy - aby * acx;

  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len < 1e-10) return [0, 1, 0]; // degenerate → default up

  return [nx / len, ny / len, nz / len];
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npx vitest run src/lib/roof/__tests__/dxf-parser.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/roof/dxf-parser.ts src/lib/roof/__tests__/dxf-parser.test.ts
git commit -m "feat(roof): add DXF parser — extracts 3DFACE entities into facet polygons"
```

---

### Task 3: DXF to Geometry Converter (with Wall Extrusion)

**Files:**
- Create: `src/lib/roof/dxf-to-geometry.ts`
- Create: `src/lib/roof/__tests__/dxf-to-geometry.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/roof/__tests__/dxf-to-geometry.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildGeometryFromFacets } from '../dxf-to-geometry';
import type { DxfFacet } from '../types';

// Simple gable roof: 2 triangular facets meeting at a ridge
const gableFacets: DxfFacet[] = [
  {
    vertices: [[0, 0, 0], [10, 0, 0], [5, 4, 5]],
    normal: [0, 0.6, -0.8], // slopes toward viewer
  },
  {
    vertices: [[0, 0, 10], [10, 0, 10], [5, 4, 5]],
    normal: [0, 0.6, 0.8], // slopes away
  },
];

// Single flat facet (no walls needed — or all edges are eaves)
const flatFacet: DxfFacet[] = [
  {
    vertices: [[0, 5, 0], [10, 5, 0], [10, 5, 10], [0, 5, 10]],
    normal: [0, 1, 0],
  },
];

describe('buildGeometryFromFacets', () => {
  it('returns null for empty facets', () => {
    expect(buildGeometryFromFacets([])).toBeNull();
  });

  it('produces valid geometry from gable roof', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    expect(geo).not.toBeNull();
    expect(geo.facetCount).toBe(2);
    expect(geo.positions.length).toBe(geo.vertexCount * 3);
    expect(geo.normals.length).toBe(geo.vertexCount * 3);
    expect(geo.indices.length).toBe(geo.triangleCount * 3);
  });

  it('includes wall geometry (more triangles than just roof)', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    // 2 roof facets = 2 triangles. Walls add more.
    // Gable has 4 eave edges (2 bottom edges of the 2 triangles, minus shared ridge)
    // Each wall = 2 triangles, so total should be > 2
    expect(geo.triangleCount).toBeGreaterThan(2);
  });

  it('mesh is centered at origin', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < geo.positions.length; i += 3) {
      minX = Math.min(minX, geo.positions[i]);
      maxX = Math.max(maxX, geo.positions[i]);
      minZ = Math.min(minZ, geo.positions[i + 2]);
      maxZ = Math.max(maxZ, geo.positions[i + 2]);
    }
    expect(Math.abs((minX + maxX) / 2)).toBeLessThan(0.5);
    expect(Math.abs((minZ + maxZ) / 2)).toBeLessThan(0.5);
  });

  it('walls extend down to Y=0', () => {
    const geo = buildGeometryFromFacets(flatFacet)!;
    let minY = Infinity;
    for (let i = 1; i < geo.positions.length; i += 3) {
      minY = Math.min(minY, geo.positions[i]);
    }
    // After normalization, ground level should be at or near 0
    expect(minY).toBeCloseTo(0, 0);
  });

  it('normals have unit length', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    for (let i = 0; i < geo.normals.length; i += 3) {
      const len = Math.sqrt(
        geo.normals[i] ** 2 + geo.normals[i + 1] ** 2 + geo.normals[i + 2] ** 2,
      );
      expect(len).toBeCloseTo(1.0, 2);
    }
  });

  it('all indices reference valid vertices', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    for (let i = 0; i < geo.indices.length; i++) {
      expect(geo.indices[i]).toBeLessThan(geo.vertexCount);
    }
  });
});
```

- [ ] **Step 2: Run tests — verify fail**

```bash
npx vitest run src/lib/roof/__tests__/dxf-to-geometry.test.ts
```

- [ ] **Step 3: Implement buildGeometryFromFacets**

Create `src/lib/roof/dxf-to-geometry.ts`:

```typescript
/**
 * Convert parsed DXF facets into Three.js-ready BufferGeometry arrays.
 *
 * 1. Triangulate roof facets (fan from vertex 0)
 * 2. Detect eave edges (boundary edges not shared between two facets)
 * 3. Extrude walls from eave edges down to ground plane
 * 4. Center at origin, scale to ~15 units
 * 5. Output positions, normals, indices as typed arrays
 */

import type { DxfFacet, RoofGeometry } from './types';

type Vec3 = [number, number, number];

export function buildGeometryFromFacets(facets: DxfFacet[]): RoofGeometry | null {
  if (facets.length === 0) return null;

  const allPositions: number[] = [];
  const allNormals: number[] = [];
  const allIndices: number[] = [];
  let vertexOffset = 0;

  // ── 1. Add roof facet geometry ──────────────────────────────────────────

  for (const facet of facets) {
    const startIdx = vertexOffset;

    for (const [x, y, z] of facet.vertices) {
      allPositions.push(x, y, z);
      allNormals.push(facet.normal[0], facet.normal[1], facet.normal[2]);
      vertexOffset++;
    }

    // Fan triangulation (convex polygons)
    for (let k = 1; k < facet.vertices.length - 1; k++) {
      allIndices.push(startIdx, startIdx + k, startIdx + k + 1);
    }
  }

  // ── 2. Detect eave edges (boundary edges) ───────────────────────────────

  // Build edge frequency map: edge key → count
  // An edge shared by 2 facets is internal (ridge/hip/valley)
  // An edge used by only 1 facet is a boundary (eave) edge
  const edgeCount = new Map<string, { a: Vec3; b: Vec3 }>();

  for (const facet of facets) {
    const n = facet.vertices.length;
    for (let i = 0; i < n; i++) {
      const a = facet.vertices[i];
      const b = facet.vertices[(i + 1) % n];
      const key = edgeKey(a, b);

      if (edgeCount.has(key)) {
        edgeCount.delete(key); // shared edge — remove (internal)
      } else {
        edgeCount.set(key, { a, b });
      }
    }
  }

  // ── 3. Extrude walls from eave edges ────────────────────────────────────

  // Find the lowest Y across all vertices (will become ground after normalization)
  let groundY = Infinity;
  for (let i = 1; i < allPositions.length; i += 3) {
    groundY = Math.min(groundY, allPositions[i]);
  }
  // Drop walls slightly below the lowest roof point
  groundY -= 0.1;

  // For roofs where the lowest point IS the eave, we need actual ground.
  // Use a fixed ground offset: drop walls by the height of the roof.
  let maxY = -Infinity;
  for (let i = 1; i < allPositions.length; i += 3) {
    maxY = Math.max(maxY, allPositions[i]);
  }
  const roofHeight = maxY - groundY;
  const wallBottom = groundY - roofHeight * 0.6; // walls extend 60% of roof height below eave

  const WALL_COLOR: Vec3 = [0, 0, 0]; // normals placeholder — computed per wall

  for (const { a, b } of edgeCount.values()) {
    // Wall: rectangle from edge at roof height down to wallBottom
    // 4 vertices: a_top, b_top, b_bottom, a_bottom
    const startIdx = vertexOffset;

    // Compute outward-facing wall normal (horizontal, perpendicular to edge)
    const edgeDx = b[0] - a[0];
    const edgeDz = b[2] - a[2];
    const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDz * edgeDz);
    if (edgeLen < 0.001) continue;

    // Normal perpendicular to edge in XZ plane, pointing outward
    const wallNx = -edgeDz / edgeLen;
    const wallNz = edgeDx / edgeLen;

    // Top vertices (at roof eave)
    allPositions.push(a[0], a[1], a[2]);
    allNormals.push(wallNx, 0, wallNz);
    allPositions.push(b[0], b[1], b[2]);
    allNormals.push(wallNx, 0, wallNz);
    // Bottom vertices (at ground)
    allPositions.push(b[0], wallBottom, b[2]);
    allNormals.push(wallNx, 0, wallNz);
    allPositions.push(a[0], wallBottom, a[2]);
    allNormals.push(wallNx, 0, wallNz);
    vertexOffset += 4;

    // Two triangles for the wall quad
    allIndices.push(startIdx, startIdx + 1, startIdx + 2);
    allIndices.push(startIdx, startIdx + 2, startIdx + 3);
  }

  // ── 4. Normalize: center at origin, scale to ~15 units ──────────────────

  const positions = new Float32Array(allPositions);
  const normals = new Float32Array(allNormals);
  const indices = new Uint32Array(allIndices);

  let minX = Infinity, maxX2 = -Infinity;
  let minY2 = Infinity;
  let minZ = Infinity, maxZ2 = -Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    maxX2 = Math.max(maxX2, positions[i]);
    minY2 = Math.min(minY2, positions[i + 1]);
    minZ = Math.min(minZ, positions[i + 2]);
    maxZ2 = Math.max(maxZ2, positions[i + 2]);
  }

  const centerX = (minX + maxX2) / 2;
  const centerZ = (minZ + maxZ2) / 2;
  const maxSpan = Math.max(maxX2 - minX, maxZ2 - minZ, 1);
  const scale = 15 / maxSpan;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - centerX) * scale;
    positions[i + 1] = (positions[i + 1] - minY2) * scale;
    positions[i + 2] = (positions[i + 2] - centerZ) * scale;
  }

  const vertexCount = positions.length / 3;
  return {
    positions,
    normals,
    indices,
    vertexCount,
    triangleCount: indices.length / 3,
    facetCount: facets.length,
  };
}

/** Create a canonical edge key (order-independent) for deduplication. */
function edgeKey(a: Vec3, b: Vec3): string {
  // Round to avoid floating point mismatch
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const ka = `${round(a[0])},${round(a[1])},${round(a[2])}`;
  const kb = `${round(b[0])},${round(b[1])},${round(b[2])}`;
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npx vitest run src/lib/roof/__tests__/dxf-to-geometry.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/roof/dxf-to-geometry.ts src/lib/roof/__tests__/dxf-to-geometry.test.ts
git commit -m "feat(roof): add DXF-to-geometry converter with wall extrusion from eave edges"
```

---

## Chunk 2: API + Page + Cleanup

### Task 4: Update roof-data API — Return GAF Status + Assets

**Files:**
- Modify: `src/app/api/portal/roof-data/route.ts`

- [ ] **Step 1: Update the API response**

After the existing `layers` logic, add GAF status and asset URL resolution:

```typescript
// After the layers block, before building the response:

// ── Resolve GAF status and assets ──────────────────────────────────
const gafAssets = (measurement.gafAssets as Record<string, string>) ?? null;
let gafStatus: 'pending' | 'complete' | 'failed' | 'none' = 'none';

if (measurement.gafOrderNumber) {
  if (measurement.vendor === 'gaf' && measurement.status === 'complete') {
    gafStatus = 'complete';
  } else if (measurement.status === 'failed') {
    gafStatus = 'failed';
  } else {
    gafStatus = 'pending';
  }
}

// Find DXF URL from gafAssets (check multiple possible keys)
const gafDxfUrl = gafAssets?.DxfUrl ?? gafAssets?.BuildingDxfUrl ?? gafAssets?.dxfUrl ?? null;
```

Then add to the response object:

```typescript
const response: RoofDataResponse = {
  // ... existing fields ...
  layers,
  gafStatus,
  gafDxfUrl,
  gafAssets,
};
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/portal/roof-data/route.ts
git commit -m "feat(roof): return GAF status and DXF URL from roof-data API"
```

---

### Task 5: Update useRoofData Hook — Poll When Pending

**Files:**
- Modify: `src/hooks/useRoofData.ts`

- [ ] **Step 1: Add polling for pending GAF status**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { RoofDataResponse } from '@/lib/roof/types';

async function fetchRoofData(quoteId: string): Promise<RoofDataResponse> {
  const res = await fetch(`/api/portal/roof-data?quoteId=${quoteId}`);
  if (!res.ok) throw new Error('Failed to fetch roof data');
  return res.json();
}

export function useRoofData(quoteId: string | null | undefined) {
  return useQuery<RoofDataResponse>({
    queryKey: ['roof-data', quoteId],
    queryFn: () => fetchRoofData(quoteId!),
    enabled: !!quoteId,
    staleTime: 5 * 60 * 1000,
    // Poll every 30s when GAF data is pending, stop when complete
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.gafStatus === 'pending') return 30_000;
      return false;
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useRoofData.ts
git commit -m "feat(roof): poll roof-data every 30s while GAF order is pending"
```

---

### Task 6: Update Page — DXF Pipeline + Loading States

**Files:**
- Modify: `src/app/portal/roof/page.tsx`

- [ ] **Step 1: Rewrite page to use DXF pipeline**

```typescript
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Home, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { ShingleSelector } from '@/components/features/roof/ShingleSelector';
import { RoofStats } from '@/components/features/roof/RoofStats';
import { RoofPageSkeleton } from '@/components/features/roof/RoofPageSkeleton';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { useRoofData } from '@/hooks/useRoofData';
import { getDefaultShingle } from '@/lib/roof/shingle-catalog';
import { parseDxfToFacets } from '@/lib/roof/dxf-parser';
import { buildGeometryFromFacets } from '@/lib/roof/dxf-to-geometry';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { ShingleOption } from '@/lib/roof/types';
import type { RoofGeometry } from '@/lib/roof/types';
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

  // Fetch and parse DXF when URL is available
  const [roofGeometry, setRoofGeometry] = useState<RoofGeometry | null>(null);
  const [dxfLoading, setDxfLoading] = useState(false);

  const dxfUrl = roofData?.gafDxfUrl ?? null;

  useEffect(() => {
    if (!dxfUrl) {
      setRoofGeometry(null);
      return;
    }

    let cancelled = false;
    setDxfLoading(true);

    fetch(dxfUrl)
      .then(res => res.text())
      .then(dxfText => {
        if (cancelled) return;
        const facets = parseDxfToFacets(dxfText);
        const geometry = buildGeometryFromFacets(facets);
        setRoofGeometry(geometry);
      })
      .catch(() => {
        if (!cancelled) setRoofGeometry(null);
      })
      .finally(() => {
        if (!cancelled) setDxfLoading(false);
      });

    return () => { cancelled = true; };
  }, [dxfUrl]);

  if (phaseLoading || dataLoading) {
    return <RoofPageSkeleton />;
  }

  const hasData = !!roofData?.buildingCenter;
  const gafStatus = roofData?.gafStatus ?? 'none';

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
          ) : gafStatus === 'pending' || dxfLoading ? (
            <div className={styles.emptyState}>
              <Loader2 size={40} color="var(--rr-color-muted)" className={styles.spinner} />
              <p className={styles.emptyTitle}>Your Roof Model Is Being Prepared</p>
              <p className={styles.emptyText}>
                This typically takes about an hour. The page will update automatically when your roof is ready.
              </p>
            </div>
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

- [ ] **Step 2: Add spinner animation to page.module.css**

Add to the existing `page.module.css`:

```css
.spinner {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/app/portal/roof/page.tsx src/app/portal/roof/page.module.css
git commit -m "feat(roof): DXF-based visualizer with GAF loading states and auto-polling"
```

---

### Task 7: Clean Up Old Code

**Files:**
- Delete: `src/lib/roof/facet-geometry.ts`
- Delete: `src/lib/roof/clip.ts`
- Delete: `src/lib/roof/__tests__/facet-geometry.test.ts`
- Delete: `src/lib/roof/__tests__/clip.test.ts`

- [ ] **Step 1: Delete old files**

```bash
git rm src/lib/roof/facet-geometry.ts src/lib/roof/clip.ts src/lib/roof/__tests__/facet-geometry.test.ts src/lib/roof/__tests__/clip.test.ts
```

- [ ] **Step 2: Run tests + typecheck**

```bash
npx vitest run && npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(roof): remove Google Solar geometry engine and clipping utility"
```

---

### Task 8: Full Verification

- [ ] **Step 1: Run all tests**

```bash
npm run test
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Run build**

```bash
npm run build
```

- [ ] **Step 4: Push to main**

```bash
git push
```

Expected: Clean build, all tests pass, deployed to Vercel automatically.
