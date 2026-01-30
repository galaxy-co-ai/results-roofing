'use client';

import { useState, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';
import styles from './ReviewsTicker.module.css';

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

export function ReviewsTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    scrollStartX.current = containerRef.current.scrollLeft;
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const deltaX = e.clientX - dragStartX.current;
    containerRef.current.scrollLeft = scrollStartX.current - deltaX;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setIsPaused(false);
  }, []);

  return (
    <section className={styles.reviewsTicker} aria-label="Customer reviews">
      <div
        ref={containerRef}
        className={`${styles.tickerContainer} ${isPaused ? styles.tickerContainerPaused : ''} ${isDragging ? styles.tickerContainerDragging : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={trackRef}
          className={`${styles.tickerTrack} ${isPaused ? styles.tickerTrackPaused : ''}`}
        >
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
      </div>
    </section>
  );
}

export default ReviewsTicker;
