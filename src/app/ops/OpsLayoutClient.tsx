'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { OpsSidebar } from './OpsSidebar';

// Map paths to breadcrumb labels
const BREADCRUMB_LABELS: Record<string, string> = {
  ops: 'Dashboard',
  analytics: 'Analytics',
  crm: 'CRM',
  contacts: 'Contacts',
  pipeline: 'Pipeline',
  messaging: 'Messaging',
  sms: 'SMS',
  email: 'Email',
  support: 'Support Inbox',
  blog: 'Blog',
  posts: 'Posts',
};

export function OpsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = BREADCRUMB_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <SidebarProvider>
      <OpsSidebar />
      <SidebarInset>
        {/* Top header bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={crumb.href}>
                  {index > 0 && <BreadcrumbSeparator />}
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6" id="main-content">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
