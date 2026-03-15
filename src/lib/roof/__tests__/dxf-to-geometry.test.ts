import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { buildGeometryFromFacets } from '../dxf-to-geometry';
import { parseDxfToFacets } from '../dxf-parser';
import type { DxfFacet } from '../types';

const gableFacets: DxfFacet[] = [
  {
    vertices: [[0, 0, 0], [10, 0, 0], [5, 4, 5]],
    normal: [0, 0.6, -0.8],
  },
  {
    vertices: [[0, 0, 10], [10, 0, 10], [5, 4, 5]],
    normal: [0, 0.6, 0.8],
  },
];

const flatFacet: DxfFacet[] = [
  {
    vertices: [[0, 5, 0], [10, 5, 0], [10, 5, 10], [0, 5, 10]],
    normal: [0, 1, 0],
  },
];

describe('buildGeometryFromFacets', () => {
  it('returns null for empty facets', () => {
    expect(buildGeometryFromFacets([])).toBeNull();
  });

  it('produces valid geometry from gable roof', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    expect(geo).not.toBeNull();
    expect(geo.facetCount).toBe(2);

    const totalVertexCount = geo.roof.vertexCount + geo.walls.vertexCount;
    const totalTriangleCount = geo.roof.triangleCount + geo.walls.triangleCount;

    expect(geo.roof.positions.length).toBe(geo.roof.vertexCount * 3);
    expect(geo.roof.normals.length).toBe(geo.roof.vertexCount * 3);
    expect(geo.roof.uvs.length).toBe(geo.roof.vertexCount * 2);
    expect(geo.roof.indices.length).toBe(geo.roof.triangleCount * 3);

    expect(geo.walls.positions.length).toBe(geo.walls.vertexCount * 3);
    expect(geo.walls.normals.length).toBe(geo.walls.vertexCount * 3);
    expect(geo.walls.uvs.length).toBe(geo.walls.vertexCount * 2);
    expect(geo.walls.indices.length).toBe(geo.walls.triangleCount * 3);

    // Edge geometry exists
    expect(geo.edges.positions.length).toBeGreaterThan(0);
    expect(geo.edges.vertexCount).toBe(geo.edges.positions.length / 3);

    // Sanity: totals are consistent
    expect(totalVertexCount).toBeGreaterThan(0);
    expect(totalTriangleCount).toBeGreaterThan(0);
  });

  it('includes wall geometry (more triangles than just roof)', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    expect(geo.walls.triangleCount).toBeGreaterThan(0);
  });

  it('mesh is centered at origin', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const positions of [geo.roof.positions, geo.walls.positions]) {
      for (let i = 0; i < positions.length; i += 3) {
        minX = Math.min(minX, positions[i]);
        maxX = Math.max(maxX, positions[i]);
        minZ = Math.min(minZ, positions[i + 2]);
        maxZ = Math.max(maxZ, positions[i + 2]);
      }
    }
    expect(Math.abs((minX + maxX) / 2)).toBeLessThan(0.5);
    expect(Math.abs((minZ + maxZ) / 2)).toBeLessThan(0.5);
  });

  it('walls extend down to Y=0', () => {
    const geo = buildGeometryFromFacets(flatFacet)!;
    let minY = Infinity;
    for (let i = 1; i < geo.walls.positions.length; i += 3) {
      minY = Math.min(minY, geo.walls.positions[i]);
    }
    expect(minY).toBeCloseTo(0, 0);
  });

  it('normals have unit length', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    for (const normals of [geo.roof.normals, geo.walls.normals]) {
      for (let i = 0; i < normals.length; i += 3) {
        const len = Math.sqrt(
          normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2,
        );
        expect(len).toBeCloseTo(1.0, 2);
      }
    }
  });

  it('all indices reference valid vertices', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    for (let i = 0; i < geo.roof.indices.length; i++) {
      expect(geo.roof.indices[i]).toBeLessThan(geo.roof.vertexCount);
    }
    for (let i = 0; i < geo.walls.indices.length; i++) {
      expect(geo.walls.indices[i]).toBeLessThan(geo.walls.vertexCount);
    }
  });

  it('builds complete geometry from real GAF DXF (3815 Sendera Lakes)', () => {
    const dxfPath = resolve(__dirname, '../../../../docs/gaf-3815.dxf');
    const dxfText = readFileSync(dxfPath, 'utf8');
    const facets = parseDxfToFacets(dxfText);
    const geo = buildGeometryFromFacets(facets)!;

    expect(geo).not.toBeNull();
    expect(geo.facetCount).toBe(20);

    const totalVertexCount = geo.roof.vertexCount + geo.walls.vertexCount;
    const totalTriangleCount = geo.roof.triangleCount + geo.walls.triangleCount;

    expect(totalVertexCount).toBeGreaterThan(100); // 20 facets + walls
    expect(totalTriangleCount).toBeGreaterThan(40);

    expect(geo.roof.positions.length).toBe(geo.roof.vertexCount * 3);
    expect(geo.roof.normals.length).toBe(geo.roof.vertexCount * 3);
    expect(geo.roof.uvs.length).toBe(geo.roof.vertexCount * 2);
    expect(geo.roof.indices.length).toBe(geo.roof.triangleCount * 3);

    expect(geo.walls.positions.length).toBe(geo.walls.vertexCount * 3);
    expect(geo.walls.normals.length).toBe(geo.walls.vertexCount * 3);
    expect(geo.walls.uvs.length).toBe(geo.walls.vertexCount * 2);
    expect(geo.walls.indices.length).toBe(geo.walls.triangleCount * 3);

    expect(geo.edges.positions.length).toBeGreaterThan(0);

    // All indices valid
    for (let i = 0; i < geo.roof.indices.length; i++) {
      expect(geo.roof.indices[i]).toBeLessThan(geo.roof.vertexCount);
    }
    for (let i = 0; i < geo.walls.indices.length; i++) {
      expect(geo.walls.indices[i]).toBeLessThan(geo.walls.vertexCount);
    }
  });
});
