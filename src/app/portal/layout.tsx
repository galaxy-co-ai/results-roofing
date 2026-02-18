import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
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

/**
 * Check if Clerk bypass is enabled for development
 */
const BYPASS_CLERK = process.env.BYPASS_CLERK === 'true';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <div className={styles.portalLayout} data-portal-layout>
      {/* Collapsible Sidebar */}
      <PortalSidebar />

      {/* Main Content */}
      <main className={styles.mainContent} id="main-content">
        {children}
      </main>
    </div>
  );

  // Skip ClerkProvider in bypass mode
  if (BYPASS_CLERK) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
