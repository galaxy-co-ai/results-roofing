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

/** 2D point in local meter coordinates */
export interface Point2D {
  x: number;
  y: number;
}

/** A polygon in local 2D space (before pitch tilt) */
export type Polygon2D = Point2D[];

/** Processed facet ready for Three.js rendering */
export interface ProcessedFacet {
  polygon: Polygon2D;
  vertices3D: [number, number, number][];
  pitchDegrees: number;
  azimuthDegrees: number;
  widthMeters: number;
  depthMeters: number;
  center: Point2D;
}

/** Camera preset for the viewer */
export interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
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
  /** 3D mesh generated from DSM. Null if DSM unavailable or generation failed. */
  mesh: RoofMesh | null;
}

/** Serialized triangle mesh for 3D rendering */
export interface RoofMesh {
  /** Base64-encoded Float32Array — vertex positions [x,y,z, x,y,z, ...] */
  positions: string;
  /** Base64-encoded Float32Array — vertex normals [nx,ny,nz, ...] */
  normals: string;
  /** Base64-encoded Uint32Array — triangle indices [i0,i1,i2, ...] */
  indices: string;
  vertexCount: number;
  triangleCount: number;
}
