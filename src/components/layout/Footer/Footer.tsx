import Link from 'next/link';
import { Shield, Award, Phone, Mail } from 'lucide-react';
import styles from './Footer.module.css';

interface FooterProps {
  /** Show minimal footer (for checkout flow) */
  minimal?: boolean;
}

/**
 * Site footer with trust badges, navigation, and legal links
 */
export function Footer({ minimal = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (minimal) {
    return (
      <footer className={styles.footerMinimal} role="contentinfo">
        <div className={styles.container}>
          <p className={styles.copyright}>
            © {currentYear} Results Roofing. All rights reserved.
          </p>
          <nav className={styles.legalLinks} aria-label="Legal">
            <Link href="/privacy" className={styles.legalLink}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.legalLink}>
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* Trust Badges */}
        <div className={styles.trustSection}>
          <div className={styles.trustBadge}>
            <Shield size={24} aria-hidden="true" />
            <div>
              <span className={styles.trustTitle}>Licensed & Insured</span>
              <span className={styles.trustSubtitle}>Full liability coverage</span>
            </div>
          </div>
          <div className={styles.trustBadge}>
            <Award size={24} aria-hidden="true" />
            <div>
              <span className={styles.trustTitle}>GAF Certified</span>
              <span className={styles.trustSubtitle}>Master Elite Contractor</span>
            </div>
          </div>
        </div>

        {/* Navigation & Contact */}
        <div className={styles.contentGrid}>
          {/* Company Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Results Roofing</h3>
            <p className={styles.sectionText}>
              Premium roof replacement for discerning homeowners. 
              Transparent pricing, exceptional quality.
            </p>
          </div>

          {/* Quick Links */}
          <nav className={styles.section} aria-label="Quick links">
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/" className={styles.navLink}>Get a Quote</Link>
              </li>
              <li>
                <Link href="/portal/dashboard" className={styles.navLink}>My Project</Link>
              </li>
              <li>
                <Link href="/faq" className={styles.navLink}>FAQ</Link>
              </li>
            </ul>
          </nav>

          {/* Service Areas */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Service Areas</h3>
            <ul className={styles.areaList}>
              <li>Texas (DFW, Austin, Houston)</li>
              <li>Georgia (Atlanta Metro)</li>
              <li>North Carolina (Wilmington)</li>
              <li>Arizona (Phoenix, Scottsdale)</li>
              <li>Oklahoma (OKC, Tulsa)</li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact</h3>
            <ul className={styles.contactList}>
              <li>
                <a href="tel:+18005551234" className={styles.contactLink}>
                  <Phone size={16} aria-hidden="true" />
                  1-800-555-1234
                </a>
              </li>
              <li>
                <a href="mailto:hello@resultsroofing.com" className={styles.contactLink}>
                  <Mail size={16} aria-hidden="true" />
                  hello@resultsroofing.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} Results Roofing. All rights reserved.
          </p>
          <nav className={styles.legalLinks} aria-label="Legal">
            <Link href="/privacy" className={styles.legalLink}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.legalLink}>
              Terms of Service
            </Link>
            <Link href="/accessibility" className={styles.legalLink}>
              Accessibility
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
