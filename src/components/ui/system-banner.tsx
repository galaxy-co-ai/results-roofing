'use client';

import { cn } from '@/lib/utils';

interface SystemBannerProps {
  text?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  show?: boolean;
  className?: string;
}

export function SystemBanner({
  text = 'Admin Panel',
  color = 'bg-rose-500',
  size = 'xs',
  show = true,
  className,
}: SystemBannerProps) {
  if (!show) return null;

  const sizeStyles = {
    xs: 'py-[3px] px-3 text-[10px]',
    sm: 'py-1 px-4 text-[11px]',
    md: 'py-1.5 px-5 text-xs',
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className={cn(
          'rounded-b-md font-medium text-white pointer-events-auto',
          color,
          sizeStyles[size],
          className
        )}
        role="banner"
        aria-label="System status banner"
      >
        {text}
      </div>
    </div>
  );
}

export default SystemBanner;
