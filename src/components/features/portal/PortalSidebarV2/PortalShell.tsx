'use client';

import type { ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { PortalSidebarV2 } from './PortalSidebarV2';
import { BottomTabBar } from '@/components/features/portal/BottomTabBar/BottomTabBar';
import { useOrders, useOrderDetails } from '@/hooks';
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

/** Derive hasRoofData from measurement on the user's first order */
function useHasRoofData(userEmail: string | null): boolean {
  const { data: ordersData, isLoading: ordersLoading } = useOrders(userEmail);
  const currentOrderId = ordersData?.orders?.[0]?.id ?? null;
  const { data: orderDetails, isLoading: detailsLoading } = useOrderDetails(currentOrderId);

  // Debug: trace the data chain (remove after confirming fix)
  if (typeof window !== 'undefined' && userEmail) {
    console.log('[My Roof Debug]', {
      email: userEmail,
      ordersLoading,
      orderCount: ordersData?.orders?.length ?? 0,
      currentOrderId,
      detailsLoading,
      measurement: orderDetails?.measurement ?? 'no measurement field',
    });
  }

  return (
    orderDetails?.measurement?.status === 'complete' &&
    orderDetails?.measurement?.hasRoofSegments === true
  ) ?? false;
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
