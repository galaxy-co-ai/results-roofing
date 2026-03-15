'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Home, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { ShingleSelector } from '@/components/features/roof/ShingleSelector';
import { RoofStats } from '@/components/features/roof/RoofStats';
import { RoofPageSkeleton } from '@/components/features/roof/RoofPageSkeleton';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { useRoofData } from '@/hooks/useRoofData';
import { getDefaultShingle } from '@/lib/roof/shingle-catalog';
import { GafViewerEmbed } from '@/components/features/roof/GafViewerEmbed';
import { parseDxfToFacets } from '@/lib/roof/dxf-parser';
import { buildGeometryFromFacets } from '@/lib/roof/dxf-to-geometry';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { ShingleOption, RoofGeometry } from '@/lib/roof/types';
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

  // Fetch and parse DXF when URL is available
  const [roofGeometry, setRoofGeometry] = useState<RoofGeometry | null>(null);
  const [dxfLoading, setDxfLoading] = useState(false);

  const dxfUrl = roofData?.gafDxfUrl ?? null;

  useEffect(() => {
    if (!dxfUrl) {
      setRoofGeometry(null);
      return;
    }

    let cancelled = false;
    setDxfLoading(true);

    fetch(dxfUrl)
      .then(res => res.text())
      .then(dxfText => {
        if (cancelled) return;
        const facets = parseDxfToFacets(dxfText);
        const geometry = buildGeometryFromFacets(facets);
        setRoofGeometry(geometry);
      })
      .catch(() => {
        if (!cancelled) setRoofGeometry(null);
      })
      .finally(() => {
        if (!cancelled) setDxfLoading(false);
      });

    return () => { cancelled = true; };
  }, [dxfUrl]);

  if (phaseLoading || dataLoading) {
    return <RoofPageSkeleton />;
  }

  const hasData = !!roofData?.buildingCenter;
  const gafStatus = roofData?.gafStatus ?? 'none';

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
          ) : roofData?.gafReport3dUrl ? (
            <GafViewerEmbed report3dUrl={roofData.gafReport3dUrl} />
          ) : gafStatus === 'pending' || dxfLoading ? (
            <div className={styles.emptyState}>
              <Loader2 size={40} color="var(--rr-color-muted)" className={styles.spinner} />
              <p className={styles.emptyTitle}>Your Roof Model Is Being Prepared</p>
              <p className={styles.emptyText}>
                This typically takes about an hour. The page will update automatically when your roof is ready.
              </p>
            </div>
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
