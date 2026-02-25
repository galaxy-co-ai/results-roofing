# Portal Payments Page — Design Document

> Customer-facing payments page in the `/portal` section. Enables homeowners to view their project cost breakdown, pay deposits or full balance via Stripe, and download branded PDF receipts.

**Date:** 2026-02-25
**Status:** Approved
**Wireframe:** `docs/wireframes/portal-payments.pen`

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Payment flow | All options upfront | Customer sees deposit, pay-in-full, and financing from day one |
| Deposit vs full | Either path | Can pay deposit first then balance, OR skip deposit and pay full amount |
| Financing | Coming soon placeholder | Wisetack integration deferred — show disabled card with badge |
| Stripe Customers | Yes, create on first payment | Enables real card display, saved methods, future features |
| Receipts | Branded PDF | Professional custom PDF with Results Roofing letterhead, not Stripe generic |
| PDF library | `@react-pdf/renderer` | React-based, serverless-compatible, no native deps |

---

## Page States

| State | Condition | What renders |
|-------|-----------|-------------|
| **Loading** | Data fetching | Skeleton: 1 progress card + 3 option cards + 3 table rows |
| **No order** | No order exists | Empty state: "Complete your quote to see payment options" + CTA to `/quote/new` |
| **Nothing paid** | Order exists, 0 payments | All 3 option cards active, empty payment history |
| **Deposit paid** | 1 deposit payment succeeded | Deposit card → "Paid" state. Balance card shows remaining. History has 1 row |
| **Paid in full** | Total paid >= total price | All cards → "Paid" state. Full history. No active CTAs |
| **Error** | API/network failure | Toast with retry action |

---

## Layout (Top → Bottom)

### 1. Page Header
- Title: "Payments" (h1, `clamp()`)
- Subtitle: "Manage your project payments and view transaction history"

### 2. Payment Progress Card (full width)
- **Left column:** Total cost, amount paid, remaining balance — `tabular-nums`, right-aligned numbers
- **Right column:** Circular or linear progress bar (brand blue `#2563EB` fill, `--secondary` track)
- **Bottom row:** Payment method on file — real card brand + last 4 from Stripe Customer, or "No payment method on file" if none
- Card: `--card` bg, `24px` padding, `6px` radius, `1px solid --border`

### 3. Payment Options (3-card grid)
- Grid: `auto-fit, min(280px, 100%)`, `16px` gap
- Responsive: 3 columns desktop → 1 column mobile (stacked)

#### Deposit Card
| Prop | Value |
|------|-------|
| Label | "Deposit" |
| Amount | 5% of total (e.g., $910) |
| Description | "Secure your installation date" |
| CTA (unpaid) | "Pay deposit" — primary button |
| Paid state | Green checkmark + "Paid on [date]" + "Download receipt" link |

#### Pay in Full Card
| Prop | Value |
|------|-------|
| Label | "Pay in Full" |
| Amount | Full total OR remaining balance (smart: adjusts based on deposit status) |
| Description | "Pay your entire balance" or "Pay remaining balance" |
| CTA (unpaid) | "Pay balance" — primary button (or secondary if deposit CTA is primary) |
| Paid state | Green checkmark + "Paid on [date]" + "Download receipt" link |

#### Financing Card
| Prop | Value |
|------|-------|
| Label | "Financing" |
| Amount | — |
| Description | "Flexible payment plans through Wisetack" |
| CTA | "Coming soon" badge — disabled, opacity 0.5 |
| Status | Always disabled (Wisetack integration deferred) |

**CTA priority rule:** Only 1 primary (blue) CTA visible at a time. The most relevant unpaid option gets primary; others get outline variant.

### 4. Payment History (data table)
- Columns: Date | Type (badge) | Amount (right-aligned, `tabular-nums`) | Status (triplet badge) | Actions
- Type badges: `deposit` (blue), `balance` (green), `refund` (amber)
- Status badges: `succeeded` (green triplet), `pending` (amber triplet), `failed` (red triplet), `refunded` (gray)
- Actions: "Download receipt" icon button (generates branded PDF)
- Empty state: CreditCard icon (48px, `--muted-foreground`) + "No payments yet" + "Complete your first payment above to see it here"
- Row hover: subtle `--accent` bg behind `@media (hover: hover)`
- Sticky header row, `caption` size, `--muted-foreground`, uppercase

### 5. Payment Drawer (Stripe Elements)
- Right-side Sheet via Radix, `sm:max-w-md`
- Header: "Pay [Deposit/Balance]" + amount
- Body: Line item breakdown + Stripe `<PaymentElement layout="tabs">`
- Footer: "Complete payment" primary button
- On success: close drawer → invalidate queries → toast success → card flips to paid state
- On failure: inline error in drawer + toast with retry option

---

## Stripe Customer Integration

### Flow
1. Customer clicks "Pay deposit" or "Pay balance"
2. `POST /api/payments/create-intent` — checks if `stripeCustomerId` exists on lead
3. If no customer: `stripe.customers.create({ name, email })` → store ID on lead
4. Create PaymentIntent with `customer` field set
5. After successful payment: `stripe.paymentMethods.retrieve()` from the charge → store `cardLast4` + `cardBrand` on payment record
6. Portal reads payment method display from latest succeeded payment

### DB Changes
| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `leads` | `stripeCustomerId` | `text` | Links homeowner to Stripe Customer |
| `payments` | `cardLast4` | Already exists | Populate from charge object in webhook |
| `payments` | `cardBrand` | Already exists | Populate from charge object in webhook |

---

## Branded PDF Receipt

### Content
- Results Roofing logo + company info (name, phone, email, license #)
- "Payment Receipt" header
- Customer: name, property address
- Line items: description (e.g., "Deposit — Preferred Package"), amount
- Total paid
- Payment method: card brand + last 4
- Date + confirmation number (Stripe PI ID)
- Footer: "Thank you for choosing Results Roofing"

### API
- `GET /api/portal/receipts/[paymentId]` → generates PDF on demand, returns `application/pdf`
- Uses `@react-pdf/renderer` — React components → PDF stream
- Auth: Clerk user must own the order associated with the payment

---

## Constitution Compliance Checklist

- [ ] Both breakpoints (1440px desktop, 390px mobile)
- [ ] All 5 interactive states on buttons/links (hover, active, focus-visible, disabled, default)
- [ ] Semantic tokens only — zero hardcoded hex in components
- [ ] `tabular-nums` on all monetary values
- [ ] `clamp()` on page title
- [ ] 4px grid spacing throughout
- [ ] Touch targets >= 44px
- [ ] Contrast >= 4.5:1 text, 3:1 large text
- [ ] Empty state for payment history
- [ ] Error state for payment failures
- [ ] Skeleton loading state
- [ ] Card inner padding < outer margin (2:1 ratio)
- [ ] One primary CTA per visible section
- [ ] Hover behind `@media (hover: hover)`
- [ ] Focus ring via `box-shadow`, not outline
- [ ] Status colors use triplet pattern (bg + text + border)
- [ ] Numbers right-aligned in table
- [ ] Sentence case throughout
- [ ] Active voice in all copy
