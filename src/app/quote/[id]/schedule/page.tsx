import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Check } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import styles from './page.module.css';

interface SchedulePageProps {
  params: Promise<{ id: string }>;
}

// Mock available time slots - in production this comes from Cal.com
const AVAILABLE_DATES = [
  { date: '2026-01-27', dayName: 'Monday', dayNum: '27', month: 'Jan' },
  { date: '2026-01-28', dayName: 'Tuesday', dayNum: '28', month: 'Jan' },
  { date: '2026-01-29', dayName: 'Wednesday', dayNum: '29', month: 'Jan' },
  { date: '2026-01-30', dayName: 'Thursday', dayNum: '30', month: 'Jan' },
  { date: '2026-01-31', dayName: 'Friday', dayNum: '31', month: 'Jan' },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM - 12:00 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 5:00 PM' },
];

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { id: quoteId } = await params;

  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });

  if (!quote || !quote.selectedTier) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link href={`/quote/${quoteId}/financing`} className={styles.backLink}>
          <ChevronLeft size={18} />
          Back to Payment Options
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Schedule Installation</h1>
          <p className={styles.subtitle}>
            Pick a date and time that works for you. We&apos;ll confirm your appointment via email and text.
          </p>
        </div>

        {/* Address Reminder */}
        <div className={styles.addressCard}>
          <MapPin size={18} className={styles.addressIcon} />
          <span>{quote.address}, {quote.city}, {quote.state} {quote.zip}</span>
        </div>

        {/* Date Selection */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Calendar size={20} />
            Select a Date
          </h2>
          <div className={styles.dateGrid}>
            {AVAILABLE_DATES.map((date, index) => (
              <button
                key={date.date}
                type="button"
                className={`${styles.dateCard} ${index === 0 ? styles.dateCard_selected : ''}`}
                aria-label={`Select ${date.dayName}, ${date.month} ${date.dayNum}`}
              >
                <span className={styles.dateDayName}>{date.dayName}</span>
                <span className={styles.dateDayNum}>{date.dayNum}</span>
                <span className={styles.dateMonth}>{date.month}</span>
                {index === 0 && <Check size={16} className={styles.dateCheck} />}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Clock size={20} />
            Select a Time Window
          </h2>
          <div className={styles.timeGrid}>
            {TIME_SLOTS.map((slot, index) => (
              <button
                key={slot.id}
                type="button"
                className={`${styles.timeCard} ${index === 0 ? styles.timeCard_selected : ''}`}
                aria-label={`Select ${slot.label} ${slot.time}`}
              >
                <span className={styles.timeLabel}>{slot.label}</span>
                <span className={styles.timeRange}>{slot.time}</span>
                {index === 0 && <Check size={16} className={styles.timeCheck} />}
              </button>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className={styles.infoNote}>
          <p>
            Your appointment will be held for 15 minutes while you complete the checkout process.
            Most roof installations are completed in 1-2 days.
          </p>
        </div>

        {/* Continue Button */}
        <Link href={`/quote/${quoteId}/contract`} className={styles.continueButton}>
          Continue to Contract Review
          <ChevronRight size={20} />
        </Link>
      </div>
    </main>
  );
}
