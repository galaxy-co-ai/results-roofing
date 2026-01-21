# 09 - API Contracts

<!-- AI: This document defines all API interfaces for the Results Roofing website overhaul, including REST endpoints, Server Actions, and webhook contracts. -->

## API Architecture Overview

### API Landscape

| Boundary | Type | Protocol | Direction |
|----------|------|----------|-----------|
| Google Places | External | REST | Consume |
| Roofr Measurement | External | REST + Webhook | Bidirectional |
| JobNimbus CRM | External | REST | Consume |
| Wisetack Financing | External | Embed + Webhook | Bidirectional |
| Cal.com Booking | External | REST + Webhook | Bidirectional |
| Documenso E-Sign | External | REST + Webhook | Bidirectional |
| Stripe Payments | External | REST + Webhook | Bidirectional |
| SignalWire SMS | External | REST + Webhook | Bidirectional |
| Resend Email | External | REST + Webhook | Bidirectional |
| Clerk Auth | External | SDK + Webhook | Bidirectional |
| Results API | Exposed | REST | Expose |
| Server Actions | Internal | RPC (Next.js) | Internal |
| Webhook Handlers | Exposed | REST | Receive |

### Communication Protocols

**REST (HTTP/JSON)** - Primary protocol for:
- All external API consumption
- Exposed API endpoints for client consumption
- Webhook endpoints for receiving external events

**Server Actions (Next.js RPC)** - For:
- Form submissions requiring validation
- Mutations with redirect/revalidation
- Actions requiring server-side auth context

### API Design Principles

1. **RESTful conventions**: Resource-based URLs, standard HTTP methods
2. **JSON:API inspired responses**: Consistent structure with `data`, `error`, `meta`
3. **TypeScript-first**: All contracts defined as TypeScript interfaces
4. **Zod validation**: Runtime validation for all inputs
5. **Adapter pattern**: External APIs abstracted behind interfaces (per INTEGRATION-SPECS.md)

---

## External APIs Consumed

> Note: Detailed integration specifications are in [INTEGRATION-SPECS.md](./INTEGRATION-SPECS.md). This section summarizes the primary endpoints used.

### API: Google Places

**Purpose**: Address autocomplete and geocoding for service area validation (F01)

**Base URL**: `https://maps.googleapis.com/maps/api`

**Documentation**: https://developers.google.com/maps/documentation/places/web-service

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| API Key | Query param | `key={API_KEY}` |

**Environment Variables**:
```
GOOGLE_PLACES_API_KEY=Google Maps API key with Places API enabled
```

#### Endpoint: Place Autocomplete

**Request**:
```
GET /place/autocomplete/json
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| input | string | Yes | User's search text |
| types | string | No | `address` for street addresses |
| components | string | No | `country:us` to restrict to US |
| sessiontoken | string | Yes | Session token for billing optimization |
| key | string | Yes | API key |

**Response**:
```json
{
  "predictions": [
    {
      "place_id": "string - unique identifier",
      "description": "string - formatted address",
      "structured_formatting": {
        "main_text": "string - street address",
        "secondary_text": "string - city, state"
      }
    }
  ],
  "status": "OK | ZERO_RESULTS | INVALID_REQUEST"
}
```

**Rate Limits**:
- Limit: 17,000 requests/day (free tier)
- Our approach: Debounce requests (300ms), session tokens for billing

#### Endpoint: Place Details

**Request**:
```
GET /place/details/json
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| place_id | string | Yes | From autocomplete response |
| fields | string | Yes | `formatted_address,geometry,address_components` |
| sessiontoken | string | Yes | Same as autocomplete session |
| key | string | Yes | API key |

**Response**:
```json
{
  "result": {
    "formatted_address": "string",
    "geometry": {
      "location": { "lat": "number", "lng": "number" }
    },
    "address_components": [
      {
        "long_name": "string",
        "short_name": "string",
        "types": ["string"]
      }
    ]
  },
  "status": "OK | NOT_FOUND | INVALID_REQUEST"
}
```

---

### API: Roofr Measurement

**Purpose**: Professional roof measurements for accurate pricing (F03)

**Base URL**: TBD (pending Roofr API access)

**Documentation**: https://roofr.com/api-docs (pending)

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| API Key | Header | `Authorization: Bearer {API_KEY}` |

**Environment Variables**:
```
ROOFR_API_KEY=Roofr API key
ROOFR_WEBHOOK_SECRET=Webhook signature secret
```

#### Endpoint: Request Measurement

**Request**:
```
POST /measurements
```

**Request Body**:
```json
{
  "address": "string - full street address",
  "city": "string",
  "state": "string - 2 letter code",
  "zip": "string - 5 digit",
  "callback_url": "string - our webhook URL",
  "metadata": {
    "quote_id": "string - our quote UUID"
  }
}
```

**Response** (202 Accepted):
```json
{
  "job_id": "string - Roofr job identifier",
  "status": "pending",
  "estimated_completion": "ISO 8601 datetime"
}
```

**Error Codes**:
| Code | Meaning | Our Handling |
|------|---------|--------------|
| 400 | Invalid address | Show error, allow manual entry |
| 402 | Payment required | Alert ops, fallback to manual |
| 429 | Rate limited | Queue and retry with backoff |
| 503 | Service unavailable | Queue and retry |

#### Endpoint: Get Measurement Report

**Request**:
```
GET /measurements/{job_id}
```

**Response** (200 OK):
```json
{
  "job_id": "string",
  "status": "complete | processing | failed",
  "report": {
    "sqft_total": "number",
    "sqft_steep": "number",
    "sqft_flat": "number",
    "pitch_primary": "number - degrees",
    "pitch_min": "number",
    "pitch_max": "number",
    "facet_count": "number",
    "ridge_length_ft": "number",
    "valley_length_ft": "number",
    "eave_length_ft": "number",
    "complexity": "simple | moderate | complex"
  },
  "completed_at": "ISO 8601 datetime"
}
```

---

### API: Stripe

**Purpose**: Payment processing for deposits and balance payments (F09, F15)

**Base URL**: `https://api.stripe.com/v1`

**Documentation**: https://stripe.com/docs/api

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| API Key | Header | `Authorization: Bearer {SECRET_KEY}` |

