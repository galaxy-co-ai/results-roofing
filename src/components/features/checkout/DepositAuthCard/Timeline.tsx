import { Mail, Phone, Home, CheckCircle } from 'lucide-react';
import styles from './Timeline.module.css';

interface TimelineProps {
  installDate: string;
  className?: string;
}

/**
 * Timeline - Shows what happens after payment
 * Reduces anxiety by showing clear next steps
 */
export function Timeline({ installDate, className = '' }: TimelineProps) {
  const formattedDate = new Date(installDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const steps = [
    {
      icon: Mail,
      title: 'Instant Confirmation',
      description: "You'll receive an email confirmation within 5 minutes",
    },
    {
      icon: Phone,
      title: 'Pre-Installation Call',
      description: `We'll contact you 24 hours before your ${formattedDate} installation`,
    },
    {
      icon: Home,
      title: 'Installation Day',
      description: `Our certified crew arrives ${formattedDate} @ 8 AM`,
    },
    {
      icon: CheckCircle,
      title: 'Final Walkthrough',
      description: 'We inspect everything together and collect final payment',
    },
  ];

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.title}>What Happens Next?</h3>
      <ol className={styles.timeline}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={index} className={styles.step}>
              <div className={styles.stepNumber}>
                <span>{index + 1}</span>
              </div>
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <Icon size={16} className={styles.stepIcon} aria-hidden="true" />
                  <span className={styles.stepTitle}>{step.title}</span>
                </div>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default Timeline;
