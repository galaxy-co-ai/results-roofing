# 3D Roof Visualizer with Material Selection

**Date:** 2026-03-13
**Status:** Design approved, pending implementation
**Route:** `/portal/roof`

---

## Overview

A new portal page that renders an interactive 3D model of the homeowner's roof using Google Solar satellite segment data, with the ability to preview different shingle materials and colors per pricing tier. The model is generated client-side using React Three Fiber from data already stored in `measurements.rawResponse`.

### Goals

- Let homeowners see different shingle options on a recognizable 3D model of their actual roof
- Naturally upsell pricing tiers by showing material quality differences visually
- Add a "My Roof" tab to the portal that's available once satellite measurement completes

### Non-Goals

- Photorealistic rendering or street-level context
- Saving color preferences to the database
- Screenshot/share functionality (future enhancement)
- Support for GAF-only measurements (no segment geometry available)
- House wall extrusion (v1 renders roof only on a ground plane)
- Hover/highlight on individual facets (undefined purpose — defer)

---

## Data Source

### Google Solar `roofSegmentStats`

Stored in `measurements.rawResponse.solarPotential.roofSegmentStats[]`. Each segment provides:

| Field | Type | Required | Use |
|-------|------|----------|-----|
| `boundingBox.sw/ne` | lat/lng | optional | Facet width/depth estimation |
| `pitchDegrees` | number | required | Slope angle |
| `azimuthDegrees` | number | required | Facet orientation (0=N, 90=E, 180=S, 270=W) |
| `planeHeightAtCenterMeters` | number | optional | Elevation above ground |
| `center.latitude/longitude` | number | optional | Segment center point |
| `stats.areaMeters2` | number | required | Facet area |

Also available at the building level:
- `center` (lat/lng) — used as origin for local coordinate conversion
- `boundingBox` — overall building footprint
- `wholeRoofStats.areaMeters2` — total roof area

### What's NOT available

- Exact polygon vertices (bounding boxes are axis-aligned, not facet outlines)
- Dormer/chimney geometry
- Wall textures or house color
- Neighboring structures

### Key limitation

Google Solar bounding boxes are axis-aligned lat/lng rectangles, not facet polygons. On hip/valley roofs, adjacent segments have heavily overlapping bounding boxes. Naively rendering each as a solid quad produces intersecting geometry, not clean roof lines. The geometry algorithm below addresses this through half-plane clipping.

---

## Geometry Algorithm

### Coordinate Conversion

Convert all segment lat/lng to local meters relative to building center using equirectangular projection:

```
dx = (lng - centerLng) * cos(centerLat) * 111320
dy = (lat - centerLat) * 111320
```

Sufficient accuracy at building scale (< 0.01% error within 100m).

### Facet Generation (with overlap resolution)

1. **Initial quads:** For each segment, convert `boundingBox` to a local-space rectangle
2. **Adjacency detection:** Two segments are considered adjacent when:
   - Their bounding boxes overlap in local space, AND
   - Their centers are on opposite sides of the overlap region (i.e., the line connecting their centers crosses the overlap area)

   This second condition prevents false adjacency on L/T-shaped roofs where non-neighboring segments have overlapping axis-aligned boxes. Segments that overlap but whose centers are on the same side of the overlap region are NOT clipped against each other.
3. **Half-plane clipping:** For each truly adjacent pair, compute the bisecting plane between their centers and clip each facet to its own side. Uses Sutherland-Hodgman polygon clipping (no external dependency — ~50 lines of geometry math).
4. **Pitch tilt:** Rotate each clipped polygon by `pitchDegrees` around the axis perpendicular to its `azimuthDegrees` direction
5. **Height placement:** Position at `planeHeightAtCenterMeters`. When missing, estimate using the same equirectangular-converted bounding box dimensions: `height = (facetWidthMeters / 2) * tan(pitchDegrees) + baseEaveHeight`. Base eave height = lowest known segment height across all segments, or 3m default.
6. **Ground plane:** Flat plane underneath for shadow reception and visual grounding

### Why this works

Half-plane clipping between adjacent segments means:
- **Gable roofs** (2 segments): each gets exactly half, meeting at the ridge
- **Hip roofs** (4+ segments): each segment is trimmed to a trapezoid/triangle, creating proper hip lines
- **Valley roofs**: intersecting segments clip to their respective valleys
- **L/T-shaped roofs**: adjacency filter prevents cross-wing clipping artifacts

