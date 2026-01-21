# 16 - Design Tokens

> **Purpose:** Defines the complete CSS custom property system for Results Roofing. Single source of truth for all visual styling. Implements the brand from BRAND-ASSETS.md and supports components from 06-component-specs.md.

**Status:** COMPLETE
**Last Updated:** 2026-01-21

---

## Design Tokens Overview

### Token Philosophy

Design tokens bridge design and code by creating a shared vocabulary. Benefits:
- **Consistency:** Same values everywhere
- **Maintainability:** Change once, update everywhere
- **Documentation:** Self-documenting design system
- **Flexibility:** Easy theming if needed later

**Naming Convention:** Semantic with prefix

All tokens use the `--rr-` prefix (Results Roofing) followed by category and name:
```
--rr-[category]-[subcategory]-[name]
```

Examples:
- `--rr-color-bg-primary`
- `--rr-font-size-base`
- `--rr-space-4`

**Abstraction Levels:**
1. **Primitive tokens:** Raw values (colors, sizes)
2. **Semantic tokens:** Named by purpose (references primitives)
3. **Component tokens:** Component-specific (references semantic)

**Implementation:** CSS Custom Properties in dedicated token files

### Token File Structure

Per 15-file-architecture.md, tokens live in `src/styles/tokens/`:

```
src/styles/tokens/
├── index.css          # Imports all token files
├── colors.css         # Color primitives and semantics
├── typography.css     # Font families, sizes, weights, line heights
├── spacing.css        # Spacing scale
├── shadows.css        # Shadow primitives
├── animations.css     # Durations, easings, transitions
├── radii.css          # Border radius scale
├── z-index.css        # Z-index scale
├── breakpoints.css    # Responsive breakpoints (as comments, used in media queries)
└── components.css     # Component-specific tokens
```

**Import Pattern:**
```css
/* src/styles/tokens/index.css */
@import './colors.css';
@import './typography.css';
@import './spacing.css';
@import './radii.css';
@import './shadows.css';
@import './animations.css';
@import './z-index.css';
@import './components.css';
```

---

## Colors

### Color Primitives

Based on BRAND-ASSETS.md Dune + OpenAI aesthetic.

```css
/* src/styles/tokens/colors.css */

:root {
  /* ========================================
     COLOR PRIMITIVES
     Raw color values - don't use directly
     ======================================== */

  /* Brand Colors */
  --rr-color-sandstone: #C4A77D;     /* Primary brand - CTAs, accents */
  --rr-color-terracotta: #B86B4C;    /* Secondary accent - hover states */
  --rr-color-charcoal: #2C2C2C;      /* Primary text, strong contrast */

  /* Neutral Palette (warm undertones) */
  --rr-color-white: #FFFFFF;
  --rr-color-cream: #FAF8F5;         /* Page backgrounds, subtle warmth */
  --rr-color-sand-light: #F5F0E8;    /* Secondary backgrounds, dividers */
  --rr-color-sand: #E8E0D4;          /* Borders, disabled states */
  --rr-color-stone: #9C9688;         /* Secondary text, placeholders */
  --rr-color-slate: #5C5C5C;         /* Body text */

  /* Status Colors */
  --rr-color-success: #4A7C59;       /* Confirmations, positive */
  --rr-color-success-light: #E8F5E9; /* Success backgrounds */
  --rr-color-warning: #C9A227;       /* Alerts, attention needed */
  --rr-color-warning-light: #FFF8E1; /* Warning backgrounds */
  --rr-color-error: #B54A4A;         /* Errors, destructive actions */
  --rr-color-error-light: #FFEBEE;   /* Error backgrounds */
  --rr-color-info: #5B7B8C;          /* Informational, neutral alerts */
  --rr-color-info-light: #E3F2FD;    /* Info backgrounds */
}
```

### Semantic Color Tokens

These are the tokens components should reference. Maps primitives to purposes.

