import { TrendingUp, Clock, Percent, ExternalLink } from 'lucide-react';
import styles from './ROIValueDisplay.module.css';

type ROIVariant = 'sidebar' | 'inline' | 'compact';

interface ROIValueDisplayProps {
  /** Display style variant */
  variant?: ROIVariant;
  /** Show data source citation */
  showSource?: boolean;
  /** Additional CSS class */
  className?: string;
}

interface ValueProp {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: <TrendingUp size={24} />,
    value: '68%',
    label: 'ROI at Resale',
    description: 'Average return on investment when selling your home',
  },
  {
    icon: <Clock size={24} />,
    value: '12 Days',
    label: 'Faster Sale',
    description: 'Homes with new roofs sell 1-2 weeks faster on average',
  },
  {
    icon: <Percent size={24} />,
    value: '19%',
    label: 'Premium Savings',
    description: 'Average insurance premium reduction with a new roof',
  },
];

/**
 * ROI and value messaging component (F16)
 * Reinforces purchase decision with data-backed benefits
 */
export function ROIValueDisplay({
  variant = 'sidebar',
  showSource = true,
  className = '',
}: ROIValueDisplayProps) {
  const containerClass = [
    styles.container,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'compact') {
    return (
      <div className={containerClass}>
        <div className={styles.compactGrid}>
          {VALUE_PROPS.map((prop) => (
            <div key={prop.label} className={styles.compactItem}>
              <span className={styles.compactValue}>{prop.value}</span>
              <span className={styles.compactLabel}>{prop.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <h3 className={styles.title}>Why a New Roof Pays Off</h3>
      
      <div className={styles.valueList}>
        {VALUE_PROPS.map((prop) => (
          <div key={prop.label} className={styles.valueItem}>
            <div className={styles.valueIcon} aria-hidden="true">
              {prop.icon}
            </div>
            <div className={styles.valueContent}>
              <div className={styles.valueHeader}>
                <span className={styles.valueNumber}>{prop.value}</span>
                <span className={styles.valueLabel}>{prop.label}</span>
              </div>
              <p className={styles.valueDescription}>{prop.description}</p>
            </div>
          </div>
        ))}
      </div>

      {showSource && (
        <div className={styles.source}>
          <a
            href="https://www.remodeling.hw.net/cost-vs-value/2023/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            <ExternalLink size={14} aria-hidden="true" />
            Source: Remodeling Magazine Cost vs. Value Report
          </a>
        </div>
      )}
    </div>
  );
}

export default ROIValueDisplay;
