import { MapPin, Clock, Shield, DollarSign, CheckCircle, ChevronRight, Star } from 'lucide-react';
import { Header } from '@/components/layout';
import styles from './page.module.css';

const SERVICE_STATES = ['Texas', 'Georgia', 'North Carolina', 'Arizona'];

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
    text: "The package comparison made it so easy to decide. We went with the Better option and couldn't be happier.",
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
    description: 'Get your roof measurement and quote in minutes, not days. No waiting for a salesperson.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'Compare Good, Better, and Best packages. See exactly what you pay for with no hidden fees.',
  },
  {
    icon: Shield,
    title: 'Licensed & Insured',
    description: 'Our crews are fully licensed, insured, and trained to the highest industry standards.',
  },
];

const PROCESS_STEPS = [
  { number: '1', title: 'Enter Your Address' },
  { number: '2', title: 'Choose Your Package' },
  { number: '3', title: 'Schedule Installation' },
  { number: '4', title: 'Get Your New Roof' },
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
            Your Roof Quote
            <br />
            <span className={styles.highlight}>In Minutes</span>
          </h1>
          <p className={styles.subtitle}>
            Get an instant estimate, compare packages, and schedule your roof replacement online. No phone calls, no pressure, no hassle.
          </p>

          {/* Address Input Form */}
          <form className={styles.addressForm} action="/quote/new">
            <div className={styles.inputWrapper}>
              <MapPin className={styles.inputIcon} size={20} />
              <input
                type="text"
                name="address"
                className={styles.addressInput}
                placeholder="Enter your home address"
                autoComplete="street-address"
                aria-label="Enter your home address to get a quote"
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Get My Quote
              <ChevronRight size={16} />
            </button>
          </form>

          {/* Service Area Badge */}
          <div className={styles.serviceArea}>
            <span className={styles.serviceAreaLabel}>Now serving:</span>
            <span className={styles.serviceAreaStates}>{SERVICE_STATES.join(' | ')}</span>
          </div>
        </div>
      </section>

      {/* Reviews Ticker */}
      <section className={styles.reviewsTicker} aria-label="Customer reviews">
        <div className={styles.tickerTrack}>
          {/* Duplicate reviews for seamless infinite scroll */}
          {[...REVIEWS, ...REVIEWS].map((review, index) => (
            <article key={`review-${index}`} className={styles.reviewCard}>
              <div className={styles.reviewStars} aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className={styles.reviewText}>&ldquo;{review.text}&rdquo;</p>
              <div className={styles.reviewAuthor}>
                <div className={styles.reviewAvatar} aria-hidden="true">
                  {review.initials}
                </div>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewName}>{review.author}</span>
                  <span className={styles.reviewLocation}>{review.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className={styles.trustBar}>
        <div className={styles.trustBarContent}>
          <div className={styles.trustItem}>
            <CheckCircle size={20} className={styles.trustIcon} />
            <span>Self-pay customers only</span>
          </div>
          <div className={styles.trustItem}>
            <CheckCircle size={20} className={styles.trustIcon} />
            <span>No insurance claims</span>
          </div>
          <div className={styles.trustItem}>
            <CheckCircle size={20} className={styles.trustIcon} />
            <span>Instant satellite measurements</span>
          </div>
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
                  <prop.icon size={28} />
                </div>
                <h3 className={styles.valuePropTitle}>{prop.title}</h3>
                <p className={styles.valuePropDescription}>{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            From quote to installation in four simple steps
          </p>
          <div className={styles.stepsGrid}>
            {PROCESS_STEPS.map((step, index) => (
              <div key={step.number} className={styles.stepWrapper}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>{step.number}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                </div>
                {index < PROCESS_STEPS.length - 1 && (
                  <div className={styles.stepArrow} aria-hidden="true">
                    <svg viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M2 10C10 9 20 11 30 10C36 9.5 42 9 46 10M46 10L40 5M46 10L40 15" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
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
    </>
  );
}
