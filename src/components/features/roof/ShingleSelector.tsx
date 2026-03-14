'use client';

import { useState } from 'react';
import { getShinglesForTier, getDefaultShingle } from '@/lib/roof/shingle-catalog';
import type { ShingleOption } from '@/lib/roof/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tier = 'good' | 'better' | 'best';

interface ShingleSelectorProps {
  initialTier?: Tier;
  onSelect: (shingle: ShingleOption) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIERS: { value: Tier; label: string }[] = [
  { value: 'good', label: 'Good' },
  { value: 'better', label: 'Better' },
  { value: 'best', label: 'Best' },
];

// ---------------------------------------------------------------------------
// Styles (inline — no CSS module to keep the component self-contained)
// ---------------------------------------------------------------------------

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  tabList: {
    display: 'flex',
    gap: 4,
    padding: 4,
    background: 'var(--rr-color-surface)',
    borderRadius: 8,
    border: '1px solid var(--rr-color-border)',
  },
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '6px 0',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--rr-color-primary-foreground)' : 'var(--rr-color-text)',
    background: active ? 'var(--rr-color-primary)' : 'transparent',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background 150ms ease, color 150ms ease',
  }),
  brandLabel: {
    fontSize: '0.75rem',
    color: 'var(--rr-color-muted)',
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  },
  swatchGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  swatchButton: (active: boolean, hex: string): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: active ? '2px solid var(--rr-color-primary)' : '2px solid transparent',
    outline: active ? '2px solid var(--rr-color-primary)' : '2px solid transparent',
    outlineOffset: 2,
    background: hex,
    cursor: 'pointer',
    padding: 0,
    transition: 'outline 150ms ease, border 150ms ease',
    flexShrink: 0,
  }),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ShingleSelector({ initialTier = 'better', onSelect }: ShingleSelectorProps) {
  const [tier, setTier] = useState<Tier>(initialTier);
  const [selected, setSelected] = useState<ShingleOption>(() => getDefaultShingle(initialTier));

  const shingles = getShinglesForTier(tier);
  const brandLabel = shingles[0]?.brand ?? '';

  function handleTierChange(newTier: Tier) {
    setTier(newTier);
    const first = getDefaultShingle(newTier);
    setSelected(first);
    onSelect(first);
  }

  function handleSwatchClick(shingle: ShingleOption) {
    setSelected(shingle);
    onSelect(shingle);
  }

  return (
    <div style={styles.root}>
      {/* Tier tabs */}
      <div role="tablist" aria-label="Shingle tier" style={styles.tabList}>
        {TIERS.map(({ value, label }) => (
          <button
            key={value}
            role="tab"
            aria-selected={tier === value}
            aria-controls={`swatch-panel-${value}`}
            id={`tier-tab-${value}`}
            onClick={() => handleTierChange(value)}
            style={styles.tab(tier === value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Brand label */}
      <span style={styles.brandLabel}>{brandLabel}</span>

      {/* Color swatches */}
      <div
        id={`swatch-panel-${tier}`}
        role="radiogroup"
        aria-label={`${tier} shingle colors`}
        style={styles.swatchGrid}
      >
        {shingles.map((shingle) => (
          <button
            key={shingle.id}
            role="radio"
            aria-checked={selected.id === shingle.id}
            aria-label={shingle.name}
            title={shingle.name}
            onClick={() => handleSwatchClick(shingle)}
            style={styles.swatchButton(selected.id === shingle.id, shingle.hex)}
          />
        ))}
      </div>
    </div>
  );
}
