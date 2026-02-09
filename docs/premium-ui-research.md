# Premium UI Components for Results Roofing Quote Wizard

## Current State Assessment

Your existing flow is solid functionally — the 4-step stepper, Google Places autocomplete with dropdown, satellite confirmation, 3-tier pricing cards, calendar scheduling, and confirmation/checkout all work. But the visual execution reads "developer prototype" not "premium proptech." Here's what to upgrade and with what.

---

## 1. Multi-Step Form / Wizard Components

### Recommended Stack: **Custom Build with shadcn/ui + Motion (Framer Motion) + React Hook Form + Zod**

Don't use a wizard library. They're all either abandoned, poorly maintained, or too opinionated. Your flow is custom enough (address → satellite confirm → pricing → schedule → checkout) that a generic wizard will fight you.

**The Move:**
- **shadcn/ui Stepper** — shadcn now has an official stepper primitive. Use it for the progress indicator. Install via `npx shadcn@latest add stepper`. Pair with custom step content containers.
- **React Hook Form + Zod** — Form state management across steps. Use `FormProvider` to wrap all steps so data persists across transitions. Each step validates its own Zod schema on "Next."
- **Motion (Framer Motion v12+)** — Step transitions. `AnimatePresence` with `mode="wait"` for enter/exit animations between steps. The **BuildUI Multistep Wizard recipe** (buildui.com/recipes/multistep-wizard) is the gold standard — animated step indicators with spring physics, checkmark SVG path animations on completion. Copy that exact pattern.
- **Zustand** (optional) — If you need to persist quote state beyond the form (e.g., for the satellite confirmation step which is more of a display than a form), Zustand is lighter than React Context for this.