```css
:root {
  /* ========================================
     SEMANTIC COLOR TOKENS
     Use these in components
     ======================================== */

  /* Backgrounds */
  --rr-color-bg-primary: var(--rr-color-cream);        /* Main page background */
  --rr-color-bg-secondary: var(--rr-color-white);      /* Cards, panels */
  --rr-color-bg-tertiary: var(--rr-color-sand-light);  /* Subtle sections */
  --rr-color-bg-inverse: var(--rr-color-charcoal);     /* Dark backgrounds */
  --rr-color-bg-muted: var(--rr-color-sand);           /* Disabled, inactive */

  /* Surfaces - interactive backgrounds */
  --rr-color-surface-default: var(--rr-color-white);
  --rr-color-surface-hover: var(--rr-color-sand-light);
  --rr-color-surface-active: var(--rr-color-sand);
  --rr-color-surface-selected: var(--rr-color-sand-light);

  /* Text */
  --rr-color-text-primary: var(--rr-color-charcoal);   /* Main text */
  --rr-color-text-secondary: var(--rr-color-slate);    /* Body text */
  --rr-color-text-tertiary: var(--rr-color-stone);     /* Subtle text, placeholders */
  --rr-color-text-disabled: var(--rr-color-stone);     /* Disabled text */
  --rr-color-text-inverse: var(--rr-color-white);      /* Text on dark backgrounds */
  --rr-color-text-link: var(--rr-color-sandstone);     /* Links */
  --rr-color-text-link-hover: var(--rr-color-terracotta);

  /* Borders */
  --rr-color-border-default: var(--rr-color-sand);     /* Default borders */
  --rr-color-border-strong: var(--rr-color-stone);     /* Emphasized borders */
  --rr-color-border-focus: var(--rr-color-sandstone);  /* Focus rings */
  --rr-color-border-error: var(--rr-color-error);      /* Error state borders */
  --rr-color-border-success: var(--rr-color-success);  /* Success state borders */

  /* Brand Interactive */
  --rr-color-brand-primary: var(--rr-color-sandstone);
  --rr-color-brand-primary-hover: var(--rr-color-terracotta);
  --rr-color-brand-primary-active: var(--rr-color-charcoal);
  --rr-color-brand-secondary: var(--rr-color-terracotta);

  /* Status Semantic */
  --rr-color-status-success: var(--rr-color-success);
  --rr-color-status-success-bg: var(--rr-color-success-light);
  --rr-color-status-warning: var(--rr-color-warning);
  --rr-color-status-warning-bg: var(--rr-color-warning-light);
  --rr-color-status-error: var(--rr-color-error);
  --rr-color-status-error-bg: var(--rr-color-error-light);
  --rr-color-status-info: var(--rr-color-info);
  --rr-color-status-info-bg: var(--rr-color-info-light);

  /* Focus Ring */
  --rr-color-focus-ring: var(--rr-color-sandstone);
  --rr-color-focus-ring-alpha: rgba(196, 167, 125, 0.15);
}
```

### Color Contrast Reference

Per BRAND-ASSETS.md accessibility notes:

| Combination | Ratio | WCAG AA |
|-------------|-------|---------|
| Charcoal on White | 15.6:1 | Pass |
| Charcoal on Cream | 14.2:1 | Pass |
| Slate on White | 7.1:1 | Pass |
| Charcoal on Sandstone | 5.5:1 | Pass |
| White on Terracotta | 4.5:1 | Pass (AA minimum) |
| White on Charcoal | 15.6:1 | Pass |
| Sandstone on White | 2.8:1 | **Fail** - decorative only |

**Rule:** Never use Sandstone as text on white. Use Charcoal for text on Sandstone backgrounds.

---

## Typography

### Font Families

```css
/* src/styles/tokens/typography.css */

:root {
  /* ========================================
     FONT FAMILIES
     ======================================== */

  /* Primary font - headings and body */
  --rr-font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Monospace - code, technical */
  --rr-font-family-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace;
}
```

