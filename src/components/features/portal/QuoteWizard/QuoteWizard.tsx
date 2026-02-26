'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './QuoteWizard.module.css';

type WizardStep = 'ADDRESS' | 'CONFIRM' | 'PACKAGE' | 'SCHEDULE' | 'CONTACT' | 'COMPLETE';

interface WizardState {
  step: WizardStep;
  quoteId: string | null;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
    placeId: string;
    formattedAddress: string;
  } | null;
  estimate: {
    sqft: number;
    sqftRange: { min: number; max: number };
    tiers: Array<{ tier: string; minPrice: number; maxPrice: number }>;
  } | null;
}

const INITIAL_STATE: WizardState = {
  step: 'ADDRESS',
  quoteId: null,
  address: null,
  estimate: null,
};

const STEP_TITLES: Record<WizardStep, { title: string; description: string }> = {
  ADDRESS: { title: 'Enter Your Address', description: 'We\'ll use satellite imagery to measure your roof' },
  CONFIRM: { title: 'Confirm Your Property', description: 'Make sure we have the right location' },
  PACKAGE: { title: 'Choose Your Package', description: 'Select the roofing package that fits your needs' },
  SCHEDULE: { title: 'Pick Your Date', description: 'Choose your preferred installation date' },
  CONTACT: { title: 'Your Contact Info', description: 'We\'ll send your quote details here' },
  COMPLETE: { title: '', description: '' },
};

interface QuoteWizardProps {
  email: string;
  onComplete: () => void;
}

export function QuoteWizard({ email, onComplete }: QuoteWizardProps) {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const queryClient = useQueryClient();

  const goTo = useCallback((step: WizardStep, updates?: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates, step }));
  }, []);

  const goBack = useCallback(() => {
    const backMap: Partial<Record<WizardStep, WizardStep>> = {
      CONFIRM: 'ADDRESS',
      PACKAGE: 'CONFIRM',
      SCHEDULE: 'PACKAGE',
      CONTACT: 'SCHEDULE',
    };
    const prev = backMap[state.step];
    if (prev) setState(s => ({ ...s, step: prev }));
  }, [state.step]);

  const handleComplete = useCallback(() => {
    setState(s => ({ ...s, step: 'COMPLETE' }));
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onComplete();
    }, 1500);
  }, [queryClient, onComplete]);

  const stepMeta = STEP_TITLES[state.step];

  if (state.step === 'COMPLETE') {
    return (
      <div className={styles.wizard}>
        <div className={styles.completionMoment}>
          <div className={styles.completionIcon}>✓</div>
          <h3 className={styles.completionTitle}>Your quote is ready!</h3>
          <p className={styles.completionDescription}>Review your quote details below</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wizard}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{stepMeta.title}</h3>
        <p className={styles.stepDescription}>{stepMeta.description}</p>
      </div>

      <div className={styles.stepContent} key={state.step}>
        <div className={styles.stepTransition}>
          {state.step === 'ADDRESS' && <div>AddressStep placeholder</div>}
          {state.step === 'CONFIRM' && <div>ConfirmStep placeholder</div>}
          {state.step === 'PACKAGE' && <div>PackageStep placeholder</div>}
          {state.step === 'SCHEDULE' && <div>ScheduleStep placeholder</div>}
          {state.step === 'CONTACT' && <div>ContactStep placeholder</div>}
        </div>
      </div>

      {state.step !== 'ADDRESS' && (
        <button type="button" onClick={goBack} className={styles.backLink}>
          ← Back
        </button>
      )}
    </div>
  );
}

export type { WizardState, WizardStep, QuoteWizardProps };
