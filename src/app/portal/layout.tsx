import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { PortalShell } from '@/components/features/portal/PortalSidebarV2/PortalShell';

/**
 * Force dynamic rendering for all portal pages
 * Required because portal uses Clerk's useUser() hook which needs runtime context
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'My Project',
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
  const content = <PortalShell>{children}</PortalShell>;

  // Skip ClerkProvider in bypass mode
  if (BYPASS_CLERK) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