### Font Loading Strategy

```html
<!-- In app/layout.tsx via next/font -->
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

### Font Sizes

Based on BRAND-ASSETS.md type scale:

```css
:root {
  /* ========================================
     FONT SIZES
     ======================================== */

  --rr-font-size-xs: 0.75rem;     /* 12px - captions, labels */
  --rr-font-size-sm: 0.875rem;    /* 14px - secondary text, body small */
  --rr-font-size-base: 1rem;      /* 16px - body text (prevents iOS zoom) */
  --rr-font-size-lg: 1.125rem;    /* 18px - body large, H4 */
  --rr-font-size-xl: 1.375rem;    /* 22px - H3 */
  --rr-font-size-2xl: 1.75rem;    /* 28px - H2 */
  --rr-font-size-3xl: 2.25rem;    /* 36px - H1 */
  --rr-font-size-4xl: 3rem;       /* 48px - Display */
}
```

### Font Weights

```css
:root {
  /* ========================================
     FONT WEIGHTS
     ======================================== */

  --rr-font-weight-normal: 400;    /* Body text */
  --rr-font-weight-medium: 500;    /* Emphasis, labels, H3/H4 */
  --rr-font-weight-semibold: 600;  /* Headings H1/H2, strong emphasis */
}
```

### Line Heights

```css
:root {
  /* ========================================
     LINE HEIGHTS
     ======================================== */

  --rr-line-height-none: 1;        /* Single line elements */
  --rr-line-height-tight: 1.1;     /* Display headings */
  --rr-line-height-snug: 1.25;     /* H1, H2 */
  --rr-line-height-normal: 1.4;    /* H3, H4, captions */
  --rr-line-height-relaxed: 1.5;   /* Body small */
  --rr-line-height-loose: 1.6;     /* Body text, body large */
}
```

### Letter Spacing

```css
:root {
  /* ========================================
     LETTER SPACING
     ======================================== */

  --rr-letter-spacing-tight: -0.02em;   /* Headings */
  --rr-letter-spacing-normal: 0;        /* Body text */
  --rr-letter-spacing-wide: 0.05em;     /* All caps labels */
}
```

### Text Style Compositions

Pre-composed text styles matching BRAND-ASSETS.md:

| Token | Size | Weight | Line Height | Letter Spacing | Color |
|-------|------|--------|-------------|----------------|-------|
| `--rr-text-display` | 4xl (48px) | 600 | 1.1 | -0.02em | charcoal |
| `--rr-text-h1` | 3xl (36px) | 600 | 1.2 | -0.02em | charcoal |
| `--rr-text-h2` | 2xl (28px) | 600 | 1.25 | -0.02em | charcoal |
| `--rr-text-h3` | xl (22px) | 500 | 1.3 | -0.02em | charcoal |
| `--rr-text-h4` | lg (18px) | 500 | 1.4 | -0.02em | charcoal |
| `--rr-text-body-lg` | lg (18px) | 400 | 1.6 | 0 | slate |
| `--rr-text-body` | base (16px) | 400 | 1.6 | 0 | slate |
| `--rr-text-body-sm` | sm (14px) | 400 | 1.5 | 0 | slate |
| `--rr-text-caption` | xs (12px) | 400 | 1.4 | 0 | stone |
| `--rr-text-label` | xs (12px) | 500 | 1.4 | 0.05em | stone |

---

## Spacing

### Spacing Scale

4px base grid from BRAND-ASSETS.md:

```css
/* src/styles/tokens/spacing.css */

