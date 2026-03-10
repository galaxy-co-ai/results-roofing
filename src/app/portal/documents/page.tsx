'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Download,
  FileCheck,
  ShieldCheck,
  Package,
  FileText,
  Ruler,
  Loader2,
  FileQuestion,
  ClipboardList,
} from 'lucide-react';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { EmptyStateLocked } from '@/components/features/portal/EmptyStateLocked/EmptyStateLocked';
import { DocumentProvider, useDocument } from '@/components/features/documents/DocumentContext';
import { DocumentViewer } from '@/components/features/documents/DocumentViewer';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { PortalPhase } from '@/lib/portal/phases';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import type { LucideIcon } from 'lucide-react';
import type { DocumentType } from '@/components/features/documents/DocumentContext';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PortalDocument {
  id: string;
  name: string;
  type: string;
  url: string | null;
  source: 'gaf' | 'manual' | 'generated';
  status?: string;
  createdAt: string;
}

interface DocumentsResponse {
  documents: PortalDocument[];
  measurementStatus: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pick an icon + background colour based on document type / source */
function getDocumentMeta(doc: PortalDocument): { icon: LucideIcon; iconBg: string } {
  if (doc.source === 'gaf') {
    return { icon: Ruler, iconBg: 'var(--rr-color-status-info-bg)' };
  }

  switch (doc.type) {
    case 'contract':
    case 'deposit_authorization':
      return { icon: FileCheck, iconBg: 'var(--rr-color-status-info-bg)' };
    case 'warranty':
      return { icon: ShieldCheck, iconBg: 'var(--rr-color-status-success-bg)' };
    case 'invoice':
    case 'receipt':
      return { icon: FileText, iconBg: 'var(--rr-color-status-warning-bg)' };
    case 'quote':
      return { icon: ClipboardList, iconBg: 'var(--rr-color-status-info-bg)' };
    case 'materials':
      return { icon: Package, iconBg: 'var(--rr-color-status-info-bg)' };
    default:
      return { icon: Package, iconBg: 'var(--rr-color-status-warning-bg)' };
  }
}

/** Map portal API document type string to DocumentType for the viewer */
function toDocumentType(type: string): DocumentType {
  const typeMap: Record<string, DocumentType> = {
    contract: 'contract',
    deposit_authorization: 'deposit_authorization',
    receipt: 'receipt',
    invoice: 'invoice',
    quote: 'quote',
    materials: 'materials',
    measurement: 'measurement',
    warranty: 'warranty',
  };
  return typeMap[type] || 'scope';
}

/** Map portal document status to viewer status */
function toViewerStatus(status?: string): 'signed' | 'active' | 'paid' | 'pending' | 'approved' {
  if (status === 'signed' || status === 'completed') return 'signed';
  if (status === 'paid') return 'paid';
  if (status === 'approved') return 'approved';
  return 'active';
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

interface DocumentRowProps {
  doc: PortalDocument;
}

function DocumentRow({ doc }: DocumentRowProps) {
  const { openDocument } = useDocument();
  const { icon: Icon, iconBg } = getDocumentMeta(doc);
  const isSigned = doc.status === 'signed' || doc.status === 'completed';

  function handleView() {
    // GAF assets open in new tab (external PDFs)
    if (doc.source === 'gaf' && doc.url) {
      window.open(doc.url, '_blank', 'noopener');
      return;
    }
    // All other docs open in the preview modal
    openDocument({
      id: doc.id,
      type: toDocumentType(doc.type),
      title: doc.name,
      status: toViewerStatus(doc.status),
      date: doc.createdAt,
    });
  }

  async function handleDownload() {
    // GAF assets download directly from URL
    if (doc.source === 'gaf' && doc.url) {
      const a = window.document.createElement('a');
      a.href = doc.url;
      a.download = doc.name;
      a.click();
      return;
    }
    // All other docs download via PDF API
    try {
      const res = await fetch(`/api/portal/documents/${doc.id}/pdf`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${doc.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
    }
  }

  return (
    <div className={styles.documentRow}>
      <div className={styles.documentInfo} onClick={handleView} style={{ cursor: 'pointer' }}>
        <div className={styles.documentIcon} style={{ background: iconBg }}>
          <Icon size={18} />
        </div>
        <div className={styles.documentText}>
          <span className={styles.documentTitle}>{doc.name}</span>
          <span className={styles.documentSubtitle}>
            {doc.source === 'gaf' ? 'GAF QuickMeasure' : doc.type.replace(/_/g, ' ')}
          </span>
        </div>
        {isSigned && <span className={styles.signedBadge}>Signed</span>}
      </div>
      <div className={styles.documentActions}>
        <button
          className={styles.actionButton}
          aria-label="View document"
          title="View"
          onClick={handleView}
        >
          <Eye size={16} />
        </button>
        <button
          className={styles.actionButton}
          aria-label="Download document"
          title="Download"
          onClick={handleDownload}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Documents list
// ---------------------------------------------------------------------------

function DocumentsList({ orderId, quoteId }: { orderId: string | null; quoteId: string | null }) {
  const params = new URLSearchParams();
  if (orderId) params.set('orderId', orderId);
  if (quoteId) params.set('quoteId', quoteId);

  const { data, isLoading } = useQuery<DocumentsResponse>({
    queryKey: ['documents', orderId, quoteId],
    queryFn: async () => {
      const res = await fetch(`/api/portal/documents?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    },
    enabled: !!(orderId || quoteId),
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return <div className={styles.skeletonBlock} style={{ height: 200 }} />;
  }

  const documents = data?.documents ?? [];
  const measurementStatus = data?.measurementStatus ?? null;

  // GAF measurement is still processing — show a friendly state
  if (measurementStatus === 'processing' && documents.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Loader2 size={32} className={styles.spinnerIcon} />
        <p className={styles.emptyTitle}>Measurement in Progress</p>
        <p className={styles.emptyText}>
          Your GAF roof measurement is being processed. Documents will appear here once
          it&apos;s complete.
        </p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileQuestion size={32} className={styles.emptyIcon} />
        <p className={styles.emptyTitle}>No Documents Yet</p>
        <p className={styles.emptyText}>
          Documents like measurement reports, contracts, and warranties will appear here as
          your project progresses.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.documentsList}>
      {documents.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function DocumentsContent({ email }: { email: string | null }) {
  const { phase, isLoading, order, quote } = usePortalPhase(email);

  if (isLoading) {
    return (
      <div className={styles.page} aria-busy="true" aria-label="Loading documents">
        <PortalHeader title="Documents" />
        <div className={styles.skeletonBlock} style={{ height: 300 }} />
      </div>
    );
  }

  const isLocked = !phase || phase.phase <= PortalPhase.QUOTED;

  return (
    <DocumentProvider>
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
          (order || quote) && (
            <DocumentsList
              orderId={order?.id ?? null}
              quoteId={quote?.id ?? null}
            />
          )
        )}
      </div>
      <DocumentViewer />
    </DocumentProvider>
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
