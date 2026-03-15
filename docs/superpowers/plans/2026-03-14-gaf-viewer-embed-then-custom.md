# GAF Viewer Embed + Custom Build Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed GAF's 3D viewer (Report3D URL) immediately for a production-ready experience, then build our own custom viewer that matches/exceeds GAF's quality, then swap.

**Architecture:** Phase 1 embeds GAF's hosted 3D viewer via iframe, fed by the Report3D URL from the GAF callback. Phase 2 upgrades our DXF-based Three.js viewer with shingle textures, sky, shadows, and walls to match GAF's quality. Phase 3 swaps the iframe for our custom viewer.

**Tech Stack:** iframe (Phase 1), Three.js/R3F with textures (Phase 2), existing DXF pipeline (already built)

**Spec:** `docs/superpowers/specs/2026-03-14-gaf-roof-visualizer-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/app/portal/roof/page.tsx` | Phase 1: iframe embed. Phase 2: swap to custom viewer |
| Modify | `src/app/api/portal/roof-data/route.ts` | Return Report3D URL from gafAssets |
| Modify | `src/lib/roof/types.ts` | Add gafReport3dUrl to response type |
| Modify | `src/components/features/roof/RoofMeshViewer.tsx` | Phase 2: sky, shadow, better materials |
| Create | `src/components/features/roof/GafViewerEmbed.tsx` | Phase 1: iframe wrapper for GAF's 3D viewer |
| Modify | `src/lib/roof/dxf-to-geometry.ts` | Phase 2: separate roof/wall materials |

---

## Phase 1: Embed GAF's 3D Viewer (Quick Win)

### Task 1: Add Report3D URL to API Response

**Files:**
- Modify: `src/app/api/portal/roof-data/route.ts`

- [ ] **Step 1: Extract Report3D URL from gafAssets**

After the existing `gafDxfUrl` resolution, add:

```typescript
const gafReport3dUrl = gafAssets?.Report3D ?? null;
```

Add to the response object:
```typescript
gafReport3dUrl,
```

- [ ] **Step 2: Update RoofDataResponse type**

In `src/lib/roof/types.ts`, add to the interface:
```typescript
/** GAF's hosted 3D viewer URL */
gafReport3dUrl: string | null;
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/portal/roof-data/route.ts src/lib/roof/types.ts
git commit -m "feat(roof): return GAF Report3D URL from roof-data API"
```

---

### Task 2: Create GAF Viewer Embed Component

**Files:**
- Create: `src/components/features/roof/GafViewerEmbed.tsx`

- [ ] **Step 1: Build iframe wrapper**

```typescript
'use client';

interface GafViewerEmbedProps {
  report3dUrl: string;
}

export function GafViewerEmbed({ report3dUrl }: GafViewerEmbedProps) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 400,
      borderRadius: 8,
      overflow: 'hidden',
      background: '#e8f0fe',
    }}>
      <iframe
        src={report3dUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          minHeight: 400,
        }}
        title="3D Roof Visualization"
        allow="fullscreen"
        loading="lazy"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/roof/GafViewerEmbed.tsx
git commit -m "feat(roof): add GAF 3D viewer iframe embed component"
```

---

### Task 3: Update Page to Use GAF Embed

**Files:**
- Modify: `src/app/portal/roof/page.tsx`

- [ ] **Step 1: Import GafViewerEmbed and use it as primary viewer**

Priority order for what to show:
1. `gafReport3dUrl` exists → show GAF embed (immediate, production-quality)
2. `gafDxfUrl` exists → show our DXF-based viewer (custom, future primary)
3. `gafStatus === 'pending'` → show loading spinner
4. Otherwise → "Unavailable"

```typescript
import { GafViewerEmbed } from '@/components/features/roof/GafViewerEmbed';

// In the viewport section:
{roofData?.gafReport3dUrl ? (
  <GafViewerEmbed report3dUrl={roofData.gafReport3dUrl} />
) : roofGeometry ? (
  <RoofMeshViewer geometry={roofGeometry} shingleHex={selectedShingle.hex} />
) : gafStatus === 'pending' || dxfLoading ? (
  // ... loading state
) : (
  // ... unavailable state
)}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/app/portal/roof/page.tsx
git commit -m "feat(roof): embed GAF 3D viewer as primary visualization"
```

---

### Task 4: Test with Real Data

- [ ] **Step 1: Update measurement with Report3D URL**

The GAF callback for order #4647153 (from Dalton's actual GAF account) includes a Report3D URL. Since the callback went to Zuper's server, manually set it:

```bash
# Find the Report3D URL from the GAF portal (the "PO 3D" link)
# Then update the measurement:
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
sql(\`UPDATE measurements SET gaf_assets = gaf_assets || \$1::jsonb
  WHERE id = '455339d2-be51-4e9f-92ff-2d3387c999f0'\`,
  [JSON.stringify({ Report3D: 'THE_URL_FROM_GAF_PORTAL' })]
).then(() => console.log('Updated'));
"
```