The result is a clean, non-overlapping roof mesh that's recognizable from multiple angles.

### Known Approximations

- Facets are planar quads/polygons — no curved surfaces
- Dormers appear as extra facets at different heights (acceptable approximation)
- Very complex roofs (20+ segments) may have minor gaps between clipped facets — visually negligible when textured
- L/T-shaped roofs with ambiguous adjacency may produce small overlaps or gaps at wing junctions — acceptable for v1

---

## UI Layout

### Desktop (>768px)

```
┌─────────────────────────────────────────────────┐
│  PortalHeader: "My Roof"                        │
├──────────────────────────┬──────────────────────┤
│                          │  Shingle Selector     │
│     3D Viewport          │  [Good] [Better] [Best]│
│     (~65% width)         │                      │
│                          │  Color Swatches       │
│     React Three Fiber    │  ○ ○ ○ ○ ○           │
│     Canvas               │  ○ ○ ○               │
│                          │                      │
│                          │  Roof Stats           │
│                          │  2,450 sqft | 6/12   │
│                          │  12 facets            │
├──────────────────────────┴──────────────────────┤
│  Camera: [Aerial] [Front] [Back] [Side]         │
└─────────────────────────────────────────────────┘
```

### Mobile (<768px)

- Viewport: full-width, ~50vh
- Camera presets: horizontal scroll strip below viewport
- Shingle selector + stats: stacked below, scrollable

### Interactions

- **Camera presets:** Snap to predefined positions with smooth tween via Drei `CameraControls.setLookAt()`. Respect `prefers-reduced-motion` — instant snap instead of tween.
- **Free rotation:** Drag to orbit between presets (constrained: no flipping below ground)
- **Tier selection:** Tab-style buttons, switching tier updates available colors and applies the first color of the new tier
- **Color swap:** Click swatch, texture updates reactively on all facets (instant, no animation)

---

## Shingle Catalog

Static config file at `src/lib/roof/shingle-catalog.ts`. Not in the database — shingle options change infrequently.

### Structure

```typescript
interface ShingleOption {
  id: string;                    // e.g., 'hdz-charcoal'
  tier: 'good' | 'better' | 'best';  // must match pricing_tiers.tier values
  name: string;                  // e.g., 'Charcoal'
  hex: string;                   // swatch preview color
  texture: string;               // path to tileable texture JPG
  brand: string;                 // e.g., 'GAF Timberline HDZ'
}
```

**Tier key validation:** The `tier` field values (`'good'`, `'better'`, `'best'`) must exactly match the `pricing_tiers.tier` column values in the database. Verify casing during implementation.

### Tier-to-Product Mapping

| Tier | GAF Product Line | Colors |
|------|-----------------|--------|
| Good | Royal Sovereign (3-tab) | 5-6 |
| Better | Timberline HDZ (architectural) | 6-8 |
| Best | Timberline AS II (designer) | 5-6 |

### Texture Assets

- Location: `public/textures/shingles/`
- Format: tileable JPG, ~512x512px
- ~15-20 images total
- Initial implementation uses solid-color placeholder textures; swap for real product photos when available

### Texture Application

- Each `RoofFacet` gets a `MeshStandardMaterial` with the selected texture as `map`
- **Texture UV repeat** is calculated from the facet's local-space width and depth (from the clipped polygon dimensions), NOT from `stats.areaMeters2`. This ensures correct aspect ratio on non-square facets. Target: ~1 repeat per 0.3m (roughly one shingle tab width).

### Texture Loading Strategy

- **Preload all catalog textures on mount** using Drei's `useTexture.preload(url)` for every entry in the shingle catalog. At ~512x512 JPG, the full catalog is ~2-3MB — acceptable for a one-time load.
- `RoofFacet` uses `useTexture(activeTextureUrl)` which resolves instantly for preloaded textures.
- Wrap `RoofModel` in a `<Suspense fallback={null}>` so that if a texture somehow isn't preloaded, the model briefly disappears rather than crashing. In practice this shouldn't trigger because preloading runs on mount before the user can interact.
- First-time tier switch feels instant because all textures are already cached.

---

## Component Architecture

### File Structure

