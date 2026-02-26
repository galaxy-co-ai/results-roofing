'use client';

import { useUser } from '@clerk/nextjs';
import { Eye, Download, Share2, Printer, FileCheck, ShieldCheck, Package } from 'lucide-react';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { EmptyStateLocked } from '@/components/features/portal/EmptyStateLocked/EmptyStateLocked';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { PortalPhase } from '@/lib/portal/phases';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { LucideIcon } from 'lucide-react';
import styles from './page.module.css';

interface DocumentRowProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  status?: 'signed' | 'pending';
}

function DocumentRow({ title, subtitle, icon: Icon, iconBg, status }: DocumentRowProps) {
  return (
    <div className={styles.documentRow}>
      <div className={styles.documentInfo}>
        <div className={styles.documentIcon} style={{ background: iconBg }}>
          <Icon size={18} />
        </div>
        <div className={styles.documentText}>
          <span className={styles.documentTitle}>{title}</span>
          <span className={styles.documentSubtitle}>{subtitle}</span>
        </div>
        {status === 'signed' && (
          <span className={styles.signedBadge}>Signed</span>
        )}
      </div>
      <div className={styles.documentActions}>
        <button className={styles.actionButton} aria-label="View document" title="View">
          <Eye size={16} />
        </button>
        <button className={styles.actionButton} aria-label="Download document" title="Download">
          <Download size={16} />
        </button>
        <button className={styles.actionButton} aria-label="Share document" title="Share">
          <Share2 size={16} />
        </button>
        <button className={styles.actionButton} aria-label="Print document" title="Print">
          <Printer size={16} />
        </button>
      </div>
    </div>
  );
}

function DocumentsList() {
  return (
    <div className={styles.documentsList}>
      <DocumentRow
        title="Roofing Contract"
        subtitle="Full replacement agreement"
        icon={FileCheck}
        iconBg="var(--rr-color-status-info-bg)"
        status="signed"
      />
      <DocumentRow
        title="Warranty Certificate"
        subtitle="30-year GAF Golden Pledge"
        icon={ShieldCheck}
        iconBg="var(--rr-color-status-success-bg)"
      />
      <DocumentRow
        title="Materials Specification"
        subtitle="GAF Timberline HDZ specifications"
        icon={Package}
        iconBg="var(--rr-color-status-warning-bg)"
      />
    </div>
  );
}

function DocumentsContent({ email }: { email: string | null }) {
  const { phase, isLoading } = usePortalPhase(email);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <PortalHeader title="Documents" />
        <div className={styles.skeletonBlock} style={{ height: 300 }} />
      </div>
    );
  }

  const isLocked = !phase || phase.phase <= PortalPhase.QUOTED;

  return (
    <div className={styles.page}>
      <PortalHeader title="Documents" />
      {isLocked ? (
        <EmptyStateLocked
          title="No Documents Yet"
          description="Your documents will appear after your contract is signed."
          currentStep={phase?.checklistStep ?? 1}
          ctaLabel="Start Your Quote"
          ctaHref="/portal"
        />
      ) : (
        <DocumentsList />
      )}
    </div>
  );
}

function ClerkDocuments() {
  const { user } = useUser();
  return <DocumentsContent email={user?.primaryEmailAddress?.emailAddress ?? null} />;
}

function DevDocuments() {
  return <DocumentsContent email={MOCK_USER.primaryEmailAddress.emailAddress} />;
}

export default function DocumentsPage() {
  if (DEV_BYPASS_ENABLED) return <DevDocuments />;
  return <ClerkDocuments />;
}
