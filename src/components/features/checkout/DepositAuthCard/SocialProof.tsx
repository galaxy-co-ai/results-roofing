import { Star, Users, Quote } from 'lucide-react';
import styles from './SocialProof.module.css';

interface SocialProofProps {
  className?: string;
}

/**
 * SocialProof - Displays social proof elements
 * Shows number of homeowners, rating, and testimonial
 */
export function SocialProof({ className = '' }: SocialProofProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Stats row */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <Users size={16} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statText}>
            <strong>1,200+</strong> homeowners secured their spot this month
          </span>
        </div>
        <div className={styles.rating}>
          <div className={styles.stars} aria-label="4.9 out of 5 stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={styles.star}
                fill="currentColor"
                aria-hidden="true"
              />
            ))}
          </div>
          <span className={styles.ratingText}>
            <strong>4.9/5</strong> from 200+ reviews
          </span>
        </div>
      </div>

      {/* Testimonial */}
      <div className={styles.testimonial}>
        <Quote size={16} className={styles.quoteIcon} aria-hidden="true" />
        <blockquote className={styles.quote}>
          &ldquo;The deposit process was so easy and transparent. Got my confirmation instantly!&rdquo;
        </blockquote>
        <cite className={styles.author}>— Sarah M., Austin TX</cite>
      </div>
    </div>
  );
}

export default SocialProof;
