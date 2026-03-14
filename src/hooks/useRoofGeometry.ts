import { useMemo } from 'react';
import { processSegments } from '@/lib/roof/geometry';
import { RoofSegmentsArraySchema } from '@/lib/roof/schema';
import type { ProcessedFacet } from '@/lib/roof/types';

export function useRoofGeometry(
  segments: unknown[] | undefined,
  buildingCenter: { lat: number; lng: number } | undefined,
): ProcessedFacet[] {
  return useMemo(() => {
    if (!segments || !buildingCenter || segments.length === 0) return [];

    const parsed = RoofSegmentsArraySchema.safeParse(segments);
    if (!parsed.success) {
      console.error('[useRoofGeometry] Invalid segment data:', parsed.error.message);
      return [];
    }

    try {
      return processSegments(parsed.data, {
        latitude: buildingCenter.lat,
        longitude: buildingCenter.lng,
      });
    } catch (err) {
      console.error('[useRoofGeometry] Failed to process segments:', err);
      return [];
    }
  }, [segments, buildingCenter]);
}
