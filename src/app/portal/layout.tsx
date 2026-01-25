import type { Metadata } from 'next';
import { PortalSidebar } from '@/components/features/portal';
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

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.portalLayout}>
      {/* Collapsible Sidebar */}
      <PortalSidebar />

      {/* Main Content */}
      <main className={styles.mainContent} id="main-content">
        {children}
      </main>
    </div>
  );
}
