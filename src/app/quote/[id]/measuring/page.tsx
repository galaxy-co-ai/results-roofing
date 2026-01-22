'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Satellite, CheckCircle, Loader2 } from 'lucide-react';
import styles from './page.module.css';

interface MeasurementStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const MEASUREMENT_STEPS: MeasurementStep[] = [
  { id: 'locate', label: 'Locating property', status: 'pending' },
  { id: 'imagery', label: 'Loading satellite imagery', status: 'pending' },
  { id: 'detect', label: 'Detecting roof edges', status: 'pending' },
  { id: 'measure', label: 'Calculating measurements', status: 'pending' },
  { id: 'pricing', label: 'Generating pricing options', status: 'pending' },
];

export default function MeasuringPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [steps, setSteps] = useState(MEASUREMENT_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate measurement progress
    // In production, this would poll an API or use websockets
    const progressInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(progressInterval);
  }, [steps.length]);

  useEffect(() => {
    // Update step statuses based on current index
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => ({
        ...step,
        status:
          index < currentStepIndex
            ? 'completed'
            : index === currentStepIndex
              ? 'in_progress'
              : 'pending',
      }))
    );

    // When all steps complete, redirect to packages page
    if (currentStepIndex >= MEASUREMENT_STEPS.length) {
      // In production, we'd update the quote with measurement data first
      // For now, simulate a delay then redirect
      setTimeout(() => {
        router.push(`/quote/${quoteId}/packages`);
      }, 1000);
    }
  }, [currentStepIndex, quoteId, router]);

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Icon */}
        <div className={styles.iconWrapper}>
          <Satellite size={40} className={styles.icon} />
        </div>

        {/* Header */}
        <h1 className={styles.title}>Measuring Your Roof</h1>
        <p className={styles.subtitle}>
          We're using satellite imagery to measure your roof. This typically
          takes less than a minute.
        </p>

        {/* Progress Bar */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {completedCount} of {steps.length} steps complete
          </span>
        </div>

        {/* Steps List */}
        <div className={styles.stepsList}>
          {steps.map((step) => (
            <div
              key={step.id}
              className={`${styles.step} ${styles[`step_${step.status}`]}`}
            >
              <div className={styles.stepIcon}>
                {step.status === 'completed' ? (
                  <CheckCircle size={20} />
                ) : step.status === 'in_progress' ? (
                  <Loader2 size={20} className={styles.spinner} />
                ) : (
                  <div className={styles.stepDot} />
                )}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </main>
  );
}