**Environment Variables**:
```
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Endpoint: Create Payment Intent

**Request**:
```
POST /payment_intents
```

**Request Body**:
```json
{
  "amount": "integer - cents",
  "currency": "usd",
  "customer": "string - optional Stripe customer ID",
  "metadata": {
    "quote_id": "string",
    "order_id": "string",
    "payment_type": "deposit | balance"
  },
  "automatic_payment_methods": {
    "enabled": true
  }
}
```

**Response** (200 OK):
```json
{
  "id": "pi_...",
  "client_secret": "string - for frontend",
  "status": "requires_payment_method | requires_confirmation | succeeded",
  "amount": "integer",
  "currency": "string"
}
```

#### Endpoint: Create Customer

**Request**:
```
POST /customers
```

**Request Body**:
```json
{
  "email": "string",
  "name": "string",
  "metadata": {
    "lead_id": "string",
    "quote_id": "string"
  }
}
```

**Response** (200 OK):
```json
{
  "id": "cus_...",
  "email": "string",
  "name": "string"
}
```

---

### API: Cal.com

**Purpose**: Appointment scheduling for inspections and installations (F07, F14)

**Base URL**: `https://api.cal.com/v1` (or self-hosted URL)

**Documentation**: https://cal.com/docs/api

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| API Key | Header | `Authorization: Bearer {API_KEY}` |

**Environment Variables**:
```
CALCOM_API_KEY=Cal.com API key
CALCOM_EVENT_TYPE_ID=Event type for roof inspections
CALCOM_WEBHOOK_SECRET=Webhook signature secret
```

#### Endpoint: Get Availability

**Request**:
```
GET /availability
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| eventTypeId | integer | Yes | Event type ID |
| dateFrom | string | Yes | Start date (YYYY-MM-DD) |
| dateTo | string | Yes | End date (YYYY-MM-DD) |
| timeZone | string | Yes | IANA timezone |

**Response** (200 OK):
```json
{
  "slots": {
    "2026-02-01": [
      { "time": "09:00", "attendees": 0 },
      { "time": "13:00", "attendees": 0 }
    ]
  }
}
```

#### Endpoint: Create Booking

**Request**:
```
POST /bookings
```

**Request Body**:
```json
{
  "eventTypeId": "integer",
  "start": "ISO 8601 datetime",
  "end": "ISO 8601 datetime",
  "name": "string - customer name",
  "email": "string - customer email",
  "timeZone": "string - IANA timezone",
  "metadata": {
    "quote_id": "string",
    "order_id": "string"
  }
}
```

**Response** (201 Created):
```json
{
  "id": "integer",
  "uid": "string - unique booking ID",
  "title": "string",
  "startTime": "ISO 8601",
  "endTime": "ISO 8601",
  "status": "ACCEPTED | PENDING"
}
```

---

### API: Documenso

**Purpose**: E-signature for roofing contracts (F08)

**Base URL**: Self-hosted instance URL (e.g., `https://sign.resultsroofing.com/api/v1`)

**Documentation**: https://documenso.com/docs/api

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| API Key | Header | `Authorization: Bearer {API_KEY}` |

**Environment Variables**:
```
DOCUMENSO_API_URL=Self-hosted Documenso URL
DOCUMENSO_API_KEY=API key
DOCUMENSO_WEBHOOK_SECRET=Webhook signature secret
```

#### Endpoint: Create Document

**Request**:
```
POST /documents
```

**Request Body** (multipart/form-data):
```json
{
  "title": "string - document title",
  "file": "binary - PDF file",
  "recipients": [
    {
      "email": "string",
      "name": "string",
      "role": "SIGNER | CC"
    }
  ],
  "meta": {
    "quote_id": "string",
    "template_version": "string"
  }
}
```

**Response** (201 Created):
```json
{
  "id": "integer",
  "documentId": "string - UUID",
  "status": "DRAFT | PENDING | COMPLETED",
  "recipients": [
    {
      "id": "integer",
      "email": "string",
      "signingUrl": "string - direct signing link"
    }
  ]
}
```

#### Endpoint: Send Document for Signing

**Request**:
```
POST /documents/{documentId}/send
```

**Response** (200 OK):
```json
{
  "id": "string",
  "status": "PENDING"
}
```

#### Endpoint: Get Signed Document

**Request**:
```
GET /documents/{documentId}/download
```

**Response**: Binary PDF file

---

### API: Wisetack

**Purpose**: Financing pre-qualification (F06)

**Base URL**: `https://api.wisetack.com/v1`

**Documentation**: https://docs.wisetack.com (partner access)

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| API Key | Header | `Authorization: Bearer {API_KEY}` |

**Environment Variables**:
```
WISETACK_MERCHANT_ID=Merchant identifier
WISETACK_API_KEY=API key
WISETACK_WEBHOOK_SECRET=Webhook signature secret
```

#### Endpoint: Create Pre-qualification Link

**Request**:
```
POST /merchants/{merchantId}/prequal
```

**Request Body**:
```json
{
  "amount": "number - loan amount in dollars",
  "customer": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string"
  },
  "transactionPurpose": "home_improvement",
  "metadata": {
    "quote_id": "string"
  },
  "redirectUrl": "string - return URL after prequal"
}
```

**Response** (201 Created):
```json
{
  "applicationId": "string",
  "prequalUrl": "string - URL to embed or redirect",
  "expiresAt": "ISO 8601 datetime"
}
```

---

### API: SignalWire

**Purpose**: SMS notifications with TCPA compliance (F10, F26)

**Base URL**: `https://{space}.signalwire.com/api/laml/2010-04-01`

**Documentation**: https://developer.signalwire.com/

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| Basic Auth | Header | `Authorization: Basic {base64(project_id:api_token)}` |

**Environment Variables**:
```
SIGNALWIRE_PROJECT_ID=Project identifier
SIGNALWIRE_API_TOKEN=API token
SIGNALWIRE_SPACE_URL=Space URL (e.g., your-space.signalwire.com)
SIGNALWIRE_PHONE_NUMBER=+1XXXXXXXXXX
```

#### Endpoint: Send SMS

**Request**:
```
POST /Accounts/{ProjectId}/Messages.json
```

