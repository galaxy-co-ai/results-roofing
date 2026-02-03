'use client';

import { useMemo } from 'react';
import styles from './analytics.module.css';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  color?: string;
  height?: number;
  loading?: boolean;
  formatValue?: (value: number) => string;
  horizontal?: boolean;
}

export function BarChart({
  data,
  title,
  subtitle,
  color = '#06b6d4',
  height = 200,
  loading = false,
  formatValue = (v) => v.toLocaleString(),
  horizontal = false,
}: BarChartProps) {
  const { maxValue, bars } = useMemo(() => {
    if (data.length === 0) {
      return { maxValue: 0, bars: [] };
    }

    const max = Math.max(...data.map((d) => d.value));

    const barsData = data.map((d) => ({
      ...d,
      percentage: (d.value / max) * 100,
    }));

    return { maxValue: max, bars: barsData };
  }, [data]);

  if (loading) {
    return (
      <div className={styles.chartCard}>
        {title && (
          <div className={styles.chartHeader}>
            <div className={styles.skeletonTitle} />
          </div>
        )}
        <div className={styles.chartSkeleton} style={{ height }} />
      </div>
    );
  }

  if (horizontal) {
    return (
      <div className={styles.chartCard}>
        {(title || subtitle) && (
          <div className={styles.chartHeader}>
            {title && <h3 className={styles.chartTitle}>{title}</h3>}
            {subtitle && <span className={styles.chartSubtitle}>{subtitle}</span>}
          </div>
        )}
        <div className={styles.horizontalBars}>
          {bars.map((bar, i) => (
            <div key={i} className={styles.horizontalBarRow}>
              <span className={styles.barLabel}>{bar.label}</span>
              <div className={styles.horizontalBarTrack}>
                <div
                  className={styles.horizontalBarFill}
                  style={{
                    width: `${bar.percentage}%`,
                    backgroundColor: bar.color || color,
                  }}
                />
              </div>
              <span className={styles.barValue}>{formatValue(bar.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      {(title || subtitle) && (
        <div className={styles.chartHeader}>
          {title && <h3 className={styles.chartTitle}>{title}</h3>}
          {subtitle && <span className={styles.chartSubtitle}>{subtitle}</span>}
        </div>
      )}
      <div className={styles.verticalBarsContainer} style={{ height }}>
        <div className={styles.yAxisLabels}>
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(maxValue / 2)}</span>
          <span>0</span>
        </div>
        <div className={styles.verticalBars}>
          {bars.map((bar, i) => (
            <div key={i} className={styles.verticalBarColumn}>
              <div className={styles.verticalBarTrack}>
                <div
                  className={styles.verticalBarFill}
                  style={{
                    height: `${bar.percentage}%`,
                    backgroundColor: bar.color || color,
                  }}
                />
              </div>
              <span className={styles.barLabelVertical}>{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BarChart;
