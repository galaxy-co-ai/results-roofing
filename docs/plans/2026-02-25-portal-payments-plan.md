# Portal Payments — Implementation Plan

> Build the customer-facing payments page with Stripe Customer integration, smart payment options, and branded PDF receipts.

**Design doc:** `docs/plans/2026-02-25-portal-payments-design.md`
**Wireframe:** `docs/wireframes/portal-payments.pen`
**Branch:** `feat/portal-payments`

---

## Phase 0: Wireframe (Pencil)

> Do this FIRST. No code until wireframe is validated.

### 0.1 — Set up Results Roofing .pen file
- Open/create `docs/wireframes/portal-payments.pen`
- Set brand tokens from `designs/results-roofing/brand.md`
- Build minimal [System] components needed: Button, Card, Badge, Input, Table Row, Progress Bar

### 0.2 — Wireframe: Desktop (1440px)
- Payment Progress Card
- 3-column Payment Options grid (Deposit, Pay in Full, Financing)
- Payment History table (with rows showing data)
- Payment Drawer (Stripe Elements placeholder)
- Empty state variant
- "All paid" variant

### 0.3 — Wireframe: Mobile (390px)
- Stacked single-column layout
- Cards full-width
- Table horizontal scroll

### 0.4 — Screenshot validation
- `get_screenshot` for desktop, mobile, both states
- Verify against constitution quality gates

---

## Phase 1: Database + Stripe Customer Backend

> Backend-first. No UI changes yet.

### 1.1 — Add `stripeCustomerId` to leads table
- File: `src/db/schema/leads.ts`
- Add `stripeCustomerId: text('stripe_customer_id')` column
- Run `npm run db:push`

### 1.2 — Create Stripe Customer helper
- File: `src/lib/integrations/adapters/stripe.ts` (new)
- `getOrCreateStripeCustomer(lead: { id, email, firstName, lastName })` → returns `stripeCustomerId`
- Checks lead for existing `stripeCustomerId` first
- Creates via `stripe.customers.create()` if needed
- Updates lead record with new ID

### 1.3 — Update `create-intent` to use Stripe Customer
- File: `src/app/api/payments/create-intent/route.ts`
- Look up lead from quote
- Call `getOrCreateStripeCustomer(lead)`
- Add `customer` field to `stripe.paymentIntents.create()`
- Accept new param: `paymentType: 'deposit' | 'balance' | 'full'`

### 1.4 — Update webhook to populate card details
- File: `src/app/api/payments/webhook/route.ts`
- In `payment_intent.succeeded` handler:
  - Retrieve the charge: `stripe.charges.retrieve(chargeId, { expand: ['payment_method'] })`
  - Extract `cardLast4` and `cardBrand` from `charge.payment_method.card`
  - Pass to `createPayment()` call

### 1.5 — Verify
- Run `npm run typecheck`
- Test with dev simulation endpoint
- Confirm `stripeCustomerId` written to leads table
- Confirm `cardLast4` + `cardBrand` populated on payment record

---

## Phase 2: Branded PDF Receipt

### 2.1 — Install `@react-pdf/renderer`
- `npm install @react-pdf/renderer`

### 2.2 — Create receipt PDF template
- File: `src/lib/pdf/receipt-template.tsx` (new)
- React component that renders a PDF document
- Props: `{ payment, order, lead, companyInfo }`
- Layout: logo, company header, customer info, line items, total, payment method, footer

### 2.3 — Create receipt API route
- File: `src/app/api/portal/receipts/[paymentId]/route.ts` (new)
- Auth: Clerk `auth()` — verify user owns the order
- Fetch payment + order + lead from DB
- Render PDF via `renderToStream()`
- Return `Response` with `Content-Type: application/pdf`

### 2.4 — Verify
- Hit receipt endpoint with a test payment ID
- Confirm PDF downloads with correct content

---

## Phase 3: Portal Payments Page UI

> Rebuild the page. Reference wireframe for layout.

### 3.1 — Create PaymentProgressCard component
- File: `src/components/features/portal/PaymentProgressCard.tsx` (new)
- Props: `{ totalPrice, totalPaid, balance, paymentMethod? }`
- Progress bar: width = `(totalPaid / totalPrice) * 100`
- Payment method display: card brand icon + "•••• 4242" or empty state
- Skeleton variant

