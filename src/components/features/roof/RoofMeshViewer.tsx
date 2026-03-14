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

function RoofScene({ geometry, shingleHex }: RoofMeshViewerProps) {
  const bufferGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(geometry.positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(geometry.normals, 3));
    geom.setIndex(new THREE.BufferAttribute(geometry.indices, 1));
    return geom;
  }, [geometry.positions, geometry.normals, geometry.indices]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(shingleHex),
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false,
      side: THREE.DoubleSide,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    material.color.set(shingleHex);
  }, [shingleHex, material]);

  useEffect(() => {
    return () => {
      bufferGeometry.dispose();
      material.dispose();
    };
  }, [bufferGeometry, material]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 8]} intensity={0.9} />
      <directionalLight position={[-8, 12, -6]} intensity={0.3} />

      <mesh geometry={bufferGeometry} material={material} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#e5e5e5" roughness={1} />
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
        camera={{ position: [12, 10, 12], fov: 50, near: 0.1, far: 200 }}
        style={{ background: 'var(--background, #f0f0f0)' }}
      >
        <RoofScene geometry={geometry} shingleHex={shingleHex} />
      </Canvas>
    </div>
  );
}
