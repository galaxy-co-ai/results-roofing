# GAF-Powered Roof Visualizer — Design Spec

> Replaces the Google Solar segment-based geometry engine with a DXF-based pipeline fed by GAF QuickMeasure reports. Each order returns a CAD file with actual polygon vertices — no more guessing from bounding boxes.

## Problem

The Google Solar `roofSegmentStats` data only provides axis-aligned bounding boxes, pitch, and azimuth per segment — no actual shape information. Multiple attempts to build a 3D model from this data (half-plane clipping, Z-buffer overlap, building footprint clamping) produced unrecognizable results because the data was designed for solar panel math, not architectural visualization.

## Solution

Use GAF QuickMeasure reports instead. Every quote already triggers a GAF order automatically. The callback includes a DXF (CAD) file with actual roof polygon geometry — real vertices, edges, and facets. Parse the DXF, extract 3D polygons, and render them in the existing Three.js viewer with shingle color control.

**Key insight:** GAF has `enable3D: "Y"` and `enableAutoCAD: "Y"` on our subscriber — the DXF file is included in every report.

## Architecture

### End-to-End Data Flow

```
User submits address
  → Quote created
  → GAF QuickMeasure order placed (automatic, background)
  → ~1hr processing
  → GAF callback hits /api/webhooks/gaf
  → Webhook downloads DXF + PDFs + images → Vercel Blob
  → DXF URL stored in measurements.gafAssets
  → User visits /portal/roof
  → Client fetches roof-data API
  → API returns gafAssets.DxfUrl (or DxfUrl from Buildings)
  → Client fetches DXF file, parses it
  → DXF parser extracts 3DFACE/POLYLINE entities → polygon vertices
  → Geometry converter builds Float32Array buffers
  → RoofMeshViewer renders with shingle color
```

### DXF Parser — `src/lib/roof/dxf-parser.ts`

Client-side. Input: DXF file text. Output: array of roof facet polygons.

**Pipeline:**
1. Parse DXF text using `dxf-parser` npm package → JSON with entities
2. Extract 3DFACE entities (triangulated facets) or POLYLINE/LWPOLYLINE entities (polygon outlines)
3. Group coplanar 3DFACE entities into facets (same normal direction = same roof plane)
4. Return array of facet polygons with 3D vertices

**Output:**
```typescript
interface DxfFacet {
  vertices: [number, number, number][]; // [x, y, z] per vertex
  normal: [number, number, number];     // unit normal of the plane
}
```

### DXF to Geometry — `src/lib/roof/dxf-to-geometry.ts`

Client-side pure function. Input: `DxfFacet[]`. Output: `RoofGeometry`.

**Pipeline:**
1. Collect all vertices from all facets
2. Center at origin, scale to ~15 units (match existing viewer camera)
3. Compute per-vertex normals from face normals
4. Build index buffer with fan triangulation (for polygon facets) or direct indices (for 3DFACE triangles)
5. Return `RoofGeometry` (positions, normals, indices as typed arrays)

### Loading States

| GAF Status | What User Sees |
|------------|---------------|
| Order pending (< 1hr) | "Your roof model is being prepared. This typically takes about an hour." + RoofStats if available |
| Order complete, DXF available | Full 3D viewer with shingle selector |
| Order failed | "Roof Preview Unavailable" + RoofStats |
| No GAF order (legacy quotes) | "Roof Preview Unavailable" + RoofStats |

### API Changes — `src/app/api/portal/roof-data/route.ts`

Add to the response:
```typescript
interface RoofDataResponse {
  // ... existing fields ...
  gafStatus: 'pending' | 'complete' | 'failed' | 'none';
  gafDxfUrl: string | null;       // Vercel Blob URL of the DXF file
  gafReport3dUrl: string | null;  // GAF's hosted 3D viewer URL (backup)
  gafAssets: Record<string, string> | null; // All asset URLs
}
```

### Page Changes — `src/app/portal/roof/page.tsx`

```
if gafStatus === 'complete' && gafDxfUrl:
  → Fetch DXF, parse, build geometry, render RoofMeshViewer
if gafStatus === 'pending':
  → Show loading state with estimated time
else:
  → Show "Roof Preview Unavailable" + stats
```

No dynamic import needed for the DXF parser (it's lightweight). Keep dynamic import for RoofMeshViewer (Three.js is heavy).

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/roof/dxf-parser.ts` | Parse DXF text → facet polygons |
| Create | `src/lib/roof/dxf-to-geometry.ts` | Convert facet polygons → RoofGeometry buffers |
| Create | `src/lib/roof/__tests__/dxf-parser.test.ts` | Unit tests with synthetic DXF data |
| Create | `src/lib/roof/__tests__/dxf-to-geometry.test.ts` | Unit tests for geometry conversion |
| Modify | `src/app/api/portal/roof-data/route.ts` | Add gafStatus, gafDxfUrl, gafAssets to response |
| Modify | `src/app/portal/roof/page.tsx` | DXF fetch + parse, loading states |
| Modify | `src/lib/roof/types.ts` | Add DxfFacet, update RoofDataResponse |
| Modify | `src/hooks/useRoofData.ts` | May need polling for pending status |
| Delete | `src/lib/roof/facet-geometry.ts` | Google Solar geometry engine (replaced) |
| Delete | `src/lib/roof/clip.ts` | Clipping utility (no longer needed) |
| Delete | `src/lib/roof/__tests__/facet-geometry.test.ts` | Old geometry tests |
| Delete | `src/lib/roof/__tests__/clip.test.ts` | Old clipping tests |

## What Stays Untouched

- `RoofMeshViewer.tsx` — already accepts `RoofGeometry`, no changes needed
- `ShingleSelector` — same interface
- `RoofStats` — same props
- `RoofPageSkeleton` — same loading state
- `shingle-catalog.ts` — same colors
- `data-layers.ts` — keeps RGB/mask fetch (satellite overlay option for future)
- Webhook handler — already updated to capture DXF + all assets

## Dependencies

- **New:** `dxf-parser` npm package (~50KB, MIT license) — parses DXF text to structured JSON
- **Existing:** Three.js, React Three Fiber, @react-three/drei (already installed)

## Prerequisite: GAF Callback URL

The GAF subscriber "ZPR" currently has its callback pointing to Zuper's staging server. This must be updated to `https://app.resultsroofing.com/api/webhooks/gaf` before the end-to-end pipeline works in production. Dalton is contacting Tareq/GAF to get this changed.

In the meantime, we can:
- Download assets manually via the GAF API (OrderSearch + Download endpoints)
- Test the DXF parser with synthetic/sample DXF files
- Build and validate the full pipeline locally

## Edge Cases

| Scenario | Handling |
|----------|----------|
| DXF has no 3DFACE or POLYLINE entities | Fall back to "Unavailable" state |
| DXF has only 2D entities (no Z coordinates) | Treat as flat roof at Y=0 |
| GAF order takes > 2 hours | Show "still processing" with option to refresh |
| Multiple buildings in DXF | Use the largest building (by vertex count or area) |
| User changes shingle color | Material color update only — no geometry recomputation |

## Future Enhancements (Not in Scope)

1. **Shingle textures** — Bump/normal maps for dimensional appearance (Phase 2)
2. **Street-level photo overlay** — AI segmentation of uploaded photos (Phase 3)
3. **GAF Report3D embed** — Fallback iframe of GAF's hosted 3D viewer
4. **Polling for pending orders** — Auto-refresh when GAF data arrives
