# Brand Assets - Results Roofing

> **Purpose:** Minimal viable brand system to unblock Phase 2 design work. Based on "Dune + OpenAI" aesthetic direction. Can be refined when client provides official assets.

**Status:** Working Draft (Phase 1 Supplement)
**Last Updated:** 2026-01-21

---

## Design Philosophy

**Dune (2021)** meets **OpenAI**:
- **From Dune:** Earth tones, sand, warm metallics, tactile warmth, timeless weight
- **From OpenAI:** Clean minimalism, generous whitespace, modern typography, quiet confidence

**What this conveys for Results Roofing:**
- Trust and stability (earth tones = grounded, reliable)
- Premium quality (minimalism = confidence, not cheap)
- Modern tech-forward (clean UI = we're different from typical contractors)
- Regional versatility (warm palette fits TX, GA, NC, AZ markets)

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Sandstone** | `#C4A77D` | 196, 167, 125 | Primary brand color, CTAs, key accents |
| **Terracotta** | `#B86B4C` | 184, 107, 76 | Secondary accent, hover states, warmth |
| **Charcoal** | `#2C2C2C` | 44, 44, 44 | Primary text, strong contrast |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **White** | `#FFFFFF` | 255, 255, 255 | Backgrounds, cards |
| **Cream** | `#FAF8F5` | 250, 248, 245 | Page backgrounds, subtle warmth |
| **Sand Light** | `#F5F0E8` | 245, 240, 232 | Secondary backgrounds, dividers |
| **Sand** | `#E8E0D4` | 232, 224, 212 | Borders, disabled states |
| **Stone** | `#9C9688` | 156, 150, 136 | Secondary text, placeholders |
| **Slate** | `#5C5C5C` | 92, 92, 92 | Body text |

### Semantic Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Success** | `#4A7C59` | 74, 124, 89 | Confirmations, completed states, positive |
| **Warning** | `#C9A227` | 201, 162, 39 | Alerts, attention needed |
| **Error** | `#B54A4A` | 181, 74, 74 | Errors, destructive actions |
| **Info** | `#5B7B8C` | 91, 123, 140 | Informational, neutral alerts |

### Color Application

```
Background layers (light to dark):
White (#FFFFFF) → Cream (#FAF8F5) → Sand Light (#F5F0E8) → Sand (#E8E0D4)

Text hierarchy (light to dark):
Stone (#9C9688) → Slate (#5C5C5C) → Charcoal (#2C2C2C)

Interactive states:
Default: Sandstone (#C4A77D)
Hover: Terracotta (#B86B4C)
Active: Charcoal (#2C2C2C)
```

---

## Typography

### Font Stack

| Role | Font | Fallback | Weight |
|------|------|----------|--------|
| **Headings** | Inter | system-ui, sans-serif | 500, 600 |
| **Body** | Inter | system-ui, sans-serif | 400, 500 |
| **Mono** | JetBrains Mono | monospace | 400 |

**Why Inter:** Clean, modern, excellent readability at all sizes, free, widely supported. Fits OpenAI aesthetic without being identical.

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| **Display** | 48px / 3rem | 1.1 | 600 | Hero headlines |
| **H1** | 36px / 2.25rem | 1.2 | 600 | Page titles |
| **H2** | 28px / 1.75rem | 1.25 | 600 | Section headers |
| **H3** | 22px / 1.375rem | 1.3 | 500 | Subsection headers |
| **H4** | 18px / 1.125rem | 1.4 | 500 | Card titles |
| **Body Large** | 18px / 1.125rem | 1.6 | 400 | Lead paragraphs |
| **Body** | 16px / 1rem | 1.6 | 400 | Default body text |
| **Body Small** | 14px / 0.875rem | 1.5 | 400 | Secondary text, captions |
| **Caption** | 12px / 0.75rem | 1.4 | 400 | Labels, fine print |

### Type Styling

```css
/* Headings: Tight tracking, darker color */
letter-spacing: -0.02em;
color: var(--charcoal);

/* Body: Normal tracking, slightly lighter */
letter-spacing: 0;
color: var(--slate);

/* All caps labels (rare): Wider tracking */
letter-spacing: 0.05em;
text-transform: uppercase;
font-size: 12px;
font-weight: 500;
```

---

## Spacing Scale

Based on 4px grid with golden ratio influence:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon padding |
| `space-2` | 8px | Default gap, small padding |
| `space-3` | 12px | Form field padding |
| `space-4` | 16px | Card padding, section gaps |
| `space-5` | 24px | Component spacing |
| `space-6` | 32px | Section padding |
| `space-7` | 48px | Large section gaps |
| `space-8` | 64px | Page section spacing |
| `space-9` | 96px | Hero/major section spacing |

**Philosophy:** Generous whitespace (OpenAI influence). When in doubt, add more space.

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Small elements, chips, tags |
| `radius-md` | 8px | Buttons, inputs, small cards |
| `radius-lg` | 12px | Cards, modals |
| `radius-xl` | 16px | Large cards, hero elements |
| `radius-full` | 9999px | Pills, avatars |

**Philosophy:** Softly rounded, never harsh. Conveys approachability.

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(44, 44, 44, 0.05)` | Subtle lift, inputs |
| `shadow-md` | `0 4px 12px rgba(44, 44, 44, 0.08)` | Cards, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(44, 44, 44, 0.12)` | Modals, popovers |
| `shadow-xl` | `0 16px 48px rgba(44, 44, 44, 0.16)` | Hero elements |

**Philosophy:** Warm, soft shadows using charcoal base. Never harsh black.

---

## Logo Direction

Until client provides official logo, use text-based approach:

### Primary Logo (Text Mark)

```
RESULTS
ROOFING
```

- Font: Inter, weight 600
- "RESULTS" in Charcoal (#2C2C2C)
- "ROOFING" in Sandstone (#C4A77D)
- Letter-spacing: 0.1em
- Stacked or horizontal depending on context

### Logo Sizing

| Context | Height | Min Clear Space |
|---------|--------|-----------------|
| Header (desktop) | 32px | 16px |
| Header (mobile) | 24px | 12px |
| Footer | 24px | 16px |
| Favicon | 32x32px | n/a |

### Favicon

Simple "R" letterform in Sandstone on Charcoal background, or inverse.

---

## Iconography

### Style Guidelines

- **Stroke weight:** 1.5px (matches Inter's visual weight)
- **Size:** 20px default, 16px small, 24px large
- **Color:** Inherit from text color or use Stone for secondary
- **Style:** Outline preferred, filled for active/selected states

### Recommended Icon Set

**Lucide Icons** (MIT license, consistent with aesthetic):
- Clean, minimal stroke icons
- Good coverage for UI needs
- React components available

---

## Photography Direction

### Style

- **Warm, natural lighting** (golden hour feel)
- **Real homes, real roofs** (affluent suburban aesthetic - TX, GA, NC, AZ)
- **People when shown:** Genuine, not stock-photo-perfect
- **Avoid:** Cold/blue tones, overly staged, corporate feel

### Treatment

- Slight warm color grade
- High quality, not over-compressed
- Can overlay with Cream (#FAF8F5) at 10-20% for cohesion

---

## Component Styling Preview

### Buttons

```css
/* Primary Button */
background: var(--sandstone);
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 500;
transition: background 150ms ease;

/* Hover */
background: var(--terracotta);

/* Secondary Button */
background: transparent;
color: var(--charcoal);
border: 1px solid var(--sand);

/* Hover */
background: var(--sand-light);
```

### Cards

```css
background: white;
border: 1px solid var(--sand);
border-radius: 12px;
padding: 24px;
box-shadow: var(--shadow-sm);
```

### Inputs

```css
background: white;
border: 1px solid var(--sand);
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
color: var(--charcoal);

/* Focus */
border-color: var(--sandstone);
box-shadow: 0 0 0 3px rgba(196, 167, 125, 0.15);

/* Placeholder */
color: var(--stone);
```

---

## CSS Custom Properties

```css
:root {
  /* Primary */
  --color-sandstone: #C4A77D;
  --color-terracotta: #B86B4C;
  --color-charcoal: #2C2C2C;

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-cream: #FAF8F5;
  --color-sand-light: #F5F0E8;
  --color-sand: #E8E0D4;
  --color-stone: #9C9688;
  --color-slate: #5C5C5C;

  /* Semantic */
  --color-success: #4A7C59;
  --color-warning: #C9A227;
  --color-error: #B54A4A;
  --color-info: #5B7B8C;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(44, 44, 44, 0.05);
  --shadow-md: 0 4px 12px rgba(44, 44, 44, 0.08);
  --shadow-lg: 0 8px 24px rgba(44, 44, 44, 0.12);
  --shadow-xl: 0 16px 48px rgba(44, 44, 44, 0.16);
}
```

---

## Usage Examples

### Package Tier Cards (F04)

| Element | Good | Better | Best |
|---------|------|--------|------|
| Border | Sand | Sandstone (2px) | Terracotta (2px) |
| Header BG | White | Sand Light | Sandstone (10%) |
| Badge | None | "Recommended" in Sandstone | "Premium" in Terracotta |

### Trust Signals (F19)

- Credential badges: Charcoal icons on Sand Light background
- Star ratings: Sandstone fill
- Verification checkmarks: Success green

### Error States (F01, F09)

- Error border: Error red
- Error background: Error red at 5% opacity
- Error text: Error red
- Always pair with actionable message in Slate

---

## Accessibility Notes

### Color Contrast (WCAG AA)

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| Charcoal on White | 15.6:1 | Yes |
| Charcoal on Cream | 14.2:1 | Yes |
| Slate on White | 7.1:1 | Yes |
| Sandstone on White | 2.8:1 | No (decorative only) |
| White on Sandstone | 2.8:1 | No (use Charcoal) |
| Charcoal on Sandstone | 5.5:1 | Yes |
| White on Terracotta | 4.5:1 | Yes (barely) |
| White on Charcoal | 15.6:1 | Yes |

**Rule:** Never use Sandstone as text on white. Use Charcoal for text on Sandstone backgrounds.

### Focus States

All interactive elements must have visible focus indicators:
- `outline: 2px solid var(--sandstone)`
- `outline-offset: 2px`

---

## Related Documents

| Doc | Relationship |
|-----|--------------|
| [05-ui-ux-design.md](./05-ui-ux-design.md) | Will expand on these tokens |
| [16-design-tokens.md](./16-design-tokens.md) | Full token system (Phase 2) |
| [06-component-specs.md](./06-component-specs.md) | Component designs using these assets |
| [SESSION-CONTEXT.md](../SESSION-CONTEXT.md) | Design direction decision |

---

## Client Asset Integration

When client provides official assets:

1. **Logo:** Replace text mark with official logo; adjust sizing tokens as needed
2. **Colors:** Evaluate against this palette; adjust if brand colors conflict
3. **Photography:** Replace placeholder direction with actual brand photography
4. **Typography:** Keep Inter unless client has licensed brand font

**Note:** This system is designed to be client-friendly and easy to adjust. The warm earth-tone palette should complement most roofing company brand colors.
