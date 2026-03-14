/**
 * Parametric roof geometry engine.
 *
 * Converts Google Solar roofSegmentStats into a triangle mesh:
 * 1. Project lat/lng → local meters
 * 2. Generate bounding box polygons
 * 3. Half-plane clip overlapping segments
 * 4. Tilt facets into 3D using pitch/azimuth
 * 5. Normalize to scene units
 * 6. Detect shared edges, add ridge/hip caps
 * 7. Fan-triangulate and output BufferGeometry arrays
 *
 * Coordinate convention: X = east, Y = up, Z = south
 */

import type { RawRoofSegment, RoofGeometry } from './types';
import { clipPolygonByLine } from './clip';

type Pt2 = [number, number]; // [x, z] in local meters

// ── Projection ──────────────────────────────────────────────────────────────

const M_PER_DEG_LAT = 111_320;

function latLngToLocal(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
): Pt2 {
  const mPerDegLng = M_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  const x = (lng - centerLng) * mPerDegLng;  // east
  const z = (centerLat - lat) * M_PER_DEG_LAT; // south (lat decreases → z increases)
  return [x, z];
}

// ── Roof plane math ─────────────────────────────────────────────────────────

interface LocalSegment {
  center: Pt2;
  polygon: Pt2[];
  pitch: number;     // radians
  azimuth: number;   // radians
  height: number;    // meters at center
}

/** Downhill direction for a given azimuth in (X=east, Z=south) space */
function downhillDir(azRad: number): Pt2 {
  return [Math.sin(azRad), -Math.cos(azRad)];
}

/** Height of a roof plane at point (x,z) */
function planeHeightAt(seg: LocalSegment, x: number, z: number): number {
  const [dx, dz] = downhillDir(seg.azimuth);
  const dist = (x - seg.center[0]) * dx + (z - seg.center[1]) * dz;
  return seg.height - Math.tan(seg.pitch) * dist;
}

/**
 * Compute the 2D clipping line where two roof planes intersect.
 * Returns [pointOnLine, lineDirection] or null if planes are parallel.
 */
function planeIntersectionLine(
  a: LocalSegment,
  b: LocalSegment,
): { point: Pt2; dir: Pt2 } | null {
  const [dax, daz] = downhillDir(a.azimuth);
  const [dbx, dbz] = downhillDir(b.azimuth);
  const tanA = Math.tan(a.pitch);
  const tanB = Math.tan(b.pitch);

  const coeffX = tanB * dbx - tanA * dax;
  const coeffZ = tanB * dbz - tanA * daz;
  const rhs =
    b.height - a.height +
    tanB * (b.center[0] * dbx + b.center[1] * dbz) -
    tanA * (a.center[0] * dax + a.center[1] * daz);

  const len = Math.sqrt(coeffX ** 2 + coeffZ ** 2);
  if (len < 1e-10) return null; // parallel planes

  const dir: Pt2 = [-coeffZ / len, coeffX / len];

  let point: Pt2;
  if (Math.abs(coeffX) > Math.abs(coeffZ)) {
    point = [rhs / coeffX, 0];
  } else {
    point = [0, rhs / coeffZ];
  }

  return { point, dir };
}

// ── Main pipeline ───────────────────────────────────────────────────────────