```
src/
├── lib/roof/
│   ├── shingle-catalog.ts        # Static color/texture config per tier
│   ├── geometry.ts               # Coordinate conversion, half-plane clipping,
│   │                             # segment → Three.js BufferGeometry
│   ├── clip.ts                   # Sutherland-Hodgman polygon clipping util
│   └── types.ts                  # RoofSegment, CameraPreset, ShingleOption types
│
├── components/features/roof/
│   ├── RoofViewer.tsx            # R3F Canvas, lights, shadows, CameraControls
│   ├── RoofModel.tsx             # Roof mesh assembly (all facets)
│   ├── RoofFacet.tsx             # Single facet mesh (receives texture)
│   ├── ShingleSelector.tsx       # Tier tabs + color swatches
│   ├── RoofStats.tsx             # Measurement quick-reference card
│   ├── CameraPresets.tsx         # Preset view buttons
│   └── RoofPageSkeleton.tsx      # Loading skeleton
│
├── hooks/
│   └── useRoofGeometry.ts        # Parse rawResponse → memoized facet geometry array
│
└── app/portal/roof/
    ├── page.tsx                  # 'use client' page (auth, phase gate, data fetch)
    └── page.module.css           # Page layout styles
```

### Data Flow & Loading Sequence

The page has a 3-step waterfall before rendering the 3D scene. `RoofPageSkeleton` renders during ALL loading phases, not only the R3F dynamic import.

```
Clerk auth → usePortalPhase (gets quoteId) → roof-data fetch → geometry computation → render
```

1. `page.tsx` is a `'use client'` component (matching existing portal page pattern). Uses `usePortalPhase` to resolve the user's quote/order. `quoteId` comes from `usePortalPhase().quote?.id ?? usePortalPhase().order?.quoteId`. Shows `RoofPageSkeleton` while `usePortalPhase` is loading.
2. Once `quoteId` is known, fetches segment data via React Query from `/api/portal/roof-data?quoteId=xxx`
3. `RoofViewer` is dynamically imported with `ssr: false` to prevent R3F Canvas from running in SSR:
   ```typescript
   const RoofViewer = dynamic(
     () => import('@/components/features/roof/RoofViewer'),
     { ssr: false, loading: () => <RoofPageSkeleton /> }
   );
   ```
4. `useRoofGeometry(segments, buildingCenter)` converts raw segments → clipped, positioned facet geometries (pure math, memoized via `useMemo`)
5. `RoofViewer` creates the R3F scene (Canvas, directional light, ambient light, ground plane, CameraControls)
6. `RoofModel` receives geometry array + active texture → renders `RoofFacet` per segment
7. `ShingleSelector` manages `{tier, colorId}` state, passes selected texture URL to `RoofModel`
8. `CameraPresets` triggers `cameraControls.setLookAt()` with smooth interpolation

### API Addition

New lightweight endpoint: `GET /api/portal/roof-data?quoteId=xxx`

Returns:
```json
{
  "segments": [...],
  "buildingCenter": { "lat": 0, "lng": 0 },
  "buildingBoundingBox": { "sw": {}, "ne": {} },
  "stats": {
    "sqftTotal": 2450,
    "pitchPrimary": "6",
    "facetCount": 12,
    "vendor": "google_solar"
  }
}
```

**Auth chain (3 levels, checked in order):**

1. `orders.clerkUserId` WHERE `orders.quoteId = quoteId` — fastest, covers post-payment users
2. `quotes.clerkUserId` WHERE `quotes.id = quoteId` — covers pre-payment users who have a quote but no order yet
3. `leads.email` via `quotes.leadId → leads.id` WHERE `leads.email` matches Clerk user's primary email — covers edge cases where clerkUserId wasn't set on the quote

Return 403 if none match. This prevents IDOR — an authenticated user cannot view another user's roof data by guessing a quoteId.

---

## Portal Integration

### Sidebar Tab

Add "My Roof" to the portal sidebar (`SidebarV2`) and bottom tab bar (`BottomTabBar`), using the `Home` lucide icon. Positioned after "My Project" and before "Documents."

### Visibility Gating

The existing `SidebarV2` and `BottomTabBar` use static `NAV_ITEMS` arrays with no conditional rendering.

