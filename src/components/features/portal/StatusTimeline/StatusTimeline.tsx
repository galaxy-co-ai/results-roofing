import { Check, Clock, Circle } from 'lucide-react';
import styles from './StatusTimeline.module.css';

type StepStatus = 'completed' | 'current' | 'upcoming';

interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  date?: string;
  status: StepStatus;
}

interface StatusTimelineProps {
  /** Timeline steps */
  steps: TimelineStep[];
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Additional CSS class */
  className?: string;
}

/**
 * Project status timeline for portal (F13)
 * Shows progress through project lifecycle
 */
export function StatusTimeline({
  steps,
  orientation = 'vertical',
  className = '',
}: StatusTimelineProps) {
  const containerClass = [
    styles.timeline,
    styles[orientation],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ol className={containerClass} aria-label="Project timeline">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`${styles.step} ${styles[step.status]}`}
        >
          {/* Connector line (not on first item) */}
          {index > 0 && (
            <div 
              className={styles.connector}
              aria-hidden="true"
            />
          )}

          {/* Status indicator */}
          <div className={styles.indicator} aria-hidden="true">
            {step.status === 'completed' ? (
              <Check size={14} />
            ) : step.status === 'current' ? (
              <Clock size={14} />
            ) : (
              <Circle size={8} />
            )}
          </div>

          {/* Content */}
          <div className={styles.content}>
            <span className={styles.label}>{step.label}</span>
            {step.description && (
              <span className={styles.description}>{step.description}</span>
            )}
            {step.date && (
              <span className={styles.date}>{step.date}</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default StatusTimeline;
