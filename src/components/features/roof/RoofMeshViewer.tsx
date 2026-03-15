'use client';

import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { RoofGeometry } from '@/lib/roof/types';

interface RoofMeshViewerProps {
  geometry: RoofGeometry;
  shingleHex: string;
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

  const shingleMaterial = useMemo(() => {
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
    shingleMaterial.color.set(shingleHex);
  }, [shingleHex, shingleMaterial]);

  useEffect(() => {
    return () => {
      roofBufferGeometry.dispose();
      wallBufferGeometry.dispose();
      shingleMaterial.dispose();
    };
  }, [roofBufferGeometry, wallBufferGeometry, shingleMaterial]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#87CEEB', '#e0ddd8', 0.3]} />
      <directionalLight position={[10, 20, 8]} intensity={1.0} castShadow />
      <directionalLight position={[-8, 12, -6]} intensity={0.3} />

      <mesh geometry={roofBufferGeometry} material={shingleMaterial} />
      {wallBufferGeometry.attributes.position && (
        <mesh geometry={wallBufferGeometry}>
          <meshStandardMaterial color="#e0ddd8" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      )}

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={30}
        blur={2}
        far={20}
      />

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
