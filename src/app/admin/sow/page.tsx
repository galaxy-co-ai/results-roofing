'use client';

import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import styles from './page.module.css';

type Status = 'complete' | 'in_progress' | 'pending' | 'blocked';

interface Deliverable {
  name: string;
  status: Status;
  note?: string;
}

interface Phase {
  id: number;
  name: string;
  status: Status;
  deliverables: Deliverable[];
}

interface Blocker {
  item: string;
  owner: string;
  impact: string;
}

// SOW Data - In production, this could come from a database
const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Discovery & Kickoff',
    status: 'complete',
    deliverables: [
      { name: 'Kickoff meeting', status: 'complete' },
      { name: 'Access handoff (hosting, DNS, APIs)', status: 'pending', note: 'Awaiting client' },
      { name: 'Confirm domain & hosting', status: 'pending', note: 'Awaiting client' },
    ],
  },
  {
    id: 2,
    name: 'Foundations',
    status: 'in_progress',
    deliverables: [
      { name: 'Neon PostgreSQL setup', status: 'complete' },
      { name: 'Drizzle ORM migrations', status: 'complete' },
      { name: 'Clerk authentication', status: 'complete' },
      { name: 'JobNimbus CRM adapter', status: 'blocked', note: 'Awaiting API credentials' },
      { name: 'Roofr measurement adapter', status: 'blocked', note: 'Awaiting API credentials' },
      { name: 'Analytics infrastructure', status: 'complete' },
      { name: 'Event taxonomy defined', status: 'complete' },
    ],
  },
  {
    id: 3,
    name: 'Core Build',
    status: 'in_progress',
    deliverables: [
      { name: 'Address entry page', status: 'complete' },
      { name: 'Preliminary estimate', status: 'complete' },
      { name: 'Measuring (satellite)', status: 'complete', note: 'With timeout fallback' },
      { name: 'Package selection', status: 'complete' },
      { name: 'Financing options', status: 'pending', note: 'UI only - Wisetack stub' },
      { name: 'Appointment booking', status: 'pending', note: 'UI only - Cal.com stub' },
      { name: 'Contract signing', status: 'pending', note: 'UI only - Documenso stub' },
      { name: 'Payment (deposit)', status: 'complete', note: 'Stripe integration' },
      { name: 'Confirmation page', status: 'complete' },
      { name: 'Customer portal', status: 'in_progress', note: 'Dashboard done, others pending' },
    ],
  },
  {
    id: 4,
    name: 'Analytics & Tracking',
    status: 'complete',
    deliverables: [
      { name: 'GTM container loader', status: 'complete' },
      { name: 'dataLayer integration', status: 'complete' },
      { name: 'sGTM collection endpoint', status: 'complete' },
      { name: 'Funnel event tracking', status: 'complete' },
      { name: 'Conversion tracking', status: 'complete' },
      { name: 'Consent management', status: 'complete' },
    ],
  },
  {
    id: 5,
    name: 'Testing & QA',
    status: 'pending',
    deliverables: [
      { name: 'Cross-browser testing', status: 'pending' },
      { name: 'Mobile responsiveness', status: 'pending' },
      { name: 'Accessibility audit', status: 'pending' },
      { name: 'Performance optimization', status: 'pending' },
      { name: 'E2E test suite', status: 'in_progress' },
    ],
  },
  {
    id: 6,
    name: 'Launch Prep',
    status: 'pending',
    deliverables: [
      { name: 'Staging deployment', status: 'pending' },
      { name: 'DNS configuration', status: 'pending' },
      { name: 'SSL certificates', status: 'pending' },
      { name: 'Production deployment', status: 'pending' },
      { name: 'Monitoring setup', status: 'pending' },
    ],
  },
  {
    id: 7,
    name: 'Post-Launch',
    status: 'pending',
    deliverables: [
      { name: '30-day support period', status: 'pending' },
      { name: 'Bug fixes', status: 'pending' },
      { name: 'Feature flag system', status: 'pending' },
      { name: 'Documentation handoff', status: 'pending' },
    ],
  },
];

const BLOCKERS: Blocker[] = [
  { item: 'JobNimbus API credentials', owner: 'Client', impact: 'CRM sync blocked' },
  { item: 'Roofr API credentials', owner: 'Client', impact: 'Live measurements blocked' },
  { item: 'Documenso account setup', owner: 'Client', impact: 'E-signature blocked' },
  { item: 'Cal.com account setup', owner: 'Client', impact: 'Scheduling blocked' },
  { item: 'Wisetack partnership', owner: 'Client', impact: 'Financing blocked' },
  { item: 'GA4 property access', owner: 'Client', impact: 'Analytics reporting blocked' },
  { item: 'SignalWire account', owner: 'Client', impact: 'SMS notifications blocked' },
];

