'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RoofMesh } from '@/lib/roof/types';

interface RoofMeshViewerProps {
  mesh: RoofMesh;
  shingleHex: string;
}

/** Decode a base64 string into a typed array */
function decodeBase64Float32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

function decodeBase64Uint32(base64: string): Uint32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Uint32Array(bytes.buffer);
}

function RoofScene({ mesh, shingleHex }: RoofMeshViewerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const positions = decodeBase64Float32(mesh.positions);
    const normals = decodeBase64Float32(mesh.normals);
    const indices = decodeBase64Uint32(mesh.indices);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setIndex(new THREE.BufferAttribute(indices, 1));

    return geom;
  }, [mesh.positions, mesh.normals, mesh.indices]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(shingleHex),
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // material created once, color updated via useEffect

  // Update color reactively without recreating material
  useEffect(() => {
    material.color.set(shingleHex);
  }, [shingleHex, material]);

  // Dispose GPU resources on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 8]} intensity={0.8} />

      {/* Roof mesh */}
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#e5e5e5" roughness={1} />
      </mesh>

      {/* Controls */}
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

export function RoofMeshViewer({ mesh, shingleHex }: RoofMeshViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Canvas
        camera={{
          position: [12, 10, 12],
          fov: 50,
          near: 0.1,
          far: 200,
        }}
        style={{ background: 'var(--background, #f0f0f0)' }}
      >
        <RoofScene mesh={mesh} shingleHex={shingleHex} />
      </Canvas>
    </div>
  );
}
