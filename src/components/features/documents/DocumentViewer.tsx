'use client';

import { useRef, useEffect } from 'react';
import { X, Download, Printer, Share2, FileSignature } from 'lucide-react';
import { useDocument, DocumentData } from './DocumentContext';
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
      return <ScopeDocument {...props} />;
    default:
      return null;
  }
}

export function DocumentViewer() {
  const { isOpen, currentDocument, closeDocument } = useDocument();
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = () => {
    // In production, this would generate a PDF
    alert('PDF download would be triggered here');
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
            <button className={styles.actionButton} onClick={handleShare} title="Share">
              <Share2 size={18} />
            </button>
            <button className={styles.actionButton} onClick={handlePrint} title="Print">
              <Printer size={18} />
            </button>
            <button className={styles.actionButton} onClick={handleDownload} title="Download PDF">
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
