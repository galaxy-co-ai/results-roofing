'use client';

import { Loader2 } from 'lucide-react';
import styles from './LoadingStep.module.css';

interface LoadingStepProps {
  message?: string;
}

/**
 * Loading step displayed during async operations
 */
export function LoadingStep({ message = 'Loading...' }: LoadingStepProps) {
  return (
    <div className={styles.container}>
      <Loader2 className={styles.spinner} size={40} />
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default LoadingStep;
