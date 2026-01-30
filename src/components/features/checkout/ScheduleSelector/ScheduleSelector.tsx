'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Calendar } from 'lucide-react';
import styles from './ScheduleSelector.module.css';

type TimeSlot = 'morning' | 'afternoon';

interface ScheduleSelectorProps {
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  onDateChange: (date: Date | null) => void;
  onTimeSlotChange: (slot: TimeSlot | null) => void;
  disabled?: boolean;
  className?: string;
  /** Compact mode for smaller calendar */
  compact?: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Generate mock available dates
 * Available: Weekdays, 3-30 days out
 */
function getAvailableDates(): Set<string> {
  const available = new Set<string>();
  const today = new Date();

  for (let i = 3; i <= 45; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip weekends
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    available.add(date.toISOString().split('T')[0]);
  }

  return available;
}

/**
 * ScheduleSelector - Calendar date picker with time slot selection
 */
export function ScheduleSelector({
  selectedDate,
  selectedTimeSlot,
  onDateChange,
  onTimeSlotChange,
  disabled = false,
  className = '',
  compact = false,
}: ScheduleSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // If a date is already selected, use that month
    if (selectedDate) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    // Otherwise, start at the month containing the first available date (3 days out)
    const firstAvailableDate = new Date();
    firstAvailableDate.setDate(firstAvailableDate.getDate() + 3);
    // Skip to next weekday if it falls on weekend
    while (firstAvailableDate.getDay() === 0 || firstAvailableDate.getDay() === 6) {
      firstAvailableDate.setDate(firstAvailableDate.getDate() + 1);
    }
    return new Date(firstAvailableDate.getFullYear(), firstAvailableDate.getMonth(), 1);
  });

  const availableDates = useMemo(() => getAvailableDates(), []);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    // Empty slots for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // All days in month
    for (let day = 1; day <= lastDate; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.has(date.toISOString().split('T')[0]);
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (disabled || !isDateAvailable(date) || isPastDate(date)) return;
    onDateChange(date);
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Prevent going to past months
  const canGoPrevious = () => {
    const today = new Date();
    return currentMonth > new Date(today.getFullYear(), today.getMonth(), 1);
  };

  return (
    <div className={`${styles.container} ${compact ? styles.container_compact : ''} ${className}`}>
      <div className={styles.header}>
        <Calendar size={compact ? 18 : 20} className={styles.headerIcon} aria-hidden="true" />
        <h3 className={styles.headerTitle}>Select a Date</h3>
      </div>

      {/* Calendar */}
      <div className={styles.calendar}>
        {/* Month navigation */}
        <div className={styles.monthNav}>
          <button
            type="button"
            onClick={goToPreviousMonth}
            disabled={disabled || !canGoPrevious()}
            className={styles.navButton}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.monthLabel}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            disabled={disabled}
            className={styles.navButton}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className={styles.weekdays}>
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className={styles.weekday}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className={styles.days}>
          {daysInMonth.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className={styles.dayEmpty} />;
            }

            const available = isDateAvailable(date);
            const selected = isDateSelected(date);
            const past = isPastDate(date);

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={disabled || !available || past}
                className={`
                  ${styles.day}
                  ${selected ? styles.day_selected : ''}
                  ${available && !past && !selected ? styles.day_available : ''}
                  ${!available || past ? styles.day_unavailable : ''}
                `}
                aria-label={`${formatSelectedDate(date)}${available ? ', available' : ', unavailable'}`}
                aria-pressed={selected}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot_available} />
            <span>Available</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot_unavailable} />
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {/* Time slot selection */}
      {selectedDate && (
        <div className={styles.timeSlots}>
          <p className={styles.selectedDateText}>
            Selected: <strong>{formatSelectedDate(selectedDate)}</strong>
          </p>

          <p className={styles.timeSlotLabel}>Choose a time</p>

          <div className={styles.timeSlotGrid}>
            <button
              type="button"
              onClick={() => onTimeSlotChange('morning')}
              disabled={disabled}
              className={`
                ${styles.timeSlotButton}
                ${selectedTimeSlot === 'morning' ? styles.timeSlotButton_selected : ''}
              `}
            >
              <Sun
                size={24}
                className={selectedTimeSlot === 'morning' ? styles.timeIconSelected : styles.timeIconMorning}
              />
              <span className={styles.timeSlotName}>Morning</span>
              <span className={styles.timeSlotRange}>8:00 AM - 12:00 PM</span>
            </button>

            <button
              type="button"
              onClick={() => onTimeSlotChange('afternoon')}
              disabled={disabled}
              className={`
                ${styles.timeSlotButton}
                ${selectedTimeSlot === 'afternoon' ? styles.timeSlotButton_selected : ''}
              `}
            >
              <Moon
                size={24}
                className={selectedTimeSlot === 'afternoon' ? styles.timeIconSelected : styles.timeIconAfternoon}
              />
              <span className={styles.timeSlotName}>Afternoon</span>
              <span className={styles.timeSlotRange}>12:00 PM - 5:00 PM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleSelector;
