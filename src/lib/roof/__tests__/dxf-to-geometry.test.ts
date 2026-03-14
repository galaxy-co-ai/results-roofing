import { describe, it, expect } from 'vitest';
import { buildGeometryFromFacets } from '../dxf-to-geometry';
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
    expect(geo.positions.length).toBe(geo.vertexCount * 3);
    expect(geo.normals.length).toBe(geo.vertexCount * 3);
    expect(geo.indices.length).toBe(geo.triangleCount * 3);
  });

  it('includes wall geometry (more triangles than just roof)', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    expect(geo.triangleCount).toBeGreaterThan(2);
  });

  it('mesh is centered at origin', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < geo.positions.length; i += 3) {
      minX = Math.min(minX, geo.positions[i]);
      maxX = Math.max(maxX, geo.positions[i]);
      minZ = Math.min(minZ, geo.positions[i + 2]);
      maxZ = Math.max(maxZ, geo.positions[i + 2]);
    }
    expect(Math.abs((minX + maxX) / 2)).toBeLessThan(0.5);
    expect(Math.abs((minZ + maxZ) / 2)).toBeLessThan(0.5);
  });

  it('walls extend down to Y=0', () => {
    const geo = buildGeometryFromFacets(flatFacet)!;
    let minY = Infinity;
    for (let i = 1; i < geo.positions.length; i += 3) {
      minY = Math.min(minY, geo.positions[i]);
    }
    expect(minY).toBeCloseTo(0, 0);
  });

  it('normals have unit length', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    for (let i = 0; i < geo.normals.length; i += 3) {
      const len = Math.sqrt(
        geo.normals[i] ** 2 + geo.normals[i + 1] ** 2 + geo.normals[i + 2] ** 2,
      );
      expect(len).toBeCloseTo(1.0, 2);
    }
  });

  it('all indices reference valid vertices', () => {
    const geo = buildGeometryFromFacets(gableFacets)!;
    for (let i = 0; i < geo.indices.length; i++) {
      expect(geo.indices[i]).toBeLessThan(geo.vertexCount);
    }
  });
});
