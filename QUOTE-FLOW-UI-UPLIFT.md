# Results Roofing — Quote Flow UI Uplift

## Mission

Polish the multi-step roofing quote wizard to portfolio-grade quality. The backend, data flow, and XState machine are solid — **do not touch business logic, API calls, or state management.** This is a pure visual/interaction pass.

The bar is Rauno Freiberg / Linear / Vercel — soft, tactile, considered. Not flashy. Not template-y. Every pixel earns its place.

---

## Tech Stack (already installed — use what's here)

- **Next.js 14** App Router, TypeScript strict
- **Tailwind v3.4** with custom config + `--rr-*` CSS variable tokens in `src/styles/tokens/`
- **Framer Motion 12** — use for step transitions, micro-interactions
- **Radix UI** primitives — use for accessible dropdowns, dialogs
- **CSS Modules** — existing pattern for page-specific styles. Keep using them.
- **React Hook Form** — forms are already wired. Don't rewire.

---

## Design Principles (follow these religiously)

### Restraint
Remove before add. If you can take it away and the UI still communicates, take it away. No decorative gradients, no unnecessary borders, no icon soup.

### Motion
- Hover states: `150ms ease-out`
- Step transitions: `300ms ease-out` (enter), `200ms ease-in` (exit — 30% faster)
- Button press: `scale(0.97)` on `:active`
- Only animate `transform` and `opacity` — GPU composited only
- Respect `prefers-reduced-motion: reduce` — disable all animation
- Page/step transitions via Framer Motion `AnimatePresence` with y-axis slide + opacity

### Spacing
- 4px grid. Every margin, padding, gap divisible by 4.
- Related items get LESS space. Unrelated items get MORE space.
- Inner padding : outer margin should be at least 2:1 ratio.
- Use `gap` in flex/grid, not margins.

### Typography
- Headings: use `clamp()` for fluid sizing. No breakpoint jumps.
- Step titles: `clamp(24px, 3vw, 32px)`, weight 700, `letter-spacing: -0.02em`
- Body: 16px, line-height 1.6
- Captions/labels: 12-13px, weight 500, uppercase tracking `0.05em`
- `font-variant-numeric: tabular-nums` on ALL prices and numbers
- `text-wrap: balance` on headings

### Color
- Use existing `--rr-*` semantic tokens. Zero raw hex in components.
- Primary actions: ONE filled button per visible area
- Secondary actions: ghost/outline style
- Cards: `background: var(--rr-color-bg-secondary)`, `border: 1px solid` at 6-8% opacity
- Dark/light agnostic — use tokens so it works in both

### Interactive Elements
Every clickable thing needs ALL 4 states:
1. **Default** — resting appearance
2. **Hover** — gated behind `@media (hover: hover)`. Subtle bg shift or shadow
3. **Active/pressed** — `scale(0.97)`, slightly darker
4. **Focus-visible** — `box-shadow: 0 0 0 2px var(--rr-color-bg-primary), 0 0 0 4px var(--rr-color-accent)` (ring, not outline — prevents layout shift)
5. **Disabled** — `opacity: 0.5`, `cursor: not-allowed`

### Accessibility
- Semantic HTML (`<main>`, `<section>`, `<fieldset>`)
- All icon-only buttons need `aria-label`
- Color never the sole indicator — always pair with text or icon
- Touch targets minimum 44x44px
- Focus ring via `box-shadow`, not `outline`

---

## Step-by-Step Specifications

### Step 1: Address Entry (Landing Hero)

**Current state:** Generic "Your Roof Quote In Minutes" with plain input + autocomplete dropdown.

