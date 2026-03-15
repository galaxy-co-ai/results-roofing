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
 * 3. Generate per-facet UVs via planar projection
 * 4. Detect eave edges (boundary edges not shared between two facets)
 * 5. Extrude walls from eave edges down to ground plane
 * 6. Build edge line segments for white trim
 * 7. Center at origin, scale to ~15 units
 * 8. Output separate roof, wall, and edge sub-geometries
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

/** Cross product */
function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/** Dot product */
function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Normalize vector */
function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len < 1e-8) return [0, 1, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

/**
 * Compute UVs for a facet by projecting vertices onto the facet's local 2D plane.
 * Scale: 1 unit in world space = 1 UV unit (texture repeat handles tiling).
 */
function computeFacetUVs(vertices: Vec3[], normal: Vec3): [number, number][] {
  // Build a local 2D coordinate system on the facet plane
  // tangentU = arbitrary perpendicular to normal
  const up: Vec3 = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const tangentU = normalize(cross(up, normal));
  const tangentV = normalize(cross(normal, tangentU));

  // Project each vertex onto tangentU/tangentV
  return vertices.map(v => [dot(v, tangentU), dot(v, tangentV)]);
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
  const roofUvs: number[] = [];
  const roofIndices: number[] = [];
  let roofVertexOffset = 0;

  const wallPositions: number[] = [];
  const wallNormals: number[] = [];
  const wallUvs: number[] = [];
  const wallIndices: number[] = [];
  let wallVertexOffset = 0;

  // 2. Add roof facet geometry with UVs
  for (const facet of converted) {
    const startIdx = roofVertexOffset;
    const uvs = computeFacetUVs(facet.vertices, facet.normal);

    for (let i = 0; i < facet.vertices.length; i++) {
      const [x, y, z] = facet.vertices[i];
      roofPositions.push(x, y, z);
      roofNormals.push(facet.normal[0], facet.normal[1], facet.normal[2]);
      roofUvs.push(uvs[i][0], uvs[i][1]);
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

  // 5. Build edge line segments for trim
  const edgeLinePositions: number[] = [];

  for (const { a, b } of Array.from(edgeCount.values())) {
    const startIdx = wallVertexOffset;
    const edgeDx = b[0] - a[0];
    const edgeDz = b[2] - a[2];
    const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDz * edgeDz);
    if (edgeLen < 0.001) continue;

    const wallNx = -edgeDz / edgeLen;
    const wallNz = edgeDx / edgeLen;

    const wallHeight = Math.max(a[1], b[1]) - wallBottom;

    // Top edge (at roof eave)
    wallPositions.push(a[0], a[1], a[2]);
    wallNormals.push(wallNx, 0, wallNz);
    wallUvs.push(0, wallHeight);
    wallPositions.push(b[0], b[1], b[2]);
    wallNormals.push(wallNx, 0, wallNz);
    wallUvs.push(edgeLen, wallHeight);
    // Bottom edge (at ground)
    wallPositions.push(b[0], wallBottom, b[2]);
    wallNormals.push(wallNx, 0, wallNz);
    wallUvs.push(edgeLen, 0);
    wallPositions.push(a[0], wallBottom, a[2]);
    wallNormals.push(wallNx, 0, wallNz);
    wallUvs.push(0, 0);
    wallVertexOffset += 4;

    wallIndices.push(startIdx, startIdx + 1, startIdx + 2);
    wallIndices.push(startIdx, startIdx + 2, startIdx + 3);

    // Edge line segment (for white trim along eave)
    edgeLinePositions.push(a[0], a[1], a[2]);
    edgeLinePositions.push(b[0], b[1], b[2]);
  }

  // 6. Normalize: center at origin, scale to ~15 units
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

  // Apply centering + scaling to all position arrays
  for (const posArr of [roofPositions, wallPositions, edgeLinePositions]) {
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
      uvs: new Float32Array(roofUvs),
      indices: new Uint32Array(roofIndices),
      vertexCount: roofPositions.length / 3,
      triangleCount: roofIndices.length / 3,
    },
    walls: {
      positions: new Float32Array(wallPositions),
      normals: new Float32Array(wallNormals),
      uvs: new Float32Array(wallUvs),
      indices: new Uint32Array(wallIndices),
      vertexCount: wallPositions.length / 3,
      triangleCount: wallIndices.length / 3,
    },
    edges: {
      positions: new Float32Array(edgeLinePositions),
      vertexCount: edgeLinePositions.length / 3,
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
