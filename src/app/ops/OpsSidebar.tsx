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
  type LucideIcon,
} from 'lucide-react';
import styles from './ops.module.css';

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
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/ops', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    items: [
      { id: 'contacts', label: 'Contacts', href: '/ops/crm/contacts', icon: Users },
      { id: 'pipeline', label: 'Pipeline', href: '/ops/crm/pipeline', icon: Kanban },
    ],
  },
  {
    id: 'messaging',
    label: 'Messaging',
    items: [
      { id: 'sms', label: 'SMS', href: '/ops/messaging/sms', icon: MessageSquare },
      { id: 'email', label: 'Email', href: '/ops/messaging/email', icon: Mail },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    items: [
      { id: 'inbox', label: 'Inbox', href: '/ops/support', icon: Inbox },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      { id: 'blog', label: 'Blog', href: '/ops/blog/posts', icon: FileText },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', href: '/ops/analytics', icon: BarChart3 },
    ],
  },
];

async function handleLogout() {
  await fetch('/api/ops/auth', { method: 'DELETE' });
  window.location.href = '/';
}

export function OpsSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className={styles.sidebar} aria-label="Ops navigation">
      {/* Logo */}
      <div className={styles.logoArea}>
        <Link href="/ops" className={styles.logoLink}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo/primary/results-roofing-horizontal-dark.svg"
            alt="Results Roofing"
            className={styles.logoImage}
            style={{ height: '28px', width: 'auto' }}
          />
        </Link>
        <span className={styles.opsBadge}>OPS</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.id}>
            <div className={styles.navSection}>
              <span className={styles.navSectionLabel}>{section.label}</span>
            </div>
            <ul className={styles.navList}>
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`${styles.navItem} ${active ? styles.active : ''}`}
                    >
                      <item.icon size={16} className={styles.navIcon} />
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={styles.navBadge}>{item.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.footerLink}>
          <ArrowLeft size={14} />
          <span>Back to Site</span>
        </Link>
        <button onClick={handleLogout} className={styles.footerButton}>
          <LogOut size={14} />
          <span>Exit Ops</span>
        </button>
      </div>
    </aside>
  );
}

export default OpsSidebar;
