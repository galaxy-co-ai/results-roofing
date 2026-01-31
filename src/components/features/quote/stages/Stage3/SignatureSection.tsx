'use client';

import { CheckCircle } from 'lucide-react';
import { SignatureCapture } from '@/components/features/contract/SignatureCapture';
import styles from './Stage3.module.css';

interface SignatureSectionProps {
  onSignatureSubmit: (signature: string, email: string) => Promise<void>;
  isComplete: boolean;
  isEnabled: boolean;
  isLoading?: boolean;
}

/**
 * Stage 3, Section 3: Signature
 * 
 * User signs the contract with typed signature.
 */
export function SignatureSection({
  onSignatureSubmit,
  isComplete,
  isEnabled,
  isLoading = false,
}: SignatureSectionProps) {
  // Show completed state
  if (isComplete) {
    return (
      <section className={`${styles.section} ${styles.section_complete}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber_complete}>
            <CheckCircle size={20} aria-hidden="true" />
          </div>
          <div className={styles.sectionHeaderText}>
            <h2 className={styles.sectionTitle}>Signature</h2>
            <p className={styles.sectionComplete}>Contract signed</p>
          </div>
        </div>
      </section>
    );
  }

  // Show disabled state
  if (!isEnabled) {
    return (
      <section className={`${styles.section} ${styles.section_disabled}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber_disabled}>3</div>
          <div className={styles.sectionHeaderText}>
            <h2 className={styles.sectionTitle_disabled}>Sign Contract</h2>
            <p className={styles.sectionSubtitle_disabled}>
              Review contract to continue
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNumber}>3</div>
        <div className={styles.sectionHeaderText}>
          <h2 className={styles.sectionTitle}>Sign Contract</h2>
          <p className={styles.sectionSubtitle}>
            Type your full legal name to sign the contract
          </p>
        </div>
      </div>

      <div className={styles.signatureWrapper}>
        <SignatureCapture
          onSignatureSubmit={onSignatureSubmit}
          disabled={isLoading}
        />
      </div>
    </section>
  );
}

export default SignatureSection;