:root {
  /* ========================================
     SPACING SCALE
     Base unit: 4px
     ======================================== */

  --rr-space-0: 0;
  --rr-space-1: 0.25rem;    /* 4px - tight gaps, icon padding */
  --rr-space-2: 0.5rem;     /* 8px - default gap, small padding */
  --rr-space-3: 0.75rem;    /* 12px - form field padding */
  --rr-space-4: 1rem;       /* 16px - card padding, section gaps */
  --rr-space-5: 1.5rem;     /* 24px - component spacing */
  --rr-space-6: 2rem;       /* 32px - section padding */
  --rr-space-7: 3rem;       /* 48px - large section gaps */
  --rr-space-8: 4rem;       /* 64px - page section spacing */
  --rr-space-9: 6rem;       /* 96px - hero/major section spacing */
}
```

### Semantic Spacing Tokens

```css
:root {
  /* ========================================
     SEMANTIC SPACING
     ======================================== */

  /* Component Internal */
  --rr-space-component-xs: var(--rr-space-1);   /* 4px - tight grouping */
  --rr-space-component-sm: var(--rr-space-2);   /* 8px - default internal */
  --rr-space-component-md: var(--rr-space-3);   /* 12px - comfortable internal */
  --rr-space-component-lg: var(--rr-space-4);   /* 16px - spacious internal */

  /* Layout Spacing */
  --rr-space-layout-sm: var(--rr-space-4);      /* 16px - compact layouts */
  --rr-space-layout-md: var(--rr-space-5);      /* 24px - default layouts */
  --rr-space-layout-lg: var(--rr-space-6);      /* 32px - spacious layouts */
  --rr-space-layout-xl: var(--rr-space-7);      /* 48px - section spacing */
  --rr-space-layout-2xl: var(--rr-space-9);     /* 96px - major sections */

  /* Page Margins */
  --rr-space-page-x-mobile: var(--rr-space-4);  /* 16px - mobile horizontal */
  --rr-space-page-x-desktop: var(--rr-space-5); /* 24px - desktop horizontal */
  --rr-space-page-y: var(--rr-space-5);         /* 24px - vertical page padding */

  /* Gap Scale (for flexbox/grid) */
  --rr-gap-xs: var(--rr-space-1);   /* 4px */
  --rr-gap-sm: var(--rr-space-2);   /* 8px */
  --rr-gap-md: var(--rr-space-3);   /* 12px */
  --rr-gap-lg: var(--rr-space-4);   /* 16px */
  --rr-gap-xl: var(--rr-space-5);   /* 24px */
}
```

---

## Border Radius

```css
/* src/styles/tokens/radii.css */

:root {
  /* ========================================
     BORDER RADIUS
     Softly rounded, never harsh
     ======================================== */

  --rr-radius-none: 0;
  --rr-radius-sm: 0.25rem;    /* 4px - small elements, chips, tags */
  --rr-radius-md: 0.5rem;     /* 8px - buttons, inputs, small cards */
  --rr-radius-lg: 0.75rem;    /* 12px - cards, modals */
  --rr-radius-xl: 1rem;       /* 16px - large cards, hero elements */
  --rr-radius-full: 9999px;   /* Pills, avatars, circular elements */
}
```

---

## Shadows

Warm charcoal-based shadows from BRAND-ASSETS.md:

```css
/* src/styles/tokens/shadows.css */

:root {
  /* ========================================
     SHADOWS
     Warm, soft shadows using charcoal base
     ======================================== */

  --rr-shadow-none: none;
  --rr-shadow-sm: 0 1px 2px rgba(44, 44, 44, 0.05);       /* Subtle lift, inputs */
  --rr-shadow-md: 0 4px 12px rgba(44, 44, 44, 0.08);      /* Cards, dropdowns */
  --rr-shadow-lg: 0 8px 24px rgba(44, 44, 44, 0.12);      /* Modals, popovers */
  --rr-shadow-xl: 0 16px 48px rgba(44, 44, 44, 0.16);     /* Hero elements */

  /* Inset shadow for pressed states */
  --rr-shadow-inner: inset 0 2px 4px rgba(44, 44, 44, 0.05);

  /* Focus glow */
  --rr-shadow-focus: 0 0 0 3px var(--rr-color-focus-ring-alpha);
}
```

---

## Z-Index Scale

```css
/* src/styles/tokens/z-index.css */

