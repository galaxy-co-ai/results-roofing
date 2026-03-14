'use client';

import type { ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { PortalSidebarV2 } from './PortalSidebarV2';
import { BottomTabBar } from '@/components/features/portal/BottomTabBar/BottomTabBar';
import { useOrders } from '@/hooks';
import { useRoofData } from '@/hooks/useRoofData';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from '@/app/portal/layout.module.css';

function ShellInner({ children }: { children: ReactNode }) {
  const { expanded } = useSidebar();

  return (
    <div className={styles.portalLayout}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-white focus:text-blue-600 focus:font-semibold focus:shadow-lg focus:rounded-lg focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>
      <PortalSidebarV2 />
      <main
        className={styles.mainContent}
        id="main-content"
        style={{ marginLeft: expanded ? 220 : undefined }}
      >
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}

/**
 * Derive hasRoofData by attempting to fetch roof segment data.
 * Works for both orders (quoteId via order) and pending quotes (quoteId directly).
 * The /api/portal/roof-data endpoint handles auth and checks for actual segment data.
 */
function useHasRoofData(userEmail: string | null): boolean {
  const { data: ordersData } = useOrders(userEmail);

  // Get quoteId from either the first order or the first pending quote
  const firstOrder = ordersData?.orders?.[0];
  const firstPendingQuote = ordersData?.pendingQuotes?.[0];
  const quoteId = firstOrder?.quoteId ?? firstPendingQuote?.id ?? null;

  const { data: roofData } = useRoofData(quoteId);

  return (roofData?.segments?.length ?? 0) > 0;
}

function ClerkShell({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  const hasRoofData = useHasRoofData(userEmail);

  return (
    <SidebarProvider hasRoofData={hasRoofData}>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}

function DevShell({ children }: { children: ReactNode }) {
  const userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
  const hasRoofData = useHasRoofData(userEmail);

  return (
    <SidebarProvider hasRoofData={hasRoofData}>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}

export function PortalShell({ children }: { children: ReactNode }) {
  if (DEV_BYPASS_ENABLED) {
    return <DevShell>{children}</DevShell>;
  }
  return <ClerkShell>{children}</ClerkShell>;
}
