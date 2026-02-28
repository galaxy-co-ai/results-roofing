'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   SCROLL STATE — shared mutable ref between DOM and R3F
   ================================================================ */

const scroll = { progress: 0 };

/* ================================================================
   CONSTANTS
   ================================================================ */

const DARK = '#0B0E13';
const BLUE = '#2563EB';

// Act boundaries (0-1 scroll range)
const ACT1_END = 0.15; // House emerges
const ACT2_START = 0.15;
const ACT2_END = 0.82; // Build complete
const ACT3_START = 0.82;

// Layer data
const LAYERS = [
  { name: 'Roof Decking', color: '#C4A882', y: 0, thickness: 0.06, text: 'Plywood sheathing. The structural base everything sits on.' },
  { name: 'Ice & Water Shield', color: '#2D3748', y: 0.07, thickness: 0.02, text: 'Self-adhering membrane at eaves and valleys. Stops ice dam leaks.' },
  { name: 'Underlayment', color: '#718096', y: 0.10, thickness: 0.02, text: 'Synthetic barrier covering the full deck. Your backup if a shingle fails.' },
  { name: 'Starter Strip', color: '#1A202C', y: 0.13, thickness: 0.02, text: 'Adhesive-backed edge seal. Locks the first row against wind uplift.' },
  { name: 'Shingles', color: '#4A5568', y: 0.16, thickness: 0.04, text: 'Architectural laminated shingles. 130 mph wind rating.' },
  { name: 'Ridge Vent & Cap', color: '#5A6577', y: 0.21, thickness: 0.03, text: 'Continuous ridge ventilation. Balances attic airflow year-round.' },
];

// House dimensions
const HOUSE_W = 3.8;        // Wall width (x-axis)
const HOUSE_D = 2.8;        // Wall depth (z-axis)
const WALL_H = 1.2;         // Wall height
const ROOF_PEAK = 1.0;      // Ridge height above wall top
const ROOF_OVERHANG = 0.25; // Eave overhang past walls
const ROOF_W = HOUSE_W + ROOF_OVERHANG * 2; // Total roof span
const HALF_ROOF = ROOF_W / 2;
const SLOPE_LEN = Math.sqrt(HALF_ROOF ** 2 + ROOF_PEAK ** 2);
const PITCH = Math.atan2(ROOF_PEAK, HALF_ROOF); // ~25°
const HOUSE_Y = -1.2;       // Vertical offset of house group

/* ================================================================
   EASING
   ================================================================ */

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }
function remap(value: number, inMin: number, inMax: number) { return clamp01((value - inMin) / (inMax - inMin)); }

/* ================================================================
   3D: ROOF LAYER
   ================================================================ */

