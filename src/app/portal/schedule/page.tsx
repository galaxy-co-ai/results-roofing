'use client';

import { useUser } from '@clerk/nextjs';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Sun,
  Truck,
  HardHat,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import { useOrders, useOrderDetails } from '@/hooks';
import { Skeleton } from '@/components/ui';
import { ScheduleSupport } from '@/components/features/support';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './page.module.css';

function formatDate(dateString: string | Date | null, format: 'full' | 'short' = 'full'): string {
  if (!dateString) return 'To be scheduled';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const PREPARATION_TIPS = [
  'Move vehicles away from the driveway and work area',
  'Remove or secure loose items from your attic',
  'Protect fragile items on shelves (vibration from work)',
  'Inform neighbors about the upcoming work',
  'Ensure pets are kept indoors or away from the work area',
  'Clear access around the perimeter of your home',
];

function ScheduleSkeleton() {
  return (
    <div className={styles.schedulePage}>
      <header className={styles.header}>
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="60%" height={20} />
      </header>
      <section className={styles.installationCard}>
        <Skeleton variant="rounded" width="100%" height={200} />
      </section>
      <div className={styles.twoColumn}>
        <Skeleton variant="rounded" width="100%" height={300} />
        <Skeleton variant="rounded" width="100%" height={300} />
      </div>
    </div>
  );
}

function ScheduleError() {
  return (
    <div className={styles.schedulePage}>
      <div className={styles.errorState} role="alert">
        <AlertCircle size={48} />
        <h2>Unable to load schedule</h2>
        <p>Please try refreshing the page.</p>
      </div>
    </div>
  );
}

function SchedulePendingState() {
  return (
    <div className={styles.schedulePage}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your <span className={styles.titleAccent}>Schedule</span></h1>
          <p className={styles.subtitle}>
            Your installation schedule will appear here after your deposit is confirmed
          </p>
        </div>
      </header>
      <div className={styles.errorState} role="status" style={{ borderColor: 'var(--gray-200)' }}>
        <Calendar size={48} style={{ color: 'var(--gray-400)' }} />
        <h2 style={{ color: 'var(--gray-700)' }}>No Schedule Yet</h2>
        <p>Once your deposit is confirmed, your full installation timeline and preparation details will appear here.</p>
      </div>
    </div>
  );
}

function ClerkSchedule() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  return <ScheduleContent userEmail={userEmail} userLoaded={isLoaded} />;
}

function DevSchedule() {
  const userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
  return <ScheduleContent userEmail={userEmail} userLoaded={true} />;
}

