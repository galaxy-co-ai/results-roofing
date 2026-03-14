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
