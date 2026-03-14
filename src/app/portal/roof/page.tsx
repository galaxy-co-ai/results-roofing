'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { Home } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { ShingleSelector } from '@/components/features/roof/ShingleSelector';
import { RoofStats } from '@/components/features/roof/RoofStats';
import { RoofPageSkeleton } from '@/components/features/roof/RoofPageSkeleton';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { useRoofData } from '@/hooks/useRoofData';
import { getDefaultShingle } from '@/lib/roof/shingle-catalog';
import { buildRoofGeometry } from '@/lib/roof/facet-geometry';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { ShingleOption } from '@/lib/roof/types';
import styles from './page.module.css';

const RoofMeshViewer = dynamic(
  () => import('@/components/features/roof/RoofMeshViewer').then(m => ({ default: m.RoofMeshViewer })),
  { ssr: false, loading: () => <RoofPageSkeleton /> },
);

// ---------------------------------------------------------------------------
// Inner content (receives a resolved email)
// ---------------------------------------------------------------------------

function RoofContent({ email }: { email: string | null }) {
  const { isLoading: phaseLoading, quote } = usePortalPhase(email);
  const quoteId = quote?.id ?? null;

  const { data: roofData, isLoading: dataLoading } = useRoofData(quoteId);

  const [selectedShingle, setSelectedShingle] = useState<ShingleOption>(
    () => getDefaultShingle('better'),
  );

  const roofGeometry = useMemo(() => {
    if (!roofData?.segments || !roofData?.buildingCenter) return null;
    return buildRoofGeometry(roofData.segments, roofData.buildingCenter);
  }, [roofData?.segments, roofData?.buildingCenter]);

  if (phaseLoading || dataLoading) {
    return <RoofPageSkeleton />;
  }

  const hasData = !!roofData?.buildingCenter;

  return (
    <div className={styles.page}>
      <PortalHeader title="My Roof" />

      <div className={styles.content}>
        <div className={styles.viewport}>
          {roofGeometry ? (
            <RoofMeshViewer
              geometry={roofGeometry}
              shingleHex={selectedShingle.hex}
            />
          ) : hasData ? (
            <div className={styles.emptyState}>
              <Home size={40} color="var(--rr-color-muted)" />
              <p className={styles.emptyTitle}>Roof Preview Unavailable</p>
              <p className={styles.emptyText}>
                Roof visualization is not available for this location. You can still select shingle colors from the swatches.
              </p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Home size={40} color="var(--rr-color-muted)" />
              <p className={styles.emptyTitle}>No Roof Data Yet</p>
              <p className={styles.emptyText}>
                Your roof visualization will appear here once your measurement report is processed.
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
