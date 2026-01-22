'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  /** Show transparent background (for hero sections) */
  transparent?: boolean;
  /** Show the phone number CTA */
  showPhone?: boolean;
}

/**
 * Site header with logo, navigation, and mobile menu
 */
export function Header({ transparent = false, showPhone = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header 
      className={`${styles.header} ${transparent ? styles.transparent : ''}`}
      role="banner"
    >
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="Results Roofing - Home">
          <span className={styles.logoText}>Results Roofing</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <Link href="/" className={styles.navLink}>
            Get a Quote
          </Link>
          <Link href="/portal/dashboard" className={styles.navLink}>
            My Project
          </Link>
        </nav>

        {/* Phone CTA (Desktop) */}
        {showPhone && (
          <a 
            href="tel:+18005551234" 
            className={styles.phoneLink}
            aria-label="Call us at 1-800-555-1234"
          >
            <Phone size={18} aria-hidden="true" />
            <span className={styles.phoneText}>1-800-555-1234</span>
          </a>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className={styles.menuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <X size={24} aria-hidden="true" />
          ) : (
            <Menu size={24} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav 
          id="mobile-menu" 
          className={styles.mobileMenu}
          aria-label="Mobile navigation"
        >
          <Link 
            href="/" 
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Get a Quote
          </Link>
          <Link 
            href="/portal/dashboard" 
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            My Project
          </Link>
          {showPhone && (
            <a 
              href="tel:+18005551234" 
              className={styles.mobilePhoneLink}
            >
              <Phone size={18} aria-hidden="true" />
              Call 1-800-555-1234
            </a>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
