import type { DocumentData } from '../DocumentContext';
import styles from './DocumentStyles.module.css';

interface ScopeDocumentProps {
  document: DocumentData;
}

export function ScopeDocument({ document }: ScopeDocumentProps) {
  const project = document.projectData || {
    address: '123 Main Street, Austin, TX 78701',
    customerName: 'John Smith',
    packageName: 'Premium Package',
    totalPrice: 15000,
    installationDate: 'February 3, 2026',
    contractDate: 'January 22, 2026',
    materials: 'GAF Timberline HDZ Architectural Shingles',
  };

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
          support@resultsroofing.com
        </div>
      </div>

      {/* Document Title */}
      <h2 className={styles.documentTitle}>Project Scope of Work</h2>
      <p className={styles.documentNumber}>SOW #{document.id.slice(0, 8).toUpperCase()}</p>

      {/* Project Overview */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Project Overview</h3>
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
            <span className={styles.infoLabel}>Package Selected</span>
            <span className={styles.infoValue}>{project.packageName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Scheduled Date</span>
            <span className={styles.infoValue}>{project.installationDate}</span>
          </div>
        </div>
      </section>

      {/* Pre-Installation */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Phase 1: Pre-Installation</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Task</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Material delivery and staging</td>
              <td>1 day prior</td>
            </tr>
            <tr>
              <td>Job site preparation and protection setup</td>
              <td>Day 1 morning</td>
            </tr>
            <tr>
              <td>Landscaping and property protection (tarps, boards)</td>
              <td>Day 1 morning</td>
            </tr>
            <tr>
              <td>Dumpster placement for debris removal</td>
              <td>Day 1 morning</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Tear-Off */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Phase 2: Tear-Off & Inspection</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Task</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Complete removal of existing shingles and underlayment</td>
              <td>4-6 hours</td>
            </tr>
            <tr>
              <td>Removal and disposal of old flashing and accessories</td>
              <td>Included</td>
            </tr>
            <tr>
              <td>Thorough inspection of roof decking</td>
              <td>1 hour</td>
            </tr>
            <tr>
              <td>Replacement of damaged decking (if needed)*</td>
              <td>As needed</td>
            </tr>
            <tr>
              <td>Debris removal and worksite cleanup</td>
              <td>Ongoing</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.8125rem', color: 'var(--rr-color-stone)', marginTop: '8px' }}>
          *Decking replacement charged at $3.50/sq ft if required. Homeowner will be notified before proceeding.
        </p>
      </section>

      {/* Installation */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Phase 3: Installation</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Task</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Installation of new aluminum drip edge</td>
              <td>1 hour</td>
            </tr>
            <tr>
              <td>Installation of ice & water shield at eaves and valleys</td>
              <td>2 hours</td>
            </tr>
            <tr>
              <td>Installation of synthetic underlayment (full coverage)</td>
              <td>2-3 hours</td>
            </tr>
            <tr>
              <td>Installation of starter strip shingles</td>
              <td>1 hour</td>
            </tr>
            <tr>
              <td>Installation of {project.materials}</td>
              <td>6-8 hours</td>
            </tr>
            <tr>
              <td>Installation of hip and ridge cap shingles</td>
              <td>2 hours</td>
            </tr>
            <tr>
              <td>Installation/replacement of pipe boots and flashing</td>
              <td>1-2 hours</td>
            </tr>
            <tr>
              <td>Installation of ridge ventilation system</td>
              <td>1 hour</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Completion */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Phase 4: Completion & Cleanup</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Task</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Quality inspection by crew lead</td>
              <td>30 min</td>
            </tr>
            <tr>
              <td>Complete debris removal from roof and gutters</td>
              <td>1 hour</td>
            </tr>
            <tr>
              <td>Magnetic sweep of yard and driveway (3x minimum)</td>
              <td>30 min</td>
            </tr>
            <tr>
              <td>Property protection removal and landscape restoration</td>
              <td>30 min</td>
            </tr>
            <tr>
              <td>Final walkthrough with homeowner</td>
              <td>30 min</td>
            </tr>
            <tr>
              <td>Dumpster removal</td>
              <td>Next day</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className={styles.highlightBox}>
        <p>
          <strong>Estimated Duration:</strong> 1-2 business days depending on roof size and complexity. 
          We work rain or shine when safe, but will reschedule if conditions are hazardous.
        </p>
      </div>

      {/* Exclusions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Exclusions</h3>
        <p>The following items are NOT included in this scope of work unless separately quoted:</p>
        <ul className={styles.termsList}>
          <li>Gutter replacement or repair</li>
          <li>Skylight replacement (flashing only included)</li>
          <li>Chimney rebuild or major repair</li>
          <li>Interior repairs related to prior damage</li>
          <li>Solar panel removal/reinstallation</li>
          <li>Additional layers of shingle removal beyond first layer</li>
        </ul>
      </section>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Results Roofing LLC | Licensed • Bonded • Insured</p>
        <p>This scope of work is subject to the terms of the signed contract.</p>
      </div>
    </div>
  );
}
