'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, CreditCard, FileText, Calendar } from 'lucide-react';
import styles from './BottomTabBar.module.css';

const TAB_ITEMS = [
  { label: 'Project', href: '/portal', icon: FolderKanban },
  { label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { label: 'Documents', href: '/portal/documents', icon: FileText },
  { label: 'Schedule', href: '/portal/schedule', icon: Calendar },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabBar} aria-label="Portal navigation">
      <div className={styles.tabList} role="tablist">
        {TAB_ITEMS.map((item) => {
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
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
