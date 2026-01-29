import type { Metadata } from 'next';
import { 
  CreditCard, 
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  ArrowRight,
  Wallet,
  CalendarClock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Payments',
  description: 'View payment history and make payments for your roofing project.',
};

// Mock data - would come from database in production
const PAYMENT_SUMMARY = {
  totalProject: 15000,
  amountPaid: 750,
  balanceDue: 14250,
  nextPaymentDue: 'Upon completion',
  paymentMethod: 'Visa ending in 4242',
};

const PAYMENT_HISTORY = [
  {
    id: 'pay-1',
    type: 'Deposit',
    amount: 750,
    date: 'January 22, 2026',
    status: 'completed',
    method: 'Visa ****4242',
    confirmationNumber: 'RR-YCZZ9PH2',
  },
];

const PAYMENT_OPTIONS = [
  {
    id: 'pay-balance',
    title: 'Pay Balance in Full',
    amount: 14250,
    description: 'Pay the remaining balance now',
    icon: DollarSign,
    primary: true,
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentsPage() {
  const percentPaid = (PAYMENT_SUMMARY.amountPaid / PAYMENT_SUMMARY.totalProject) * 100;

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
            {PAYMENT_SUMMARY.paymentMethod}
          </span>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Project</span>
            <span className={styles.summaryValue}>
              {formatCurrency(PAYMENT_SUMMARY.totalProject)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Amount Paid</span>
            <span className={`${styles.summaryValue} ${styles.summarySuccess}`}>
              {formatCurrency(PAYMENT_SUMMARY.amountPaid)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Balance Due</span>
            <span className={`${styles.summaryValue} ${styles.summaryPrimary}`}>
              {formatCurrency(PAYMENT_SUMMARY.balanceDue)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Payment Due</span>
            <span className={styles.summaryValue}>
              {PAYMENT_SUMMARY.nextPaymentDue}
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
              >
                <div className={styles.optionIcon}>
                  <option.icon size={22} />
                </div>
                <div className={styles.optionContent}>
                  <span className={styles.optionTitle}>{option.title}</span>
                  <span className={styles.optionDescription}>{option.description}</span>
                </div>
                {option.amount && (
                  <span className={styles.optionAmount}>{formatCurrency(option.amount)}</span>
                )}
                <ChevronRight size={18} className={styles.optionArrow} />
              </button>
            ))}
          </div>

          <div className={styles.scheduledPayment}>
            <CalendarClock size={18} className={styles.scheduledIcon} />
            <div className={styles.scheduledContent}>
              <span className={styles.scheduledTitle}>Set Up Auto-Pay</span>
              <span className={styles.scheduledDescription}>
                Schedule automatic payment upon project completion
              </span>
            </div>
            <ArrowRight size={16} className={styles.scheduledArrow} />
          </div>
        </section>

        {/* Payment History */}
        <section className={styles.historyCard}>
          <h2 className={styles.sectionTitle}>Payment History</h2>
          {PAYMENT_HISTORY.length > 0 ? (
            <div className={styles.historyList}>
              {PAYMENT_HISTORY.map((payment) => (
                <article key={payment.id} className={styles.historyItem}>
                  <div className={styles.historyIcon}>
                    <CheckCircle size={20} />
                  </div>
                  <div className={styles.historyContent}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyType}>{payment.type}</span>
                      <span className={styles.historyAmount}>
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className={styles.historyMeta}>
                      <span>{payment.date}</span>
                      <span className={styles.historyDot}>•</span>
                      <span>{payment.method}</span>
                    </div>
                    <div className={styles.historyConfirmation}>
                      Confirmation: {payment.confirmationNumber}
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
            Your remaining balance of {formatCurrency(PAYMENT_SUMMARY.balanceDue)} is due upon 
            completion of your roofing project. We accept all major credit cards, bank transfers, 
            and financing through Wisetack.
          </p>
        </div>
      </div>
    </div>
  );
}
