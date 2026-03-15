'use client';

import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RoofGeometry } from '@/lib/roof/types';

interface RoofMeshViewerProps {
  geometry: RoofGeometry;
  shingleHex: string;
}

/**
 * Generate a tileable shingle pattern on an offscreen canvas.
 * Returns a Three.js CanvasTexture ready for use as a bump/detail map.
 * The texture is grayscale — color comes from the material's `color` property.
 */
function createShingleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base fill — neutral gray (will be tinted by material color)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const rowHeight = 32; // px per shingle row
  const rows = Math.ceil(size / rowHeight);
  const shingleWidth = 64;

  for (let row = 0; row < rows; row++) {
    const y = row * rowHeight;
    const offset = row % 2 === 0 ? 0 : shingleWidth / 2; // staggered brick pattern

    // Subtle row shadow line (bottom edge of each shingle)
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, y + rowHeight - 2, size, 2);

    // Subtle highlight line (top edge)
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, y, size, 1);

    // Vertical seams between shingles
    const cols = Math.ceil(size / shingleWidth) + 1;
    for (let col = 0; col < cols; col++) {
      const x = col * shingleWidth + offset;

      // Vertical seam line
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fillRect(x - 1, y, 2, rowHeight);

      // Per-shingle subtle noise variation
      const brightness = 0.95 + Math.random() * 0.10; // 0.95–1.05
      const gray = Math.round(128 * brightness);
      ctx.fillStyle = `rgba(${gray},${gray},${gray},0.15)`;
      ctx.fillRect(x + 2, y + 2, shingleWidth - 5, rowHeight - 4);
    }

    // Add some granular noise across the row for texture depth
    for (let px = 0; px < size; px += 4) {
      const noise = Math.random() * 0.08;
      ctx.fillStyle = `rgba(0,0,0,${noise})`;
      ctx.fillRect(px, y, 4, rowHeight);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.anisotropy = 4;
  return texture;
}

function RoofScene({ geometry, shingleHex }: RoofMeshViewerProps) {
  const roofBufferGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(geometry.roof.positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(geometry.roof.normals, 3));
    geom.setIndex(new THREE.BufferAttribute(geometry.roof.indices, 1));
    return geom;
  }, [geometry.roof.positions, geometry.roof.normals, geometry.roof.indices]);

  const wallBufferGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    if (geometry.walls.positions.length > 0) {
      geom.setAttribute('position', new THREE.BufferAttribute(geometry.walls.positions, 3));
      geom.setAttribute('normal', new THREE.BufferAttribute(geometry.walls.normals, 3));
      geom.setIndex(new THREE.BufferAttribute(geometry.walls.indices, 1));
    }
    return geom;
  }, [geometry.walls.positions, geometry.walls.normals, geometry.walls.indices]);

  const shingleTexture = useMemo(() => createShingleTexture(), []);

  const shingleMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(shingleHex),
      map: shingleTexture,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false,
      side: THREE.DoubleSide,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shingleTexture]);

  useEffect(() => {
    shingleMaterial.color.set(shingleHex);
  }, [shingleHex, shingleMaterial]);

  useEffect(() => {
    return () => {
      roofBufferGeometry.dispose();
      wallBufferGeometry.dispose();
      shingleMaterial.dispose();
      shingleTexture.dispose();
    };
  }, [roofBufferGeometry, wallBufferGeometry, shingleMaterial, shingleTexture]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#87CEEB', '#e0ddd8', 0.4]} />
      <directionalLight position={[10, 20, 8]} intensity={1.0} />
      <directionalLight position={[-8, 12, -6]} intensity={0.4} />

      <mesh geometry={roofBufferGeometry} material={shingleMaterial} />
      {wallBufferGeometry.attributes.position && (
        <mesh geometry={wallBufferGeometry}>
          <meshStandardMaterial color="#e0ddd8" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.15} />
      </mesh>

      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export function RoofMeshViewer({ geometry, shingleHex }: RoofMeshViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Canvas
        camera={{ position: [15, 12, 15], fov: 45, near: 0.1, far: 200 }}
        style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #dbe9f4 100%)' }}
      >
        <RoofScene geometry={geometry} shingleHex={shingleHex} />
      </Canvas>
    </div>
  );
}