function getStatusIcon(status: Status) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 size={14} />;
    case 'in_progress':
      return <Clock size={14} />;
    case 'blocked':
      return <AlertTriangle size={14} />;
    default:
      return <Circle size={14} />;
  }
}

function getStatusLabel(status: Status) {
  switch (status) {
    case 'complete':
      return 'Complete';
    case 'in_progress':
      return 'In Progress';
    case 'blocked':
      return 'Blocked';
    default:
      return 'Pending';
  }
}

function calculatePhaseProgress(deliverables: Deliverable[]): number {
  const completed = deliverables.filter(d => d.status === 'complete').length;
  return Math.round((completed / deliverables.length) * 100);
}

function calculateOverallProgress(): number {
  const allDeliverables = PHASES.flatMap(p => p.deliverables);
  const completed = allDeliverables.filter(d => d.status === 'complete').length;
  return Math.round((completed / allDeliverables.length) * 100);
}

export default function SOWPage() {
  const overallProgress = calculateOverallProgress();
  const completedPhases = PHASES.filter(p => p.status === 'complete').length;
  const inProgressPhases = PHASES.filter(p => p.status === 'in_progress').length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Scope of Work</h1>
          <p className={styles.subtitle}>MVP B Progress Tracker</p>
        </div>
        <a
          href="/docs/SOW-PROGRESS-TRACKER.md"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.docLink}
        >
          <ExternalLink size={14} />
          View Full Doc
        </a>
      </header>

      {/* Overall Progress */}
      <div className={styles.overviewCard}>
        <div className={styles.overviewStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{overallProgress}%</span>
            <span className={styles.statLabel}>Complete</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{completedPhases}/{PHASES.length}</span>
            <span className={styles.statLabel}>Phases Done</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{inProgressPhases}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{BLOCKERS.length}</span>
            <span className={styles.statLabel}>Blockers</span>
          </div>
        </div>
        <div className={styles.overviewProgress}>
          <div 
            className={styles.overviewProgressFill} 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Phases Grid */}
      <div className={styles.phasesGrid}>
        {PHASES.map((phase) => {
          const progress = calculatePhaseProgress(phase.deliverables);
          const completedCount = phase.deliverables.filter(d => d.status === 'complete').length;
          
          return (
            <div key={phase.id} className={`${styles.phaseCard} ${styles[`phase_${phase.status}`]}`}>
              <div className={styles.phaseHeader}>
                <span className={styles.phaseNumber}>Phase {phase.id}</span>
                <span className={`${styles.phaseBadge} ${styles[`badge_${phase.status}`]}`}>
                  {getStatusIcon(phase.status)}
                  {getStatusLabel(phase.status)}
                </span>
              </div>
              
              <h3 className={styles.phaseName}>{phase.name}</h3>
              
              <div className={styles.phaseProgress}>
                <div className={styles.phaseProgressBar}>
                  <div 
                    className={styles.phaseProgressFill} 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={styles.phaseProgressText}>
                  {completedCount}/{phase.deliverables.length}
                </span>
              </div>
              
              <ul className={styles.deliverablesList}>
                {phase.deliverables.map((deliverable, idx) => (
                  <li 
                    key={idx} 
                    className={`${styles.deliverable} ${styles[`deliverable_${deliverable.status}`]}`}
                  >
                    <span className={styles.deliverableIcon}>
                      {getStatusIcon(deliverable.status)}
                    </span>
                    <span className={styles.deliverableName}>{deliverable.name}</span>
                    {deliverable.note && (
                      <span className={styles.deliverableNote}>{deliverable.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Blockers Section */}
      <div className={styles.blockersSection}>
        <h2 className={styles.sectionTitle}>
          <AlertTriangle size={18} />
          Blockers
        </h2>
        <div className={styles.blockersTable}>
          <div className={styles.blockersHeader}>
            <span>Item</span>
            <span>Owner</span>
            <span>Impact</span>
          </div>
          {BLOCKERS.map((blocker, idx) => (
            <div key={idx} className={styles.blockerRow}>
              <span className={styles.blockerItem}>{blocker.item}</span>
              <span className={styles.blockerOwner}>{blocker.owner}</span>
              <span className={styles.blockerImpact}>{blocker.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
