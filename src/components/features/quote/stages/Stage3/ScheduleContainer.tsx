'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Phone, MessageSquare, Home, CheckCircle2, Sparkles } from 'lucide-react';
import { useQuoteWizard } from '../../QuoteWizardProvider';
import { StageIndicator } from '../../StageIndicator';
import styles from './Schedule.module.css';

interface ScheduleContainerProps {
  quoteId: string;
  quoteData: {
    address: string;
    sqft: number;
    selectedTier: {
      tier: string;
      displayName: string;
      totalPrice: number;
      depositAmount: number;
    };
    scheduledDate?: string;
    timeSlot?: string;
  };
}

// Map tier keys to display names
const TIER_DISPLAY_NAMES: Record<string, string> = {
  good: 'Essential',
  better: 'Preferred',
  best: 'Signature',
};

/**
 * Schedule Container - Stage 3: Schedule Installation
 * 
 * Streamlined flow:
 * 1. Compact quote summary (single line)
 * 2. Date & time selection (calendar)
 * 3. Contact info (phone + SMS consent) - shown after date/time selected
 * 4. Confirmation
 */
export function ScheduleContainer({ quoteId, quoteData }: ScheduleContainerProps) {
  const router = useRouter();
  const {
    state,
    setContact,
    setSchedule,
    setQuoteId,
    setError,
  } = useQuoteWizard();

  const [phone, setPhone] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    quoteData.scheduledDate ? new Date(quoteData.scheduledDate) : null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | null>(
    (quoteData.timeSlot as 'morning' | 'afternoon') || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure quote ID is set in context
  useEffect(() => {
    if (!state.quoteId && quoteId) {
      setQuoteId(quoteId);
    }
  }, [quoteId, state.quoteId, setQuoteId]);

  // Generate available dates (next 10 weekdays starting Feb 3, 2026)
  const getAvailableDates = useCallback(() => {
    const dates: Date[] = [];
    let daysAdded = 0;
    // Force start from February 3, 2026 (Monday)
    const currentDate = new Date(2026, 1, 3);

    while (daysAdded < 10) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate));
        daysAdded++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, []);

  const availableDates = getAvailableDates();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Date and time must be selected first
  const isScheduleSelected = selectedDate && selectedTimeSlot;
  const isFormValid = phone.replace(/\D/g, '').length === 10 && isScheduleSelected;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Save schedule to the quote
      const response = await fetch(`/api/quotes/${quoteId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          smsConsent,
          scheduledDate: selectedDate?.toISOString(),
          timeSlot: selectedTimeSlot,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to schedule installation');
      }

      // Update local state
      setContact(phone, smsConsent);
      if (selectedDate && selectedTimeSlot) {
        setSchedule(selectedDate, selectedTimeSlot);
      }

      // Redirect to confirm page for booking confirmation
      router.push(`/quote/${quoteId}/confirm`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule installation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tierDisplayName = TIER_DISPLAY_NAMES[quoteData.selectedTier.tier] || quoteData.selectedTier.displayName;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Schedule Installation</h1>
        <StageIndicator currentStage={3} quoteId={quoteId} />
      </div>

      {/* Compact Quote Summary */}
      <div className={styles.quoteSummaryBar}>
        <div className={styles.quoteSummaryContent}>
          <div className={styles.quoteSummaryIconWrapper}>
            <Home aria-hidden="true" />
          </div>
          <span className={styles.quoteSummaryAddress}>{quoteData.address}</span>
          <span className={styles.quoteSummaryDivider} aria-hidden="true" />
          <span className={styles.quoteSummaryTier}>
            <Sparkles className={styles.tierIcon} aria-hidden="true" />
            {tierDisplayName}
          </span>
          <span className={styles.quoteSummaryDivider} aria-hidden="true" />
          <span className={styles.quoteSummaryPrice}>
            ${quoteData.selectedTier.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Form */}
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        {/* Error display */}
        {state.error && (
          <div className={styles.errorBanner} role="alert">
            {state.error}
          </div>
        )}

        {/* Date Selection */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <Calendar />
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Select Date</h2>
              <p className={styles.sectionSubtitle}>Choose your preferred installation date</p>
            </div>
          </div>

          <div className={styles.dateGrid}>
            {availableDates.map((date) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={`${styles.dateButton} ${isSelected ? styles.dateButton_selected : ''}`}
                  onClick={() => setSelectedDate(date)}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <span className={styles.dateButtonCheck}>
                      <CheckCircle2 />
                    </span>
                  )}
                  <span className={styles.dateButtonText}>{formatDate(date)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Time Slot */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <Clock />
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Select Time</h2>
              <p className={styles.sectionSubtitle}>Crew arrives at window start</p>
            </div>
          </div>

          <div className={styles.timeSlotGrid}>
            <button
              type="button"
              className={`${styles.timeSlotButton} ${selectedTimeSlot === 'morning' ? styles.timeSlotButton_selected : ''}`}
              onClick={() => setSelectedTimeSlot('morning')}
              aria-pressed={selectedTimeSlot === 'morning'}
            >
              {selectedTimeSlot === 'morning' && (
                <span className={styles.timeSlotCheck}>
                  <CheckCircle2 />
                </span>
              )}
              <span className={styles.timeSlotLabel}>Morning</span>
              <span className={styles.timeSlotTime}>8 AM - 12 PM</span>
            </button>
            <button
              type="button"
              className={`${styles.timeSlotButton} ${selectedTimeSlot === 'afternoon' ? styles.timeSlotButton_selected : ''}`}
              onClick={() => setSelectedTimeSlot('afternoon')}
              aria-pressed={selectedTimeSlot === 'afternoon'}
            >
              {selectedTimeSlot === 'afternoon' && (
                <span className={styles.timeSlotCheck}>
                  <CheckCircle2 />
                </span>
              )}
              <span className={styles.timeSlotLabel}>Afternoon</span>
              <span className={styles.timeSlotTime}>12 PM - 5 PM</span>
            </button>
          </div>
        </section>

        {/* Confirmation Section - appears after date/time selected */}
        <AnimatePresence>
          {isScheduleSelected && (
            <motion.section 
              className={styles.confirmSection}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Selected Schedule Summary */}
              <div className={styles.confirmationHeader}>
                <div className={styles.confirmationIcon}>
                  <CheckCircle2 />
                </div>
                <div className={styles.confirmationDetails}>
                  <span className={styles.confirmationLabel}>Your appointment</span>
                  <span className={styles.confirmationDate}>
                    {formatSelectedDate(selectedDate)} • {selectedTimeSlot === 'morning' ? '8 AM - 12 PM' : '12 PM - 5 PM'}
                  </span>
                </div>
              </div>

              {/* Phone Section */}
              <div className={styles.phoneSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>
                    <Phone />
                  </div>
                  <div>
                    <h2 className={styles.sectionTitle}>Phone Number</h2>
                    <p className={styles.sectionSubtitle}>For confirmation & updates</p>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <input
                    id="phone"
                    type="tel"
                    className={styles.input}
                    placeholder="(555) 555-5555"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={14}
                    required
                    autoFocus
                  />
                </div>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                  />
                  <span className={styles.checkboxText}>
                    <MessageSquare className={styles.checkboxIcon} />
                    Send me text updates
                    <span className={styles.checkboxSubtext}>
                      Msg & data rates apply
                    </span>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 aria-hidden="true" />
                    Confirm Schedule
                  </>
                )}
              </button>

              <p className={styles.disclaimer}>
                Creates your account to manage your project
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

export default ScheduleContainer;
