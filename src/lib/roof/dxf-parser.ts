/**
 * Parse a DXF file string into roof facet polygons.
 *
 * Extracts 3DFACE entities (triangulated roof surfaces) from the DXF
 * and returns them as arrays of 3D vertices with computed face normals.
 */

import DxfParser from 'dxf-parser';
import type { DxfFacet } from './types';

type Vec3 = [number, number, number];

export function parseDxfToFacets(dxfText: string): DxfFacet[] {
  if (!dxfText.trim()) return [];

  const parser = new DxfParser();
  let dxf: ReturnType<DxfParser['parse']>;

  try {
    dxf = parser.parse(dxfText);
  } catch {
    return [];
  }

  if (!dxf?.entities) return [];

  const facets: DxfFacet[] = [];

  for (const entity of dxf.entities) {
    if (entity.type !== '3DFACE') continue;

    const verts = (entity as { vertices?: { x: number; y: number; z: number }[] }).vertices;
    if (!verts || verts.length < 3) continue;

    // Filter out incomplete vertices (dxf-parser sometimes appends an empty {})
    const validVerts = verts.filter(v => typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number');
    if (validVerts.length < 3) continue;

    const points: Vec3[] = validVerts.map(v => [v.x, v.y, v.z]);

    // Deduplicate 4th vertex if it matches the 3rd (triangle encoded as quad)
    if (points.length === 4) {
      const [ax, ay, az] = points[2];
      const [bx, by, bz] = points[3];
      if (Math.abs(ax - bx) < 1e-6 && Math.abs(ay - by) < 1e-6 && Math.abs(az - bz) < 1e-6) {
        points.pop();
      }
    }

    const normal = computeNormal(points[0], points[1], points[2]);
    facets.push({ vertices: points, normal });
  }

  return facets;
}

function computeNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
  const acx = c[0] - a[0], acy = c[1] - a[1], acz = c[2] - a[2];

  const nx = aby * acz - abz * acy;
  const ny = abz * acx - abx * acz;
  const nz = abx * acy - aby * acx;

  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len < 1e-10) return [0, 1, 0];

  return [nx / len, ny / len, nz / len];
}
