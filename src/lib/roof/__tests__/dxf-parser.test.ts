import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { parseDxfToFacets } from '../dxf-parser';

// Minimal DXF with a single 3DFACE (triangle)
const SINGLE_TRIANGLE_DXF = `0
SECTION
2
ENTITIES
0
3DFACE
10
0.0
20
0.0
30
0.0
11
10.0
21
0.0
31
0.0
12
5.0
22
6.0
32
0.0
13
5.0
23
6.0
33
0.0
0
ENDSEC
0
EOF`;

// DXF with two 3DFACE entities (gable roof: two sloped triangles)
const GABLE_ROOF_DXF = `0
SECTION
2
ENTITIES
0
3DFACE
10
0.0
20
0.0
30
0.0
11
10.0
21
0.0
31
0.0
12
5.0
22
4.0
32
5.0
13
5.0
23
4.0
33
5.0
0
3DFACE
10
0.0
20
0.0
30
10.0
11
10.0
21
0.0
31
10.0
12
5.0
22
4.0
32
5.0
13
5.0
23
4.0
33
5.0
0
ENDSEC
0
EOF`;

describe('parseDxfToFacets', () => {
  it('returns empty array for empty DXF', () => {
    const result = parseDxfToFacets('');
    expect(result).toEqual([]);
  });

  it('parses a single 3DFACE triangle', () => {
    const facets = parseDxfToFacets(SINGLE_TRIANGLE_DXF);
    expect(facets.length).toBe(1);
    expect(facets[0].vertices.length).toBe(3);
    expect(facets[0].vertices[0]).toEqual([0, 0, 0]);
    expect(facets[0].vertices[1]).toEqual([10, 0, 0]);
    expect(facets[0].vertices[2]).toEqual([5, 6, 0]);
  });

  it('computes unit normal for each facet', () => {
    const facets = parseDxfToFacets(SINGLE_TRIANGLE_DXF);
    const [nx, ny, nz] = facets[0].normal;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    expect(len).toBeCloseTo(1.0, 4);
  });

  it('parses multiple 3DFACE entities (gable roof)', () => {
    const facets = parseDxfToFacets(GABLE_ROOF_DXF);
    expect(facets.length).toBe(2);
    for (const f of facets) {
      const len = Math.sqrt(f.normal[0] ** 2 + f.normal[1] ** 2 + f.normal[2] ** 2);
      expect(len).toBeCloseTo(1.0, 4);
    }
  });

  it('deduplicates 4th vertex when it equals the 3rd (triangle face)', () => {
    const facets = parseDxfToFacets(SINGLE_TRIANGLE_DXF);
    expect(facets[0].vertices.length).toBe(3);
  });

  it('parses real GAF QuickMeasure DXF (POLYLINE polyface mesh)', () => {
    const dxfPath = resolve(__dirname, '../../../../docs/gaf-3815.dxf');
    const dxfText = readFileSync(dxfPath, 'utf8');
    const facets = parseDxfToFacets(dxfText);

    // GAF report for 3815 Sendera Lakes Dr has 20 roof facets
    expect(facets.length).toBe(20);

    // Each facet should have at least 3 vertices and a unit normal
    for (const f of facets) {
      expect(f.vertices.length).toBeGreaterThanOrEqual(3);
      const len = Math.sqrt(f.normal[0] ** 2 + f.normal[1] ** 2 + f.normal[2] ** 2);
      expect(len).toBeCloseTo(1.0, 4);
    }
  });
});
