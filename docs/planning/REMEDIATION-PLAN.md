# Results Roofing Remediation Plan

## Overview

This plan addresses 98 issues identified across 4 audit dimensions. Work is organized into 6 phases, prioritizing security and core functionality before integrations.

**Estimated Scope:** ~50 files affected across 6 phases

---

## Phase 1: Security Critical Fixes

**Priority:** IMMEDIATE - Must fix before any other work
**Files:** 4 files

### 1.1 Remove Authentication Bypass Vulnerability
**File:** `src/middleware.ts`
**Issue:** `BYPASS_CLERK` environment variable can disable all authentication
**Fix:**
- Remove the bypass entirely OR
- Add explicit check that rejects bypass in production: `process.env.NODE_ENV === 'development' && process.env.VERCEL_ENV !== 'production'`
- Add console.error warning when bypass is active

### 1.2 Fix Admin Token Generation
**File:** `src/app/api/admin/auth/route.ts`
**Issue:** Falls back to weak `Date.now() + Math.random()` token
**Fix:**
- Use `crypto.randomBytes(32).toString('hex')` for token generation
- Make `ADMIN_SESSION_TOKEN` required in production
- Add token validation on startup

### 1.3 Fix Admin Verification Logic
**Files:**
- `src/app/api/admin/feedback/route.ts`
- `src/app/api/admin/notes/route.ts`
- `src/app/api/admin/tasks/route.ts`
- `src/app/api/admin/stats/route.ts`
**Issue:** Returns true if ANY cookie exists when `ADMIN_SESSION_TOKEN` not set
**Fix:**
- Create shared `verifyAdmin()` helper in `src/lib/auth/admin.ts`
- Require `ADMIN_SESSION_TOKEN` to be set
- Use timing-safe comparison
- Return false (deny) if token not configured

### 1.4 Require Webhook Secrets in Production
**Files:**
- `src/app/api/webhooks/calcom/route.ts`
- `src/app/api/webhooks/documenso/route.ts`
**Issue:** Cal.com webhook allows unsigned requests if secret missing
**Fix:**
- Change `return true` to `return false` when secret not configured
- Add explicit production check that throws if secret missing
- Log rejected webhooks for debugging

---

## Phase 2: Database Integrity & Transactions

**Priority:** HIGH - Core data integrity
**Files:** 8+ files

### 2.1 Add Transaction Support Utility
**New File:** `src/db/transaction.ts`
**Create:**
```typescript
export async function withTransaction<T>(
  fn: (tx: Transaction) => Promise<T>
): Promise<T>
```

### 2.2 Wrap Quote Creation in Transaction
**File:** `src/app/api/quotes/route.ts`
**Issue:** Lead, SMS consent, and quote created without transaction
**Fix:**
- Wrap all inserts in `withTransaction()`
- Rollback if any step fails
- Return appropriate error to client

### 2.3 Wrap Contract Creation in Transaction
**File:** `src/app/api/contracts/route.ts`
**Issue:** Documenso call + DB insert not atomic
**Fix:**
- Use transaction for DB operations
- Implement compensation pattern for external API (store pending state first)

### 2.4 Wrap Appointment Booking in Transaction
**File:** `src/app/api/appointments/book/route.ts`
**Issue:** Cal.com booking + quote update not atomic
**Fix:**
- Store pending appointment state before calling Cal.com
- Update to confirmed after successful response
- Handle partial failures gracefully

### 2.5 Add CASCADE DELETE to Foreign Keys
**Files:**
- `src/db/schema/contracts.ts` - Add `.onDelete('cascade')` to quoteId
- `src/db/schema/payments.ts` - Add `.onDelete('cascade')` to orderId
- `src/db/schema/sms-consents.ts` - Add `.onDelete('cascade')` to leadId
- `src/db/schema/quotes.ts` - Make leadId `.notNull()` and add cascade

### 2.6 Add Webhook Idempotency
**Files:**
- `src/app/api/payments/webhook/route.ts`
- `src/app/api/webhooks/calcom/route.ts`
- `src/app/api/webhooks/documenso/route.ts`
**Fix:**
- Check if event ID already processed before handling
- Use database unique constraint on external event ID
- Return 200 for duplicate events without reprocessing

### 2.7 Fix Race Conditions
**File:** `src/app/api/quotes/[id]/select-tier/route.ts`
**Fix:**
- Add optimistic locking with version column OR
- Use SELECT FOR UPDATE in transaction
- Validate quote status before update

---

## Phase 3: API Route Hardening

