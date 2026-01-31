'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from '../WizardContext';
import styles from './CheckoutSchedule.module.css';

/**
 * Get the next N available dates (excluding Sundays)
 */
function getAvailableDates(startDate: Date, count: number): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  // Start from tomorrow
  current.setDate(current.getDate() + 1);

  while (dates.length < count) {
    // Skip Sundays (0)
    if (current.getDay() !== 0) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Format date for display
 */
function formatDayName(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

function formatDayNumber(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date);
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
}

function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Step 3a: Schedule inspection date and time
 */
export function CheckoutSchedule() {
  const { context, setSchedule, goBack } = useWizard();
  const [selectedDate, setSelectedDate] = useState<Date | null>(context.scheduledDate);
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'afternoon' | null>(context.timeSlot);
  const [weekOffset, setWeekOffset] = useState(0);

  // Get available dates for current view
  const availableDates = useMemo(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + weekOffset * 7);
    return getAvailableDates(startDate, 7);
  }, [weekOffset]);

  // Check if a date is selected
  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot: 'morning' | 'afternoon') => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedDate && selectedSlot) {
      setSchedule(selectedDate, selectedSlot);
    }
  };

  const canContinue = selectedDate !== null && selectedSlot !== null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Calendar size={24} />
        </div>
        <h1 className={styles.title}>Schedule Your Inspection</h1>
        <p className={styles.subtitle}>
          Pick a date and time for your free on-site roof inspection
        </p>
      </div>

      {/* Date picker */}
      <div className={styles.dateSection}>
        <div className={styles.dateHeader}>
          <h2 className={styles.sectionTitle}>Select a Date</h2>
          <div className={styles.weekNav}>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
              disabled={weekOffset === 0}
              className={styles.weekNavButton}
              aria-label="Previous week"
            >
              <ChevronLeft size={20} />
            </button>
            <span className={styles.weekLabel}>
              {formatMonth(availableDates[0])} {formatDayNumber(availableDates[0])} -{' '}
              {formatMonth(availableDates[availableDates.length - 1])}{' '}
              {formatDayNumber(availableDates[availableDates.length - 1])}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className={styles.weekNavButton}
              aria-label="Next week"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className={styles.dateGrid} role="listbox" aria-label="Available dates">
          {availableDates.map((date, index) => (
            <button
              key={index}
              type="button"
              role="option"
              aria-selected={isDateSelected(date)}
              onClick={() => handleDateSelect(date)}
              className={`${styles.dateCard} ${isDateSelected(date) ? styles.dateSelected : ''}`}
              aria-label={formatFullDate(date)}
            >
              <span className={styles.dateDayName}>{formatDayName(date)}</span>
              <span className={styles.dateDayNumber}>{formatDayNumber(date)}</span>
              <span className={styles.dateMonth}>{formatMonth(date)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slot picker */}
      <div className={styles.timeSection}>
        <h2 className={styles.sectionTitle} id="time-section-label">Select a Time</h2>
        <div className={styles.timeSlots} role="radiogroup" aria-labelledby="time-section-label">
          <button
            type="button"
            role="radio"
            aria-checked={selectedSlot === 'morning'}
            onClick={() => handleSlotSelect('morning')}
            className={`${styles.timeSlot} ${selectedSlot === 'morning' ? styles.timeSelected : ''}`}
          >
            <Clock size={18} aria-hidden="true" />
            <div className={styles.timeContent}>
              <span className={styles.timeLabel}>Morning</span>
              <span className={styles.timeRange}>8:00 AM - 12:00 PM</span>
            </div>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selectedSlot === 'afternoon'}
            onClick={() => handleSlotSelect('afternoon')}
            className={`${styles.timeSlot} ${selectedSlot === 'afternoon' ? styles.timeSelected : ''}`}
          >
            <Clock size={18} aria-hidden="true" />
            <div className={styles.timeContent}>
              <span className={styles.timeLabel}>Afternoon</span>
              <span className={styles.timeRange}>12:00 PM - 5:00 PM</span>
            </div>
          </button>
        </div>
      </div>

      {/* Selection summary */}
      {selectedDate && selectedSlot && (
        <div className={styles.summary}>
          <Calendar size={16} />
          <span>
            {formatFullDate(selectedDate)},{' '}
            {selectedSlot === 'morning' ? '8 AM - 12 PM' : '12 PM - 5 PM'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          size="lg"
          className="w-full"
        >
          Continue
          <ArrowRight size={18} />
        </Button>
      </div>

      {/* Desktop back button */}
      <div className={styles.desktopNav}>
        <Button variant="ghost" onClick={goBack}>
          Back
        </Button>
      </div>

      {/* Note */}
      <p className={styles.note}>
        Our inspector will call 30 minutes before arrival. The inspection typically
        takes 45-60 minutes.
      </p>
    </div>
  );
}

export default CheckoutSchedule;
