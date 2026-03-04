'use client';

import { useRef, useEffect } from 'react';
import { X, Download, Printer, Share2, FileSignature } from 'lucide-react';
import { useDocument } from './DocumentContext';
import type { DocumentData } from './DocumentContext';
import { ContractDocument } from './templates/ContractDocument';
import { WarrantyDocument } from './templates/WarrantyDocument';
import { ReceiptDocument } from './templates/ReceiptDocument';
import { PermitDocument } from './templates/PermitDocument';
import { MaterialsDocument } from './templates/MaterialsDocument';
import { ScopeDocument } from './templates/ScopeDocument';
import styles from './DocumentViewer.module.css';

function getDocumentComponent(doc: DocumentData) {
  const props = { document: doc };
  
  switch (doc.type) {
    case 'contract':
      return <ContractDocument {...props} />;
    case 'warranty':
      return <WarrantyDocument {...props} />;
    case 'receipt':
      return <ReceiptDocument {...props} />;
    case 'permit':
      return <PermitDocument {...props} />;
    case 'materials':
      return <MaterialsDocument {...props} />;
    case 'scope':
    case 'quote':
      return <ScopeDocument {...props} />;
    case 'invoice':
    case 'deposit_authorization':
      return <ReceiptDocument {...props} />;
    default:
      return null;
  }
}

export function DocumentViewer() {
  const { isOpen, currentDocument, closeDocument } = useDocument();
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDocument();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeDocument]);

  // Focus trap + auto-focus + restore focus on close
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const modal = modalRef.current.querySelector('[class*="modal"]') as HTMLElement;
    if (modal) {
      const firstFocusable = modal.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!currentDocument) return;
    try {
      const res = await fetch(`/api/portal/documents/${currentDocument.id}/pdf`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${currentDocument.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && currentDocument) {
      try {
        await navigator.share({
          title: currentDocument.title,
          text: `View your ${currentDocument.title} from Results Roofing`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  const handleSign = () => {
    // In production, this would trigger Documenso e-signature
    alert('E-signature flow would be triggered here');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      closeDocument();
    }
  };

  if (!currentDocument) return null;

  const needsSignature = currentDocument.status === 'pending' && currentDocument.type === 'contract';

  return (
    <div 
      ref={modalRef}
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-title"
    >
      <div className={styles.modal}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 id="document-title" className={styles.title}>{currentDocument.title}</h2>
            <span className={`${styles.status} ${styles[currentDocument.status]}`}>
              {currentDocument.status}
            </span>
          </div>
          
          <div className={styles.actions}>
            {needsSignature && (
              <button className={styles.signButton} onClick={handleSign}>
                <FileSignature size={18} />
                <span>Sign Document</span>
              </button>
            )}
            <button className={styles.actionButton} onClick={handleShare} aria-label="Share document" title="Share">
              <Share2 size={18} />
            </button>
            <button className={styles.actionButton} onClick={handlePrint} aria-label="Print document" title="Print">
              <Printer size={18} />
            </button>
            <button className={styles.actionButton} onClick={handleDownload} aria-label="Download PDF" title="Download PDF">
              <Download size={18} />
            </button>
            <button className={styles.closeButton} onClick={closeDocument} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Document Content */}
        <div ref={contentRef} className={styles.content}>
          <div className={styles.documentWrapper}>
            {getDocumentComponent(currentDocument)}
          </div>
        </div>
      </div>
    </div>
  );
}
