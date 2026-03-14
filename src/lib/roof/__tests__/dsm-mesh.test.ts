import { describe, it, expect } from 'vitest';
import { generateRoofMesh } from '../dsm-mesh';

// 4x4 elevation grid: a simple pitched roof shape
const DSM_4x4 = new Float32Array([
  10, 11, 11, 10,
  11, 12, 12, 11,
  11, 12, 12, 11,
  10, 11, 11, 10,
]);

// Full mask — all pixels are roof
const MASK_ALL = new Uint8Array([
  255, 255, 255, 255,
  255, 255, 255, 255,
  255, 255, 255, 255,
  255, 255, 255, 255,
]);

// Partial mask — only center 2x2 are roof
const MASK_CENTER = new Uint8Array([
  0, 0, 0, 0,
  0, 255, 255, 0,
  0, 255, 255, 0,
  0, 0, 0, 0,
]);

describe('generateRoofMesh', () => {
  it('returns positions, normals, and indices arrays', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1);
    expect(result).not.toBeNull();
    expect(result!.positions).toBeInstanceOf(Float32Array);
    expect(result!.normals).toBeInstanceOf(Float32Array);
    expect(result!.indices).toBeInstanceOf(Uint32Array);
  });

  it('positions length is 3x vertex count', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;
    expect(result.positions.length).toBe(result.vertexCount * 3);
    expect(result.normals.length).toBe(result.vertexCount * 3);
  });

  it('indices length is 3x triangle count', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;
    expect(result.indices.length).toBe(result.triangleCount * 3);
  });

  it('all indices reference valid vertices', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;
    for (let i = 0; i < result.indices.length; i++) {
      expect(result.indices[i]).toBeLessThan(result.vertexCount);
    }
  });

  it('4x4 grid with step=1 produces 4x4=16 vertices and (3*3*2)=18 triangles', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;
    expect(result.vertexCount).toBe(16);
    expect(result.triangleCount).toBe(18);
  });

  it('partial mask produces fewer vertices and triangles', () => {
    const full = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;
    const partial = generateRoofMesh(DSM_4x4, MASK_CENTER, 4, 4, 1)!;
    expect(partial.vertexCount).toBeLessThan(full.vertexCount);
    expect(partial.triangleCount).toBeLessThan(full.triangleCount);
  });

  it('decimation with step=2 reduces vertex count', () => {
    const dsm8 = new Float32Array(64).fill(10);
    const mask8 = new Uint8Array(64).fill(255);
    const full = generateRoofMesh(dsm8, mask8, 8, 8, 1)!;
    const decimated = generateRoofMesh(dsm8, mask8, 8, 8, 2)!;
    expect(decimated.vertexCount).toBeLessThan(full.vertexCount);
  });

  it('returns null when mask has zero roof pixels', () => {
    const emptyMask = new Uint8Array(16).fill(0);
    const result = generateRoofMesh(DSM_4x4, emptyMask, 4, 4, 1);
    expect(result).toBeNull();
  });

  it('returns null for 1x1 grid (cannot form triangles)', () => {
    const result = generateRoofMesh(new Float32Array([10]), new Uint8Array([255]), 1, 1, 1);
    expect(result).toBeNull();
  });

  it('returns null when step exceeds grid dimensions', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 8);
    expect(result).toBeNull();
  });

  it('skips triangles where any vertex has NaN elevation', () => {
    const dsmWithNaN = new Float32Array([
      10, 11, 11, 10,
      11, NaN, 12, 11,
      11, 12, 12, 11,
      10, 11, 11, 10,
    ]);
    const result = generateRoofMesh(dsmWithNaN, MASK_ALL, 4, 4, 1)!;
    expect(result.triangleCount).toBeLessThan(18);
    for (let i = 0; i < result.positions.length; i++) {
      expect(Number.isFinite(result.positions[i])).toBe(true);
    }
  });

  it('normalizes mesh to be centered at origin', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < result.positions.length; i += 3) {
      minX = Math.min(minX, result.positions[i]);
      maxX = Math.max(maxX, result.positions[i]);
      minZ = Math.min(minZ, result.positions[i + 2]);
      maxZ = Math.max(maxZ, result.positions[i + 2]);
    }
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    expect(Math.abs(centerX)).toBeLessThan(0.01);
    expect(Math.abs(centerZ)).toBeLessThan(0.01);
  });

  it('normals have unit length', () => {
    const result = generateRoofMesh(DSM_4x4, MASK_ALL, 4, 4, 1)!;
    for (let i = 0; i < result.normals.length; i += 3) {
      const nx = result.normals[i];
      const ny = result.normals[i + 1];
      const nz = result.normals[i + 2];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      expect(len).toBeCloseTo(1.0, 2);
    }
  });
});