function ScheduleContent({ userEmail, userLoaded }: { userEmail: string | null; userLoaded: boolean }) {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useOrders(userEmail);
  const currentOrderId = ordersData?.orders?.[0]?.id ?? null;
  const { data: orderDetails, isLoading: detailsLoading, error: detailsError } = useOrderDetails(currentOrderId);

  if (!userLoaded || ordersLoading || (currentOrderId && detailsLoading)) {
    return <ScheduleSkeleton />;
  }

  if (ordersError || detailsError) {
    return <ScheduleError />;
  }

  if (!currentOrderId || !orderDetails) {
    return <SchedulePendingState />;
  }

  const { order } = orderDetails;

  // Build full address
  const fullAddress = `${order.propertyAddress}, ${order.propertyCity}, ${order.propertyState} ${order.propertyZip}`;

  // Calculate installation date + 1 for day 2
  const installDate = order.scheduledStartDate ? new Date(order.scheduledStartDate) : null;
  const installDay2 = installDate ? new Date(installDate.getTime() + 24 * 60 * 60 * 1000) : null;
  const materialsDate = installDate ? new Date(installDate.getTime() - 4 * 24 * 60 * 60 * 1000) : null;

  const TIMELINE_EVENTS = [
    {
      id: 'materials',
      date: materialsDate ? formatDate(materialsDate, 'short') : 'TBD',
      time: '8:00 AM - 12:00 PM',
      title: 'Material Delivery',
      description: 'Shingles and underlayment delivered to your property',
      icon: Truck,
      status: 'upcoming',
    },
    {
      id: 'installation-1',
      date: installDate ? formatDate(installDate, 'short') : 'TBD',
      time: '7:00 AM - 5:00 PM',
      title: 'Installation Day 1',
      description: 'Tear-off, decking inspection, underlayment installation',
      icon: HardHat,
      status: 'upcoming',
    },
    {
      id: 'installation-2',
      date: installDay2 ? formatDate(installDay2, 'short') : 'TBD',
      time: '7:00 AM - 3:00 PM',
      title: 'Installation Day 2',
      description: 'Shingle installation, flashing, cleanup',
      icon: HardHat,
      status: 'upcoming',
    },
    {
      id: 'inspection',
      date: installDay2 ? formatDate(installDay2, 'short') : 'TBD',
      time: '3:00 PM - 4:00 PM',
      title: 'Final Inspection',
      description: 'Quality check and project walkthrough with you',
      icon: ClipboardCheck,
      status: 'upcoming',
    },
  ];

  const isScheduled = !!order.scheduledStartDate;

  return (
    <div className={styles.schedulePage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your <span className={styles.titleAccent}>Schedule</span></h1>
          <p className={styles.subtitle}>
            Track your installation timeline and prepare for the big day
          </p>
        </div>
      </header>

      {/* Installation Card */}
      <section className={styles.installationCard}>
        <div className={styles.installationHeader}>
          <div className={styles.installationBadge}>
            <Calendar size={16} />
            <span>{isScheduled ? 'Confirmed' : 'Pending'}</span>
          </div>
          <div className={styles.dateHighlight}>
            <span className={styles.dateLabel}>Installation</span>
            <span className={styles.dateValue}>
              {order.scheduledStartDate ? formatDate(order.scheduledStartDate) : 'To be scheduled'}
            </span>
          </div>
        </div>

        <div className={styles.installationGrid}>
          <div className={styles.gridItem}>
            <div className={styles.gridHeader}>
              <div className={styles.gridIcon}>
                <Clock size={16} />
              </div>
              <span className={styles.gridLabel}>Time</span>
            </div>
            <span className={styles.gridValue}>7:00 AM - 5:00 PM</span>
          </div>

          <div className={styles.gridItem}>
            <div className={styles.gridHeader}>
              <div className={styles.gridIcon}>
                <MapPin size={16} />
              </div>
              <span className={styles.gridLabel}>Location</span>
            </div>
            <span className={styles.gridValue}>{fullAddress}</span>
          </div>

          <div className={styles.gridItem}>
            <div className={styles.gridHeader}>
              <div className={styles.gridIcon}>
                <Sun size={16} />
              </div>
              <span className={styles.gridLabel}>Weather</span>
            </div>
            <span className={styles.gridValue}>Check closer to date</span>
          </div>

          <div className={styles.gridItem}>
            <div className={styles.gridHeader}>
              <div className={styles.gridIcon}>
                <HardHat size={16} />
              </div>
              <span className={styles.gridLabel}>Crew</span>
            </div>
            <span className={styles.gridValue}>4-5 crew members</span>
          </div>

          <div className={styles.gridItem}>
            <div className={styles.gridHeader}>
              <div className={styles.gridIcon}>
                <Calendar size={16} />
              </div>
              <span className={styles.gridLabel}>Duration</span>
            </div>
            <span className={styles.gridValue}>1-2 days</span>
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        {/* Project Timeline */}
        <section className={styles.timelineCard}>
          <h2 className={styles.sectionTitle}>Project Timeline</h2>
          <div className={styles.timeline}>
            {TIMELINE_EVENTS.map((event, index) => (
              <article key={event.id} className={styles.timelineItem}>
                <div className={styles.timelineMarker}>
                  <div className={styles.timelineIcon}>
                    <event.icon size={18} />
                  </div>
                  {index < TIMELINE_EVENTS.length - 1 && (
                    <div className={styles.timelineConnector} />
                  )}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineDate}>{event.date}</span>
                    <span className={styles.timelineTime}>{event.time}</span>
                  </div>
                  <h3 className={styles.timelineTitle}>{event.title}</h3>
                  <p className={styles.timelineDescription}>{event.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Preparation Tips */}
        <section className={styles.tipsCard}>
          <h2 className={styles.sectionTitle}>Prepare for Installation</h2>
          <p className={styles.tipsIntro}>
            Here&apos;s what you can do to prepare for a smooth installation:
          </p>
          <ul className={styles.tipsList}>
            {PREPARATION_TIPS.map((tip, index) => (
              <li key={index} className={styles.tipItem}>
                <CheckCircle size={16} className={styles.tipIcon} />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <div className={styles.rescheduleNote}>
            <AlertCircle size={18} className={styles.rescheduleIcon} />
            <div className={styles.rescheduleContent}>
              <span className={styles.rescheduleTitle}>Need to reschedule?</span>
              <span className={styles.rescheduleText}>
                Contact us at least 48 hours before your scheduled date.
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Contact Card */}
      <ScheduleSupport />
    </div>
  );
}

export default function SchedulePage() {
  if (DEV_BYPASS_ENABLED) {
    return <DevSchedule />;
  }
  return <ClerkSchedule />;
}
