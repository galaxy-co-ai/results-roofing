'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, CreditCard, FileText, Calendar, Home } from 'lucide-react';
import { useSidebar } from '@/components/features/portal/PortalSidebarV2/SidebarContext';
import styles from './BottomTabBar.module.css';

export function BottomTabBar() {
  const pathname = usePathname();
  const { hasRoofData } = useSidebar();

  const tabItems = [
    { label: 'Project', href: '/portal', icon: FolderKanban },
    ...(hasRoofData ? [{ label: 'My Roof', href: '/portal/roof', icon: Home }] : []),
    { label: 'Payments', href: '/portal/payments', icon: CreditCard },
    { label: 'Documents', href: '/portal/documents', icon: FileText },
    { label: 'Schedule', href: '/portal/schedule', icon: Calendar },
  ];

  return (
    <nav className={styles.tabBar} aria-label="Portal navigation">
      <div className={styles.tabList} role="tablist">
        {tabItems.map((item) => {
          const isActive =
            item.href === '/portal'
              ? pathname === '/portal'
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              aria-current={isActive ? 'page' : undefined}
              role="tab"
              aria-selected={isActive}
            >
              <item.icon size={20} aria-hidden="true" />
              <span className={styles.tabLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
