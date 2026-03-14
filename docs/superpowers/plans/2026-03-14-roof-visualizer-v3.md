# Roof Visualizer v3 — 3D DSM Mesh Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2D satellite overlay with a 3D mesh generated from Google Solar's DSM GeoTIFF, rendered in React Three Fiber with orbit controls and shingle color preview.

**Architecture:** Server downloads DSM + mask GeoTIFFs, builds a decimated triangle mesh (0.2m resolution), serializes as base64 typed arrays, caches in DB. Client hydrates into a Three.js BufferGeometry with solid shingle color material. Mesh generation lives in an isolated module (`dsm-mesh.ts`); data pipeline orchestration stays in `data-layers.ts`.

**Tech Stack:** TypeScript, geotiff.js (GeoTIFF parsing), Three.js / React Three Fiber / drei (3D rendering), Vitest (testing)

**Spec:** `docs/superpowers/specs/2026-03-13-roof-visualizer-v3-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/roof/dsm-mesh.ts` | Pure function: DSM raster + mask → positions/normals/indices typed arrays |
| Create | `src/lib/roof/__tests__/dsm-mesh.test.ts` | Unit tests for mesh generation with synthetic elevation grids |
| Create | `src/components/features/roof/RoofMeshViewer.tsx` | R3F scene: BufferGeometry from mesh data, orbit controls, lighting |
| Modify | `src/lib/roof/types.ts` | Add `RoofMesh` interface, add `mesh` field to `RoofLayers` |
| Modify | `src/db/schema/measurements.ts` | Add `mesh` to `roofLayers` `$type<>()` |
| Modify | `src/lib/roof/data-layers.ts` | Download + parse DSM, call mesh builder, split size budgets |
| Modify | `src/app/api/portal/roof-data/route.ts` | Mesh-specific cache-miss detection |
| Modify | `src/app/portal/roof/page.tsx` | Swap RoofCanvasViewer → RoofMeshViewer |
| Delete | `src/components/features/roof/RoofCanvasViewer.tsx` | Satellite overlay (replaced) |
| Delete | `src/components/features/roof/RoofViewer.tsx` | Old R3F wrapper |
| Delete | `src/components/features/roof/RoofModel.tsx` | Old bounding-box renderer |
| Delete | `src/components/features/roof/RoofFacet.tsx` | Old facet component |
| Delete | `src/components/features/roof/CameraPresets.tsx` | Old camera presets |
| Delete | `src/lib/roof/geometry.ts` | Bounding-box geometry engine |
| Delete | `src/lib/roof/clip.ts` | Polygon clipping |
| Delete | `src/lib/roof/__tests__/geometry.test.ts` | Old geometry tests |
| Delete | `src/lib/roof/__tests__/clip.test.ts` | Old clipping tests |

---

## Chunk 1: Core Mesh Generation

### Task 1: Types — Add RoofMesh to types.ts

**Files:**
- Modify: `src/lib/roof/types.ts:70-84`
- Modify: `src/db/schema/measurements.ts:43-52`

- [ ] **Step 1: Add RoofMesh interface and update RoofLayers**

In `src/lib/roof/types.ts`, add `RoofMesh` interface after `RoofLayers` and add `mesh` field:

```typescript
// Add after the RoofLayers interface (after line 84):

/** Serialized triangle mesh for 3D rendering */
export interface RoofMesh {
  /** Base64-encoded Float32Array — vertex positions [x,y,z, x,y,z, ...] */
  positions: string;
  /** Base64-encoded Float32Array — vertex normals [nx,ny,nz, ...] */
  normals: string;
  /** Base64-encoded Uint32Array — triangle indices [i0,i1,i2, ...] */
  indices: string;
  vertexCount: number;
  triangleCount: number;
}

// Add to RoofLayers interface (after bounds field, before closing brace):
  /** 3D mesh generated from DSM. Null if DSM unavailable or generation failed. */
  mesh: RoofMesh | null;
```

