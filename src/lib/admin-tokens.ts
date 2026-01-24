/**
 * ADMIN DESIGN SYSTEM - TypeScript Token Constants
 *
 * Use these when you need colors in JavaScript/TypeScript.
 * For CSS, always prefer CSS variables from admin.css
 *
 * Philosophy: Strict, minimal, intentional.
 * Every color earns its place.
 */

// ==============================================
// COLOR PRIMITIVES
// ==============================================

export const colors = {
  // Blue Scale - Primary brand accent
  blue: {
    600: '#1554CC',  // Pressed/active
    500: '#1E6CFF',  // Primary
    400: '#4D8CFF',  // Hover on dark
    100: '#E8F1FF',  // Subtle bg
    50: '#F5F8FF',   // Lightest
  },

  // Charcoal Scale - Text and dark elements
  charcoal: {
    900: '#0F1115',
    800: '#1E2329',  // Primary text
    700: '#2A3038',
  },

  // Gray Scale - The backbone
  gray: {
    900: '#1E2329',
    700: '#374151',
    600: '#4A5568',  // Body text
    500: '#6B7A94',  // Secondary
    400: '#9BA8BD',  // Tertiary
    300: '#D1D9E6',  // Strong borders
    200: '#E8EDF5',  // Default borders
    100: '#F2F4F8',  // Hover bg
    50: '#F7F9FC',   // Page bg
    0: '#FFFFFF',    // Cards
  },

  // Status - Functional only
  status: {
    success: '#22C55E',
    successMuted: '#DCFCE7',
    warning: '#F59E0B',
    warningMuted: '#FEF3C7',
    error: '#EF4444',
    errorMuted: '#FEE2E2',
    info: '#3B82F6',
    infoMuted: '#DBEAFE',
  },

  // Pure
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

// ==============================================
// SEMANTIC TOKENS
// ==============================================

export const semantic = {
  // Backgrounds
  bg: {
    page: colors.gray[50],
    card: colors.gray[0],
    elevated: colors.gray[0],
    muted: colors.gray[100],
    subtle: colors.gray[50],
    inverse: colors.charcoal[800],
    hover: colors.gray[100],
    active: colors.gray[200],
    selected: colors.blue[50],
    selectedStrong: colors.blue[100],
  },

  // Text
  text: {
    primary: colors.charcoal[800],
    secondary: colors.gray[500],
    tertiary: colors.gray[400],
    disabled: colors.gray[300],
    inverse: colors.gray[0],
    link: colors.blue[500],
    linkHover: colors.blue[600],
  },

  // Borders
  border: {
    default: colors.gray[200],
    strong: colors.gray[300],
    focus: colors.blue[500],
    error: colors.status.error,
    success: colors.status.success,
  },

  // Interactive
  interactive: {
    primary: colors.blue[500],
    primaryHover: colors.blue[600],
    primaryText: colors.white,
    destructive: colors.status.error,
    destructiveHover: '#DC2626',
    destructiveText: colors.white,
  },

  // Focus
  focus: {
    ring: colors.blue[500],
    ringAlpha: 'rgba(30, 108, 255, 0.15)',
  },
} as const;

// ==============================================
// SPACING
// 4px base grid
// ==============================================

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ==============================================
// TYPOGRAPHY
// ==============================================

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SF Mono', 'Fira Code', 'Roboto Mono', ui-monospace, monospace",
  },

  fontSize: {
    xs: '0.6875rem',   // 11px
    sm: '0.75rem',     // 12px
    base: '0.8125rem', // 13px
    md: '0.875rem',    // 14px
    lg: '1rem',        // 16px
    xl: '1.125rem',    // 18px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.75rem',  // 28px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

// ==============================================
// BORDER RADIUS
// ==============================================

export const radius = {
  sm: '4px',
  md: '6px',    // Default
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

// ==============================================
// SHADOWS
// ==============================================

export const shadows = {
  sm: '0 1px 2px rgba(30, 35, 41, 0.04)',
  md: '0 2px 4px rgba(30, 35, 41, 0.06), 0 1px 2px rgba(30, 35, 41, 0.04)',
  lg: '0 4px 8px rgba(30, 35, 41, 0.08), 0 2px 4px rgba(30, 35, 41, 0.04)',
  xl: '0 8px 16px rgba(30, 35, 41, 0.1), 0 4px 8px rgba(30, 35, 41, 0.06)',
  '2xl': '0 16px 32px rgba(30, 35, 41, 0.12), 0 8px 16px rgba(30, 35, 41, 0.08)',
  focus: '0 0 0 3px rgba(30, 108, 255, 0.15)',
} as const;

// ==============================================
// TRANSITIONS
// ==============================================

export const transitions = {
  fast: '100ms ease',
  base: '150ms ease',
  slow: '250ms ease',
} as const;

// ==============================================
// Z-INDEX
// ==============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
} as const;

// ==============================================
// STATUS BADGE COLORS
// For inline styles where CSS vars aren't practical
// ==============================================

export const statusBadgeColors = {
  // Task/Kanban statuses
  backlog: { bg: colors.gray[100], text: colors.gray[500] },
  todo: { bg: colors.gray[100], text: colors.gray[600] },
  in_progress: { bg: colors.status.warningMuted, text: '#B45309' },
  review: { bg: colors.blue[100], text: colors.blue[600] },
  done: { bg: colors.status.successMuted, text: '#16A34A' },

  // Priority
  urgent: { bg: colors.status.errorMuted, text: colors.status.error },
  high: { bg: '#FEF3C7', text: '#B45309' },
  medium: { bg: colors.blue[100], text: colors.blue[600] },
  low: { bg: colors.gray[100], text: colors.gray[500] },

  // General statuses
  active: { bg: colors.status.successMuted, text: '#16A34A' },
  pending: { bg: colors.gray[100], text: colors.gray[500] },
  blocked: { bg: colors.status.errorMuted, text: colors.status.error },
  complete: { bg: colors.status.successMuted, text: '#16A34A' },
} as const;

// ==============================================
// COLUMN COLORS (Kanban)
// ==============================================

export const columnColors = {
  backlog: colors.gray[400],
  todo: colors.gray[500],
  in_progress: colors.status.warning,
  review: colors.blue[500],
  done: colors.status.success,
} as const;

// ==============================================
// HELPER: Get CSS variable reference
// ==============================================

export function cssVar(name: string): string {
  return `var(--admin-${name})`;
}

// ==============================================
// EXPORT ALL
// ==============================================

export const adminTokens = {
  colors,
  semantic,
  spacing,
  typography,
  radius,
  shadows,
  transitions,
  zIndex,
  statusBadgeColors,
  columnColors,
} as const;

export default adminTokens;