**Priority:** HIGH - Input validation and error handling
**Files:** 15+ files

### 3.1 Fix Input Validation Gaps
**File:** `src/app/api/leads/out-of-area/route.ts`
**Fix:**
- Add Zod schema for request body
- Validate email format properly (use Zod `.email()`)
- Validate zip code format (5 digits)
- Add length limits to all string fields

**File:** `src/app/api/portal/orders/route.ts`
**Fix:**
- Validate email parameter matches authenticated user's email from Clerk
- Return 403 if email doesn't match userId
- Add proper error messages

### 3.2 Add Request Body Validation
**Files:** All POST/PATCH endpoints missing Zod validation
- `src/app/api/appointments/book/route.ts` - Validate phone format
- `src/app/api/appointments/reschedule/route.ts` - Add reason length limit
- `src/app/api/admin/feedback/route.ts` - Validate all optional fields

### 3.3 Fix Admin Query Parameter Validation
**File:** `src/app/api/admin/feedback/route.ts`
**Fix:**
- Add maximum limit (e.g., 100) to `limit` parameter
- Fix multi-condition filtering (currently only applies first filter)
- Add Zod schema for query parameters

### 3.4 Standardize Error Responses
**Create:** `src/lib/api/errors.ts`
```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) { super(message); }
}

export function errorResponse(error: ApiError | Error): NextResponse
```
**Apply to:** All API routes for consistent error format

### 3.5 Standardize Success Responses
**Create:** `src/lib/api/responses.ts`
**Fix:** Inconsistent response formats across list endpoints
- `/admin/feedback` returns `{ feedback: [] }`
- `/admin/notes` returns `{ notes: [] }`
- `/admin/tasks` returns `{ tasks: [] }`
**Standardize to:** `{ data: [], meta: { total, limit, offset } }`

### 3.6 Add Rate Limiting
**File:** `src/lib/api/rate-limit.ts` (exists but unused)
**Apply to:**
- `POST /api/quotes` - 10 requests/minute
- `POST /api/leads/out-of-area` - 10 requests/minute
- `POST /api/admin/feedback` - 20 requests/minute
- `GET /api/quotes/share/[token]` - 30 requests/minute
- All webhook endpoints - 100 requests/minute

### 3.7 Add CSRF Protection
**New File:** `src/lib/api/csrf.ts`
**Apply to:** All state-changing endpoints (POST, PATCH, DELETE)
**Exclude:** Webhook endpoints (use signature verification instead)

---

## Phase 4: Payment Pipeline Completion

**Priority:** CRITICAL - Core business functionality
**Files:** 5 files

### 4.1 Complete Payment Success Handler
**File:** `src/app/api/payments/webhook/route.ts`
**Current:** Only updates quote status
**Fix - Implement full pipeline:**

```typescript
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const quoteId = paymentIntent.metadata.quote_id;

  await withTransaction(async (tx) => {
    // 1. Get quote with all related data
    const quote = await getQuoteById(quoteId, tx);

    // 2. Create order record
    const order = await createOrder({
      quoteId,
      contractId: quote.contractId,
      status: 'deposit_paid',
      depositAmount: paymentIntent.amount / 100,
      customerEmail: quote.email,
      // ... other fields from quote
    }, tx);

    // 3. Create payment record
    await createPayment({
      orderId: order.id,
      amount: paymentIntent.amount / 100,
      type: 'deposit',
      status: 'completed',
      stripePaymentIntentId: paymentIntent.id,
    }, tx);

    // 4. Update quote status
    await updateQuote(quoteId, { status: 'converted' }, tx);
  });

  // 5. Queue async notifications (outside transaction)
  await queueNotifications(quoteId, 'payment_received');
}
```

### 4.2 Implement Refund Handler
**File:** `src/app/api/payments/webhook/route.ts`
**Current:** Logs but doesn't persist
**Fix:**
```typescript
async function handleRefund(charge: Stripe.Charge) {
  await withTransaction(async (tx) => {
    // Find payment by Stripe charge ID
    const payment = await getPaymentByStripeCharge(charge.id, tx);

    // Update payment status
    await updatePayment(payment.id, { status: 'refunded' }, tx);

    // Update order status if full refund
    if (charge.amount_refunded === charge.amount) {
      await updateOrder(payment.orderId, { status: 'refunded' }, tx);
    }
  });

  // Queue refund notification
  await queueNotifications(payment.orderId, 'refund_processed');
}
```