- [ ] **Step 2: Update DB schema type annotation**

In `src/db/schema/measurements.ts`, update the `$type<>()` on `roofLayers` (lines 43-52) to include the mesh field:

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
  mesh: {
    positions: string;
    normals: string;
    indices: string;
    vertexCount: number;
    triangleCount: number;
  } | null;
}>(),
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: Type errors in `data-layers.ts` (missing `mesh` field in returned object). This is expected — we'll fix it in Task 3.

- [ ] **Step 4: Commit**

```bash
git add src/lib/roof/types.ts src/db/schema/measurements.ts
git commit -m "feat(roof): add RoofMesh type and mesh field to RoofLayers"
```

---

### Task 2: DSM Mesh Generator — dsm-mesh.ts + Tests

**Files:**
- Create: `src/lib/roof/dsm-mesh.ts`
- Create: `src/lib/roof/__tests__/dsm-mesh.test.ts`

This is the core algorithm. Pure function, no I/O, fully testable.

- [ ] **Step 1: Write failing tests**

Create `src/lib/roof/__tests__/dsm-mesh.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateRoofMesh } from '../dsm-mesh';

// 4x4 elevation grid: a simple pitched roof shape
// Row 0 (top):    10, 11, 11, 10    (eaves)
// Row 1:          11, 12, 12, 11    (mid slope)
// Row 2:          11, 12, 12, 11    (mid slope)
// Row 3 (bottom): 10, 11, 11, 10    (eaves)
const DSM_4x4 = new Float32Array([
  10, 11, 11, 10,
  11, 12, 12, 11,
  11, 12, 12, 11,
  10, 11, 11, 10,
]);

// Full mask — all pixels are roof
const MASK_ALL = new Uint8Array([
  255, 255, 255, 255,
  255, 255, 255, 255,
  255, 255, 255, 255,
  255, 255, 255, 255,
]);

// Partial mask — only center 2x2 are roof
const MASK_CENTER = new Uint8Array([
  0, 0, 0, 0,
  0, 255, 255, 0,
  0, 255, 255, 0,
  0, 0, 0, 0,
]);

describe('generateRoofMesh', () => {
  it('returns positions, normals, and indices arrays', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1);

    expect(result).not.toBeNull();
    expect(result!.positions).toBeInstanceOf(Float32Array);
    expect(result!.normals).toBeInstanceOf(Float32Array);
    expect(result!.indices).toBeInstanceOf(Uint32Array);
  });

  it('positions length is 3x vertex count', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;

    expect(result.positions.length).toBe(result.vertexCount * 3);
    expect(result.normals.length).toBe(result.vertexCount * 3);
  });

  it('indices length is 3x triangle count', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;

    expect(result.indices.length).toBe(result.triangleCount * 3);
  });

  it('all indices reference valid vertices', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;

    for (let i = 0; i < result.indices.length; i++) {
      expect(result.indices[i]).toBeLessThan(result.vertexCount);
    }
  });

  it('4x4 grid with step=1 produces 4x4=16 vertices and (3*3*2)=18 triangles', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;

    expect(result.vertexCount).toBe(16);
    expect(result.triangleCount).toBe(18); // (4-1)*(4-1)*2
  });

  it('partial mask produces fewer vertices and triangles', () => {
    const full = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;
    const partial = generateRoofMesh(DSM_4x4, MASK_CENTER, 4, 4, 1)!;

    expect(partial.vertexCount).toBeLessThan(full.vertexCount);
    expect(partial.triangleCount).toBeLessThan(full.triangleCount);
  });

  it('decimation with step=2 reduces vertex count', () => {
    // 8x8 grid to test decimation
    const dsm8 = new Float32Array(64).fill(10);
    const mask8 = new Uint8Array(64).fill(255);

    const full = generateRoofMesh(dsm8, mask8, 8, 8, 1)!;
    const decimated = generateRoofMesh(dsm8, mask8, 8, 8, 2)!;

    expect(decimated.vertexCount).toBeLessThan(full.vertexCount);
  });

  it('returns null when mask has zero roof pixels', () => {
    const emptyMask = new Uint8Array(16).fill(0);
    const result = generateRoofMesh(DSM_4x4, emptyMask, 4, 4, 1);

    expect(result).toBeNull();
  });

  it('returns null for 1x1 grid (cannot form triangles)', () => {
    const result = generateRoofMesh(new Float32Array([10]), new Uint8Array([255]), 1, 1, 1);
    expect(result).toBeNull();
  });

  it('returns null when step exceeds grid dimensions', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 8);
    expect(result).toBeNull();
  });

  it('skips triangles where any vertex has NaN elevation', () => {
    const dsmWithNaN = new Float32Array([
      10, 11, 11, 10,
      11, NaN, 12, 11,
      11, 12, 12, 11,
      10, 11, 11, 10,
    ]);
    const result = generateRoofMesh(dsmWithNaN, MASK_ALL, 4, 4, 1)!;

    // Should have fewer triangles than full grid
    expect(result.triangleCount).toBeLessThan(18);
    // All position values should be finite
    for (let i = 0; i < result.positions.length; i++) {
      expect(Number.isFinite(result.positions[i])).toBe(true);
    }
  });

  it('normalizes mesh to be centered at origin', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;

    // Calculate center of bounding box
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < result.positions.length; i += 3) {
      minX = Math.min(minX, result.positions[i]);
      maxX = Math.max(maxX, result.positions[i]);
      minZ = Math.min(minZ, result.positions[i + 2]);
      maxZ = Math.max(maxZ, result.positions[i + 2]);
    }

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // Center should be approximately at origin
    expect(Math.abs(centerX)).toBeLessThan(0.01);
    expect(Math.abs(centerZ)).toBeLessThan(0.01);
  });

  it('normals have unit length', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;

    for (let i = 0; i < result.normals.length; i += 3) {
      const nx = result.normals[i];
      const ny = result.normals[i + 1];
      const nz = result.normals[i + 2];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      expect(len).toBeCloseTo(1.0, 2);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/roof/__tests__/dsm-mesh.test.ts`
