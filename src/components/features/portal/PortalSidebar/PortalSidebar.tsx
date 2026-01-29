'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Calendar,
  Home,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { PortalUserCard } from '@/components/features/portal';
import { useChat } from '@/components/features/support/ChatContext';
import styles from './PortalSidebar.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { id: 'documents', label: 'Documents', href: '/portal/documents', icon: FileText },
  { id: 'payments', label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { id: 'schedule', label: 'Schedule', href: '/portal/schedule', icon: Calendar },
];

// Breakpoint for tablet (sidebar collapses below this width)
const TABLET_BREAKPOINT = 1024;

export function PortalSidebar() {
  // Start with null to indicate "not yet determined" - prevents hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);
  const pathname = usePathname();
  const { openChat } = useChat();

  // Set initial collapsed state based on screen size (client-side only)
  useEffect(() => {
    const isTabletOrSmaller = window.innerWidth < TABLET_BREAKPOINT;
    setIsCollapsed(isTabletOrSmaller);

    const handleResize = () => {
      // On very small screens (mobile), the sidebar becomes bottom nav,
      // so we don't need to manage collapsed state
      if (window.innerWidth > 768 && window.innerWidth < TABLET_BREAKPOINT) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use expanded as default for SSR, then client will adjust
  const collapsed = isCollapsed ?? false;

  const toggleSidebar = () => {
    setIsCollapsed(!collapsed);
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Portal sidebar"
      suppressHydrationWarning
    >
      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight size={16} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={16} strokeWidth={2.5} />
        )}
      </button>

      {/* Logo */}
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.logo} aria-label="Results Roofing Home">
          <div className={styles.logoIcon} aria-hidden="true">
            <Home size={20} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className={styles.brandText}>
              <span className={styles.brandName}>Results</span>{' '}
              <span className={styles.brandSuffix}>Roofing</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Portal navigation">
        {!collapsed && <div className={styles.navSectionLabel}>Menu</div>}
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={20} className={styles.navIcon} aria-hidden="true" />
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Support Button */}
      <div className={styles.supportSection}>
        <button
          className={styles.supportButton}
          onClick={() => openChat()}
          aria-label="Open support chat"
          title={collapsed ? 'Support' : undefined}
        >
          <MessageCircle size={20} />
          {!collapsed && <span>Support</span>}
        </button>
      </div>

      {/* User Card */}
      {!collapsed && (
        <div className={styles.sidebarFooter}>
          <PortalUserCard />
        </div>
      )}

      {/* Collapsed User Avatar */}
      {collapsed && (
        <div className={styles.collapsedUserSection}>
          <div className={styles.collapsedAvatar}>
            <span className={styles.collapsedAvatarText}>DU</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default PortalSidebar;
