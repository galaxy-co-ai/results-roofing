'use client';

import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon,
  iconColor = '#64748B',
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      padding: '1.5rem',
      iconSize: 32,
      iconPadding: '0.75rem',
      titleSize: '0.875rem',
      descSize: '0.75rem',
      gap: '0.75rem',
    },
    md: {
      padding: '2.5rem',
      iconSize: 40,
      iconPadding: '1rem',
      titleSize: '1rem',
      descSize: '0.875rem',
      gap: '1rem',
    },
    lg: {
      padding: '3.5rem',
      iconSize: 48,
      iconPadding: '1.25rem',
      titleSize: '1.125rem',
      descSize: '0.875rem',
      gap: '1.25rem',
    },
  };

  const s = sizeStyles[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: s.padding,
      }}
    >
      {/* Icon with gradient ring */}
      <div
        style={{
          position: 'relative',
          marginBottom: s.gap,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            background: `conic-gradient(from 180deg, ${iconColor}20, ${iconColor}05, ${iconColor}20)`,
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'relative',
            padding: s.iconPadding,
            borderRadius: '50%',
            background: `${iconColor}10`,
            border: `1px solid ${iconColor}20`,
          }}
        >
          <Icon size={s.iconSize} style={{ color: iconColor, opacity: 0.7 }} />
        </div>
      </div>

      {/* Text */}
      <h3
        style={{
          fontSize: s.titleSize,
          fontWeight: 600,
          color: 'var(--foreground)',
          margin: 0,
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: s.descSize,
          color: 'var(--muted-foreground)',
          margin: 0,
          maxWidth: '280px',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '1.25rem',
          }}
        >
          {action && (
            <Button
              size="sm"
              onClick={action.onClick}
              style={{ background: iconColor }}
            >
              {action.icon && <action.icon size={14} />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface EmptyStatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  emptyText?: string;
}

export function EmptyStatCard({
  icon: Icon,
  iconColor = '#64748B',
  label,
  emptyText = 'No data yet',
}: EmptyStatCardProps) {
  return (
    <div
      style={{
        padding: '1.25rem',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--muted-foreground)',
              margin: '0 0 0.5rem',
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--muted-foreground)',
              margin: 0,
              opacity: 0.5,
            }}
          >
            —
          </p>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              marginTop: '0.25rem',
              opacity: 0.7,
            }}
          >
            {emptyText}
          </p>
        </div>
        <div
          style={{
            padding: '0.5rem',
            borderRadius: '0.5rem',
            background: `${iconColor}10`,
            opacity: 0.5,
          }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
