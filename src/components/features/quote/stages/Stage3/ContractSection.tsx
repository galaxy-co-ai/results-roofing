'use client';

import { useState } from 'react';
import { FileText, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Stage3.module.css';

interface ContractSectionProps {
  quoteId: string;
  quoteData: {
    address: string;
    sqft: number;
    selectedTier: {
      tier: string;
      displayName: string;
      totalPrice: number;
      depositAmount: number;
    };
    scheduledDate?: string;
    timeSlot?: string;
  };
  onView: () => void;
  onAgree: () => void;
  isComplete: boolean;
  isEnabled: boolean;
}

/**
 * Stage 3, Section 2: Contract Review
 * 
 * User reviews contract terms before signing.
 */
export function ContractSection({
  quoteId,
  quoteData,
  onView,
  onAgree,
  isComplete,
  isEnabled,
}: ContractSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Track when user has scrolled through contract
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setScrolledToBottom(true);
      onView();
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show completed state
  if (isComplete) {
    return (
      <section className={`${styles.section} ${styles.section_complete}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber_complete}>
            <CheckCircle size={20} aria-hidden="true" />
          </div>
          <div className={styles.sectionHeaderText}>
            <h2 className={styles.sectionTitle}>Contract Review</h2>
            <p className={styles.sectionComplete}>Reviewed and accepted</p>
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
          <div className={styles.sectionNumber_disabled}>2</div>
          <div className={styles.sectionHeaderText}>
            <h2 className={styles.sectionTitle_disabled}>Contract Review</h2>
            <p className={styles.sectionSubtitle_disabled}>
              Complete contact info to continue
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNumber}>2</div>
        <div className={styles.sectionHeaderText}>
          <h2 className={styles.sectionTitle}>Contract Review</h2>
          <p className={styles.sectionSubtitle}>
            Please review the terms of your roof replacement contract
          </p>
        </div>
      </div>

      {/* Contract toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={styles.contractToggle}
        aria-expanded={expanded}
      >
        <FileText size={18} aria-hidden="true" />
        <span>View Contract Details</span>
        {expanded ? (
          <ChevronUp size={18} aria-hidden="true" />
        ) : (
          <ChevronDown size={18} aria-hidden="true" />
        )}
      </button>

      {/* Contract content */}
      {expanded && (
        <div
          className={styles.contractContent}
          onScroll={handleScroll}
          tabIndex={0}
          role="document"
          aria-label="Contract terms"
        >
          <h3 className={styles.contractHeading}>
            Roofing Installation Agreement
          </h3>
          
          <p className={styles.contractText}>
            This agreement is made between Results Roofing (&quot;Contractor&quot;) and the
            property owner (&quot;Customer&quot;) for the following work:
          </p>

          <div className={styles.contractDetails}>
            <div className={styles.contractRow}>
              <span className={styles.contractLabel}>Property Address:</span>
              <span className={styles.contractValue}>{quoteData.address}</span>
            </div>
            <div className={styles.contractRow}>
              <span className={styles.contractLabel}>Roof Size:</span>
              <span className={styles.contractValue}>{quoteData.sqft.toLocaleString()} sq ft</span>
            </div>
            <div className={styles.contractRow}>
              <span className={styles.contractLabel}>Selected Package:</span>
              <span className={styles.contractValue}>{quoteData.selectedTier.displayName}</span>
            </div>
            <div className={styles.contractRow}>
              <span className={styles.contractLabel}>Total Price:</span>
              <span className={styles.contractValue}>{formatPrice(quoteData.selectedTier.totalPrice)}</span>
            </div>
            <div className={styles.contractRow}>
              <span className={styles.contractLabel}>Deposit Amount:</span>
              <span className={styles.contractValue}>{formatPrice(quoteData.selectedTier.depositAmount)}</span>
            </div>
            {quoteData.scheduledDate && (
              <div className={styles.contractRow}>
                <span className={styles.contractLabel}>Scheduled Date:</span>
                <span className={styles.contractValue}>
                  {formatDate(quoteData.scheduledDate)}
                  {quoteData.timeSlot && ` (${quoteData.timeSlot})`}
                </span>
              </div>
            )}
          </div>

          <h4 className={styles.contractSubheading}>Scope of Work</h4>
          <ul className={styles.contractList}>
            <li>Complete tear-off of existing roofing materials</li>
            <li>Inspection and repair of roof decking as needed</li>
            <li>Installation of new underlayment and ice/water shield</li>
            <li>Installation of new shingles as specified</li>
            <li>Installation of new flashing and drip edge</li>
            <li>Full cleanup and disposal of debris</li>
            <li>Final inspection and walkthrough</li>
          </ul>

          <h4 className={styles.contractSubheading}>Terms and Conditions</h4>
          <ol className={styles.contractList}>
            <li>Work will be completed in accordance with local building codes.</li>
            <li>Contractor will obtain all necessary permits.</li>
            <li>Customer agrees to provide access to the property.</li>
            <li>Payment terms: 10% deposit due at signing, balance due upon completion.</li>
            <li>Warranty: Coverage as specified in selected package.</li>
            <li>Cancellation: 3-day cooling off period from signing date.</li>
          </ol>

          <h4 className={styles.contractSubheading}>Warranty Information</h4>
          <p className={styles.contractText}>
            Your roofing installation includes a manufacturer warranty on materials
            and a workmanship warranty from Results Roofing. Full warranty details
            will be provided upon completion.
          </p>

          {!scrolledToBottom && (
            <p className={styles.scrollHint}>
              ↓ Scroll to read full contract
            </p>
          )}
        </div>
      )}

      {/* View full contract link */}
      <a
        href={`/api/quotes/${quoteId}/contract/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.viewFullLink}
      >
        <ExternalLink size={16} aria-hidden="true" />
        View full contract (PDF)
      </a>

      {/* Agreement checkbox */}
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className={styles.checkbox}
          disabled={!scrolledToBottom && !expanded}
        />
        <span className={styles.checkboxText}>
          I have read and agree to the terms and conditions outlined in this contract.
        </span>
      </label>

      {/* Continue button */}
      <button
        type="button"
        onClick={onAgree}
        className={styles.submitButton}
        disabled={!agreed}
      >
        Accept & Continue
      </button>
    </section>
  );
}

export default ContractSection;
