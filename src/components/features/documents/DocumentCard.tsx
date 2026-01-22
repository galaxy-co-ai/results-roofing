'use client';

import { Download, Eye, FileText, Shield, Receipt, FileCheck, ClipboardList, Package } from 'lucide-react';
import { useDocument } from './DocumentContext';
import type { DocumentData, DocumentType } from './DocumentContext';
import styles from './DocumentCard.module.css';

const DOCUMENT_ICONS: Record<DocumentType, typeof FileText> = {
  contract: FileText,
  warranty: Shield,
  receipt: Receipt,
  permit: FileCheck,
  materials: Package,
  scope: ClipboardList,
};

const STATUS_LABELS: Record<string, string> = {
  signed: 'Signed',
  active: 'Active',
  paid: 'Paid',
  pending: 'Pending',
  approved: 'Approved',
};

interface DocumentCardProps {
  document: DocumentData;
  subtitle?: string;
  fileSize?: string;
}

export function DocumentCard({ document, subtitle, fileSize }: DocumentCardProps) {
  const { openDocument } = useDocument();
  const Icon = DOCUMENT_ICONS[document.type] || FileText;

  const handleClick = () => {
    openDocument(document);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In production, trigger PDF download
    alert('PDF download would be triggered here');
  };

  return (
    <button
      className={styles.card}
      onClick={handleClick}
      aria-label={`View ${document.title}`}
    >
      <div className={styles.iconWrapper}>
        <Icon size={24} className={styles.icon} />
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{document.title}</h3>
          <span className={`${styles.status} ${styles[document.status]}`}>
            {STATUS_LABELS[document.status]}
          </span>
        </div>
        
        <div className={styles.meta}>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          <span className={styles.date}>{document.date}</span>
          {fileSize && <span className={styles.size}>{fileSize}</span>}
        </div>
      </div>

      <div className={styles.actions}>
        <span className={styles.viewHint}>
          <Eye size={16} />
          <span>View</span>
        </span>
        <button
          className={styles.downloadButton}
          onClick={handleDownload}
          aria-label={`Download ${document.title}`}
        >
          <Download size={16} />
        </button>
      </div>
    </button>
  );
}