### 4.3 Fix Stripe Webhook Error Handling
**File:** `src/app/api/payments/webhook/route.ts`
**Current:** Returns 200 even on processing failure
**Fix:**
- Return 500 on processing errors (Stripe will retry)
- Only return 200 on successful processing
- Store failed webhooks for manual review
- Add dead letter queue for repeated failures

### 4.4 Improve Idempotency Key Generation
**File:** `src/app/api/payments/create-intent/route.ts`
**Current:** `deposit-${quoteId}-${Date.now()}`
**Fix:** `deposit-${quoteId}-${quote.selectedTier}-${quote.updatedAt.getTime()}`
- Key should be deterministic based on quote state
- Same quote state = same idempotency key = no duplicate charges

### 4.5 Add Payment Amount Validation
**File:** `src/app/api/payments/create-intent/route.ts`
**Fix:**
```typescript
const depositAmount = parseFloat(quote.depositAmount || '0');
if (isNaN(depositAmount) || depositAmount <= 0 || depositAmount > 100000) {
  return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 400 });
}
const amountInCents = Math.round(depositAmount * 100);
```

### 4.6 Remove PII from Stripe Metadata
**File:** `src/app/api/payments/create-intent/route.ts`
**Current:** Includes full address in metadata
**Fix:** Only include opaque identifiers
```typescript
metadata: {
  quote_id: quoteId,
  payment_type: 'deposit',
  tier: quote.selectedTier || 'unknown',
  // Remove: address, description with address
}
```

---

## Phase 5: Notification Queue System

**Priority:** HIGH - Required for email/SMS/CRM sync
**Files:** New files + integration points

### 5.1 Create Notification Queue Infrastructure
**New File:** `src/lib/notifications/queue.ts`
**Purpose:** Decouple notifications from request handlers
**Design:**
- Store pending notifications in database table
- Process asynchronously via cron or Vercel background functions
- Retry failed notifications with exponential backoff
- Support multiple notification types: email, SMS, CRM sync

### 5.2 Create Notification Types
**New File:** `src/lib/notifications/types.ts`
```typescript
type NotificationType =
  | 'quote_created'
  | 'quote_ready'
  | 'payment_received'
  | 'appointment_booked'
  | 'appointment_cancelled'
  | 'contract_signed'
  | 'refund_processed';
```

### 5.3 Create Notification Processor
**New File:** `src/lib/notifications/processor.ts`
**Purpose:** Process queued notifications
- Fetch pending notifications from database
- Route to appropriate adapter (Resend, SignalWire, JobNimbus)
- Update notification status
- Handle failures gracefully

### 5.4 Add Notification API Route
**New File:** `src/app/api/notifications/process/route.ts`
**Purpose:** Cron endpoint to process notification queue
**Security:** Require CRON_SECRET header

---

## Phase 6: External Service Integrations

**Priority:** REQUIRED - Core features depend on these
**Files:** 6 adapter files + webhook handlers

### 6.1 Implement Roofr Integration
**File:** `src/lib/integrations/adapters/roofr.ts`
**Current:** Always returns mock data
**Implement:**
- `requestMeasurement()` - POST to Roofr API
- `getMeasurement()` - GET measurement status
- `pollUntilComplete()` - Actual polling with timeout
**New File:** `src/app/api/webhooks/roofr/route.ts`
- Handle measurement completion callbacks
- Update quote with actual sqft data

### 6.2 Implement Documenso Integration
**File:** `src/lib/integrations/adapters/documenso.ts`
**Current:** Always returns mock data
**Implement:**
- `createDocument()` - POST to Documenso API with contract PDF
- `getSigningUrl()` - Get actual signing URL for recipient
- `getDocumentStatus()` - Check if signed
**Fix webhook:** `src/app/api/webhooks/documenso/route.ts`
- Download signed PDF on completion
- Store in Vercel Blob
- Update contract record

### 6.3 Implement Resend Email Integration
**File:** `src/lib/integrations/adapters/resend.ts`
**Current:** Always returns mock success
**Implement:**
- `send()` - POST to Resend API
- Add email templates in `src/lib/notifications/templates/email/`
- Implement bounce webhook handler
**Templates needed:**
- Quote ready
- Payment confirmation
- Appointment confirmation
- Contract signed
- Refund processed

### 6.4 Implement SignalWire SMS Integration
**File:** `src/lib/integrations/adapters/signalwire.ts`
**Current:** Always returns mock success
**Implement:**
- `send()` - POST to SignalWire API
- Check SMS consent before sending
- Add SMS templates in `src/lib/notifications/templates/sms/`
**Templates needed:**
- Quote ready
- Payment confirmation
- Appointment reminder
- Appointment confirmation

