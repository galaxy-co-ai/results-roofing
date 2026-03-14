'use client';

import { Ruler, Triangle, Layers } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoofStatsProps {
  sqftTotal: number;
  pitchPrimary: string;
  facetCount: number;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    background: 'var(--rr-color-surface)',
    border: '1px solid var(--rr-color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderBottom: '1px solid var(--rr-color-border)',
  },
  rowLast: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
  },
  iconWrap: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--rr-color-primary)',
    borderRadius: 8,
    flexShrink: 0,
    color: 'var(--rr-color-primary-foreground)',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--rr-color-muted)',
    margin: 0,
    lineHeight: 1.2,
  },
  value: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--rr-color-text)',
    margin: 0,
    lineHeight: 1.2,
  },
};

// ---------------------------------------------------------------------------
// StatRow sub-component
// ---------------------------------------------------------------------------

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}

function StatRow({ icon, label, value, last }: StatRowProps) {
  return (
    <div style={last ? styles.rowLast : styles.row}>
      <div style={styles.iconWrap}>{icon}</div>
      <div>
        <p style={styles.label}>{label}</p>
        <p style={styles.value}>{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoofStats({ sqftTotal, pitchPrimary, facetCount }: RoofStatsProps) {
  return (
    <div style={styles.card}>
      <StatRow
        icon={<Ruler size={18} />}
        label="Total Area"
        value={`${sqftTotal.toLocaleString()} sq ft`}
      />
      <StatRow
        icon={<Triangle size={18} />}
        label="Primary Pitch"
        value={`${pitchPrimary}/12`}
      />
      <StatRow
        icon={<Layers size={18} />}
        label="Roof Sections"
        value={String(facetCount)}
        last
      />
    </div>
  );
}
