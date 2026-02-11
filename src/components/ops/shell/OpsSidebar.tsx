'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarDays,
  FileText,
  Receipt,
  CreditCard,
  Package,
  Inbox,
  FolderOpen,
  Zap,
  BarChart3,
  UserCog,
  PenSquare,
  Settings,
  ArrowLeft,
  LogOut,
  Home,
  type LucideIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

/* ========================================
   NAV CONFIGURATION
   5 groups, 15 items
   ======================================== */

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'manage',
    label: 'MANAGE',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/ops', icon: LayoutDashboard, exact: true },
      { id: 'jobs', label: 'Jobs', href: '/ops/jobs', icon: Briefcase },
      { id: 'customers', label: 'Customers', href: '/ops/customers', icon: Users },
      { id: 'calendar', label: 'Calendar', href: '/ops/calendar', icon: CalendarDays },
    ],
  },
  {
    id: 'sales',
    label: 'SALES',
    items: [
      { id: 'estimates', label: 'Estimates', href: '/ops/estimates', icon: FileText },
      { id: 'invoices', label: 'Invoices', href: '/ops/invoices', icon: Receipt },
      { id: 'payments', label: 'Payments', href: '/ops/payments', icon: CreditCard },
      { id: 'materials', label: 'Materials', href: '/ops/materials', icon: Package },
    ],
  },
  {
    id: 'communicate',
    label: 'COMMUNICATE',
    items: [
      { id: 'inbox', label: 'Inbox', href: '/ops/inbox', icon: Inbox },
      { id: 'documents', label: 'Documents', href: '/ops/documents', icon: FolderOpen },
    ],
  },
  {
    id: 'automate',
    label: 'AUTOMATE',
    items: [
      { id: 'automations', label: 'Automations', href: '/ops/automations', icon: Zap },
      { id: 'reports', label: 'Reports', href: '/ops/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'admin',
    label: 'ADMIN',
    items: [
      { id: 'team', label: 'Team', href: '/ops/team', icon: UserCog },
      { id: 'blog', label: 'Blog', href: '/ops/blog', icon: PenSquare },
      { id: 'settings', label: 'Settings', href: '/ops/settings', icon: Settings },
    ],
  },
];

/* ========================================
   LOGOUT HANDLER
   ======================================== */

async function handleLogout() {
  await fetch('/api/ops/auth', { method: 'DELETE' });
  window.location.href = '/';
}

/* ========================================
   COMPONENT
   ======================================== */

export function OpsSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header: Logo + Company */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/ops">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
                  <Home size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-[family-name:var(--font-sora)] font-bold text-sm tracking-tight">
                    <span className="text-foreground">Results</span>{' '}
                    <span className="text-blue-600">Roofing</span>
                  </span>
                  <span className="text-xs text-muted-foreground">Operations</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation: 5 groups */}
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href, item.exact)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer: Back to Site + Exit */}
      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to Site">
              <Link href="/">
                <ArrowLeft />
                <span>Back to Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Exit Ops">
              <LogOut />
              <span>Exit Ops</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
