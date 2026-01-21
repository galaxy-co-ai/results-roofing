# Integration Specifications

> **Purpose:** Document all vendor/service API contracts, authentication patterns, and integration requirements.

---

## Integration Status Overview

| Integration | Provider | Status | Priority |
|-------------|----------|--------|----------|
| CRM (Primary) | JobNimbus | Placeholder | P0 - MVP |
| CRM (Secondary) | AccuLynx | Placeholder | P1 |
| CRM (Tertiary) | HubSpot/Salesforce | Placeholder | P2 |
| Measurement | Roofr (or vendor TBD) | Placeholder | P0 - MVP |
| E-Signature | Documenso (self-hosted) | Placeholder | P0 - MVP |
| Booking | Cal.com | Placeholder | P0 - MVP |
| Financing | Wisetack | Placeholder | P0 - MVP |
| Financing (Large) | Hearth | Placeholder | P1 |
| SMS | SignalWire | Placeholder | P0 - MVP |
| Email | Resend | Placeholder | P0 - MVP |
| Payments | Stripe | Placeholder | P0 - MVP |
| Address Validation | Google Places | Placeholder | P0 - MVP |
| Auth | Clerk | Placeholder | P0 - MVP |

---

## Integration Architecture Pattern

All integrations MUST follow this adapter pattern for vendor flexibility:

```typescript
// Example: Measurement Vendor Adapter
interface MeasurementAdapter {
  requestMeasurement(address: string): Promise<MeasurementJob>;
  pollStatus(jobId: string): Promise<MeasurementStatus>;
  getResults(jobId: string): Promise<MeasurementReport>;
}

// Concrete implementation
class RoofrAdapter implements MeasurementAdapter { ... }
class EagleViewAdapter implements MeasurementAdapter { ... }

// Usage via factory
const measurementService = createMeasurementAdapter(config.measurementVendor);
```

---

## CRM Integration: JobNimbus

**Status:** Placeholder - Not Yet Implemented

### API Details
- **Base URL:** `https://app.jobnimbus.com/api1`
- **Auth:** API Key (Bearer token)
- **Docs:** https://support.jobnimbus.com/how-do-i-create-an-integration-using-jobnimbuss-open-api

### Required Operations
| Operation | Endpoint | Purpose |
|-----------|----------|---------|
| Create Contact | POST /contacts | New lead from address capture |
| Create Job | POST /jobs | Quote/project creation |
| Update Job | PUT /jobs/{id} | Status changes (signed, scheduled, etc.) |
| Get Job | GET /jobs/{id} | Sync status to portal |
| Webhook | Inbound | CRM state changes |

### Data Mapping
```typescript
// Lead submission → JobNimbus Contact
interface LeadToContact {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  source: string; // "Website - Instant Quote"
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}
```

---

## Measurement Integration: Roofr

**Status:** Placeholder - Not Yet Implemented

### API Details
- **Website:** https://roofr.com/measurements
- **Pricing:** $3.50-$10 per report
- **Turnaround:** Typically 24-48 hours

### Required Operations
| Operation | Purpose |
|-----------|---------|
| Submit Address | Request new measurement report |
| Poll Status | Check if report is ready |
| Get Report | Retrieve measurement data |
| Webhook | Notification when report complete |

### Abstraction Layer
```typescript
interface MeasurementReport {
  id: string;
  address: string;
  sqft_total: number;
  facets: Facet[];
  pitch_primary: number; // degrees
  complexity: 'simple' | 'moderate' | 'complex';
  vendor: string;
  raw_data_uri?: string; // Store vendor response
  created_at: Date;
}
```

---

## E-Signature Integration: Documenso

**Status:** Placeholder - Not Yet Implemented

### Deployment
- **Type:** Self-hosted (Docker)
- **Stack:** TypeScript, Next.js, PostgreSQL
- **Repo:** https://github.com/documenso/documenso

### Required Operations
| Operation | Purpose |
|-----------|---------|
| Create Document | Upload contract PDF |
| Add Recipients | Customer + company signer |
| Send for Signature | Trigger email to customer |
| Webhook: Completed | Update agreement status |
| Get Signed Document | Download for storage |

### Template Fields
```typescript
interface ContractTemplate {
  quote_id: string;
  customer_name: string;
  customer_email: string;
  property_address: string;
  package_selected: 'good' | 'better' | 'best';
  total_price: number;
  deposit_amount: number;
  estimated_start_date: string;
  warranty_terms: string;
}
```

---

## Booking Integration: Cal.com

**Status:** Placeholder - Not Yet Implemented