### 3.2 — Create PaymentOptionCard component
- File: `src/components/features/portal/PaymentOptionCard.tsx` (new)
- Props: `{ type: 'deposit' | 'balance' | 'financing', amount, isPaid, paidDate?, variant: 'primary' | 'outline', onPay, onDownloadReceipt }`
- Two visual states: unpaid (CTA button) and paid (checkmark + date + receipt link)
- Financing variant: always disabled with "Coming soon" badge
- All 5 interactive states on CTA button

### 3.3 — Create PaymentHistoryTable component
- File: `src/components/features/portal/PaymentHistoryTable.tsx` (new)
- Props: `{ payments[], onDownloadReceipt }`
- Columns: Date, Type badge, Amount, Status badge, Actions
- Empty state with CreditCard icon
- Row hover behind `@media (hover: hover)`
- `tabular-nums` on amount column

### 3.4 — Rebuild `/portal/payments/page.tsx`
- Import new components
- Smart state logic:
  - `hasDeposit` = any payment with `type === 'deposit' && status === 'succeeded'`
  - `isPaidInFull` = `totalPaid >= totalPrice`
  - Primary CTA logic: deposit card gets primary if unpaid, else balance card gets primary
- Wire PaymentDrawer with correct `paymentType` and `amount`
- Wire receipt download: `window.open(/api/portal/receipts/${paymentId})`
- Skeleton loading state
- Error boundary

### 3.5 — Update PaymentDrawer
- File: `src/components/features/portal/PaymentDrawer.tsx`
- Add header showing payment type + amount breakdown
- On success callback: invalidate queries + show success toast

### 3.6 — Verify
- Run `npm run typecheck`
- Visual review: desktop (1440px) and mobile (390px)
- Test all states: no order, nothing paid, deposit paid, paid in full
- Test payment flow end-to-end with dev simulation
- Test receipt download

---

## Phase 4: Polish + Constitution Compliance

### 4.1 — Responsive validation
- Test at 390px, 768px, 1024px, 1440px
- Cards stack correctly on mobile
- Table scrolls horizontally on mobile
- Touch targets >= 44px

### 4.2 — Interactive states audit
- All buttons: hover, active, focus-visible, disabled
- Table rows: hover state
- Drawer: enter/exit animations (300ms enter, 200ms exit)
- Focus rings: `box-shadow`, not outline

### 4.3 — Accessibility
- Semantic HTML: `<main>`, `<section>`, `<table>`
- `aria-label` on icon-only buttons (download receipt)
- `tabular-nums` on all monetary values
- Contrast check both themes (if dark mode active)

### 4.4 — Screenshot comparison vs wireframe
- Compare final implementation to Pencil wireframe
- Fix any layout drift

---

## File Manifest

### New Files
| File | Purpose |
|------|---------|
| `docs/wireframes/portal-payments.pen` | Pencil wireframe |
| `src/lib/integrations/adapters/stripe.ts` | Stripe Customer helper |
| `src/lib/pdf/receipt-template.tsx` | Branded PDF receipt template |
| `src/app/api/portal/receipts/[paymentId]/route.ts` | Receipt download endpoint |
| `src/components/features/portal/PaymentProgressCard.tsx` | Progress card component |
| `src/components/features/portal/PaymentOptionCard.tsx` | Payment option card component |
| `src/components/features/portal/PaymentHistoryTable.tsx` | Payment history table component |

### Modified Files
| File | Change |
|------|--------|
| `src/db/schema/leads.ts` | Add `stripeCustomerId` column |
| `src/app/api/payments/create-intent/route.ts` | Stripe Customer integration |
| `src/app/api/payments/webhook/route.ts` | Populate card details from charge |
| `src/app/portal/payments/page.tsx` | Full rebuild with new components |
| `src/components/features/portal/PaymentDrawer.tsx` | Enhanced header + line items |
| `package.json` | Add `@react-pdf/renderer` |

### Dependencies
| Package | Purpose |
|---------|---------|
| `@react-pdf/renderer` | Server-side PDF generation |

---

## Estimated Scope
- **Phase 0 (wireframe):** ~30 min
- **Phase 1 (backend):** 5 files touched, ~200 lines new code
- **Phase 2 (PDF):** 2 new files, ~150 lines
- **Phase 3 (UI):** 4 new components + 1 page rebuild, ~500 lines
- **Phase 4 (polish):** Testing + fixes

## Review Checkpoints
- After Phase 1: typecheck + dev simulation test
- After Phase 2: receipt PDF visual review
- After Phase 3: full visual review at both breakpoints
- After Phase 4: constitution compliance checklist sign-off
