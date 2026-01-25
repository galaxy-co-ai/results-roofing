'use client';

import Link from 'next/link';
import { LayoutDashboard, Home } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  /** Show transparent background (for hero sections) */
  transparent?: boolean;
}

/**
 * Site header with logo and dashboard button
 * Matches the elegant, minimal aesthetic of the landing page
 */
export function Header({ transparent = false }: HeaderProps) {
  return (
    <header 
      className={`${styles.header} ${transparent ? styles.transparent : ''}`}
      role="banner"
    >
      <div className={styles.container}>
        {/* Logo - iOS-style app icon with branded text */}
        <Link href="/" className={styles.logo} aria-label="Results Roofing - Home">
          <div className={styles.appIcon} aria-hidden="true">
            <Home size={22} strokeWidth={2.5} />
          </div>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Results</span>{' '}
            <span className={styles.brandSuffix}>Roofing</span>
          </span>
        </Link>

        {/* Dashboard Button - Right aligned */}
        <Link 
          href="/portal/dashboard" 
          className={styles.dashboardButton}
          aria-label="Go to homeowner dashboard"
        >
          <LayoutDashboard size={16} aria-hidden="true" />
          <span>Dashboard</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
