# Quote Tool Redesign - Agent Handoff Document

> **Purpose:** This document contains everything needed to execute a complete redesign of the Results Roofing quote tool. A new agent session should read this document and begin executing the implementation plan immediately.

**Created:** 2026-01-28
**Status:** READY FOR EXECUTION

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Decisions Made](#decisions-made)
4. [The Ideal Flow](#the-ideal-flow)
5. [Technical Architecture](#technical-architecture)
6. [Implementation Plan](#implementation-plan)
7. [Design Specifications](#design-specifications)
8. [Key Files Reference](#key-files-reference)
9. [Testing Strategy](#testing-strategy)
10. [Execution Instructions](#execution-instructions)

---

## Executive Summary

### What We're Building

Transform the current 5-step quote tool into a **3-stage wizard with sub-steps**. The new flow should match the professional quality of the landing page, feel fast and seamless, and include save/resume functionality.

### Why

The current quote tool has:
- Navigation issues (users can skip steps)
- Performance problems (3 sequential API calls in checkout)
- Mock data fallbacks that break trust
- Design inconsistencies with the landing page
- No save/resume capability

### Expected Outcome

- **3 stages** (Quote → Customize → Checkout) with smooth sub-step transitions
- **Single API call** for checkout (faster, more reliable)
- **Save & resume** via email link or account creation
- **Navigation guards** preventing broken states
- **Professional polish** matching landing page quality

---

## Current State Analysis

### Current 5-Step Flow

| Step | URL | Purpose | Issues |
|------|-----|---------|--------|
| 1 | `/quote/new` | Address entry + property confirmation + price preview | Works OK |
| 2 | `/quote/[id]/packages` | Package selection (Good/Better/Best) | Uses `MOCK_SQFT = 2450` fallback |
| 3 | `/quote/[id]/checkout` | Schedule + financing + contact | 3 sequential API calls |
| 4 | `/quote/[id]/contract` | Contract review + signature | Separate page feels clunky |
| 5 | `/quote/[id]/payment` | Stripe payment | Can be accessed without prior steps |

### Critical Problems Found

1. **No navigation guards**: Users can deep-link to `/quote/[id]/payment` without completing prior steps
2. **3 sequential API calls in checkout**: `CheckoutPageClient.tsx` lines 67-110 make calls to `/contact`, `/schedule`, `/financing` one after another
3. **Mock data fallback**: `packages/page.tsx` line 15 has `MOCK_SQFT = 2450` - used if quote data is missing
4. **Hardcoded values**: `depositPercent = 10` appears in multiple files instead of centralized config
5. **Progress bar not interactive**: `QuoteProgressBar` is display-only, users can't click back
6. **No save/resume**: If user leaves mid-flow, all progress is lost
7. **Inconsistent styling**: Quote pages don't match landing page quality

### Key File Locations

```
Entry Points:
- src/app/page.tsx                              # Landing page (hero with address entry)
- src/app/quote/new/page.tsx                    # Quote start page wrapper
- src/app/quote/new/NewQuoteForm.tsx            # Main address form component

Quote Flow Pages:
- src/app/quote/[id]/packages/page.tsx          # Package selection
- src/app/quote/[id]/checkout/page.tsx          # Checkout wrapper
- src/app/quote/[id]/checkout/CheckoutPageClient.tsx  # Checkout client component
- src/app/quote/[id]/contract/page.tsx          # Contract wrapper
- src/app/quote/[id]/contract/ContractPageClient.tsx  # Contract client component
- src/app/quote/[id]/payment/page.tsx           # Payment wrapper
- src/app/quote/[id]/payment/PaymentPageClient.tsx    # Payment client component

Shared Components:
- src/components/features/quote/QuoteProgressBar/QuoteProgressBar.tsx
- src/components/features/quote/TrustSignals/
- src/components/features/quote/PriceRangePreview/
- src/components/features/address/AddressAutocomplete.tsx
- src/components/features/address/PropertyConfirmation/
- src/components/features/checkout/ScheduleSelector/
- src/components/features/checkout/FinancingSelector/
- src/components/features/contract/SignatureCapture/
- src/components/features/checkout/PaymentForm.tsx

API Routes:
- src/app/api/quotes/route.ts                   # Create/fetch quotes
- src/app/api/quotes/[id]/select-tier/route.ts  # Tier selection
- src/app/api/quotes/[id]/contact/route.ts      # Contact info (TO BE CONSOLIDATED)
- src/app/api/quotes/[id]/schedule/route.ts     # Scheduling (TO BE CONSOLIDATED)
- src/app/api/quotes/[id]/financing/route.ts    # Financing (TO BE CONSOLIDATED)
- src/app/api/quotes/[id]/contract/route.ts     # Contract signing

Hooks:
- src/hooks/useQuote.ts                         # React Query hooks for quotes

Design Tokens:
- src/styles/tokens/colors.css
- src/styles/tokens/typography.css
- src/styles/tokens/animations.css
- src/styles/tokens/spacing.css
```

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Address autocomplete on landing page | **YES** | Seamless UX, no redirect friction |
| Email collection timing | **Stage 1, after price preview** | User sees value first → "Save My Quote" |
| Sticky mobile CTA | **DEFER** | Not in scope for this sprint |
| Wisetack financing integration | **DEFER** | Keep simple financing selector |
| Execution order | **Foundation first** | Build on solid ground |
| Number of stages | **3** | Quote → Customize → Checkout |
| URL structure | **Consolidated** | Fewer page loads, smoother UX |

---

## The Ideal Flow

### 3-Stage Architecture

```
STAGE 1: GET YOUR QUOTE                    [●○○]
├── Sub-step 1.1: Enter Address (with autocomplete)
├── Sub-step 1.2: Confirm Property (satellite image)
└── Sub-step 1.3: See Price Range + "Save My Quote" (email capture)

STAGE 2: CUSTOMIZE YOUR ORDER              [●●○]
├── Sub-step 2.1: Choose Package (Good/Better/Best cards)
├── Sub-step 2.2: Select Installation Date
└── Sub-step 2.3: Choose Payment Option

STAGE 3: CONFIRM & PAY                     [●●●]
├── Contact Info (phone, SMS consent)
├── Contract Review + Signature (inline)
└── Payment Form (inline)
    └── Success → Confirmation Page
```

### New URL Structure

```
/                           → Landing page with address autocomplete in hero
/quote/new                  → Stage 1 (all sub-steps render in place)
/quote/[id]/customize       → Stage 2 (package, schedule, financing)
/quote/[id]/checkout        → Stage 3 (contact, contract, payment - all inline)
/quote/[id]/confirmation    → Success page
```

### Key UX Improvements

1. **Sub-steps transition in place** (no page reload between 1.1, 1.2, 1.3)
2. **Progress bar is clickable** for completed stages
3. **Desktop sidebar** shows order summary during checkout
4. **Single API call** for all checkout data
5. **Save & resume** via localStorage + email link

---

## Technical Architecture

### State Management

```typescript
// QuoteWizardContext - Central state for the entire flow
interface QuoteWizardState {
  // Stage 1
  address: ParsedAddress | null;
  propertyConfirmed: boolean;
  quoteId: string | null;
  priceRanges: PriceRangeResult[] | null;
  
  // Stage 2  
  selectedTier: 'good' | 'better' | 'best' | null;
  scheduledDate: Date | null;
  timeSlot: 'morning' | 'afternoon' | null;
  financingTerm: 'pay-full' | '12' | '24' | null;
  
  // Stage 3
  phone: string;
  smsConsent: boolean;
  signatureText: string;
  
  // Meta
  currentStage: 1 | 2 | 3;
  currentSubStep: number;
  lastSavedAt: Date | null;
}
```

### API Consolidation

**Current (3 calls):**
```
POST /api/quotes/[id]/contact
POST /api/quotes/[id]/schedule  
POST /api/quotes/[id]/financing
```

**New (1 call):**
```
POST /api/quotes/[id]/finalize
Body: {
  phone: string;
  smsConsent: boolean;
  scheduledDate: string;
  timeSlot: 'morning' | 'afternoon';
  timezone: string;
  financingTerm: 'pay-full' | '12' | '24';
  signature: string;
  agreedToTerms: boolean;
}
```

### Navigation Guards

```typescript
// Middleware pattern for step validation
function useStepGuard(quoteId: string, requiredStage: number) {
  const { data: quote } = useQuote(quoteId);
  const router = useRouter();
  
  useEffect(() => {
    if (requiredStage === 2 && !quote?.id) {
      router.replace('/quote/new');
    }
    if (requiredStage === 3 && !quote?.selectedTier) {
      router.replace(`/quote/${quoteId}/customize`);
    }
  }, [quote, requiredStage]);
}
```

### Centralized Config

Create `src/lib/constants/pricing.ts`:
```typescript
export const PRICING_CONFIG = {
  depositPercent: 10,
  financingTerms: {
    '12': { apr: 0, label: '0% APR' },
    '24': { apr: 4.99, label: '4.99% APR' },
  },
  quoteValidityDays: 30,
} as const;
```

---

## Implementation Plan

### Phase 1: Foundation (15 tasks)

**Goal:** Fix critical bugs, add guards, remove mock data

| # | Task | File(s) |
|---|------|---------|
| 1.1 | Add step guard to packages page | `src/app/quote/[id]/packages/page.tsx` |
| 1.2 | Add step guard to checkout page | `src/app/quote/[id]/checkout/page.tsx` |
| 1.3 | Add step guard to contract page | `src/app/quote/[id]/contract/page.tsx` |
| 1.4 | Add step guard to payment page | `src/app/quote/[id]/payment/page.tsx` |
| 1.5 | Remove MOCK_SQFT fallback | `src/app/quote/[id]/packages/page.tsx` |
| 1.6 | Add error UI when sqft missing | `src/app/quote/[id]/packages/page.tsx` |
| 1.7 | Create PRICING_CONFIG constant | `src/lib/constants/pricing.ts` |
| 1.8 | Update deposit calculations to use config | Multiple files |
| 1.9 | Make QuoteProgressBar clickable | `QuoteProgressBar.tsx` |
| 1.10 | Create QuoteErrorBoundary | `src/components/features/quote/QuoteErrorBoundary.tsx` |
| 1.11 | Wrap quote pages in error boundary | All quote page.tsx files |
| 1.12 | Add AddressAutocomplete to landing page | `src/app/page.tsx` |
| 1.13 | Update landing form to use autocomplete | `src/app/page.tsx` |
| 1.14 | Test service area validation on landing | Manual test |
| 1.15 | Verify flow works with real data only | Manual test |

### Phase 2: API Consolidation (8 tasks)

**Goal:** Reduce checkout to single API call

| # | Task | File(s) |
|---|------|---------|
| 2.1 | Create finalize route | `src/app/api/quotes/[id]/finalize/route.ts` |
| 2.2 | Implement batched update logic | Same file |
| 2.3 | Add Zod validation schema | Same file |
| 2.4 | Update CheckoutPageClient | `CheckoutPageClient.tsx` |
| 2.5 | Remove individual API calls | `CheckoutPageClient.tsx` |
| 2.6 | Add optimistic updates | `src/hooks/useQuote.ts` |
| 2.7 | Add error handling | `CheckoutPageClient.tsx` |
| 2.8 | Test single-call checkout | Manual test |

### Phase 3: Save & Resume (12 tasks)

**Goal:** Allow users to save progress and return via email

| # | Task | File(s) |
|---|------|---------|
| 3.1 | Define QuoteDraft interface | `src/types/index.ts` |
| 3.2 | Create useQuoteDraft hook | `src/hooks/useQuoteDraft.ts` |
| 3.3 | Add quote_drafts table | `src/db/schema/quote-drafts.ts` + migration |
| 3.4 | Create save-draft API route | `src/app/api/quotes/[id]/save-draft/route.ts` |
| 3.5 | Create resume token utility | `src/lib/quote-resume.ts` |
| 3.6 | Create resume API route | `src/app/api/quotes/resume/route.ts` |
| 3.7 | Add "Save My Quote" button | Stage 1.3 component |
| 3.8 | Add email capture for save | Stage 1.3 component |
| 3.9 | Add "Create Account" on confirmation | `InlineConfirmation.tsx` |
| 3.10 | Create resume email template | Email template file |
| 3.11 | Wire up email sending | Integration |
| 3.12 | Test save/resume flow | E2E test |

### Phase 4: UI Consolidation (20 tasks)

**Goal:** Implement 3-stage wizard with sub-steps

| # | Task | File(s) |
|---|------|---------|
| 4.1 | Create QuoteWizardContext | `src/components/features/quote/QuoteWizardProvider.tsx` |
| 4.2 | Define state machine | Same file |
| 4.3 | Create StageIndicator component | `src/components/features/quote/StageIndicator/` |
| 4.4 | Create sub-step transition CSS | `src/styles/quote-transitions.css` |
| 4.5 | Create Stage1Container | `src/components/features/quote/stages/Stage1/` |
| 4.6 | Implement AddressEntry sub-step | Same folder |
| 4.7 | Implement PropertyConfirm sub-step | Same folder |
| 4.8 | Implement PricePreview sub-step | Same folder |
| 4.9 | Create Stage2Container | `src/components/features/quote/stages/Stage2/` |
| 4.10 | Implement PackageSelection sub-step | Same folder |
| 4.11 | Implement ScheduleSelection sub-step | Same folder |
| 4.12 | Implement FinancingSelection sub-step | Same folder |
| 4.13 | Create Stage3Container | `src/components/features/quote/stages/Stage3/` |
| 4.14 | Implement ContactSection | Same folder |
| 4.15 | Implement ContractSection | Same folder |
| 4.16 | Implement SignatureSection | Same folder |
| 4.17 | Implement PaymentSection | Same folder |
| 4.18 | Create OrderSummarySidebar | `src/components/features/quote/OrderSummarySidebar/` |
| 4.19 | Update confirmation page | `src/app/quote/[id]/confirmation/` |
| 4.20 | Create new consolidated routes | Route updates |

### Phase 5: Polish & QA (12 tasks)

**Goal:** Match landing page quality, ensure accessibility

| # | Task | File(s) |
|---|------|---------|
| 5.1 | Audit CSS against design tokens | All quote CSS modules |
| 5.2 | Fix hardcoded values | Multiple files |
| 5.3 | Add loading skeletons | Each stage component |
| 5.4 | Add micro-interactions | CSS animations |
| 5.5 | Keyboard navigation audit | All interactive elements |
| 5.6 | Add ARIA labels | All components |
| 5.7 | Focus management | Stage transitions |
| 5.8 | Screen reader testing | Manual test |
| 5.9 | Update E2E tests | `tests/e2e/quote-flow.spec.ts` |
| 5.10 | Add save/resume E2E test | Same file |
| 5.11 | Cross-browser testing | Manual test |
| 5.12 | Final visual QA | Manual test |

---

## Design Specifications

### Color Tokens (Use These)

```css
--rr-color-blue: #4A7EC2;           /* Primary brand - CTAs */
--rr-color-charcoal: #1E2329;       /* Primary text */
--rr-color-soft-white: #F7F9FC;     /* Page backgrounds */
--rr-color-success: #10B981;        /* Completed steps */
--rr-color-gray-100: #E8EDF5;       /* Borders */
--rr-color-gray-200: #D1D9E6;       /* Pending states */
```

### Stage Indicator Design

```
Completed: Filled circle, --rr-color-success, clickable
Current:   Highlighted circle, --rr-color-blue, not clickable  
Pending:   Hollow circle, --rr-color-gray-200, not clickable
Track:     Line connecting circles, --rr-color-gray-100
```

### Button Styles (Match Landing Page)

```css
/* Primary CTA */
.primaryButton {
  background-color: var(--rr-color-blue);
  color: var(--rr-color-white);
  border-radius: var(--rr-radius-md);
  box-shadow: var(--rr-shadow-charcoal-subtle);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.primaryButton:hover {
  transform: translateY(-1px);
  box-shadow: var(--rr-shadow-charcoal-medium);
}
```

### Sub-Step Transitions

```css
.subStep {
  animation: fadeSlideIn var(--rr-duration-normal) var(--rr-ease-out);
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Input Styles (Match Landing Page)

Reference: `src/app/page.module.css` `.addressInput` class

```css
.input {
  height: var(--rr-input-height);
  border: 1px solid var(--rr-color-border-default);
  border-radius: var(--rr-radius-md);
}

.input:focus {
  border-color: var(--rr-color-border-focus);
  box-shadow: 0 0 0 3px var(--rr-color-focus-ring-alpha);
}
```

---

## Key Files Reference

### Must Read Before Starting

1. **Landing page for design reference:** `src/app/page.tsx` + `src/app/page.module.css`
2. **Current quote form:** `src/app/quote/new/NewQuoteForm.tsx`
3. **Design tokens:** `src/styles/tokens/colors.css`
4. **UX spec document:** `docs/planning/05-ui-ux-design.md`
5. **useQuote hook:** `src/hooks/useQuote.ts`

### User Rules to Follow

From the project's user rules:

- **Accessibility Required:** WCAG compliance, ARIA labels, keyboard navigation
- **Visual Feedback Required:** Loading states, success feedback, error indicators
- **Validate with Zod:** All external input must be validated
- **Error Handling Mandatory:** Try-catch on all async, friendly error messages
- **Prefer Server Components:** Only use 'use client' when needed
- **TypeScript Strict Mode:** No 'any' without justification
- **No Console Logs:** Use logger instead

---

## Testing Strategy

### Unit Tests

- QuoteWizardContext state transitions
- Navigation guard logic
- PRICING_CONFIG calculations
- Resume token generation/validation

### Integration Tests

- Full flow: address → payment
- Resume from localStorage
- Resume from email link
- Out of area handling

### E2E Tests (Playwright)

Existing file: `tests/e2e/quote-flow.spec.ts`

Add tests for:
- Complete 3-stage flow
- Back navigation between stages
- Save and resume via email
- Error recovery
- Mobile responsive behavior

---

## Execution Instructions

### For the Executing Agent

1. **Read this document first**, then read the key files listed above
2. **Start with Phase 1, Task 1.1** (add step guard to packages page)
3. **Work sequentially** through each task in order
4. **Test after each task** to ensure nothing breaks
5. **Commit after each phase** with descriptive message following conventional commits:
   - `fix(quote): add navigation guards to prevent step skipping`
   - `refactor(api): consolidate checkout into single finalize endpoint`
   - `feat(quote): add save and resume functionality`
   - `feat(quote): implement 3-stage wizard with sub-steps`
   - `style(quote): polish UI to match landing page quality`

6. **Reference these files constantly:**
   - `src/app/page.module.css` for design patterns
   - `src/styles/tokens/` for all color/spacing values
   - `docs/planning/05-ui-ux-design.md` for UX guidance

### Quality Checklist (Per Phase)

- [ ] All TypeScript errors resolved
- [ ] No linter warnings
- [ ] Accessibility attributes present
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Matches landing page design quality

### Success Criteria

The quote tool redesign is complete when:

1. ✅ 3-stage wizard working (Quote → Customize → Checkout)
2. ✅ Sub-steps transition smoothly within each stage
3. ✅ Navigation guards prevent step skipping
4. ✅ Single API call for checkout
5. ✅ Save & resume working (localStorage + email)
6. ✅ Address autocomplete on landing page
7. ✅ Design matches landing page quality
8. ✅ All E2E tests passing
9. ✅ Accessibility audit passing

---

## Notes for Executing Agent

- The landing page (`src/app/page.tsx`) is the quality bar - everything should match it
- The design system uses CSS custom properties (`--rr-*`) - always use tokens, never hardcode
- React Query is used for server state (`useQuote` hook)
- The project uses CSS Modules for styling (`.module.css` files)
- Lucide icons are the standard (`lucide-react`)
- Form validation uses Zod schemas
- All async operations need try-catch with user-friendly error messages

---

**Document Complete. Ready for execution.**
