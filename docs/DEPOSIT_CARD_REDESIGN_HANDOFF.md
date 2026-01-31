# Deposit Card Redesign Handoff

## Overview

Redesign the deposit authorization card from a two-column layout to a single-column, mobile-first card with precise typographical hierarchy and spacing. The goal is a clean, conversion-optimized checkout experience following modern UI patterns from Stripe, Apple, and Baymard Institute research.

## Current State

- **Location**: `src/components/features/checkout/DepositAuthCard/`
- **Files**: `DepositAuthCard.tsx`, `DepositAuthCard.module.css`
- **Current layout**: Two-column grid (Order Summary left, Authorization Form right)
- **Problem**: Unnecessarily complex for the content; left column is now minimal

## Design Research Summary

Key findings from checkout UI research (2025-2026):

1. **Single-column layouts outperform multi-column** — reduce errors, boost completion (Baymard Institute)
2. **Pricing visible at all times** — 74% of top sites show total throughout checkout
3. **Pricing directly above CTA** — Apple pattern: "what you pay" immediately before action button
4. **Mobile-first, not mobile-adapted** — design for linear, focused flow first
5. **Minimize cognitive load** — group related info, clear visual hierarchy

## Target Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [✨ icon]  ESSENTIAL TIER              [Edit →]    │  ← Header row
│                                                     │
│  📍 123 Main Street, Houston, TX 77001              │  ← Address
│  📅 Tue, Feb 3 @ 8 AM                               │  ← Date
│                                                     │
├─────────────────────────────────────────────────────┤  ← Subtle divider
│                                                     │
│  Your Signature *                                   │  ← Label
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │  ← Signature pad (100px)
│  │            Sign here                          │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Your Email *                                       │  ← Label
│  ┌───────────────────────────────────────────────┐  │
│  │  your@email.com                               │  │  ← Input
│  └───────────────────────────────────────────────┘  │
│  We'll send your contract and receipt here          │  ← Help text
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ ☑  Terms & Agreement                     [▼]  │  │  ← Collapsible
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │    What Happens Next                     [▼]  │  │  ← Collapsible
│  └───────────────────────────────────────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤  ← Divider before pricing
│                                                     │
│           $15,400 total                             │  ← Total (large, bold)
│     $500 deposit today · fully refundable           │  ← Deposit (medium, green accent)
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  🔒  SECURE MY SPOT — $500                    │  │  ← Primary CTA
│  └───────────────────────────────────────────────┘  │
│                                                     │
│     🔒 Secure   📅 3-Day Refund   ⭐ 4.9 Rating     │  ← Trust badges (small)
│                                                     │
│          Not ready? Save this quote →               │  ← Secondary action
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Typography Hierarchy

Use the existing design system variables. Define clear hierarchy:

