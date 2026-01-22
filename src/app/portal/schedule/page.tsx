import type { Metadata } from 'next';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle,
  Sun,
  CloudSun,
  Truck,
  HardHat,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import { ScheduleSupport } from '@/components/features/support';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Schedule',
  description: 'View your installation schedule and project timeline.',
};

// Mock data - would come from database in production
const PROJECT_SCHEDULE = {
  installationDate: 'Monday, February 3, 2026',
  installationTime: '7:00 AM - 5:00 PM',
  estimatedDuration: '1-2 days',
  address: '123 Main Street, Austin, TX 78701',
  crewLead: 'Mike Rodriguez',
  crewSize: '4-5 crew members',
  weather: 'Sunny, 72°F',
};

const TIMELINE_EVENTS = [
  {
    id: 'materials',
    date: 'January 30, 2026',
    time: '8:00 AM - 12:00 PM',
    title: 'Material Delivery',
    description: 'GAF Timberline HDZ shingles and underlayment delivered',
    icon: Truck,
    status: 'upcoming',
  },
  {
    id: 'installation-1',
    date: 'February 3, 2026',
    time: '7:00 AM - 5:00 PM',
    title: 'Installation Day 1',
    description: 'Tear-off, decking inspection, underlayment installation',
    icon: HardHat,
    status: 'upcoming',
  },
  {
    id: 'installation-2',
    date: 'February 4, 2026',
    time: '7:00 AM - 3:00 PM',
    title: 'Installation Day 2',
    description: 'Shingle installation, flashing, cleanup',
    icon: HardHat,
    status: 'upcoming',
  },
  {
    id: 'inspection',
    date: 'February 4, 2026',
    time: '3:00 PM - 4:00 PM',
    title: 'Final Inspection',
    description: 'Quality check and project walkthrough with you',
    icon: ClipboardCheck,
    status: 'upcoming',
  },
];

const PREPARATION_TIPS = [
  'Move vehicles away from the driveway and work area',
  'Remove or secure loose items from your attic',
  'Protect fragile items on shelves (vibration from work)',
  'Inform neighbors about the upcoming work',
  'Ensure pets are kept indoors or away from the work area',
  'Clear access around the perimeter of your home',
];

export default function SchedulePage() {
  return (
    <div className={styles.schedulePage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Schedule</h1>
          <p className={styles.subtitle}>
            Track your installation timeline and prepare for the big day
          </p>
        </div>
      </header>

      {/* Installation Card */}
      <section className={styles.installationCard}>
        <div className={styles.installationBadge}>
          <Calendar size={16} />
          <span>Confirmed</span>
        </div>

        <div className={styles.installationMain}>
          <div className={styles.installationDate}>
            <h2 className={styles.dateTitle}>Installation Date</h2>
            <p className={styles.dateValue}>{PROJECT_SCHEDULE.installationDate}</p>
          </div>
          
          <div className={styles.installationDetails}>
            <div className={styles.detailItem}>
              <Clock size={18} className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Time Window</span>
                <span className={styles.detailValue}>{PROJECT_SCHEDULE.installationTime}</span>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <MapPin size={18} className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{PROJECT_SCHEDULE.address}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <Sun size={18} className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Weather Forecast</span>
                <span className={styles.detailValue}>{PROJECT_SCHEDULE.weather}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.crewInfo}>
          <h3 className={styles.crewTitle}>Your Crew</h3>
          <div className={styles.crewDetails}>
            <div className={styles.crewItem}>
              <span className={styles.crewLabel}>Crew Lead</span>
              <span className={styles.crewValue}>{PROJECT_SCHEDULE.crewLead}</span>
            </div>
            <div className={styles.crewItem}>
              <span className={styles.crewLabel}>Team Size</span>
              <span className={styles.crewValue}>{PROJECT_SCHEDULE.crewSize}</span>
            </div>
            <div className={styles.crewItem}>
              <span className={styles.crewLabel}>Est. Duration</span>
              <span className={styles.crewValue}>{PROJECT_SCHEDULE.estimatedDuration}</span>
            </div>
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
            Here's what you can do to prepare for a smooth installation:
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
