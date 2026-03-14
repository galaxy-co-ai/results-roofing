/**
 * Parametric roof geometry engine.
 *
 * Converts Google Solar roofSegmentStats into overlapping tilted rectangles.
 * Each segment's bounding box becomes a 3D plane tilted by pitch/azimuth.
 * The GPU Z-buffer resolves overlaps — whichever plane is physically higher
 * at a given point is visible, producing natural ridge/hip/valley lines.
 *
 * Coordinate convention: X = east, Y = up, Z = south
 */

import type { RawRoofSegment, RoofGeometry } from './types';

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

    // Pad bounding box to close gaps between adjacent segments
    const PAD = 3; // meters
    const polygon: Pt2[] = [
      [sw[0] - PAD, sw[1] + PAD],
      [ne[0] + PAD, sw[1] + PAD],
      [ne[0] + PAD, ne[1] - PAD],
      [sw[0] - PAD, ne[1] - PAD],
    ];

    const pitch = seg.pitchDegrees < 2 ? 0 : (seg.pitchDegrees * Math.PI) / 180;
    const azimuth = (seg.azimuthDegrees * Math.PI) / 180;
    const height = seg.planeHeightAtCenterMeters ?? estimateHeight(seg);

    locals.push({ center, polygon, pitch, azimuth, height });
  }

  if (locals.length === 0) return null;

  // 2. No clipping — the GPU Z-buffer resolves overlaps naturally.
  //    Where two tilted planes overlap, the higher surface is visible,
  //    producing natural ridge/hip/valley lines without clipping math.

  // 3. Tilt 2D polygons into 3D
  const allPositions: number[] = [];
  const allNormals: number[] = [];
  const allIndices: number[] = [];
  let vertexOffset = 0;

  for (const facet of locals) {
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

    // Fan triangulation (rectangles are convex)
    for (let k = 1; k < facet.polygon.length - 1; k++) {
      allIndices.push(startIdx, startIdx + k, startIdx + k + 1);
    }
  }

  // 4. Normalize: center at origin, scale to ~15 units
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
    facetCount: locals.length,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function estimateHeight(seg: RawRoofSegment): number {
  if (!seg.boundingBox) return 5;
  const latSpan = seg.boundingBox.ne.latitude - seg.boundingBox.sw.latitude;
  const halfWidth = (latSpan * M_PER_DEG_LAT) / 2;
  const pitch = (seg.pitchDegrees * Math.PI) / 180;
  return 3 + Math.tan(pitch) * halfWidth;
}