function RoofLayer({ index, color, y, thickness, totalLayers }: {
  index: number; color: string; y: number; thickness: number; totalLayers: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const layerDuration = (ACT2_END - ACT2_START) / totalLayers;
  const layerStart = ACT2_START + index * layerDuration;
  const layerEnd = layerStart + layerDuration;

  useFrame(() => {
    if (!groupRef.current) return;
    const t = easeOutCubic(remap(scroll.progress, layerStart, layerEnd));

    // Drop from above
    groupRef.current.position.y = THREE.MathUtils.lerp(y + 1.8, y, t);

    // Opacity — sync both slopes
    const opacity = t;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.opacity = opacity;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, y + 1.8, 0]}>
      {/* Left slope */}
      <mesh position={[-HALF_ROOF / 2, ROOF_PEAK / 2, 0]} rotation={[0, 0, PITCH]}>
        <boxGeometry args={[SLOPE_LEN, thickness, HOUSE_D + ROOF_OVERHANG]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      {/* Right slope */}
      <mesh position={[HALF_ROOF / 2, ROOF_PEAK / 2, 0]} rotation={[0, 0, -PITCH]}>
        <boxGeometry args={[SLOPE_LEN, thickness, HOUSE_D + ROOF_OVERHANG]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

/* ================================================================
   3D: HOUSE BODY
   ================================================================ */

function HouseBody() {
  const groupRef = useRef<THREE.Group>(null);

  // Gable end triangle geometry
  const gableGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-HOUSE_W / 2, 0);
    shape.lineTo(0, ROOF_PEAK);
    shape.lineTo(HOUSE_W / 2, 0);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  // Dispose ShapeGeometry on unmount (imperative geo isn't auto-managed by R3F)
  useEffect(() => {
    return () => gableGeo.dispose();
  }, [gableGeo]);

  useFrame(() => {
    if (!groupRef.current) return;
    const appear = easeOutCubic(remap(scroll.progress, 0.02, ACT1_END));
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.opacity = appear;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, HOUSE_Y, 0]}>
      {/* Main walls */}
      <mesh position={[0, WALL_H / 2, 0]}>
        <boxGeometry args={[HOUSE_W, WALL_H, HOUSE_D]} />
        <meshStandardMaterial color="#D4CBC0" roughness={0.92} transparent opacity={0} />
      </mesh>

      {/* Gable ends (front + back) */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          geometry={gableGeo}
          position={[0, WALL_H, side * (HOUSE_D / 2)]}
          rotation={[side === 1 ? 0 : Math.PI, 0, 0]}
        >
          <meshStandardMaterial color="#D4CBC0" roughness={0.92} transparent opacity={0} />
        </mesh>
      ))}

      {/* Front door */}
      <mesh position={[0, 0.35, HOUSE_D / 2 + 0.01]}>
        <boxGeometry args={[0.5, 0.7, 0.02]} />
        <meshStandardMaterial color="#4A3C2E" roughness={0.7} transparent opacity={0} />
      </mesh>
      {/* Door frame */}
      <mesh position={[0, 0.35, HOUSE_D / 2 + 0.015]}>
        <boxGeometry args={[0.58, 0.78, 0.01]} />
        <meshStandardMaterial color="#3A2C1E" roughness={0.8} transparent opacity={0} />
      </mesh>
      {/* Door step */}
      <mesh position={[0, -0.02, HOUSE_D / 2 + 0.1]}>
        <boxGeometry args={[0.7, 0.04, 0.2]} />
        <meshStandardMaterial color="#808080" roughness={1} transparent opacity={0} />
      </mesh>

      {/* Windows (front face, flanking the door) */}
      {[-1, 1].map((x) => (
        <group key={x} position={[x * 1.1, 0.7, HOUSE_D / 2]}>
          {/* Window frame (dark wood) */}
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.56, 0.46, 0.01]} />
            <meshStandardMaterial color="#3A2C1E" roughness={0.8} transparent opacity={0} />
          </mesh>
          {/* Glass pane */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.48, 0.38, 0.01]} />
            <meshStandardMaterial color="#8FB4D9" roughness={0.3} metalness={0.1} transparent opacity={0} />
          </mesh>
          {/* Vertical mullion */}
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.03, 0.38, 0.01]} />
            <meshStandardMaterial color="#3A2C1E" roughness={0.8} transparent opacity={0} />
          </mesh>
          {/* Horizontal mullion */}
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.48, 0.03, 0.01]} />
            <meshStandardMaterial color="#3A2C1E" roughness={0.8} transparent opacity={0} />
          </mesh>
        </group>
      ))}

      {/* Foundation strip */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[HOUSE_W + 0.4, 0.1, HOUSE_D + 0.4]} />
        <meshStandardMaterial color="#606060" roughness={1} transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ================================================================
   3D: RAFTERS
   ================================================================ */

