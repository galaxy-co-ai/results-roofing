'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import type { ProcessedFacet } from '@/lib/roof/types';

interface RoofFacetProps {
  facet: ProcessedFacet;
  textureUrl: string;
}

const SHINGLE_REPEAT_SCALE = 1 / 0.3;

export function RoofFacet({ facet, textureUrl }: RoofFacetProps) {
  const texture = useTexture(textureUrl);

  useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(
      facet.widthMeters * SHINGLE_REPEAT_SCALE,
      facet.depthMeters * SHINGLE_REPEAT_SCALE,
    );
    texture.needsUpdate = true;
  }, [texture, facet.widthMeters, facet.depthMeters]);

  const geometry = useMemo(() => {
    const verts = facet.vertices3D;
    if (verts.length < 3) return null;

    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];

    // Triangulate as a fan from vertex 0
    for (let i = 1; i < verts.length - 1; i++) {
      positions.push(...verts[0], ...verts[i], ...verts[i + 1]);
      uvs.push(0, 0);
      uvs.push((i) / (verts.length - 1), 0);
      uvs.push((i + 1) / (verts.length - 1), 1);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }, [facet.vertices3D]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