### 6.5 Implement Wisetack Financing Integration
**File:** `src/lib/integrations/adapters/wisetack.ts`
**Current:** Always returns mock pre-qualification
**Implement:**
- `generatePrequalLink()` - POST to Wisetack API
- `getApplicationStatus()` - Check approval status
**New File:** `src/app/api/webhooks/wisetack/route.ts`
- Handle application status updates
- Update quote with financing approval

### 6.6 Implement JobNimbus CRM Integration
**File:** `src/lib/integrations/adapters/jobnimbus.ts`
**Current:** Always returns mock success
**Implement:**
- `createContact()` - Create/update contact in CRM
- `createJob()` - Create job record
- `updateJobStatus()` - Sync status changes
- `addNote()` - Add activity notes
**Sync points:**
- Quote created → Create contact + job
- Payment received → Update job status
- Appointment booked → Add activity
- Contract signed → Update job status

---

## Testing Requirements

### Unit Tests Needed
- [ ] Admin auth helper
- [ ] Transaction wrapper
- [ ] Error response formatter
- [ ] Rate limiter
- [ ] CSRF protection
- [ ] Notification queue

### Integration Tests Needed
- [ ] Quote creation flow (lead → quote → measurement)
- [ ] Payment flow (intent → webhook → order)
- [ ] Appointment flow (book → reschedule → cancel)
- [ ] Contract flow (create → sign → complete)

### E2E Tests Needed
- [ ] Full quote-to-order journey
- [ ] Admin dashboard access
- [ ] Portal order viewing

---

## Files Summary

**New Files to Create:**
1. `src/lib/auth/admin.ts` - Shared admin verification
2. `src/db/transaction.ts` - Transaction helper
3. `src/lib/api/errors.ts` - Error response utilities
4. `src/lib/api/responses.ts` - Response formatters
5. `src/lib/api/csrf.ts` - CSRF protection
6. `src/lib/notifications/queue.ts` - Notification queue
7. `src/lib/notifications/types.ts` - Notification types
8. `src/lib/notifications/processor.ts` - Queue processor
9. `src/app/api/notifications/process/route.ts` - Cron endpoint
10. `src/app/api/webhooks/roofr/route.ts` - Roofr webhooks
11. `src/app/api/webhooks/wisetack/route.ts` - Wisetack webhooks
12. `src/lib/notifications/templates/email/*.tsx` - Email templates
13. `src/lib/notifications/templates/sms/*.ts` - SMS templates

**Files to Modify:**
1. `src/middleware.ts`
2. `src/app/api/admin/auth/route.ts`
3. `src/app/api/admin/feedback/route.ts`
4. `src/app/api/admin/notes/route.ts`
5. `src/app/api/admin/tasks/route.ts`
6. `src/app/api/admin/stats/route.ts`
7. `src/app/api/webhooks/calcom/route.ts`
8. `src/app/api/webhooks/documenso/route.ts`
9. `src/app/api/quotes/route.ts`
10. `src/app/api/contracts/route.ts`
11. `src/app/api/appointments/book/route.ts`
12. `src/app/api/payments/webhook/route.ts`
13. `src/app/api/payments/create-intent/route.ts`
14. `src/app/api/quotes/[id]/select-tier/route.ts`
15. `src/app/api/leads/out-of-area/route.ts`
16. `src/app/api/portal/orders/route.ts`
17. `src/db/schema/contracts.ts`
18. `src/db/schema/payments.ts`
19. `src/db/schema/sms-consents.ts`
20. `src/db/schema/quotes.ts`
21. `src/lib/integrations/adapters/roofr.ts`
22. `src/lib/integrations/adapters/documenso.ts`
23. `src/lib/integrations/adapters/resend.ts`
24. `src/lib/integrations/adapters/signalwire.ts`
25. `src/lib/integrations/adapters/wisetack.ts`
26. `src/lib/integrations/adapters/jobnimbus.ts`

---

## Execution Order

1. **Phase 1** - Security (4 tasks) - Do first, blocks everything
2. **Phase 2** - Database (7 tasks) - Foundation for other phases
3. **Phase 3** - API Routes (7 tasks) - Can parallelize with Phase 4
4. **Phase 4** - Payments (6 tasks) - Critical business logic
5. **Phase 5** - Notifications (4 tasks) - Required before integrations
6. **Phase 6** - Integrations (6 tasks) - Final phase, enables full functionality
