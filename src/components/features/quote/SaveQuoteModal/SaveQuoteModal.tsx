'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuoteDraft } from '@/hooks/useQuoteDraft';
import type { QuoteDraftState } from '@/types';
import styles from './SaveQuoteModal.module.css';

interface SaveQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  draftState: Partial<QuoteDraftState>;
}

/**
 * Modal for capturing email and saving quote progress
 * Allows users to receive a resume link via email
 */
export function SaveQuoteModal({
  isOpen,
  onClose,
  quoteId,
  draftState: _draftState,
}: SaveQuoteModalProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { saveDraft, isSaving, saveError } = useQuoteDraft(quoteId);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus in modal
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) return;

    try {
      await saveDraft(email);
      setShowSuccess(true);
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
        setEmail('');
      }, 2500);
    } catch {
      // Error is handled by the hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-quote-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {showSuccess ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <CheckCircle size={48} aria-hidden="true" />
            </div>
            <h2 className={styles.successTitle}>Quote Saved!</h2>
            <p className={styles.successMessage}>
              Check your email for a link to resume your quote anytime.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.iconWrapper}>
              <Mail size={32} aria-hidden="true" />
            </div>

            <h2 id="save-quote-title" className={styles.title}>
              Save Your Quote
            </h2>
            <p className={styles.description}>
              Enter your email and we&apos;ll send you a link to pick up right where you left off.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="save-email" className={styles.label}>
                  Email Address
                </label>
                <input
                  ref={inputRef}
                  id="save-email"
                  type="email"
                  className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => email && validateEmail(email)}
                  disabled={isSaving}
                  autoComplete="email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailError && (
                  <p id="email-error" className={styles.errorText}>
                    {emailError}
                  </p>
                )}
              </div>

              {saveError && (
                <div className={styles.apiError} role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>
                    {saveError instanceof Error
                      ? saveError.message
                      : 'Failed to save quote. Please try again.'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  'Send Me The Link'
                )}
              </button>
            </form>

            <p className={styles.disclaimer}>
              We&apos;ll only use your email for this quote. Your link expires in 30 days.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default SaveQuoteModal;
