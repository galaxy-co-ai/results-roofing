/** Raw segment from Google Solar roofSegmentStats */
export interface RawRoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  stats: { areaMeters2: number };
  center?: { latitude: number; longitude: number };
  boundingBox?: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
  planeHeightAtCenterMeters?: number;
}

/** Shingle option for the catalog */
export interface ShingleOption {
  id: string;
  tier: 'good' | 'better' | 'best';
  name: string;
  hex: string;
  texture: string;
  brand: string;
}

/** Parsed 3D face from a DXF file */
export interface DxfFacet {
  vertices: [number, number, number][]; // [x, y, z] per vertex (3 or 4 points)
  normal: [number, number, number];     // unit normal of the face plane
}

/** Response from /api/portal/roof-data */
export interface RoofDataResponse {
  segments: RawRoofSegment[];
  buildingCenter: { lat: number; lng: number };
  buildingBoundingBox: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  } | null;
  stats: {
    sqftTotal: number;
    pitchPrimary: string;
    facetCount: number;
    vendor: string;
  };
  /** Satellite image + roof mask for canvas rendering. Null if not yet fetched or unavailable. */
  layers: RoofLayers | null;
  /** GAF QuickMeasure order status */
  gafStatus: 'pending' | 'complete' | 'failed' | 'none';
  /** URL to DXF file in Vercel Blob (null if not yet available) */
  gafDxfUrl: string | null;
  /** All GAF asset URLs keyed by asset type */
  gafAssets: Record<string, string> | null;
}

/** Cached roof visualization layers from Google Solar Data Layers API */
export interface RoofLayers {
  /** Base64-encoded PNG — cropped satellite image */
  rgb: string;
  /** Base64-encoded PNG — binary roof mask */
  mask: string;
  /** Image dimensions in pixels */
  width: number;
  height: number;
  /** Geographic bounds of the cropped area */
  bounds: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
}

/** Geometry output from the parametric facet engine — ready for Three.js */
export interface RoofGeometry {
  positions: Float32Array;   // [x,y,z, ...] — centered at origin, ~15 units span
  normals: Float32Array;     // [nx,ny,nz, ...] — per-vertex
  indices: Uint32Array;      // [i0,i1,i2, ...] — triangles
  vertexCount: number;
  triangleCount: number;
  facetCount: number;
}
