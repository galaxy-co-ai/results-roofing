'use client';

import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { CameraControls as CameraControlsType } from '@react-three/drei';
import type { ProcessedFacet } from '@/lib/roof/types';
import { getAllTextureUrls } from '@/lib/roof/shingle-catalog';
import { RoofModel } from './RoofModel';
import { CameraSetup, CameraPresetsBar } from './CameraPresets';

// Preload all shingle textures at module scope (runs once when module loads)
getAllTextureUrls().forEach((url) => useTexture.preload(url));

interface RoofViewerProps {
  facets: ProcessedFacet[];
  textureUrl: string;
}

export default function RoofViewer({ facets, textureUrl }: RoofViewerProps) {
  const controlsRef = useRef<CameraControlsType | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0, borderRadius: '12px', overflow: 'hidden' }}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ fov: 45, near: 0.1, far: 200 }}
          role="img"
          aria-label="3D model of your roof"
          style={{ background: 'linear-gradient(180deg, #e0e8f0 0%, #f5f7fa 100%)' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[15, 20, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#c8d6c0" />
          </mesh>
          <RoofModel facets={facets} textureUrl={textureUrl} />
          <CameraSetup controlsRef={controlsRef} />
        </Canvas>
      </div>
      <CameraPresetsBar controlsRef={controlsRef} />
    </div>
  );
}
