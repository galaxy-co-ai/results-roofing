/**
 * Convert parsed DXF facets into Three.js-ready BufferGeometry arrays.
 *
 * DXF coordinate convention: X=east, Y=north, Z=up
 * Three.js convention:        X=east, Y=up,    Z=south
 * Conversion: threeX = dxfX, threeY = dxfZ, threeZ = -dxfY
 *
 * Pipeline:
 * 1. Convert DXF coords → Three.js coords
 * 2. Triangulate roof facets (fan from vertex 0)
 * 3. Detect eave edges (boundary edges not shared between two facets)
 * 4. Extrude walls from eave edges down to ground plane
 * 5. Center at origin, scale to ~15 units
 * 6. Output separate roof and wall sub-geometries as typed arrays
 */

import type { DxfFacet, RoofGeometry } from './types';

type Vec3 = [number, number, number];

/** Convert DXF vertex [x,y,z] to Three.js [x,y,z] */
function dxfToThree(v: Vec3): Vec3 {
  return [v[0], v[2], -v[1]];
}

/** Convert DXF normal [x,y,z] to Three.js [x,y,z] */
function dxfNormalToThree(n: Vec3): Vec3 {
  return [n[0], n[2], -n[1]];
}

export function buildGeometryFromFacets(facets: DxfFacet[]): RoofGeometry | null {
  if (facets.length === 0) return null;

  // 1. Convert all facets to Three.js coordinate system
  const converted = facets.map(f => ({
    vertices: f.vertices.map(dxfToThree),
    normal: dxfNormalToThree(f.normal),
  }));

  const roofPositions: number[] = [];
  const roofNormals: number[] = [];
  const roofIndices: number[] = [];
  let roofVertexOffset = 0;

  const wallPositions: number[] = [];
  const wallNormals: number[] = [];
  const wallIndices: number[] = [];
  let wallVertexOffset = 0;

  // 2. Add roof facet geometry
  for (const facet of converted) {
    const startIdx = roofVertexOffset;
    for (const [x, y, z] of facet.vertices) {
      roofPositions.push(x, y, z);
      roofNormals.push(facet.normal[0], facet.normal[1], facet.normal[2]);
      roofVertexOffset++;
    }
    for (let k = 1; k < facet.vertices.length - 1; k++) {
      roofIndices.push(startIdx, startIdx + k, startIdx + k + 1);
    }
  }

  // 3. Detect eave edges (boundary edges used by only one facet)
  const edgeCount = new Map<string, { a: Vec3; b: Vec3 }>();
  for (const facet of converted) {
    const n = facet.vertices.length;
    for (let i = 0; i < n; i++) {
      const a = facet.vertices[i];
      const b = facet.vertices[(i + 1) % n];
      const key = edgeKey(a, b);
      if (edgeCount.has(key)) {
        edgeCount.delete(key);
      } else {
        edgeCount.set(key, { a, b });
      }
    }
  }

  // 4. Extrude walls from eave edges down to ground
  let minY = Infinity, maxY = -Infinity;
  for (let i = 1; i < roofPositions.length; i += 3) {
    minY = Math.min(minY, roofPositions[i]);
    maxY = Math.max(maxY, roofPositions[i]);
  }
  const roofHeight = maxY - minY;
  const wallBottom = minY - roofHeight * 0.6;

  for (const { a, b } of Array.from(edgeCount.values())) {
    const startIdx = wallVertexOffset;
    // Wall normal: perpendicular to edge in XZ plane, pointing outward
    const edgeDx = b[0] - a[0];
    const edgeDz = b[2] - a[2];
    const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDz * edgeDz);
    if (edgeLen < 0.001) continue;

    const wallNx = -edgeDz / edgeLen;
    const wallNz = edgeDx / edgeLen;

    // Top edge (at roof eave)
    wallPositions.push(a[0], a[1], a[2]);
    wallNormals.push(wallNx, 0, wallNz);
    wallPositions.push(b[0], b[1], b[2]);
    wallNormals.push(wallNx, 0, wallNz);
    // Bottom edge (at ground)
    wallPositions.push(b[0], wallBottom, b[2]);
    wallNormals.push(wallNx, 0, wallNz);
    wallPositions.push(a[0], wallBottom, a[2]);
    wallNormals.push(wallNx, 0, wallNz);
    wallVertexOffset += 4;

    wallIndices.push(startIdx, startIdx + 1, startIdx + 2);
    wallIndices.push(startIdx, startIdx + 2, startIdx + 3);
  }

  // 5. Normalize: center at origin, scale to ~15 units
  // Compute bounds from BOTH roof and wall positions combined
  let pMinX = Infinity, pMaxX = -Infinity;
  let pMinY = Infinity;
  let pMinZ = Infinity, pMaxZ = -Infinity;

  for (const posArr of [roofPositions, wallPositions]) {
    for (let i = 0; i < posArr.length; i += 3) {
      pMinX = Math.min(pMinX, posArr[i]);
      pMaxX = Math.max(pMaxX, posArr[i]);
      pMinY = Math.min(pMinY, posArr[i + 1]);
      pMinZ = Math.min(pMinZ, posArr[i + 2]);
      pMaxZ = Math.max(pMaxZ, posArr[i + 2]);
    }
  }

  const centerX = (pMinX + pMaxX) / 2;
  const centerZ = (pMinZ + pMaxZ) / 2;
  const maxSpan = Math.max(pMaxX - pMinX, pMaxZ - pMinZ, 1);
  const scale = 15 / maxSpan;

  // Apply centering + scaling to both sets
  for (const posArr of [roofPositions, wallPositions]) {
    for (let i = 0; i < posArr.length; i += 3) {
      posArr[i] = (posArr[i] - centerX) * scale;
      posArr[i + 1] = (posArr[i + 1] - pMinY) * scale;
      posArr[i + 2] = (posArr[i + 2] - centerZ) * scale;
    }
  }

  return {
    roof: {
      positions: new Float32Array(roofPositions),
      normals: new Float32Array(roofNormals),
      indices: new Uint32Array(roofIndices),
      vertexCount: roofPositions.length / 3,
      triangleCount: roofIndices.length / 3,
    },
    walls: {
      positions: new Float32Array(wallPositions),
      normals: new Float32Array(wallNormals),
      indices: new Uint32Array(wallIndices),
      vertexCount: wallPositions.length / 3,
      triangleCount: wallIndices.length / 3,
    },
    facetCount: facets.length,
  };
}

function edgeKey(a: Vec3, b: Vec3): string {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const ka = `${round(a[0])},${round(a[1])},${round(a[2])}`;
  const kb = `${round(b[0])},${round(b[1])},${round(b[2])}`;
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}
