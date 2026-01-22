import { MapPin, Clock, Shield, DollarSign, CheckCircle, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

const SERVICE_STATES = ['Texas', 'Georgia', 'North Carolina', 'Arizona'];

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
  {
    number: '1',
    title: 'Enter Your Address',
    description: 'We use satellite imagery to measure your roof instantly.',
  },
  {
    number: '2',
    title: 'Choose Your Package',
    description: 'Compare Good, Better, and Best options with transparent pricing.',
  },
  {
    number: '3',
    title: 'Schedule Installation',
    description: 'Pick a date that works for you. Sign digitally and pay your deposit online.',
  },
  {
    number: '4',
    title: 'Get Your New Roof',
    description: 'Our licensed crews install your roof. Most jobs complete in 1-2 days.',
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Your New Roof Quote
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
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Get My Quote
              <ChevronRight size={20} />
            </button>
          </form>

          {/* Service Area Badge */}
          <div className={styles.serviceArea}>
            <span className={styles.serviceAreaLabel}>Now serving:</span>
            <span className={styles.serviceAreaStates}>{SERVICE_STATES.join(' | ')}</span>
          </div>
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
              <div key={step.number} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
                {index < PROCESS_STEPS.length - 1 && (
                  <div className={styles.stepConnector} />
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
  );
}
