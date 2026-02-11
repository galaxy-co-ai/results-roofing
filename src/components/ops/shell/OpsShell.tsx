'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { OpsSidebar } from './OpsSidebar';
import { OpsPageHeader } from './OpsPageHeader';

interface OpsShellProps {
  children: React.ReactNode;
  fontClasses?: string;
}

export function OpsShell({ children, fontClasses }: OpsShellProps) {
  return (
    <div data-layout="ops" className={fontClasses}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '15rem',
            '--sidebar-width-icon': '4rem',
          } as React.CSSProperties
        }
      >
        <OpsSidebar />
        <SidebarInset>
          <OpsPageHeader />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-[1440px]" id="main-content">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
