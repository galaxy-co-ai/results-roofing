import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Card content */
  children: ReactNode;
}

/**
 * Container card component
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, className = '', ...props }, ref) => {
    const classes = [
      styles.card,
      styles[variant],
      styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/* Card Header */
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`${styles.header} ${className}`.trim()}>{children}</div>
  );
}

/* Card Title */
interface CardTitleProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
}

export function CardTitle({ children, as: Component = 'h3', className = '' }: CardTitleProps) {
  return (
    <Component className={`${styles.title} ${className}`.trim()}>
      {children}
    </Component>
  );
}

/* Card Description */
interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`${styles.description} ${className}`.trim()}>{children}</p>
  );
}

/* Card Content */
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`${styles.content} ${className}`.trim()}>{children}</div>
  );
}

/* Card Footer */
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`${styles.footer} ${className}`.trim()}>{children}</div>
  );
}

export default Card;
