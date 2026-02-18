'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Wallet,
  CalendarClock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useOrders, useOrderDetails } from '@/hooks';
import { Skeleton } from '@/components/ui';
import { PaymentDrawer, type PaymentType } from '@/components/features/checkout/PaymentDrawer';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './page.module.css';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function PaymentsSkeleton() {
  return (
    <div className={styles.paymentsPage}>
      <header className={styles.header}>
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="60%" height={20} />
      </header>
      <section className={styles.summaryCard}>
        <Skeleton variant="rounded" width="100%" height={200} />
      </section>
      <div className={styles.twoColumn}>
        <Skeleton variant="rounded" width="100%" height={250} />
        <Skeleton variant="rounded" width="100%" height={250} />
      </div>
    </div>
  );
}

function PaymentsError() {
  return (
    <div className={styles.paymentsPage}>
      <div className={styles.errorState} role="alert">
        <AlertCircle size={48} />
        <h2>Unable to load payment information</h2>
        <p>Please try refreshing the page.</p>
      </div>
    </div>
  );
}

function PaymentsPendingState() {
  return (
    <div className={styles.paymentsPage}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}><span className={styles.titleAccent}>Payments</span></h1>
          <p className={styles.subtitle}>
            Your payment history will appear here after your deposit is confirmed
          </p>
        </div>
      </header>
      <div className={styles.emptyHistory} style={{ padding: '3rem 1.5rem' }}>
        <CreditCard size={32} className={styles.emptyIcon} />
        <p className={styles.emptyText}>No payments yet</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
          Complete your deposit from the dashboard to get started.
        </p>
      </div>
    </div>
  );
}

function ClerkPayments() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  return <PaymentsContent userEmail={userEmail} userLoaded={isLoaded} />;
}

function DevPayments() {
  const userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
  return <PaymentsContent userEmail={userEmail} userLoaded={true} />;
}

