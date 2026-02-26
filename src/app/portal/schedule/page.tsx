'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, Users, CheckCircle2 } from 'lucide-react';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { EmptyStateLocked } from '@/components/features/portal/EmptyStateLocked/EmptyStateLocked';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { PortalPhase } from '@/lib/portal/phases';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './page.module.css';

const PREP_ITEMS = [
  'Clear driveway of vehicles',
  'Secure patio furniture and outdoor items',
  'Keep pets indoors during installation',
  'Remove fragile items near attic',
];

function InstallationDetails({ order }: { order: any }) {
  const installDate = order?.scheduledStartDate
    ? new Date(order.scheduledStartDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'To be confirmed';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Installation Details</h2>
        <span className={styles.confirmedBadge}>
          <CheckCircle2 size={14} />
          Confirmed
        </span>
      </div>
      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <div className={styles.detailLabel}>
            <Calendar size={14} />
            Installation Date
          </div>
          <div className={styles.detailValue}>{installDate}</div>
        </div>
        <div className={styles.detailItem}>
          <div className={styles.detailLabel}>
            <Clock size={14} />
            Time Window
          </div>
          <div className={styles.detailValue}>7:00 AM — 5:00 PM</div>
        </div>
        <div className={styles.detailItem}>
          <div className={styles.detailLabel}>
            <Users size={14} />
            Crew
          </div>
          <div className={styles.detailValue}>Team Alpha — 4 person crew</div>
        </div>
      </div>
    </div>
  );
}

function PreparationChecklist() {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Preparation Checklist</h2>
      <ul className={styles.prepList}>
        {PREP_ITEMS.map((item, i) => (
          <li key={i} className={styles.prepItem}>
            <div className={styles.checkbox} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScheduleContent({ email }: { email: string | null }) {
  const { phase, isLoading, order } = usePortalPhase(email);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <PortalHeader title="Schedule" />
        <div className={styles.skeletonBlock} style={{ height: 200 }} />
        <div className={styles.skeletonBlock} style={{ height: 200 }} />
      </div>
    );
  }

  const isLocked = !phase || phase.phase <= PortalPhase.QUOTED;

  return (
    <div className={styles.page}>
      <PortalHeader title="Schedule" />
      {isLocked ? (
        <EmptyStateLocked
          title="No Schedule Yet"
          description="Your installation timeline will appear after your deposit is confirmed."
          currentStep={phase?.checklistStep ?? 1}
          ctaLabel="Start Your Quote"
          ctaHref="/portal"
        />
      ) : (
        <>
          <InstallationDetails order={order} />
          <PreparationChecklist />
        </>
      )}
    </div>
  );
}

function ClerkSchedule() {
  const { user } = useUser();
  return <ScheduleContent email={user?.primaryEmailAddress?.emailAddress ?? null} />;
}

function DevSchedule() {
  return <ScheduleContent email={MOCK_USER.primaryEmailAddress.emailAddress} />;
}

export default function SchedulePage() {
  if (DEV_BYPASS_ENABLED) return <DevSchedule />;
  return <ClerkSchedule />;
}
