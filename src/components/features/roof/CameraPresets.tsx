'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { CameraControls } from '@react-three/drei';
import type { CameraPreset } from '@/lib/roof/types';

const PRESETS: CameraPreset[] = [
  { id: 'aerial', label: 'Aerial', position: [0, 25, 0.1], target: [0, 0, 0] },
  { id: 'front', label: 'Front', position: [0, 8, 20], target: [0, 3, 0] },
  { id: 'back', label: 'Back', position: [0, 8, -20], target: [0, 3, 0] },
  { id: 'side', label: 'Side', position: [20, 8, 0], target: [0, 3, 0] },
];

interface CameraSetupProps {
  controlsRef: React.MutableRefObject<CameraControls | null>;
}

export function CameraSetup({ controlsRef }: CameraSetupProps) {
  return (
    <CameraControls
      ref={controlsRef}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={5}
      maxDistance={50}
    />
  );
}

interface CameraPresetsBarProps {
  controlsRef: React.MutableRefObject<CameraControls | null>;
}

export function CameraPresetsBar({ controlsRef }: CameraPresetsBarProps) {
  const [activePreset, setActivePreset] = useState('aerial');
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goToPreset = useCallback(
    (preset: CameraPreset) => {
      const controls = controlsRef.current;
      if (!controls) return;
      setActivePreset(preset.id);
      const smooth = !prefersReducedMotion;
      controls.setLookAt(
        preset.position[0], preset.position[1], preset.position[2],
        preset.target[0], preset.target[1], preset.target[2],
        smooth,
      );
    },
    [controlsRef, prefersReducedMotion],
  );

  useEffect(() => {
    const timer = setTimeout(() => goToPreset(PRESETS[0]), 100);
    return () => clearTimeout(timer);
  }, [goToPreset]);

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => goToPreset(preset)}
          aria-label={`${preset.label} view`}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid var(--rr-color-border)',
            background: activePreset === preset.id ? 'var(--rr-color-primary)' : 'var(--rr-color-surface)',
            color: activePreset === preset.id ? 'var(--rr-color-primary-foreground)' : 'var(--rr-color-text)',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

export { PRESETS };
