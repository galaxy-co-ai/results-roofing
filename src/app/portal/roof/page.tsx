'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Home } from 'lucide-react';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { ShingleSelector } from '@/components/features/roof/ShingleSelector';
import { RoofStats } from '@/components/features/roof/RoofStats';
import { RoofPageSkeleton } from '@/components/features/roof/RoofPageSkeleton';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { useRoofData } from '@/hooks/useRoofData';
import { useRoofGeometry } from '@/hooks/useRoofGeometry';
import { getDefaultShingle } from '@/lib/roof/shingle-catalog';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { ShingleOption } from '@/lib/roof/types';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Dynamic import — R3F canvas must not run on the server
// ---------------------------------------------------------------------------

const RoofViewer = dynamic(
  () => import('@/components/features/roof/RoofViewer'),
  {
    ssr: false,
    loading: () => <RoofPageSkeleton />,
  },
);

// ---------------------------------------------------------------------------
// Inner content (receives a resolved email)
// ---------------------------------------------------------------------------

function RoofContent({ email }: { email: string | null }) {
  const { isLoading: phaseLoading, quote } = usePortalPhase(email);
  const quoteId = quote?.id ?? null;

  const { data: roofData, isLoading: dataLoading } = useRoofData(quoteId);

  const facets = useRoofGeometry(
    roofData?.segments,
    roofData?.buildingCenter,
  );

  const [selectedShingle, setSelectedShingle] = useState<ShingleOption>(
    () => getDefaultShingle('better'),
  );

  // All loading phases — show skeleton
  if (phaseLoading || dataLoading) {
    return <RoofPageSkeleton />;
  }

  const hasData = !!roofData && facets.length > 0;

  // Debug: trace geometry output (remove after confirming fix)
  if (typeof window !== 'undefined' && facets.length > 0) {
    console.log('[Roof Debug] facets:', facets.length, 'first facet:', {
      vertexCount: facets[0].vertices3D.length,
      vertices: facets[0].vertices3D,
      width: facets[0].widthMeters,
      depth: facets[0].depthMeters,
      pitch: facets[0].pitchDegrees,
      azimuth: facets[0].azimuthDegrees,
    });
    const allVerts = facets.flatMap(f => f.vertices3D);
    const xs = allVerts.map(v => v[0]);
    const ys = allVerts.map(v => v[1]);
    const zs = allVerts.map(v => v[2]);
    console.log('[Roof Debug] bounds:', {
      x: [Math.min(...xs).toFixed(1), Math.max(...xs).toFixed(1)],
      y: [Math.min(...ys).toFixed(1), Math.max(...ys).toFixed(1)],
      z: [Math.min(...zs).toFixed(1), Math.max(...zs).toFixed(1)],
    });
  }

  return (
    <div className={styles.page}>
      <PortalHeader title="Roof Visualizer" />

      <div className={styles.content}>
        {/* 3D viewport */}
        <div className={styles.viewport}>
          {hasData ? (
            <RoofViewer
              facets={facets}
              textureUrl={selectedShingle.texture}
            />
          ) : (
            <div className={styles.emptyState}>
              <Home size={40} color="var(--rr-color-muted)" />
              <p className={styles.emptyTitle}>No Roof Data Yet</p>
              <p className={styles.emptyText}>
                Your 3D roof model will appear here once your measurement report is processed.
                This typically takes 1–2 business days after your quote is submitted.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <ShingleSelector
            initialTier="better"
            onSelect={setSelectedShingle}
          />

          {hasData && roofData && (
            <RoofStats
              sqftTotal={roofData.stats.sqftTotal}
              pitchPrimary={roofData.stats.pitchPrimary}
              facetCount={roofData.stats.facetCount}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auth wrappers
// ---------------------------------------------------------------------------

function ClerkRoof() {
  const { user } = useUser();
  return <RoofContent email={user?.primaryEmailAddress?.emailAddress ?? null} />;
}

function DevRoof() {
  return <RoofContent email={MOCK_USER.primaryEmailAddress.emailAddress} />;
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function RoofPage() {
  if (DEV_BYPASS_ENABLED) return <DevRoof />;
  return <ClerkRoof />;
}