| Element | Size | Weight | Color | Letter-spacing |
|---------|------|--------|-------|----------------|
| Tier title | 1.125rem (18px) | 700 | text-primary | 0.04em (uppercase) |
| Address/Date | 0.875rem (14px) | 400 | text-secondary | normal |
| Form labels | 0.875rem (14px) | 500 | text-primary | normal |
| Help text | 0.75rem (12px) | 400 | text-tertiary | normal |
| Total price | 1.5rem (24px) | 700 | text-primary | normal |
| Deposit amount | 1rem (16px) | 600 | success-dark (#166534) | normal |
| CTA button | 1.0625rem (17px) | 600 | white | normal |
| Trust badges | 0.75rem (12px) | 500 | success-dark | normal |
| Secondary link | 0.8125rem (13px) | 500 | text-tertiary | normal |

## Spacing System

Use consistent spacing based on the design system (`--rr-space-*` tokens):

| Token | Value | Usage |
|-------|-------|-------|
| `--rr-space-2` | 8px | Tight gaps (icon to text, trust badge gaps) |
| `--rr-space-3` | 12px | Inner padding, small section gaps |
| `--rr-space-4` | 16px | Between form fields, section padding |
| `--rr-space-5` | 20px | Card padding (mobile) |
| `--rr-space-6` | 24px | Card padding (desktop), major section gaps |

### Specific Spacing Rules

```
Card padding: 20px (mobile) / 24px (desktop)

Header section:
  - Icon to title gap: 12px
  - Title row to address: 12px
  - Address to date: 8px
  - Date to divider: 16px

Form section:
  - Divider to first label: 16px
  - Label to input: 6px
  - Input to help text: 4px
  - Help text to next label: 16px
  - Between collapsible sections: 8px

Pricing section:
  - Divider padding: 16px top/bottom
  - Total to deposit: 4px
  - Deposit to CTA divider: 16px

CTA section:
  - CTA button height: 52px
  - CTA to trust badges: 12px
  - Trust badges to secondary link: 12px
  - Secondary link to card bottom: 4px
```

## Implementation Steps

### Step 1: Restructure TSX Component

1. Remove two-column grid structure
2. Remove `orderSummary` div entirely
3. Consolidate into single `card` div with sections:
   - Header section (tier, address, date, edit link)
   - Form section (signature, email, terms, timeline)
   - Pricing section (total, deposit)
   - Action section (CTA, trust, secondary link)

### Step 2: Update Component Structure

```tsx
<div className={styles.card}>
  {/* Header */}
  <header className={styles.header}>
    <div className={styles.headerTop}>
      <div className={styles.tierBadge}>
        <Sparkles size={18} />
        <h2 className={styles.tierTitle}>{tierDisplayName} Tier</h2>
      </div>
      <Link href={editUrl} className={styles.editLink}>
        Edit <ExternalLink size={12} />
      </Link>
    </div>
    <div className={styles.headerDetails}>
      <div className={styles.detailRow}>
        <Home size={14} />
        <span>{address}</span>
      </div>
      <div className={styles.detailRow}>
        <Calendar size={14} />
        <span>{formattedDate}</span>
      </div>
    </div>
  </header>

  <div className={styles.divider} />

  {/* Form Section */}
  <section className={styles.formSection}>
    {/* Signature */}
    {/* Email */}
    {/* Terms (collapsible) */}
    {/* Timeline (collapsible) */}
  </section>

  <div className={styles.divider} />

  {/* Pricing Summary */}
  <section className={styles.pricingSummary}>
    <div className={styles.totalPrice}>${totalPrice.toLocaleString()} total</div>
    <div className={styles.depositPrice}>
      ${depositAmount} deposit today · <span>fully refundable</span>
    </div>
  </section>

  {/* Action Section */}
  <section className={styles.actionSection}>
    {/* Error display if any */}
    {/* CTA Button */}
    {/* Trust badges */}
    {/* Secondary link */}
  </section>
</div>
```

### Step 3: Rewrite CSS Module

Key CSS changes:

```css
.card {
  width: 100%;
  max-width: 480px;  /* Narrower for single column */
  margin: 0 auto;
  background: var(--rr-color-white);
  border: 1px solid var(--rr-color-border-default);
  border-radius: var(--rr-radius-lg);
  overflow: hidden;
}

/* Remove all grid-template-columns rules */
/* Remove .orderSummary styles */
/* Remove .authorizationForm - rename to .formSection */

.header {
  padding: var(--rr-space-5);
  padding-bottom: 0;
}

.divider {
  height: 1px;
  background: var(--rr-color-border-default);
  margin: var(--rr-space-4) var(--rr-space-5);
}

.pricingSummary {
  text-align: center;
  padding: var(--rr-space-4) var(--rr-space-5);
}

.totalPrice {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--rr-color-text-primary);
}

.depositPrice {
  font-size: 1rem;
  font-weight: 600;
  color: var(--rr-color-success-dark, #166534);
  margin-top: 4px;
}
```

### Step 4: Refine Responsive Behavior

```css
/* Mobile (default) */
.card {
  max-width: 100%;
  border-radius: 0;
  border-left: none;
  border-right: none;
}

/* Tablet and up */
@media (min-width: 480px) {
  .card {
    max-width: 480px;
    border-radius: var(--rr-radius-lg);
    border: 1px solid var(--rr-color-border-default);
  }
}

/* Desktop - slightly wider */
@media (min-width: 768px) {
  .card {
    max-width: 520px;
  }
}
```

### Step 5: Polish Typography

Ensure all text elements have precise sizing:

```css
.tierTitle {
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--rr-color-text-primary);
  margin: 0;
}

.detailRow {
  display: flex;
  align-items: flex-start;
  gap: var(--rr-space-2);
  font-size: 0.875rem;
  color: var(--rr-color-text-secondary);
}

.detailRow svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--rr-color-text-tertiary);
}
```

## Files to Modify

1. **`src/components/features/checkout/DepositAuthCard/DepositAuthCard.tsx`**
   - Remove two-column structure
   - Add pricing summary section
   - Reorganize into header/form/pricing/action sections

2. **`src/components/features/checkout/DepositAuthCard/DepositAuthCard.module.css`**
   - Complete rewrite for single-column
   - Remove grid layout
   - Add precise spacing tokens
   - Add typography classes

3. **`src/app/quote/[id]/deposit/page.module.css`** (optional)
   - May need to adjust container max-width since card is now narrower

## Verification Checklist

After implementation, verify:

- [ ] Card displays correctly on mobile (375px width)
- [ ] Card displays correctly on tablet (768px width)
- [ ] Card displays correctly on desktop (1200px width)
- [ ] Tier title is uppercase with icon aligned
- [ ] Edit link is right-aligned in header row
- [ ] Address and date have consistent icon alignment
- [ ] Signature pad is 100px height
- [ ] Email input has proper focus states
- [ ] Terms & Agreement expands/collapses correctly
- [ ] What Happens Next expands/collapses correctly
- [ ] Pricing section is centered with proper hierarchy
- [ ] Total is larger/bolder than deposit
- [ ] Deposit text includes "fully refundable" in green
- [ ] CTA button has proper height (52px) and styling
- [ ] Trust badges are evenly spaced
- [ ] Secondary link is subtle but accessible
- [ ] All spacing follows the defined system
- [ ] No horizontal scrolling on any viewport
- [ ] TypeScript compiles without errors
- [ ] All tests pass

## Design System Reference

The project uses CSS custom properties defined in the design system:

```css
/* Colors */
--rr-color-white
--rr-color-text-primary
--rr-color-text-secondary
--rr-color-text-tertiary
--rr-color-border-default
--rr-color-success (#22C55E)
--rr-color-success-dark (#166534)
--rr-color-blue
--rr-color-gray-50
--rr-color-gray-100

/* Spacing */
--rr-space-1 (4px)
--rr-space-2 (8px)
--rr-space-3 (12px)
--rr-space-4 (16px)
--rr-space-5 (20px)
--rr-space-6 (24px)

/* Radius */
--rr-radius-sm
--rr-radius-md
--rr-radius-lg
--rr-radius-full

/* Focus */
--rr-focus-ring-width
--rr-focus-ring-color
```

## Context Files to Read First

Before implementing, read these files to understand current state:

1. `src/components/features/checkout/DepositAuthCard/DepositAuthCard.tsx`
2. `src/components/features/checkout/DepositAuthCard/DepositAuthCard.module.css`
3. `src/components/ui/SignaturePad/SignaturePad.tsx`
4. `src/components/ui/SignaturePad/SignaturePad.module.css`
5. `src/app/quote/[id]/deposit/page.tsx`

## Success Criteria

The redesigned card should:

1. **Feel premium** — clean, spacious, professional
2. **Guide the eye** — clear visual flow from top to bottom
3. **Build confidence** — pricing transparency, trust signals visible
4. **Convert** — minimal friction, clear CTA
5. **Work everywhere** — responsive without breaking

---

*Last updated: 2026-01-31*
*Created by: Claude Code session for Results Roofing deposit page redesign*
