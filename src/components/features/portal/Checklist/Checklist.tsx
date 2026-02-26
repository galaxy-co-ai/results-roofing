'use client';

import { ChecklistStep } from './ChecklistStep';
import styles from './Checklist.module.css';

const CHECKLIST_STEPS = [
  { title: 'Get Your Quote', description: 'Enter your address and select your roofing package' },
  { title: 'Sign Your Contract', description: 'Review your contract and sign electronically' },
  { title: 'Book Your Consultation', description: 'Schedule a consultation with our team' },
  { title: 'Submit Your Deposit', description: 'Secure your installation date with a deposit' },
  { title: 'Installation Scheduled', description: 'Your installation date is being confirmed' },
];

interface ChecklistProps {
  activeStep: number; // 1-5
  stepCtas?: Record<number, { label: string; href?: string; onClick?: () => void }>;
}

export function Checklist({ activeStep, stepCtas = {} }: ChecklistProps) {
  const progressPercent = Math.max(20, ((activeStep - 1) / (CHECKLIST_STEPS.length - 1)) * 100);

  return (
    <div className={styles.checklist}>
      <div className={styles.progressBarTrack}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className={styles.steps}>
        {CHECKLIST_STEPS.map((step, index) => {
          const stepNum = index + 1;
          const status = stepNum < activeStep
            ? 'completed'
            : stepNum === activeStep
            ? 'active'
            : 'locked';

          const cta = stepCtas[stepNum];

          return (
            <ChecklistStep
              key={stepNum}
              stepNumber={stepNum}
              title={step.title}
              description={step.description}
              status={status}
              ctaLabel={cta?.label}
              ctaHref={cta?.href}
              onClickCta={cta?.onClick}
              dependencyText={status === 'locked' ? `Complete step ${activeStep} first` : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