Expected: FAIL — `generateRoofMesh` not found

- [ ] **Step 3: Implement generateRoofMesh**

Create `src/lib/roof/dsm-mesh.ts`:

```typescript
/**
 * DSM-to-mesh generator.
 *
 * Converts a Digital Surface Model (elevation grid) + roof mask into a
 * triangle mesh suitable for Three.js rendering.
 *
 * Pure function — no I/O, no side effects.
 */

export interface MeshResult {
  positions: Float32Array;   // [x,y,z, x,y,z, ...] — centered at origin
  normals: Float32Array;     // [nx,ny,nz, ...] — unit normals
  indices: Uint32Array;      // [i0,i1,i2, ...] — triangle indices
  vertexCount: number;
  triangleCount: number;
}

/**
 * Generate a triangle mesh from DSM elevation data, masked to roof-only pixels.
 *
 * @param dsm - Float32Array of elevation values (meters above sea level), row-major
 * @param mask - Uint8Array of mask values (>0 = roof), same dimensions as DSM
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param step - Decimation step (1 = every pixel, 2 = every other, etc.)
 * @returns MeshResult or null if no roof pixels found
 */
export function generateRoofMesh(
  dsm: Float32Array,
  mask: Uint8Array,
  width: number,
  height: number,
  step: number,
): MeshResult | null {
  // 1. Build vertex grid — sample every `step` pixels
  const cols = Math.floor((width - 1) / step) + 1;
  const rows = Math.floor((height - 1) / step) + 1;

  // Map (gridRow, gridCol) → vertex index (-1 if not roof)
  const vertexMap = new Int32Array(rows * cols).fill(-1);
  const rawPositions: number[] = [];
  let vertexCount = 0;

  for (let gr = 0; gr < rows; gr++) {
    for (let gc = 0; gc < cols; gc++) {
      const px = gc * step;
      const py = gr * step;
      const srcIdx = py * width + px;

      if (mask[srcIdx] > 0 && Number.isFinite(dsm[srcIdx])) {
        vertexMap[gr * cols + gc] = vertexCount;
        rawPositions.push(px, dsm[srcIdx], py); // x=col, y=elevation, z=row
        vertexCount++;
      }
    }
  }

  if (vertexCount === 0) return null;

  // 2. Build triangles — connect adjacent roof vertices in grid
  const rawIndices: number[] = [];

  for (let gr = 0; gr < rows - 1; gr++) {
    for (let gc = 0; gc < cols - 1; gc++) {
      const tl = vertexMap[gr * cols + gc];
      const tr = vertexMap[gr * cols + gc + 1];
      const bl = vertexMap[(gr + 1) * cols + gc];
      const br = vertexMap[(gr + 1) * cols + gc + 1];

      // Triangle 1: top-left, bottom-left, top-right
      if (tl >= 0 && bl >= 0 && tr >= 0) {
        rawIndices.push(tl, bl, tr);
      }

      // Triangle 2: top-right, bottom-left, bottom-right
      if (tr >= 0 && bl >= 0 && br >= 0) {
        rawIndices.push(tr, bl, br);
      }
    }
  }

  if (rawIndices.length === 0) return null;

  // 3. Center mesh at origin (XZ plane), normalize Y (elevation) relative to min
  const positions = new Float32Array(rawPositions);

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

  // Scale factor: make the roof span ~10-20 units
  const spanX = maxX - minX;
  const spanZ = maxZ - minZ;
  const maxSpan = Math.max(spanX, spanZ, 1);
  const scale = 15 / maxSpan; // target ~15 units across

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - centerX) * scale;
    positions[i + 1] = (positions[i + 1] - minY) * scale;
    positions[i + 2] = (positions[i + 2] - centerZ) * scale;
  }

  const indices = new Uint32Array(rawIndices);

  // 4. Compute per-vertex normals
  const normals = computeNormals(positions, indices, vertexCount);

  return {
    positions,
    normals,
    indices,
    vertexCount,
    triangleCount: rawIndices.length / 3,
  };
}

/**
 * Compute smooth per-vertex normals by averaging face normals of adjacent triangles.
 */
function computeNormals(
  positions: Float32Array,
  indices: Uint32Array,
  vertexCount: number,
): Float32Array {
  const normals = new Float32Array(vertexCount * 3);

  // Accumulate face normals onto vertices
  for (let i = 0; i < indices.length; i += 3) {
    const ia = indices[i] * 3;
    const ib = indices[i + 1] * 3;
    const ic = indices[i + 2] * 3;

    // Edge vectors
    const abx = positions[ib] - positions[ia];
    const aby = positions[ib + 1] - positions[ia + 1];
    const abz = positions[ib + 2] - positions[ia + 2];

    const acx = positions[ic] - positions[ia];
    const acy = positions[ic + 1] - positions[ia + 1];
    const acz = positions[ic + 2] - positions[ia + 2];

    // Cross product (face normal, not normalized — area-weighted)
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;

    // Accumulate onto each vertex of this face
    for (const idx of [ia, ib, ic]) {
      normals[idx] += nx;
      normals[idx + 1] += ny;
      normals[idx + 2] += nz;
    }
  }

  // Normalize each vertex normal to unit length
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.sqrt(
      normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2,
    );
    if (len > 0) {
      normals[i] /= len;
      normals[i + 1] /= len;
      normals[i + 2] /= len;
    } else {
      normals[i + 1] = 1; // default to up
    }
  }

  return normals;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/roof/__tests__/dsm-mesh.test.ts`
