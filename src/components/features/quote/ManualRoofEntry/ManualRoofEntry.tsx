'use client';

import { useState, useCallback } from 'react';
import { Home, HelpCircle, AlertCircle } from 'lucide-react';
import styles from './ManualRoofEntry.module.css';

/**
 * Manual roof entry data
 */
export interface ManualRoofData {
  sqftTotal: number;
  pitchPrimary: number;
  complexity: 'simple' | 'moderate' | 'complex';
  source: 'manual';
}

interface ManualRoofEntryProps {
  onSubmit: (data: ManualRoofData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * Pitch options with descriptions
 */
const PITCH_OPTIONS = [
  { value: 4, label: 'Low (4/12)', description: 'Nearly flat, easy to walk on' },
  { value: 6, label: 'Moderate (6/12)', description: 'Standard slope, walkable' },
  { value: 8, label: 'Steep (8/12)', description: 'Steeper angle, harder to walk on' },
  { value: 10, label: 'Very Steep (10/12+)', description: 'Requires special equipment' },
];

/**
 * Complexity options with descriptions
 */
const COMPLEXITY_OPTIONS: Array<{
  value: 'simple' | 'moderate' | 'complex';
  label: string;
  description: string;
}> = [
  {
    value: 'simple',
    label: 'Simple',
    description: 'Basic rectangle shape, few or no dormers, chimneys, or valleys',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Some angles and intersections, a few dormers or skylights',
  },
  {
    value: 'complex',
    label: 'Complex',
    description: 'Multiple roof sections, many dormers, valleys, or custom features',
  },
];

/**
 * Default conservative estimates for "I don't know" option
 */
const CONSERVATIVE_DEFAULTS: ManualRoofData = {
  sqftTotal: 2500,
  pitchPrimary: 6,
  complexity: 'moderate',
  source: 'manual',
};

/**
 * ManualRoofEntry component
 * Allows homeowners to enter roof dimensions manually when satellite
 * measurement is unavailable or times out.
 */
export function ManualRoofEntry({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ManualRoofEntryProps) {
  const [sqftTotal, setSqftTotal] = useState<string>('');
  const [pitchPrimary, setPitchPrimary] = useState<number | null>(null);
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const sqftNum = parseInt(sqftTotal, 10);
    if (!sqftTotal || isNaN(sqftNum)) {
      newErrors.sqftTotal = 'Please enter your roof size';
    } else if (sqftNum < 500) {
      newErrors.sqftTotal = 'Roof size seems too small (minimum 500 sq ft)';
    } else if (sqftNum > 15000) {
      newErrors.sqftTotal = 'Roof size seems too large (maximum 15,000 sq ft)';
    }

    if (pitchPrimary === null) {
      newErrors.pitchPrimary = 'Please select a roof pitch';
    }

    if (complexity === null) {
      newErrors.complexity = 'Please select roof complexity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [sqftTotal, pitchPrimary, complexity]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

      onSubmit({
        sqftTotal: parseInt(sqftTotal, 10),
        pitchPrimary: pitchPrimary!,
        complexity: complexity!,
        source: 'manual',
      });
    },
    [sqftTotal, pitchPrimary, complexity, validate, onSubmit]
  );

  const handleUseDefaults = useCallback(() => {
    onSubmit(CONSERVATIVE_DEFAULTS);
  }, [onSubmit]);

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Manual roof entry form"
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Home size={24} />
        </div>
        <h2 className={styles.title}>Enter Roof Details</h2>
        <p className={styles.subtitle}>
          If you know your roof measurements, enter them below. We&apos;ll use
          these to generate your quote.
        </p>
      </div>

      {/* Roof Size */}
      <div className={styles.field}>
        <label htmlFor="sqft" className={styles.label}>
          Roof Size (square feet)
          <button
            type="button"
            className={styles.helpButton}
            onClick={() => setShowHelp(!showHelp)}
            aria-label="Help with roof size"
          >
            <HelpCircle size={16} />
          </button>
        </label>
        {showHelp && (
          <p className={styles.helpText}>
            This is the total surface area of your roof, not your home&apos;s
            floor plan. Roof size is typically 1.2-1.5x your home&apos;s square
            footage depending on roof pitch.
          </p>
        )}
        <input
          id="sqft"
          type="number"
          inputMode="numeric"
          min="500"
          max="15000"
          step="100"
          value={sqftTotal}
          onChange={(e) => setSqftTotal(e.target.value)}
          placeholder="e.g., 2500"
          className={styles.input}
          aria-invalid={!!errors.sqftTotal}
          aria-describedby={errors.sqftTotal ? 'sqft-error' : undefined}
        />
        {errors.sqftTotal && (
          <p id="sqft-error" className={styles.error}>
            <AlertCircle size={14} />
            {errors.sqftTotal}
          </p>
        )}
      </div>

      {/* Roof Pitch */}
      <div className={styles.field}>
        <span className={styles.label}>Roof Pitch (steepness)</span>
        <div
          className={styles.optionGrid}
          role="radiogroup"
          aria-label="Roof pitch selection"
        >
          {PITCH_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.optionCard} ${
                pitchPrimary === option.value ? styles.optionSelected : ''
              }`}
            >
              <input
                type="radio"
                name="pitch"
                value={option.value}
                checked={pitchPrimary === option.value}
                onChange={() => setPitchPrimary(option.value)}
                className={styles.radioHidden}
              />
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionDescription}>
                {option.description}
              </span>
            </label>
          ))}
        </div>
        {errors.pitchPrimary && (
          <p className={styles.error}>
            <AlertCircle size={14} />
            {errors.pitchPrimary}
          </p>
        )}
      </div>

      {/* Complexity */}
      <div className={styles.field}>
        <span className={styles.label}>Roof Complexity</span>
        <div
          className={styles.complexityOptions}
          role="radiogroup"
          aria-label="Roof complexity selection"
        >
          {COMPLEXITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.complexityCard} ${
                complexity === option.value ? styles.optionSelected : ''
              }`}
            >
              <input
                type="radio"
                name="complexity"
                value={option.value}
                checked={complexity === option.value}
                onChange={() => setComplexity(option.value)}
                className={styles.radioHidden}
              />
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionDescription}>
                {option.description}
              </span>
            </label>
          ))}
        </div>
        {errors.complexity && (
          <p className={styles.error}>
            <AlertCircle size={14} />
            {errors.complexity}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Calculating...' : 'Calculate My Quote'}
        </button>

        <button
          type="button"
          className={styles.defaultsButton}
          onClick={handleUseDefaults}
          disabled={isSubmitting}
        >
          I don&apos;t know my measurements
        </button>

        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Try automatic measurement again
          </button>
        )}
      </div>

      <p className={styles.disclaimer}>
        We&apos;ll verify all measurements during our free inspection before
        finalizing your quote.
      </p>
    </form>
  );
}

export default ManualRoofEntry;
