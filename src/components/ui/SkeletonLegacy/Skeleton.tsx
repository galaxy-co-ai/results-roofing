import styles from './Skeleton.module.css';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Number of text lines */
  lines?: number;
  /** Animation enabled */
  animation?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Loading placeholder skeleton
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = true,
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  const classes = [
    styles.skeleton,
    styles[variant],
    animation ? styles.animated : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={styles.textContainer}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={classes}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width, // Last line shorter
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={classes} style={style} aria-hidden="true" />
  );
}

export default Skeleton;
