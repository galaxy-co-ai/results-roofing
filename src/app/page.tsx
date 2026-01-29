import { Clock, Shield, DollarSign, CheckCircle, ChevronRight, Star, BadgeCheck } from 'lucide-react';
import { Header } from '@/components/layout';
import { HeroAddressForm, HowItWorksStepper } from '@/components/features/landing';
import styles from './page.module.css';

const REVIEWS = [
  {
    text: "Results Roofing made everything so easy. Got my quote in 5 minutes and scheduled installation the same week. No pushy salespeople!",
    author: "Sarah M.",
    location: "Austin, TX",
    initials: "SM",
  },
  {
    text: "Best roofing experience ever. The online process was seamless and the crew was professional. My new roof looks amazing.",
    author: "Michael R.",
    location: "Atlanta, GA",
    initials: "MR",
  },
  {
    text: "I was skeptical about getting a roof quote online, but this was incredibly accurate. The final price matched exactly.",
    author: "Jennifer L.",
    location: "Charlotte, NC",
    initials: "JL",
  },
  {
    text: "From quote to completion in under two weeks. The transparency in pricing was refreshing - no hidden fees or surprises.",
    author: "David K.",
    location: "Phoenix, AZ",
    initials: "DK",
  },
  {
    text: "Finally, a roofing company that respects your time. No waiting around for estimates. Highly recommend!",
    author: "Amanda T.",
    location: "Dallas, TX",
    initials: "AT",
  },
  {
    text: "The package comparison made it so easy to decide. We went with the Premium option and couldn't be happier.",
    author: "Robert J.",
    location: "Marietta, GA",
    initials: "RJ",
  },
  {
    text: "Professional from start to finish. The satellite measurement was spot-on and installation was flawless.",
    author: "Lisa H.",
    location: "Raleigh, NC",
    initials: "LH",
  },
  {
    text: "Love that I could do everything online. Scheduled around my work and they showed up exactly when promised.",
    author: "Chris P.",
    location: "Scottsdale, AZ",
    initials: "CP",
  },
];

const VALUE_PROPS = [
  {
    icon: Clock,
    title: 'Instant Quotes',
    description: 'Get your roof measurement and quote in minutes, not days.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'Compare Essential, Premium, and Elite packages. See exactly what you pay for with no hidden fees.',
  },
  {
    icon: Shield,
    title: 'Licensed & Insured',
    description: 'Our crews are fully licensed, insured, and trained to the highest industry standards.',
  },
];


export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
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
      <section className={styles.reviewsTicker} aria-label="Customer reviews">
        <div className={styles.tickerTrack}>
          {/* Duplicate reviews for seamless infinite scroll */}
          {[...REVIEWS, ...REVIEWS].map((review, index) => (
            <article key={`review-${index}`} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewAvatar} aria-hidden="true">
                    {review.initials}
                  </div>
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewName}>{review.author}</span>
                    <span className={styles.reviewLocation}>{review.location}</span>
                  </div>
                </div>
                <div className={styles.reviewStars} aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className={styles.reviewText}>&ldquo;{review.text}&rdquo;</p>
            </article>
          ))}
        </div>
      </section>

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

      {/* Value Propositions */}
      <section className={styles.valueProps}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Why Homeowners Choose Us</h2>
          <div className={styles.valuePropsGrid}>
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className={styles.valuePropCard}>
                <div className={styles.valuePropIcon}>
                  <prop.icon size={18} />
                </div>
                <div className={styles.valuePropContent}>
                  <h3 className={styles.valuePropTitle}>{prop.title}</h3>
                  <p className={styles.valuePropDescription}>{prop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.bottomCta}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of homeowners who have simplified their roof replacement.
          </p>
          <a href="/quote/new" className={styles.ctaButton}>
            Get Your Free Quote
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