**Target:**
- Hero headline: fluid `clamp()` sizing, weight 700, `letter-spacing: -0.02em`, `text-wrap: balance`
- The "In Minutes" accent should use `var(--rr-color-accent)` not hardcoded blue
- Address input: 48px height, 12px border-radius, subtle inner shadow (`inset 0 1px 2px rgba(0,0,0,0.06)`), 16px font (prevents iOS zoom)
- Autocomplete dropdown: rounded-12, subtle shadow `0 4px 24px rgba(0,0,0,0.08)`, 8px padding inside, each result row with 8px padding + 8px border-radius + hover bg `var(--rr-color-bg-tertiary)`
- Autocomplete results: left icon should be muted, address text should be `--rr-color-text-primary`, city/state/zip should be `--rr-color-text-secondary`
- Smooth height animation on the dropdown (Framer Motion `layout` prop)
- Input focus: blue ring via box-shadow, smooth 150ms transition
- Testimonials below: if they exist, give them proper quote styling — slightly larger text, italic, with a subtle left border accent or oversized quotation mark. Muted author attribution below.

### Step 2: Property Confirmation (Satellite Map)

**Current state:** "Is this your property?" with satellite image, address, two buttons.

**Target:**
- Satellite image: `border-radius: 12px`, subtle shadow, fill the available width better (currently feels small and disconnected)
- Address text below map: `font-weight: 500`, `--rr-color-text-primary`
- "Yes, this is my property" button: filled primary, 48px height, checkmark icon left-aligned, rounded-10
- "Try a different address" button: ghost/text style, not outline — just text + left arrow, muted color. No border.
- Subtle explanatory text ("We'll use satellite imagery...") should be `caption` size (12px), `--rr-color-text-tertiary`
- Entrance animation: map image scales from 0.95 to 1.0 with opacity fade, 300ms

### Step 3: Package Selection (Pricing Cards)

**Current state:** 3 cards in a row (Essential / Preferred / Signature) with feature lists. Functional but flat.

**This is the money screen. It deserves the most attention.**

**Target:**
- Cards: `border-radius: 16px`, `padding: 28px`, border `1px solid` at 6% opacity
- The "Preferred" (recommended) card should be visually elevated:
  - Slightly taller (negative top margin or scale 1.02)
  - Stronger border: `2px solid var(--rr-color-accent)`
  - Subtle background tint: `var(--rr-color-accent)` at 3-4% opacity
  - "Most Popular" badge: pill shape, `border-radius: 100px`, small, accent bg + white text, positioned overlapping the top edge of the card (`position: absolute; top: -12px; left: 50%; transform: translateX(-50%)`)
