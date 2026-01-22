import type { ReactNode } from 'react';
import styles from './Container.module.css';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps {
  /** Container max-width */
  size?: ContainerSize;
  /** Center content vertically */
  centerVertical?: boolean;
  /** Add padding to content */
  padded?: boolean;
  /** Container content */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** HTML element to render */
  as?: 'div' | 'main' | 'section' | 'article';
}

/**
 * Max-width container with consistent padding
 */
export function Container({
  size = 'lg',
  centerVertical = false,
  padded = true,
  children,
  className = '',
  as: Component = 'div',
}: ContainerProps) {
  const classes = [
    styles.container,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    centerVertical ? styles.centerVertical : '',
    padded ? styles.padded : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Component className={classes}>{children}</Component>;
}

export default Container;
