# Results Roofing Brand Guidelines

> **Framer-Inspired Visual Identity**  
> Modern, restrained, and premium—designed for a tech-forward roofing company.

**Version:** 2.0  
**Last Updated:** January 2026

---

## Brand Philosophy

Results Roofing's visual identity balances **professional trustworthiness** with **modern product aesthetics**. Inspired by companies like Framer and Linear, the brand conveys:

- **Confidence** through clean geometry and restrained design
- **Premium quality** through careful attention to spacing and depth
- **Technical competence** through modern, UI-focused aesthetics
- **Approachability** through soft materials and controlled color

---

## Color Palette

### Primary Colors

| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| **Blue Primary** | `#1E6CFF` | 30, 108, 255 | Primary brand color, CTAs, "RESULTS" wordmark, interactive elements |
| **Charcoal** | `#1E2329` | 30, 35, 41 | Left R mark, primary text, strong contrast, mono logos |
| **Soft White** | `#F7F9FC` | 247, 249, 252 | Primary backgrounds, light mode surfaces |

### Color Tints & Shades

#### Blue Scale
| Name | HEX | Usage |
|------|-----|-------|
| Blue Highlight | `#4D8CFF` | Gradient highlights, hover states |
| **Blue Primary** | `#1E6CFF` | Main brand blue |
| Blue Shadow | `#1554CC` | Gradient shadows, depth |
| Blue Dark | `#0D3D99` | Pressed states, emphasis |

#### Charcoal Scale
| Name | HEX | Usage |
|------|-----|-------|
| Charcoal Highlight | `#2A3038` | Subtle tonal variation |
| **Charcoal Base** | `#1E2329` | Primary dark color |
| Charcoal Shadow | `#14181D` | Drop shadows, depth |
| Charcoal Deep | `#0A0D10` | Maximum depth (rare) |

#### Neutral Scale
| Name | HEX | Usage |
|------|-----|-------|
| White | `#FFFFFF` | Cards, containers |
| **Soft White** | `#F7F9FC` | Page backgrounds |
| Gray 50 | `#F2F4F8` | Subtle backgrounds |
| Gray 100 | `#E8EDF5` | Borders, dividers |
| Gray 200 | `#D1D9E6` | Disabled elements |
| Gray 400 | `#9BA8BD` | Placeholder text |
| **Gray 600** | `#4A5568` | "ROOFING" wordmark, secondary text |
| Gray 800 | `#2D3748` | Body text |

### Semantic Colors

| Name | HEX | Usage |
|------|-----|-------|
| Success | `#10B981` | Confirmations, completed states |
| Warning | `#F59E0B` | Caution, attention needed |
| Error | `#EF4444` | Errors, destructive actions |
| Info | `#3B82F6` | Informational notices |

### Color Application Rules

```
Backgrounds (layering):
Soft White (#F7F9FC) → White (#FFFFFF) → Gray 50 (#F2F4F8)

Text hierarchy:
Charcoal (#1E2329) → Gray 800 (#2D3748) → Gray 600 (#4A5568) → Gray 400 (#9BA8BD)

Interactive elements:
Default: Blue Primary (#1E6CFF)
Hover: Blue Highlight (#4D8CFF)
Pressed: Blue Dark (#0D3D99)
Focus: Blue Primary with 20% opacity ring
```

---

## Typography

### Font Stack

| Role | Primary | Fallback |
|------|---------|----------|
| **Display & Headlines** | Sora | Manrope, Inter, system-ui |
| **Body & UI** | Inter | system-ui, -apple-system, sans-serif |

**Why These Fonts:**
- **Sora**: Geometric, modern, excellent for headlines. More distinctive than Inter while maintaining professionalism.
- **Inter**: Industry-standard UI font. Excellent legibility at all sizes.
- **Manrope**: Alternative to Sora with similar geometric feel.

### Wordmark Typography