**Data source:** Extend the existing `/api/portal/orders/[id]` response to include `measurement: { vendor, status }` (two lightweight fields from the measurements table). This avoids a separate network call — the order details query already joins on `quoteId`, so adding a measurement lookup is a single extra DB hit on an already-loading endpoint.

**Nav layer:** Extend `SidebarContext` (currently holds `{ expanded, toggle }`) to include `hasRoofData: boolean`. The portal layout (`app/portal/layout.tsx`) already calls hooks for portal state — it will derive `hasRoofData` from the order details response and pass it into `SidebarContext`. Both `SidebarV2` and `BottomTabBar` already consume `SidebarContext` (for expand/collapse), so they can read `hasRoofData` without new prop threading.

**Condition:** `hasRoofData = measurement.vendor === 'google_solar' AND measurement.status === 'complete'`

### Mobile Bottom Bar (5 tabs)

The `BottomTabBar` currently has 4 tabs. Adding a 5th on narrow viewports (320px) risks tap target issues. Solution: use icon-only tabs (no labels) when the 5th tab is present on viewports < 375px, with labels on wider screens. This is a CSS-only change.

---

## Edge Cases

| Condition | Behavior |
|-----------|----------|
| No Google Solar data (GAF-only) | Tab hidden from portal navigation |
| Measurement processing | Tab hidden (appears when complete) |
| Measurement failed | Tab hidden |
| `roofSegmentStats` empty/missing | Tab hidden |
| Very simple roof (1-2 segments) | Renders fine — just fewer facets |
| Complex roof (20+ segments) | Renders fine — half-plane clipping handles overlap |
| Segments with missing `boundingBox` | Skip that segment, render the rest |
| Segments with missing `planeHeightAtCenterMeters` | Estimate: `height = (facetWidth / 2) * tan(pitchDegrees) + baseEaveHeight`. Base eave height = lowest known segment height, or 3m default. Conversion uses the same equirectangular projection as all other coordinate math. |
| Segments with missing `center` | Use bounding box center as fallback |

---

## Performance

- **Geometry:** Generated once via `useMemo`. Half-plane clipping is O(n^2) on segment count — negligible for residential roofs (< 30 segments).
- **Triangle count:** Most roofs < 500 triangles total — trivial for any GPU.
- **Textures:** Lazy-loaded via Drei `useTexture`. Current swatch shown immediately, texture loads in background.
- **Mobile:** Reduce shadow map resolution. Canvas renders at device pixel ratio (capped at 2).
- **Bundle:** Three.js + R3F + Drei are already in `package.json` — no new dependencies.

### Three.js Version Compatibility

`package.json` has `three: ^0.170.0` and `@react-three/fiber: ^8.18.0`. R3F 8.x officially supports Three.js up to ~r168. Verify compatibility at implementation start — if breakage occurs, either pin `three` to `0.168.x` or upgrade R3F to 9.x.

---

## Accessibility

- Canvas: `role="img"` with `aria-label="3D model of your roof with [color] [brand] shingles"`
- Tier selector: keyboard-navigable tab group
- Color swatches: `role="radiogroup"`, each swatch is `role="radio"` with visible color name label
- Camera presets: standard `<button>` elements with descriptive labels
- Reduced motion: respect `prefers-reduced-motion` — disable camera tweens, instant snap instead

---

## Technical Risks

| Risk | Mitigation |
|------|-----------|
| Half-plane clipping produces gaps on complex roofs | Accept minor gaps — they're invisible when textured. Can add thin edge geometry later if needed. |
| R3F 8.x / Three.js 0.170 incompatibility | Test early. Pin Three.js to 0.168 or upgrade R3F if needed. |
| `rawResponse` is untyped `jsonb` — no TS guarantees at query time | Add runtime validation (Zod parse) in `useRoofGeometry` before passing to Three.js. Fail gracefully with empty state. |
| Very flat pitch segments (< 2 degrees) look like floating planes | Snap near-zero pitch to 0 and render as flat sections |

---

## Future Enhancements (Out of Scope)

- Screenshot capture for sharing (Approach C from brainstorming)
- Save selected color preference to order/quote
- Embed compact visualizer in quote customize step
- Support GAF-only measurements with simplified parametric model
- House wall extrusion below roof
- Neighbor house silhouettes for context
- Chimney/vent/skylight markers from imagery
- Hover/highlight on individual facets with per-segment stats
