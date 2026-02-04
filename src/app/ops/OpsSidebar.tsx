'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Mail,
  FileText,
  BarChart3,
  LogOut,
  ArrowLeft,
  Kanban,
  Inbox,
  Search,
  ChevronRight,
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
  useSidebar,
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
    id: 'overview',
    label: 'General',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/ops', icon: LayoutDashboard, exact: true },
      { id: 'analytics', label: 'Analytics', href: '/ops/analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    collapsible: true,
    items: [
      { id: 'contacts', label: 'Contacts', href: '/ops/crm/contacts', icon: Users },
      { id: 'pipeline', label: 'Pipeline', href: '/ops/crm/pipeline', icon: Kanban },
    ],
  },
  {
    id: 'messaging',
    label: 'Messaging',
    collapsible: true,
    items: [
      { id: 'sms', label: 'SMS', href: '/ops/messaging/sms', icon: MessageSquare },
      { id: 'email', label: 'Email', href: '/ops/messaging/email', icon: Mail },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    items: [
      { id: 'inbox', label: 'Support Inbox', href: '/ops/support', icon: Inbox },
      { id: 'blog', label: 'Blog Posts', href: '/ops/blog/posts', icon: FileText },
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
      <SidebarFooter>
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
