'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { 
  FileText, 
  CreditCard, 
  Calendar, 
  CheckCircle,
  Clock,
  Home,
  ChevronRight,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { useOrders, useOrderDetails } from '@/hooks';
import { FAQBar } from '@/components/features/faq';
import { Skeleton } from '@/components/ui';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './page.module.css';

const QUICK_ACTIONS = [
  { 
    id: 'documents', 
    label: 'View Documents', 
    description: 'Contract, warranty, and permits',
    href: '/portal/documents', 
    icon: FileText,
    badge: null,
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

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return 'TBD';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusIcon(status: 'completed' | 'current' | 'upcoming') {
  switch (status) {
    case 'completed':
      return <CheckCircle size={18} className={styles.statusCompleted} aria-hidden="true" />;
    case 'current':
      return <Clock size={18} className={styles.statusCurrent} aria-hidden="true" />;
    default:
      return <div className={styles.statusPending} aria-hidden="true" />;
  }
}

function getStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    deposit_paid: 'Deposit Paid',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusMap[status] || status;
}

function getTierDisplayName(tier: string): string {
  const tierMap: Record<string, string> = {
    good: 'Essential Package',
    better: 'Premium Package',
    best: 'Elite Package',
  };
  return tierMap[tier] || tier;
}

function getCurrentPhase(status: string): string {
  const phaseMap: Record<string, string> = {
    pending: 'Awaiting Deposit',
    deposit_paid: 'Materials Ordered',
    scheduled: 'Installation Scheduled',
    in_progress: 'Installation In Progress',
    completed: 'Project Complete',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return phaseMap[status] || 'Unknown';
}

/**
 * Loading skeleton for the dashboard
 */
function DashboardSkeleton() {
  return (
    <div className={styles.dashboard}>
      {/* Header Skeleton */}
      <header className={styles.header}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" height={20} />
      </header>

      {/* Status Card Skeleton */}
      <section className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <Skeleton variant="rounded" width={120} height={36} />
          <Skeleton variant="text" width={100} />
        </div>
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={48} />
      </section>

      {/* Two Column Skeleton */}
      <div className={styles.twoColumn}>
        <section className={styles.timelineCard}>
          <Skeleton variant="text" width="40%" height={24} />
          <div style={{ marginTop: '1rem' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <Skeleton variant="circular" width={18} height={18} />
                <div style={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.actionsCard}>
          <Skeleton variant="text" width="40%" height={24} />
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width="100%" height={76} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function DashboardError({ message }: { message: string }) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.errorState} role="alert">
        <AlertCircle size={48} aria-hidden="true" />
        <h2>Something went wrong</h2>
        <p>{message}</p>
        <Link href="/portal/dashboard" className={styles.retryLink}>
          Try Again
        </Link>
      </div>
    </div>
  );
}

/**
 * Empty state when user has no orders
 */
function NoOrdersState() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Project Dashboard</h1>
          <p className={styles.subtitle}>
            Track your roof replacement progress and manage your project
          </p>
        </div>
      </header>

      <div className={styles.emptyState}>
        <Home size={48} aria-hidden="true" />
        <h2>No Projects Yet</h2>
        <p>Start your roofing journey by getting a free quote.</p>
        <Link href="/quote/new" className={styles.ctaButton}>
          Get Your Free Quote
        </Link>
      </div>
    </div>
  );
}

/**
 * Dashboard with Clerk authentication
 */
function ClerkDashboard() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  return <DashboardContent userEmail={userEmail} userLoaded={isLoaded} />;
}

/**
 * Dashboard with mock user (dev bypass)
 */
function DevDashboard() {
  const userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
  return <DashboardContent userEmail={userEmail} userLoaded={true} />;
}

/**
 * Main dashboard content
 */
