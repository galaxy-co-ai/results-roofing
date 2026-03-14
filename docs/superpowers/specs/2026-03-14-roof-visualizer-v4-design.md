# Roof Visualizer v4 — Parametric Facets from Segment Data

> Replaces the DSM mesh (v3) with clean geometric facets built from Google Solar `roofSegmentStats`. Each segment becomes a properly clipped, tilted plane with crisp ridge/hip/valley lines.

## Problem

The DSM mesh approach (v3) produces a noisy terrain surface from satellite elevation data — it captures AC units, chimneys, tree shadows, and sensor noise. The result looks like a lumpy wedge, not an architectural roof. Homeowners need to see clean, recognizable roof geometry with distinct slopes and crisp edges.

## Solution

Use the `roofSegmentStats` data already in the API response. Each of the 17 segments (for the test property) has pitch, azimuth, center, bounding box, and height — everything needed to construct a parametric 3D model. This is the same approach used by GAF's visualizer and Owens Corning Design EyeQ.

**Key insight:** The geometry is computed **client-side** from segment data (~2KB). No server-side mesh generation, no caching, no GeoTIFF processing needed.

**Phase 1 (this spec):** Parametric facets with half-plane clipping + ridge/hip cap geometry + orbit controls.
**Phase 2 (future):** Shingle textures (bump/normal maps for dimensional appearance).
**Phase 3 (future):** Extruded walls below the eave line.

## Architecture

### Geometry Engine — `src/lib/roof/facet-geometry.ts`

Client-side pure function. Input: segments + buildingCenter. Output: BufferGeometry data.

**Pipeline:**

1. **Project to local meters** — Convert segment centers and bounding boxes from lat/lng to local XY meters relative to building center. Equirectangular projection (accurate at neighborhood scale).

2. **Generate initial polygons** — Each segment's axis-aligned bounding box becomes a rectangle in local 2D coordinates.

3. **Half-plane clipping to resolve overlaps** — For each pair of overlapping segments:
   - Both segments define a 3D plane via pitch, azimuth, and height at center
   - Compute the intersection line of those two planes — this is the ridge/hip/valley line
   - Project the intersection line to 2D footprint
   - Clip each segment's polygon with Sutherland-Hodgman to keep only its side
   - Result: non-overlapping facet polygons with architecturally correct edges

4. **Tilt into 3D** — Each 2D polygon gets vertices lifted by applying pitch angle along azimuth direction. `planeHeightAtCenterMeters` sets base elevation. Clean cutoff at footprint edge (no overhang).

5. **Detect edge types** — Classify shared edges between adjacent facets:
   - **Ridge:** both facets slope away (convex crease) — gets cap
   - **Hip:** facets slope in different directions, edge runs diagonally — gets cap
   - **Valley:** both facets slope toward edge (concave crease) — no cap

6. **Generate ridge/hip cap geometry** — Thin triangular prism along ridge/hip edges. Dimensions in scene units after scaling (~0.15 scene units wide, ~0.08 scene units tall). Same shingle color as facets. ~6 vertices and 4 triangles per cap edge. Expect ~8-12 cap edges for 17 segments.

7. **Triangulate** — Clipped facets are convex (Sutherland-Hodgman preserves convexity when clipping convex polygons against half-planes). Use fan triangulation from vertex 0 — no general-purpose triangulation library needed.

**Coordinate convention:** X = east, Y = up (elevation), Z = south. Matches existing RoofMeshViewer camera orientation.

**Normalization (between Step 4 and Step 5):** Center mesh at origin in XZ, scale to ~15 units span (matching viewer camera at `[12, 10, 12]`). Unlike the DSM approach, parametric pitch angles already produce geometrically correct slopes — no Y exaggeration needed since we're computing actual plane geometry, not sampling a noisy height map.

**Output:**
```typescript
interface RoofGeometry {
  positions: Float32Array;  // [x,y,z, ...] — centered at origin, ~15 units span
  normals: Float32Array;    // [nx,ny,nz, ...] — per-vertex
  indices: Uint32Array;     // [i0,i1,i2, ...] — triangles
  vertexCount: number;
  triangleCount: number;
  facetCount: number;
}
```

**Note:** The current `RoofMeshViewer` accepts `RoofMesh` (base64-encoded strings) because the DSM mesh was generated server-side. Since geometry is now computed client-side, the viewer must be modified to accept raw typed arrays directly — base64 encoding/decoding is pointless overhead when everything is in-browser. Remove `decodeBase64Float32`/`decodeBase64Uint32` and accept `RoofGeometry` props.

