'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

/* ─── Types ────────────────────────────────────────────────────── */

interface LayerData {
  name: string;
  color: string;
  description: string;
  detail: string;
  yOffset: number;
  thickness: number;
}

/* ─── Layer Config ─────────────────────────────────────────────── */

const LAYERS: LayerData[] = [
  {
    name: 'Roof Decking',
    color: '#C4A882',
    description: 'The structural foundation',
    detail: '½" plywood sheathing nailed to the rafters. This is what everything else sits on.',
    yOffset: 0,
    thickness: 0.06,
  },
  {
    name: 'Ice & Water Shield',
    color: '#2D3748',
    description: 'The first line of defense',
    detail: 'Self-adhering membrane along eaves, valleys, and penetrations. Prevents ice dam leaks.',
    yOffset: 0.07,
    thickness: 0.02,
  },
  {
    name: 'Synthetic Underlayment',
    color: '#718096',
    description: 'The moisture barrier',
    detail: 'Covers the entire deck. If a shingle fails, this layer keeps water out.',
    yOffset: 0.1,
    thickness: 0.02,
  },
  {
    name: 'Starter Strip',
    color: '#1A202C',
    description: 'The seal at the edge',
    detail: 'Adhesive-backed strip along the eaves. Seals the first row of shingles against wind uplift.',
    yOffset: 0.13,
    thickness: 0.02,
  },
  {
    name: 'Shingles',
    color: '#4A5568',
    description: 'The weather shield',
    detail: 'Architectural laminated shingles. 130mph wind rating, 25-year algae resistance.',
    yOffset: 0.16,
    thickness: 0.04,
  },
  {
    name: 'Ridge Vent & Cap',
    color: '#2B6CB0',
    description: 'The finishing touch',
    detail: 'Continuous ridge ventilation with matching cap shingles. Balances attic airflow.',
    yOffset: 0.21,
    thickness: 0.03,
  },
];

/* ─── Scroll State (shared between DOM + 3D) ──────────────────── */

const scrollState = {
  progress: 0,
  activeLayer: -1,
};

/* ─── 3D Roof Layer Mesh ───────────────────────────────────────── */

function RoofLayer({
  layer,
  index,
}: {
  layer: LayerData;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Roof panel dimensions (pitched roof shape using a simple box for now)
  const width = 4;
  const depth = 3;

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const layerProgress = index / LAYERS.length;
    const layerEnd = (index + 1) / LAYERS.length;
    const current = scrollState.progress;

    // Layer appears when scroll reaches its threshold
    const appear = Math.max(0, Math.min(1, (current - layerProgress) / (layerEnd - layerProgress)));

    // Animate Y position: starts 2 units above, drops to final position
    const targetY = layer.yOffset;
    const startY = targetY + 2;
    meshRef.current.position.y = THREE.MathUtils.lerp(startY, targetY, easeOutCubic(appear));

    // Opacity
    materialRef.current.opacity = appear;
    materialRef.current.transparent = true;
  });

  return (
    <mesh ref={meshRef} position={[0, layer.yOffset + 2, 0]}>
      <boxGeometry args={[width, layer.thickness, depth]} />
      <meshStandardMaterial
        ref={materialRef}
        color={layer.color}
        opacity={0}
        transparent
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

/* ─── House Body (static) ──────────────────────────────────────── */

function HouseBody() {
  return (
    <group position={[0, -1.2, 0]}>
      {/* Main walls */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[3.8, 1.2, 2.8]} />
        <meshStandardMaterial color="#E8E0D4" roughness={0.9} />
      </mesh>

      {/* Front door */}
      <mesh position={[0, 0.35, 1.41]}>
        <boxGeometry args={[0.5, 0.7, 0.02]} />
        <meshStandardMaterial color="#5D4E37" roughness={0.7} />
      </mesh>

      {/* Windows */}
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x, 0.7, 1.41]}>
          <boxGeometry args={[0.5, 0.4, 0.02]} />
          <meshStandardMaterial color="#A7C7E7" roughness={0.3} metalness={0.1} />
        </mesh>
      ))}

      {/* Foundation */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[4.2, 0.1, 3.2]} />
        <meshStandardMaterial color="#9E9E9E" roughness={1} />
      </mesh>
    </group>
  );
}

/* ─── Rafters (visible before decking) ─────────────────────────── */

function Rafters() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Fade rafters as first layer appears
    const fadeOut = Math.max(0, 1 - scrollState.progress * LAYERS.length * 0.8);
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.opacity = fadeOut;
        child.material.transparent = true;
      }
    });
  });

  const rafterPositions = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5];

  return (
    <group ref={groupRef} position={[0, -0.05, 0]}>
      {rafterPositions.map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.08, 0.12, 3]} />
          <meshStandardMaterial color="#B8956A" roughness={0.9} transparent />
        </mesh>
      ))}
      {/* Ridge beam */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[4, 0.08, 0.1]} />
        <meshStandardMaterial color="#A07850" roughness={0.9} transparent />
      </mesh>
    </group>
  );
}

/* ─── Camera Controller ────────────────────────────────────────── */

