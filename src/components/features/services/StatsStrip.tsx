'use client';

import { AnimatedCounter } from './AnimatedCounter';
import { ScrollReveal } from './ScrollReveal';

const stats = [
  { end: 10000, suffix: '+', label: 'Roofs Replaced' },
  { end: 5, suffix: ' States', label: 'Service Area' },
  { end: 50, suffix: '-Year', label: 'Warranty Available' },
  { end: 4.9, suffix: ' Rating', decimals: 1, label: 'Customer Score' },
];

export function StatsStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 max-w-5xl mx-auto">
      {stats.map((stat, i) => (
        <ScrollReveal key={stat.label} animation="fadeUp" delay={i * 100}>
          <div className="text-center">
            <AnimatedCounter
              end={stat.end}
              suffix={stat.suffix}
              decimals={stat.decimals ?? 0}
              className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900"
            />
            <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
