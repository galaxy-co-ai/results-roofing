# Roof Visualizer v3 — 3D DSM Mesh

> Replaces the satellite overlay (v2) with a 3D mesh generated from the DSM GeoTIFF. Homeowners rotate, zoom, and pan a real 3D model of their roof while previewing shingle colors.

## Problem

The satellite overlay (v2) tints an aerial photo — grass, driveway, and trees are all visible. It looks like a tinted Google Maps screenshot, not a product visualization tool. The homeowner needs to see their roof as a 3D object with shingle color applied to the actual roof surfaces.

## Solution

Use the DSM (Digital Surface Model) GeoTIFF from Google Solar's `dataLayers:get` to generate a triangle mesh of the roof. The DSM gives per-pixel elevation at 0.1m resolution. Combined with the roof mask (binary building footprint), we isolate just the roof surface, build a mesh server-side, cache it, and render in React Three Fiber with orbit controls.

**Phase 1 (this spec):** Roof-only 3D mesh with solid shingle colors, orbit controls.
**Phase 2 (future):** Shingle textures (bump/normal maps for dimensional appearance) — critical follow-up once mesh pipeline is proven.
**Phase 3 (future):** Extruded walls below the roof line.

## Architecture

### Data Pipeline (Server-Side)

Extends the existing `data-layers.ts` GeoTIFF infrastructure.

1. **Download DSM GeoTIFF** in parallel with RGB + mask (same `dataLayers:get` call already returns `dsmUrl`)
2. **Parse DSM raster** — single band, Float32 values = elevation in meters above sea level
3. **Apply roof mask** — zero out all non-roof pixels
4. **Decimate** — sample every 2nd pixel (0.2m resolution). If serialized mesh exceeds the size budget, double the step size and rebuild (max 2 retries: step=2 → step=4 → step=8).
5. **Build triangle mesh** — grid of triangles from elevation data. Each sampled pixel → vertex at `(col * stepSize, row * stepSize, elevation)`. Connect adjacent roof pixels into triangles. Skip triangles where any vertex is non-roof.
6. **Compute normals** — per-vertex normals via cross-product of adjacent triangle edges, averaged for shared vertices
7. **Normalize coordinates** — center mesh at origin, scale so roof spans ~10-20 units in Three.js space
8. **Serialize** — positions, normals, indices → base64-encoded typed arrays
9. **Cache** — store in existing `roofLayers` jsonb column

**New module:** `src/lib/roof/dsm-mesh.ts`
- Input: DSM raster (Float32Array), mask raster (Uint8Array), image dimensions, step size
- Output: `{ positions: Float32Array, normals: Float32Array, indices: Uint32Array }`
- Isolated from `data-layers.ts` — single responsibility

### Mesh Data Schema

Added to `RoofLayers` type:

```typescript
mesh: {
  positions: string;    // base64 Float32Array [x,y,z, x,y,z, ...]
  normals: string;      // base64 Float32Array [nx,ny,nz, ...]
  indices: string;      // base64 Uint32Array [i0,i1,i2, ...]
  vertexCount: number;
  triangleCount: number;
} | null;
```

Expected sizes for the test property (17 segments, 4859 sqft):
- Decimated to 0.2m: ~10-15K vertices, ~20-30K triangles
- Serialized: ~400-600KB base64

**Size budget:** The existing `MAX_PAYLOAD_BYTES` (1MB) in `data-layers.ts` currently guards the combined RGB + mask payload. With mesh data added to the same `roofLayers` jsonb blob, this needs to change:
- Split the size check: images (RGB + mask) have their own 1MB budget, mesh has a separate 1MB budget
- Total `roofLayers` jsonb can be up to ~2MB (well within Postgres jsonb limits)
- If mesh exceeds its 1MB budget, increase decimation step (see adaptive sizing above)

### Client-Side Rendering

**New component:** `RoofMeshViewer` (replaces `RoofCanvasViewer`)

- Dynamic import with `ssr: false` (Three.js requires browser APIs)
- Decodes base64 → typed arrays → `BufferGeometry` with position + normal attributes
- `MeshStandardMaterial` with shingle hex color (solid color, responds to lighting)
- Color swap = update `material.color`, no re-fetch or re-mesh

**Scene:**
- `OrbitControls` (drei) — rotate, zoom, pan
- Ambient light (intensity 0.4) + directional light (intensity 0.8) from upper-right
- Light gray ground plane below roof for spatial grounding
- Camera: 45° elevated angle, centered on roof
- Background: use semantic token from `globals.css` (light neutral — add `--rr-color-canvas-bg` if needed)

**Page integration:**
- `roof/page.tsx` renders `RoofMeshViewer` when `layers.mesh` is available
- Falls back to "Roof preview unavailable" when mesh is null
- `ShingleSelector` unchanged — passes hex color to viewer
- `RoofStats` unchanged

### `data-layers.ts` Changes