:root {
  /* ========================================
     Z-INDEX SCALE
     Organized by layer type
     ======================================== */

  --rr-z-negative: -1;      /* Behind content */
  --rr-z-base: 0;           /* Default layer */
  --rr-z-raised: 10;        /* Slightly elevated elements */
  --rr-z-dropdown: 100;     /* Dropdowns, select menus */
  --rr-z-sticky: 200;       /* Sticky headers, sticky footer */
  --rr-z-overlay: 300;      /* Modal backdrops */
  --rr-z-modal: 400;        /* Modal content */
  --rr-z-popover: 500;      /* Popovers, tooltips */
  --rr-z-toast: 600;        /* Toast notifications */
  --rr-z-max: 999;          /* Maximum (use sparingly) */
}
```

---

## Transitions & Animation

```css
/* src/styles/tokens/animations.css */

:root {
  /* ========================================
     ANIMATION DURATIONS
     ======================================== */

  --rr-duration-instant: 0ms;       /* No animation */
  --rr-duration-fast: 100ms;        /* Micro-interactions (hover, focus) */
  --rr-duration-normal: 150ms;      /* Standard transitions */
  --rr-duration-slow: 200ms;        /* Emphasis, reveals */
  --rr-duration-slower: 300ms;      /* Complex animations */

  /* ========================================
     EASINGS
     ======================================== */

  --rr-ease-linear: linear;
  --rr-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --rr-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --rr-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* ========================================
     COMPOSED TRANSITIONS
     ======================================== */

  --rr-transition-fast: var(--rr-duration-fast) var(--rr-ease-out);
  --rr-transition-normal: var(--rr-duration-normal) var(--rr-ease-out);
  --rr-transition-slow: var(--rr-duration-slow) var(--rr-ease-in-out);

  /* Property-specific transitions */
  --rr-transition-colors: color var(--rr-transition-fast),
                          background-color var(--rr-transition-fast),
                          border-color var(--rr-transition-fast);
  --rr-transition-opacity: opacity var(--rr-transition-normal);
  --rr-transition-transform: transform var(--rr-transition-normal);
  --rr-transition-shadow: box-shadow var(--rr-transition-normal);
  --rr-transition-all: all var(--rr-transition-normal);
}

/* ========================================
   REDUCED MOTION
   Respect user preferences
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  :root {
    --rr-duration-instant: 0ms;
    --rr-duration-fast: 0ms;
    --rr-duration-normal: 0ms;
    --rr-duration-slow: 0ms;
    --rr-duration-slower: 0ms;
  }
}
```

---

## Breakpoints

Mobile-first responsive approach from 05-ui-ux-design.md:

```css
/* src/styles/tokens/breakpoints.css */

/*
 * BREAKPOINTS
 * Mobile-first: styles apply to all, then override at breakpoints
 *
 * These cannot be CSS custom properties (media queries don't support them).
 * Documented here for reference; use directly in media queries.
 *
 * --rr-breakpoint-sm: 320px   (minimum supported width)
 * --rr-breakpoint-md: 768px   (tablets)
 * --rr-breakpoint-lg: 1024px  (laptops, small desktops)
 *
 * Usage in CSS Modules:
 *
 * .component {
 *   // Mobile styles (default)
 * }
 *
 * @media (min-width: 768px) {
 *   .component {
 *     // Tablet+ styles
 *   }
 * }
 *
 * @media (min-width: 1024px) {
 *   .component {
 *     // Desktop+ styles
 *   }
 * }
 */

/* Container max-widths for reference */
:root {
  --rr-container-sm: 480px;    /* Forms, narrow content */
  --rr-container-md: 720px;    /* Quote flow main content */
  --rr-container-lg: 1024px;   /* Comparison tables, portal */
  --rr-container-xl: 1200px;   /* Full-width layouts */
}
```

**Breakpoint Constants for JavaScript:**

```typescript
// src/lib/constants/breakpoints.ts
export const BREAKPOINTS = {
  sm: 320,
  md: 768,
  lg: 1024,
} as const;

