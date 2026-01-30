# Deposit Flow

This directory contains the deposit authorization and payment step of the quote flow.

## Overview

The deposit page (`/quote/[id]/deposit`) is **Step 4 of 4** in the customer journey:

1. **Address & Property** - Customer enters address, confirms satellite view
2. **Package Selection** - Choose roofing tier (Good/Better/Best)
3. **Schedule Installation** - Pick installation date and time slot
4. **Deposit Authorization** - Sign authorization and pay $500 deposit ← **This step**

## Architecture

```
/quote/[id]/deposit/
├── page.tsx              # Server component - fetches quote data
├── page.module.css       # Page-level styles (container, sticky CTA)
├── DepositPageClient.tsx # Client component - manages flow state
└── README.md             # This file
```

### Component Hierarchy

```
page.tsx (Server)
└── DepositPageClient.tsx (Client)
    ├── DepositAuthCard (authorization step)
    │   ├── BenefitPills        # "Fully Refundable", "Secures Date", etc.
    │   ├── QuoteSummary        # Address, package, date, total
    │   ├── DepositIncludes     # What the $500 covers
    │   ├── SignaturePad        # Customer signature capture
    │   ├── SocialProof         # Testimonial and stats
    │   └── Timeline            # "What Happens Next" steps
    │
    └── PaymentForm (payment step)
        └── Stripe Elements
```

## Flow States

The `DepositPageClient` manages two states:

1. **Authorization** (`step: 'authorization'`)
   - Shows `DepositAuthCard`
   - Customer signs and agrees to terms
   - On submit: saves authorization via `POST /api/quotes/[id]/deposit-auth`

2. **Payment** (`step: 'payment'`)
   - Shows `PaymentForm` with Stripe Elements
   - Customer enters card details
   - On success: redirects to `/portal/dashboard`

## Components

### DepositAuthCard

Located at: `src/components/features/checkout/DepositAuthCard/`

Main component that collects:
- Digital signature (via `SignaturePad`)
- Agreement checkbox
- Displays quote summary, benefits, social proof

**Props:**
```typescript
interface DepositAuthCardProps {
  quoteId: string;
  quoteSummary: QuoteSummary;
  onSignatureChange: (signature: string | null) => void;
  onAgreementChange: (agreed: boolean) => void;
  onPayClick: () => void;
  onNeedMoreTime: () => void;
  signature: string | null;
  hasAgreed: boolean;
  isProcessing?: boolean;
  error?: string | null;
}
```

### Sub-components (Internal)

These are private to `DepositAuthCard` and not exported:

| Component | Purpose |
|-----------|---------|
| `BenefitPills` | Green pills showing key benefits |
| `DepositIncludes` | Checklist of what deposit covers |
| `SocialProof` | Customer stats and testimonial |
| `Timeline` | 4-step "What Happens Next" |

## API Endpoints

### POST `/api/quotes/[id]/deposit-auth`

Saves the customer's authorization before payment.

**Request:**
```json
{
  "signature": "data:image/png;base64,...",
  "agreedToTerms": true,
  "termsVersion": "1.0"
}
```

**Response:**
```json
{
  "success": true,
  "authorizationId": "auth_xxx"
}
```

## Mobile Considerations

- **Sticky CTA**: On mobile (`< 640px`), a sticky footer appears with the primary CTA
- The main CTA button inside the card is hidden on mobile to prevent duplication
- Card goes edge-to-edge (no border radius) on mobile

## Accessibility

- All animations respect `prefers-reduced-motion: reduce`
- Signature pad has proper labeling and instructions
- Error messages use `role="alert"`
- Interactive elements have sufficient touch targets (48px min)

## Testing Checklist

To test this flow, you need a quote with:
- [x] Completed Stage 1 (address/measurement)
- [x] Selected package tier
- [x] Scheduled installation date

Then verify:
- [ ] Progress indicator shows step 4/4
- [ ] Quote summary displays correct data
- [ ] Signature pad captures input
- [ ] CTA disabled until signature + checkbox
- [ ] CTA shows pulse animation when enabled
- [ ] Mobile sticky footer appears at `< 640px`
- [ ] "Not ready?" link goes to `/portal/dashboard?pending=true`
