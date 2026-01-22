'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CreditCard, 
  Calendar, 
  CheckCircle,
  Clock,
  Home,
  Wrench,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { FAQBar } from '@/components/features/faq';
import styles from './page.module.css';

// Mock data - would come from database in production
const PROJECT_STATUS = {
  status: 'in_progress',
  currentPhase: 'Materials Ordered',
  nextMilestone: 'Installation',
  nextMilestoneDate: 'February 3, 2026',
  address: '123 Main Street, Austin, TX 78701',
  package: 'Better Package',
  totalPrice: 15000,
  depositPaid: 750,
  balanceDue: 14250,
  materials: 'GAF Timberline HDZ Architectural Shingles',
  warrantyYears: 30,
  estimatedDuration: '1-2 days',
  roofSize: '2,150 sq ft',
};

const TIMELINE_STEPS = [
  { id: 'contract', label: 'Contract Signed', status: 'completed', date: 'Jan 22, 2026' },
  { id: 'deposit', label: 'Deposit Paid', status: 'completed', date: 'Jan 22, 2026' },
  { id: 'materials', label: 'Materials Ordered', status: 'current', date: 'Jan 23, 2026' },
  { id: 'installation', label: 'Installation', status: 'pending', date: 'Feb 3, 2026' },
  { id: 'inspection', label: 'Final Inspection', status: 'pending', date: 'Feb 4, 2026' },
  { id: 'complete', label: 'Project Complete', status: 'pending', date: 'Feb 4, 2026' },
];

const QUICK_ACTIONS = [
  { 
    id: 'documents', 
    label: 'View Documents', 
    description: 'Contract, warranty, and permits',
    href: '/portal/documents', 
    icon: FileText,
    badge: '3 new',
  },
  { 
    id: 'payments', 
    label: 'Make a Payment', 
    description: 'Pay remaining balance',
    href: '/portal/payments', 
    icon: CreditCard,
    badge: null,
  },
  { 
    id: 'schedule', 
    label: 'View Schedule', 
    description: 'Installation timeline',
    href: '/portal/schedule', 
    icon: Calendar,
    badge: null,
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle size={18} className={styles.statusCompleted} />;
    case 'current':
      return <Clock size={18} className={styles.statusCurrent} />;
    default:
      return <div className={styles.statusPending} />;
  }
}

export default function DashboardPage() {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Project Dashboard</h1>
          <p className={styles.subtitle}>
            Track your roof replacement progress and manage your project
          </p>
        </div>
      </header>

      {/* Project Status Card */}
      <section className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <div className={styles.statusBadge}>
            <Wrench size={16} />
            <span>In Progress</span>
          </div>
          <span className={styles.statusPhase}>{PROJECT_STATUS.currentPhase}</span>
        </div>

        <div className={styles.propertyInfo}>
          <Home size={18} className={styles.propertyIcon} />
          <span className={styles.propertyAddress}>{PROJECT_STATUS.address}</span>
        </div>

        <div className={styles.nextMilestone}>
          <Calendar size={18} className={styles.milestoneIcon} />
          <span className={styles.milestoneText}>
            <strong>{PROJECT_STATUS.nextMilestone}</strong> scheduled for {PROJECT_STATUS.nextMilestoneDate}
          </span>
        </div>

        {/* Expandable Project Details */}
        <button 
          className={styles.detailsToggle}
          onClick={() => setDetailsExpanded(!detailsExpanded)}
          aria-expanded={detailsExpanded}
        >
          <span>Project Details</span>
          <ChevronDown 
            size={18} 
            className={`${styles.detailsChevron} ${detailsExpanded ? styles.detailsChevronOpen : ''}`}
          />
        </button>

        <div className={`${styles.projectDetails} ${detailsExpanded ? styles.projectDetailsOpen : ''}`}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Package</span>
              <span className={styles.detailValue}>{PROJECT_STATUS.package}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Roof Size</span>
              <span className={styles.detailValue}>{PROJECT_STATUS.roofSize}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Materials</span>
              <span className={styles.detailValue}>{PROJECT_STATUS.materials}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Est. Duration</span>
              <span className={styles.detailValue}>{PROJECT_STATUS.estimatedDuration}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Warranty</span>
              <span className={styles.detailValue}>{PROJECT_STATUS.warrantyYears} Years</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Project Total</span>
              <span className={styles.detailValue}>{formatCurrency(PROJECT_STATUS.totalPrice)}</span>
            </div>
          </div>
          
          <div className={styles.paymentSummary}>
            <div className={styles.paymentRow}>
              <span>Deposit Paid</span>
              <span className={styles.paymentPaid}>{formatCurrency(PROJECT_STATUS.depositPaid)}</span>
            </div>
            <div className={styles.paymentRow}>
              <span>Balance Due</span>
              <span className={styles.paymentDue}>{formatCurrency(PROJECT_STATUS.balanceDue)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        {/* Timeline */}
        <section className={styles.timelineCard}>
          <h2 className={styles.sectionTitle}>Project Timeline</h2>
          <ol className={styles.timeline}>
            {TIMELINE_STEPS.map((step, index) => (
              <li 
                key={step.id} 
                className={`${styles.timelineItem} ${styles[`timeline_${step.status}`]}`}
              >
                <div className={styles.timelineMarker}>
                  {getStatusIcon(step.status)}
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div className={styles.timelineConnector} />
                  )}
                </div>
                <div className={styles.timelineContent}>
                  <span className={styles.timelineLabel}>{step.label}</span>
                  <span className={styles.timelineDate}>{step.date}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Quick Actions */}
        <section className={styles.actionsCard}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsList}>
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.id} href={action.href} className={styles.actionItem}>
                <div className={styles.actionIcon}>
                  <action.icon size={22} />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionLabel}>{action.label}</span>
                  <span className={styles.actionDescription}>{action.description}</span>
                </div>
                {action.badge && (
                  <span className={styles.actionBadge}>{action.badge}</span>
                )}
                <ChevronRight size={18} className={styles.actionArrow} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* FAQ Bar */}
      <FAQBar />
    </div>
  );
}
