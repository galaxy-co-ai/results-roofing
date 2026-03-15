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
 * Generate a tileable shingle texture with visible individual tabs.
 * High contrast so the pattern reads clearly from any zoom level.
 */
function createShingleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base fill — mid gray
  ctx.fillStyle = '#787878';
  ctx.fillRect(0, 0, size, size);

  const tabHeight = 40;
  const tabWidth = 85;
  const rows = Math.ceil(size / tabHeight) + 1;

  for (let row = 0; row < rows; row++) {
    const y = row * tabHeight;
    const offset = row % 2 === 0 ? 0 : tabWidth * 0.5;
    const cols = Math.ceil(size / tabWidth) + 2;

    for (let col = -1; col < cols; col++) {
      const x = col * tabWidth + offset;

      // Individual shingle tab — slight brightness variation
      const base = 115 + Math.floor(Math.random() * 30); // 115-145
      ctx.fillStyle = `rgb(${base},${base},${base})`;
      ctx.fillRect(x + 1, y + 1, tabWidth - 2, tabHeight - 2);

      // Exposed tab edge (bottom) — darker shadow line
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.fillRect(x, y + tabHeight - 3, tabWidth, 3);

      // Top highlight — catches light
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x + 1, y + 1, tabWidth - 2, 2);

      // Vertical gap between tabs
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x - 1, y, 2, tabHeight);

      // Granular texture within each tab
      for (let py = y + 3; py < y + tabHeight - 3; py += 3) {
        for (let px = x + 2; px < x + tabWidth - 2; px += 3) {
          const grain = Math.random();
          if (grain > 0.6) {
            ctx.fillStyle = `rgba(0,0,0,${grain * 0.12})`;
            ctx.fillRect(px, py, 2, 2);
          } else if (grain < 0.15) {
            ctx.fillStyle = `rgba(255,255,255,${0.06})`;
            ctx.fillRect(px, py, 2, 1);
          }
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 8;
  return texture;
}

function RoofScene({ geometry, shingleHex }: RoofMeshViewerProps) {
  const roofBufferGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(geometry.roof.positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(geometry.roof.normals, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(geometry.roof.uvs, 2));
    geom.setIndex(new THREE.BufferAttribute(geometry.roof.indices, 1));
    return geom;
  }, [geometry.roof.positions, geometry.roof.normals, geometry.roof.uvs, geometry.roof.indices]);

  const wallBufferGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    if (geometry.walls.positions.length > 0) {
      geom.setAttribute('position', new THREE.BufferAttribute(geometry.walls.positions, 3));
      geom.setAttribute('normal', new THREE.BufferAttribute(geometry.walls.normals, 3));
      geom.setAttribute('uv', new THREE.BufferAttribute(geometry.walls.uvs, 2));
      geom.setIndex(new THREE.BufferAttribute(geometry.walls.indices, 1));
    }
    return geom;
  }, [geometry.walls.positions, geometry.walls.normals, geometry.walls.uvs, geometry.walls.indices]);

  const edgeGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    if (geometry.edges.positions.length > 0) {
      geom.setAttribute('position', new THREE.BufferAttribute(geometry.edges.positions, 3));
    }
    return geom;
  }, [geometry.edges.positions]);

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
      edgeGeometry.dispose();
      shingleMaterial.dispose();
      shingleTexture.dispose();
    };
  }, [roofBufferGeometry, wallBufferGeometry, edgeGeometry, shingleMaterial, shingleTexture]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#87CEEB', '#e0ddd8', 0.4]} />
      <directionalLight position={[10, 20, 8]} intensity={1.0} />
      <directionalLight position={[-8, 12, -6]} intensity={0.4} />

      {/* Roof — textured shingle material */}
      <mesh geometry={roofBufferGeometry} material={shingleMaterial} />

      {/* Walls — neutral siding color */}
      {wallBufferGeometry.attributes.position && (
        <mesh geometry={wallBufferGeometry}>
          <meshStandardMaterial color="#e0ddd8" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* White edge trim along eaves/ridges */}
      {edgeGeometry.attributes.position && (
        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial color="#ffffff" linewidth={2} />
        </lineSegments>
      )}

      {/* Ground shadow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
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
