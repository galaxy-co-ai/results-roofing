import { Header } from '@/components/layout';
import { HeroAddressForm, HowItWorksStepper, ReviewsTicker, ScrollToTopCTA } from '@/components/features/landing';
import styles from './page.module.css';



export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className={styles.main}>
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
          <ScrollToTopCTA />
        </div>
      </section>
    </main>

    {/* Footer */}
    <footer className={styles.footer} role="contentinfo">
      <span className={styles.footerText}>
        © {new Date().getFullYear()} Results Roofing. All rights reserved.
      </span>
    </footer>
    </>
  );
}