Expected: All 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/roof/dsm-mesh.ts src/lib/roof/__tests__/dsm-mesh.test.ts
git commit -m "feat(roof): add DSM-to-mesh generator with tests"
```

---

## Chunk 2: Data Pipeline Integration

### Task 3: Extend data-layers.ts — DSM Download + Mesh Generation

**Files:**
- Modify: `src/lib/roof/data-layers.ts`

**Context:** The existing `fetchRoofLayers` function (line 48) downloads RGB + mask GeoTIFFs. We need to also download the DSM GeoTIFF, parse it as Float32, generate a mesh, and include it in the response. The `DataLayersResponse` interface (line 22) already has `dsmUrl`.

- [ ] **Step 1: Add DSM imports and constants**

At the top of `data-layers.ts`, add import for the mesh generator:

```typescript
// After line 13 (import type { RoofLayers } from './types';):
import type { RoofLayers, RoofMesh } from './types';
import { generateRoofMesh } from './dsm-mesh';
```

Add a separate mesh size constant after `MAX_PAYLOAD_BYTES` (line 16):

```typescript
const MAX_MESH_BYTES = 1_000_000;  // 1MB — separate budget for mesh data
const DSM_STEP_INITIAL = 2;        // 0.2m resolution (every 2nd pixel)
```

- [ ] **Step 2: Add DSM parsing function**

After `parseGeoTiff` (line 201), add a DSM-specific parser that returns Float32Array:

```typescript
async function parseDsmGeoTiff(
  buffer: ArrayBuffer,
): Promise<{ data: Float32Array; meta: GeoTiffMeta } | null> {
  try {
    const tiff = await fromArrayBuffer(buffer);
    const image = await tiff.getImage();

    const width = image.getWidth();
    const height = image.getHeight();
    const origin = image.getOrigin() as [number, number];
    const resolution = image.getResolution() as [number, number];
    const bbox = image.getBoundingBox() as [number, number, number, number];

    const rasters = await image.readRasters();
    const meta: GeoTiffMeta = { origin, resolution, width, height, bbox };

    // DSM is single-band Float32 — elevation in meters
    return {
      data: new Float32Array(rasters[0] as ArrayLike<number>),
      meta,
    };
  } catch (error) {
    logger.error('[DataLayers] DSM GeoTIFF parse error', error);
    return null;
  }
}
```

- [ ] **Step 3: Add mesh serialization helper**

After the new `parseDsmGeoTiff`, add a function that builds and serializes the mesh with adaptive decimation:

```typescript
function buildAndSerializeMesh(
  dsm: Float32Array,
  mask: Uint8Array,
  width: number,
  height: number,
): RoofMesh | null {
  let step = DSM_STEP_INITIAL;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const mesh = generateRoofMesh(dsm, mask, width, height, step);
    if (!mesh) return null;

    // Serialize to base64
    const posB64 = Buffer.from(mesh.positions.buffer).toString('base64');
    const normB64 = Buffer.from(mesh.normals.buffer).toString('base64');
    const idxB64 = Buffer.from(mesh.indices.buffer).toString('base64');

    const totalBytes = posB64.length + normB64.length + idxB64.length;

    if (totalBytes <= MAX_MESH_BYTES) {
      return {
        positions: posB64,
        normals: normB64,
        indices: idxB64,
        vertexCount: mesh.vertexCount,
        triangleCount: mesh.triangleCount,
      };
    }

    // Too large — increase decimation
    logger.warn(
      `[DataLayers] Mesh ${totalBytes} bytes exceeds ${MAX_MESH_BYTES}, retrying with step=${step * 2}`,
    );
    step *= 2;
  }

  logger.warn('[DataLayers] Mesh still too large after max retries');
  return null;
}
```

- [ ] **Step 4: Update fetchRoofLayers to download DSM and generate mesh**

Modify the `fetchRoofLayers` function. After the RGB + mask download (around line 62), add DSM download in parallel. Then after parsing, generate the mesh.

Replace the current download section (lines 59-73) — the two `Promise.all` blocks and retry — with a three-way parallel download:

```typescript
    // 2. Download RGB + Mask + DSM GeoTIFFs in parallel
    let [rgbBuffer, maskBuffer, dsmBuffer] = await Promise.all([
      downloadGeoTiff(layerUrls.rgbUrl, apiKey),
      downloadGeoTiff(layerUrls.maskUrl, apiKey),
      downloadGeoTiff(layerUrls.dsmUrl, apiKey),
    ]);

    // Retry once if download failed (URLs may have expired)
    if (!rgbBuffer || !maskBuffer) {
      logger.warn('[DataLayers] GeoTIFF download failed, retrying with fresh URLs');
      layerUrls = await fetchDataLayerUrls(lat, lng, apiKey);
      if (!layerUrls) return null;
      [rgbBuffer, maskBuffer, dsmBuffer] = await Promise.all([
        downloadGeoTiff(layerUrls.rgbUrl, apiKey),
        downloadGeoTiff(layerUrls.maskUrl, apiKey),
        downloadGeoTiff(layerUrls.dsmUrl, apiKey),
      ]);
    }
    if (!rgbBuffer || !maskBuffer) return null;
