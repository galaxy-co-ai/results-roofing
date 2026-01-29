'use client';

import { Home, Package, Calendar, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './HowItWorksStepper.module.css';

const STEPS = [
  {
    number: 1,
    title: 'Enter Your Address',
    description: 'We use satellite imagery to measure your roof',
    icon: Home,
  },
  {
    number: 2,
    title: 'Choose Your Package',
    description: 'Compare Essential, Preferred & Signature options',
    icon: Package,
  },
  {
    number: 3,
    title: 'Schedule Installation',
    description: 'Pick a date that works for you',
    icon: Calendar,
  },
  {
    number: 4,
    title: 'Get Your New Roof',
    description: 'Our certified crew handles everything',
    icon: CheckCircle,
  },
];

interface HowItWorksStepperProps {
  className?: string;
}

/**
 * HowItWorksStepper - A polished stepper showing the quote process
 *
 * Uses the same visual language as QuoteStepper for consistency.
 */
export function HowItWorksStepper({ className }: HowItWorksStepperProps) {
  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.stepper}>
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.number} className={styles.stepWrapper}>
              {/* Step */}
              <div className={styles.step}>
                <div className={styles.indicator}>
                  <Icon className={styles.icon} />
                </div>
                <div className={styles.content}>
                  <span className={styles.stepNumber}>Step {step.number}</span>
                  <h3 className={styles.title}>{step.title}</h3>
                  <p className={styles.description}>{step.description}</p>
                </div>
              </div>

              {/* Connector */}
              {!isLast && <div className={styles.connector} aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HowItWorksStepper;
