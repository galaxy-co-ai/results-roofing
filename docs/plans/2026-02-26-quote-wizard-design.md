# In-Portal Quote Wizard — Design Doc

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create the implementation plan from this design.

**Goal:** Embed the full quote wizard inside the customer portal's My Project page so users never leave their dashboard to get a quote.

**Date:** 2026-02-26

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Full wizard embedded (all steps) | Keeping users in-portal is the whole point |
| Presentation | Inline stepped form below checklist | Checklist IS the progress indicator — no modal/drawer needed |
| Satellite confirmation | Optimistic with background measurement | Avoids 3-10s dead pause; prices firm up in background |
| Phase transition | Brief completion moment (1.5s) then Phase 2 | Gives accomplishment beat without blocking |
| Draft persistence | No (ship later if needed) | 2-minute flow; YAGNI |
| State management | Local useState (no XState, no URL state) | Right complexity for a short flow without persistence |
| Backend changes | None — all existing API routes | 12+ endpoints already handle full lifecycle |

---

## Component Architecture

```
Phase1Content (existing, in portal/page.tsx)
├── ProjectTimeline (existing — stage 1)
├── Checklist (existing — step 1 active)
│   └── step 1 CTA triggers wizard open (not /quote/new link)
└── QuoteWizard (NEW — renders inline when wizard is active)
    ├── AddressStep      → POST /api/quotes
    ├── ConfirmStep       → Map pin confirmation (no API call)
    ├── PackageStep       → POST /api/quotes/[id]/select-tier
    ├── ScheduleStep      → POST /api/quotes/[id]/schedule
    └── ContactStep       → POST /api/quotes/[id]/contact + /confirm
```

### Wizard State

```typescript
type WizardStep = 'ADDRESS' | 'CONFIRM' | 'PACKAGE' | 'SCHEDULE' | 'CONTACT' | 'COMPLETE';

interface WizardState {
  step: WizardStep;
  quoteId: string | null;
  isSubmitting: boolean;
  error: string | null;
}
```

- `QuoteWizard` owns state via `useState`
- Each step receives `quoteId` + `onNext` callback
- On COMPLETE: 1.5s success moment → `queryClient.invalidateQueries(['orders'])` → Phase 2 renders

---

## Step Details

### AddressStep
- Single text input with Google Places autocomplete (reuse existing `AddressAutocomplete` from standalone wizard)
- Submit: `POST /api/quotes` with structured address
- Response: `{ id, status: 'preliminary', address, estimate }`
- Sets `quoteId` in wizard state
- Background: satellite measurement fires server-side automatically

### ConfirmStep
- Static map thumbnail (Google Static Maps API) + formatted address
- "Yes, that's my property" → advance
- "No, try again" → back to AddressStep
- No API call

### PackageStep
- Three tier cards: Good / Better / Best
- Price ranges if measurement pending, firm prices if complete
- Polls `GET /api/quotes?id=[id]` every 5s to detect measurement completion
- Submit: `POST /api/quotes/[id]/select-tier`

### ScheduleStep
- Date picker for preferred installation date
- Shows earliest available date
- Submit: `POST /api/quotes/[id]/schedule`

### ContactStep
- Name, phone, email (pre-fill email from Clerk session)
- SMS consent checkbox
- Submit: `POST /api/quotes/[id]/contact` then `POST /api/quotes/[id]/confirm`
- Confirm creates the Order record → triggers phase transition

### CompletionMoment
- 1.5s transitional state (not a real step)
- Checkmark animation on checklist step 1
- "Your quote is ready!" with quote summary fade-in
- After delay: invalidate queries → Phase 2 content renders

---

## Layout & Styling

### Positioning
- Wizard renders inline below Checklist in Phase1Content
- Content pushes down naturally — no absolute positioning or overlays
- When active, checklist step 1 CTA changes to step indicator

### Step Chrome
- Step title: 16px/600 weight
- Step description: 14px, `--rr-color-text-secondary`
- Primary button: full-width mobile, auto-width desktop, `--rr-color-blue`
- Back link: "← Back" text in `--rr-color-text-secondary` (steps 2-5)
- Errors: inline below field, `--rr-color-error`, 13px

### Transitions
- 150ms crossfade between steps (matches portal transition timing)
- No horizontal slide — vertical stack, no layout shift

### Responsive
- **Desktop (>768px):** 900px max-width container. PackageStep tier cards in 3-column grid.
- **Mobile (≤768px):** Full-width. Tier cards stack. Native `<input type="date">`. All touch targets 44px min.

### Tokens (all existing)
- `--rr-color-blue` — primary buttons, active states
- `--rr-color-bg-secondary` — step card backgrounds
- `--rr-color-border-default` — input borders
- `--rr-color-text-primary/secondary/tertiary` — text hierarchy
- `--rr-color-success` — completion checkmark
- `--rr-color-error` — validation errors

---

## Data Flow

```
AddressStep → POST /api/quotes → { quoteId, estimate }
  ↓ (background: satellite measurement fires)
ConfirmStep → no API call
  ↓
PackageStep → POST /api/quotes/[id]/select-tier
  ↓ (polls for measurement if still pending)
ScheduleStep → POST /api/quotes/[id]/schedule
  ↓
ContactStep → POST /api/quotes/[id]/contact
           → POST /api/quotes/[id]/confirm → creates Order
  ↓
CompletionMoment (1.5s) → invalidateQueries → Phase 2
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Address not in service area | Inline error: "We currently serve TX, GA, NC, AZ, OK" — stay on AddressStep |
| API call fails (network/500) | Inline error below submit: "Something went wrong. Please try again." — button re-enables |
| Satellite measurement fails | No user impact — PackageStep shows price ranges, user proceeds |
| Measurement arrives mid-PackageStep | Prices update in-place via polling |
| Clerk session expired | Redirect to sign-in (existing middleware) |
| Duplicate quote for same address | API returns existing quote — wizard hydrates to appropriate step |

---

## File Plan

### New Files
- `src/components/features/portal/QuoteWizard/QuoteWizard.tsx` — orchestrator
- `src/components/features/portal/QuoteWizard/QuoteWizard.module.css`
- `src/components/features/portal/QuoteWizard/steps/AddressStep.tsx`
- `src/components/features/portal/QuoteWizard/steps/ConfirmStep.tsx`
- `src/components/features/portal/QuoteWizard/steps/PackageStep.tsx`
- `src/components/features/portal/QuoteWizard/steps/ScheduleStep.tsx`
- `src/components/features/portal/QuoteWizard/steps/ContactStep.tsx`
- `src/components/features/portal/QuoteWizard/steps/CompletionMoment.tsx`

### Modified Files
- `src/app/portal/page.tsx` — Phase1Content: replace `/quote/new` CTA with wizard trigger + inline QuoteWizard
- `src/components/features/portal/Checklist/Checklist.tsx` — support onClick CTA (not just href)
- `src/components/features/portal/index.ts` — add QuoteWizard export

### No Backend Changes
All 12+ quote API routes remain unchanged.
