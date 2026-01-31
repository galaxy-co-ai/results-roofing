'use client';

import { ArrowLeft } from 'lucide-react';
import { useWizard } from './WizardContext';
import styles from './WizardFooter.module.css';

/**
 * Mobile sticky footer with back/next navigation
 * Renders conditionally based on current state
 */
export function WizardFooter() {
  const { state, canGoBack, goBack, isLoading, context } = useWizard();

  // Don't show footer for certain states
  const hiddenStates = ['success', 'creatingQuote', 'savingTier', 'finalizing'];
  if (hiddenStates.includes(state)) {
    return null;
  }

  // Get summary text based on current state
  const getSummaryText = (): string => {
    switch (state) {
      case 'address':
        return context.address ? context.address.formattedAddress : 'Enter your address';
      case 'confirm':
        return 'Confirm your property';
      case 'select':
        return context.selectedTier
          ? `${context.selectedTier.charAt(0).toUpperCase() + context.selectedTier.slice(1)} package selected`
          : 'Choose a package';
      case 'schedule':
        return context.scheduledDate
          ? `Scheduled: ${context.scheduledDate.toLocaleDateString()}`
          : 'Pick a date & time';
      case 'contact':
        return 'Enter your contact info';
      case 'payment':
        return 'Complete payment';
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {/* Back button */}
        <div className={styles.backSection}>
          {canGoBack && (
            <button
              type="button"
              onClick={goBack}
              className={styles.backButton}
              disabled={isLoading}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </div>

        {/* Summary text (middle) */}
        <div className={styles.summary}>
          <span className={styles.summaryText}>{getSummaryText()}</span>
        </div>

        {/* Placeholder for alignment (actual CTA is in each step) */}
        <div className={styles.actionSection} />
      </div>
    </div>
  );
}

export default WizardFooter;