export const MEDIA_QUERIES = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
} as const;
```

---

## Component-Specific Tokens

Per 06-component-specs.md, component dimensions and styling:

```css
/* src/styles/tokens/components.css */

:root {
  /* ========================================
     BUTTON TOKENS
     From 06-component-specs.md
     ======================================== */

  /* Button Heights */
  --rr-button-height-sm: 36px;
  --rr-button-height-md: 44px;
  --rr-button-height-lg: 52px;

  /* Button Padding */
  --rr-button-padding-sm: var(--rr-space-3) var(--rr-space-4);   /* 12px 16px */
  --rr-button-padding-md: var(--rr-space-3) var(--rr-space-5);   /* 12px 24px */
  --rr-button-padding-lg: var(--rr-space-4) var(--rr-space-6);   /* 16px 32px */

  /* Button Min Widths */
  --rr-button-min-width-sm: 64px;
  --rr-button-min-width-md: 80px;
  --rr-button-min-width-lg: 96px;

  /* Button Font Sizes */
  --rr-button-font-size-sm: var(--rr-font-size-sm);   /* 14px */
  --rr-button-font-size-md: var(--rr-font-size-base); /* 16px */
  --rr-button-font-size-lg: var(--rr-font-size-lg);   /* 18px */

  /* ========================================
     ICON BUTTON TOKENS
     ======================================== */

  --rr-icon-button-size-sm: 32px;
  --rr-icon-button-size-md: 40px;
  --rr-icon-button-size-lg: 48px;

  --rr-icon-size-sm: 16px;
  --rr-icon-size-md: 20px;
  --rr-icon-size-lg: 24px;

  /* ========================================
     INPUT TOKENS
     ======================================== */

  --rr-input-height: 48px;
  --rr-input-padding-x: var(--rr-space-4);        /* 16px */
  --rr-input-padding-y: var(--rr-space-3);        /* 12px */
  --rr-input-padding-with-icon: 44px;             /* Left padding when icon present */
  --rr-input-font-size: var(--rr-font-size-base); /* 16px - prevents iOS zoom */
  --rr-input-border-width: 1px;
  --rr-input-border-radius: var(--rr-radius-md);  /* 8px */

  /* ========================================
     CHECKBOX TOKENS
     ======================================== */

  --rr-checkbox-size: 20px;
  --rr-checkbox-border-radius: var(--rr-radius-sm);

  /* ========================================
     RADIO CARD TOKENS
     ======================================== */

  --rr-radio-card-min-height: 56px;
  --rr-radio-card-padding: var(--rr-space-4);     /* 16px */
  --rr-radio-card-gap: var(--rr-space-3);         /* 12px between cards */
  --rr-radio-card-border-width: 1px;
  --rr-radio-card-border-width-selected: 2px;

  /* ========================================
     CARD TOKENS
     ======================================== */

  --rr-card-padding-sm: var(--rr-space-4);        /* 16px */
  --rr-card-padding-md: var(--rr-space-5);        /* 24px */
  --rr-card-padding-lg: var(--rr-space-6);        /* 32px */
  --rr-card-border-radius: var(--rr-radius-lg);   /* 12px */
  --rr-card-border-width: 1px;

  /* ========================================
     HEADER TOKENS
     ======================================== */

  --rr-header-height-mobile: 56px;
  --rr-header-height-desktop: 64px;

  /* ========================================
     FOOTER TOKENS
     ======================================== */

  --rr-footer-padding-full: var(--rr-space-5);    /* 24px */
  --rr-footer-padding-minimal: var(--rr-space-4); /* 16px */

  /* ========================================
     NAVIGATION TOKENS
     ======================================== */

  /* Bottom Tab Bar (mobile portal) */
  --rr-bottom-tab-height: 64px;                   /* Plus safe-area-inset-bottom */
  --rr-bottom-tab-icon-size: 24px;
  --rr-bottom-tab-label-size: var(--rr-font-size-xs);  /* 12px */

  /* Side Nav (desktop portal) */
  --rr-sidenav-width-expanded: 240px;
  --rr-sidenav-width-collapsed: 64px;
  --rr-sidenav-item-height: 48px;

  /* Progress Indicator */
  --rr-progress-dot-size: 8px;
  --rr-progress-dot-size-current: 12px;
  --rr-progress-gap: var(--rr-space-2);           /* 8px */

  /* ========================================
     STICKY FOOTER TOKENS
     ======================================== */

  --rr-sticky-footer-padding: var(--rr-space-4);  /* 16px */

  /* ========================================
     MODAL TOKENS
     ======================================== */

  --rr-modal-width-sm: 400px;
  --rr-modal-width-md: 560px;
  --rr-modal-width-lg: 720px;
  --rr-modal-padding: var(--rr-space-5);          /* 24px */
  --rr-modal-border-radius: var(--rr-radius-lg);  /* 12px */
  --rr-modal-backdrop-opacity: 0.5;

  /* ========================================
     TOAST TOKENS
     ======================================== */

  --rr-toast-width: 320px;
  --rr-toast-border-left-width: 4px;
  --rr-toast-border-radius: var(--rr-radius-md);  /* 8px */
  --rr-toast-gap: var(--rr-space-2);              /* 8px between stacked toasts */

  /* ========================================
     CONTAINER TOKENS
     ======================================== */

  --rr-container-padding-mobile: var(--rr-space-4);   /* 16px */
  --rr-container-padding-desktop: var(--rr-space-5);  /* 24px */

  /* ========================================
     SECTION TOKENS
     ======================================== */

  --rr-section-spacing-sm: var(--rr-space-5);     /* 24px */
  --rr-section-spacing-md: var(--rr-space-7);     /* 48px */
  --rr-section-spacing-lg: var(--rr-space-9);     /* 96px */

  /* ========================================
     CALENDAR/DATEPICKER TOKENS
     ======================================== */

  --rr-calendar-cell-size-mobile: 40px;
  --rr-calendar-cell-size-desktop: 36px;

  /* ========================================
     TIMELINE TOKENS
     ======================================== */

  --rr-timeline-node-size: 24px;
  --rr-timeline-connector-width: 2px;

  /* ========================================
     FOCUS RING
     ======================================== */

  --rr-focus-ring-width: 2px;
  --rr-focus-ring-offset: 2px;
  --rr-focus-ring-color: var(--rr-color-sandstone);

  /* ========================================
     TOUCH TARGET
     WCAG 2.1 minimum
     ======================================== */

  --rr-touch-target-min: 44px;
}
```

---

## Token Usage Guidelines

### Selection Rules

| Element | Token |
|---------|-------|
| Page background | `--rr-color-bg-primary` |
| Card background | `--rr-color-bg-secondary` |
| Hover state background | `--rr-color-surface-hover` |
| Primary text | `--rr-color-text-primary` |
| Secondary/body text | `--rr-color-text-secondary` |
| Placeholder text | `--rr-color-text-tertiary` |
| Primary button bg | `--rr-color-brand-primary` |
| Primary button hover | `--rr-color-brand-primary-hover` |
| Default border | `--rr-color-border-default` |
| Focus ring | `--rr-color-focus-ring` |
| Error text/border | `--rr-color-status-error` |
| Success indicator | `--rr-color-status-success` |

### Focus State Pattern

All interactive elements must use this focus pattern (per BRAND-ASSETS.md):

```css
.interactive-element:focus-visible {
  outline: var(--rr-focus-ring-width) solid var(--rr-focus-ring-color);
  outline-offset: var(--rr-focus-ring-offset);
}
```

For inputs with focus glow:

```css
.input:focus {
  border-color: var(--rr-color-border-focus);
  box-shadow: var(--rr-shadow-focus);
}
```

### Anti-Patterns

**Avoid:**
- Hard-coded color values (`#FF0000`) - use tokens
- Hard-coded pixel values for spacing - use token scale
- Inconsistent font sizes - stick to the scale
- Magic numbers for z-index - use token scale
- Custom transitions per component - use token compositions
- Using primitive tokens directly in components - use semantic tokens

