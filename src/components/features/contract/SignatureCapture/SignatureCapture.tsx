'use client';

import { useState, useCallback } from 'react';
import { PenLine, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import styles from './SignatureCapture.module.css';

interface SignatureCaptureProps {
  expectedName?: string;
  onSignatureSubmit: (signature: string, email: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

function isValidSignature(signature: string, expectedName?: string): boolean {
  const trimmed = signature.trim();

  // Must have at least 2 characters
  if (trimmed.length < 2) return false;

  // Must contain at least one space (first and last name)
  if (!trimmed.includes(' ')) return false;

  // If expected name provided, must match (case-insensitive)
  if (expectedName) {
    return trimmed.toLowerCase() === expectedName.toLowerCase();
  }

  return true;
}

function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * SignatureCapture - Typed signature input with validation
 *
 * Requires full legal name (first and last)
 * Blocks submission until valid signature is entered
 * Includes terms agreement checkbox
 */
export function SignatureCapture({
  expectedName,
  onSignatureSubmit,
  disabled = false,
  className = '',
}: SignatureCaptureProps) {
  const [signature, setSignature] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const isValid = isValidSignature(signature, expectedName) && isValidEmail(email) && agreed;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting || disabled) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSignatureSubmit(signature.trim(), email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit signature');
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, disabled, signature, email, onSignatureSubmit]);

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value);
    if (error) setError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <PenLine size={20} className={styles.headerIcon} aria-hidden="true" />
        <h3 className={styles.headerTitle}>Sign Contract</h3>
      </div>

      <p className={styles.description}>
        By signing below, you agree to the terms and conditions of this contract.
        Please type your full legal name exactly as it appears on the contract.
      </p>

      {/* Expected name hint */}
      {expectedName && (
        <div className={styles.nameHint}>
          Please sign as: <strong>{expectedName}</strong>
        </div>
      )}

      {/* Signature input */}
      <div className={styles.inputWrapper}>
        <label htmlFor="signature-input" className={styles.inputLabel}>
          Your Signature
        </label>
        <div className={styles.inputContainer}>
          <input
            id="signature-input"
            type="text"
            value={signature}
            onChange={handleSignatureChange}
            placeholder="Type your full legal name"
            disabled={disabled || isSubmitting}
            className={styles.input}
            autoComplete="name"
            aria-describedby="signature-help"
          />
          {signature.length > 0 && isValidSignature(signature, expectedName) && (
            <CheckCircle size={20} className={styles.validIcon} aria-hidden="true" />
          )}
        </div>
        <p id="signature-help" className={styles.inputHelp}>
          Enter your first and last name
        </p>
      </div>

      {/* Signature preview */}
      {signature.length > 0 && (
        <div className={styles.preview}>
          <p className={styles.previewLabel}>Signature preview:</p>
          <p className={styles.previewSignature}>{signature}</p>
        </div>
      )}

      {/* Email input */}
      <div className={styles.inputWrapper}>
        <label htmlFor="email-input" className={styles.inputLabel}>
          Your Email
        </label>
        <div className={styles.inputContainer}>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="your@email.com"
            disabled={disabled || isSubmitting}
            className={styles.input}
            autoComplete="email"
            aria-describedby="email-help"
          />
          {email.length > 0 && isValidEmail(email) && (
            <CheckCircle size={20} className={styles.validIcon} aria-hidden="true" />
          )}
        </div>
        <p id="email-help" className={styles.inputHelp}>
          We&apos;ll send your contract and receipt here
        </p>
      </div>

      {/* ESIGN Act consent disclosure */}
      <div className={styles.esignDisclosure}>
        <p className={styles.esignTitle}>Electronic Signature Consent</p>
        <p className={styles.esignText}>
          By checking the box below and signing, you consent to use electronic
          signatures pursuant to the federal ESIGN Act (15 U.S.C. &sect; 7001 et seq.)
          and applicable state law. You agree that your electronic signature carries
          the same legal effect as a handwritten signature. You may withdraw this
          consent at any time by contacting us, but withdrawal will not affect the
          validity of signatures already provided.
        </p>
      </div>

      {/* Terms agreement */}
      <label className={styles.termsLabel}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={disabled || isSubmitting}
          className={styles.checkbox}
        />
        <span className={styles.termsText}>
          I have read and agree to the{' '}
          <a href="/terms" className={styles.termsLink}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className={styles.termsLink}>
            Privacy Policy
          </a>
          . I understand that this electronic signature is legally binding.
        </span>
      </label>

      {/* Error message */}
      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting || disabled}
        className={styles.submitButton}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className={styles.spinner} />
            Signing...
          </>
        ) : (
          'Sign & Continue'
        )}
      </button>

      {/* Validation hints */}
      {!isValid && (signature.length > 0 || email.length > 0) && (
        <div className={styles.hints}>
          {signature.length > 0 && !signature.includes(' ') && (
            <p className={styles.hint}>
              <AlertCircle size={12} />
              Please enter your full name (first and last)
            </p>
          )}
          {expectedName && signature.toLowerCase() !== expectedName.toLowerCase() && signature.includes(' ') && (
            <p className={styles.hint}>
              <AlertCircle size={12} />
              Signature must match: {expectedName}
            </p>
          )}
          {email.length > 0 && !isValidEmail(email) && (
            <p className={styles.hint}>
              <AlertCircle size={12} />
              Please enter a valid email address
            </p>
          )}
          {!agreed && (
            <p className={styles.hint}>
              <AlertCircle size={12} />
              Please agree to the terms and conditions
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SignatureCapture;
