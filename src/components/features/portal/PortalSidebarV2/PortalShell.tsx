'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { PortalSidebarV2 } from './PortalSidebarV2';
import { BottomTabBar } from '@/components/features/portal/BottomTabBar/BottomTabBar';
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

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
