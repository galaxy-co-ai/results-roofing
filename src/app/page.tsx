import { CheckCircle, ChevronRight, Star, BadgeCheck, Shield } from 'lucide-react';
import { Header } from '@/components/layout';
import { HeroAddressForm, HowItWorksStepper, ReviewsTicker } from '@/components/features/landing';
import styles from './page.module.css';



export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
      {/* Hero Section */}
      <section id="quote-form" className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Your Roof Quote <span className={styles.highlight}>In Minutes</span>
          </h1>

          {/* Address Input Form with Autocomplete */}
          <HeroAddressForm className={styles.addressForm} />
        </div>
      </section>

      {/* Trust Badges Bar */}
      <section className={styles.trustBadges} aria-label="Trust indicators">
        <div className={styles.trustBadgesContent}>
          {/* Google Reviews */}
          <div className={styles.trustBadge}>
            <div className={styles.badgeIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div className={styles.badgeText}>
              <span className={styles.badgeRating}>
                4.9
                <Star size={11} fill="currentColor" className={styles.starIcon} />
              </span>
              <span className={styles.badgeLabel}>500+ reviews</span>
            </div>
          </div>

          <div className={styles.badgeDivider} aria-hidden="true" />

          {/* Licensed & Insured */}
          <div className={styles.trustBadge}>
            <div className={styles.badgeIcon} aria-hidden="true">
              <BadgeCheck size={16} />
            </div>
            <span className={styles.badgeLabel}>Licensed & Insured</span>
          </div>

          <div className={styles.badgeDivider} aria-hidden="true" />

          {/* Manufacturer Certified */}
          <div className={styles.trustBadge}>
            <div className={styles.badgeIcon} aria-hidden="true">
              <Shield size={16} />
            </div>
            <span className={styles.badgeLabel}>GAF & Owens Corning Certified</span>
          </div>
        </div>
      </section>

      {/* Reviews Ticker */}
      <ReviewsTicker />

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            From quote to installation in four simple steps
          </p>
          <HowItWorksStepper />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.bottomCta}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.ctaTitle}>Know Your Price in 5 Minutes</h2>
          <p className={styles.ctaSubtitle}>
            No sales calls. No home visits. Just an honest quote you can trust.
          </p>
          <a href="#quote-form" className={styles.ctaButton}>
            Get My Quote
            <ChevronRight size={20} />
          </a>
        </div>
      </section>
    </main>

    {/* Sticky Trust Bar Footer */}
    <footer className={styles.stickyTrustBar} role="contentinfo">
      <div className={styles.trustBarContent}>
        {/* Roofs Quoted */}
        <div className={styles.trustItem}>
          <CheckCircle size={14} className={styles.trustIconCheck} />
          <span className={styles.trustLabel}>5,000+ Roofs Quoted</span>
        </div>

        <div className={styles.trustDivider} aria-hidden="true" />

        {/* Licensed & Insured */}
        <div className={styles.trustItem}>
          <BadgeCheck size={14} className={styles.trustIcon} />
          <span className={styles.trustLabel}>Licensed & Insured</span>
        </div>

        <div className={styles.trustDivider} aria-hidden="true" />

        {/* Manufacturer Certified */}
        <div className={styles.trustItem}>
          <Shield size={14} className={styles.trustIcon} />
          <span className={styles.trustLabel}>GAF & Owens Corning Certified</span>
        </div>
      </div>
    </footer>
    </>
  );
}