function PaymentsContent({ userEmail, userLoaded }: { userEmail: string | null; userLoaded: boolean }) {
  const queryClient = useQueryClient();
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useOrders(userEmail);
  const currentOrderId = ordersData?.orders?.[0]?.id ?? null;
  const { data: orderDetails, isLoading: detailsLoading, error: detailsError } = useOrderDetails(currentOrderId);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('deposit');
  const [selectedAmount, setSelectedAmount] = useState(0);

  function handlePaymentClick(type: PaymentType, amount: number) {
    setSelectedPaymentType(type);
    setSelectedAmount(amount);
    setDrawerOpen(true);
  }

  function handlePaymentSuccess() {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order', currentOrderId] });
  }

  if (!userLoaded || ordersLoading || (currentOrderId && detailsLoading)) {
    return <PaymentsSkeleton />;
  }

  if (ordersError || detailsError) {
    return <PaymentsError />;
  }

  if (!currentOrderId || !orderDetails) {
    return <PaymentsPendingState />;
  }

  const { order, payments } = orderDetails;
  const percentPaid = (order.totalPaid / order.totalPrice) * 100;

  // Get payment method display from most recent payment
  const lastPayment = payments[0];
  const paymentMethodDisplay = lastPayment?.type === 'deposit'
    ? `${lastPayment.type === 'deposit' ? 'Card' : 'Card'} ending in ${order.customerPhone?.slice(-4) || '****'}`
    : 'No payment method on file';

  const PAYMENT_OPTIONS = [
    {
      id: 'pay-deposit',
      title: 'Pay Deposit',
      amount: null,
      description: 'Secure your installation date',
      icon: CalendarClock,
      primary: true,
    },
    {
      id: 'pay-balance',
      title: 'Pay Balance in Full',
      amount: order.balance,
      description: 'Pay the remaining balance now',
      icon: DollarSign,
      primary: false,
    },
    {
      id: 'financing',
      title: 'Apply for Financing',
      amount: null,
      description: 'Get approved in 60 seconds with Wisetack',
      icon: Wallet,
      primary: false,
    },
  ];

  return (
    <div className={styles.paymentsPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}><span className={styles.titleAccent}>Payments</span></h1>
          <p className={styles.subtitle}>
            Manage payments and view transaction history
          </p>
        </div>
      </header>

      {/* Payment Summary Card */}
      <section className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h2 className={styles.summaryTitle}>Payment Summary</h2>
          <span className={styles.paymentMethod}>
            <CreditCard size={16} />
            {paymentMethodDisplay}
          </span>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Project</span>
            <span className={styles.summaryValue}>
              {formatCurrency(order.totalPrice)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Amount Paid</span>
            <span className={`${styles.summaryValue} ${styles.summarySuccess}`}>
              {formatCurrency(order.totalPaid)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Balance Due</span>
            <span className={`${styles.summaryValue} ${styles.summaryPrimary}`}>
              {formatCurrency(order.balance)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Payment Due</span>
            <span className={styles.summaryValue}>
              Upon completion
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Payment Progress</span>
            <span className={styles.progressPercent}>{percentPaid.toFixed(0)}% paid</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        {/* Payment Options */}
        <section className={styles.optionsCard}>
          <h2 className={styles.sectionTitle}>Make a Payment</h2>
          <div className={styles.optionsList}>
            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`${styles.optionButton} ${option.primary ? styles.optionPrimary : ''}`}
                onClick={() => {
                  if (option.id === 'pay-deposit') {
                    handlePaymentClick('deposit', order.depositAmount);
                  } else if (option.id === 'pay-balance') {
                    handlePaymentClick('balance', order.balance);
                  }
                }}
              >
                <div className={styles.optionIcon}>
                  <option.icon size={22} />
                </div>
                <div className={styles.optionContent}>
                  <span className={styles.optionTitle}>{option.title}</span>
                  <span className={styles.optionDescription}>{option.description}</span>
                </div>
                {option.amount && option.amount > 0 && (
                  <span className={styles.optionAmount}>{formatCurrency(option.amount)}</span>
                )}
                <ChevronRight size={18} className={styles.optionArrow} />
              </button>
            ))}
          </div>

        </section>

        {/* Payment History */}
        <section className={styles.historyCard}>
          <h2 className={styles.sectionTitle}>Payment History</h2>
          {payments.length > 0 ? (
            <div className={styles.historyList}>
              {payments.map((payment) => (
                <article key={payment.id} className={styles.historyItem}>
                  <div className={styles.historyIcon}>
                    {payment.status === 'succeeded' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                  <div className={styles.historyContent}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyType}>
                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                      </span>
                      <span className={styles.historyAmount}>
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className={styles.historyMeta}>
                      <span>{payment.processedAt ? formatDate(payment.processedAt) : 'Processing'}</span>
                      <span className={styles.historyDot}>•</span>
                      <span>{payment.status === 'succeeded' ? 'Completed' : payment.status}</span>
                    </div>
                    <div className={styles.historyConfirmation}>
                      Confirmation: {order.confirmationNumber}
                    </div>
                  </div>
                  <button className={styles.downloadButton} aria-label="Download receipt">
                    <Download size={16} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyHistory}>
              <Clock size={32} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No payments yet</p>
            </div>
          )}
        </section>
      </div>

      {/* Info Note */}
      <div className={styles.infoNote}>
        <AlertCircle size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <p className={styles.infoTitle}>Payment Terms</p>
          <p className={styles.infoText}>
            Your remaining balance of {formatCurrency(order.balance)} is due upon
            completion of your roofing project. We accept all major credit cards, bank transfers,
            and financing through Wisetack.
          </p>
        </div>
      </div>

      {/* Payment Drawer */}
      {order.quoteId && (
        <PaymentDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          quoteId={order.quoteId}
          paymentType={selectedPaymentType}
          amount={selectedAmount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default function PaymentsPage() {
  if (DEV_BYPASS_ENABLED) {
    return <DevPayments />;
  }
  return <ClerkPayments />;
}
