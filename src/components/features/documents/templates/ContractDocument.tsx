import { CheckCircle } from 'lucide-react';
import type { DocumentData } from '../DocumentContext';
import styles from './DocumentStyles.module.css';

interface ContractDocumentProps {
  document: DocumentData;
}

export function ContractDocument({ document }: ContractDocumentProps) {
  const project = document.projectData || {
    address: '123 Main Street, Austin, TX 78701',
    customerName: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    packageName: 'Better Package',
    totalPrice: 15000,
    depositAmount: 750,
    installationDate: 'February 3, 2026',
    contractDate: 'January 22, 2026',
    materials: 'GAF Timberline HDZ Architectural Shingles',
    warrantyYears: 30,
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

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
          License #ROO-2024-TX
        </div>
      </div>

      {/* Document Title */}
      <h2 className={styles.documentTitle}>Roofing Contract</h2>
      <p className={styles.documentNumber}>Contract #{document.id.slice(0, 8).toUpperCase()}</p>

      {document.status === 'signed' && (
        <div className={styles.badge}>
          <CheckCircle size={16} />
          Signed and Executed
        </div>
      )}

      {/* Parties */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Parties to Agreement</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Contractor</span>
            <span className={styles.infoValue}>Results Roofing LLC</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Homeowner</span>
            <span className={styles.infoValue}>{project.customerName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Contract Date</span>
            <span className={styles.infoValue}>{project.contractDate}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Property Address</span>
            <span className={styles.infoValue}>{project.address}</span>
          </div>
        </div>
      </section>

      {/* Scope of Work */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Scope of Work</h3>
        <p>
          The Contractor agrees to perform the following work at the property located at 
          <strong> {project.address}</strong>:
        </p>
        <ul className={styles.termsList}>
          <li>Complete tear-off and disposal of existing roofing materials</li>
          <li>Inspection and repair of roof decking as needed</li>
          <li>Installation of synthetic underlayment</li>
          <li>Installation of {project.materials}</li>
          <li>Installation of new drip edge, flashing, and ventilation</li>
          <li>Complete cleanup and debris removal</li>
          <li>Final inspection and quality assurance walkthrough</li>
        </ul>
      </section>

      {/* Materials */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Materials & Package</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Selected Package</span>
            <span className={styles.infoValue}>{project.packageName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Primary Material</span>
            <span className={styles.infoValue}>{project.materials}</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Pricing & Payment Terms</h3>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td>Project Total ({project.packageName})</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(project.totalPrice)}</td>
            </tr>
            <tr>
              <td>Deposit (Due at Signing)</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(project.depositAmount)}</td>
            </tr>
            <tr>
              <td>Balance Due Upon Completion</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(project.totalPrice - project.depositAmount)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Timeline */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Project Timeline</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Scheduled Installation</span>
            <span className={styles.infoValue}>{project.installationDate}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Estimated Duration</span>
            <span className={styles.infoValue}>1-2 Business Days</span>
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Terms & Conditions</h3>
        <ol className={styles.termsList}>
          <li><strong>Warranty:</strong> This project includes a {project.warrantyYears}-year manufacturer warranty on materials and a 10-year workmanship warranty from Results Roofing.</li>
          <li><strong>Permits:</strong> Contractor will obtain all necessary building permits.</li>
          <li><strong>Insurance:</strong> Contractor maintains full liability and workers&apos; compensation insurance.</li>
          <li><strong>Changes:</strong> Any changes to the scope of work must be agreed upon in writing.</li>
          <li><strong>Cancellation:</strong> Homeowner may cancel within 3 business days for a full deposit refund.</li>
          <li><strong>Weather:</strong> Installation may be rescheduled due to inclement weather at no additional cost.</li>
        </ol>
      </section>

      <div className={styles.highlightBox}>
        <p>
          <strong>3-Day Right to Cancel:</strong> You have the right to cancel this contract within 
          three (3) business days of signing. To cancel, contact us in writing at 
          support@resultsroofing.com.
        </p>
      </div>

      {/* Signatures */}
      <div className={styles.signatureBlock}>
        <div className={styles.signatureItem}>
          <div className={styles.signatureLine}>
            {document.status === 'signed' && (
              <span className={styles.signatureValue}>{project.customerName}</span>
            )}
          </div>
          <span className={styles.signatureLabel}>Homeowner Signature</span>
          {document.status === 'signed' && (
            <span className={styles.signatureDate}>Signed: {project.contractDate}</span>
          )}
        </div>
        <div className={styles.signatureItem}>
          <div className={styles.signatureLine}>
            {document.status === 'signed' && (
              <span className={styles.signatureValue}>Michael Chen</span>
            )}
          </div>
          <span className={styles.signatureLabel}>Contractor Representative</span>
          {document.status === 'signed' && (
            <span className={styles.signatureDate}>Signed: {project.contractDate}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Results Roofing LLC | Licensed • Bonded • Insured</p>
        <p>This contract is binding upon acceptance by both parties.</p>
      </div>
    </div>
  );
}
