'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { DigitRoll } from '@/components/ui/DigitRoll';

/* ─── DATA ─── */

const stats = [
  { value: 10000, suffix: '+', label: 'Roofs Replaced' },
  { value: 5, suffix: '', label: 'States Served' },
  { value: 50, suffix: '-Yr', label: 'Warranty Available' },
  { value: 4.9, suffix: '', decimals: 1, label: 'Customer Rating' },
];

/* ─── ANIMATION CONSTANTS ─── */

const branchEase: [number, number, number, number] = [0.33, 1, 0.68, 1];

/* ─── COMPONENT ─── */

export function ResultsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-driven spine fill
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.4'],
  });
  const spineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 md:py-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Results That Speak
          </h2>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Numbers don&apos;t lie. Here&apos;s what years of expert roof
            replacement look like.
          </p>
        </div>

        {/* Timeline container */}
        <div ref={containerRef} className="relative">
          {/* ── Spine track (faint) ── */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/[0.06] -translate-x-1/2"
            aria-hidden="true"
          />

          {/* ── Spine fill (scroll-driven) ── */}
          <motion.div
            className="absolute left-4 md:left-1/2 top-0 w-px bg-white/20 -translate-x-1/2 origin-top"
            style={{ height: spineHeight }}
            aria-hidden="true"
          />

          {/* ── Stat rows ── */}
          <div className="flex flex-col gap-16 md:gap-20">
            {stats.map((stat, index) => (
              <StatRow key={stat.label} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── STAT ROW ─── */

interface StatRowProps {
  stat: (typeof stats)[number];
  index: number;
}

function StatRow({ stat, index }: StatRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, amount: 0.5 });

  const isEven = index % 2 === 0;

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-[1fr_32px_1fr] md:grid-cols-[1fr_auto_1fr] items-center"
    >
      {/* ── Left column ── */}
      <div className={`${isEven ? 'hidden md:block' : 'hidden'}`}>
        {isEven && (
          <StatContent
            stat={stat}
            align="right"
            isInView={isInView}
            fromLeft
          />
        )}
      </div>
      {/* Mobile: stat always in left col */}
      <div className={`md:hidden ${isEven ? '' : 'hidden'}`}>
        <StatContent
          stat={stat}
          align="left"
          isInView={isInView}
          fromLeft={false}
        />
      </div>

      {/* ── Center node ── */}
      <div className="flex flex-col items-center justify-center w-8 md:w-24 relative">
        {/* Dot */}
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-white/30 ring-[3px] ring-slate-900 z-10 relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        />

        {/* Branch line — toward stat side */}
        <motion.div
          className={`absolute top-1/2 h-px bg-white/15 -translate-y-1/2 ${
            /* Mobile: always branch right; Desktop: branch toward stat */
            isEven
              ? 'right-0 left-1/2 origin-left md:left-auto md:right-1/2 md:origin-right'
              : 'right-0 left-1/2 origin-left md:left-1/2 md:right-auto md:origin-left'
          }`}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{
            duration: 0.5,
            delay: 0.15,
            ease: branchEase,
          }}
        />
      </div>

      {/* ── Right column ── */}
      <div className={`${isEven ? 'hidden' : 'hidden md:block'}`}>
        {!isEven && (
          <StatContent
            stat={stat}
            align="left"
            isInView={isInView}
            fromLeft={false}
          />
        )}
      </div>
      {/* Mobile: stat always in right col for odd-indexed, but we want all on same side */}
      <div className={`md:hidden ${isEven ? 'hidden' : ''}`}>
        <StatContent
          stat={stat}
          align="left"
          isInView={isInView}
          fromLeft={false}
        />
      </div>
    </div>
  );
}

/* ─── STAT CONTENT ─── */

interface StatContentProps {
  stat: (typeof stats)[number];
  align: 'left' | 'right';
  isInView: boolean;
  fromLeft: boolean;
}

function StatContent({ stat, align, isInView, fromLeft }: StatContentProps) {
  return (
    <motion.div
      className={`${align === 'right' ? 'text-right' : 'text-left'}`}
      initial={{ opacity: 0, x: fromLeft ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: 0.25,
        ease: branchEase,
      }}
    >
      <DigitRoll
        value={stat.value}
        suffix={stat.suffix}
        decimals={stat.decimals ?? 0}
        className="font-[family-name:var(--font-sora)] text-[clamp(3rem,8vw,6rem)] font-bold text-white leading-none"
      />
      <p className="font-[family-name:var(--font-sora)] text-base md:text-lg tracking-wider uppercase text-slate-400 mt-2">
        {stat.label}
      </p>
    </motion.div>
  );
}
