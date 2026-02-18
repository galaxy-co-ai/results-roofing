import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './ServiceTierCard.module.css';

type Tier = 'good' | 'better' | 'best';

interface ServiceTierCardProps {
  tier: Tier;
  name: string;
  tagline: string;
  warranty: string;
  features: string[];
  popular?: boolean;
}

const tierLabels: Record<Tier, string> = {
  good: 'Good',
  better: 'Better',
  best: 'Best',
};

const ctaStyles: Record<Tier, string> = {
  good: styles.ctaGood,
  better: styles.ctaBetter,
  best: styles.ctaBest,
};

const checkColors: Record<Tier, string> = {
  good: 'text-green-500',
  better: 'text-blue-500',
  best: 'text-amber-400',
};

const taglineColors: Record<Tier, string> = {
  good: 'text-slate-500',
  better: 'text-slate-500',
  best: 'text-slate-300',
};

const featureTextColors: Record<Tier, string> = {
  good: 'text-slate-600',
  better: 'text-slate-600',
  best: 'text-slate-300',
};

const warrantyStyles: Record<Tier, string> = {
  good: 'bg-slate-50 text-slate-600',
  better: 'bg-blue-50 text-blue-700',
  best: 'bg-white/10 text-amber-300',
};

export function ServiceTierCard({
  tier,
  name,
  tagline,
  warranty,
  features,
  popular,
}: ServiceTierCardProps) {
  const isInverted = tier === 'best';

  return (
    <div className={`${styles.card} ${styles[tier]}`}>
      {popular && <div className={styles.badge}>Most Popular</div>}

      {/* Header */}
      <div className="text-center mb-6">
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            tier === 'good'
              ? 'text-slate-400'
              : tier === 'better'
              ? 'text-blue-600'
              : 'text-amber-400'
          }`}
        >
          {tierLabels[tier]}
        </span>
        <h3
          className={`font-[family-name:var(--font-sora)] text-xl font-bold mt-1 ${
            isInverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          {name}
        </h3>
        <p className={`text-sm mt-1 ${taglineColors[tier]}`}>{tagline}</p>
      </div>

      {/* Warranty badge */}
      <div className={`text-center mb-6 py-2.5 rounded-lg text-sm font-medium ${warrantyStyles[tier]}`}>
        {warranty}
      </div>

      {/* Features */}
      <ul className={styles.featureList}>
        {features.map((feature) => (
          <li key={feature} className={styles.featureItem}>
            <CheckCircle2
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${checkColors[tier]}`}
            />
            <span className={featureTextColors[tier]}>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href="/quote/new" className={`${ctaStyles[tier]} mt-8`}>
        Get a Quote
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
