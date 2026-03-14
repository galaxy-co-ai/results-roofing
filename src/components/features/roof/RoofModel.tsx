'use client';

import { Suspense } from 'react';
import type { ProcessedFacet } from '@/lib/roof/types';
import { RoofFacet } from './RoofFacet';

interface RoofModelProps {
  facets: ProcessedFacet[];
  textureUrl: string;
}

export function RoofModel({ facets, textureUrl }: RoofModelProps) {
  if (facets.length === 0) return null;

  return (
    <Suspense fallback={null}>
      <group>
        {facets.map((facet, i) => (
          <RoofFacet key={i} facet={facet} textureUrl={textureUrl} />
        ))}
      </group>
    </Suspense>
  );
}