function CameraController() {
  const { camera } = useThree();

  useFrame(() => {
    const p = scrollState.progress;

    // Orbit camera gently as user scrolls
    const angle = -Math.PI / 6 + p * Math.PI * 0.35;
    const radius = 6;
    const height = 2.5 + p * 1.5;

    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = height;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Scene ────────────────────────────────────────────────────── */

function Scene() {
  return (
    <>
      <CameraController />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />

      <HouseBody />
      <Rafters />

      {LAYERS.map((layer, i) => (
        <RoofLayer key={layer.name} layer={layer} index={i} />
      ))}

      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
      <Environment preset="city" />
    </>
  );
}

/* ─── Easing ───────────────────────────────────────────────────── */

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* ─── Layer Info Panel ─────────────────────────────────────────── */

function LayerInfoPanel({ activeLayer }: { activeLayer: number }) {
  if (activeLayer < 0 || activeLayer >= LAYERS.length) return null;

  const layer = LAYERS[activeLayer];
  const layerNumber = activeLayer + 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: 48,
        top: '50%',
        transform: 'translateY(-50%)',
        maxWidth: 340,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          padding: '28px 32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#2563EB',
            marginBottom: 8,
          }}
        >
          Layer {layerNumber} of {LAYERS.length}
        </div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1E2329',
            margin: '0 0 8px 0',
            lineHeight: 1.2,
          }}
        >
          {layer.name}
        </h2>
        <p
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: '#4A5568',
            margin: '0 0 12px 0',
          }}
        >
          {layer.description}
        </p>
        <p
          style={{
            fontSize: 14,
            color: '#6B7280',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {layer.detail}
        </p>
      </div>
    </div>
  );
}

/* ─── Scroll Progress Bar ──────────────────────────────────────── */

function ScrollProgressBar({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 32,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 4,
        height: 200,
        background: 'rgba(0,0,0,0.08)',
        borderRadius: 2,
        zIndex: 10,
      }}
    >
      {/* Track markers for each layer */}
      {LAYERS.map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: -3,
            top: `${(i / LAYERS.length) * 100}%`,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: progress >= i / LAYERS.length ? '#2563EB' : 'rgba(0,0,0,0.15)',
            transition: 'background 300ms',
          }}
        />
      ))}

      {/* Fill */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: `${progress * 100}%`,
          background: '#2563EB',
          borderRadius: 2,
          transformOrigin: 'bottom',
          transition: 'height 100ms',
        }}
      />
    </div>
  );
}

/* ─── Main Experience ──────────────────────────────────────────── */

export default function RoofBuildExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeLayer, setActiveLayer] = useState(-1);

  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        scrollState.progress = self.progress;
        scrollState.activeLayer = Math.floor(self.progress * LAYERS.length);
        setProgress(self.progress);
        setActiveLayer(Math.floor(self.progress * LAYERS.length));
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <>
      {/* Scroll container — height determines scroll duration */}
      <div
        ref={containerRef}
        style={{
          height: `${(LAYERS.length + 1) * 100}vh`,
          position: 'relative',
        }}
      >
        {/* Sticky viewport */}
        <div
          ref={stickyRef}
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            background: '#F7F9FC',
          }}
        >
          {/* 3D Canvas */}
          <Canvas
            camera={{ position: [4, 3, 5], fov: 40 }}
            style={{ width: '100%', height: '100%' }}
            dpr={[1, 2]}
          >
            <Scene />
          </Canvas>

          {/* Layer info overlay */}
          <LayerInfoPanel activeLayer={activeLayer} />

          {/* Progress indicator */}
          <ScrollProgressBar progress={progress} />

          {/* Title overlay */}
          <div
            style={{
              position: 'absolute',
              top: 32,
              left: 48,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#2563EB',
                marginBottom: 6,
              }}
            >
              Results Roofing
            </div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#1E2329',
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              What&apos;s Inside
              <br />
              Your Roof
            </h1>
          </div>

          {/* Scroll hint */}
          {progress < 0.05 && (
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                textAlign: 'center',
                color: '#6B7280',
                fontSize: 13,
                fontWeight: 500,
                opacity: 1 - progress * 20,
                transition: 'opacity 300ms',
                pointerEvents: 'none',
              }}
            >
              <div style={{ marginBottom: 8 }}>Scroll to build</div>
              <div
                style={{
                  width: 20,
                  height: 32,
                  border: '2px solid #6B7280',
                  borderRadius: 10,
                  margin: '0 auto',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 8,
                    background: '#6B7280',
                    borderRadius: 2,
                    position: 'absolute',
                    left: '50%',
                    top: 6,
                    transform: 'translateX(-50%)',
                    animation: 'scrollPulse 2s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          )}

          {/* Completion state */}
          {progress > 0.95 && (
            <div
              style={{
                position: 'absolute',
                bottom: 48,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                textAlign: 'center',
                pointerEvents: 'auto',
              }}
            >
              <div
                style={{
                  background: '#2563EB',
                  color: '#fff',
                  padding: '14px 32px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                }}
              >
                Get Your Instant Quote &rarr;
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
          50% { transform: translateX(-50%) translateY(8px); opacity: 0.4; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>
    </>
  );
}
