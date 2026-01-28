'use client';

import { ArrowLeft } from 'lucide-react';
import { ScheduleSelector } from '@/components/features/checkout/ScheduleSelector';
import styles from './Stage2.module.css';

interface ScheduleSelectionProps {
  selectedDate: Date | null;
  selectedTimeSlot: 'morning' | 'afternoon' | null;
  onScheduleSelect: (date: Date, timeSlot: 'morning' | 'afternoon') => void;
  onBack: () => void;
  isLoading?: boolean;
}

/**
 * Stage 2, Sub-step 2: Schedule Selection
 * 
 * User picks installation date and time slot.
 */
export function ScheduleSelection({
  selectedDate,
  selectedTimeSlot,
  onScheduleSelect,
  onBack,
  isLoading = false,
}: ScheduleSelectionProps) {
  return (
    <div className={styles.subStep}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Schedule Your Installation</h2>
        <p className={styles.subtitle}>
          Pick a date and time that works for you. We&apos;ll confirm availability and send you a
          reminder.
        </p>
      </div>

      {/* Schedule Selector */}
      <div className={styles.selectorWrapper}>
        <ScheduleSelector
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onDateChange={(_date) => {
            // Store date temporarily, wait for time slot
          }}
          onTimeSlotChange={(slot) => {
            if (selectedDate && slot) {
              onScheduleSelect(selectedDate, slot);
            }
          }}
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onBack}
          className={styles.backButton}
          disabled={isLoading}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Packages
        </button>
      </div>

      {/* Help text */}
      <p className={styles.helpText}>
        Installation typically takes 1-2 days depending on your roof size and complexity.
      </p>
    </div>
  );
}

export default ScheduleSelection;
