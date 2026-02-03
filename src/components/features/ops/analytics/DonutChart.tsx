'use client';

import { useMemo } from 'react';
import styles from './analytics.module.css';

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  size?: number;
  loading?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  data,
  title,
  subtitle,
  size = 160,
  loading = false,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const segments = useMemo(() => {
    const totalValue = data.reduce((sum, d) => sum + d.value, 0);

    let cumulativePercent = 0;
    return data.map((d) => {
      const percent = d.value / totalValue;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;

      return {
        ...d,
        percent,
        startPercent,
        endPercent: cumulativePercent,
      };
    });
  }, [data]);

  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  if (loading) {
    return (
      <div className={styles.chartCard}>
        {title && (
          <div className={styles.chartHeader}>
            <div className={styles.skeletonTitle} />
          </div>
        )}
        <div className={styles.donutSkeleton} style={{ width: size, height: size }} />
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
      <div className={styles.donutContainer}>
        <div className={styles.donutChart} style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />

            {/* Data segments */}
            {segments.map((segment, i) => {
              const dashoffset = circumference * (1 - segment.percent);
              const rotation = segment.startPercent * 360 - 90;

              return (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    transition: 'stroke-dashoffset 0.5s ease',
                  }}
                />
              );
            })}
          </svg>

          {/* Center content */}
          <div className={styles.donutCenter}>
            {centerValue && <span className={styles.donutValue}>{centerValue}</span>}
            {centerLabel && <span className={styles.donutLabel}>{centerLabel}</span>}
          </div>
        </div>

        {/* Legend */}
        <div className={styles.donutLegend}>
          {segments.map((segment, i) => (
            <div key={i} className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: segment.color }}
              />
              <span className={styles.legendLabel}>{segment.label}</span>
              <span className={styles.legendValue}>
                {segment.value.toLocaleString()} ({Math.round(segment.percent * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DonutChart;