export function buildRoofGeometry(
  segments: RawRoofSegment[],
  buildingCenter: { lat: number; lng: number },
): RoofGeometry | null {
  // 1. Filter and project segments to local coordinates
  const locals: LocalSegment[] = [];

  for (const seg of segments) {
    if (!seg.boundingBox) continue;

    const center = seg.center
      ? latLngToLocal(seg.center.latitude, seg.center.longitude, buildingCenter.lat, buildingCenter.lng)
      : latLngToLocal(
          (seg.boundingBox.sw.latitude + seg.boundingBox.ne.latitude) / 2,
          (seg.boundingBox.sw.longitude + seg.boundingBox.ne.longitude) / 2,
          buildingCenter.lat,
          buildingCenter.lng,
        );

    const sw = latLngToLocal(seg.boundingBox.sw.latitude, seg.boundingBox.sw.longitude, buildingCenter.lat, buildingCenter.lng);
    const ne = latLngToLocal(seg.boundingBox.ne.latitude, seg.boundingBox.ne.longitude, buildingCenter.lat, buildingCenter.lng);

    // Bounding box → rectangle polygon, padded to ensure neighbor overlap.
    // Google's per-segment bounding boxes are tight-fitting and leave gaps
    // between adjacent segments without padding.
    const PAD = 5; // meters
    const polygon: Pt2[] = [
      [sw[0] - PAD, sw[1] + PAD], // SW (further west + south)
      [ne[0] + PAD, sw[1] + PAD], // SE (further east + south)
      [ne[0] + PAD, ne[1] - PAD], // NE (further east + north)
      [sw[0] - PAD, ne[1] - PAD], // NW (further west + north)
    ];

    const pitch = seg.pitchDegrees < 2 ? 0 : (seg.pitchDegrees * Math.PI) / 180;
    const azimuth = (seg.azimuthDegrees * Math.PI) / 180;
    const height = seg.planeHeightAtCenterMeters ?? estimateHeight(seg);

    locals.push({ center, polygon, pitch, azimuth, height });
  }

  if (locals.length === 0) return null;

  // 2. Save original padded bounds for overlap detection.
  //    We check overlap with pre-clip bounds so that clipping polygon[i] against
  //    plane j doesn't cause a later overlap check for (i, k) to miss.
  const originalBounds = locals.map(local => {
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const [x, z] of local.polygon) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
    return { minX, maxX, minZ, maxZ };
  });

  // 3. Clip each segment against overlapping neighbors only
  for (let i = 0; i < locals.length; i++) {
    for (let j = 0; j < locals.length; j++) {
      if (i === j) continue;

      // Use ORIGINAL padded bounds for overlap check (not mutated polygon)
      const a = originalBounds[i];
      const b = originalBounds[j];
      if (a.maxX < b.minX || b.maxX < a.minX ||
          a.maxZ < b.minZ || b.maxZ < a.minZ) continue;

      const line = planeIntersectionLine(locals[i], locals[j]);
      if (!line) continue;

      locals[i].polygon = clipPolygonByLine(
        locals[i].polygon,
        line.point,
        line.dir,
        locals[i].center,
      );
    }
  }

  // Remove degenerate facets
  const validFacets = locals.filter(s => s.polygon.length >= 3);
  if (validFacets.length === 0) return null;

  // 3. Tilt 2D polygons into 3D
  const allPositions: number[] = [];
  const allNormals: number[] = [];
  const allIndices: number[] = [];
  let vertexOffset = 0;

  for (const facet of validFacets) {
    const [dx, dz] = downhillDir(facet.azimuth);
    const tanP = Math.tan(facet.pitch);

    // Normal of the tilted plane
    const nx = tanP * dx;
    const ny = 1;
    const nz = tanP * dz;
    const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);

    // Add vertices
    const startIdx = vertexOffset;
    for (const [px, pz] of facet.polygon) {
      const dist = (px - facet.center[0]) * dx + (pz - facet.center[1]) * dz;
      const y = facet.height - tanP * dist;

      allPositions.push(px, y, pz);
      allNormals.push(nx / nLen, ny / nLen, nz / nLen);
      vertexOffset++;
    }

    // Fan triangulation (polygon is convex after S-H clipping)
    for (let k = 1; k < facet.polygon.length - 1; k++) {
      allIndices.push(startIdx, startIdx + k, startIdx + k + 1);
    }
  }

  // 4. Add ridge/hip cap geometry
  addRidgeHipCaps(validFacets, allPositions, allNormals, allIndices, vertexOffset);

  // 5. Normalize: center at origin, scale to ~15 units
  const positions = new Float32Array(allPositions);
  const normals = new Float32Array(allNormals);
  const indices = new Uint32Array(allIndices);

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
  const maxSpan = Math.max(maxX - minX, maxZ - minZ, 1);
  const scale = 15 / maxSpan;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - centerX) * scale;
    positions[i + 1] = (positions[i + 1] - minY) * scale;
    positions[i + 2] = (positions[i + 2] - centerZ) * scale;
  }

  const vertexCount = positions.length / 3;
  return {
    positions,
    normals,
    indices,
    vertexCount,
    triangleCount: indices.length / 3,
    facetCount: validFacets.length,
  };
}

