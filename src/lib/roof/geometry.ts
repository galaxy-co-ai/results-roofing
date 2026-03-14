import type { RawRoofSegment, Point2D, Polygon2D, ProcessedFacet } from './types';
import { clipPolygonByHalfPlane, findAdjacentPairs } from './clip';
import type { AABB } from './clip';

const METERS_PER_DEGREE = 111320;
const DEG_TO_RAD = Math.PI / 180;
const DEFAULT_EAVE_HEIGHT = 3;

export function latLngToLocal(
  point: { latitude: number; longitude: number },
  center: { latitude: number; longitude: number },
): Point2D {
  const cosLat = Math.cos(center.latitude * DEG_TO_RAD);
  return {
    x: (point.longitude - center.longitude) * cosLat * METERS_PER_DEGREE,
    y: (point.latitude - center.latitude) * METERS_PER_DEGREE,
  };
}

function bboxToLocal(
  bbox: NonNullable<RawRoofSegment['boundingBox']>,
  center: { latitude: number; longitude: number },
): AABB {
  const sw = latLngToLocal(bbox.sw, center);
  const ne = latLngToLocal(bbox.ne, center);
  return {
    minX: Math.min(sw.x, ne.x), minY: Math.min(sw.y, ne.y),
    maxX: Math.max(sw.x, ne.x), maxY: Math.max(sw.y, ne.y),
  };
}

function aabbToPolygon(aabb: AABB): Polygon2D {
  return [
    { x: aabb.minX, y: aabb.minY },
    { x: aabb.maxX, y: aabb.minY },
    { x: aabb.maxX, y: aabb.maxY },
    { x: aabb.minX, y: aabb.maxY },
  ];
}

function polygonExtents(polygon: Polygon2D): { width: number; depth: number } {
  if (polygon.length === 0) return { width: 0, depth: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of polygon) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { width: maxX - minX, depth: maxY - minY };
}

function polygonCenter(polygon: Polygon2D): Point2D {
  let sx = 0, sy = 0;
  for (const p of polygon) { sx += p.x; sy += p.y; }
  return { x: sx / polygon.length, y: sy / polygon.length };
}

/**
 * Tilt a 2D polygon into 3D space by applying pitch and azimuth.
 * Azimuth convention: 0=N(+y), 90=E(+x), 180=S(-y), 270=W(-x)
 * Three.js convention: X=right, Y=up, Z=toward camera
 * Local 2D mapping: local x→Three.js X, local y→Three.js -Z
 */
function tiltPolygon(
  polygon: Polygon2D,
  pitchDegrees: number,
  azimuthDegrees: number,
  baseHeight: number,
): [number, number, number][] {
  const center = polygonCenter(polygon);
  const pitchRad = pitchDegrees * DEG_TO_RAD;
  const azRad = azimuthDegrees * DEG_TO_RAD;

  // Downslope direction in local 2D space
  // Azimuth=0 (north) → downslope toward +y in local space
  const downX = Math.sin(azRad);
  const downY = Math.cos(azRad);

  return polygon.map((p) => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;

    // Project offset onto downslope axis
    const alongSlope = dx * downX + dy * downY;

    // Height varies along the slope direction
    const heightOffset = -alongSlope * Math.sin(pitchRad);

    // Map to Three.js: local x→X, local y→-Z, height→Y
    return [p.x, baseHeight + heightOffset, -p.y] as [number, number, number];
  });
}

export function processSegments(
  segments: RawRoofSegment[],
  buildingCenter: { latitude: number; longitude: number },
): ProcessedFacet[] {
  const localSegments: {
    polygon: Polygon2D;
    center: Point2D;
    bbox: AABB;
    raw: RawRoofSegment;
  }[] = [];

  for (const seg of segments) {
    if (!seg.boundingBox) continue;

    const bbox = bboxToLocal(seg.boundingBox, buildingCenter);
    const centerPoint = seg.center
      ? latLngToLocal(seg.center, buildingCenter)
      : { x: (bbox.minX + bbox.maxX) / 2, y: (bbox.minY + bbox.maxY) / 2 };

    localSegments.push({ polygon: aabbToPolygon(bbox), center: centerPoint, bbox, raw: seg });
  }

  if (localSegments.length === 0) return [];

  // Find adjacent pairs and clip overlaps
  const segInfos = localSegments.map((s) => ({ center: s.center, bbox: s.bbox }));
  const pairs = findAdjacentPairs(segInfos);

  for (const [i, j] of pairs) {
    localSegments[i].polygon = clipPolygonByHalfPlane(
      localSegments[i].polygon, localSegments[i].center, localSegments[j].center,
    );
    localSegments[j].polygon = clipPolygonByHalfPlane(
      localSegments[j].polygon, localSegments[j].center, localSegments[i].center,
    );
  }

  // Determine base eave height
  const knownHeights = localSegments
    .map((s) => s.raw.planeHeightAtCenterMeters)
    .filter((h): h is number => h !== undefined);
  const baseEaveHeight = knownHeights.length > 0 ? Math.min(...knownHeights) : DEFAULT_EAVE_HEIGHT;

  return localSegments
    .filter((s) => s.polygon.length >= 3)
    .map((s) => {
      const { width, depth } = polygonExtents(s.polygon);
      const height = s.raw.planeHeightAtCenterMeters
        ?? (width / 2) * Math.tan(s.raw.pitchDegrees * DEG_TO_RAD) + baseEaveHeight;
      const pitch = s.raw.pitchDegrees < 2 ? 0 : s.raw.pitchDegrees;
      const vertices3D = tiltPolygon(s.polygon, pitch, s.raw.azimuthDegrees, height);

      return {
        polygon: s.polygon,
        vertices3D,
        pitchDegrees: pitch,
        azimuthDegrees: s.raw.azimuthDegrees,
        widthMeters: width,
        depthMeters: depth,
        center: polygonCenter(s.polygon),
      };
    });
}
