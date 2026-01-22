'use client';

import { useState } from 'react';
import { 
  Home, 
  Clock, 
  Shield, 
  Sparkles, 
  Zap, 
  HelpCircle,
  ChevronRight 
} from 'lucide-react';
import styles from './MotivationCapture.module.css';

/**
 * Replacement motivation types
 */
export type ReplacementMotivation =
  | 'pre_sale_prep'
  | 'roof_age'
  | 'carrier_requirement'
  | 'curb_appeal'
  | 'energy_efficiency'
  | 'other';

interface MotivationOption {
  value: ReplacementMotivation;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MOTIVATION_OPTIONS: MotivationOption[] = [
  {
    value: 'pre_sale_prep',
    label: 'Preparing to sell my home',
    description: 'Maximize resale value with a new roof',
    icon: <Home size={24} />,
  },
  {
    value: 'roof_age',
    label: 'Roof is aging or end of life',
    description: 'Proactive replacement before issues arise',
    icon: <Clock size={24} />,
  },
  {
    value: 'carrier_requirement',
    label: 'Insurance carrier requiring replacement',
    description: 'Meet carrier requirements for coverage',
    icon: <Shield size={24} />,
  },
  {
    value: 'curb_appeal',
    label: 'Improving curb appeal',
    description: 'Enhance the look of your home',
    icon: <Sparkles size={24} />,
  },
  {
    value: 'energy_efficiency',
    label: 'Energy efficiency upgrade',
    description: 'Reduce energy costs with modern materials',
    icon: <Zap size={24} />,
  },
  {
    value: 'other',
    label: 'Other reason',
    description: "I'll share more details later",
    icon: <HelpCircle size={24} />,
  },
];

interface MotivationCaptureProps {
  /** Selection handler */
  onSelect: (motivation: ReplacementMotivation) => void;
  /** Skip handler (optional) */
  onSkip?: () => void;
  /** Currently selected value */
  value?: ReplacementMotivation;
  /** Additional CSS class */
  className?: string;
}

/**
 * Captures customer's roof replacement motivation (F17)
 * Used to personalize messaging and ROI calculations
 */
export function MotivationCapture({
  onSelect,
  onSkip,
  value,
  className = '',
}: MotivationCaptureProps) {
  const [selected, setSelected] = useState<ReplacementMotivation | undefined>(value);

  const handleSelect = (motivation: ReplacementMotivation) => {
    setSelected(motivation);
    onSelect(motivation);
  };

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <div className={styles.header}>
        <h2 className={styles.title}>What brings you here today?</h2>
        <p className={styles.subtitle}>
          This helps us show you the most relevant information
        </p>
      </div>

      <div 
        className={styles.options} 
        role="radiogroup" 
        aria-label="Replacement motivation"
      >
        {MOTIVATION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected === option.value}
            className={`${styles.option} ${selected === option.value ? styles.selected : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            <span className={styles.optionIcon} aria-hidden="true">
              {option.icon}
            </span>
            <div className={styles.optionContent}>
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionDescription}>{option.description}</span>
            </div>
            <ChevronRight 
              size={20} 
              className={styles.optionArrow} 
              aria-hidden="true" 
            />
          </button>
        ))}
      </div>

      {onSkip && (
        <button
          type="button"
          className={styles.skipButton}
          onClick={onSkip}
        >
          Skip this question
        </button>
      )}
    </div>
  );
}

export default MotivationCapture;
