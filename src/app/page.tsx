import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Your New Roof Quote
          <br />
          <span className={styles.highlight}>In Minutes</span>
        </h1>
        <p className={styles.subtitle}>
          Get an instant estimate, compare packages, and schedule your roof
          replacement online. No phone calls required.
        </p>
        <div className={styles.cta}>
          <a href="/quote" className={styles.ctaButton}>
            Get Your Free Quote
          </a>
        </div>
      </section>
    </main>
  );
}
