'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

interface DigitRollProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  labelClassName?: string;
}

/**
 * Slot-machine style digit roller. Each digit column slides into place
 * independently, creating a dramatic mechanical-counter effect.
 */
export function DigitRoll({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
}: DigitRollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && !hasTriggered) setHasTriggered(true);
  }, [isInView, hasTriggered]);

  // Format the target number into individual characters
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  const chars = `${prefix}${formatted}${suffix}`.split('');

  return (
    <div
      ref={ref}
      className={`inline-flex items-baseline overflow-hidden ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      aria-label={`${prefix}${formatted}${suffix}`}
    >
      {chars.map((char, i) => {
        const isDigit = /\d/.test(char);
        if (!isDigit) {
          // Static character (comma, dot, prefix, suffix)
          return (
            <motion.span
              key={`${i}-${char}`}
              initial={{ opacity: 0 }}
              animate={hasTriggered ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
            >
              {char}
            </motion.span>
          );
        }

        const digit = parseInt(char, 10);
        return (
          <RollingDigit
            key={`${i}-digit`}
            target={digit}
            active={hasTriggered}
            delay={0.15 + i * 0.06}
          />
        );
      })}
    </div>
  );
}

function RollingDigit({
  target,
  active,
  delay,
}: {
  target: number;
  active: boolean;
  delay: number;
}) {
  // We create a column of digits 0-9, then translate to reveal the target
  const digitHeight = '1em';

  return (
    <span className="relative inline-block overflow-hidden" style={{ height: digitHeight, lineHeight: digitHeight }}>
      <motion.span
        className="flex flex-col"
        initial={{ y: 0 }}
        animate={active ? { y: `${-target * 100}%` } : {}}
        transition={{
          duration: 0.8 + target * 0.06,
          delay,
          ease: [0.33, 1, 0.68, 1],
        }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span
            key={d}
            className="block text-center"
            style={{ height: digitHeight, lineHeight: digitHeight }}
            aria-hidden={d !== target}
          >
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