**Request Body** (application/x-www-form-urlencoded):
```
From=+1XXXXXXXXXX
To=+1YYYYYYYYYY
Body=Your message text here
StatusCallback=https://api.resultsroofing.com/webhooks/signalwire
```

**Response** (201 Created):
```json
{
  "sid": "string - message SID",
  "status": "queued | sent | delivered | failed",
  "to": "string",
  "from": "string",
  "body": "string"
}
```

---

### API: Resend

**Purpose**: Transactional email (F10, confirmation, notifications)

**Base URL**: `https://api.resend.com`

**Documentation**: https://resend.com/docs/api-reference

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| API Key | Header | `Authorization: Bearer {API_KEY}` |

**Environment Variables**:
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@resultsroofing.com
```

#### Endpoint: Send Email

**Request**:
```
POST /emails
```

**Request Body**:
```json
{
  "from": "Results Roofing <noreply@resultsroofing.com>",
  "to": ["string - recipient email"],
  "subject": "string",
  "html": "string - HTML content",
  "text": "string - plain text fallback",
  "attachments": [
    {
      "filename": "string",
      "content": "string - base64 encoded"
    }
  ],
  "tags": [
    { "name": "category", "value": "confirmation" }
  ]
}
```

**Response** (200 OK):
```json
{
  "id": "string - message ID"
}
```

---

### API: JobNimbus

**Purpose**: CRM synchronization (F22-F25)

**Base URL**: `https://app.jobnimbus.com/api1`

**Documentation**: https://support.jobnimbus.com/how-do-i-create-an-integration-using-jobnimbuss-open-api

**Authentication**:
| Method | Location | Format |
|--------|----------|--------|
| API Key | Header | `Authorization: Bearer {API_KEY}` |

**Environment Variables**:
```
JOBNIMBUS_API_KEY=API key
```

#### Endpoint: Create Contact

**Request**:
```
POST /contacts
```

**Request Body**:
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "home_phone": "string",
  "mobile_phone": "string",
  "address_line1": "string",
  "city": "string",
  "state_text": "string",
  "zip": "string",
  "source_name": "Website - Instant Quote",
  "tags": ["online-quote", "self-pay"]
}
```

**Response** (201 Created):
```json
{
  "jnid": "string - JobNimbus contact ID",
  "first_name": "string",
  "last_name": "string"
}
```

#### Endpoint: Create Job

**Request**:
```
POST /jobs
```

**Request Body**:
```json
{
  "primary": "string - contact jnid",
  "name": "string - job name",
  "status_name": "Lead",
  "address_line1": "string",
  "city": "string",
  "state_text": "string",
  "zip": "string",
  "description": "string - quote details"
}
```

**Response** (201 Created):
```json
{
  "jnid": "string - JobNimbus job ID",
  "name": "string",
  "status_name": "string"
}
```

#### Endpoint: Update Job

**Request**:
```
PUT /jobs/{jnid}
```

**Request Body**:
```json
{
  "status_name": "Signed | Scheduled | In Progress | Complete",
  "description": "string - updated notes"
}
```

---

## APIs Exposed

### API Design Decisions

**Protocol**: REST (Next.js API Routes)

**Rationale**:
- Wide client support
- Easy caching with Next.js
- Standard patterns well-understood
- Server Actions for mutations needing redirects

**Conventions**:
- Naming: `snake_case` for JSON fields, `camelCase` for TypeScript
- Versioning: Not versioned initially (MVP); will add `/api/v1/` when needed
- Pagination: Cursor-based for lists
- Filtering: Query parameters

### Base Configuration

**Base URL**: `https://resultsroofing.com/api`

**Content Type**: `application/json`

### Authentication

**Method**: Clerk JWT (for authenticated routes)

**Flow**:
1. Client includes Clerk session token in requests
2. Middleware validates token via Clerk SDK
3. User ID extracted and attached to request context
4. API handler checks authorization

**Public Routes** (no auth required):
- `POST /api/quotes` - Create quote
- `GET /api/quotes/{id}` - Get quote by ID
- `GET /api/quotes/share/{token}` - Get shared quote
- `POST /api/leads` - Submit lead
- `GET /api/pricing-tiers` - Get pricing options
- All webhook endpoints

**Protected Routes** (auth required):
- `GET /api/portal/orders` - User's orders
- `GET /api/portal/orders/{id}` - Specific order
- `POST /api/portal/orders/{id}/payments` - Pay balance

### Standard Response Format

**Success Response**:
```typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string; // ISO 8601
    requestId: string;
  };
}
```

**Example**:
```json
{
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "status": "preliminary"
  },
  "meta": {
    "timestamp": "2026-01-21T14:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Error Response**:
```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // Field-level errors
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

