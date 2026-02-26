'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import styles from '../QuoteWizard.module.css';

interface ScheduleStepProps {
  quoteId: string;
  onNext: () => void;
}

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
}

export function ScheduleStep({ quoteId, onNext }: ScheduleStepProps) {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = date && timeSlot && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const scheduledDate = new Date(`${date}T${timeSlot === 'morning' ? '09:00' : '13:00'}:00`).toISOString();

      const response = await fetch(`/api/quotes/${quoteId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate,
          timeSlot,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to schedule');
      }

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.formField}>
        <label htmlFor="install-date" className={styles.label}>Preferred Installation Date</label>
        <input
          id="install-date"
          type="date"
          min={getMinDate()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.formField}>
        <span className={styles.label}>Time Preference</span>
        <div className={styles.timeSlotGroup}>
          <button
            type="button"
            className={`${styles.timeSlot} ${timeSlot === 'morning' ? styles.timeSlotSelected : ''}`}
            onClick={() => setTimeSlot('morning')}
            disabled={isSubmitting}
          >
            Morning (8am–12pm)
          </button>
          <button
            type="button"
            className={`${styles.timeSlot} ${timeSlot === 'afternoon' ? styles.timeSlotSelected : ''}`}
            onClick={() => setTimeSlot('afternoon')}
            disabled={isSubmitting}
          >
            Afternoon (12pm–5pm)
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={styles.primaryButton}
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Continue'}
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