**Correct:**
```css
/* Good - uses semantic tokens */
.card {
  background: var(--rr-color-bg-secondary);
  border: var(--rr-card-border-width) solid var(--rr-color-border-default);
  border-radius: var(--rr-card-border-radius);
  padding: var(--rr-card-padding-md);
}
```

**Incorrect:**
```css
/* Bad - hard-coded values */
.card {
  background: #FFFFFF;
  border: 1px solid #E8E0D4;
  border-radius: 12px;
  padding: 24px;
}
```

---

## Implementation Reference

### CSS Module Usage

```css
/* Button.module.css */
.button {
  height: var(--rr-button-height-md);
  padding: var(--rr-button-padding-md);
  font-size: var(--rr-button-font-size-md);
  font-weight: var(--rr-font-weight-medium);
  border-radius: var(--rr-radius-md);
  transition: var(--rr-transition-colors), var(--rr-transition-transform);
}

.primary {
  background-color: var(--rr-color-brand-primary);
  color: var(--rr-color-text-inverse);
}

.primary:hover {
  background-color: var(--rr-color-brand-primary-hover);
}

.primary:focus-visible {
  outline: var(--rr-focus-ring-width) solid var(--rr-focus-ring-color);
  outline-offset: var(--rr-focus-ring-offset);
}

.primary:active {
  transform: scale(0.95);
}

.sm {
  height: var(--rr-button-height-sm);
  padding: var(--rr-button-padding-sm);
  font-size: var(--rr-button-font-size-sm);
}

.lg {
  height: var(--rr-button-height-lg);
  padding: var(--rr-button-padding-lg);
  font-size: var(--rr-button-font-size-lg);
}
```