| Element | Font | Weight | Size | Letter-spacing | Color |
|---------|------|--------|------|----------------|-------|
| **RESULTS** | Sora | 600 (SemiBold) | 38px | 0.02em | Blue Primary (#1E6CFF) |
| **ROOFING** | Sora | 400 (Regular) | 22px | 0.12em | Gray 600 (#4A5568) |

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| Display | 48px / 3rem | 1.1 | 600 | Hero headlines |
| H1 | 36px / 2.25rem | 1.2 | 600 | Page titles |
| H2 | 28px / 1.75rem | 1.25 | 600 | Section headers |
| H3 | 22px / 1.375rem | 1.3 | 500 | Subsection headers |
| H4 | 18px / 1.125rem | 1.4 | 500 | Card titles |
| Body Large | 18px / 1.125rem | 1.6 | 400 | Lead paragraphs |
| Body | 16px / 1rem | 1.6 | 400 | Default body text |
| Body Small | 14px / 0.875rem | 1.5 | 400 | Secondary text |
| Caption | 12px / 0.75rem | 1.4 | 400 | Labels, fine print |

### Kerning & Tracking

```css
/* Headlines: Tight tracking */
letter-spacing: -0.02em;

/* Body text: Normal */
letter-spacing: 0;

/* All-caps labels: Wide tracking */
letter-spacing: 0.08em;
text-transform: uppercase;
```

---

## Logo Usage

### Logo Variants

1. **Primary Full-Color**: Main logo with gradients and shadows
   - Use on: Light backgrounds (#F7F9FC or white)
   - Minimum size: 120px wide

2. **Primary Horizontal**: Single-line wordmark
   - Use on: Headers, navigation, compact spaces
   - Minimum size: 100px wide

3. **Monochrome Charcoal**: Single-color version
   - Use on: Light backgrounds, print materials, embroidery
   - Minimum size: 100px wide

4. **Monochrome White**: Reversed single-color
   - Use on: Dark backgrounds, photography overlays
   - Minimum size: 100px wide

5. **App Icon**: Mark only in rounded square
   - Use on: App icons, profile images, favicons
   - Minimum size: 32px

### Clear Space

The logo requires minimum clear space equal to the height of the "R" letter on all sides.

```
┌─────────────────────────────────┐
│                                 │
│    ▓   ┌─ Clear space = R     │
│    ▓   │   height              │
│  ┌─────┼─────────────────┐     │
│  │ [RR] RESULTS           │     │
│  │      ROOFING          │     │
│  └─────────────────────────┘     │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Minimum Sizes

| Variant | Digital (px) | Print (mm) |
|---------|-------------|------------|
| Full Logo | 120px wide | 30mm wide |
| Mark Only | 32px | 8mm |
| Favicon | 16px | n/a |

---

## The RR Mark

### Geometry System

The RR mark is built on a **consistent grid** with:

- **8px corner radius** on all outer corners
- **4px corner radius** on inner details
- **12px stroke width** for primary stems
- **Centered vertical axis** between the two R letters
- **4px gap** between left and right R

### Color Treatment

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Left R | Charcoal gradient (#2A3038 → #1E2329 → #14181D) | Soft White (#F7F9FC) |
| Right R | Blue gradient (#4D8CFF → #1E6CFF → #1554CC) | Blue Primary (#1E6CFF) |

### Shadow Treatment

```css
/* Charcoal R shadow */
filter: drop-shadow(0 2px 4px rgba(20, 24, 29, 0.12));

/* Blue R shadow */
filter: drop-shadow(0 3px 5px rgba(21, 84, 204, 0.20));
```

Shadows are:
- **Soft** (stdDeviation 3-5px)
- **Directional** (slightly down: dy 2-3px)
- **Low contrast** (opacity 12-20%)
- **Color-matched** to the shape

---

## Do's and Don'ts

### ✅ DO

- Use the logo on backgrounds with sufficient contrast
- Maintain clear space around the logo
- Use official color values
- Apply subtle, color-matched shadows
- Keep gradients smooth and controlled
- Ensure consistent corner radii

### ❌ DON'T

- ~~Apply metallic or chrome effects~~
- ~~Use harsh drop shadows~~
- ~~Rotate or skew the logo~~
- ~~Change the blue/charcoal relationship~~
- ~~Add outlines, strokes, or glows~~
- ~~Use on busy photographic backgrounds without overlay~~
- ~~Compress or stretch the proportions~~
- ~~Use the old metallic version~~

### Visual Examples

**Wrong:**
```
❌ Chrome/metallic gradients
❌ Hard black drop shadows
❌ 3D bevels or embossing
❌ Rainbow or off-brand colors
❌ Busy backgrounds without contrast
```

**Right:**
```
✅ Matte, controlled gradients
✅ Soft, color-matched shadows
✅ Flat or subtle depth only
✅ Blue Primary + Charcoal pairing
✅ Clean backgrounds with breathing room
```

---

## Light & Dark Mode

### Light Mode (Default)

| Element | Value |
|---------|-------|
| Page Background | #F7F9FC |
| Card Background | #FFFFFF |
| Primary Text | #1E2329 |
| Secondary Text | #4A5568 |
| Left R | Charcoal gradient |
| Right R | Blue gradient |
| Shadows | Charcoal-based, 10-15% opacity |

### Dark Mode

| Element | Value |
|---------|-------|
| Page Background | #0F1419 |
| Card Background | #1E2329 |
| Primary Text | #F7F9FC |
| Secondary Text | #9BA8BD |
| Left R | Soft White (#F7F9FC) |
| Right R | Blue Primary (#1E6CFF) |
| Shadows | Black-based, 30-40% opacity |

### Dark Mode Logo

For dark mode, use the **monochrome white** variant OR a special dark-mode version where:
- Left R becomes white/light gray
- Right R retains blue (may need highlight adjustment)

---

## Spacing System

Based on **4px grid** with consistent increments:

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight gaps, icon padding |
| space-2 | 8px | Default gap, small padding |
| space-3 | 12px | Form field padding |
| space-4 | 16px | Card padding, section gaps |
| space-5 | 24px | Component spacing |
| space-6 | 32px | Section padding |
| space-7 | 48px | Large section gaps |
| space-8 | 64px | Page section spacing |
| space-9 | 96px | Hero/major sections |

### Logo Spacing Rules

- **Header placement**: 16px from edges minimum
- **Between logo and content**: 24px minimum
- **Inline with text**: Align to baseline or cap height

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Small elements, chips |
| radius-md | 8px | Buttons, inputs, icon corners |
| radius-lg | 12px | Cards, modals |
| radius-xl | 16px | Large cards, hero elements |
| radius-2xl | 24px | App icon container |
| radius-full | 9999px | Pills, avatars |

---

## File Structure

```
/brand/
├── logo/
│   ├── primary/
│   │   ├── results-roofing-primary.svg
│   │   └── results-roofing-primary-horizontal.svg
│   ├── mono/
│   │   ├── results-roofing-mono.svg
│   │   └── results-roofing-mono-white.svg
│   └── icon/
│       ├── results-roofing-icon.svg
│       ├── results-roofing-favicon.svg
│       └── results-roofing-social.svg
└── brand-kit/
    ├── BRAND-GUIDELINES.md (this file)
    └── color-tokens.css
```

---

## Implementation Notes

### Web Font Loading

```html
<!-- Preconnect for performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load Sora and Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@400;500;600&display=swap" rel="stylesheet">
```

### CSS Custom Properties

See `color-tokens.css` for complete implementation.

### Accessibility

- All text maintains WCAG AA contrast ratios
- Focus states use Blue Primary with visible ring
- Never use Blue Primary as small text on white (use Charcoal)

---

## Quality Checklist

Before using any logo asset, verify:

- [ ] Charcoal is deep and matte (not shiny or metallic)
- [ ] Gradients are subtle and controlled
- [ ] Shadows feel natural and minimal
- [ ] Mark reads clearly at small sizes (test at 32px)
- [ ] Wordmark looks professionally kerned and balanced
- [ ] Clear space requirements are met
- [ ] Background provides sufficient contrast

---

**Questions?** Contact the brand team for additional guidance or custom usage requests.
