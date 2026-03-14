'use client';

import { useState } from 'react';

interface RoofImageViewerProps {
  buildingCenter: { lat: number; lng: number };
  shingleHex: string;
  shingleName: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const ZOOM = 20; // Roof-level zoom
const IMG_WIDTH = 800;
const IMG_HEIGHT = 600;

function getMapboxSatelliteUrl(lat: number, lng: number): string {
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${ZOOM},0/${IMG_WIDTH}x${IMG_HEIGHT}@2x?access_token=${MAPBOX_TOKEN}`;
}

export function RoofImageViewer({ buildingCenter, shingleHex, shingleName }: RoofImageViewerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const satelliteUrl = getMapboxSatelliteUrl(buildingCenter.lat, buildingCenter.lng);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#1a1a2e',
      }}
      role="img"
      aria-label={`Aerial view of your roof with ${shingleName} shingles`}
    >
      {/* Satellite base layer */}
      {!imageError ? (
        <img
          src={satelliteUrl}
          alt=""
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          draggable={false}
        />
      ) : (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--rr-color-muted)',
          fontSize: '0.875rem',
        }}>
          Satellite image unavailable
        </div>
      )}

      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Shingle color overlay */}
      {imageLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: shingleHex,
            opacity: 0.35,
            mixBlendMode: 'color',
            pointerEvents: 'none',
            transition: 'background 0.3s ease',
          }}
        />
      )}

      {/* Color indicator badge */}
      {imageLoaded && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 500,
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: shingleHex,
            border: '1.5px solid rgba(255,255,255,0.5)',
          }} />
          {shingleName}
        </div>
      )}

      {/* Satellite attribution */}
      {imageLoaded && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          fontSize: '0.625rem',
          color: 'rgba(255,255,255,0.5)',
        }}>
          Imagery © Mapbox
        </div>
      )}
    </div>
  );
}