### Global Styles Import

```css
/* src/styles/globals.css */
@import './tokens/index.css';
@import './base/reset.css';
@import './base/typography.css';
```

### TypeScript Token Access

For cases where tokens are needed in JavaScript:

```typescript
// src/lib/constants/tokens.ts
// Mirror of CSS tokens for JS usage (animations, calculations)

export const TOKENS = {
  duration: {
    fast: 100,
    normal: 150,
    slow: 200,
  },
  breakpoint: {
    sm: 320,
    md: 768,
    lg: 1024,
  },
} as const;
```

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [BRAND-ASSETS.md](./BRAND-ASSETS.md) | Brand definitions these tokens implement |
| [05-ui-ux-design.md](./05-ui-ux-design.md) | Visual designs using these tokens |
| [06-component-specs.md](./06-component-specs.md) | Component dimensions and styling |
| [13-accessibility.md](./13-accessibility.md) | Contrast requirements, focus states |
| [15-file-architecture.md](./15-file-architecture.md) | Token file locations |
| [17-code-patterns.md](./17-code-patterns.md) | Implementation patterns for tokens |

---

## Quality Checklist

Before marking this document complete:

- [x] All primitive color scales defined
- [x] Semantic color mapping for light theme
- [x] Typography scale with all text styles
- [x] Spacing scale documented
- [x] Border radius scale documented
- [x] Shadow scale documented
- [x] Z-index scale documented
- [x] Animation/transition tokens documented
- [x] Breakpoints documented
- [x] Component-specific tokens (buttons, inputs, cards, navigation)
- [x] Reduced motion handling included
- [x] Focus state patterns documented
- [x] Token usage guidelines provided
- [x] Anti-patterns documented
- [x] Implementation examples included
- [x] Related Documents links are bidirectional

**Status: COMPLETE** - Ready for 17-code-patterns.md convergence