```

After parsing RGB + mask (lines 77-79), add DSM parsing:

```typescript
    // 3b. Parse DSM GeoTIFF (for 3D mesh — non-fatal if this fails)
    let roofMesh: RoofMesh | null = null;
    if (dsmBuffer) {
      const dsmResult = await parseDsmGeoTiff(dsmBuffer);
      if (dsmResult && maskResult) {
        const maskData = maskResult.data as Uint8Array;
        const dsmW = dsmResult.meta.width;
        const dsmH = dsmResult.meta.height;

        // DSM and mask must have the same dimensions (both come from the same
        // dataLayers:get call at the same radius, so they should match).
        if (dsmW === maskResult.meta.width && dsmH === maskResult.meta.height) {
          roofMesh = buildAndSerializeMesh(dsmResult.data, maskData, dsmW, dsmH);
        } else {
          logger.warn(
            `[DataLayers] DSM/mask dimension mismatch: DSM=${dsmW}x${dsmH}, mask=${maskResult.meta.width}x${maskResult.meta.height}`,
          );
        }
      }
    }
```

Update the return statement (lines 96-105) to include mesh:

```typescript
    return {
      rgb: rgbPng.base64,
      mask: maskPng.base64,
      width: cropBounds.widthPx,
      height: cropBounds.heightPx,
      bounds: {
        sw: { latitude: cropBounds.swLat, longitude: cropBounds.swLng },
        ne: { latitude: cropBounds.neLat, longitude: cropBounds.neLng },
      },
      mesh: roofMesh,
    };