function Rafters() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Visible during Act 1, fades as first layer drops
    const appear = easeOutCubic(remap(scroll.progress, 0.04, ACT1_END));
    const fade = 1 - easeOutCubic(remap(scroll.progress, ACT2_START, ACT2_START + 0.08));
    const opacity = appear * fade;

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.opacity = opacity;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]}>
      {/* 5 trusses along depth */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((z) => (
        <group key={z} position={[0, 0, z]}>
          {/* Left rafter */}
          <mesh position={[-HALF_ROOF / 2 + 0.1, ROOF_PEAK / 2, 0]} rotation={[0, 0, PITCH]}>
            <boxGeometry args={[SLOPE_LEN * 0.9, 0.12, 0.06]} />
            <meshStandardMaterial color="#9E7E5A" roughness={0.9} transparent opacity={0} />
          </mesh>
          {/* Right rafter */}
          <mesh position={[HALF_ROOF / 2 - 0.1, ROOF_PEAK / 2, 0]} rotation={[0, 0, -PITCH]}>
            <boxGeometry args={[SLOPE_LEN * 0.9, 0.12, 0.06]} />
            <meshStandardMaterial color="#9E7E5A" roughness={0.9} transparent opacity={0} />
          </mesh>
          {/* Collar tie */}
          <mesh position={[0, ROOF_PEAK * 0.35, 0]}>
            <boxGeometry args={[HOUSE_W * 0.5, 0.06, 0.06]} />
            <meshStandardMaterial color="#8A6B48" roughness={0.9} transparent opacity={0} />
          </mesh>
        </group>
      ))}
      {/* Ridge board */}
      <mesh position={[0, ROOF_PEAK, 0]}>
        <boxGeometry args={[0.08, 0.14, HOUSE_D + 0.1]} />
        <meshStandardMaterial color="#8A6B48" roughness={0.9} transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ================================================================
   3D: RAIN PARTICLES (Act 3)
   ================================================================ */

function Rain({ count = 1200 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Random positions and speeds
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 8,
      speed: 0.04 + Math.random() * 0.06,
      offset: Math.random() * 6,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const rainOpacity = easeOutCubic(remap(scroll.progress, ACT3_START + 0.04, 1.0));
    if (rainOpacity < 0.01) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;

    const time = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const y = ((p.offset + time * p.speed * 30) % 6) - 1;

      dummy.position.set(p.x, 4 - y, p.z);
      dummy.scale.set(0.02, 0.25 + p.speed * 2, 0.02);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Fade material
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = rainOpacity * 0.8;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} visible={false}>
      <cylinderGeometry args={[0.012, 0.008, 1, 4]} />
      <meshBasicMaterial color="#A8C4E0" transparent opacity={0} />
    </instancedMesh>
  );
}

/* ================================================================
   3D: CAMERA + LIGHTING
   ================================================================ */

function CinematicCamera() {
  const { camera } = useThree();

  useFrame(() => {
    const p = scroll.progress;

    // Act 1: Start far + high, push in as house reveals
    // Act 2: Slow orbit during build
    // Act 3: Pull back to hero shot

    let radius: number, height: number, angle: number, lookY: number;

    if (p < ACT1_END) {
      // Zooming in from above
      const t = easeInOutCubic(remap(p, 0, ACT1_END));
      radius = THREE.MathUtils.lerp(10, 6, t);
      height = THREE.MathUtils.lerp(5, 2.8, t);
      angle = THREE.MathUtils.lerp(-0.3, -0.5, t);
      lookY = THREE.MathUtils.lerp(0.5, 0, t);
    } else if (p < ACT2_END) {
      // Slow orbit during build
      const t = easeInOutCubic(remap(p, ACT2_START, ACT2_END));
      radius = 6;
      height = THREE.MathUtils.lerp(2.8, 3.2, t);
      angle = THREE.MathUtils.lerp(-0.5, -0.5 + Math.PI * 0.4, t);
      lookY = THREE.MathUtils.lerp(0, 0.3, t);
    } else {
      // Pull back for hero shot
      const t = easeOutCubic(remap(p, ACT3_START, 1));
      radius = THREE.MathUtils.lerp(6, 8, t);
      height = THREE.MathUtils.lerp(3.2, 3.5, t);
      angle = THREE.MathUtils.lerp(-0.5 + Math.PI * 0.4, -0.5 + Math.PI * 0.5, t);
      lookY = THREE.MathUtils.lerp(0.3, 0, t);
    }

    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = height;
    camera.lookAt(0, lookY, 0);
  });

  return null;
}

