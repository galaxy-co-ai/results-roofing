'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, CreditCard, FileText, Calendar, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import styles from './PortalSidebarV2.module.css';

export function PortalSidebarV2() {
  const pathname = usePathname();
  const { expanded, toggle, hasRoofData } = useSidebar();

  const navItems = [
    { label: 'My Project', href: '/portal', icon: FolderKanban },
    ...(hasRoofData ? [{ label: 'My Roof', href: '/portal/roof', icon: Home }] : []),
    { label: 'Payments', href: '/portal/payments', icon: CreditCard },
    { label: 'Documents', href: '/portal/documents', icon: FileText },
    { label: 'Schedule', href: '/portal/schedule', icon: Calendar },
  ];

  return (
    <aside
      className={`${styles.sidebar} ${expanded ? styles.expanded : ''}`}
      aria-label="Portal navigation"
    >
      {/* Logo */}
      <Link href="/" className={styles.logo} aria-label="Results Roofing Home">
        RR
      </Link>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive =
            item.href === '/portal'
              ? pathname === '/portal'
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              title={!expanded ? item.label : undefined}
            >
              <item.icon size={22} aria-hidden="true" />
              {expanded && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle expand/collapse */}
      <button
        className={styles.toggleButton}
        onClick={toggle}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={expanded}
      >
        {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  );
}