- Non-recommended cards: standard border, no tint
- Prices: `tabular-nums`, weight 700, size `clamp(28px, 3.5vw, 36px)`, `letter-spacing: -0.02em`
- Per-sq-ft: caption size, muted, directly under price with tight spacing (4px gap)
- Feature list: checkmarks should use `var(--rr-color-success)` (#22C55E or similar green), consistent 8px gap between items, text at body-sm (14px)
- Deposit line: separated by a subtle `1px` divider (not full width — 80% centered or with padding), "Deposit" label left, "$500" right, both caption weight
- Select buttons: primary filled on Preferred, outline/ghost on others
- Hover on any card: `translateY(-2px)` + shadow increase, `150ms ease-out`, gated behind `@media (hover: hover)`
- On selection: brief scale pulse (`1.02` → `1.0`, 200ms spring), then transition to next step

### Step 4: Schedule Installation (Calendar + Time Slots)

**Current state:** Functional calendar grid + morning/afternoon time cards. Looks like a default date picker.

**Target:**
- Calendar container: `border-radius: 16px`, `padding: 24px`, clean border
- Month/year header: weight 600, with subtle chevron arrows (not heavy). Arrows should have hover states.
- Day grid: cells should be 40x40px, `border-radius: 10px`
  - Available days: `--rr-color-text-primary`, hover: accent bg at 10% opacity
  - Selected day: accent bg solid, white text, subtle shadow
  - Unavailable: `opacity: 0.3`, no pointer events
  - Today indicator: small dot below the number, accent color
- Time slot cards: `border-radius: 12px`, `padding: 20px`, side by side
  - Default: border 1px, icon + label + time range
  - Selected: accent border 2px, accent bg at 5%, icon gets accent color
  - Hover: bg shift, not border change (prevents layout shift from 1px→2px)
  - Icons: sun for morning, moon for afternoon — line style, not filled
- "Continue" button appears below time slots after both date + time are selected (Framer Motion slide-up + opacity)
- "Back to Packages" link: ghost style, left arrow icon, muted

### Step 5: Confirm Booking (Summary + Contact Form)

**Current state:** Summary cards + contact form. Information is there but visually flat.

**Target:**
- Quote summary bar (address + tier + price): sticky or prominent, `border-radius: 12px`, subtle accent-tinted background
- "Your Installation" section: clean card with consistent left-icon + label + value pattern
  - Icons: 20px, `--rr-color-accent`, consistent alignment
  - Labels: overline style (11px, uppercase, tracking, muted)
  - Values: body weight 500, `--rr-color-text-primary`
  - Price value: `tabular-nums`, weight 700
- Contact form:
  - Card wrapper: `border-radius: 16px`, `padding: 28px`
  - Field labels: 13px, weight 500, above the input (not floating — floating labels cause more problems than they solve)
  - Inputs: 44px height, `border-radius: 10px`, `font-size: 16px`, border at 8% opacity
  - Input focus: ring via box-shadow, accent color, 150ms
  - Field spacing: 20px between fields (not crammed, not wasteful)
  - Required asterisk: small, `--rr-color-accent` or red, next to label
- "View My Project" CTA: full-width in the card, 48px, filled primary, right arrow icon
  - On hover: arrow nudges right 4px (`translateX(4px)`)
- Reassurance text below: caption size, muted, with a small shield/lock icon. "No payment required now" is a trust builder — make it visible but not loud.

---

## Progress Stepper (appears on steps 3-5)

**Current state:** Blue circles with numbers + lines. Generic.

**Target:**
- Horizontal stepper, centered above step content
- Steps: small circles (28px), number inside (13px, weight 600)
- Completed steps: accent bg, white checkmark icon (not number)
- Current step: accent bg, white number
- Future steps: muted border only, muted number
- Connector lines: 1px, between circles. Completed = accent color, future = muted
- Step labels below circles: caption size (12px), weight 500. Current = `--rr-color-text-primary`, others = `--rr-color-text-tertiary`
- No animation needed on the stepper itself — it should just reflect state
- Total width: compact. Don't stretch it edge to edge. Cap at `max-width: 480px` centered.

---

## Step Transitions (Framer Motion)

Wrap each step's content in `AnimatePresence` with `mode="wait"`:

```tsx
// Forward (next step)
initial={{ opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}

// Back (previous step)
initial={{ opacity: 0, y: -12 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 8 }}
transition={{ duration: 0.2, ease: [0.4, 0, 1, 1] }}
```

Exit is always 30% faster than enter.

---

## Trust Footer (bottom bar)

**Current state:** "Licensed & Insured", "GAF Certified", "4.9 Rating" in a row.

**Target:**
- Keep it. It's good trust signaling.
- Icons: 16px, `--rr-color-accent` or muted
- Text: caption size, weight 500, `--rr-color-text-secondary`
- Centered, subtle top border at 4% opacity
- Consistent spacing between items (use flex gap, 24px)

---

## What NOT to Do

- Don't refactor the XState machine or state management
- Don't change API calls, data shapes, or backend interactions
- Don't add new dependencies (you have Tailwind, Framer Motion, Radix, Lucide — that's plenty)
- Don't create a dark mode if one doesn't exist yet
- Don't add mobile responsive breakpoints unless they're already there — desktop-first
- Don't add loading skeletons or error states unless they already exist
- Don't rename component files or restructure directories
- Don't remove any `data-testid` attributes or test hooks

---

## Verification Checklist

After each step's polish, verify:
1. `pnpm build` passes with zero errors
2. All 4 interactive states work (hover, active, focus-visible, disabled)
3. Prices display with `tabular-nums`
4. No raw hex values in component code — all via tokens
5. Spacing is on 4px grid
6. No layout shift on hover/focus (no border width changes, use box-shadow)
7. `prefers-reduced-motion` disables animations
8. Touch targets >= 44px on all buttons/inputs
