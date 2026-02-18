'use client';

import { useState } from 'react';
import styles from './BeforeAfterSlider.module.css';

interface BeforeAfterSliderProps {
  beforeSrc?: string;
  afterSrc?: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before roof replacement',
  afterAlt = 'After roof replacement',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <div className={styles.container} aria-label="Before and after comparison slider">
      {/* After (background) */}
      <div className={styles.afterPanel}>
        {afterSrc ? (
          <img src={afterSrc} alt={afterAlt} />
        ) : (
          <div className={`${styles.placeholder} ${styles.placeholderAfter}`}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span>After Photo</span>
          </div>
        )}
      </div>

      {/* Before (clipped) */}
      <div
        className={styles.beforePanel}
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {beforeSrc ? (
          <img src={beforeSrc} alt={beforeAlt} />
        ) : (
          <div className={`${styles.placeholder} ${styles.placeholderBefore}`}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span>Before Photo</span>
          </div>
        )}
      </div>

      {/* Divider + Handle */}
      <div className={styles.divider} style={{ left: `${position}%` }}>
        <div className={styles.handle}>
          <span className={styles.handleArrows} aria-hidden="true">&lsaquo; &rsaquo;</span>
        </div>
      </div>

      {/* Labels */}
      <span className={`${styles.label} ${styles.labelBefore}`}>Before</span>
      <span className={`${styles.label} ${styles.labelAfter}`}>After</span>

      {/* Accessible range input */}
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className={styles.rangeInput}
        aria-label="Slide to compare before and after"
      />
    </div>
  );
}
