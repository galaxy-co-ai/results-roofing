import { Shield } from 'lucide-react';
import type { DocumentData } from '../DocumentContext';
import styles from './DocumentStyles.module.css';

interface WarrantyDocumentProps {
  document: DocumentData;
}

export function WarrantyDocument({ document }: WarrantyDocumentProps) {
  const project = document.projectData || {
    address: '123 Main Street, Austin, TX 78701',
    customerName: 'John Smith',
    contractDate: 'January 22, 2026',
    materials: 'GAF Timberline HDZ Architectural Shingles',
    warrantyYears: 30,
  };

  const warrantyEndDate = new Date();
  warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + project.warrantyYears);

  return (
    <div className={styles.document}>
      <div className={styles.certificateWrapper}>
        <div className={styles.certificateInner}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className={styles.logoIcon} style={{ margin: '0 auto', width: '56px', height: '56px', fontSize: '1.25rem' }}>RR</div>
          </div>

          {/* Title */}
          <h1 className={styles.certificateTitle}>Certificate of Warranty</h1>
          <p className={styles.certificateSubtitle}>{project.warrantyYears}-Year Full Protection</p>

          {/* Seal */}
          <div className={styles.certificateSeal}>
            <div className={styles.seal}>
              <div className={styles.sealInner}>
                <span className={styles.sealYears}>{project.warrantyYears}</span>
                <span>Year</span>
                <span>Warranty</span>
              </div>
            </div>
          </div>

          {/* Certificate Text */}
          <div style={{ textAlign: 'center', margin: '32px 0' }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '8px' }}>This certifies that the roofing system installed at</p>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>{project.address}</p>
            <p style={{ fontSize: '1.125rem' }}>is covered under our comprehensive warranty program.</p>
          </div>

          {/* Details */}
          <div className={styles.infoGrid} style={{ maxWidth: '500px', margin: '32px auto' }}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Property Owner</span>
              <span className={styles.infoValue}>{project.customerName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Installation Date</span>
              <span className={styles.infoValue}>{project.contractDate}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Warranty Coverage</span>
              <span className={styles.infoValue}>{project.warrantyYears} Years</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Expires</span>
              <span className={styles.infoValue}>{warrantyEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Coverage */}
          <section className={styles.section} style={{ marginTop: '32px' }}>
            <h3 className={styles.sectionTitle} style={{ textAlign: 'center' }}>What&apos;s Covered</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
              {[
                'Material Defects',
                'Workmanship Issues',
                'Leak Repairs',
                'Shingle Replacement',
                'Flashing Repairs',
                'Wind Damage up to 130mph',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} style={{ color: 'var(--rr-color-success)' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Terms */}
          <div className={styles.highlightBox} style={{ marginTop: '32px' }}>
            <p style={{ fontSize: '0.875rem' }}>
              <strong>Transferable:</strong> This warranty may be transferred to new property owners. 
              Contact us within 30 days of property transfer to maintain coverage.
            </p>
          </div>

          {/* Signatures */}
          <div className={styles.signatureBlock}>
            <div className={styles.signatureItem}>
              <div className={styles.signatureLine}>
                <span className={styles.signatureValue}>Michael Chen</span>
              </div>
              <span className={styles.signatureLabel}>Company Representative</span>
            </div>
            <div className={styles.signatureItem}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px', fontWeight: '600' }}>Certificate #{document.id.slice(0, 8).toUpperCase()}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--rr-color-stone)' }}>Issued: {project.contractDate}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p>Results Roofing LLC | Licensed • Bonded • Insured</p>
            <p>For warranty claims, contact warranty@resultsroofing.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
