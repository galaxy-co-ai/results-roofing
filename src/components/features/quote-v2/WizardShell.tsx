'use client';

import { type ReactNode } from 'react';
import { useWizardData } from './WizardContext';
import { WizardProgress, WizardProgressBar } from './WizardProgress';
import { WizardSidebar } from './WizardSidebar';
import { WizardFooter } from './WizardFooter';
import { StepAnimator } from './StepAnimator';

// Step components
import { PropertyAddress } from './steps/PropertyAddress';
import { PropertyConfirm } from './steps/PropertyConfirm';
import { PackageSelect } from './steps/PackageSelect';
import { CheckoutSchedule } from './steps/CheckoutSchedule';
import { CheckoutContact } from './steps/CheckoutContact';
import { CheckoutPayment } from './steps/CheckoutPayment';
import { CheckoutSuccess } from './steps/CheckoutSuccess';
import { LoadingStep } from './steps/LoadingStep';

import styles from './WizardShell.module.css';

/**
 * Maps state to step component
 */
function getStepComponent(state: string): ReactNode {
  switch (state) {
    case 'address':
      return <PropertyAddress />;
    case 'creatingQuote':
      return <LoadingStep message="Creating your quote..." />;
    case 'confirm':
      return <PropertyConfirm />;
    case 'select':
      return <PackageSelect />;
    case 'savingTier':
      return <LoadingStep message="Saving your selection..." />;
    case 'schedule':
      return <CheckoutSchedule />;
    case 'contact':
      return <CheckoutContact />;
    case 'finalizing':
      return <LoadingStep message="Processing your information..." />;
    case 'payment':
      return <CheckoutPayment />;
    case 'success':
      return <CheckoutSuccess />;
    default:
      return <PropertyAddress />;
  }
}

/**
 * Main wizard shell component
 * Handles layout, progress, sidebar, and step rendering
 */
export function WizardShell() {
  const { state } = useWizardData();

  // Success state has a different layout (full width, no sidebar)
  if (state === 'success') {
    return (
      <div className={styles.successLayout}>
        <StepAnimator>
          <CheckoutSuccess />
        </StepAnimator>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Mobile progress bar */}
      <div className={styles.mobileProgress}>
        <WizardProgressBar />
      </div>

      {/* Desktop progress */}
      <div className={styles.desktopProgress}>
        <WizardProgress />
      </div>

      {/* Main content area */}
      <div className={styles.content}>
        {/* Step content */}
        <main className={styles.main}>
          <StepAnimator>
            {getStepComponent(state)}
          </StepAnimator>
        </main>

        {/* Desktop sidebar */}
        <aside className={styles.sidebar}>
          <WizardSidebar />
        </aside>
      </div>

      {/* Mobile footer with navigation */}
      <div className={styles.mobileFooter}>
        <WizardFooter />
      </div>
    </div>
  );
}

export default WizardShell;