// ── Ridge/Hip Caps ──────────────────────────────────────────────────────────

function addRidgeHipCaps(
  facets: LocalSegment[],
  positions: number[],
  normals: number[],
  indices: number[],
  startVertex: number,
): void {
  const CAP_WIDTH = 0.15; // meters (will be scaled with mesh)
  const CAP_HEIGHT = 0.08;

  for (let i = 0; i < facets.length; i++) {
    for (let j = i + 1; j < facets.length; j++) {
      const edge = findSharedEdge(facets[i].polygon, facets[j].polygon);
      if (!edge) continue;

      const [e0, e1] = edge;
      const midX = (e0[0] + e1[0]) / 2;
      const midZ = (e0[1] + e1[1]) / 2;
      const hI = planeHeightAt(facets[i], midX, midZ);
      const hJ = planeHeightAt(facets[j], midX, midZ);
      const avgH = (hI + hJ) / 2;

      const edgeDx = e1[0] - e0[0];
      const edgeDz = e1[1] - e0[1];
      const perpX = -edgeDz;
      const perpZ = edgeDx;
      const testI = planeHeightAt(facets[i], midX + perpX * 0.1, midZ + perpZ * 0.1);
      const testJ = planeHeightAt(facets[j], midX - perpX * 0.1, midZ - perpZ * 0.1);

      if (testI < avgH && testJ < avgH) {
        addCapGeometry(edge, avgH, CAP_WIDTH, CAP_HEIGHT, positions, normals, indices, startVertex);
        startVertex += 6;
      }
    }
  }
}

function findSharedEdge(
  polyA: Pt2[],
  polyB: Pt2[],
): [Pt2, Pt2] | null {
  const TOLERANCE = 0.3;

  for (let i = 0; i < polyA.length; i++) {
    const a0 = polyA[i];
    const a1 = polyA[(i + 1) % polyA.length];

    for (let j = 0; j < polyB.length; j++) {
      const b0 = polyB[j];
      const b1 = polyB[(j + 1) % polyB.length];

      if (
        (ptClose(a0, b0, TOLERANCE) && ptClose(a1, b1, TOLERANCE)) ||
        (ptClose(a0, b1, TOLERANCE) && ptClose(a1, b0, TOLERANCE))
      ) {
        return [a0, a1];
      }
    }
  }
  return null;
}

function ptClose(a: Pt2, b: Pt2, tol: number): boolean {
  return Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;
}

function addCapGeometry(
  edge: [Pt2, Pt2],
  height: number,
  width: number,
  capHeight: number,
  positions: number[],
  normals: number[],
  indices: number[],
  startIdx: number,
): void {
  const [e0, e1] = edge;
  const dx = e1[0] - e0[0];
  const dz = e1[1] - e0[1];
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.01) return;

  const px = (-dz / len) * width / 2;
  const pz = (dx / len) * width / 2;

  const verts = [
    [e0[0] - px, height, e0[1] - pz],
    [e0[0] + px, height, e0[1] + pz],
    [e0[0], height + capHeight, e0[1]],
    [e1[0] - px, height, e1[1] - pz],
    [e1[0] + px, height, e1[1] + pz],
    [e1[0], height + capHeight, e1[1]],
  ];

  for (const v of verts) {
    positions.push(v[0], v[1], v[2]);
    normals.push(0, 1, 0);
  }

  const s = startIdx;
  indices.push(
    s, s + 3, s + 5,
    s, s + 5, s + 2,
    s + 1, s + 4, s + 5,
    s + 1, s + 5, s + 2,
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function estimateHeight(seg: RawRoofSegment): number {
  if (!seg.boundingBox) return 5;
  const latSpan = seg.boundingBox.ne.latitude - seg.boundingBox.sw.latitude;
  const halfWidth = (latSpan * M_PER_DEG_LAT) / 2;
  const pitch = (seg.pitchDegrees * Math.PI) / 180;
  return 3 + Math.tan(pitch) * halfWidth;
}

