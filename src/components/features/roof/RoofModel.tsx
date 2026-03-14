'use client';

import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import type { ProcessedFacet } from '@/lib/roof/types';
import { RoofFacet } from './RoofFacet';

interface RoofModelProps {
  facets: ProcessedFacet[];
  textureUrl: string;
}

/** Flat-color fallback mesh while textures load */
function FacetFallback({ facet }: { facet: ProcessedFacet }) {
  const geometry = useMemo(() => {
    const verts = facet.vertices3D;
    if (verts.length < 3) return null;
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 1; i < verts.length - 1; i++) {
      positions.push(...verts[0], ...verts[i], ...verts[i + 1]);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, [facet.vertices3D]);

  if (!geometry) return null;
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#888888" side={THREE.DoubleSide} />
    </mesh>
  );
}

export function RoofModel({ facets, textureUrl }: RoofModelProps) {
  if (facets.length === 0) return null;

  // Render gray fallback meshes immediately, then overlay textured versions
  const fallback = (
    <group>
      {facets.map((facet, i) => (
        <FacetFallback key={`fb-${i}`} facet={facet} />
      ))}
    </group>
  );

  return (
    <>
      <Suspense fallback={fallback}>
        <group>
          {facets.map((facet, i) => (
            <RoofFacet key={i} facet={facet} textureUrl={textureUrl} />
          ))}
        </group>
      </Suspense>
    </>
  );
}