```

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (RoofLayers now has mesh field, return includes it)

- [ ] **Step 6: Run existing tests**

Run: `npx vitest run src/lib/roof/__tests__/data-layers.test.ts`
Expected: All existing tests still PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/roof/data-layers.ts
git commit -m "feat(roof): extend data pipeline to download DSM and generate 3D mesh"
```

---

### Task 4: API Route — Mesh Cache-Miss Detection

**Files:**
- Modify: `src/app/api/portal/roof-data/route.ts:116-136`

**Context:** The current cache check (line 119) is `if (!layers)`. If a property has cached RGB + mask but `mesh` is null (DSM failed previously), we need to re-run only the mesh pipeline.

- [ ] **Step 1: Add mesh-specific cache-miss logic**

Replace the layers cache section (lines 116-136) with:

```typescript
    // ── Fetch/cache roof visualization layers ─────────────────────────────
    let layers: RoofLayers | null = (measurement.roofLayers as RoofLayers) ?? null;

    if (!layers) {
      // Full cache miss — fetch everything
      const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
      if (apiKey) {
        layers = await fetchRoofLayers(center.latitude, center.longitude, apiKey);
        if (layers) {
          try {
            await db
              .update(schema.measurements)
              .set({ roofLayers: layers })
              .where(eq(schema.measurements.id, measurement.id));
          } catch (cacheErr) {
            logger.error('[RoofData] Failed to cache layers', cacheErr);
          }
        }
      }
    } else if (layers.mesh === undefined || layers.mesh === null) {
      // Partial cache — has images but no mesh. Re-run mesh pipeline only.
      const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
      if (apiKey) {
        const freshLayers = await fetchRoofLayers(center.latitude, center.longitude, apiKey);
        if (freshLayers?.mesh) {
          layers = { ...layers, mesh: freshLayers.mesh };
          try {
            await db
              .update(schema.measurements)
              .set({ roofLayers: layers })
              .where(eq(schema.measurements.id, measurement.id));
          } catch (cacheErr) {
            logger.error('[RoofData] Failed to cache mesh update', cacheErr);
          }
        }
      }
    }
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/api/portal/roof-data/route.ts
git commit -m "feat(roof): add mesh-specific cache-miss detection in API route"
```

