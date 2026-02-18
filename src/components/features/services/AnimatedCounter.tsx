'use client';

import { useRef, useEffect, useState } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.unobserve(el);

          if (prefersReduced) {
            setDisplay(formatNumber(end));
            return;
          }

          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuint(progress);
            const current = eased * end;

            setDisplay(formatNumber(current));

            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  function formatNumber(n: number): string {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(decimals > 0 ? n : Math.round(n));
    return `${prefix}${formatted}${suffix}`;
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {display}
    </span>
  );
}