function DashboardContent({ userEmail, userLoaded }: { userEmail: string | null; userLoaded: boolean }) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Fetch user's orders
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useOrders(userEmail);

  // Get the most recent order (first in the list since it's sorted by createdAt desc)
  const currentOrderId = ordersData?.orders?.[0]?.id ?? null;

  // Fetch order details for the current order
  const { 
    data: orderDetails, 
    isLoading: detailsLoading, 
    error: detailsError 
  } = useOrderDetails(currentOrderId);

  // Loading state
  if (!userLoaded || ordersLoading || (currentOrderId && detailsLoading)) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (ordersError || detailsError) {
    return <DashboardError message="We couldn't load your project details. Please try again." />;
  }

  // No orders state
  if (!ordersData?.orders?.length || !orderDetails) {
    return <NoOrdersState />;
  }

  const { order, timeline } = orderDetails;

  // Build full address
  const fullAddress = `${order.propertyAddress}, ${order.propertyCity}, ${order.propertyState}`;

  // Get next milestone from timeline
  const nextMilestone = timeline.find(step => step.status === 'current' || step.status === 'upcoming');

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
      <section className={styles.statusCard} aria-labelledby="status-heading">
        <h2 id="status-heading" className="sr-only">Project Status</h2>
        
        <div className={styles.statusHeader}>
          <div className={styles.statusBadge}>
            <Calendar size={16} aria-hidden="true" />
            <span>{getStatusDisplayName(order.status)}</span>
          </div>
          <span className={styles.statusPhase}>{getCurrentPhase(order.status)}</span>
        </div>

        <div className={styles.propertyInfo}>
          <Home size={18} className={styles.propertyIcon} aria-hidden="true" />
          <span className={styles.propertyAddress}>{fullAddress}</span>
        </div>

        {nextMilestone && (
          <div className={styles.nextMilestone}>
            <Calendar size={18} className={styles.milestoneIcon} aria-hidden="true" />
            <span className={styles.milestoneText}>
              <strong>{nextMilestone.label}</strong>
              {order.scheduledStartDate 
                ? ` scheduled for ${formatDate(order.scheduledStartDate)}`
                : ' - date to be scheduled'
              }
            </span>
          </div>
        )}

        {/* Expandable Project Details */}
        <button 
          className={styles.detailsToggle}
          onClick={() => setDetailsExpanded(!detailsExpanded)}
          aria-expanded={detailsExpanded}
          aria-controls="project-details"
        >
          <span>Project Details</span>
          <ChevronDown 
            size={18} 
            className={`${styles.detailsChevron} ${detailsExpanded ? styles.detailsChevronOpen : ''}`}
            aria-hidden="true"
          />
        </button>

        <div 
          id="project-details"
          className={`${styles.projectDetails} ${detailsExpanded ? styles.projectDetailsOpen : ''}`}
        >
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Package</span>
              <span className={styles.detailValue}>{getTierDisplayName(order.selectedTier)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Confirmation</span>
              <span className={styles.detailValue}>{order.confirmationNumber}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Scheduled Date</span>
              <span className={styles.detailValue}>
                {order.scheduledStartDate ? formatDate(order.scheduledStartDate) : 'To be scheduled'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Project Total</span>
              <span className={styles.detailValue}>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
          
          <div className={styles.paymentSummary}>
            <div className={styles.paymentRow}>
              <span>Total Paid</span>
              <span className={styles.paymentPaid}>{formatCurrency(order.totalPaid)}</span>
            </div>
            <div className={styles.paymentRow}>
              <span>Balance Due</span>
              <span className={styles.paymentDue}>{formatCurrency(order.balance)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        {/* Timeline */}
        <section className={styles.timelineCard} aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className={styles.sectionTitle}>Project Timeline</h2>
          <ol className={styles.timeline} aria-label="Project progress timeline">
            {timeline.map((step, index) => (
              <li 
                key={step.id} 
                className={`${styles.timelineItem} ${styles[`timeline_${step.status}`]}`}
              >
                <div className={styles.timelineMarker}>
                  {getStatusIcon(step.status)}
                  {index < timeline.length - 1 && (
                    <div className={styles.timelineConnector} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.timelineContent}>
                  <span className={styles.timelineLabel}>{step.label}</span>
                  {step.date && (
                    <span className={styles.timelineDate}>{formatDate(step.date)}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Quick Actions */}
        <section className={styles.actionsCard} aria-labelledby="actions-heading">
          <h2 id="actions-heading" className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsList}>
            {QUICK_ACTIONS.map((action) => (
              <Link 
                key={action.id} 
                href={action.href} 
                className={styles.actionItem}
                aria-label={`${action.label}: ${action.description}`}
              >
                <div className={styles.actionIcon} aria-hidden="true">
                  <action.icon size={22} />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionLabel}>{action.label}</span>
                  <span className={styles.actionDescription}>{action.description}</span>
                </div>
                {action.badge && (
                  <span className={styles.actionBadge}>{action.badge}</span>
                )}
                <ChevronRight size={18} className={styles.actionArrow} aria-hidden="true" />
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

/**
 * Dashboard page - switches between Clerk and Dev modes
 */
export default function DashboardPage() {
  if (DEV_BYPASS_ENABLED) {
    return <DevDashboard />;
  }
  return <ClerkDashboard />;
}
