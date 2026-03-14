# Roof Visualizer v2 — Masked Satellite Overlay

> Replaces the failed CSS color overlay (v1) with Google Solar Data Layers API for pixel-perfect roof masking.

## Problem

The current `/portal/roof` page uses a Mapbox satellite image with `mix-blend-mode: color` to tint the roof. This tints the entire image — grass, driveway, trees — and looks cheap. The 3D bounding-box approach also failed because axis-aligned bounding boxes overlap heavily on hip/valley roofs.

## Solution

Use Google Solar's `dataLayers:get` endpoint to get:
- **RGB layer** — high-res satellite/aerial photo (0.1m/pixel)
- **Mask layer** — binary building footprint mask (1 bit per pixel, pixel-aligned with RGB). On top-down aerial views, the building footprint is effectively the roof outline. May include porches/carports on some buildings — acceptable for color preview.

Server processes and caches these as cropped PNGs. Client renders to `<canvas>` with `multiply` blend — shingle color applied only to masked roof pixels. Industry-standard approach (GAF Virtual Remodeler, Owens Corning Design EyeQ).

## Architecture

### Data Pipeline (Server-Side)

1. Client requests roof data via existing `/api/portal/roof-data`
2. Server checks `measurement.roofLayers` (new jsonb column) for cached data
3. If cache miss:
   a. Call `dataLayers:get` with buildingCenter lat/lng, `radiusMeters: 75`, `view: FULL_LAYERS`
   b. Download RGB + Mask GeoTIFFs from returned URLs (expire in 1 hour)
   c. Parse with `geotiff` (npm, server-side) — extract raster bands. Use the GeoTIFF's affine transform to convert lat/lng coordinates to pixel coordinates for cropping.
   d. Crop to building footprint + ~20m padding using `sharp`. Geo-to-pixel conversion: the GeoTIFF includes origin + resolution metadata that maps (lat, lng) → (px, py).
   e. Encode as base64 PNGs. If combined payload exceeds 1MB, reduce crop area or lower quality — do not write oversized blobs to jsonb.
   f. Cache in `measurements.roofLayers` jsonb column
4. Return layers + existing stats/segments in response

**Cache schema:**
```typescript
{
  rgb: string;    // base64 PNG — cropped satellite image
  mask: string;   // base64 PNG — binary roof mask
  width: number;
  height: number;
  bounds: { sw: { latitude: number; longitude: number }; ne: { latitude: number; longitude: number } };
}
```

### Client-Side Rendering

**New component: `RoofCanvasViewer`** (replaces `RoofImageViewer`)

Rendering pipeline:
1. Decode base64 PNGs into `Image` elements
2. Draw RGB satellite image as base layer on canvas
3. Create offscreen canvas filled with selected shingle hex color
4. Apply mask as alpha channel (clip) so color only hits roof pixels
5. Composite color layer onto RGB using `globalCompositeOperation = 'multiply'`
6. Color layer `globalAlpha = 0.65` (applied before the multiply composite) — preserves shadow detail from the satellite image. Starting value, tune during implementation.

Interactions:
- Zoom/pan via CSS transforms (pinch on mobile, scroll on desktop)
- Top-down aerial view — no 3D rotation
- Shingle color swap = single canvas redraw (~1-2ms, no re-fetch)

### API Changes

Extend `/api/portal/roof-data/route.ts`:
- Add layers fetch/cache logic after existing measurement lookup
- Lazy fetch — only triggers on first visit to roof page, not during quote creation
- Include `layers` field in response alongside existing `segments`, `buildingCenter`, `stats`

### Database Change

Add `roofLayers` jsonb column to `measurements` table in `src/db/schema/measurements.ts`.

Typical payload: 200-500KB base64 (cropped building footprint). If too large (>1MB), migrate to S3/R2 later.

### Database Migration

After adding the column to the schema, run `npm run db:push -- --force` (non-interactive terminal requires `--force` flag per project conventions).

### Dependencies

- `geotiff` — npm package, server-side only. Parse GeoTIFF raster data.
- `sharp` — move from devDependencies to dependencies (used in API route at runtime, not just dev scripts).

No new env vars — `GOOGLE_SOLAR_API_KEY` already configured.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `dataLayers:get` fails (no coverage, quota) | Fall back to clean aerial photo without color overlay. Banner: "Roof preview unavailable for this location" |
| Mask is empty (0 roof pixels) | Same fallback — aerial-only view |
| Partial mask (chimney gaps, skylights) | Accept as-is — multiply blend is forgiving on top-down views |
| GeoTIFF URL expired before download | Retry `dataLayers:get` once, then fail gracefully |
| GeoTIFF download fails (network timeout, corrupt file) | Log error, return response without layers, client shows aerial-only fallback |
| Processed payload exceeds 1MB | Reduce crop or quality. Do not write oversized blobs to jsonb. |

## What Gets Removed

- `RoofImageViewer` component (Mapbox + CSS color overlay)
- Mapbox satellite dependency from roof page
- Debug `console.log` in `PortalShell.tsx`

## What Stays Untouched

- Geometry engine (`src/lib/roof/`) — valid for future 3D enhancement
- R3F components — kept in codebase, not imported
- `ShingleSelector` — same interface, feeds hex to new viewer
- `RoofStats` — same props
- `RoofPageSkeleton` — same loading state
- Shingle catalog — same 18 colors across 3 tiers
- `useRoofData` hook — extends to include `layers` in response type

## Cost

| Tier | Requests/month | Cost |
|------|---------------|------|
| Free | 1,000 | $0 |
| Paid | Per request | $0.075 |

At 50-100 quotes/month, stays well within free tier. Each property is fetched once and cached permanently.

## Future Enhancement (Not in Scope)

**Approach C — 3D Mesh from DSM:** Use the DSM GeoTIFF (per-pixel elevation) to generate a proper 3D mesh, texture with shingle materials in R3F. Could be added as a "3D View" toggle later. The DSM data is already returned by the same `dataLayers:get` call.

## Files Changed

| File | Change |
|------|--------|
| `src/db/schema/measurements.ts` | Add `roofLayers` jsonb column |
| `src/app/api/portal/roof-data/route.ts` | Add Data Layers fetch, process, cache logic |
| `src/components/features/roof/RoofCanvasViewer.tsx` | New — canvas-based masked renderer |
| `src/components/features/roof/RoofImageViewer.tsx` | Delete |
| `src/app/portal/roof/page.tsx` | Swap RoofImageViewer → RoofCanvasViewer |
| `src/hooks/useRoofData.ts` | Extend response type to include `layers` |
| `src/lib/roof/types.ts` | Add `RoofLayers` type |
| `src/components/features/portal/PortalSidebarV2/PortalShell.tsx` | Remove debug console.log |
| `package.json` | Add `geotiff`, move `sharp` to dependencies |
