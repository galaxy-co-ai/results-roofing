import { z } from 'zod';

const LatLngSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const LatLngBoxSchema = z.object({
  sw: LatLngSchema,
  ne: LatLngSchema,
});

export const RoofSegmentSchema = z.object({
  pitchDegrees: z.number(),
  azimuthDegrees: z.number(),
  stats: z.object({ areaMeters2: z.number() }),
  center: LatLngSchema.optional(),
  boundingBox: LatLngBoxSchema.optional(),
  planeHeightAtCenterMeters: z.number().optional(),
});

export const RoofSegmentsArraySchema = z.array(RoofSegmentSchema);
