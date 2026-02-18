'use client';

import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import styles from './ScrollReveal.module.css';

type Animation = 'fadeUp' | 'fadeIn' | 'scaleIn';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  threshold?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  animation = 'fadeUp',
  delay = 0,
  threshold = 0.15,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add(styles.visible);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.visible);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const style: CSSProperties = delay > 0 ? { transitionDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref}
      className={`${styles.root} ${styles[animation]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