---

## Chunk 3: Client-Side 3D Viewer

### Task 5: RoofMeshViewer Component

**Files:**
- Create: `src/components/features/roof/RoofMeshViewer.tsx`

**Context:** This component receives serialized mesh data (base64 typed arrays) and a shingle hex color, then renders the mesh in an R3F Canvas with orbit controls. Must be dynamically imported with `ssr: false`.

**Dependencies already installed:** `three` ^0.170.0, `@react-three/fiber` ^8.18.0, `@react-three/drei` ^9.122.0

- [ ] **Step 1: Create RoofMeshViewer**

Create `src/components/features/roof/RoofMeshViewer.tsx`:

```typescript
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RoofMesh } from '@/lib/roof/types';

interface RoofMeshViewerProps {
  mesh: RoofMesh;
  shingleHex: string;
}

/** Decode a base64 string into a typed array */
function decodeBase64Float32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

function decodeBase64Uint32(base64: string): Uint32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Uint32Array(bytes.buffer);
}

function RoofScene({ mesh, shingleHex }: RoofMeshViewerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const positions = decodeBase64Float32(mesh.positions);
    const normals = decodeBase64Float32(mesh.normals);
    const indices = decodeBase64Uint32(mesh.indices);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setIndex(new THREE.BufferAttribute(indices, 1));

    return geom;
  }, [mesh.positions, mesh.normals, mesh.indices]);

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(shingleHex),
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false,
    });
  }, []); // material created once

  // Update color reactively without recreating material
  useEffect(() => {
    material.color.set(shingleHex);
  }, [shingleHex, material]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 8]} intensity={0.8} />

      {/* Roof mesh */}
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#e5e5e5" roughness={1} />
      </mesh>

      {/* Controls */}
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

export function RoofMeshViewer({ mesh, shingleHex }: RoofMeshViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Canvas
        camera={{
          position: [12, 10, 12],
          fov: 50,
          near: 0.1,
          far: 200,
        }}
        style={{ background: 'var(--background, #f0f0f0)' }}
      >
        <RoofScene mesh={mesh} shingleHex={shingleHex} />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/roof/RoofMeshViewer.tsx
git commit -m "feat(roof): add RoofMeshViewer — R3F 3D viewer with orbit controls"
```

---

### Task 6: Update Page — Swap Viewer + Delete Old Components

**Files:**
- Modify: `src/app/portal/roof/page.tsx`
- Delete: `src/components/features/roof/RoofCanvasViewer.tsx`
- Delete: `src/components/features/roof/RoofViewer.tsx`
- Delete: `src/components/features/roof/RoofModel.tsx`
- Delete: `src/components/features/roof/RoofFacet.tsx`
- Delete: `src/components/features/roof/CameraPresets.tsx`

