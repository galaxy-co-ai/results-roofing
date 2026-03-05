# Results Roofing — Data Flow Audit

**Date:** 2026-03-04
**Last Updated:** 2026-03-04
**Status:** Complete — all data flows verified, E2E tests passing
**Purpose:** Map every user data collection point end-to-end: what's gathered, which API handles it, how it's validated, where it's stored, and where it goes after storage.

---

## Table of Contents

1. [Data Collection Points](#1-data-collection-points)
2. [Database Schema (All Tables)](#2-database-schema)
3. [Outbound Data Destinations](#3-outbound-data-destinations)
4. [PII Inventory](#4-pii-inventory)
5. [Validation Rules](#5-validation-rules)
6. [Rate Limits](#6-rate-limits)
7. [Data Retention](#7-data-retention)
8. [Compliance (TCPA / E-Sign)](#8-compliance)
9. [Verification & Testing](#9-verification--testing) — E2E results, data flow verification, integration contract map
10. [Findings & Recommendations](#10-findings--recommendations)

---

## 1. Data Collection Points

### 1A. Hero Address Form (Homepage)

| | |
|---|---|
| **Component** | `src/components/features/landing/HeroAddressForm/HeroAddressForm.tsx` |
| **API** | `POST /api/quotes` |
| **Trigger** | User enters address → clicks "Get my quote" |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| `streetAddress` | Mapbox autocomplete | Yes | `leads.address`, `quotes.address` |
| `city` | Mapbox autocomplete | Yes | `leads.city`, `quotes.city` |
| `state` | Mapbox autocomplete | Yes | `leads.state`, `quotes.state` |
| `zip` | Mapbox autocomplete | Yes | `leads.zip`, `quotes.zip` |
| `lat` | Mapbox autocomplete | No | `leads.lat` |
| `lng` | Mapbox autocomplete | No | `leads.lng` |
| `placeId` | Mapbox autocomplete | No | Not stored |

**What happens after storage:**
1. Lead record created in `leads` table
2. Quote record created in `quotes` table (status: `preliminary`, expires in 30 days)
3. **Background:** Google Solar API called with lat/lng → result stored in `measurements` table
4. **Background:** Pricing recalculated from measurement → `quotes.pricingData` updated
5. Address stored in `sessionStorage` for handoff to V2 wizard

---

### 1B. Quote V2 Wizard — Property Confirmation (Step 2)

| | |
|---|---|
| **Component** | `src/components/features/quote-v2/steps/PropertyConfirm.tsx` |
| **API** | None (confirmation only) |
| **Trigger** | User confirms "Yes, this is my property" |

**No new data collected.** Displays satellite image (Mapbox Static API) and estimated sqft for confirmation. Sets `propertyConfirmed: true` in XState context.

---

### 1C. Quote V2 Wizard — Package Selection (Step 3)

| | |
|---|---|
| **Component** | `src/components/features/quote-v2/steps/PackageSelect.tsx` |
| **API** | `POST /api/quotes/[id]/select-tier` |
| **Trigger** | User selects Good / Better / Best |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| `tier` | Radio selection | Yes | `quotes.selectedTier` |

**What happens after storage:**
1. `quotes.totalPrice` calculated = (sqft x materialPrice) + (sqft x laborPrice)
2. `quotes.depositAmount` calculated via `calculateDeposit()`
3. `quotes.tierSelectedAt` timestamped
4. `quotes.status` → `selected`

---

### 1D. Quote V2 Wizard — Schedule (Step 4)

| | |
|---|---|
| **Component** | `src/components/features/quote-v2/steps/CheckoutSchedule.tsx` |
| **API** | Persisted via checkpoint (`POST /api/quote-v2/[id]/checkpoint`) |
| **Trigger** | User picks date + time slot |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| `scheduledDate` | Calendar picker | Yes | `quotes.wizardCheckpoint` (JSONB) |
| `timeSlot` | Morning/Afternoon radio | Yes | `quotes.wizardCheckpoint` (JSONB) |

**Note:** Persisted to `quotes.scheduledDate` and `quotes.scheduledSlotId` on finalization.

---

### 1E. Quote V2 Wizard — Contact Info (Step 5)

| | |
|---|---|
| **Component** | `src/components/features/quote-v2/steps/CheckoutContact.tsx` |
| **API** | Persisted via checkpoint + finalize |
| **Trigger** | User enters phone, email, SMS consent |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| `phone` | Text input (formatted `(xxx) xxx-xxxx`) | Yes | `leads.phone` |
| `email` | Text input | Yes | `leads.email` |
| `smsConsent` | Checkbox | No | `smsConsents` table |

**Validation:**
- Phone: stripped to digits, must be exactly 10
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

### 1F. Quote V2 Wizard — Payment (Step 6)

| | |
|---|---|
| **Component** | `src/components/features/quote-v2/steps/CheckoutPayment.tsx` |
| **API** | `POST /api/payments/create-intent` → Stripe Elements |
| **Trigger** | User enters card details and submits |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| Card number | Stripe Elements (PCI-compliant iframe) | Yes | **Stripe only** — never touches our server |
| Card expiry | Stripe Elements | Yes | **Stripe only** |
| Card CVC | Stripe Elements | Yes | **Stripe only** |
| `cardLast4` | Stripe webhook response | — | `payments.cardLast4` |
| `cardBrand` | Stripe webhook response | — | `payments.cardBrand` |

**What happens after successful payment (webhook `payment_intent.succeeded`):**
1. `orders` record created (denormalized customer + property + pricing data)
2. `payments` record created (amount, Stripe IDs, card info, status)
3. `invoices` record created (deposit invoice with auto-generated number)
4. `quotes.status` → `converted`
5. **Resend:** Payment confirmation email sent
6. **GHL:** Contact synced to CRM with `deposit-paid` tag
7. **GHL:** Opportunity created/updated in pipeline
8. **Analytics:** `deposit_paid` conversion event fired (GA4 + Meta CAPI)

---

### 1G. Contact Form

| | |
|---|---|
| **Component** | `src/components/features/contact/ServiceRequestForm.tsx` |
| **API** | `POST /api/contact` |
| **Trigger** | 3-step form: service type → address → contact info |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| `serviceType` | Radio (Roof Replacement / Storm Damage / Inspection / Gutters) | Yes | `leads.serviceType` |
| `address` | Text input | Yes | `leads.address` |
| `city` | Text input | Yes | `leads.city` |
| `state` | Text input | Yes | `leads.state` |
| `zip` | Text input | Yes | `leads.zip` |
| `name` | Text input (split to first/last) | Yes | `leads.firstName`, `leads.lastName` |
| `phone` | Text input | Yes | `leads.phone` |
| `email` | Text input | Yes | `leads.email` |
| `message` | Textarea | No | `leads.notes` |

**Additional:** `leads.utmSource` set to `'contact_form'` for attribution.

---

### 1H. Out-of-Area Lead Capture

| | |
|---|---|
| **Component** | `src/components/features/address/OutOfAreaCapture.tsx` |
| **API** | `POST /api/leads/out-of-area` |
| **Trigger** | User enters address outside service area (TX, GA, NC, AZ, OK) |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| `email` | Text input | Yes | `outOfAreaLeads.email` |
| `zip` | From address | No | `outOfAreaLeads.zip` |
| `state` | From address | No | `outOfAreaLeads.state` |
| `ipAddress` | Request headers | Auto | `outOfAreaLeads.ipAddress` |
| `userAgent` | Request headers | Auto | `outOfAreaLeads.userAgent` |

---

### 1I. Save & Resume (Email Capture)

| | |
|---|---|
| **Component** | V2 wizard save button |
| **API** | `POST /api/quote-v2/[id]/save-draft` |
| **Trigger** | User clicks "Save my quote" and enters email |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| `email` | Text input | Yes | `quoteDrafts.email`, `leads.email` (if not set) |

**What happens after storage:**
1. `quoteDrafts` record created with `resumeToken` (32-char, 30-day expiry)
2. `draftState` saved as JSONB with `version: 'v2'` marker
3. **Resend:** Resume email sent with deep link `/quote-v2/{quoteId}?token={resumeToken}`

---

### 1J. Deposit Authorization (Contract Signing)

| | |
|---|---|
| **Component** | Quote checkout flow |
| **API** | `POST /api/quotes/[id]/deposit-auth` |
| **Trigger** | User signs deposit authorization |

**Fields Collected:**

| Field | Source | Required | Stored In |
|-------|--------|----------|-----------|
| `signature` | Signature pad (text) | Yes | `contracts.signatureText` |
| `email` | Text input | Yes | `contracts.customerEmail` |
| `fullName` | Text input | No | `leads.firstName`, `leads.lastName` |
| `agreedToTerms` | Checkbox (must be true) | Yes | Validated, not stored separately |
| `termsVersion` | Hidden field | No | `contracts.templateVersion` |
| `signatureIp` | Request headers | Auto | `contracts.signatureIp` |
| `signatureUserAgent` | Request headers | Auto | `contracts.signatureUserAgent` |

---

## 2. Database Schema

### Core Flow Tables

```
leads ─────────────────────────────────────────────────────────
  id              UUID PK
  email           text (nullable)          ← PII
  phone           text (nullable)          ← PII
  firstName       text (nullable)          ← PII
  lastName        text (nullable)          ← PII
  address         text (NOT NULL)          ← PII
  city            text (NOT NULL)
  state           text (NOT NULL)
  zip             text (NOT NULL)
  lat             decimal(10,7) (nullable)
  lng             decimal(10,7) (nullable)
  serviceType     text (nullable)
  notes           text (nullable)
  utmSource       text (nullable)
  utmMedium       text (nullable)
  utmCampaign     text (nullable)
  utmContent      text (nullable)
  utmTerm         text (nullable)
  clerkUserId     text (nullable)
  stripeCustomerId text (nullable)
  jobnimbusContactId text (nullable)
  createdAt       timestamptz
  updatedAt       timestamptz
  Indexes: email, clerkUserId, jobnimbusContactId, createdAt

quotes ────────────────────────────────────────────────────────
  id              UUID PK
  leadId          UUID FK → leads
  status          enum (preliminary|measured|selected|financed|scheduled|signed|converted)
  address/city/state/zip  text (denormalized from lead)  ← PII
  sqftTotal       decimal(10,2)
  pitchPrimary    decimal(4,2)
  complexity      text (simple|moderate|complex)
  pricingData     JSONB (tier pricing breakdown)
  selectedTier    enum (good|better|best)
  tierSelectedAt  timestamptz
  totalPrice      decimal(10,2)
  depositAmount   decimal(10,2)
  financingStatus text
  financingTerm   text
  financingMonthlyPayment decimal(10,2)
  scheduledSlotId text
  scheduledDate   timestamptz
  wizardCheckpoint JSONB (XState snapshot for V2 resume)
  clerkUserId     text
  jobnimbusJobId  text
  expiresAt       timestamptz (30 days)
  createdAt/updatedAt timestamptz
  Indexes: leadId, status, clerkUserId, createdAt, expiresAt

measurements ──────────────────────────────────────────────────
  id              UUID PK
  quoteId         UUID FK → quotes (UNIQUE)
  vendor          text (google_solar|gaf|manual|roofr)
  status          text (pending|processing|complete|failed)
  sqftTotal/sqftSteep/sqftFlat  decimal(10,2)
  pitchPrimary/pitchMin/pitchMax decimal(4,2)
  ridgeLengthFt/valleyLengthFt/eaveLengthFt/hipLengthFt decimal(10,2)
  confidence      varchar(10) (high|medium|low)
  gafOrderNumber  text
  gafAssets       JSONB {filename: blobUrl}
  rawResponse     JSONB (full vendor response)
  Indexes: quoteId (UNIQUE), vendor, status

contracts ─────────────────────────────────────────────────────
  id              UUID PK
  quoteId         UUID FK → quotes (UNIQUE)
  status          text (draft|pending|sent|viewed|signed|expired|declined)
  customerEmail   text (NOT NULL)          ← PII
  signatureText   text                     ← PII (e-signature)
  signedAt        timestamptz
  signatureIp     text                     ← PII
  signatureUserAgent text
  signedPdfUrl    text
  signedPdfHash   text
  Indexes: quoteId (UNIQUE), status

orders ────────────────────────────────────────────────────────
  id              UUID PK
  quoteId         UUID FK → quotes (UNIQUE)
  contractId      UUID FK → contracts (UNIQUE)
  confirmationNumber text (UNIQUE, format: RR-XXXXXX)
  status          enum (pending|deposit_paid|scheduled|in_progress|completed|cancelled|refunded)
  customerEmail   text (NOT NULL)          ← PII
  customerPhone   text                     ← PII
  customerName    text                     ← PII
  propertyAddress/City/State/Zip text      ← PII
  selectedTier    text
  totalPrice/depositAmount/balanceDue decimal(10,2)
  scheduledStartDate timestamptz
  Indexes: confirmationNumber, status, clerkUserId, createdAt

payments ──────────────────────────────────────────────────────
  id              UUID PK
  orderId         UUID FK → orders
  type            enum (deposit|balance|refund)
  amount          decimal(10,2)
  currency        text (default: usd)
  stripePaymentIntentId text
  stripeChargeId  text
  stripeRefundId  text
  status          text (pending|processing|succeeded|failed|refunded)
  paymentMethod   text (card|bank_transfer|financing)
  cardLast4       text                     ← PII
  cardBrand       text
  failureCode/failureMessage text
  processedAt     timestamptz
  Indexes: orderId, stripePaymentIntentId, status

invoices ──────────────────────────────────────────────────────
  id              UUID PK
  orderId         UUID FK → orders
  paymentId       UUID FK → payments
  invoiceNumber   text (UNIQUE)
  type            enum (deposit|balance|full)
  status          enum (draft|sent|paid|void)
  amount          decimal(10,2)
  ghlContactId    text
  ghlOpportunityId text
  Indexes: orderId, invoiceNumber, status
```

### Supporting Tables

```
quoteDrafts       — Resume tokens + draft state (30-day expiry)
quoteShares       — Shareable quote links with view tracking
smsConsents       — TCPA-compliant SMS consent records
outOfAreaLeads    — Email capture for expansion marketing
appointments      — Scheduled inspections/installations
documents         — Document lifecycle tracking (contracts, invoices, receipts)
webhookEvents     — Audit trail for all inbound webhooks
```

### Ops/Internal Tables

```
pricingTiers      — Good/Better/Best tier configuration
teamMembers       — Internal team roster
materialOrders    — Material procurement tracking
automations       — Workflow automation rules
tickets           — Support ticket management
ticketMessages    — Ticket conversation threads
blogPosts         — Content management
companySettings   — Single-row company config
pipelineStages    — CRM pipeline configuration
notificationPreferences — Alert configuration
feedback          — User feedback submissions
devTasks          — Development task tracking
devNotes          — Developer notes
changelogEntries  — Project changelog
aiMemories        — AI context persistence
```

---

## 3. Outbound Data Destinations

### 3A. Resend (Transactional Email)

| Template | Trigger | Data Sent |
|----------|---------|-----------|
| `quote_ready` | Measurement complete | quoteId, quoteUrl |
| `quote_resume` | Save & resume | address, resumeUrl, expiresAt |
| `payment_confirmation` | `payment_intent.succeeded` | customerName, amount, confirmationNumber |
| `booking_confirmation` | Appointment booked | customerName, date, address, confirmationNumber |
| `booking_reminder` | Day before install | customerName, date, address |
| `project_update` | Manual trigger (payment failure, etc.) | customerName, message, portalUrl |
| `invoice_ready` | Balance due | customerName, invoiceNumber, amount, portalUrl |
| `signature_request` | Contract ready | customerName, signatureUrl |

### 3B. GoHighLevel CRM

| Action | Trigger | Data Sent |
|--------|---------|-----------|
| Create/update contact | Payment success | firstName, lastName, email, phone, address, tags |
| Create opportunity | Invoice synced | name, pipelineStageId, contactId, monetaryValue |
| Send SMS | Booking/payment/contract events | phone, message text |
| Update pipeline stage | Invoice status changes | stageId (Invoice Sent → Deposit Paid → Paid in Full) |

### 3C. Stripe

| Action | Trigger | Data Sent |
|--------|---------|-----------|
| Create customer | First payment | email, firstName, lastName, lead_id |
| Create payment intent | Checkout | amount, currency, customer, metadata (quoteId, tier, address) |

### 3D. Google Analytics 4 (Server-Side)

| Event | Trigger | Params |
|-------|---------|--------|
| `quote_started` | Address entered | source, UTM params |
| `address_entered` | Address confirmed | quoteId, state, city |
| `package_selected` | Tier chosen | quoteId, tier, totalPrice, sqft |
| `deposit_paid` | Payment succeeded | quoteId, tier, amount |
| `page_view` | All pages | pagePath, referrer |

### 3E. Meta Conversions API (CAPI)

| Our Event | Meta Event | Data |
|-----------|-----------|------|
| `quote_started` | Lead | client IP, user agent |
| `address_entered` | InitiateCheckout | — |
| `package_selected` | AddToCart | — |
| `deposit_paid` | Purchase | value, currency |

### 3F. GAF QuickMeasure (Webhook)

| Direction | Data |
|-----------|------|
| **Outbound** (order placed) | Address, lat/lng, quoteId |
| **Inbound** (webhook callback) | sqft, pitch, ridge/valley/eave/hip lengths, PDF reports |
| Report PDFs stored in **Vercel Blob Storage** (public access) |

---

## 4. PII Inventory

### Direct Customer PII (High Sensitivity)

| Data Type | Tables Containing It |
|-----------|---------------------|
| Email | leads, orders, contracts, quoteDrafts, quoteShares, outOfAreaLeads, appointments, tickets, documents |
| Phone | leads, orders, smsConsents, appointments, tickets |
| Full Name | leads (first+last), orders (customerName), documents |
| Street Address | leads, quotes, orders, documents |
| Card Last 4 | payments |
| Signature Text | contracts |
| IP Address | smsConsents, outOfAreaLeads, contracts, feedback |

### External System PII Links

| Identifier | Table | Links To |
|------------|-------|----------|
| `clerkUserId` | leads, quotes, orders | Clerk (auth provider) |
| `stripeCustomerId` | leads | Stripe (payment) |
| `jobnimbusContactId` | leads | GHL CRM |

---

## 5. Validation Rules

| Data Point | Rule | Enforcement |
|-----------|------|-------------|
| Email | Must contain `@`, valid format | Zod `.email()` or regex |
| Phone | Must be exactly 10 digits (after stripping non-digits) | Manual check |
| Address | Full address required (street, city, state, zip) | Manual check |
| State | Must be in service area: TX, GA, NC, AZ, OK | `AddressAutocomplete` component |
| Tier | Must be `good`, `better`, or `best` | Zod `.enum()` |
| Scheduled Date | Must be in the future, excludes Sundays | Manual check |
| Signature | Min 3 characters | Zod `.min(3)` |
| `agreedToTerms` | Must be `true` | Zod `.literal(true)` |
| Quote Expiry | 30 days from creation | `expiresAt` column, checked on use |
| Resume Token | 30 days from creation | `quoteDrafts.expiresAt`, checked on resume |

---

## 6. Rate Limits

| Endpoint | Limit | Identifier |
|----------|-------|------------|
| `POST /api/quotes` | 10/min | IP address |
| `POST /api/contact` | 5/min | IP address |
| `POST /api/leads/out-of-area` | 5/min | IP address |
| `POST /api/quotes/[id]/*` (all quote ops) | 10/min | IP address |
| `POST /api/quote-v2/[id]/save-draft` | 10/min | IP address |
| `POST /api/payments/create-intent` | Per IP | IP address |
| `POST /api/quotes/[id]/deposit-auth` | 10/min | IP address |

---

## 7. Data Retention

| Data | Lifetime | Policy |
|------|----------|--------|
| Quotes | 30 days (unless converted) | `expiresAt` field, not auto-deleted |
| Resume Tokens | 30 days | `quoteDrafts.expiresAt`, checked on use |
| Orders | Indefinite | Audit/legal requirement |
| Payments | Indefinite | Financial record |
| Invoices | Indefinite | Financial record |
| Contracts | Indefinite | Legal record |
| SMS Consents | Indefinite | TCPA compliance |
| Webhook Events | Indefinite | Audit trail |
| Out-of-Area Leads | Indefinite | Marketing list |
| Blog Posts | Indefinite | Content |

---

## 8. Compliance

### TCPA (SMS Consent)

The `smsConsents` table captures:
- Exact consent text shown to user
- Whether consent was given (boolean)
- Source of consent (`web_form`, `checkout_form`, `checkout_finalize`)
- IP address and User Agent at time of consent
- Opt-out tracking (`optedOutAt`, `optOutSource`)

### E-Signature (ESIGN Act)

The `contracts` table captures:
- Signature text (typed signature)
- Timestamp of signing (`signedAt`)
- IP address at signing (`signatureIp`)
- User agent at signing (`signatureUserAgent`)
- Terms version (`templateVersion`)
- Signed PDF URL and hash for integrity

### Payment Security

- Card data **never touches our servers** — handled entirely by Stripe Elements (PCI DSS Level 1)
- Only `cardLast4` and `cardBrand` stored locally (from Stripe webhook)
- Stripe webhook signature verified on every event

---

## 9. Verification & Testing

### Production Build
- **Status:** Passing — `npm run build` compiles with zero errors
- **Dynamic routes:** All API routes correctly flagged as dynamic (use cookies, headers, or DB)

### E2E Test Suite (`tests/e2e/quote-v2.spec.ts`)

| Category | Tests | Status |
|----------|-------|--------|
| Entry & Address Step | 4 | All passing |
| V1 → V2 Redirect | 1 | Passing (301 redirect verified) |
| Layout & Structure | 3 | All passing |
| Accessibility | 2 | All passing |
| Out-of-Area Rejection | 1 | Passing (Mapbox mocked, alert + button-disabled verified) |
| Contact Form Submission | 1 | Passing (3-step flow, API mocked, success state verified) |
| Page Navigation (cross-page links) | 3 | All passing |
| **Total** | **15 × 2 projects** | **30/30 passing** |

**Browser coverage:** Desktop Chrome, Mobile Chrome (Pixel 5 viewport)

### Data Flow Verification

| Flow | Entry Point | API | DB Write | Outbound | Verified |
|------|-------------|-----|----------|----------|----------|
| Quote creation (address) | Hero form | `POST /api/quotes` | leads + quotes | Google Solar (bg) | Yes |
| Property confirmation | V2 wizard step 2 | Checkpoint | wizardCheckpoint | — | Yes |
| Package selection | V2 wizard step 3 | `POST /api/quotes/[id]/select-tier` | quotes.selectedTier | — | Yes |
| Schedule | V2 wizard step 4 | Checkpoint | wizardCheckpoint | — | Yes |
| Contact info | V2 wizard step 5 | Checkpoint + finalize | leads (phone/email) | — | Yes |
| Payment | V2 wizard step 6 | `POST /api/payments/create-intent` | orders + payments + invoices | Stripe, Resend, GHL, GA4, Meta | Yes |
| Contact form | `/contact` page | `POST /api/contact` | leads | — | Yes |
| Out-of-area capture | Address entry | `POST /api/leads/out-of-area` | outOfAreaLeads | — | Yes |
| Save & resume | V2 wizard | `POST /api/quote-v2/[id]/save-draft` | quoteDrafts | Resend (resume email) | Yes |
| Contract signing | Checkout | `POST /api/quotes/[id]/deposit-auth` | contracts | — | Yes |

### Pre-Ship Fixes Applied

| Issue | Fix | Commit |
|-------|-----|--------|
| 4 fake phone numbers (555-xxxx) in V1 pages + V2 checkout | Replaced with `1-800-RESULTS` (`tel:+18007378587`) | `4e1b07b` |
| Map placeholder ("Coming Soon") on contact + about pages | Replaced with Mapbox static DFW map embed | `4714d1d`, `d733391` |
| All public links pointed to V1 `/quote/new` | Updated 4 files + added 301 redirect in `next.config.mjs` | `5b1a06e`, `4714d1d` |
| Unused `buildResumeUrl` import causing production lint error | Removed from `save-draft/route.ts` | `de42d70` |
| V2 had zero E2E test coverage | Added 15-test suite (30 across 2 browser projects) | `4714d1d`, `aa4f2a3`, `9e262e4` |

### Integration Contract Map

Every external service integration documented below: what we send, what we expect back, where it's stored, and how it's authenticated. No live calls required — this is a contract-level verification that every adapter is wired correctly.

#### Stripe (Payments)

| | |
|---|---|
| **Adapter** | `src/lib/integrations/adapters/stripe.ts` |
| **Auth** | `STRIPE_SECRET_KEY` (SDK), `STRIPE_WEBHOOK_SECRET` (HMAC signature verification) |
| **API Version** | 2025-02-24.acacia |

| Function | Endpoint | Payload → DB |
|----------|----------|-------------|
| `getOrCreateStripeCustomer()` | `POST /v1/customers` | email, name, metadata(`lead_id`) → `leads.stripeCustomerId` |
| `createPaymentIntent` | `POST /v1/payment_intents` | amount, currency, customer, metadata(`quoteId`, `tier`, `address`) → Stripe-hosted |
| Webhook: `payment_intent.succeeded` | Inbound `POST /api/payments/webhook` | PI metadata → `orders` + `payments` + `invoices` created, `quotes.status` → `converted` |
| Webhook: `payment_intent.payment_failed` | Inbound | failure code/message → logged, customer notification sent |
| Webhook: `charge.refunded` | Inbound | refund ID → `payments.status` → `refunded`, email sent |

**Card data never touches our server** — Stripe Elements (PCI DSS Level 1). Only `cardLast4` and `cardBrand` stored from webhook.

**Side effects on payment success:**
1. Resend → payment confirmation email
2. GHL → SMS confirmation (if phone present)
3. GHL → contact synced with `deposit-paid` tag
4. GHL → opportunity created/moved in pipeline
5. Balance invoice auto-generated (due 3 days before install)

#### GAF QuickMeasure (Roof Measurement)

| | |
|---|---|
| **Adapter** | `src/lib/integrations/adapters/gaf.ts` |
| **Auth** | OAuth2 client_credentials via Okta (`GAF_CLIENT_ID` + `GAF_CLIENT_SECRET`) |
| **Webhook Auth** | `client_id` + `client_secret` headers (not Bearer) |

| Function | Endpoint | Payload → DB |
|----------|----------|-------------|
| `placeOrder()` | `POST {GAF_API_URL}/order` | address, lat/lng, subscriberOrderNumber(`RR-{quoteId}`) → `measurements.gafOrderNumber` |
| `checkCoverage()` | `GET /coverageCheck` | lat/lng → boolean (not stored) |
| Webhook callback | Inbound `POST /api/webhooks/gaf` | RoofMeasurement (sqft, pitch, ridge/valley/eave/hip lengths) → `measurements` table |
| `downloadAsset()` | `GET /download/{filename}` | PDF binary → Vercel Blob (`gaf/{quoteId}/{filename}`) → `measurements.gafAssets` |

**Processing time:** ~1 hour after order placement. Webhook fires when complete.

#### GoHighLevel (CRM + Messaging)

| | |
|---|---|
| **Client** | `src/lib/ghl/client.ts` |
| **Messaging Adapter** | `src/lib/integrations/adapters/ghl-messaging.ts` |
| **Auth** | Bearer token (`GHL_API_KEY`), webhook HMAC (`GHL_WEBHOOK_SECRET`) |
| **Base URL** | `https://services.leadconnectorhq.com` |
| **Rate Limit** | 100 req/10s, 200k/day |

| Function | Endpoint | Payload → DB |
|----------|----------|-------------|
| `upsertContact()` | `POST /contacts/upsert` | email, phone, name, address, tags → `leads.jobnimbusContactId` (legacy field name) |
| `addContactTags()` | `POST /contacts/{id}/tags` | tags[] (e.g. `deposit-paid`, `quote-started`) → GHL only |
| `sendSMS()` | `POST /conversations/messages` | contactId, message → GHL only |
| `sendEmail()` | `POST /conversations/messages` | contactId, subject, html → GHL only |
| `createOpportunity()` | `POST /opportunities` | name, pipelineId, stageId, contactId, monetaryValue → `invoices.ghlOpportunityId` |
| `moveOpportunityToStage()` | `PUT /opportunities/{id}/status` | stageId → GHL only |
| Webhook | Inbound `POST /api/ops/webhooks/ghl` | Various events → `webhookEvents` table (audit trail) |

**Templated SMS methods:** `sendQuoteReadySms`, `sendBookingConfirmationSms`, `sendBookingReminderSms`, `sendPaymentConfirmationSms`, `sendContractSignedSms`, `sendInvoiceReadySms`

**Pipeline stages:** Quote → Scheduled → In Progress → Completed (or Cancelled)

#### Resend (Transactional Email)

| | |
|---|---|
| **Adapter** | `src/lib/integrations/adapters/resend.ts` |
| **Auth** | `RESEND_API_KEY` (SDK) |
| **From** | `RESEND_FROM_EMAIL` (default: `dev@galaxyco.ai`) |

| Template | Trigger | Payload |
|----------|---------|---------|
| `quote_ready` | Measurement complete | quoteId, quoteUrl |
| `quote_resume` | Save & resume | resumeUrl, address, city, state, expiresAt |
| `payment_confirmation` | `payment_intent.succeeded` | customerName, amount, confirmationNumber |
| `booking_confirmation` | Appointment booked | customerName, date, address, confirmationNumber |
| `booking_reminder` | Day before install | customerName, date, address |
| `signature_request` | Contract ready | customerName, signatureUrl |
| `project_update` | Manual (payment failure, etc.) | customerName, message, portalUrl |
| `invoice_ready` | Balance due | customerName, invoiceNumber, amountFormatted, portalUrl |
| `feedback_notification` | User feedback → admin | feedbackId, reason, priority, page, adminUrl |

**No DB storage** — fire-and-forget. Resend handles delivery tracking.

#### Google Solar API (Satellite Measurement)

| | |
|---|---|
| **Adapter** | `src/lib/integrations/adapters/google-solar.ts` |
| **Auth** | `GOOGLE_SOLAR_API_KEY` (query param) |
| **Cost** | ~$0.075/request (NOT_FOUND responses are free) |
| **Coverage** | 95%+ US buildings |

| Function | Endpoint | Payload → DB |
|----------|----------|-------------|
| `fetchSolarMeasurement()` | `GET /v1/buildingInsights:findClosest` | lat, lng, requiredQuality=MEDIUM → `measurements` table (sqftTotal, sqftSteep, sqftFlat, pitchPrimary, pitchMin, pitchMax, complexity, confidence, rawResponse) |

**Transforms:** m² → sqft, degrees → roof pitch notation (4/12, 6/12, etc.), facet count → complexity (simple/moderate/complex)

#### Deprecated / Migrated Adapters

| Adapter | Status | Now Routes To |
|---------|--------|--------------|
| JobNimbus (`jobnimbus.ts`) | Migrated Feb 2026 | GHL (wrapper functions) |
| SignalWire (`signalwire.ts`) | Deprecated Feb 2026 | GHL SMS |
| Wisetack (`wisetack.ts`) | Stub only | Migrating to Enhancify (not implemented) |

#### Webhook Audit Trail

All inbound webhooks are logged to `webhookEvents` table regardless of processing outcome:

| Column | Purpose |
|--------|---------|
| `source` | `stripe`, `gaf`, `ghl` |
| `eventType` | e.g. `payment_intent.succeeded`, `order.complete`, `ContactCreate` |
| `eventId` | Vendor's unique event ID (idempotency) |
| `payload` | Full JSON payload (JSONB) |
| `processed` | Boolean — did handler succeed? |
| `processedAt` | Timestamp of processing |
| `error` | Error message if processing failed |

#### Environment Variables (All Integrations)

| Service | Required Variables |
|---------|-------------------|
| **Stripe** | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **GAF** | `GAF_CLIENT_ID`, `GAF_CLIENT_SECRET`, `GAF_OKTA_TOKEN_URL`, `GAF_API_URL`, `GAF_SUBSCRIBER_NAME`, `GAF_PRODUCT_CODE`, `GAF_WEBHOOK_CLIENT_ID`, `GAF_WEBHOOK_CLIENT_SECRET` |
| **GHL** | `GHL_API_KEY`, `GHL_LOCATION_ID`, `GHL_WEBHOOK_SECRET`, `GHL_PIPELINE_ID`, `GHL_QUOTE_STAGE_ID`, `GHL_SCHEDULED_STAGE_ID`, `GHL_IN_PROGRESS_STAGE_ID`, `GHL_COMPLETED_STAGE_ID`, `GHL_CANCELLED_STAGE_ID` |
| **Resend** | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `FEEDBACK_NOTIFICATION_EMAIL` |
| **Google Solar** | `GOOGLE_SOLAR_API_KEY` |
| **Mapbox** | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` |

---

## 10. Findings & Recommendations

### Clean

- All form fields map to specific database columns — no orphaned data
- All API routes have proper validation (Zod or manual)
- Rate limiting on all public-facing endpoints
- TCPA compliance properly implemented
- PCI handled correctly (Stripe Elements, no raw card data)
- E-signature audit trail complete

### Flagged for Review

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| 1 | **PII in application logs** — email, phone, name, address logged at INFO level in payment webhook handler, GHL adapter, Resend adapter | Medium | Add PII masking to logger (hash emails, truncate phones) before production log aggregation |
| 2 | **GAF report PDFs in public Vercel Blob** — `access: 'public'` on uploaded measurement reports | Low | Verify PDFs contain only roof measurements (no homeowner PII). Consider `access: 'private'` with signed URLs |
| 3 | **No automatic quote/draft cleanup** — expired quotes and drafts remain in DB indefinitely | Low | Add scheduled cleanup job (cron) or soft-delete after 90 days |
| 4 | **Address denormalized across 3 tables** — `leads`, `quotes`, and `orders` all store full address independently | Info | By design for query performance. No action needed, but be aware of update inconsistencies |
| 5 | **Out-of-area leads have no unsubscribe mechanism** — email captured but no opt-out flow | Low | Add unsubscribe link when expansion emails are sent |

---

*Generated and verified as part of the Results Roofing project close-out process.*
