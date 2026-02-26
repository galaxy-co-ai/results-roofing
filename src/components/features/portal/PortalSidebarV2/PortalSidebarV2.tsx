'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, CreditCard, FileText, Calendar } from 'lucide-react';
import styles from './PortalSidebarV2.module.css';

const NAV_ITEMS = [
  { label: 'My Project', href: '/portal', icon: FolderKanban },
  { label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { label: 'Documents', href: '/portal/documents', icon: FileText },
  { label: 'Schedule', href: '/portal/schedule', icon: Calendar },
];

export function PortalSidebarV2() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Portal navigation">
      {/* Logo */}
      <Link href="/portal" className={styles.logo} aria-label="Results Roofing Portal Home">
        RR
      </Link>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
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
              title={item.label}
            >
              <item.icon size={22} aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
