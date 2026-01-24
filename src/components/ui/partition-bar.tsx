'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Size variants for the partition bar
const partitionBarVariants = cva('flex w-full', {
  variants: {
    size: {
      xs: 'h-2',
      sm: 'h-3',
      md: 'h-4',
      lg: 'h-6',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

// Segment variants
const segmentVariants = cva('transition-colors', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary',
      destructive: 'bg-destructive',
      muted: 'bg-muted',
      outline: 'bg-transparent border border-border',
      // Custom brand colors
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface PartitionBarContextValue {
  total: number;
  size: 'xs' | 'sm' | 'md' | 'lg';
  gap: number;
}

const PartitionBarContext = React.createContext<PartitionBarContextValue>({
  total: 0,
  size: 'sm',
  gap: 1,
});

// ============================================
// PartitionBar
// ============================================
interface PartitionBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof partitionBarVariants> {
  gap?: number;
  children: React.ReactNode;
}

export function PartitionBar({
  className,
  size = 'md',
  gap = 1,
  children,
  ...props
}: PartitionBarProps) {
  // Calculate total from children
  const total = React.useMemo(() => {
    let sum = 0;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && typeof child.props.num === 'number') {
        sum += child.props.num;
      }
    });
    return sum;
  }, [children]);

  return (
    <PartitionBarContext.Provider value={{ total, size: size || 'md', gap }}>
      <div
        className={cn(partitionBarVariants({ size }), className)}
        style={{ gap: `${gap * 4}px` }}
        {...props}
      >
        {children}
      </div>
    </PartitionBarContext.Provider>
  );
}

// ============================================
// PartitionBarSegment
// ============================================
interface PartitionBarSegmentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof segmentVariants> {
  num: number;
  alignment?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export function PartitionBarSegment({
  className,
  variant = 'default',
  num,
  alignment = 'center',
  children,
  ...props
}: PartitionBarSegmentProps) {
  const { total, size } = React.useContext(PartitionBarContext);
  const widthPercent = total > 0 ? (num / total) * 100 : 0;
  const isCompact = size === 'xs' || size === 'sm';

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const sizeClasses = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  // For compact sizes, don't render text inside the bar
  if (isCompact) {
    return (
      <div
        className={cn(
          'rounded-sm overflow-hidden',
          segmentVariants({ variant }),
          className
        )}
        style={{ width: `${widthPercent}%` }}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col justify-center rounded-md overflow-hidden',
        segmentVariants({ variant }),
        alignmentClasses[alignment],
        className
      )}
      style={{ width: `${widthPercent}%` }}
      {...props}
    >
      <div className={cn('px-1.5 flex flex-col whitespace-nowrap', sizeClasses[size])}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// PartitionBarSegmentTitle
// ============================================
interface PartitionBarSegmentTitleProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function PartitionBarSegmentTitle({
  className,
  children,
  ...props
}: PartitionBarSegmentTitleProps) {
  return (
    <span
      className={cn('font-medium text-white/90 truncate', className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================
// PartitionBarSegmentValue
// ============================================
interface PartitionBarSegmentValueProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function PartitionBarSegmentValue({
  className,
  children,
  ...props
}: PartitionBarSegmentValueProps) {
  return (
    <span
      className={cn('font-bold text-white tabular-nums', className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default PartitionBar;