function AtmosphericLighting() {
  const mainRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const p = scroll.progress;

    // Act 1: Very dim, cold
    // Act 2: Gradually warming
    // Act 3: Warm, brighter — sense of completion
    const warmth = easeInOutCubic(remap(p, ACT2_START, ACT3_START));
    const brightness = THREE.MathUtils.lerp(0.15, 0.5, warmth);
    const mainIntensity = THREE.MathUtils.lerp(0.4, 1.2, warmth);

    if (ambientRef.current) ambientRef.current.intensity = brightness;
    if (mainRef.current) {
      mainRef.current.intensity = mainIntensity;
      // Shift from cool to warm
      mainRef.current.color.lerpColors(
        new THREE.Color('#6B8EC2'),
        new THREE.Color('#FFF4E6'),
        warmth
      );
    }
    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.lerp(0.1, 0.3, warmth);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.15} />
      <directionalLight ref={mainRef} position={[5, 8, 5]} intensity={0.4} color="#6B8EC2" />
      <directionalLight ref={fillRef} position={[-3, 4, -2]} intensity={0.1} color="#FFE8CC" />
    </>
  );
}

/* ================================================================
   3D: SCENE
   ================================================================ */

function Scene() {
  return (
    <>
      <CinematicCamera />
      <AtmosphericLighting />
      <fog attach="fog" args={['#0B0E13', 8, 20]} />

      <HouseBody />
      <Rafters />

      {LAYERS.map((layer, i) => (
        <RoofLayer
          key={layer.name}
          index={i}
          color={layer.color}
          y={layer.y}
          thickness={layer.thickness}
          totalLayers={LAYERS.length}
        />
      ))}

      <Rain />

      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.3}
        scale={12}
        blur={2.5}
        far={4}
      />
      <Environment preset="night" />
    </>
  );
}

/* ================================================================
   DOM: CINEMATIC TEXT OVERLAYS
   ================================================================ */

function CinematicText({ progress }: { progress: number }) {
  // Act 1 text
  const act1Opacity = easeOutCubic(remap(progress, 0.04, 0.08)) *
    (1 - easeOutCubic(remap(progress, ACT1_END - 0.02, ACT1_END + 0.02)));

  // Act 2: show layer name during each layer's installation
  const layerDuration = (ACT2_END - ACT2_START) / LAYERS.length;
  const activeLayerIndex = Math.floor(remap(progress, ACT2_START, ACT2_END) * LAYERS.length);
  const clampedIndex = Math.max(0, Math.min(LAYERS.length - 1, activeLayerIndex));
  const layerStart = ACT2_START + clampedIndex * layerDuration;
  const layerMid = layerStart + layerDuration * 0.5;
  const layerEnd = layerStart + layerDuration;

  const layerTextIn = easeOutCubic(remap(progress, layerStart + 0.01, layerMid));
  const layerTextOut = 1 - easeOutCubic(remap(progress, layerEnd - 0.03, layerEnd));
  const layerOpacity = progress >= ACT2_START && progress < ACT2_END
    ? layerTextIn * layerTextOut
    : 0;

  // Act 3 text
  const act3Opacity = easeOutCubic(remap(progress, ACT3_START + 0.04, ACT3_START + 0.12));

  // CTA
  const ctaOpacity = easeOutCubic(remap(progress, 0.92, 0.98));

  const layer = LAYERS[clampedIndex];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>

      {/* Act 1: The Bare Bones */}
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: act1Opacity,
          transform: `translateY(${(1 - act1Opacity) * 20}px)`,
          transition: 'none',
        }}
      >
        <p style={{
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(148,163,184,0.7)',
          marginBottom: 12,
        }}>
          Results Roofing
        </p>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}>
          This is what&apos;s between
          <br />
          you and the sky.
        </h1>
      </div>

      {/* Act 2: Layer name + description */}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: 48,
          maxWidth: 380,
          opacity: layerOpacity,
          transform: `translateY(${(1 - layerOpacity) * 16}px)`,
        }}
      >
        <div style={{
          background: 'rgba(11,14,19,0.7)',
          backdropFilter: 'blur(16px)',
          borderRadius: 8,
          padding: '20px 24px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: BLUE,
            marginBottom: 6,
          }}>
            Layer {clampedIndex + 1} of {LAYERS.length}
          </p>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.92)',
            margin: '0 0 6px 0',
            lineHeight: 1.2,
          }}>
            {layer.name}
          </h2>
          <p style={{
            fontSize: 14,
            color: 'rgba(148,163,184,0.8)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {layer.text}
          </p>
        </div>
      </div>

      {/* Act 3: Protected */}
      <div
        style={{
          position: 'absolute',
          bottom: '18%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: act3Opacity,
          transform: `translateY(${(1 - act3Opacity) * 24}px)`,
        }}
      >
        <h2 style={{
          fontSize: 'clamp(24px, 3.5vw, 42px)',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.92)',
          margin: '0 0 8px 0',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}>
          See your price in under 3 minutes.
        </h2>
        <p style={{
          fontSize: 16,
          color: 'rgba(148,163,184,0.8)',
          margin: 0,
        }}>
          No phone call. No salesperson. Just your address and an honest number.
        </p>
      </div>

      {/* CTA */}
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: ctaOpacity,
          transform: `translateY(${(1 - ctaOpacity) * 12}px)`,
          pointerEvents: ctaOpacity > 0.5 ? 'auto' : 'none',
        }}
      >
        <a
          href="/quote/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 36px',
            background: BLUE,
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 6,
            textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(37,99,235,0.35)',
            transition: 'background 200ms',
          }}
        >
          Get My Free Quote
          <span style={{ fontSize: 18 }}>&rarr;</span>
        </a>
      </div>
    </div>
  );
}