**Reference Implementation:**
- [BuildUI Multistep Wizard](https://buildui.com/recipes/multistep-wizard) — Exact Framer Motion step indicator with animated checkmarks. This is what Lemonade-level feels like.
- [Next Stepper](https://github.com/ebullient/next-stepper) — Open source Next.js + shadcn + Framer Motion + Zustand template. Good starting scaffold.
- [Shadcn Studio Multi-Step Forms](https://shadcnstudio.com/blocks/dashboard-and-application/multi-step-form) — Premium blocks with Figma files. Checkout-style multi-step forms. Install via `npx shadcn add multi-step-form-03`.

**Transition Pattern to Steal:**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {stepContent}
  </motion.div>
</AnimatePresence>
```

---

## 2. Pricing / Plan Comparison Cards

Your current 3-tier layout (Essential/Preferred/Signature) is structurally correct. The upgrade is purely visual.

### Recommended: **Tailwind UI Pricing + Aceternity UI hover effects**

**Tailwind UI** ($299 lifetime) — Their pricing sections are the benchmark for SaaS/service pricing cards. Clean hierarchy, "Most Popular" badges, feature comparison grids. Worth it just for the pricing blocks alone. See: tailwindcss.com/plus/ui-blocks/marketing/sections/pricing

**Visual Upgrades to Apply:**
1. **Elevated center card** — The "Preferred" card should physically lift above the others. Use `scale-105` + deeper shadow + colored border/glow on the featured tier.
2. **Animated price counter** — When the page loads, animate the price numbers counting up from $0 to their value. Motion's `useMotionValue` + `useTransform` + `animate()` makes this trivial.
3. **Hover state with glow** — From Aceternity UI, grab the "Moving Border" or "Card Spotlight" effect. When you hover a pricing card, a subtle gradient follows your cursor. This is the "premium fintech" feel.
4. **Feature comparison with checkmarks** — Use animated SVG checkmarks (path drawing animation) that stagger in when the card enters viewport. `whileInView` from Motion.
5. **$/sq ft context** — You already show this. Make it more prominent — this is the anchoring number for homeowners comparing contractors.

**Component Sources:**
- [Aceternity UI — Card Spotlight](https://ui.aceternity.com/components) — Cursor-following gradient effect on cards
- [Magic UI](https://magicui.design) — Built on shadcn, has "Shimmer Button" and "Border Beam" effects perfect for CTAs
- [Tailwind UI Pricing Sections](https://tailwindcss.com/plus/ui-blocks/marketing/sections/pricing) — Production-ready pricing layouts

---

## 3. Address / Location Input with Map Integration

### Recommended: **use-places-autocomplete + @vis.gl/react-google-maps + Mapbox for satellite**

Your current Google Places autocomplete dropdown is functional but visually basic. Here's the premium approach:

**Address Input:**
- **`use-places-autocomplete`** (npm) — The best React hook for Google Places. Gives you full control over the dropdown UI (unlike the widget). Pair with a shadcn `Command` component (cmdk-based) for the autocomplete dropdown — this gives you the polished keyboard-navigable, filterable dropdown that Vercel/Linear use.
- **Debounce** built-in, SSR-safe, returns structured address components.

**Satellite Confirmation (your "Is this your property?" step):**
- **Mapbox Static Images API** — For the satellite view, Mapbox static images are higher quality than Google's and cheaper at scale. You can request a satellite tile at exact coordinates with a property boundary overlay.
- **OR `@vis.gl/react-google-maps`** — Google's official React Maps library. Better than `@react-google-maps/api` (which is community-maintained). Use `Map` component with `mapTypeId="satellite"` and zoom level 19-20 for property-level view.

**Visual Pattern to Steal from Lemonade/Hippo:**
- Lemonade's quote flow uses a conversational single-field-at-a-time approach. You don't need to go that far, but the address confirmation step should feel like a "reveal moment" — the satellite image should animate in (fade + subtle zoom) when the property is confirmed. Add a subtle pulse animation on the property boundary.

---

## 4. Payment / Checkout UI Patterns

### Recommended: **Stripe Elements + shadcn Form + custom confirmation card**

**Payment:**
- **Stripe Payment Element** — Use the new `PaymentElement` (not `CardElement`). It handles cards, Apple Pay, Google Pay, bank transfers in one unified component. Style it with `appearance` API to match your design system.
- The Stripe `appearance` API lets you pass custom fonts, colors, border-radius to match your Tailwind theme exactly.

**Checkout UX Patterns:**
- **Order summary as sticky sidebar** — On desktop, the booking summary (date, package, total) should be a sticky card that follows as the user fills in contact info. On mobile, it collapses to a compact header.
- **Trust signals inline** — "Licensed & Insured", "GAF Certified", "4.9 Rating" — you already have these in the footer. Move them *above the fold* on the confirmation page, with subtle shield/badge icons.
- **"No payment required now"** is the right copy. Make it even more prominent — this is the #1 conversion anxiety reducer for roofing.

**Deposit visualization:**
```
$18,200 Total
━━━━━━━━━━━━━━━━━━━━━━
$500 deposit due at signing ← highlight this
$17,700 due at completion
```
A simple progress-bar-style visual showing the deposit as a small segment of the total makes the $500 feel small.

---

## 5. Micro-Interactions & Motion Libraries

### Tier List:

| Library | Use Case | Bundle Size | Verdict |
|---------|----------|-------------|---------|
| **Motion (Framer Motion)** | Everything — transitions, gestures, layout animations, scroll | ~32KB gzipped | **Use this. Period.** It's the industry standard for React animation. Renamed from Framer Motion to Motion in 2024. Import from `motion/react`. |
| **Motion Primitives** | Pre-built animated components (buttons, cards, modals) using Motion | Copy-paste, no bundle cost | **Use alongside Motion** for pre-built patterns. motion-primitives.com |
| **Aceternity UI** | Hero effects, card spotlights, background beams, aurora effects | Copy-paste | **Cherry-pick** specific effects. Don't install as a full library. The card hover spotlight and moving border effects are perfect for pricing cards. |
| **Magic UI** | Shimmer buttons, border beams, animated text, marquee | Copy-paste, shadcn-compatible | **Cherry-pick** for CTA buttons and subtle effects. magicui.design |
| **React Bits** | Lightweight micro-interactions | Copy-paste | Good for small touches. reactbits.dev |
| **auto-animate** | Drop-in list/layout animations | ~2KB | Good for animating list changes (like when customization options expand) |

### Specific Micro-Interactions to Implement:

1. **Step indicator checkmark** — SVG path animation when a step completes (BuildUI recipe)
2. **Pricing card hover** — Cursor-following gradient glow (Aceternity)
3. **"Select" button press** — Scale down to 0.97 on press, spring back (`whileTap={{ scale: 0.97 }}`)
4. **Calendar date selection** — Subtle pop animation on date select (`layoutId` for shared layout animation)
5. **Form field focus** — Border color transition + subtle shadow expansion
6. **Page transitions** — Slide/fade between steps with `AnimatePresence`
7. **Satellite image reveal** — Fade in + subtle scale from 1.05 to 1.0
8. **Trust badges** — Stagger fade-in on page load with `staggerChildren: 0.1`
9. **Price counting animation** — Numbers count up when pricing cards enter viewport
10. **CTA button shimmer** — Magic UI's Shimmer Button for primary actions

---

## 6. Design System & Component Kit Recommendations

### Core Stack (install all of these):
1. **shadcn/ui** — Base component primitives (free, copy-paste, full ownership)
2. **Motion (Framer Motion)** — `npm install motion` — Animation engine
3. **React Hook Form + Zod** — Form management + validation
4. **Tailwind CSS v3** — Utility styling (you have this)
5. **Lucide React** — Icon library (shadcn default)

### Premium Add-ons (cherry-pick from these):
1. **Tailwind UI** ($299 lifetime) — Pricing sections, form layouts, ecommerce components. The ROI is immediate for a shipping product. tailwindcss.com/plus
2. **Aceternity UI** (free tier + $79 All-Access) — Grab the card spotlight, moving border, and background effects. Don't use for structural components. ui.aceternity.com
3. **Magic UI** (free + Pro) — Shimmer buttons, border beams, animated text. magicui.design
4. **Origin UI** (free, MIT) — 400+ shadcn-extended components. Good for form elements and dashboard patterns. originui.com

### Skip These:
- **Park UI / Ark UI** — Solid but no real advantage over shadcn for your use case
- **MUI / Material UI** — Too opinionated, fights Tailwind
- **react-step-wizard** — Last updated 4 years ago, dead project
- **Chakra UI** — Doesn't pair well with Tailwind
- **Any jQuery-based anything** — Obviously

---

## 7. Proptech / Insurtech Design Inspiration

Study these flows — they're the benchmark for "address → quote → purchase" UX:

| Company | What to Steal | URL |
|---------|--------------|-----|
| **Lemonade** | Conversational single-field flow, AI Maya chatbot-style progression, pink accent on white, playful but trustworthy | lemonade.com |
| **Hippo** | Clean property confirmation with satellite, smart home device integration, trust-building progressive disclosure | hippo.com |
| **Opendoor** | Property valuation reveal moment, address → instant offer flow, clean data visualization | opendoor.com |
| **Offerpad** | Simplified property details collection, mobile-first quote flow | offerpad.com |
| **Branch Insurance** | Bundling UI, inline price comparison, transparent pricing breakdown | ourbranch.com |
| **Kin Insurance** | Property-specific insurance quoting, roof condition assessment integration | kin.com |

---

## 8. Implementation Priority (Ship Order)

1. **Motion + AnimatePresence step transitions** — Biggest visual impact, 2-3 hours
2. **Animated step indicator** — BuildUI recipe, 1-2 hours
3. **Pricing card elevation + hover effects** — Aceternity card spotlight, 2-3 hours
4. **Price counting animation** — Motion useMotionValue, 1 hour
5. **Satellite image reveal animation** — Motion whileInView, 30 min
6. **Form field micro-interactions** — Focus states + validation animations, 1-2 hours
7. **CTA button shimmer** — Magic UI, 30 min
8. **Trust badge stagger animation** — Motion staggerChildren, 30 min
9. **Calendar date selection animation** — Motion layoutId, 1-2 hours
10. **Stripe Elements restyling** — Appearance API theming, 1-2 hours

**Total estimated effort: ~15-20 hours to go from prototype to premium.**

---

## Key Links

- Motion (Framer Motion): https://motion.dev
- shadcn/ui: https://ui.shadcn.com
- BuildUI Multistep Wizard: https://buildui.com/recipes/multistep-wizard
- Aceternity UI Components: https://ui.aceternity.com/components
- Magic UI: https://magicui.design
- Motion Primitives: https://motion-primitives.com
- Origin UI: https://originui.com
- Tailwind UI: https://tailwindcss.com/plus
- use-places-autocomplete: https://www.npmjs.com/package/use-places-autocomplete
- @vis.gl/react-google-maps: https://www.npmjs.com/package/@vis.gl/react-google-maps
- Stripe Appearance API: https://docs.stripe.com/elements/appearance-api
- Shadcn Studio Multi-Step Forms: https://shadcnstudio.com/blocks/dashboard-and-application/multi-step-form