**Example**:
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request data",
    "details": {
      "email": ["Invalid email format"],
      "state": ["Must be TX, GA, NC, or AZ"]
    }
  },
  "meta": {
    "timestamp": "2026-01-21T14:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Standard Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `validation_error` | Request validation failed |
| 401 | `unauthorized` | Authentication required |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Resource conflict (duplicate, version mismatch) |
| 422 | `unprocessable` | Business logic validation failed |
| 429 | `rate_limited` | Too many requests |
| 500 | `internal_error` | Unexpected server error |
| 503 | `service_unavailable` | Upstream service unavailable |

---

## REST API Endpoints

### Resource: Quotes

#### Create Quote

**Endpoint**: `POST /api/quotes`

**Description**: Creates a new quote from a validated address. Triggers lead creation, preliminary pricing calculation, and CRM sync.

**Authentication**: None (public)

**Request Body**:
```typescript
interface CreateQuoteRequest {
  address: {
    formatted: string;      // Full formatted address
    street: string;         // Street address
    city: string;
    state: 'TX' | 'GA' | 'NC' | 'AZ';
    zip: string;
    lat: number;
    lng: number;
    placeId: string;        // Google Places ID
  };
  replacementMotivation?: 'pre_sale_prep' | 'roof_age' | 'carrier_requirement' | 'curb_appeal' | 'energy_efficiency' | 'other';
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}
```

**Response** (201 Created):
```typescript
interface CreateQuoteResponse {
  data: {
    id: string;                    // UUID
    status: 'preliminary';
    address: string;
    city: string;
    state: string;
    zip: string;
    replacementMotivation: string | null;
    pricingData: {
      good: TierPricing;
      better: TierPricing;
      best: TierPricing;
    };
    expiresAt: string;            // ISO 8601
    createdAt: string;
  };
}

interface TierPricing {
  total: number;
  materials: number;
  labor: number;
  permits: number;
  disposal: number;
  monthlyEstimate: number;        // Estimated monthly if financed
}
```

**Error Responses**:
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `validation_error` | Invalid address format |
| 422 | `out_of_service_area` | Address outside TX/GA/NC/AZ |

---

#### Get Quote

**Endpoint**: `GET /api/quotes/{id}`

**Description**: Retrieves a quote by ID with full pricing and measurement data.

**Authentication**: None (public, but quote ID is unguessable)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Quote identifier |

**Response** (200 OK):
```typescript
interface GetQuoteResponse {
  data: {
    id: string;
    leadId: string | null;
    status: QuoteStatus;
    address: string;
    city: string;
    state: string;
    zip: string;
    replacementMotivation: string | null;

    // Measurement data (when available)
    measurement: {
      sqftTotal: number;
      pitchPrimary: number;
      complexity: 'simple' | 'moderate' | 'complex';
      facetCount: number;
      status: 'pending' | 'complete' | 'failed';
    } | null;

    // Pricing for all tiers
    pricingData: {
      good: TierPricing;
      better: TierPricing;
      best: TierPricing;
    };

    // Selection state
    selectedTier: 'good' | 'better' | 'best' | null;
    tierSelectedAt: string | null;

    // Financing state
    financingStatus: 'pending' | 'approved' | 'declined' | null;
    financingMonthlyPayment: number | null;

    // Scheduling state
    scheduledDate: string | null;
    scheduledSlotId: string | null;

    // Totals
    totalPrice: number | null;
    depositAmount: number | null;

    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  };
}

type QuoteStatus =
  | 'preliminary'
  | 'measuring'
  | 'final'
  | 'selected'
  | 'signed'
  | 'paid'
  | 'expired';
```

**Error Responses**:
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `not_found` | Quote doesn't exist |
| 410 | `expired` | Quote has expired |

---

#### Update Quote

**Endpoint**: `PATCH /api/quotes/{id}`

**Description**: Updates quote fields (package selection, contact info, etc.)

**Authentication**: None (quote ID is auth)

**Request Body**:
```typescript
interface UpdateQuoteRequest {
  selectedTier?: 'good' | 'better' | 'best';
  replacementMotivation?: 'pre_sale_prep' | 'roof_age' | 'carrier_requirement' | 'curb_appeal' | 'energy_efficiency' | 'other';
  contact?: {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
}
```

**Response** (200 OK): Same as Get Quote

---

#### Get Quote Line Items

**Endpoint**: `GET /api/quotes/{id}/line-items`

**Description**: Gets itemized pricing breakdown for a quote (F20)

**Response** (200 OK):
```typescript
interface LineItemsResponse {
  data: {
    quoteId: string;
    items: {
      good: LineItem[];
      better: LineItem[];
      best: LineItem[];
    };
  };
}

interface LineItem {
  id: string;
  category: 'materials' | 'labor' | 'permits' | 'disposal' | 'warranty' | 'other';
  name: string;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  amount: number;
  sortOrder: number;
}
```

---

#### Request Measurement

**Endpoint**: `POST /api/quotes/{id}/measurements`

**Description**: Requests detailed roof measurement from Roofr (F03)

**Authentication**: None

**Response** (202 Accepted):
```typescript
interface MeasurementRequestResponse {
  data: {
    measurementId: string;
    quoteId: string;
    status: 'pending';
    estimatedCompletion: string;  // ISO 8601
  };
}
```

---

#### Create Share Link

**Endpoint**: `POST /api/quotes/{id}/share`

**Description**: Creates a shareable link for the quote (F21)

**Authentication**: None

**Response** (201 Created):
```typescript
interface ShareLinkResponse {
  data: {
    shareId: string;
    token: string;
    url: string;                  // Full shareable URL
    expiresAt: string;            // ISO 8601, 30 days
  };
}
```

---

#### Get Shared Quote

**Endpoint**: `GET /api/quotes/share/{token}`

**Description**: Retrieves quote via share token (public, read-only view)

**Response** (200 OK):
```typescript
interface SharedQuoteResponse {
  data: {
    id: string;
    address: string;
    city: string;
    state: string;
    pricingData: {
      good: TierPricing;
      better: TierPricing;
      best: TierPricing;
    };
    selectedTier: string | null;
    totalPrice: number | null;
    expiresAt: string;
    // Note: No personal info (email, phone) exposed
  };
}
```

**Error Responses**:
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `not_found` | Invalid token |
| 410 | `expired` | Share link expired |

---

#### Upload Photo

**Endpoint**: `POST /api/quotes/{id}/photos`

**Description**: Uploads property photo for quote documentation (F18)

**Authentication**: None

**Content-Type**: `multipart/form-data`

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Image file (jpg, png, heic) |
| description | string | No | Photo description |

**Response** (201 Created):
```typescript
interface PhotoUploadResponse {
  data: {
    id: string;
    quoteId: string;
    fileUrl: string;
    thumbnailUrl: string | null;
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    createdAt: string;
  };
}
```

**Error Responses**:
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `invalid_file_type` | Not an image |
| 413 | `file_too_large` | Exceeds 10MB |
| 422 | `max_photos_reached` | Already has 5 photos |

---

### Resource: Leads

#### Submit Lead

**Endpoint**: `POST /api/leads`

**Description**: Captures lead contact information (can be called before or after quote)

**Authentication**: None

**Request Body**:
```typescript
interface SubmitLeadRequest {
  quoteId?: string;               // Link to existing quote
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  smsConsent?: boolean;           // TCPA consent
}
```

**Response** (201 Created):
```typescript
interface SubmitLeadResponse {
  data: {
    id: string;
    email: string;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    quoteId: string | null;
    createdAt: string;
  };
}
```

---

#### Submit Out-of-Area Lead

**Endpoint**: `POST /api/leads/out-of-area`

**Description**: Captures leads from outside service area for future expansion

**Request Body**:
```typescript
interface OutOfAreaLeadRequest {
  email: string;
  zip: string;
  city?: string;
  state?: string;
  address?: string;
}
```

**Response** (201 Created):
```typescript
interface OutOfAreaLeadResponse {
  data: {
    id: string;
    email: string;
    zip: string;
    createdAt: string;
  };
}
```

---

### Resource: Financing

#### Create Pre-qualification

**Endpoint**: `POST /api/financing/prequal`

**Description**: Initiates Wisetack financing pre-qualification (F06)

**Authentication**: None

**Request Body**:
```typescript
interface PrequalRequest {
  quoteId: string;
  amount: number;                 // Total project amount
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}
```

**Response** (201 Created):
```typescript
interface PrequalResponse {
  data: {
    applicationId: string;
    quoteId: string;
    prequalUrl: string;           // URL to embed or redirect
    expiresAt: string;
  };
}
```

---

#### Get Financing Status

**Endpoint**: `GET /api/financing/{applicationId}`

**Description**: Gets current financing application status

**Response** (200 OK):
```typescript
interface FinancingStatusResponse {
  data: {
    applicationId: string;
    quoteId: string;
    status: 'pending' | 'approved' | 'partial' | 'declined' | 'expired';
    approvedAmount: number | null;
    availableTerms: FinancingTerm[] | null;
    selectedTermMonths: number | null;
    monthlyPayment: number | null;
    apr: number | null;
    expiresAt: string | null;
  };
}

interface FinancingTerm {
  months: number;
  monthlyPayment: number;
  apr: number;
  totalCost: number;
}
```

---

### Resource: Appointments

#### Get Availability

**Endpoint**: `GET /api/appointments/availability`

**Description**: Gets available appointment slots (F07)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |
| timeZone | string | No | IANA timezone (default: America/Chicago) |

**Response** (200 OK):
```typescript
interface AvailabilityResponse {
  data: {
    slots: {
      [date: string]: AvailableSlot[];
    };
  };
}

interface AvailableSlot {
  id: string;
  date: string;                   // YYYY-MM-DD
  startTime: string;              // HH:mm
  endTime: string;
  label: string;                  // "Morning 8am-12pm"
  available: boolean;
}
```

---

#### Hold Slot

**Endpoint**: `POST /api/appointments/hold`

**Description**: Temporarily holds a slot during checkout (15 min)

**Request Body**:
```typescript
interface HoldSlotRequest {
  quoteId: string;
  slotId: string;
  date: string;                   // YYYY-MM-DD
  startTime: string;              // HH:mm
}
```

**Response** (201 Created):
```typescript
interface HoldSlotResponse {
  data: {
    holdId: string;
    quoteId: string;
    slotId: string;
    expiresAt: string;            // ISO 8601, 15 min from now
  };
}
```

---

#### Confirm Booking

**Endpoint**: `POST /api/appointments`

**Description**: Confirms appointment after payment (called internally after payment succeeds)

**Request Body**:
```typescript
interface ConfirmBookingRequest {
  orderId: string;
  holdId: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}
```

**Response** (201 Created):
```typescript
interface ConfirmBookingResponse {
  data: {
    id: string;
    orderId: string;
    calcomBookingId: string;
    appointmentType: 'inspection';
    scheduledStart: string;
    scheduledEnd: string;
    timeZone: string;
    status: 'confirmed';
  };
}
```

---

### Resource: Contracts

#### Generate Contract

**Endpoint**: `POST /api/contracts`

**Description**: Generates contract document for e-signature (F08)

**Request Body**:
```typescript
interface GenerateContractRequest {
  quoteId: string;
  customerEmail: string;
}
```

**Response** (201 Created):
```typescript
interface GenerateContractResponse {
  data: {
    id: string;
    quoteId: string;
    documensoDocumentId: string;
    status: 'pending';
    signingUrl: string;           // Direct signing link
    sentAt: string;
  };
}
```

---

#### Get Contract Status

**Endpoint**: `GET /api/contracts/{id}`

**Description**: Gets contract signing status

**Response** (200 OK):
```typescript
interface ContractStatusResponse {
  data: {
    id: string;
    quoteId: string;
    status: 'pending' | 'sent' | 'viewed' | 'signed' | 'expired' | 'declined';
    customerEmail: string;
    sentAt: string | null;
    viewedAt: string | null;
    signedAt: string | null;
    signedPdfUrl: string | null;
  };
}
```

---

### Resource: Payments

#### Create Payment Intent

**Endpoint**: `POST /api/payments`

**Description**: Creates Stripe payment intent for deposit (F09)

**Request Body**:
```typescript
interface CreatePaymentRequest {
  quoteId: string;
  orderId?: string;               // For balance payments
  paymentType: 'deposit' | 'balance' | 'partial';
  amount?: number;                // Required for partial, auto-calculated otherwise
}
```

**Response** (201 Created):
```typescript
interface CreatePaymentResponse {
  data: {
    paymentId: string;
    stripePaymentIntentId: string;
    clientSecret: string;         // For Stripe Elements
    amount: number;
    currency: 'usd';
  };
}
```

---

#### Get Payment Status

**Endpoint**: `GET /api/payments/{id}`

**Description**: Gets payment status

**Response** (200 OK):
```typescript
interface PaymentStatusResponse {
  data: {
    id: string;
    orderId: string;
    stripePaymentIntentId: string;
    paymentType: 'deposit' | 'balance' | 'partial';
    amount: number;
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
    receiptUrl: string | null;
    completedAt: string | null;
  };
}
```

---

### Resource: Pricing

#### Get Pricing Tiers

**Endpoint**: `GET /api/pricing-tiers`

**Description**: Gets available package tier definitions (F28)

**Authentication**: None (public)

**Response** (200 OK):
```typescript
interface PricingTiersResponse {
  data: {
    tiers: PricingTier[];
  };
}

interface PricingTier {
  id: string;
  tier: 'good' | 'better' | 'best';
  name: string;
  tagline: string | null;
  shingleType: string;
  shingleBrand: string | null;
  warrantyYears: number;
  manufacturerWarrantyYears: number | null;
  description: string | null;
  features: string[];
  isRecommended: boolean;
  sortOrder: number;
}
```

---

### Resource: Portal (Authenticated)

All portal endpoints require Clerk authentication.

#### Get My Orders

**Endpoint**: `GET /api/portal/orders`

**Description**: Gets authenticated user's orders (F11-F13)

**Authentication**: Required (Clerk)

**Response** (200 OK):
```typescript
interface MyOrdersResponse {
  data: {
    orders: PortalOrder[];
  };
}

interface PortalOrder {
  id: string;
  confirmationNumber: string;
  status: OrderStatus;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  selectedTier: 'good' | 'better' | 'best';
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  isFinanced: boolean;
  createdAt: string;
}

type OrderStatus =
  | 'pending'
  | 'signed'
  | 'materials_ordered'
  | 'crew_scheduled'
  | 'in_progress'
  | 'complete'
  | 'cancelled';
```

---

#### Get Order Details

**Endpoint**: `GET /api/portal/orders/{id}`

**Description**: Gets detailed order information including timeline (F13)

**Authentication**: Required (Clerk)

**Response** (200 OK):
```typescript
interface OrderDetailsResponse {
  data: {
    id: string;
    confirmationNumber: string;
    status: OrderStatus;

    // Property
    propertyAddress: string;
    propertyCity: string;
    propertyState: string;
    propertyZip: string;

    // Package
    selectedTier: string;
    totalAmount: number;
    depositAmount: number;
    balanceAmount: number;
    isFinanced: boolean;
    financingProvider: string | null;

    // Documents
    quoteId: string;
    contractId: string;
    signedPdfUrl: string | null;

    // Appointment
    appointment: {
      id: string;
      scheduledStart: string;
      scheduledEnd: string;
      status: 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
      rescheduleCount: number;
    } | null;

    // Payments
    payments: {
      id: string;
      paymentType: string;
      amount: number;
      status: string;
      completedAt: string | null;
    }[];

    // Status timeline
    statusHistory: {
      status: OrderStatus;
      changedAt: string;
      note: string | null;
    }[];

    createdAt: string;
    updatedAt: string;
  };
}
```

---

#### Pay Balance

**Endpoint**: `POST /api/portal/orders/{id}/payments`

**Description**: Initiates balance payment (F15)

**Authentication**: Required (Clerk)

**Request Body**:
```typescript
interface PayBalanceRequest {
  amount?: number;                // Optional: partial payment
}
```

**Response** (201 Created): Same as Create Payment

---

#### Reschedule Appointment

**Endpoint**: `POST /api/portal/orders/{id}/reschedule`

**Description**: Reschedules appointment (F14)

**Authentication**: Required (Clerk)

**Request Body**:
```typescript
interface RescheduleRequest {
  newSlotId: string;
  newDate: string;
  newStartTime: string;
}
```

**Response** (200 OK):
```typescript
interface RescheduleResponse {
  data: {
    appointmentId: string;
    previousDate: string;
    newDate: string;
    newStartTime: string;
    newEndTime: string;
    rescheduleCount: number;
  };
}
```

**Error Responses**:
| Status | Code | Condition |
|--------|------|-----------|
| 422 | `max_reschedules_reached` | Already rescheduled 2 times |
| 422 | `too_close_to_appointment` | Less than 48 hours notice |

---

## Server Action Contracts

Server Actions are used for form submissions requiring server-side validation and redirects.

### Action: createQuote

**Location**: `src/app/actions/quote.ts`

**Purpose**: Create quote from address form submission

**Input**:
```typescript
const CreateQuoteSchema = z.object({
  address: z.object({
    formatted: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.enum(['TX', 'GA', 'NC', 'AZ']),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
    lat: z.number(),
    lng: z.number(),
    placeId: z.string().min(1),
  }),
  replacementMotivation: z.enum(['pre_sale_prep', 'roof_age', 'carrier_requirement', 'curb_appeal', 'energy_efficiency', 'other']).optional(),
});
```

**Output**: Redirects to `/quote/{id}` on success

**Side Effects**:
- Creates lead record
- Creates quote record with preliminary pricing
- Triggers JobNimbus sync (async)

---

### Action: selectPackage

**Location**: `src/app/actions/quote.ts`

**Purpose**: Select package tier and proceed to checkout

**Input**:
```typescript
const SelectPackageSchema = z.object({
  quoteId: z.string().uuid(),
  tier: z.enum(['good', 'better', 'best']),
});
```

**Output**: Redirects to `/checkout/financing?quoteId={id}`

**Side Effects**:
- Updates quote.selectedTier
- Updates quote.totalPrice and depositAmount
- Triggers JobNimbus sync (async)

---

### Action: recordConsent

**Location**: `src/app/actions/consent.ts`

**Purpose**: Record TCPA SMS consent (F26)

**Input**:
```typescript
const ConsentSchema = z.object({
  phone: z.string().regex(/^\+1\d{10}$/),
  leadId: z.string().uuid().optional(),
  consentText: z.string().min(1),
  consentTextVersion: z.string().min(1),
});
```

**Output**:
```typescript
interface ConsentResult {
  success: boolean;
  consentId: string;
}
```

**Side Effects**:
- Creates sms_consents record with IP, user agent
- Does NOT redirect

---

### Action: holdSlot

**Location**: `src/app/actions/appointment.ts`

**Purpose**: Hold appointment slot during checkout

**Input**:
```typescript
const HoldSlotSchema = z.object({
  quoteId: z.string().uuid(),
  slotId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});
```

**Output**:
```typescript
interface HoldResult {
  success: boolean;
  holdId: string;
  expiresAt: string;
}
```

---

### Action: processCheckout

**Location**: `src/app/actions/payment.ts`

**Purpose**: Complete checkout (sign + pay + confirm)

**Input**:
```typescript
const CheckoutSchema = z.object({
  quoteId: z.string().uuid(),
  contractId: z.string().uuid(),
  paymentIntentId: z.string().min(1),
  holdId: z.string().min(1),
});
```

**Output**: Redirects to `/confirmation/{orderId}` on success

**Side Effects**:
- Verifies contract is signed
- Verifies payment succeeded
- Creates order record
- Confirms Cal.com booking
- Sends confirmation email + SMS
- Triggers JobNimbus sync

---

### Action: shareQuote

**Location**: `src/app/actions/quote.ts`

**Purpose**: Generate shareable quote link (F21)

**Input**:
```typescript
const ShareQuoteSchema = z.object({
  quoteId: z.string().uuid(),
});
```

**Output**:
```typescript
interface ShareResult {
  success: boolean;
  shareUrl: string;
  expiresAt: string;
}
```

---

### Action: rescheduleAppointment

**Location**: `src/app/actions/appointment.ts`

**Purpose**: Reschedule from portal (F14)

**Input**:
```typescript
const RescheduleSchema = z.object({
  appointmentId: z.string().uuid(),
  newSlotId: z.string().min(1),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newStartTime: z.string().regex(/^\d{2}:\d{2}$/),
});
```

**Output**: Redirects back to portal dashboard with success message

**Side Effects**:
- Cancels old Cal.com booking
- Creates new Cal.com booking
- Updates appointment record
- Sends updated confirmation email
- Triggers JobNimbus sync

---

## Webhook Endpoint Contracts

All webhook endpoints:
1. Verify signature before processing
2. Log payload to `webhook_events` table
3. Return 200 immediately, process async
4. Handle idempotency via event ID

### Webhook: Stripe

**Endpoint**: `POST /api/webhooks/stripe`

**Authentication**: Signature verification via `STRIPE_WEBHOOK_SECRET`

**Signature Header**: `Stripe-Signature`

**Verification**:
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Handled Events**:

| Event Type | Action |
|------------|--------|
| `payment_intent.succeeded` | Update payment status, create order if deposit |
| `payment_intent.payment_failed` | Update payment status, notify user |
| `charge.refunded` | Update payment status, update order balance |

**Event Payload** (`payment_intent.succeeded`):
```json
{
  "id": "evt_...",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_...",
      "amount": 145000,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "quote_id": "...",
        "order_id": "...",
        "payment_type": "deposit"
      }
    }
  }
}
```

**Response**: `200 OK` (empty body)

---

### Webhook: Documenso

**Endpoint**: `POST /api/webhooks/documenso`

**Authentication**: Signature verification via `DOCUMENSO_WEBHOOK_SECRET`

**Signature Header**: `X-Documenso-Signature`

**Handled Events**:

| Event Type | Action |
|------------|--------|
| `document.sent` | Update contract status to 'sent' |
| `document.viewed` | Update contract status to 'viewed', record timestamp |
| `document.completed` | Update contract status to 'signed', fetch signed PDF |

**Event Payload** (`document.completed`):
```json
{
  "event": "document.completed",
  "data": {
    "documentId": "...",
    "recipients": [
      {
        "email": "customer@example.com",
        "signedAt": "2026-01-21T15:12:00Z"
      }
    ]
  }
}
```

**Processing**:
1. Verify signature
2. Check idempotency (documentId + event)
3. Update `contracts` table with signed status
4. Download signed PDF, store to Vercel Blob
5. Update `contracts.signed_pdf_url`
6. Trigger JobNimbus sync (F23)

---

### Webhook: Cal.com

**Endpoint**: `POST /api/webhooks/calcom`

**Authentication**: Signature verification via `CALCOM_WEBHOOK_SECRET`

**Signature Header**: `X-Cal-Signature-256`

**Handled Events**:

| Event Type | Action |
|------------|--------|
| `BOOKING_CREATED` | Update appointment status to 'confirmed' |
| `BOOKING_RESCHEDULED` | Update appointment with new time, increment reschedule count |
| `BOOKING_CANCELLED` | Update appointment status to 'cancelled' |

**Event Payload** (`BOOKING_CREATED`):
```json
{
  "triggerEvent": "BOOKING_CREATED",
  "payload": {
    "bookingId": 12345,
    "uid": "abc-123-xyz",
    "startTime": "2026-02-01T09:00:00Z",
    "endTime": "2026-02-01T12:00:00Z",
    "attendees": [
      { "email": "customer@example.com", "name": "Richard Thompson" }
    ],
    "metadata": {
      "quote_id": "...",
      "order_id": "..."
    }
  }
}
```

**Processing**:
1. Verify signature
2. Check idempotency (bookingId + triggerEvent)
3. Update `appointments` table
4. Trigger JobNimbus sync (F24)

---

### Webhook: Wisetack

**Endpoint**: `POST /api/webhooks/wisetack`

**Authentication**: Signature verification via `WISETACK_WEBHOOK_SECRET`

**Signature Header**: `X-Wisetack-Signature`

**Handled Events**:

| Event Type | Action |
|------------|--------|
| `prequal.completed` | Update financing application status |
| `prequal.approved` | Store approved amount and terms |
| `prequal.declined` | Update status to declined |
| `loan.funded` | Update order financing status |

**Event Payload** (`prequal.approved`):
```json
{
  "event": "prequal.approved",
  "data": {
    "applicationId": "...",
    "approvedAmount": 15000,
    "terms": [
      { "months": 24, "monthlyPayment": 650, "apr": 9.99 },
      { "months": 36, "monthlyPayment": 450, "apr": 10.99 }
    ],
    "expiresAt": "2026-02-20T15:02:00Z",
    "metadata": {
      "quote_id": "..."
    }
  }
}
```

**Processing**:
1. Verify signature
2. Check idempotency
3. Update `financing_applications` table
4. Update `quotes.financing_status`

---

### Webhook: Roofr

**Endpoint**: `POST /api/webhooks/roofr`

**Authentication**: Signature verification via `ROOFR_WEBHOOK_SECRET`

**Signature Header**: `X-Roofr-Signature`

**Handled Events**:

| Event Type | Action |
|------------|--------|
| `measurement.completed` | Update measurement with report data, recalculate pricing |
| `measurement.failed` | Update measurement status to failed |

**Event Payload** (`measurement.completed`):
```json
{
  "event": "measurement.completed",
  "data": {
    "jobId": "RF-2026-12345",
    "report": {
      "sqftTotal": 2450,
      "pitchPrimary": 6.0,
      "facetCount": 8,
      "ridgeLengthFt": 145,
      "valleyLengthFt": 32,
      "complexity": "moderate"
    },
    "metadata": {
      "quote_id": "..."
    }
  }
}
```

**Processing**:
1. Verify signature
2. Check idempotency (jobId)
3. Update `measurements` table with report data
4. Update `quotes` table with sqft, pitch, complexity
5. Recalculate pricing for all tiers
6. Update `quote_line_items`
7. Update `quotes.status` to 'final'
8. Send "quote ready" email/SMS (F03)
9. Trigger JobNimbus sync

---

### Webhook: SignalWire

**Endpoint**: `POST /api/webhooks/signalwire`

**Authentication**: Signature verification via `SIGNALWIRE_API_TOKEN`

**Content-Type**: `application/x-www-form-urlencoded`

**Handled Events**:

| Event | Action |
|-------|--------|
| Message status update | Update notification delivery status |
| Inbound STOP | Mark consent as revoked |

**Status Callback Payload**:
```
MessageSid=SM...
MessageStatus=delivered|failed|undelivered
To=+1...
From=+1...
ErrorCode=30006
```

**Inbound Message Payload**:
```
From=+1...
To=+1...
Body=STOP
```

**Processing (STOP)**:
1. Parse phone number
2. Find active consent for phone
3. Update `sms_consents.is_active = false`
4. Update `sms_consents.opted_out_at`
5. Update `sms_consents.opt_out_source = 'sms_stop'`

---

### Webhook: Resend

**Endpoint**: `POST /api/webhooks/resend`

**Authentication**: Signature verification via webhook signing (if available)

**Handled Events**:

| Event Type | Action |
|------------|--------|
| `email.delivered` | Update notification status |
| `email.bounced` | Update notification status, flag email |
| `email.complained` | Update notification status, flag email |

**Event Payload**:
```json
{
  "type": "email.delivered",
  "data": {
    "email_id": "...",
    "to": "customer@example.com",
    "created_at": "2026-01-21T15:20:08Z"
  }
}
```

---

### Webhook: Clerk

**Endpoint**: `POST /api/webhooks/clerk`

**Authentication**: Svix signature verification

**Signature Headers**: `svix-id`, `svix-timestamp`, `svix-signature`

**Handled Events**:

| Event Type | Action |
|------------|--------|
| `user.created` | Link Clerk user to order if email matches |
| `user.deleted` | Handle account deletion (soft delete) |

**Event Payload** (`user.created`):
```json
{
  "type": "user.created",
  "data": {
    "id": "user_...",
    "email_addresses": [
      { "email_address": "customer@example.com" }
    ],
    "first_name": "Richard",
    "last_name": "Thompson"
  }
}
```

**Processing**:
1. Verify Svix signature
2. Find orders with matching email
3. Update `orders.clerk_user_id`

---

## Rate Limiting

### Limits by Endpoint Pattern

| Endpoint Pattern | Limit | Window | Scope |
|------------------|-------|--------|-------|
| `POST /api/quotes` | 10 | per minute | per IP |
| `POST /api/leads` | 10 | per minute | per IP |
| `POST /api/payments` | 5 | per minute | per IP |
| `GET /api/*` | 100 | per minute | per IP |
| `POST /api/webhooks/*` | 1000 | per minute | global |
| `/api/portal/*` | 60 | per minute | per user |

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706025600
```

### Exceeded Response

**Status**: 429 Too Many Requests

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

### Implementation

Rate limiting implemented via Vercel Edge Config or Upstash Redis:

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1m'),
  analytics: true,
});
```

---

## API Versioning Strategy

### Versioning Approach

**Strategy**: URL Path Versioning (when needed)

**Current Version**: Unversioned (MVP)

**Future Versioning**: `/api/v1/...`

### Migration Plan

1. MVP launches without versioning
2. When breaking changes needed, introduce `/api/v1/`
3. Unversioned routes become aliases to latest version
4. Deprecation notices via `X-API-Deprecation` header

### Deprecation Policy

- Old versions supported for: 6 months minimum
- Deprecation notice: Response header + documentation
- Migration guides: Provided in API docs

### Breaking vs Non-Breaking Changes

**Non-Breaking (safe)**:
- Adding new optional fields to responses
- Adding new endpoints
- Adding new optional query parameters
- Adding new enum values (with careful consideration)

**Breaking (requires new version)**:
- Removing or renaming response fields
- Changing field types
- Removing endpoints
- Changing authentication requirements
- Removing enum values

---

## TypeScript Type Definitions

All API types should be generated from Zod schemas:

```typescript
// src/lib/api/types.ts
import { z } from 'zod';

// Schemas
export const CreateQuoteSchema = z.object({
  address: z.object({
    formatted: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.enum(['TX', 'GA', 'NC', 'AZ']),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
    lat: z.number(),
    lng: z.number(),
    placeId: z.string().min(1),
  }),
  replacementMotivation: z.enum(['pre_sale_prep', 'roof_age', 'carrier_requirement', 'curb_appeal', 'energy_efficiency', 'other']).optional(),
  utmParams: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    content: z.string().optional(),
    term: z.string().optional(),
  }).optional(),
});

// Inferred types
export type CreateQuoteRequest = z.infer<typeof CreateQuoteSchema>;

// Response types (manual for complex responses)
export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [08-data-models.md](./08-data-models.md) | Data structures these APIs transfer |
| [07-technical-architecture.md](./07-technical-architecture.md) | System architecture showing API boundaries |
| [04-feature-breakdown.md](./04-feature-breakdown.md) | Features requiring these endpoints |
| [INTEGRATION-SPECS.md](./INTEGRATION-SPECS.md) | Detailed external API contracts |
| [10-error-handling.md](./10-error-handling.md) | Error handling patterns for API calls |
| [11-security-considerations.md](./11-security-considerations.md) | Security requirements for APIs |
| [12-testing-strategy.md](./12-testing-strategy.md) | API testing approach |

---

## Document Completion Checklist

- [x] All external APIs consumed are documented (9 services)
- [x] All exposed REST API endpoints have complete documentation (20+ endpoints)
- [x] All Server Actions documented with input/output types (7 actions)
- [x] All webhook endpoints documented with payload schemas (7 webhooks)
- [x] Authentication/authorization is clear for each endpoint
- [x] Error handling documented with standard error codes
- [x] Rate limiting defined with limits per endpoint pattern
- [x] Versioning strategy documented
- [x] TypeScript type definitions approach documented
- [x] Related Documents links included

**Status: COMPLETE**