- [ ] **Step 1: Update page.tsx imports and viewer**

Replace the `RoofCanvasViewer` import (line 7) with a dynamic import of `RoofMeshViewer`:

```typescript
// Replace line 7:
// import { RoofCanvasViewer } from '@/components/features/roof/RoofCanvasViewer';
// With:
import dynamic from 'next/dynamic';

const RoofMeshViewer = dynamic(
  () => import('@/components/features/roof/RoofMeshViewer').then(m => ({ default: m.RoofMeshViewer })),
  { ssr: false, loading: () => <RoofPageSkeleton /> },
);
```

Replace the viewport section (lines 44-71) — the three-state conditional:

```typescript
        <div className={styles.viewport}>
          {hasData && roofData?.layers?.mesh ? (
            <RoofMeshViewer
              mesh={roofData.layers.mesh}
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
```

- [ ] **Step 2: Delete old components**

Delete these files:
- `src/components/features/roof/RoofCanvasViewer.tsx`
- `src/components/features/roof/RoofViewer.tsx`
- `src/components/features/roof/RoofModel.tsx`
- `src/components/features/roof/RoofFacet.tsx`
- `src/components/features/roof/CameraPresets.tsx`

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (if any lingering imports to deleted files, fix them)

- [ ] **Step 4: Commit**

```bash
git add src/app/portal/roof/page.tsx
git rm src/components/features/roof/RoofCanvasViewer.tsx \
       src/components/features/roof/RoofViewer.tsx \
       src/components/features/roof/RoofModel.tsx \
       src/components/features/roof/RoofFacet.tsx \
       src/components/features/roof/CameraPresets.tsx
git commit -m "feat(roof): swap to 3D mesh viewer, delete old overlay components"
```

---

### Task 7: Delete Old Geometry Engine

**Files:**
- Delete: `src/lib/roof/geometry.ts`
- Delete: `src/lib/roof/clip.ts`
- Delete: `src/lib/roof/__tests__/geometry.test.ts`
- Delete: `src/lib/roof/__tests__/clip.test.ts`

- [ ] **Step 1: Check for imports to these files**

Search the codebase for imports of `geometry` or `clip` from `@/lib/roof/` or `../geometry` or `../clip`. If any active code imports them, do NOT delete — update or remove the import first.

- [ ] **Step 2: Delete files**

```bash
git rm src/lib/roof/geometry.ts \
       src/lib/roof/clip.ts \
       src/lib/roof/__tests__/geometry.test.ts \
       src/lib/roof/__tests__/clip.test.ts
```

- [ ] **Step 3: Run full test suite**

Run: `npm run test`
Expected: All remaining tests PASS

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(roof): remove old bounding-box geometry engine"
```

(The `git rm` commands already staged the deletions — no additional `git add` needed.)

---

## Chunk 4: Verification

### Task 8: Full Verification

- [ ] **Step 1: Run all tests**

Run: `npm run test`
Expected: All tests PASS (dsm-mesh tests + data-layers tests)

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: Clean — no errors

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds. Watch for:
- Dynamic import of RoofMeshViewer with `ssr: false` works
- No import errors from deleted files
- Three.js tree-shaking doesn't cause issues

- [ ] **Step 4: Manual verification (dev server)**

Run: `npm run dev`
Navigate to `/portal/roof` (use dev bypass).
Expected:
- If test property has cached `roofLayers` without `mesh`: API re-fetches DSM and generates mesh on first load
- 3D roof mesh appears in viewport
- Orbit controls work: drag to rotate, scroll to zoom, right-drag to pan
- Shingle color updates when clicking swatches in ShingleSelector
- Ground plane visible below roof
- RoofStats still shows correct data in sidebar