/* ================================================================
   DOM: SCROLL HINT
   ================================================================ */

function ScrollHint({ progress }: { progress: number }) {
  const opacity = 1 - easeOutCubic(remap(progress, 0.02, 0.06));
  if (opacity < 0.01) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 36,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      textAlign: 'center',
      opacity,
      pointerEvents: 'none',
    }}>
      <p style={{
        fontSize: 12,
        fontWeight: 500,
        color: 'rgba(148,163,184,0.5)',
        marginBottom: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Scroll to begin
      </p>
      <div style={{
        width: 1,
        height: 32,
        margin: '0 auto',
        background: 'linear-gradient(to bottom, rgba(148,163,184,0.4), transparent)',
        animation: 'pulse 2s ease-in-out infinite',
      }} />
    </div>
  );
}

/* ================================================================
   MAIN EXPERIENCE
   ================================================================ */

export default function RoofBuildExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        scroll.progress = self.progress;
        setProgress(self.progress);
      },
    });

    return () => trigger.kill();
  }, []);

  // Background color shifts: cold dark → slightly warm
  const bgColor = useMemo(() => {
    const warmth = easeInOutCubic(remap(progress, ACT2_START, ACT3_START));
    const r = Math.round(THREE.MathUtils.lerp(11, 22, warmth));
    const g = Math.round(THREE.MathUtils.lerp(14, 18, warmth));
    const b = Math.round(THREE.MathUtils.lerp(19, 15, warmth));
    return `rgb(${r},${g},${b})`;
  }, [progress]);

  return (
    <>
      <div
        ref={containerRef}
        style={{ height: '800vh', position: 'relative' }}
      >
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: bgColor,
        }}>
          <Canvas
            camera={{ position: [0, 5, 10], fov: 35 }}
            dpr={[1, 1.5]}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={[DARK]} />
            <Scene />
          </Canvas>

          <CinematicText progress={progress} />
          <ScrollHint progress={progress} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.3; transform: scaleY(0.6); }
        }
        html, body { margin: 0; padding: 0; background: ${DARK}; }
      `}</style>
    </>
  );
}
