'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  CreditCard,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Home,
  ChevronRight,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useOrders, useOrderDetails } from '@/hooks';
import type { PendingQuote } from '@/hooks';
import { ContractFloatingCard } from '@/components/features/contract';
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
          <h1 className={styles.title}>Your Project <span className={styles.titleAccent}>Dashboard</span></h1>
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
 * Pending payment state when user has a confirmed quote but hasn't paid
 */
function PendingPaymentState({ quote }: { quote: PendingQuote }) {
  const tierDisplayNames: Record<string, string> = {
    good: 'Essential Package',
    better: 'Premium Package',
    best: 'Elite Package',
  };

  const tierName = quote.selectedTier ? tierDisplayNames[quote.selectedTier] || quote.selectedTier : 'Selected Package';
  const totalPrice = quote.totalPrice || 0;
  const depositAmount = quote.depositAmount || Math.round(totalPrice * 0.1); // 10% deposit

  const formattedDate = quote.scheduledDate
    ? new Date(quote.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'To be scheduled';

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Project <span className={styles.titleAccent}>Dashboard</span></h1>
          <p className={styles.subtitle}>
            Complete your deposit to confirm your installation
          </p>
        </div>
      </header>

      {/* Pending Project Card */}
      <section className={styles.statusCard} aria-labelledby="pending-heading">
        <h2 id="pending-heading" className="sr-only">Pending Project</h2>

        <div className={styles.statusHeader}>
          <div className={styles.statusBadge} style={{ background: '#fef3c7', color: '#92400e' }}>
            <Clock size={16} aria-hidden="true" />
            <span>Awaiting Deposit</span>
          </div>
          <span className={styles.statusPhase}>Complete payment to confirm</span>
        </div>

        <div className={styles.propertyInfo}>
          <Home size={18} className={styles.propertyIcon} aria-hidden="true" />
          <span className={styles.propertyAddress}>{quote.address}, {quote.city}, {quote.state}</span>
        </div>

        <div className={styles.nextMilestone}>
          <Calendar size={18} className={styles.milestoneIcon} aria-hidden="true" />
          <span className={styles.milestoneText}>
            <strong>Installation</strong> {formattedDate}
          </span>
        </div>

        {/* Project Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--gray-50)',
          borderRadius: '0.75rem',
          marginTop: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Package</div>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--primary-500)' }} />
              {tierName}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Project Total</div>
            <div style={{ fontWeight: 600 }}>${totalPrice.toLocaleString()}</div>
          </div>
        </div>

        {/* Pay Deposit CTA */}
        <Link
          href={`/quote/${quote.id}/checkout`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '1rem 1.5rem',
            marginTop: '1.5rem',
            background: 'var(--primary-500)',
            color: 'white',
            borderRadius: '0.75rem',
            fontWeight: 600,
            fontSize: '1rem',
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}
        >
          <CreditCard size={20} />
          Pay ${depositAmount.toLocaleString()} Deposit to Confirm
          <ArrowRight size={20} />
        </Link>

        <p style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--gray-500)',
          marginTop: '0.75rem'
        }}>
          Your installation date is reserved for 48 hours
        </p>
      </section>

      {/* FAQ Bar */}
      <FAQBar />
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
  const [contractOpen, setContractOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleContractSigned = useCallback(() => {
    // Refetch order details to update checklist state
    queryClient.invalidateQueries({ queryKey: ['order'] });
  }, [queryClient]);

  // Fetch user's orders and pending quotes
  // The API now handles user linking automatically on first visit
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError
  } = useOrders(userEmail);

  // Get the most recent order (first in the list since it's sorted by createdAt desc)
  const currentOrderId = ordersData?.orders?.[0]?.id ?? null;

  // Get the most recent pending quote (for pending payment state)
  const pendingQuote = ordersData?.pendingQuotes?.[0] ?? null;

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

  // Pending payment state - user has a quote that hasn't been paid yet
  // This now works reliably via user linking, not just URL params
  if (pendingQuote && !ordersData?.orders?.length) {
    return <PendingPaymentState quote={pendingQuote} />;
  }

  // No orders and no pending quotes
  if (!ordersData?.orders?.length || !orderDetails) {
    return <NoOrdersState />;
  }

  const { order, timeline, contracts, payments, appointments } = orderDetails;

  // Build full address
  const fullAddress = `${order.propertyAddress}, ${order.propertyCity}, ${order.propertyState}`;

  // Checklist state derived from order data
  const contractSigned = contracts?.some(c => c.status === 'signed') ?? false;
  const walkthroughScheduled = (appointments?.length ?? 0) > 0;
  const hasDepositPayment = payments?.some(p => p.type === 'deposit' && p.status === 'succeeded') ?? false;
  // Step 3 requires all prior steps complete
  const depositPaid = contractSigned && walkthroughScheduled && hasDepositPayment;

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Project <span className={styles.titleAccent}>Dashboard</span></h1>
          <p className={styles.subtitle}>
            Track your roof replacement progress and manage your project
          </p>
        </div>
      </header>

      {/* Project Status Card */}
      <section className={styles.statusCard} aria-labelledby="status-heading">
        <h2 id="status-heading" className="sr-only">Project Status</h2>

        <div className={styles.propertyInfo}>
          <Home size={18} className={styles.propertyIcon} aria-hidden="true" />
          <span className={styles.propertyAddress}>{fullAddress}</span>
        </div>

        {/* Project Checklist */}
        <ol className={styles.checklist} aria-label="Project checklist">
          <li
            className={`${styles.checklistItem} ${!contractSigned ? styles.checklistClickable : ''}`}
            onClick={!contractSigned ? () => setContractOpen(true) : undefined}
            role={!contractSigned ? 'button' : undefined}
            tabIndex={!contractSigned ? 0 : undefined}
            onKeyDown={!contractSigned ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setContractOpen(true); } } : undefined}
          >
            <div className={styles.checklistIcon}>
              {contractSigned
                ? <CheckCircle size={20} className={styles.checklistCompleted} aria-hidden="true" />
                : <Circle size={20} className={styles.checklistPending} aria-hidden="true" />
              }
            </div>
            <div className={styles.checklistContent}>
              <span className={contractSigned ? styles.checklistLabelDone : styles.checklistLabel}>
                Complete project contract
              </span>
            </div>
            {!contractSigned && (
              <ChevronRight size={16} className={styles.checklistArrow} aria-hidden="true" />
            )}
          </li>
          <li className={styles.checklistItem}>
            <div className={styles.checklistIcon}>
              {walkthroughScheduled
                ? <CheckCircle size={20} className={styles.checklistCompleted} aria-hidden="true" />
                : <Circle size={20} className={styles.checklistPending} aria-hidden="true" />
              }
            </div>
            <div className={styles.checklistContent}>
              <span className={walkthroughScheduled ? styles.checklistLabelDone : styles.checklistLabel}>
                Schedule project walkthrough
              </span>
            </div>
          </li>
          <li className={styles.checklistItem}>
            <div className={styles.checklistIcon}>
              {depositPaid
                ? <CheckCircle size={20} className={styles.checklistCompleted} aria-hidden="true" />
                : <Circle size={20} className={styles.checklistPending} aria-hidden="true" />
              }
            </div>
            <div className={styles.checklistContent}>
              <span className={depositPaid ? styles.checklistLabelDone : styles.checklistLabel}>
                Pay deposit &amp; confirm schedule
              </span>
            </div>
          </li>
        </ol>
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

      {/* Contract Floating Card */}
      <ContractFloatingCard
        isOpen={contractOpen}
        onClose={() => setContractOpen(false)}
        onSigned={handleContractSigned}
        order={order}
        contract={contracts?.[0] ?? null}
      />
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
