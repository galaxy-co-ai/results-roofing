import { CheckCircle } from 'lucide-react';
import type { DocumentData } from '../DocumentContext';
import styles from './DocumentStyles.module.css';

interface PermitDocumentProps {
  document: DocumentData;
}

export function PermitDocument({ document }: PermitDocumentProps) {
  const project = document.projectData || {
    address: '123 Main Street, Austin, TX 78701',
    customerName: 'John Smith',
    contractDate: 'January 22, 2026',
    permitNumber: 'BP-2026-00847',
  };

  return (
    <div className={styles.document}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--rr-color-charcoal)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>
          City of Austin
        </h1>
        <p style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--rr-color-slate)' }}>
          Development Services Department
        </p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--rr-color-stone)' }}>
          Building Permits Division
        </p>
      </div>

      {/* Document Title */}
      <h2 className={styles.documentTitle}>Building Permit</h2>
      <p className={styles.documentNumber}>Permit #{project.permitNumber}</p>

      <div className={styles.badge} style={{ margin: '0 auto 24px', display: 'inline-flex' }}>
        <CheckCircle size={16} />
        Approved
      </div>

      {/* Permit Details */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Permit Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Permit Number</span>
            <span className={styles.infoValue}>{project.permitNumber}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Permit Type</span>
            <span className={styles.infoValue}>Residential Re-Roofing</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Issue Date</span>
            <span className={styles.infoValue}>{project.contractDate}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Expiration Date</span>
            <span className={styles.infoValue}>July 22, 2026</span>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Property Details</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Property Address</span>
            <span className={styles.infoValue}>{project.address}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Property Owner</span>
            <span className={styles.infoValue}>{project.customerName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Property Type</span>
            <span className={styles.infoValue}>Single Family Residence</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Zoning</span>
            <span className={styles.infoValue}>SF-2</span>
          </div>
        </div>
      </section>

      {/* Contractor Info */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Licensed Contractor</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Contractor</span>
            <span className={styles.infoValue}>Results Roofing LLC</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>License Number</span>
            <span className={styles.infoValue}>ROO-2024-TX-48293</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Contact</span>
            <span className={styles.infoValue}>(800) 555-1234</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Insurance Verified</span>
            <span className={styles.infoValue} style={{ color: 'var(--rr-color-success)' }}>Yes</span>
          </div>
        </div>
      </section>

      {/* Scope of Work */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Approved Scope of Work</h3>
        <ul className={styles.termsList}>
          <li>Complete removal of existing roofing materials</li>
          <li>Installation of new roofing system per manufacturer specifications</li>
          <li>All work to comply with 2021 International Residential Code</li>
          <li>Final inspection required upon completion</li>
        </ul>
      </section>

      <div className={styles.highlightBox}>
        <p>
          <strong>Important:</strong> This permit must be posted at the job site during construction. 
          A final inspection is required. Call (512) 974-1500 to schedule inspection.
        </p>
      </div>

      {/* Conditions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Conditions of Approval</h3>
        <ol className={styles.termsList}>
          <li>Work shall be performed in accordance with approved plans and specifications.</li>
          <li>Permit is non-transferable and expires 180 days from issue date if work has not commenced.</li>
          <li>All required inspections must be scheduled and passed before project completion.</li>
          <li>Contractor must maintain current license and insurance throughout project duration.</li>
        </ol>
      </section>

      {/* Signatures */}
      <div className={styles.signatureBlock}>
        <div className={styles.signatureItem}>
          <div className={styles.signatureLine}>
            <span className={styles.signatureValue}>J. Martinez</span>
          </div>
          <span className={styles.signatureLabel}>Building Official</span>
          <span className={styles.signatureDate}>Approved: {project.contractDate}</span>
        </div>
        <div className={styles.signatureItem}>
          <div style={{ textAlign: 'right', padding: '16px', border: '1px solid var(--rr-color-sand)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: 'var(--rr-color-stone)' }}>OFFICIAL SEAL</p>
            <p style={{ margin: 0, fontWeight: '600' }}>City of Austin</p>
            <p style={{ margin: 0, fontSize: '0.75rem' }}>Development Services</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>City of Austin Development Services Department</p>
        <p>505 Barton Springs Road, Austin, TX 78704 | (512) 974-1500</p>
      </div>
    </div>
  );
}
