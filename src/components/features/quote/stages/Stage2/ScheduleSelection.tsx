'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScheduleSelector } from '@/components/features/checkout/ScheduleSelector';
import styles from './Stage2.module.css';

interface ScheduleSelectionProps {
  address: string;
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
  address,
  selectedDate,
  selectedTimeSlot,
  onScheduleSelect,
  onBack,
  isLoading = false,
}: ScheduleSelectionProps) {
  // Local state for date selection (before time slot is chosen)
  const [localDate, setLocalDate] = useState<Date | null>(selectedDate);
  const [localTimeSlot, setLocalTimeSlot] = useState<'morning' | 'afternoon' | null>(selectedTimeSlot);

  // Sync local state with props when they change
  useEffect(() => {
    setLocalDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setLocalTimeSlot(selectedTimeSlot);
  }, [selectedTimeSlot]);

  const handleDateChange = (date: Date | null) => {
    setLocalDate(date);
    // If a time slot is already selected, trigger the callback
    if (date && localTimeSlot) {
      onScheduleSelect(date, localTimeSlot);
    }
  };

  const handleTimeSlotChange = (slot: 'morning' | 'afternoon' | null) => {
    setLocalTimeSlot(slot);
    // Trigger callback when both date and time slot are selected
    if (localDate && slot) {
      onScheduleSelect(localDate, slot);
    }
  };

  return (
    <div className={styles.subStep}>
      {/* Unified Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Schedule Installation</h1>
        <p className={styles.addressLine}>
          <span className={styles.addressLabel}>Quote for</span>
          <span className={styles.addressValue}>{address}</span>
        </p>
      </div>

      {/* Schedule Selector */}
      <div className={styles.scheduleSelectorWrapper}>
        <ScheduleSelector
          selectedDate={localDate}
          selectedTimeSlot={localTimeSlot}
          onDateChange={handleDateChange}
          onTimeSlotChange={handleTimeSlotChange}
          disabled={isLoading}
          compact
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
