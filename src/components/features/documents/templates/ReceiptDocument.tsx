import { CheckCircle } from 'lucide-react';
import type { DocumentData } from '../DocumentContext';
import styles from './DocumentStyles.module.css';

interface ReceiptDocumentProps {
  document: DocumentData;
}

export function ReceiptDocument({ document }: ReceiptDocumentProps) {
  const project = document.projectData || {
    address: '123 Main Street, Austin, TX 78701',
    customerName: 'John Smith',
    email: 'john@example.com',
    packageName: 'Better Package',
    totalPrice: 15000,
    depositAmount: 750,
    contractDate: 'January 22, 2026',
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  return (
    <div className={styles.document}>
      {/* Letterhead */}
      <div className={styles.letterhead}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>RR</div>
          <div className={styles.companyInfo}>
            <h1 className={styles.companyName}>Results Roofing</h1>
            <p className={styles.companyTagline}>Premium Roof Replacement</p>
          </div>
        </div>
        <div className={styles.contactInfo}>
          resultsroofing.com<br />
          support@resultsroofing.com<br />
          (800) 555-1234
        </div>
      </div>

      {/* Document Title */}
      <h2 className={styles.documentTitle}>Payment Receipt</h2>
      <p className={styles.documentNumber}>Receipt #{document.id.slice(0, 8).toUpperCase()}</p>

      <div className={styles.badge}>
        <CheckCircle size={16} />
        Payment Confirmed
      </div>

      {/* Payment Details */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Payment Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Date</span>
            <span className={styles.infoValue}>{project.contractDate}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Payment Method</span>
            <span className={styles.infoValue}>Visa ending in 4242</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Transaction ID</span>
            <span className={styles.infoValue}>pi_{document.id.slice(0, 12)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status</span>
            <span className={styles.infoValue} style={{ color: 'var(--rr-color-success)', fontWeight: '600' }}>Successful</span>
          </div>
        </div>
      </section>

      {/* Billed To */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Billed To</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Customer</span>
            <span className={styles.infoValue}>{project.customerName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{project.email}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Property Address</span>
            <span className={styles.infoValue}>{project.address}</span>
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Payment Details</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Deposit Payment</strong><br />
                <span style={{ color: 'var(--rr-color-stone)', fontSize: '0.8125rem' }}>
                  {project.packageName} - Roof Replacement
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(project.depositAmount)}</td>
            </tr>
            <tr className={styles.tableTotal}>
              <td><strong>Total Paid</strong></td>
              <td style={{ textAlign: 'right' }}><strong>{formatCurrency(project.depositAmount)}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Project Summary */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Project Summary</h3>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td>Contract Total</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(project.totalPrice)}</td>
            </tr>
            <tr>
              <td>This Payment (Deposit)</td>
              <td style={{ textAlign: 'right', color: 'var(--rr-color-success)' }}>-{formatCurrency(project.depositAmount)}</td>
            </tr>
            <tr className={styles.tableTotal}>
              <td><strong>Remaining Balance</strong></td>
              <td style={{ textAlign: 'right' }}><strong>{formatCurrency(project.totalPrice - project.depositAmount)}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className={styles.highlightBox}>
        <p>
          <strong>Remaining Balance:</strong> The balance of {formatCurrency(project.totalPrice - project.depositAmount)} is due 
          upon completion of your roofing project. You will receive an invoice before the final payment is due.
        </p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Thank you for choosing Results Roofing!</p>
        <p>Questions? Contact us at support@resultsroofing.com</p>
        <p style={{ marginTop: '16px', fontSize: '0.6875rem' }}>
          This receipt serves as confirmation of your payment. Please save for your records.
        </p>
      </div>
    </div>
  );
}