- Download DSM GeoTIFF in parallel with RGB + mask
- **DSM parsing:** Add a `'dsm'` branch to `parseGeoTiff` (or a dedicated `parseDsmGeoTiff` function) that returns `Float32Array` instead of `Uint8Array`. DSM elevation values are floating-point meters — must not be cast to Uint8.
- Call `dsm-mesh.ts` to generate mesh from parsed DSM (Float32Array) + mask (Uint8Array)
- Add mesh to `RoofLayers` response
- Split `MAX_PAYLOAD_BYTES` check: separate budgets for image layers vs. mesh
- Existing RGB/mask processing stays (no breaking changes to cache schema)

**Base64 encoding contract:**
- Server encode: `Buffer.from(float32Array.buffer).toString('base64')`
- Client decode: `new Float32Array(Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer)`
- Same pattern for Uint32Array indices

### API Route Changes

None. The `/api/portal/roof-data` route already:
- Fetches layers via `fetchRoofLayers()`
- Caches in `roofLayers` jsonb column
- Returns layers in response

**Cache-miss detection for mesh:** The existing check `if (!layers)` only triggers when the entire `roofLayers` is null. For entries that have RGB + mask cached but `mesh: null` (e.g., DSM download previously failed), the API route needs an additional check: if `layers` exists but `layers.mesh` is null, re-run only the DSM/mesh pipeline (not RGB/mask) and update the cache. This avoids re-fetching images that are already cached.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| DSM download fails | `mesh: null` in response, page shows "Preview unavailable" |
| Mask has zero roof pixels | `mesh: null` |
| DSM has NaN/nodata within roof area | Skip triangles where any vertex has NaN elevation (holes in real DSM are rare — typically at GeoTIFF edges, not mid-roof) |
| Serialized mesh exceeds 1MB budget | Double decimation step and rebuild (max 2 retries: step=2 → 4 → 8) |
| Property has detached structures | Mesh them all — mask includes all buildings |
| WebGL not supported | Fallback message (rare — 97%+ browser support) |

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/roof/dsm-mesh.ts` | DSM + mask → triangle mesh generation |
| Create | `src/lib/roof/__tests__/dsm-mesh.test.ts` | Mesh generation unit tests |
| Create | `src/components/features/roof/RoofMeshViewer.tsx` | R3F 3D viewer with orbit controls |
| Modify | `src/lib/roof/data-layers.ts` | Add DSM download + mesh generation |
| Modify | `src/lib/roof/types.ts` | Add mesh fields to `RoofLayers` |
| Modify | `src/db/schema/measurements.ts` | Add mesh field to `roofLayers` `$type<>()` annotation |
| Modify | `src/app/api/portal/roof-data/route.ts` | Add mesh-specific cache-miss detection |
| Modify | `src/app/portal/roof/page.tsx` | Swap to `RoofMeshViewer` |
| Delete | `src/components/features/roof/RoofCanvasViewer.tsx` | Satellite overlay (replaced) |
| Delete | `src/components/features/roof/RoofViewer.tsx` | Old R3F wrapper (replaced) |
| Delete | `src/components/features/roof/RoofModel.tsx` | Old bounding-box renderer |
| Delete | `src/components/features/roof/RoofFacet.tsx` | Old facet component |
| Delete | `src/components/features/roof/CameraPresets.tsx` | Old camera presets |
| Delete | `src/lib/roof/geometry.ts` | Bounding-box geometry engine |
| Delete | `src/lib/roof/clip.ts` | Polygon clipping (for bounding boxes) |
| Delete | `src/lib/roof/__tests__/geometry.test.ts` | Old geometry tests |
| Delete | `src/lib/roof/__tests__/clip.test.ts` | Old clipping tests |

## What Stays Untouched

- `ShingleSelector` — same interface, feeds hex to new viewer
- `RoofStats` — same props
- `RoofPageSkeleton` — same loading state
- `shingle-catalog.ts` — same 18 colors across 3 tiers
- `schema.ts` — Zod validation for API response
- `useRoofData` hook — type propagates through `RoofDataResponse`
- `data-layers.test.ts` — existing crop/UTM tests still valid

## Dependencies

No new dependencies. Everything needed is already installed:
- `three` ^0.170.0
- `@react-three/fiber` ^8.18.0
- `@react-three/drei` ^9.122.0
- `geotiff` ^3.0.5
- `sharp` (already in dependencies)

## Cost

No additional API cost — DSM comes from the same `dataLayers:get` call that already fetches RGB + mask. One call per property, cached permanently.

## Future Enhancements (Not in Scope)

1. **Shingle textures** — Bump/normal maps for dimensional shingle appearance. Critical follow-up once mesh pipeline is proven.
2. **Extruded walls** — Detect roof edge elevation, extrude walls down to ground plane.
3. **High-detail toggle** — Full-resolution mesh (0.1m) for users who want maximum fidelity.
4. **Mesh simplification** — Run quadric edge collapse to further reduce triangle count while preserving shape.