### The Clipping Algorithm — Detail

This is where v1 failed, so precision matters.

For each segment S, start with its bounding box as polygon P. For every other segment T whose bounding box overlaps S:

1. S defines plane: passes through S.center at height S.planeHeight, tilted at S.pitch along S.azimuth
2. T defines plane: same for T
3. The two planes intersect along a 3D line L — this is the ridge/hip/valley
4. Project L to the 2D footprint → a clipping line
5. Keep the half-plane containing S's center point. This is unambiguous for all edge types (ridge, hip, valley): compute `dot(clipLineNormal, S.center - pointOnLine) > 0` to determine the side.
6. Clip P against that half-plane using Sutherland-Hodgman

After iterating all overlapping neighbors, P is S's final footprint polygon.

**Why v1 failed and this won't:**
- v1 clipped based on bounding box midpoints, not 3D plane intersections
- v1 used axis-aligned clipping lines; hip lines are diagonal
- This approach computes actual plane-plane intersection, producing correct hip/valley/ridge geometry

### Client-Side Rendering

**Reuse `RoofMeshViewer.tsx`** — Already handles BufferGeometry, orbit controls, shingle color. No changes needed.

**Data flow:**
```
useRoofData(quoteId) → { segments, buildingCenter }
  → buildRoofGeometry(segments, buildingCenter)  // client-side, ~5ms
  → RoofMeshViewer receives positions/normals/indices
```

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Segment has no boundingBox | Skip segment |
| Segment has no center | Use bounding box center |
| No planeHeightAtCenterMeters | Estimate: `baseHeight + tan(pitch) * halfWidth` along azimuth |
| Clipping produces degenerate polygon (<3 vertices) | Drop the segment |
| Non-overlapping segments | No clipping needed, keep original rectangle |
| Very flat pitch (<2°) | Snap to 0°, render flat |

### Error Handling

| Scenario | Behavior |
|----------|----------|
| No segments in response | Page shows "No Roof Data Yet" (existing) |
| All segments lack bounding boxes | Page shows "Roof Preview Unavailable" (existing) |
| Geometry engine produces empty mesh | Same fallback |
| WebGL not supported | Fallback message |

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/roof/facet-geometry.ts` | Segment → clipped facet polygon → 3D mesh |
| Create | `src/lib/roof/__tests__/facet-geometry.test.ts` | Unit tests: simple gable (2 segments, one ridge), hip roof (4 segments, diagonal hips), single flat segment (no clipping), missing boundingBox (skip) |
| Modify | `src/components/features/roof/RoofMeshViewer.tsx` | Accept raw typed arrays instead of base64 strings |
| Modify | `src/app/portal/roof/page.tsx` | Pass segments to geometry engine, feed result to viewer |
| Modify | `src/lib/roof/types.ts` | Remove `RoofMesh` from `RoofLayers`, add `RoofGeometry` interface |
| Modify | `src/db/schema/measurements.ts` | Remove `mesh` from `roofLayers` `$type<>()` |
| Modify | `src/app/api/portal/roof-data/route.ts` | Remove mesh cache-miss logic. Existing cached `roofLayers` rows with `mesh: null` stay as-is — client no longer reads the mesh field. |
| Modify | `src/lib/roof/data-layers.ts` | Remove DSM download/parse/mesh generation |
| Delete | `src/lib/roof/dsm-mesh.ts` | DSM mesh generator (replaced) |
| Delete | `src/lib/roof/__tests__/dsm-mesh.test.ts` | DSM mesh tests |

## What Stays Untouched

- `RoofMeshViewer.tsx` — modified to accept typed arrays directly (minor change)
- `ShingleSelector` — same interface
- `RoofStats` — same props
- `RoofPageSkeleton` — same loading state
- `shingle-catalog.ts` — same colors
- `data-layers.ts` — keeps RGB/mask fetch (potential future use), just drops DSM
- `roofLayers` column — keeps RGB/mask, drops mesh field

## Dependencies

No new dependencies. Geometry is pure TypeScript math (projection, clipping, triangulation). Three.js already installed for rendering.

## Future Enhancements (Not in Scope)

1. **Shingle textures** — Bump/normal maps for dimensional appearance. Phase 2.
2. **Extruded walls** — Below the eave line to ground. Phase 3.
3. **Ridge cap color** — Different shade for ridge caps vs field shingles.
4. **Eave overhang** — Extend facets past footprint edge (~0.3m).
