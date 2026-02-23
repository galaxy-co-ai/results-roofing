'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  LogOut,
  ArrowLeft,
  Kanban,
  Inbox,
  Search,
  ChevronRight,
  FolderOpen,
  CalendarDays,
  ClipboardList,
  Receipt,
  CreditCard,
  Package,
  Zap,
  UserCog,
  PenSquare,
  Settings,
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
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
  collapsible?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'manage',
    label: 'Manage',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/ops', icon: LayoutDashboard, exact: true },
      { id: 'jobs', label: 'Jobs', href: '/ops/jobs', icon: Kanban },
      { id: 'customers', label: 'Customers', href: '/ops/customers', icon: Users },
      { id: 'calendar', label: 'Calendar', href: '/ops/calendar', icon: CalendarDays },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    items: [
      { id: 'estimates', label: 'Estimates', href: '/ops/estimates', icon: ClipboardList },
      { id: 'invoices', label: 'Invoices', href: '/ops/invoices', icon: Receipt },
      { id: 'payments', label: 'Payments', href: '/ops/payments', icon: CreditCard },
      { id: 'materials', label: 'Materials', href: '/ops/materials', icon: Package },
    ],
  },
  {
    id: 'communicate',
    label: 'Communicate',
    items: [
      { id: 'inbox', label: 'Inbox', href: '/ops/inbox', icon: Inbox },
      { id: 'documents', label: 'Documents', href: '/ops/documents', icon: FolderOpen },
    ],
  },
  {
    id: 'automate',
    label: 'Automate',
    items: [
      { id: 'automations', label: 'Automations', href: '/ops/automations', icon: Zap },
      { id: 'reports', label: 'Reports', href: '/ops/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { id: 'team', label: 'Team', href: '/ops/team', icon: UserCog },
      { id: 'blog', label: 'Blog', href: '/ops/blog/posts', icon: PenSquare },
      { id: 'settings', label: 'Settings', href: '/ops/settings', icon: Settings },
    ],
  },
];

async function handleLogout() {
  await fetch('/api/ops/auth', { method: 'DELETE' });
  window.location.href = '/';
}

function NavGroup({ section }: { section: NavSection }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Check if any item in this section is active
  const hasActiveItem = section.items.some((item) => isActive(item.href, item.exact));

  if (section.collapsible) {
    return (
      <Collapsible defaultOpen={hasActiveItem} className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              {section.label}
              <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive(item.href, item.exact)} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild isActive={isActive(item.href, item.exact)} tooltip={item.label}>
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
  );
}

export function OpsSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/ops">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo/primary/rr-mark-only.svg"
                  alt=""
                  className="size-8"
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Results Roofing</span>
                  <span className="text-xs text-muted-foreground">Operations</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Search */}
        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput placeholder="Search... (⌘K)" className="pl-8" />
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        {NAV_SECTIONS.map((section) => (
          <NavGroup key={section.id} section={section} />
        ))}
      </SidebarContent>

      {/* Footer */}
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

export default OpsSidebar;