- [ ] **Step 2: Verify on production**

Navigate to `/portal/roof` — should show GAF's interactive 3D viewer with shingle textures, walls, and orbit controls.

- [ ] **Step 3: Commit + Push**

```bash
git push
```

---

## Phase 2: Build Custom Viewer (Match GAF Quality)

### Task 5: Upgrade RoofMeshViewer — Sky, Shadow, Better Camera

**Files:**
- Modify: `src/components/features/roof/RoofMeshViewer.tsx`

- [ ] **Step 1: Add sky gradient background**

Replace the flat background color with a gradient sky using `@react-three/drei`'s `<Environment>` or a custom shader background:

```typescript
// Light blue sky gradient
<color attach="background" args={['#dbe9f4']} />
```

- [ ] **Step 2: Add ground shadow**

```typescript
<ContactShadows
  position={[0, -0.01, 0]}
  opacity={0.4}
  scale={30}
  blur={2}
  far={20}
/>
```

- [ ] **Step 3: Separate roof and wall materials**

The geometry converter should output separate mesh groups:
- Roof facets → shingle color material (from selector)
- Wall faces → neutral gray/white material (fixed)

This requires modifying `buildGeometryFromFacets` to return two geometries (roof + walls) or a material index buffer.

- [ ] **Step 4: Better default camera angle**

Match GAF's isometric-like view:
```typescript
camera={{ position: [15, 12, 15], fov: 45, near: 0.1, far: 200 }}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/roof/RoofMeshViewer.tsx
git commit -m "feat(roof): upgrade viewer with sky, shadows, wall material, better camera"
```

---

### Task 6: Add Shingle Textures

**Files:**
- Modify: `src/components/features/roof/RoofMeshViewer.tsx`
- Create: `public/textures/shingle-*.jpg` (or generate procedurally)

- [ ] **Step 1: Create/source a tileable shingle texture**

A repeating shingle pattern (bump map + color tint). Can be procedural or a real texture image.

- [ ] **Step 2: Apply texture to roof material**

```typescript
const texture = useTexture('/textures/shingle-base.jpg');
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4);

<meshStandardMaterial
  map={texture}
  color={shingleHex}  // tints the texture
  roughness={0.85}
  metalness={0.05}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/roof/RoofMeshViewer.tsx public/textures/
git commit -m "feat(roof): add shingle texture with color tinting"
```

---

### Task 7: Split Geometry into Roof + Walls

**Files:**
- Modify: `src/lib/roof/dxf-to-geometry.ts`
- Modify: `src/lib/roof/types.ts`
- Modify: `src/components/features/roof/RoofMeshViewer.tsx`

- [ ] **Step 1: Update RoofGeometry to include wall geometry separately**

```typescript
export interface RoofGeometry {
  roof: {
    positions: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
    vertexCount: number;
    triangleCount: number;
  };
  walls: {
    positions: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
    vertexCount: number;
    triangleCount: number;
  };
  facetCount: number;
}
```

- [ ] **Step 2: Update buildGeometryFromFacets to output separate arrays**

- [ ] **Step 3: Update RoofMeshViewer to render two meshes**

```typescript
// Roof mesh — shingle color/texture
<mesh geometry={roofGeometry} material={shingleMaterial} />

// Wall mesh — neutral gray
<mesh geometry={wallGeometry}>
  <meshStandardMaterial color="#e0ddd8" roughness={0.9} />
</mesh>
```

- [ ] **Step 4: Run tests, fix any breaking changes**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(roof): separate roof and wall geometry for independent materials"
```

---

## Phase 3: Swap to Custom Viewer

### Task 8: Replace GAF Embed with Custom Viewer

**Files:**
- Modify: `src/app/portal/roof/page.tsx`

- [ ] **Step 1: Change priority order**

Swap the priority so our custom DXF viewer is primary:

```typescript
{roofGeometry ? (
  <RoofMeshViewer geometry={roofGeometry} shingleHex={selectedShingle.hex} />
) : roofData?.gafReport3dUrl ? (
  <GafViewerEmbed report3dUrl={roofData.gafReport3dUrl} />
) : gafStatus === 'pending' || dxfLoading ? (
  // loading
) : (
  // unavailable
)}
```

- [ ] **Step 2: Verify quality matches or exceeds GAF**

- [ ] **Step 3: Commit + Push**

```bash
git commit -m "feat(roof): swap to custom DXF viewer as primary, GAF embed as fallback"
git push
```

---

## Summary

| Phase | What | Time | Result |
|-------|------|------|--------|
| 1 | Embed GAF's 3D viewer | ~30 min | Production-quality 3D with textures, walls, shadows |
| 2 | Build custom viewer upgrades | ~2-3 hours | Sky, shadows, textures, separate wall material |
| 3 | Swap to custom viewer | ~10 min | Our viewer primary, GAF embed fallback |
