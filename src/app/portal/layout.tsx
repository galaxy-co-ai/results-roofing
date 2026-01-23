import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Calendar, 
} from 'lucide-react';
import { SidebarSupport } from '@/components/features/support';
import { PortalUserCard } from '@/components/features/portal';
import styles from './layout.module.css';

/**
 * Force dynamic rendering for all portal pages
 * Required because portal uses Clerk's useUser() hook which needs runtime context
 */
export const dynamic = 'force-dynamic';

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
      <aside className={styles.sidebar} aria-label="Portal sidebar">
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo} aria-label="Results Roofing Home">
            <span className={styles.logoIcon} aria-hidden="true">RR</span>
            <span className={styles.logoText}>Results Roofing</span>
          </Link>
        </div>

        {/* User Info - Client Component */}
        <PortalUserCard />

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Portal navigation">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={styles.navLink}>
                  <item.icon size={20} className={styles.navIcon} aria-hidden="true" />
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Help Section */}
        <SidebarSupport />

        {/* Logout - Now in PortalUserCard */}
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent} id="main-content">
        {children}
      </main>
    </div>
  );
}
