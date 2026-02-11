'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/* ========================================
   BREADCRUMB LABEL MAP
   Covers new nav routes + legacy routes
   ======================================== */

const BREADCRUMB_LABELS: Record<string, string> = {
  // New nav routes
  ops: 'Dashboard',
  jobs: 'Jobs',
  customers: 'Customers',
  calendar: 'Calendar',
  estimates: 'Estimates',
  invoices: 'Invoices',
  payments: 'Payments',
  materials: 'Materials',
  inbox: 'Inbox',
  documents: 'Documents',
  automations: 'Automations',
  reports: 'Reports',
  team: 'Team',
  blog: 'Blog',
  settings: 'Settings',
  // Legacy routes (still accessible)
  analytics: 'Analytics',
  crm: 'CRM',
  contacts: 'Contacts',
  pipeline: 'Pipeline',
  messaging: 'Messaging',
  sms: 'SMS',
  email: 'Email',
  support: 'Support Inbox',
  posts: 'Posts',
};

/* ========================================
   TYPES
   ======================================== */

interface BreadcrumbEntry {
  label: string;
  href: string;
}

interface OpsPageHeaderProps {
  title?: string;
  breadcrumbs?: BreadcrumbEntry[];
  actions?: React.ReactNode;
}

/* ========================================
   COMPONENT
   64px sticky header with breadcrumbs + actions
   ======================================== */

export function OpsPageHeader({ title, breadcrumbs: explicitBreadcrumbs, actions }: OpsPageHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumbs from explicit prop or auto-generate from pathname
  const crumbs = explicitBreadcrumbs
    ? explicitBreadcrumbs.map((crumb, i) => ({
        ...crumb,
        isLast: i === explicitBreadcrumbs.length - 1,
      }))
    : segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label =
          BREADCRUMB_LABELS[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === segments.length - 1;
        return { href, label, isLast };
      });

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-4 sticky top-0 z-10"
    >
      {/* Left: trigger + separator + breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <Fragment key={crumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage
                      className="font-semibold"
                      style={{ fontFamily: 'var(--ops-font-display)' }}
                    >
                      {title || crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: actions slot */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
