'use client';

import { useEffect, useState, useReducer, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Satellite, CheckCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { ManualRoofEntry, type ManualRoofData } from '@/components/features/quote';
import { useFunnelTracker } from '@/hooks';
import {
  measurementReducer,
  initialContext,
  checkTimeout,
} from '@/lib/measurement';
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
  const funnelTracker = useFunnelTracker();
  const startTimeRef = useRef(Date.now());
  const hasTrackedStart = useRef(false);

  const [steps, setSteps] = useState(MEASUREMENT_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [context, dispatch] = useReducer(measurementReducer, initialContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissedDelay, setDismissedDelay] = useState(false);

  // Start the measurement process and track
  useEffect(() => {
    if (context.state === 'idle') {
      if (!hasTrackedStart.current) {
        funnelTracker.measurementRequested({ quoteId });
        hasTrackedStart.current = true;
      }
      dispatch({ type: 'REQUEST' });
    }
  }, [context.state, funnelTracker, quoteId]);

  // Check for timeout/delayed states
  useEffect(() => {
    if (context.state !== 'polling' && context.state !== 'requesting') return;

    const checkTimeoutInterval = setInterval(() => {
      const event = checkTimeout(context);
      if (event) {
        dispatch(event);
      }
    }, 1000);

    return () => clearInterval(checkTimeoutInterval);
  }, [context]);

  // Simulate measurement progress
  useEffect(() => {
    if (
      context.state !== 'requesting' &&
      context.state !== 'polling' &&
      context.state !== 'delayed'
    ) {
      return;
    }

    // Simulate transition from requesting to polling
    if (context.state === 'requesting') {
      const timer = setTimeout(() => {
        dispatch({ type: 'REQUEST_SUCCESS', measurementId: `mock-${Date.now()}` });
      }, 500);
      return () => clearTimeout(timer);
    }

    // Simulate step progress
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
  }, [context.state, steps.length]);

  // Update step statuses based on current index
  useEffect(() => {
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

    // When all steps complete, update state and redirect
    if (currentStepIndex >= MEASUREMENT_STEPS.length && context.state === 'polling') {
      dispatch({
        type: 'POLL_SUCCESS',
        data: {
          sqftTotal: 2500,
          pitchPrimary: 6,
          complexity: 'moderate',
          source: 'roofr',
        },
      });
    }
  }, [currentStepIndex, context.state]);

  // Handle completion - track and redirect to packages
  useEffect(() => {
    if (context.state === 'complete') {
      const durationMs = Date.now() - startTimeRef.current;
      funnelTracker.measurementCompleted({
        quoteId,
        durationMs,
        source: context.data?.source || 'roofr',
      });
      setTimeout(() => {
        router.push(`/quote/${quoteId}/packages`);
      }, 500);
    }
  }, [context.state, context.data, quoteId, router, funnelTracker]);

  // Track timeout
  useEffect(() => {
    if (context.state === 'timeout') {
      const durationMs = Date.now() - startTimeRef.current;
      funnelTracker.measurementTimeout({ quoteId, durationMs });
    }
  }, [context.state, quoteId, funnelTracker]);

  // Handle manual entry submission
  const handleManualSubmit = useCallback(
    async (data: ManualRoofData) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/quotes/${quoteId}/manual-measurement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to save measurement');
        }

        const result = await response.json();
        router.push(result.nextStep);
      } catch {
        // Error handling is minimal here - the form handles validation
        setIsSubmitting(false);
      }
    },
    [quoteId, router]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    setCurrentStepIndex(0);
    setSteps(MEASUREMENT_STEPS);
    setDismissedDelay(false);
    dispatch({ type: 'RETRY' });
  }, []);

  // Handle entering manual entry mode
  const handleEnterManualEntry = useCallback(() => {
    dispatch({ type: 'MANUAL_ENTRY' });
  }, []);

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;

  const showDelayedBanner =
    context.state === 'delayed' && !dismissedDelay;
  const showTimeoutState = context.state === 'timeout';
  const showManualEntry = context.state === 'manual_entry';
  const showProgress =
    !showTimeoutState &&
    !showManualEntry &&
    (context.state === 'requesting' ||
      context.state === 'polling' ||
      context.state === 'delayed');

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Icon */}
        <div className={styles.iconWrapper}>
          {showTimeoutState ? (
            <AlertTriangle size={40} />
          ) : (
            <Satellite size={40} className={styles.icon} />
          )}
        </div>

        {/* Header */}
        <h1 className={styles.title}>
          {showManualEntry
            ? 'Enter Roof Details'
            : showTimeoutState
              ? 'Satellite Measurement Unavailable'
              : 'Measuring Your Roof'}
        </h1>
        <p className={styles.subtitle}>
          {showManualEntry
            ? "Enter your roof measurements below and we'll generate your quote."
            : showTimeoutState
              ? "We couldn't complete the satellite measurement. You can try again or enter your measurements manually."
              : "We're using satellite imagery to measure your roof. This typically takes less than a minute."}
        </p>

        {/* Progress Bar and Steps */}
        {showProgress && (
          <>
            <div className={styles.progressWrapper}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Measurement progress: ${completedCount} of ${steps.length} steps complete`}
                />
              </div>
              <span className={styles.progressText}>
                {completedCount} of {steps.length} steps complete
              </span>
            </div>

            <div className={styles.stepsList}>
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`${styles.step} ${styles[`step_${step.status}`]}`}
                >
                  <div className={styles.stepIcon}>
                    {step.status === 'completed' ? (
                      <CheckCircle size={20} aria-hidden="true" />
                    ) : step.status === 'in_progress' ? (
                      <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
                    ) : (
                      <div className={styles.stepDot} aria-hidden="true" />
                    )}
                  </div>
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delayed/Taking Longer Banner */}
        {showDelayedBanner && (
          <div className={styles.delayedBanner} role="alert">
            <div className={styles.delayedHeader}>
              <div className={styles.delayedIcon}>
                <Clock size={20} aria-hidden="true" />
              </div>
              <div className={styles.delayedContent}>
                <div className={styles.delayedTitle}>Taking longer than usual</div>
                <p className={styles.delayedText}>
                  Satellite imagery is taking a bit longer to process. You can continue
                  waiting or enter your measurements manually.
                </p>
              </div>
            </div>
            <div className={styles.delayedActions}>
              <button
                type="button"
                className={styles.keepWaitingButton}
                onClick={() => setDismissedDelay(true)}
              >
                Keep Waiting
              </button>
              <button
                type="button"
                className={styles.manualEntryButton}
                onClick={handleEnterManualEntry}
              >
                Enter Manually
              </button>
            </div>
          </div>
        )}

        {/* Timeout State */}
        {showTimeoutState && (
          <div className={styles.timeoutBanner}>
            <h2 className={styles.timeoutTitle}>No worries, we have options</h2>
            <p className={styles.timeoutText}>
              Our satellite measurement service is temporarily unavailable for your
              property. You can enter your roof details manually to continue.
            </p>
            <div className={styles.timeoutActions}>
              <button
                type="button"
                className={styles.retryButton}
                onClick={handleRetry}
              >
                Try Again
              </button>
              <button
                type="button"
                className={styles.manualEntryButton}
                onClick={handleEnterManualEntry}
              >
                Enter Manually
              </button>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <div className={styles.manualEntrySection}>
            <ManualRoofEntry
              onSubmit={handleManualSubmit}
              onCancel={handleRetry}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>
    </main>
  );
}
