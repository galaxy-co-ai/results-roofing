import { DocumentData } from '../DocumentContext';
import styles from './DocumentStyles.module.css';

interface MaterialsDocumentProps {
  document: DocumentData;
}

export function MaterialsDocument({ document }: MaterialsDocumentProps) {
  const project = document.projectData || {
    address: '123 Main Street, Austin, TX 78701',
    customerName: 'John Smith',
    packageName: 'Better Package',
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
      <h2 className={styles.documentTitle}>Material Specifications</h2>
      <p className={styles.documentNumber}>Spec Sheet #{document.id.slice(0, 8).toUpperCase()}</p>

      {/* Project Info */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Project Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Property</span>
            <span className={styles.infoValue}>{project.address}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Customer</span>
            <span className={styles.infoValue}>{project.customerName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Package</span>
            <span className={styles.infoValue}>{project.packageName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Date</span>
            <span className={styles.infoValue}>{project.contractDate}</span>
          </div>
        </div>
      </section>

      {/* Primary Roofing Material */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Primary Roofing Material</h3>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td style={{ width: '40%' }}><strong>Product</strong></td>
              <td>GAF Timberline HDZ Architectural Shingles</td>
            </tr>
            <tr>
              <td><strong>Color</strong></td>
              <td>Weathered Wood</td>
            </tr>
            <tr>
              <td><strong>Warranty</strong></td>
              <td>Lifetime Limited (50-year transferable)</td>
            </tr>
            <tr>
              <td><strong>Wind Rating</strong></td>
              <td>130 mph</td>
            </tr>
            <tr>
              <td><strong>Fire Rating</strong></td>
              <td>Class A</td>
            </tr>
            <tr>
              <td><strong>Algae Resistance</strong></td>
              <td>StainGuard Plus™ (25-year)</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Underlayment */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Underlayment System</h3>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td style={{ width: '40%' }}><strong>Product</strong></td>
              <td>GAF FeltBuster Synthetic Underlayment</td>
            </tr>
            <tr>
              <td><strong>Material</strong></td>
              <td>Polypropylene Non-Woven</td>
            </tr>
            <tr>
              <td><strong>Slip Resistance</strong></td>
              <td>Sure-Foot™ grip surface</td>
            </tr>
            <tr>
              <td><strong>UV Exposure</strong></td>
              <td>6 months</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Ice & Water Shield */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ice & Water Barrier</h3>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td style={{ width: '40%' }}><strong>Product</strong></td>
              <td>GAF WeatherWatch Mineral-Surfaced Leak Barrier</td>
            </tr>
            <tr>
              <td><strong>Application</strong></td>
              <td>Eaves, valleys, around penetrations</td>
            </tr>
            <tr>
              <td><strong>Self-Sealing</strong></td>
              <td>Yes - seals around nails</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Ventilation */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ventilation</h3>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td style={{ width: '40%' }}><strong>Ridge Vent</strong></td>
              <td>GAF Cobra Snow Country Advanced</td>
            </tr>
            <tr>
              <td><strong>Net Free Area</strong></td>
              <td>18 sq. in. per linear foot</td>
            </tr>
            <tr>
              <td><strong>Weather Protection</strong></td>
              <td>External wind baffle</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Accessories */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Accessories & Components</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Component</th>
              <th>Product</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Drip Edge</td>
              <td>Aluminum (Color-matched)</td>
              <td>180 LF</td>
            </tr>
            <tr>
              <td>Starter Strip</td>
              <td>GAF Pro-Start</td>
              <td>180 LF</td>
            </tr>
            <tr>
              <td>Hip & Ridge</td>
              <td>GAF TimberTex</td>
              <td>60 LF</td>
            </tr>
            <tr>
              <td>Pipe Boots</td>
              <td>Perma-Boot (Thermoplastic)</td>
              <td>3 EA</td>
            </tr>
            <tr>
              <td>Roofing Nails</td>
              <td>Galvanized Ring Shank 1-1/4&quot;</td>
              <td>As needed</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className={styles.highlightBox}>
        <p>
          <strong>Material Delivery:</strong> All materials will be delivered 1-2 days prior to installation. 
          Materials are inspected upon arrival for quality assurance.
        </p>
      </div>

      {/* Certifications */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Certifications & Compliance</h3>
        <ul className={styles.termsList}>
          <li>All materials meet or exceed local building code requirements</li>
          <li>GAF Certified™ Roofing System eligible</li>
          <li>ENERGY STAR® qualified reflective shingles available upon request</li>
          <li>UL Class A Fire Rating</li>
          <li>Miami-Dade County Product Approval (where applicable)</li>
        </ul>
      </section>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Results Roofing LLC | Licensed • Bonded • Insured</p>
        <p>Material specifications subject to change based on availability. Equivalent products may be substituted with customer approval.</p>
      </div>
    </div>
  );
}
