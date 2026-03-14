# Ops Dashboard — Design Specification

> The canonical design reference for the ops dashboard rebuild.
> Every token, color, size, and spacing decision lives here. No ambiguity.

**Design North Star:** Rauno Freiberg (Vercel) — restraint, precision, craft.
**Aesthetic:** Matte, tactile, considered. Clean data density without feeling clinical.
**Codebase reality:** The project has 3-4 competing token systems. This spec resolves all conflicts. The ops dashboard uses ONE system.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing](#4-spacing)
5. [Layout & Grid](#5-layout--grid)
6. [Border Radius](#6-border-radius)
7. [Shadows & Elevation](#7-shadows--elevation)
8. [Motion & Animation](#8-motion--animation)
9. [Interactive Elements](#9-interactive-elements)
10. [Status System](#10-status-system)
11. [Data Display](#11-data-display)
12. [Iconography](#12-iconography)
13. [Component Specs](#13-component-specs)
14. [Z-Index](#14-z-index)
15. [Accessibility](#15-accessibility)
16. [Implementation Notes](#16-implementation-notes)

---

## 1. Brand Identity

| Attribute | Value |
|-----------|-------|
| **Company** | Results Roofing |
| **Brand voice** | Professional, direct, trustworthy. No fluff. |
| **Logo placement** | Top-left sidebar, 32px height max |
| **Favicon** | Blue shield/roof mark on transparent |

**Brand pillars that inform ops UI:**
- **Speed** — fast load, fast actions, no unnecessary steps
- **Trust** — clean data presentation, clear status at all times
- **Precision** — exact numbers, tabular-nums, no ambiguous states

---

## 2. Color System

### Prefix Convention
All ops tokens use `--ops-` prefix. No `--rr-`, no `--admin-`, no raw shadcn HSL.

### Primitives

#### Blue Scale (Brand Primary)
```css
--ops-blue-50:  #EBF2FF;
--ops-blue-100: #D6E4FF;
--ops-blue-200: #ADC9FF;
--ops-blue-300: #85ADFF;
--ops-blue-400: #4D8CFF;  /* highlight */
--ops-blue-500: #1E6CFF;  /* brand primary */
--ops-blue-600: #1554CC;  /* shadow/hover */
--ops-blue-700: #0D3D99;
--ops-blue-800: #082966;
--ops-blue-900: #041433;
```

#### Charcoal Scale (Neutrals)
```css
--ops-gray-25:  #FAFBFC;
--ops-gray-50:  #F7F9FC;  /* page bg — "soft white" */
--ops-gray-100: #EEF1F6;
--ops-gray-150: #E4E8EF;
--ops-gray-200: #D5DAE3;
--ops-gray-300: #B0B8C7;
--ops-gray-400: #8A95A8;
--ops-gray-500: #6B7789;
--ops-gray-600: #4E5868;
--ops-gray-700: #353D4A;
--ops-gray-800: #2A3038;  /* charcoal highlight */
--ops-gray-900: #1E2329;  /* charcoal — primary text */
--ops-gray-950: #14181D;  /* charcoal shadow — darkest */
```

#### White
```css
--ops-white: #FFFFFF;
```

### Semantic Tokens (Light Mode)

These are the ONLY colors referenced in components. Never use primitives directly.

#### Backgrounds
```css
--ops-bg-page:       var(--ops-gray-50);      /* #F7F9FC — page canvas */
--ops-bg-surface:    var(--ops-white);         /* #FFFFFF — cards, panels, modals */
--ops-bg-raised:     var(--ops-white);         /* #FFFFFF — elevated cards */
--ops-bg-inset:      var(--ops-gray-100);      /* #EEF1F6 — input fields, code blocks */
--ops-bg-sidebar:    var(--ops-white);         /* #FFFFFF — nav sidebar */
--ops-bg-hover:      var(--ops-gray-100);      /* #EEF1F6 — row/item hover */
--ops-bg-active:     var(--ops-blue-50);       /* #EBF2FF — selected/active item */
--ops-bg-overlay:    rgba(30, 35, 41, 0.5);   /* modal/drawer backdrop */
```

#### Text
```css
--ops-text-primary:    var(--ops-gray-900);    /* #1E2329 — headings, primary content */
--ops-text-secondary:  var(--ops-gray-600);    /* #4E5868 — body text, descriptions */
--ops-text-tertiary:   var(--ops-gray-400);    /* #8A95A8 — placeholders, metadata */
--ops-text-disabled:   var(--ops-gray-300);    /* #B0B8C7 — disabled state */
--ops-text-inverse:    var(--ops-white);       /* #FFFFFF — on dark/accent bg */
--ops-text-link:       var(--ops-blue-500);    /* #1E6CFF — links */
--ops-text-link-hover: var(--ops-blue-600);    /* #1554CC — link hover */
```

#### Borders
```css
--ops-border-default:  var(--ops-gray-200);    /* #D5DAE3 — card/section borders */
--ops-border-subtle:   var(--ops-gray-150);    /* #E4E8EF — dividers, table rows */
--ops-border-strong:   var(--ops-gray-300);    /* #B0B8C7 — input borders */
--ops-border-focus:    var(--ops-blue-500);    /* #1E6CFF — focus rings */
```

#### Accent (Interactive)
```css
--ops-accent:          var(--ops-blue-500);    /* #1E6CFF — primary buttons, links, active */
--ops-accent-hover:    var(--ops-blue-600);    /* #1554CC — hover */
--ops-accent-active:   var(--ops-blue-700);    /* #0D3D99 — pressed */
--ops-accent-subtle:   var(--ops-blue-50);     /* #EBF2FF — light accent bg */
--ops-accent-muted:    var(--ops-blue-100);    /* #D6E4FF — badge/tag bg */
```

### Dark Mode (Future — define now, implement later)

```css
[data-theme="dark"] {
  --ops-bg-page:       #0F1117;
  --ops-bg-surface:    #1A1D24;
  --ops-bg-raised:     #22262E;
  --ops-bg-inset:      #14171D;
  --ops-bg-sidebar:    #14171D;
  --ops-bg-hover:      #22262E;
  --ops-bg-active:     rgba(30, 108, 255, 0.15);
  --ops-bg-overlay:    rgba(0, 0, 0, 0.6);

  --ops-text-primary:    rgba(255, 255, 255, 0.90);
  --ops-text-secondary:  rgba(255, 255, 255, 0.65);
  --ops-text-tertiary:   rgba(255, 255, 255, 0.40);
  --ops-text-disabled:   rgba(255, 255, 255, 0.20);
  --ops-text-inverse:    #1E2329;

  --ops-border-default:  rgba(255, 255, 255, 0.10);
  --ops-border-subtle:   rgba(255, 255, 255, 0.06);
  --ops-border-strong:   rgba(255, 255, 255, 0.16);
}
```

---

## 3. Typography

### Font Stack

**Loaded via `next/font` — no Google Fonts CDN, no hoping it's installed.**

| Role | Font | Fallback Stack | Weight Range |
|------|------|---------------|-------------|
| **Headlines** | Sora | Inter, system-ui, sans-serif | 600, 700 |
| **Body / UI** | Inter | -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif | 400, 500, 600 |
| **Mono / Data** | JetBrains Mono | SF Mono, Fira Code, Consolas, monospace | 400, 500 |

### Type Scale

All sizes are rem-based. `1rem = 16px`.

| Token | Size | Line Height | Weight | Font | Letter Spacing | Use |
|-------|------|-------------|--------|------|---------------|-----|
| `--ops-text-display` | clamp(2rem, 4vw, 3rem) | 1.1 | 700 | Sora | -0.03em | Hero/splash (rare in ops) |
| `--ops-text-h1` | clamp(1.5rem, 3vw, 2rem) | 1.15 | 700 | Sora | -0.02em | Page titles ("Jobs", "Payments") |
| `--ops-text-h2` | clamp(1.25rem, 2.5vw, 1.5rem) | 1.2 | 600 | Sora | -0.01em | Section headings |
| `--ops-text-h3` | 1.125rem (18px) | 1.3 | 600 | Inter | 0 | Card titles, subsections |
| `--ops-text-h4` | 1rem (16px) | 1.4 | 600 | Inter | 0 | Small section heads |
| `--ops-text-body-lg` | 1rem (16px) | 1.6 | 400 | Inter | 0 | Lead paragraphs |
| `--ops-text-body` | 0.875rem (14px) | 1.5 | 400 | Inter | 0 | **Default UI text** |
| `--ops-text-body-sm` | 0.8125rem (13px) | 1.5 | 400 | Inter | 0 | Secondary/supporting |
| `--ops-text-caption` | 0.75rem (12px) | 1.4 | 500 | Inter | 0.01em | Timestamps, metadata |
| `--ops-text-overline` | 0.6875rem (11px) | 1.3 | 600 | Inter | 0.06em | Category labels, ALL CAPS |
| `--ops-text-metric` | 1.75rem (28px) | 1.1 | 700 | Sora | -0.02em | KPI numbers, big stats |
| `--ops-text-metric-sm` | 1.25rem (20px) | 1.2 | 600 | Inter | -0.01em | Secondary metrics |
| `--ops-text-mono` | 0.8125rem (13px) | 1.5 | 400 | JetBrains Mono | 0 | IDs, codes, technical |

### Typography Rules

1. **Default body is 14px, not 16px.** Ops dashboards are data-dense. 16px wastes space. All table cells, form labels, descriptions, sidebar items = 14px.
2. **Page titles are the only Sora element most users see.** Don't overuse Sora — it's the headline font, not the everything font.
3. **`font-variant-numeric: tabular-nums`** on ALL numeric content — prices, counts, dates, IDs. Non-negotiable.
4. **`text-wrap: balance`** on all headings.
5. **`max-width: 65ch`** on any paragraph/description text.
6. **Never change font-weight on hover.** Causes layout shift.
7. **Sentence case everywhere.** No Title Case in UI elements except brand names.
8. **Clamp() for h1/h2 only.** h3 and below are fixed — they live inside cards/panels where viewport scaling is irrelevant.

---

## 4. Spacing

### Base Unit: 4px

All spacing is a multiple of 4px. No exceptions.

| Token | Value | px | Use |
|-------|-------|-----|-----|
| `--ops-space-0` | 0 | 0 | Reset |
| `--ops-space-0.5` | 0.125rem | 2 | Micro-adjustments only |
| `--ops-space-1` | 0.25rem | 4 | Inline icon gaps, tight pairs |
| `--ops-space-1.5` | 0.375rem | 6 | Small badge padding |
| `--ops-space-2` | 0.5rem | 8 | Related element gaps, button icon gap |
| `--ops-space-3` | 0.75rem | 12 | Compact card padding, input padding |
| `--ops-space-4` | 1rem | 16 | Default padding, standard gap |
| `--ops-space-5` | 1.25rem | 20 | Component internal padding |
| `--ops-space-6` | 1.5rem | 24 | Card padding, section gaps |
| `--ops-space-8` | 2rem | 32 | Between related sections |
| `--ops-space-10` | 2.5rem | 40 | Major section breaks |
| `--ops-space-12` | 3rem | 48 | Page section padding |
| `--ops-space-16` | 4rem | 64 | Large separations |
| `--ops-space-20` | 5rem | 80 | Page-level rhythm |

### Semantic Spacing

```css
--ops-spacing-page-x:       var(--ops-space-6);    /* 24px — main content horizontal padding */
--ops-spacing-page-y:       var(--ops-space-6);    /* 24px — main content vertical padding */
--ops-spacing-section-gap:  var(--ops-space-6);    /* 24px — between dashboard sections */
--ops-spacing-card-padding: var(--ops-space-5);    /* 20px — inside cards */
--ops-spacing-card-gap:     var(--ops-space-4);    /* 16px — between cards in a grid */
--ops-spacing-table-cell-x: var(--ops-space-4);    /* 16px — table cell horizontal */
--ops-spacing-table-cell-y: var(--ops-space-3);    /* 12px — table cell vertical */
--ops-spacing-sidebar-x:    var(--ops-space-3);    /* 12px — sidebar item horizontal */
--ops-spacing-sidebar-y:    var(--ops-space-1.5);  /* 6px — sidebar item vertical */
--ops-spacing-input-x:      var(--ops-space-3);    /* 12px — input horizontal padding */
--ops-spacing-input-y:      var(--ops-space-2);    /* 8px — input vertical padding */
--ops-spacing-form-gap:     var(--ops-space-5);    /* 20px — between form fields */
```

### Spacing Rules

1. **Related items: LESS space. Unrelated: MORE space.** Proximity = relationship.
2. **Inner/outer ratio: at least 2:1.** Card padding (20px) must be less than gap between cards (not exactly 2:1, but inner < outer context).
3. **Use `gap` in flex/grid, not margins.** Margins are for page-level layout only.
4. **Sidebar items are tight.** 6px vertical padding, 12px horizontal. Dense but readable.
5. **Table cells: 12px vertical, 16px horizontal.** Enough breathing room without wasting vertical space.

---

## 5. Layout & Grid

### Ops Shell Structure

```
┌──────────────────────────────────────────────────┐
│ Sidebar (fixed)          │ Main Content (fluid)   │
│ 240px (expanded)         │                        │
│  64px (collapsed)        │ ┌─ Page Header ──────┐ │
│                          │ │ Title + Actions     │ │
│ ┌──────────────┐         │ └────────────────────┘ │
│ │ Logo         │         │ ┌─ Page Content ─────┐ │
│ │ Nav Items    │         │ │                    │ │
│ │ ...          │         │ │                    │ │
│ │              │         │ │                    │ │
│ │ Bottom Nav   │         │ │                    │ │
│ └──────────────┘         │ └────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Sidebar

| Property | Value |
|----------|-------|
| Width (expanded) | 240px |
| Width (collapsed) | 64px |
| Background | `--ops-bg-sidebar` |
| Border right | 1px solid `--ops-border-subtle` |
| Padding top | 16px |
| Padding horizontal | 12px |
| Nav item height | 36px |
| Nav item border-radius | 8px |
| Nav item padding | 6px 12px |
| Nav item font | 14px / 500 / Inter |
| Nav item icon size | 18px |
| Nav item gap (icon to label) | 10px |
| Nav group gap | 24px (between groups like "Manage" / "Tools") |
| Nav item gap | 2px (between items in same group) |
| Active item bg | `--ops-bg-active` |
| Active item text | `--ops-accent` |
| Hover item bg | `--ops-bg-hover` |

### Page Header

| Property | Value |
|----------|-------|
| Height | 64px |
| Padding horizontal | 24px |
| Border bottom | 1px solid `--ops-border-subtle` |
| Title font | h1 token (Sora 700) |
| Action buttons align | right |

### Content Area

| Property | Value |
|----------|-------|
| Max width | 1440px (data-dense dashboard) |
| Padding | 24px |
| Background | `--ops-bg-page` |

### Grid System

| Layout | Columns | Gap | Use |
|--------|---------|-----|-----|
| KPI cards | 4-col | 16px | Dashboard overview |
| Card grid | 3-col (lg), 2 (md), 1 (sm) | 16px | Generic card layouts |
| Form | 2-col (lg), 1 (sm) | 20px | Form fields |
| Table | Full width | 0 (border-separated) | Data tables |
| Kanban | N columns, horizontal scroll | 16px | Job board |

### Breakpoints

| Token | Width | Behavior |
|-------|-------|----------|
| `sm` | 640px | Stack to single column |
| `md` | 768px | Sidebar collapses to icons |
| `lg` | 1024px | 2-col layouts |
| `xl` | 1280px | Full layout |
| `2xl` | 1536px | Max content width applies |

### Responsive Sidebar

- `>= 1024px`: Expanded (240px), persistent
- `768px–1023px`: Collapsed (64px icons only), hover to expand
- `< 768px`: Hidden, hamburger toggle, slides over as drawer

---

## 6. Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--ops-radius-none` | 0 | Flush edges |
| `--ops-radius-sm` | 4px | Badges, tags, small chips |
| `--ops-radius-md` | 6px | Buttons, inputs, dropdowns |
| `--ops-radius-lg` | 8px | Sidebar items, table rows (hover), small cards |
| `--ops-radius-xl` | 12px | Cards, modals, panels |
| `--ops-radius-2xl` | 16px | Large cards, bottom sheets |
| `--ops-radius-full` | 9999px | Avatars, pills, circular buttons |

### Rules
- Cards always use `--ops-radius-xl` (12px)
- Buttons use `--ops-radius-md` (6px)
- Inputs use `--ops-radius-md` (6px)
- Badges/tags use `--ops-radius-sm` (4px)
- Avatars use `--ops-radius-full`
- **Nested radius rule:** Inner radius = outer radius - parent padding. A card (12px radius, 20px padding) with an inner element should use max(12 - 20, 0) = 0 or a small radius like 6px.

---

## 7. Shadows & Elevation

Matte aesthetic = subtle shadows. No heavy drop shadows.

| Token | Value | Use |
|-------|-------|-----|
| `--ops-shadow-none` | none | Flat elements |
| `--ops-shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle lift (inputs, badges) |
| `--ops-shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Cards at rest |
| `--ops-shadow-md` | `0 4px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)` | Hover elevation, dropdowns |
| `--ops-shadow-lg` | `0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)` | Modals, popovers |
| `--ops-shadow-xl` | `0 16px 48px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.04)` | Drawers, command palette |

### Ring (Focus)
```css
--ops-ring-focus: 0 0 0 2px var(--ops-bg-surface), 0 0 0 4px var(--ops-accent);
```
Double-ring pattern: white gap + accent ring. Visible on any background.

### Elevation Rules
1. **Page bg (0)** → Card (shadow-sm) → Hover card (shadow-md) → Modal (shadow-lg)
2. Cards on `--ops-bg-page` get `shadow-sm`. Cards on `--ops-bg-surface` use border only (no double-shadow).
3. **Never stack shadows.** One shadow per element.
4. Kanban cards: `shadow-xs` at rest, `shadow-md` while dragging.

---

## 8. Motion & Animation

| Token | Duration | Use |
|-------|----------|-----|
| `--ops-duration-instant` | 100ms | Color changes, opacity toggles |
| `--ops-duration-fast` | 150ms | Hover states, button press |
| `--ops-duration-normal` | 200ms | Dropdowns, tooltips, sidebar item feedback |
| `--ops-duration-smooth` | 300ms | Modals, drawers, page transitions, sidebar expand |
| `--ops-duration-slow` | 500ms | Complex layout shifts, kanban reorder |

| Token | Value | Use |
|-------|-------|-----|
| `--ops-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering (modals opening, dropdowns appearing) |
| `--ops-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting (closing, dismissing) |
| `--ops-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transform in-place (sidebar toggle, accordion) |
| `--ops-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful micro-interactions (badge count bump) |

### Composed Transitions
```css
--ops-transition-colors:   color, background-color, border-color var(--ops-duration-fast) var(--ops-ease-out);
--ops-transition-opacity:  opacity var(--ops-duration-fast) var(--ops-ease-out);
--ops-transition-transform: transform var(--ops-duration-fast) var(--ops-ease-out);
--ops-transition-shadow:   box-shadow var(--ops-duration-fast) var(--ops-ease-out);
--ops-transition-all:      all var(--ops-duration-normal) var(--ops-ease-out);
```

### Motion Rules
1. **Exit is 30% faster than enter.** Modal opens at 300ms, closes at 210ms.
2. **Only animate `transform` and `opacity`.** Exception: `background-color` and `border-color` for hover states (these are cheap).
3. **`prefers-reduced-motion: reduce`** — collapse all transitions to `0ms`, disable transforms.
4. **Kanban drag:** Ghost card at 0.85 opacity, `shadow-md`, slight scale(1.02). Drop zone highlighted with `--ops-accent-subtle` background.
5. **Page transitions:** Content area fade-in (opacity 0→1, 200ms). No sliding.
6. **Button press:** `scale(0.97)` for 100ms.
7. **Skeleton loaders, not spinners** for section-level loading. Spinner only for inline button loading.

---

## 9. Interactive Elements

### Buttons

| Variant | Background | Text | Border | Hover | Active | Use |
|---------|-----------|------|--------|-------|--------|-----|
| **Primary** | `--ops-accent` | `--ops-text-inverse` | none | `--ops-accent-hover` | `--ops-accent-active` | ONE per visible area. "Create job", "Send" |
| **Secondary** | `--ops-bg-surface` | `--ops-text-primary` | 1px `--ops-border-default` | `--ops-bg-hover` | `--ops-bg-inset` | Supporting: "Cancel", "Filter" |
| **Ghost** | transparent | `--ops-text-secondary` | none | `--ops-bg-hover` | `--ops-bg-inset` | Tertiary: icon buttons, minor actions |
| **Destructive** | `--ops-status-error` | `--ops-text-inverse` | none | darker red | darkest red | Irreversible only: "Delete job" |
| **Link** | transparent | `--ops-text-link` | none | underline + `--ops-text-link-hover` | — | Inline text actions |

| Size | Height | Padding X | Font Size | Icon Size | Use |
|------|--------|-----------|-----------|-----------|-----|
| `sm` | 32px | 12px | 13px | 16px | Table row actions, compact UI |
| `md` | 36px | 16px | 14px | 18px | **Default.** Most buttons. |
| `lg` | 44px | 20px | 15px | 20px | Page-level CTAs, mobile primary |

**Rules:**
- Minimum touch target: 44x44px (even if visual button is smaller, hit area is 44px)
- Icon-only buttons: square (32x32, 36x36, 44x44) with `aria-label`
- Button gap (icon to text): 8px
- **No gradients. No box-shadows on buttons.** Flat color only. Matte aesthetic.
- Loading state: text replaced with 18px spinner, button width preserved (no layout shift)
- Disabled: `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`

### Inputs

| Property | Value |
|----------|-------|
| Height | 36px (single-line) |
| Padding | 8px 12px |
| Font size | 14px |
| Border | 1px solid `--ops-border-strong` |
| Border radius | `--ops-radius-md` (6px) |
| Background | `--ops-bg-surface` |
| Placeholder color | `--ops-text-tertiary` |
| Focus | `--ops-ring-focus` (box-shadow ring, NOT border change) |
| Error | Border `--ops-status-error`, ring `--ops-status-error` |
| Disabled | `--ops-bg-inset` bg, `--ops-text-disabled` text |

**Input font is 16px on mobile** (prevents iOS zoom). 14px on desktop.

### Selects / Dropdowns

Same dimensions as inputs. Chevron icon 16px, right-aligned with 12px padding.
Dropdown menu: `--ops-bg-surface`, `--ops-shadow-md`, `--ops-radius-lg`, max-height 300px with scroll.
Dropdown items: 36px height, 12px padding, `--ops-bg-hover` on hover.

### Checkboxes & Radio

| Property | Value |
|----------|-------|
| Size | 18px × 18px |
| Border radius | 4px (checkbox), full (radio) |
| Border | 1.5px solid `--ops-border-strong` |
| Checked bg | `--ops-accent` |
| Checked icon | White checkmark/dot |
| Focus | `--ops-ring-focus` |

### Toggle / Switch

| Property | Value |
|----------|-------|
| Track width | 40px |
| Track height | 22px |
| Thumb size | 18px |
| Track off | `--ops-gray-300` |
| Track on | `--ops-accent` |
| Transition | 200ms ease-in-out |

---

## 10. Status System

### Status Colors

| Status | Background | Text | Border | Dot/Icon Color | Use |
|--------|-----------|------|--------|----------------|-----|
| **Success** | `#ECFDF5` | `#065F46` | `#A7F3D0` | `#10B981` | Paid, completed, funded, signed, delivered |
| **Warning** | `#FFFBEB` | `#92400E` | `#FDE68A` | `#F59E0B` | Overdue, expiring, needs attention |
| **Error** | `#FEF2F2` | `#991B1B` | `#FECACA` | `#EF4444` | Failed, rejected, cancelled, past due |
| **Info** | `#EFF6FF` | `#1E40AF` | `#BFDBFE` | `#3B82F6` | In progress, sent, scheduled, new |
| **Neutral** | `--ops-gray-100` | `--ops-gray-600` | `--ops-gray-200` | `--ops-gray-400` | Draft, inactive, archived |

```css
--ops-status-success:     #10B981;
--ops-status-success-bg:  #ECFDF5;
--ops-status-success-text: #065F46;
--ops-status-success-border: #A7F3D0;

--ops-status-warning:     #F59E0B;
--ops-status-warning-bg:  #FFFBEB;
--ops-status-warning-text: #92400E;
--ops-status-warning-border: #FDE68A;

--ops-status-error:       #EF4444;
--ops-status-error-bg:    #FEF2F2;
--ops-status-error-text:  #991B1B;
--ops-status-error-border: #FECACA;

--ops-status-info:        #3B82F6;
--ops-status-info-bg:     #EFF6FF;
--ops-status-info-text:   #1E40AF;
--ops-status-info-border: #BFDBFE;
```

### Badge Component

| Size | Height | Padding | Font | Radius |
|------|--------|---------|------|--------|
| `sm` | 20px | 2px 6px | 11px / 600 | 4px |
| `md` | 24px | 2px 8px | 12px / 500 | 4px |

Badges always use the status bg/text/border triplet. NEVER an accent-colored badge for status — status colors are reserved for meaning.

### Status Dot

8px circle, `border-radius: full`, inline before status text. Used in table rows and card badges for scanability.

### Pipeline Stage Colors (Kanban)

| Stage | Column Header Color | Card Accent |
|-------|-------------------|-------------|
| New Lead | `--ops-status-info` | Left border 3px |
| Appt. Scheduled | `--ops-blue-400` | Left border 3px |
| Measurement Complete | `--ops-blue-300` | Left border 3px |
| Proposal Sent | `--ops-status-warning` | Left border 3px |
| Proposal Signed | `--ops-status-success` | Left border 3px |
| Pre-Production | `--ops-gray-400` | Left border 3px |
| Materials Ordered | `--ops-gray-500` | Left border 3px |
| In Progress | `--ops-blue-500` | Left border 3px |
| Punch List | `--ops-status-warning` | Left border 3px |
| Complete | `--ops-status-success` | Left border 3px |
| Lost | `--ops-status-error` | Left border 3px |

---

## 11. Data Display

### Tables

| Property | Value |
|----------|-------|
| Header bg | `--ops-bg-inset` |
| Header font | 12px / 600 / Inter / uppercase / `--ops-text-tertiary` |
| Header letter-spacing | 0.04em |
| Header height | 40px |
| Row height | 48px (default), 40px (compact) |
| Row border | 1px solid `--ops-border-subtle` on bottom |
| Row hover | `--ops-bg-hover` |
| Cell padding | 12px 16px |
| Cell font | 14px / 400 |
| Numeric cells | `tabular-nums`, right-aligned |
| Currency | Right-aligned, 14px / 500, `--ops-text-primary` |
| Actions column | Right-aligned, icon buttons only |
| Empty state | Centered, 48px from top, illustration + text + CTA |
| Pagination | Bottom, 48px height, right-aligned |

### KPI / Metric Cards

| Property | Value |
|----------|-------|
| Layout | Horizontal row, equal width |
| Card padding | 20px |
| Label | 12px / 500 / `--ops-text-tertiary` / uppercase |
| Value | 28px / 700 / Sora / `--ops-text-primary` / `tabular-nums` |
| Trend indicator | 13px / 500, green (up) or red (down) with arrow icon |
| Comparison text | 12px / 400 / `--ops-text-tertiary` ("vs last month") |
| Sparkline (optional) | 48px height, accent color, bottom-right |

### Charts

| Property | Value |
|----------|-------|
| Font | Inter 12px for axis labels, 11px for tick labels |
| Grid lines | `--ops-border-subtle`, dashed |
| Primary series | `--ops-accent` |
| Secondary series | `--ops-blue-300` |
| Tertiary series | `--ops-gray-400` |
| Tooltip | `--ops-bg-surface`, `--ops-shadow-md`, `--ops-radius-lg`, 12px padding |
| Legend | Below chart, 12px font, dot + label |
| Axis text | `--ops-text-tertiary`, `tabular-nums` |

---

## 12. Iconography

| Property | Value |
|----------|-------|
| Library | Lucide React |
| Default size | 18px (sidebar, buttons) |
| Small size | 16px (inline, badges, table actions) |
| Large size | 24px (empty states, feature icons) |
| Stroke width | 1.75 (default Lucide) |
| Color | `currentColor` (inherits text color) |

**Rules:**
- Icons always pair with text OR have `aria-label`
- Never use color alone to convey meaning — icon + color
- Sidebar icons: 18px, `--ops-text-secondary` (default), `--ops-accent` (active)
- Status icons: use matching status color

---

## 13. Component Specs

### Card

```
┌─────────────────────────────────┐  radius: 12px
│  padding: 20px                  │  bg: --ops-bg-surface
│                                 │  border: 1px solid --ops-border-default
│  [Card content]                 │  shadow: --ops-shadow-sm
│                                 │
└─────────────────────────────────┘
```

- **Clickable card hover:** `shadow-md`, `translateY(-1px)`, 150ms
- **Card header:** 16px / 600, with optional action button right-aligned
- **Card divider:** 1px `--ops-border-subtle`, full width (bleeds to card edge via negative margin)

### Modal / Dialog

| Property | Value |
|----------|-------|
| Width | 480px (sm), 640px (md), 800px (lg) |
| Max height | 85vh |
| Padding | 24px |
| Radius | 16px |
| Shadow | `--ops-shadow-lg` |
| Backdrop | `--ops-bg-overlay` |
| Enter | Fade in + scale(0.95→1), 300ms ease-out |
| Exit | Fade out + scale(1→0.95), 210ms ease-in |
| Header | 20px / 600 / Sora, 24px bottom padding |
| Footer | 16px top border, 16px top padding, buttons right-aligned |

### Drawer / Slide Panel

| Property | Value |
|----------|-------|
| Width | 400px (sm), 560px (md), 720px (lg) |
| Side | Right |
| Shadow | `--ops-shadow-xl` |
| Backdrop | `--ops-bg-overlay` |
| Enter | Slide from right, 300ms ease-out |
| Exit | Slide to right, 210ms ease-in |
| Padding | 24px |

Used for: Job detail quick-view, compose message, quick-edit forms.

### Toast / Notification

| Property | Value |
|----------|-------|
| Position | Bottom-right, 24px from edge |
| Width | 360px max |
| Padding | 12px 16px |
| Radius | 8px |
| Shadow | `--ops-shadow-md` |
| Font | 14px / 400 |
| Duration | 5s (auto-dismiss), persistent for errors |
| Enter | Slide up + fade in, 300ms |
| Exit | Fade out, 200ms |
| Variants | Default (neutral), Success (green left border), Error (red left border), Warning (amber left border) |
| Stack | Max 3 visible, newest on bottom |

### Kanban Card

```
┌─────────────────────────────┐  radius: 8px
│ 📍 123 Main St, Dallas TX   │  bg: --ops-bg-surface
│                              │  border: 1px solid --ops-border-subtle
│ $12,500           Tasks 3/6  │  left-border: 3px solid [stage-color]
│ ┌──────────┐ ┌────────────┐ │  padding: 12px
│ │✅ Measured│ │📄 Sent     │ │  shadow: --ops-shadow-xs
│ └──────────┘ └────────────┘ │  hover-shadow: --ops-shadow-sm
│ • New  · 2h ago         [AB]│  width: 100% of column
└─────────────────────────────┘  drag: opacity 0.85 + shadow-md
```

| Property | Value |
|----------|-------|
| Width | Fill column (column is 280px min) |
| Padding | 12px |
| Gap (internal) | 8px |
| Address font | 14px / 500 |
| Value font | 14px / 600 / `tabular-nums` |
| Badge font | 11px / 500 |
| Timestamp font | 12px / 400 / `--ops-text-tertiary` |
| Avatar | 24px circle, right-aligned bottom |

### Kanban Column

| Property | Value |
|----------|-------|
| Width | 280px min, 320px max |
| Header height | 40px |
| Header font | 13px / 600 / uppercase |
| Count badge | Neutral badge, next to title |
| Revenue | 13px / 500 / `tabular-nums` / `--ops-text-tertiary`, right-aligned |
| Card gap | 8px |
| Column gap | 16px |
| Scroll | Vertical within column, horizontal across board |

### Sidebar Nav Item

```
Active:   bg: --ops-bg-active, text: --ops-accent, font-weight: 500
Default:  bg: transparent, text: --ops-text-secondary, font-weight: 500
Hover:    bg: --ops-bg-hover, text: --ops-text-primary
```

| Property | Value |
|----------|-------|
| Height | 36px |
| Radius | 8px |
| Padding | 6px 12px |
| Icon size | 18px |
| Gap | 10px |
| Font | 14px / 500 |
| Group label | 11px / 600 / uppercase / `--ops-text-tertiary` / 0.06em tracking |
| Group gap | 24px between groups |
| Item gap | 2px between items |

---

## 14. Z-Index

| Token | Value | Use |
|-------|-------|-----|
| `--ops-z-base` | 0 | Default content |
| `--ops-z-raised` | 1 | Kanban drag ghost, hover cards |
| `--ops-z-sticky` | 10 | Table headers, page header |
| `--ops-z-dropdown` | 20 | Dropdowns, popovers, tooltips |
| `--ops-z-sidebar` | 25 | Sidebar (when overlapping on mobile) |
| `--ops-z-modal` | 30 | Modals, dialogs |
| `--ops-z-drawer` | 35 | Slide panels |
| `--ops-z-toast` | 40 | Toasts, notifications |
| `--ops-z-command` | 50 | Command palette (if implemented) |

---

## 15. Accessibility

### Non-negotiable

1. **Semantic HTML.** `<main>`, `<nav>`, `<section>`, `<table>`, `<thead>`, `<th scope>`. No div soup.
2. **`:focus-visible`** with `--ops-ring-focus` on every interactive element.
3. **`aria-label`** on every icon-only button.
4. **Color is never the sole indicator.** Status = color + icon + text.
5. **44x44px minimum touch targets.** Even if the visual button is 32px, the click area is 44px.
6. **`aria-live="polite"`** for toast notifications and dynamic content updates.
7. **Contrast:** 4.5:1 for normal text (14px), 3:1 for large text (18px+).
8. **Skip-to-content link** hidden until focused.
9. **Keyboard navigation:** Tab through all interactive elements, Enter to activate, Escape to close modals/drawers.
10. **Tables:** Always `<caption>` (can be visually hidden), sortable columns announce sort state.

### Contrast Verification

| Pair | Ratio | Pass |
|------|-------|------|
| `--ops-text-primary` (#1E2329) on `--ops-bg-page` (#F7F9FC) | 14.8:1 | AAA |
| `--ops-text-secondary` (#4E5868) on `--ops-bg-surface` (#FFF) | 7.2:1 | AAA |
| `--ops-text-tertiary` (#8A95A8) on `--ops-bg-surface` (#FFF) | 3.5:1 | AA Large |
| `--ops-accent` (#1E6CFF) on `--ops-bg-surface` (#FFF) | 4.1:1 | AA |
| `--ops-text-inverse` (#FFF) on `--ops-accent` (#1E6CFF) | 4.1:1 | AA |
| Status success text (#065F46) on success bg (#ECFDF5) | 7.8:1 | AAA |
| Status error text (#991B1B) on error bg (#FEF2F2) | 7.1:1 | AAA |
| Status warning text (#92400E) on warning bg (#FFFBEB) | 7.3:1 | AAA |

---

## 16. Implementation Notes

### Token Strategy

1. **Create a single CSS file:** `src/styles/ops-tokens.css` — contains ALL `--ops-*` variables.
2. **Scope to ops layout:** Variables declared under `.ops-shell` or `[data-layout="ops"]` selector so they don't leak into quote flow / portal / landing pages.
3. **Tailwind integration:** Extend `tailwind.config.ts` with ops tokens mapped to utility classes under an `ops` prefix or via the `@theme` layer.
4. **Do NOT delete existing token files.** The quote flow and portal still use them. Ops gets its own clean system.
5. **Phase out over time.** After ops is complete, consider migrating other surfaces to `--ops-*` as the canonical system.

### Font Loading

```tsx
// src/app/ops/layout.tsx
import { Sora, Inter, JetBrains_Mono } from 'next/font/google'

const sora = Sora({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-sora' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })
```

### File Structure

```
src/styles/
├── ops-tokens.css          ← ALL --ops-* variables (new)
├── ops-utilities.css        ← Ops-specific utility classes (new)
├── globals.css              ← Keep as-is (used by other surfaces)
├── tokens/                  ← Keep as-is (legacy, used by other surfaces)
└── ...
```

### Component Library

Build ops components in `src/components/ops/ui/` — these wrap shadcn primitives with ops tokens applied:
- `OpsButton`, `OpsInput`, `OpsBadge`, `OpsCard`, etc.
- Or: use shadcn components with an ops-specific CSS layer that overrides variables within the ops layout.

**Preferred approach:** CSS variable override within ops layout, not separate components. Less code, same result:
```css
[data-layout="ops"] {
  --primary: 217 100% 56%;        /* maps to --ops-accent */
  --radius: 0.375rem;             /* 6px */
  /* ... map all shadcn vars to ops values */
}
```

This means shadcn `<Button>`, `<Input>`, etc. automatically adopt ops styling within the ops layout. Zero component duplication.
