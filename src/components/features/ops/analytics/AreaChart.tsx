'use client';

import { useMemo } from 'react';
import styles from './analytics.module.css';

interface DataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  color?: string;
  height?: number;
  loading?: boolean;
  formatValue?: (value: number) => string;
}

export function AreaChart({
  data,
  title,
  subtitle,
  color = '#06b6d4',
  height = 200,
  loading = false,
  formatValue = (v) => v.toLocaleString(),
}: AreaChartProps) {
  const { pathData, areaData, maxValue, points } = useMemo(() => {
    if (data.length === 0) {
      return { pathData: '', areaData: '', maxValue: 0, points: [] };
    }

    const max = Math.max(...data.map((d) => d.value)) * 1.1; // Add 10% padding
    const chartWidth = 100;
    const chartHeight = 100;

    const pts = data.map((d, i) => ({
      x: (i / (data.length - 1)) * chartWidth,
      y: chartHeight - (d.value / max) * chartHeight,
      ...d,
    }));

    // Create smooth curve path
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Create area path
    const area = `${path} L ${pts[pts.length - 1].x} ${chartHeight} L ${pts[0].x} ${chartHeight} Z`;

    return { pathData: path, areaData: area, maxValue: max, points: pts };
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

  return (
    <div className={styles.chartCard}>
      {(title || subtitle) && (
        <div className={styles.chartHeader}>
          {title && <h3 className={styles.chartTitle}>{title}</h3>}
          {subtitle && <span className={styles.chartSubtitle}>{subtitle}</span>}
        </div>
      )}
      <div className={styles.chartContainer} style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={styles.chartSvg}
        >
          {/* Grid lines */}
          <g className={styles.gridLines}>
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} />
            ))}
          </g>

          {/* Gradient definition */}
          <defs>
            <linearGradient id={`areaGradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={areaData}
            fill={`url(#areaGradient-${title})`}
            className={styles.chartArea}
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className={styles.chartLine}
          />

          {/* Data points */}
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="white"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className={styles.chartPoint}
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className={styles.yAxisLabels}>
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(maxValue / 2)}</span>
          <span>0</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className={styles.xAxisLabels}>
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export default AreaChart;
