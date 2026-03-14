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

  // 1. Add roof facet geometry
  for (const facet of facets) {
    const startIdx = vertexOffset;
    for (const [x, y, z] of facet.vertices) {
      allPositions.push(x, y, z);
      allNormals.push(facet.normal[0], facet.normal[1], facet.normal[2]);
      vertexOffset++;
    }
    for (let k = 1; k < facet.vertices.length - 1; k++) {
      allIndices.push(startIdx, startIdx + k, startIdx + k + 1);
    }
  }

  // 2. Detect eave edges (boundary edges used by only one facet)
  const edgeCount = new Map<string, { a: Vec3; b: Vec3 }>();
  for (const facet of facets) {
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

  // 3. Extrude walls from eave edges
  let minY = Infinity, maxY = -Infinity;
  for (let i = 1; i < allPositions.length; i += 3) {
    minY = Math.min(minY, allPositions[i]);
    maxY = Math.max(maxY, allPositions[i]);
  }
  const roofHeight = maxY - minY;
  const wallBottom = minY - roofHeight * 0.6;

  for (const { a, b } of edgeCount.values()) {
    const startIdx = vertexOffset;
    const edgeDx = b[0] - a[0];
    const edgeDz = b[2] - a[2];
    const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDz * edgeDz);
    if (edgeLen < 0.001) continue;

    const wallNx = -edgeDz / edgeLen;
    const wallNz = edgeDx / edgeLen;

    allPositions.push(a[0], a[1], a[2]);
    allNormals.push(wallNx, 0, wallNz);
    allPositions.push(b[0], b[1], b[2]);
    allNormals.push(wallNx, 0, wallNz);
    allPositions.push(b[0], wallBottom, b[2]);
    allNormals.push(wallNx, 0, wallNz);
    allPositions.push(a[0], wallBottom, a[2]);
    allNormals.push(wallNx, 0, wallNz);
    vertexOffset += 4;

    allIndices.push(startIdx, startIdx + 1, startIdx + 2);
    allIndices.push(startIdx, startIdx + 2, startIdx + 3);
  }

  // 4. Normalize: center at origin, scale to ~15 units
  const positions = new Float32Array(allPositions);
  const normals = new Float32Array(allNormals);
  const indices = new Uint32Array(allIndices);

  let pMinX = Infinity, pMaxX = -Infinity;
  let pMinY = Infinity;
  let pMinZ = Infinity, pMaxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    pMinX = Math.min(pMinX, positions[i]);
    pMaxX = Math.max(pMaxX, positions[i]);
    pMinY = Math.min(pMinY, positions[i + 1]);
    pMinZ = Math.min(pMinZ, positions[i + 2]);
    pMaxZ = Math.max(pMaxZ, positions[i + 2]);
  }

  const centerX = (pMinX + pMaxX) / 2;
  const centerZ = (pMinZ + pMaxZ) / 2;
  const maxSpan = Math.max(pMaxX - pMinX, pMaxZ - pMinZ, 1);
  const scale = 15 / maxSpan;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - centerX) * scale;
    positions[i + 1] = (positions[i + 1] - pMinY) * scale;
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

function edgeKey(a: Vec3, b: Vec3): string {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const ka = `${round(a[0])},${round(a[1])},${round(a[2])}`;
  const kb = `${round(b[0])},${round(b[1])},${round(b[2])}`;
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}
