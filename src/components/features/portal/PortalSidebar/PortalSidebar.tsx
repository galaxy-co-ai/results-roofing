'use client';

import { useState } from 'react';
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

export function PortalSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { openChat } = useChat();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`} 
      aria-label="Portal sidebar"
    >
      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={toggleSidebar}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? (
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
          {!isCollapsed && (
            <span className={styles.brandText}>
              <span className={styles.brandName}>Results</span>{' '}
              <span className={styles.brandSuffix}>Roofing</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Portal navigation">
        {!isCollapsed && <div className={styles.navSectionLabel}>Menu</div>}
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <li key={item.id}>
                <Link 
                  href={item.href} 
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} className={styles.navIcon} aria-hidden="true" />
                  {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
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
          title={isCollapsed ? 'Support' : undefined}
        >
          <MessageCircle size={20} />
          {!isCollapsed && <span>Support</span>}
        </button>
      </div>

      {/* User Card */}
      {!isCollapsed && (
        <div className={styles.sidebarFooter}>
          <PortalUserCard />
        </div>
      )}

      {/* Collapsed User Avatar */}
      {isCollapsed && (
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
