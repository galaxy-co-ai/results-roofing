import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Calendar, 
  LogOut,
  User
} from 'lucide-react';
import { SidebarSupport } from '@/components/features/support';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: {
    default: 'Customer Portal',
    template: '%s | Results Roofing Portal',
  },
  description: 'Manage your roofing project, documents, payments, and schedule.',
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { id: 'documents', label: 'Documents', href: '/portal/documents', icon: FileText },
  { id: 'payments', label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { id: 'schedule', label: 'Schedule', href: '/portal/schedule', icon: Calendar },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.portalLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>RR</span>
            <span className={styles.logoText}>Results Roofing</span>
          </Link>
        </div>

        {/* User Info */}
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            <User size={20} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Welcome back</span>
            <span className={styles.userEmail}>customer@email.com</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Portal navigation">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={styles.navLink}>
                  <item.icon size={20} className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Help Section */}
        <SidebarSupport />

        {/* Logout */}
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