### Deployment Options
- **Hosted:** Free tier at cal.com
- **Self-hosted:** Docker deployment for white-label

### API Details
- **Docs:** https://cal.com/docs/api
- **Webhooks:** booking.created, booking.cancelled, booking.rescheduled

### Required Operations
| Operation | Purpose |
|-----------|---------|
| Get Availability | Show available slots in checkout |
| Hold Slot | Reserve during checkout flow |
| Confirm Booking | Finalize after payment |
| Cancel Hold | Release if checkout abandoned |
| Webhook | Sync to CRM |

---

## Financing Integration: Wisetack

**Status:** Placeholder - Not Yet Implemented

### API Details
- **Website:** https://www.wisetack.com/
- **Integration:** Embeddable pre-qual widget
- **Go-live:** ~3 weeks

### Required Operations
| Operation | Purpose |
|-----------|---------|
| Generate Prequal Link | Embed in checkout |
| Webhook: Prequal Complete | Update lead status |
| Webhook: Loan Funded | Trigger fulfillment |

### Customer Flow
1. Customer selects financing option
2. Redirect to Wisetack pre-qual (soft pull)
3. Receive approval/terms in <60 seconds
4. Return to checkout with financing token
5. Complete signature and deposit

---

## SMS Integration: SignalWire

**Status:** Placeholder - Not Yet Implemented

### API Details
- **SDK:** `@signalwire/node`
- **Docs:** https://developer.signalwire.com/

### Required Operations
| Operation | Purpose |
|-----------|---------|
| Send SMS | Transactional messages |
| Receive SMS | Inbound handling |
| Handle STOP | Automatic opt-out (network-level) |
| Handle HELP | Must implement ourselves |

### TCPA Consent Tracking (Custom Build Required)
```typescript
interface ConsentRecord {
  phone: string;
  consented_at: Date;
  consent_method: 'web_form' | 'sms_reply';
  consent_text: string; // Exact checkbox text shown
  ip_address: string;
  user_agent: string;
  opted_out_at?: Date;
}
```

---

## Email Integration: Resend

**Status:** Placeholder - Not Yet Implemented

### API Details
- **SDK:** `resend`
- **Docs:** https://resend.com/docs

### Required Templates
| Template | Trigger |
|----------|---------|
| Quote Ready | After pricing calculated |
| Signature Request | E-sign reminder |
| Payment Confirmation | Deposit received |
| Booking Confirmation | Appointment scheduled |
| Status Update | Job milestones |

---

## Payments Integration: Stripe

**Status:** Placeholder - Not Yet Implemented

### Required Operations
| Operation | Purpose |
|-----------|---------|
| Create Payment Intent | Deposit capture |
| Confirm Payment | Process deposit |
| Create Customer | Store payment method |
| Webhook: payment_intent.succeeded | Update records |
| Webhook: charge.refunded | Handle refunds |

---

## Auth Integration: Clerk

**Status:** Placeholder - Not Yet Implemented

### Configuration
- **Use Cases:** Customer portal access, admin dashboard
- **Features:** Email/password, magic link, OAuth (Google)

### Protected Routes
| Route Pattern | Access |
|---------------|--------|
| `/portal/*` | Authenticated customers |
| `/admin/*` | Internal staff only |
| `/api/admin/*` | Admin API routes |

---

## Webhook Security

All inbound webhooks MUST:
1. Verify signature/HMAC from vendor
2. Log full payload for debugging
3. Return 200 immediately, process async
4. Implement idempotency (dedupe by event ID)
5. Have retry handling

```typescript
// Example webhook handler pattern
export async function POST(req: Request) {
  const signature = req.headers.get('x-webhook-signature');
  const payload = await req.text();

  if (!verifySignature(payload, signature, WEBHOOK_SECRET)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(payload);

  // Idempotency check
  if (await eventAlreadyProcessed(event.id)) {
    return new Response('OK', { status: 200 });
  }

  // Queue for async processing
  await queueWebhookEvent(event);

  return new Response('OK', { status: 200 });
}
```

---

## Environment Variables Required

```env
# CRM
JOBNIMBUS_API_KEY=
ACCULYNX_API_KEY=
HUBSPOT_API_KEY=

# Measurement
ROOFR_API_KEY=

# Booking
CALCOM_API_KEY=

# Financing
WISETACK_MERCHANT_ID=
WISETACK_API_KEY=

# SMS
SIGNALWIRE_PROJECT_ID=
SIGNALWIRE_API_TOKEN=
SIGNALWIRE_SPACE_URL=

# Email
RESEND_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Address
GOOGLE_PLACES_API_KEY=
```

