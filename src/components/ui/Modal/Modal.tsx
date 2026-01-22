'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  /** Modal visibility */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Modal size */
  size?: ModalSize;
  /** Show close button */
  showClose?: boolean;
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Modal content */
  children: ReactNode;
}

/**
 * Modal dialog component with focus trap
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  showClose = true,
  closeOnBackdropClick = true,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element and focus the modal
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();

      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle keyboard events
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const modalContent = (
    <div 
      className={styles.backdrop}
      onClick={closeOnBackdropClick ? onClose : undefined}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${styles[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className={styles.header}>
            {title && (
              <div>
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
                {description && (
                  <p id="modal-description" className={styles.description}>
                    {description}
                  </p>
                )}
              </div>
            )}
            {showClose && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );

  // Render to portal
  if (typeof window === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}

export default Modal;
