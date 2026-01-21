# 08 - Data Models

<!-- AI: This document defines the data structures, entities, and persistence strategy for Results Roofing website overhaul. -->

## Data Modeling Overview

### Domain Context

**Domain Description**: Results Roofing Website Overhaul manages the complete customer journey from initial roofing quote request through signed contract, payment, and ongoing project tracking. The system handles homeowner leads, roof measurements, pricing calculations, financing, scheduling, e-signatures, payments, and post-purchase portal access.

**Core Entities**:
- **Lead**: Customer contact information and address
- **Quote**: Pricing estimate with package options and selections
- **Measurement**: Roof measurement data from Roofr
- **Contract**: E-signature documents via Documenso
- **Order**: Confirmed roofing job after contract signing
- **Payment**: Deposit and balance payment records via Stripe
- **Appointment**: Scheduled inspection/installation via Cal.com

**Key Operations**:
- Create: Lead capture, quote generation, order creation, payment processing
- Transform: Quote status progression, measurement → pricing, signature → confirmation
- Query: Quote lookup, portal dashboard, status timeline, document retrieval

### Data Architecture Style

**Pattern**: Relational (PostgreSQL via Neon)

**Rationale**:
- Complex relationships between leads, quotes, orders, payments require foreign keys
- Transactional consistency needed for payment and contract flows
- Audit trail requirements for TCPA compliance and financial records
- Strong typing and schema enforcement via Drizzle ORM
- Query patterns benefit from indexes on status, email, dates

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            RESULTS ROOFING DATA MODEL                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                                    LEAD & QUOTE DOMAIN

    ┌─────────────┐         1:N         ┌─────────────┐         1:1         ┌─────────────┐
    │    leads    │─────────────────────│   quotes    │─────────────────────│measurements │
    │             │                     │             │                     │             │
    │ id (PK)     │                     │ id (PK)     │                     │ id (PK)     │
    │ email       │                     │ lead_id (FK)│                     │ quote_id(FK)│
    │ phone       │                     │ status      │                     │ sqft_total  │
    │ address     │                     │ pricing_data│                     │ pitch       │
    └─────────────┘                     └──────┬──────┘                     │ complexity  │
          │                                    │                            └─────────────┘
          │ 1:N                                │
          ▼                                    │ 1:N
    ┌─────────────┐                            │
    │sms_consents │                            │
    │             │                            │
    │ id (PK)     │                            │
    │ phone       │                            │
    │ lead_id(FK) │                            │
    └─────────────┘                            │
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
            ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
            │quote_shares │            │quote_photos │            │quote_line_  │
            │             │            │             │            │   items     │
            │ id (PK)     │            │ id (PK)     │            │ id (PK)     │
            │ quote_id(FK)│            │ quote_id(FK)│            │ quote_id(FK)│
            │ token       │            │ file_url    │            │ tier        │
            │ expires_at  │            │ filename    │            │ amount      │
            └─────────────┘            └─────────────┘            └─────────────┘


                                    ORDER & FULFILLMENT DOMAIN

    ┌─────────────┐         1:1         ┌─────────────┐         1:1         ┌─────────────┐
    │   quotes    │─────────────────────│ contracts   │─────────────────────│   orders    │
    │             │                     │             │                     │             │
    │ id (PK)     │                     │ id (PK)     │                     │ id (PK)     │
    │             │                     │ quote_id(FK)│                     │ quote_id(FK)│
    │             │                     │ documenso_id│                     │contract_id  │
    │             │                     │ signed_at   │                     │ status      │
    └─────────────┘                     └─────────────┘                     └──────┬──────┘
                                                                                   │
                    ┌──────────────────────────┬──────────────────────────┬────────┴────────┐
                    │                          │                          │                 │
                    ▼                          ▼                          ▼                 ▼
            ┌─────────────┐            ┌─────────────┐            ┌─────────────┐  ┌─────────────┐
            │  payments   │            │appointments │            │order_status_│  │notifications│
            │             │            │             │            │  history    │  │             │
            │ id (PK)     │            │ id (PK)     │            │ id (PK)     │  │ id (PK)     │
            │ order_id(FK)│            │ order_id(FK)│            │ order_id(FK)│  │ order_id(FK)│
            │ stripe_id   │            │ calcom_id   │            │ status      │  │ type        │
            │ amount      │            │ scheduled   │            │ changed_at  │  │ sent_at     │
            └─────────────┘            └─────────────┘            └─────────────┘  └─────────────┘


                                    FINANCING & COMPLIANCE

    ┌─────────────┐                                                        ┌─────────────┐
    │  financing_ │                                                        │ webhook_    │
    │applications │                                                        │  events     │
    │             │                                                        │             │
    │ id (PK)     │                                                        │ id (PK)     │
    │ quote_id(FK)│                                                        │ event_id    │
    │ wisetack_id │                                                        │ source      │
    │ status      │                                                        │ payload     │
    └─────────────┘                                                        └─────────────┘


                                    CONFIGURATION TABLES

    ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
    │pricing_tiers│            │pricing_     │            │out_of_area_ │
    │             │            │  config     │            │   leads     │
    │ id (PK)     │            │ id (PK)     │            │ id (PK)     │
    │ tier        │            │ key         │            │ email       │
    │ material_$  │            │ value       │            │ zip         │
    │ warranty    │            │ description │            │ captured_at │
    └─────────────┘            └─────────────┘            └─────────────┘


RELATIONSHIP LEGEND:
  ─────  1:1 (One to One)
  ──┬──  1:N (One to Many)
  ──┼──  N:M (Many to Many - via junction table)
  (PK)   Primary Key
  (FK)   Foreign Key
```

---

## Entity Definitions

### Entity: leads

**Purpose**: Stores customer contact information captured when they enter their address. This is the entry point for all quote funnel data.

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| email | text | No | Valid email format, max 255 chars | Customer email address |
| phone | text | No | E.164 format recommended, max 20 chars | Customer phone number |
| first_name | text | No | Max 100 chars | Customer first name |
| last_name | text | No | Max 100 chars | Customer last name |
| address | text | Yes | Max 500 chars | Street address (formatted by Google Places) |
| city | text | Yes | Max 100 chars | City name |
| state | text | Yes | 2 chars, uppercase | State abbreviation (TX/GA/NC/AZ for service area) |
| zip | text | Yes | 5 or 9 digit format | ZIP code |
| lat | decimal(10,7) | No | Valid latitude range | Geocoded latitude |
| lng | decimal(10,7) | No | Valid longitude range | Geocoded longitude |
| utm_source | text | No | Max 100 chars | UTM tracking parameter |
| utm_medium | text | No | Max 100 chars | UTM tracking parameter |
| utm_campaign | text | No | Max 100 chars | UTM tracking parameter |
| utm_content | text | No | Max 100 chars | UTM tracking parameter |
| utm_term | text | No | Max 100 chars | UTM tracking parameter |
| jobnimbus_contact_id | text | No | Max 100 chars | JobNimbus contact ID after CRM sync |
| created_at | timestamp | Yes | Auto-set, UTC | Lead creation timestamp |
| updated_at | timestamp | Yes | Auto-update, UTC | Last modification timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| quotes | Quote | 1:N | A lead can have multiple quotes (e.g., different addresses over time) |
| sms_consents | SmsConsent | 1:N | A lead can have multiple consent records (per phone number) |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| leads_email_idx | email | btree | Fast lookup by email for returning customers |
| leads_jobnimbus_idx | jobnimbus_contact_id | btree | Fast lookup for CRM sync operations |
| leads_created_idx | created_at | btree | Date-range queries for reporting |

**Lifecycle**:
- **Created**: When user submits valid address in quote funnel (F01)
- **Modified**: When user adds contact info, completes checkout
- **Deleted**: Soft delete not implemented; data retained for compliance

**Example Instance**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "richard@example.com",
  "phone": "+14155551234",
  "first_name": "Richard",
  "last_name": "Thompson",
  "address": "4521 Beverly Drive",
  "city": "Highland Park",
  "state": "TX",
  "zip": "75205",
  "lat": "32.8318642",
  "lng": "-96.7969879",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "premium-roofing-2026",
  "jobnimbus_contact_id": "jn_12345",
  "created_at": "2026-01-21T14:30:00Z",
  "updated_at": "2026-01-21T14:35:00Z"
}
```

---

### Entity: quotes

**Purpose**: Central entity representing a roofing quote with pricing, package selection, and funnel progress. Tracks the quote from preliminary through signed/paid.

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| lead_id | uuid | No | FK → leads.id | Associated lead (nullable for anonymous quotes) |
| status | enum | Yes | quote_status enum, default 'preliminary' | Current quote status |
| address | text | Yes | Max 500 chars | Property address (denormalized) |
| city | text | Yes | Max 100 chars | City (denormalized) |
| state | text | Yes | 2 chars | State (denormalized) |
| zip | text | Yes | 5-9 chars | ZIP code (denormalized) |
| replacement_motivation | text | No | 'pre_sale_prep' \| 'roof_age' \| 'carrier_requirement' \| 'curb_appeal' \| 'energy_efficiency' \| 'other' | Customer's replacement motivation (F17) |
| measurement_id | uuid | No | FK → measurements.id | Associated measurement report |
| sqft_total | decimal(10,2) | No | Positive number | Total roof square footage |
| pitch_primary | decimal(4,2) | No | 0-45 typical range | Primary roof pitch (rise/run) |
| complexity | text | No | 'simple' \| 'moderate' \| 'complex' | Roof complexity rating |
| pricing_data | jsonb | No | JSON object | Calculated pricing for all tiers |
| selected_tier | enum | No | tier enum | Customer-selected package |
| tier_selected_at | timestamp | No | UTC | When package was selected |
| financing_status | text | No | 'pending' \| 'approved' \| 'declined' \| null | Wisetack pre-qual status |
| financing_application_id | text | No | Max 100 chars | Wisetack application ID |
| financing_term | text | No | '12' \| '24' \| '36' \| '48' | Selected financing term (months) |
| financing_monthly_payment | decimal(10,2) | No | Positive number | Monthly payment if financed |
| scheduled_slot_id | text | No | Max 100 chars | Cal.com slot hold ID |
| scheduled_date | timestamp | No | UTC, future date | Selected appointment date |
| total_price | decimal(10,2) | No | Positive number | Final total price for selected tier |
| deposit_amount | decimal(10,2) | No | 500-2500 range | Calculated deposit amount |
| jobnimbus_job_id | text | No | Max 100 chars | JobNimbus job ID after CRM sync |
| expires_at | timestamp | No | UTC, future date | Quote expiration (30 days default) |
| created_at | timestamp | Yes | Auto-set, UTC | Quote creation timestamp |
| updated_at | timestamp | Yes | Auto-update, UTC | Last modification timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| lead | Lead | N:1 | Parent lead record |
| measurement | Measurement | 1:1 | Associated roof measurement |
| contract | Contract | 1:1 | Associated contract (after signing) |
| quote_shares | QuoteShare | 1:N | Shareable links for this quote |
| quote_photos | QuotePhoto | 1:N | Property photos uploaded |
| quote_line_items | QuoteLineItem | 1:N | Itemized pricing breakdown |
| financing_application | FinancingApplication | 1:1 | Financing pre-qual record |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| quotes_lead_idx | lead_id | btree | Find quotes by lead |
| quotes_status_idx | status | btree | Filter by funnel stage |
| quotes_created_idx | created_at | btree | Date-range reporting |
| quotes_jobnimbus_idx | jobnimbus_job_id | btree | CRM sync lookups |
| quotes_expires_idx | expires_at | btree | Find expiring quotes |

**Lifecycle**:
- **Created**: When user enters valid address (F01), status = 'preliminary'
- **Modified**: Progress through funnel: measuring → final → selected → signed → paid → expired
- **Deleted**: Soft delete via status = 'expired'; data retained

**Example Instance**:
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "lead_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "final",
  "address": "4521 Beverly Drive",
  "city": "Highland Park",
  "state": "TX",
  "zip": "75205",
  "replacement_motivation": "pre_sale_prep",
  "sqft_total": "3200.00",
  "pitch_primary": "6.00",
  "complexity": "moderate",
  "pricing_data": {
    "good": {"total": 12500, "materials": 7500, "labor": 4000, "other": 1000},
    "better": {"total": 14500, "materials": 9000, "labor": 4000, "other": 1500},
    "best": {"total": 18500, "materials": 12000, "labor": 4500, "other": 2000}
  },
  "selected_tier": "better",
  "tier_selected_at": "2026-01-21T15:00:00Z",
  "total_price": "14500.00",
  "deposit_amount": "1450.00",
  "expires_at": "2026-02-20T14:30:00Z",
  "created_at": "2026-01-21T14:30:00Z",
  "updated_at": "2026-01-21T15:00:00Z"
}
```

---

### Entity: measurements

**Purpose**: Stores roof measurement data from Roofr (or other measurement vendor). Links to a quote and contains detailed roof specifications.

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| quote_id | uuid | Yes | FK → quotes.id, unique | Associated quote (1:1) |
| vendor | text | Yes | Default 'roofr', max 50 chars | Measurement vendor name |
| vendor_job_id | text | No | Max 100 chars | Vendor's job/report ID |
| status | text | Yes | 'pending' \| 'processing' \| 'complete' \| 'failed' | Measurement status |
| sqft_total | decimal(10,2) | No | Positive number | Total roof area |
| sqft_steep | decimal(10,2) | No | Positive number | Steep section area |
| sqft_flat | decimal(10,2) | No | Positive number | Flat section area |
| pitch_primary | decimal(4,2) | No | 0-45 range | Primary roof pitch |
| pitch_min | decimal(4,2) | No | 0-45 range | Minimum pitch |
| pitch_max | decimal(4,2) | No | 0-45 range | Maximum pitch |
| facet_count | integer | No | Positive integer | Number of roof facets |
| ridge_length_ft | decimal(10,2) | No | Positive number | Total ridge length |
| valley_length_ft | decimal(10,2) | No | Positive number | Total valley length |
| eave_length_ft | decimal(10,2) | No | Positive number | Total eave length |
| hip_length_ft | decimal(10,2) | No | Positive number | Total hip length |
| complexity | text | No | 'simple' \| 'moderate' \| 'complex' | Calculated complexity |
| raw_response | jsonb | No | JSON object | Full vendor API response |
| error_message | text | No | Max 500 chars | Error details if failed |
| requested_at | timestamp | Yes | Auto-set, UTC | When measurement was requested |
| completed_at | timestamp | No | UTC | When measurement completed |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| quote | Quote | 1:1 | Parent quote record |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| measurements_quote_idx | quote_id | unique | Ensure 1:1 relationship |
| measurements_vendor_job_idx | vendor_job_id | btree | Vendor webhook lookups |
| measurements_status_idx | status | btree | Find pending measurements |

**Lifecycle**:
- **Created**: When user requests detailed measurement (F03), status = 'pending'
- **Modified**: Vendor callback updates status → 'complete' or 'failed'
- **Deleted**: Not deleted; retained for audit trail

**Example Instance**:
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-345678901234",
  "quote_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "vendor": "roofr",
  "vendor_job_id": "RF-2026-12345",
  "status": "complete",
  "sqft_total": "2450.00",
  "pitch_primary": "6.00",
  "facet_count": 8,
  "ridge_length_ft": "145.00",
  "valley_length_ft": "32.00",
  "complexity": "moderate",
  "raw_response": {"reportId": "RF-2026-12345", "...": "..."},
  "requested_at": "2026-01-21T14:32:00Z",
  "completed_at": "2026-01-22T10:15:00Z"
}
```

---

### Entity: contracts

**Purpose**: Tracks e-signature documents managed by Documenso. Links quotes to signed agreements.

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| quote_id | uuid | Yes | FK → quotes.id, unique | Associated quote (1:1) |
| documenso_document_id | text | No | Max 100 chars | Documenso document ID |
| template_version | text | No | Semver format, max 20 chars | Contract template version used |
| status | text | Yes | 'draft' \| 'pending' \| 'sent' \| 'viewed' \| 'signed' \| 'expired' \| 'declined' | Signature status |
| customer_email | text | Yes | Valid email | Email used for signature request |
| sent_at | timestamp | No | UTC | When signature request sent |
| viewed_at | timestamp | No | UTC | When customer first viewed |
| signed_at | timestamp | No | UTC | When customer signed |
| signature_ip | text | No | IPv4 or IPv6 format | Customer's IP at signing |
| signature_user_agent | text | No | Max 500 chars | Browser info at signing |
| company_signed_at | timestamp | No | UTC | When company counter-signed |
| signed_pdf_url | text | No | Valid URL | URL to signed PDF in storage |
| signed_pdf_hash | text | No | SHA-256 hash | Document integrity hash |
| created_at | timestamp | Yes | Auto-set, UTC | Contract creation timestamp |
| updated_at | timestamp | Yes | Auto-update, UTC | Last modification timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| quote | Quote | 1:1 | Parent quote record |
| order | Order | 1:1 | Child order created after signing |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| contracts_quote_idx | quote_id | unique | Ensure 1:1 with quote |
| contracts_documenso_idx | documenso_document_id | btree | Webhook lookups |
| contracts_status_idx | status | btree | Find pending contracts |

**Lifecycle**:
- **Created**: When user proceeds to e-sign step (F08), status = 'draft'
- **Modified**: Documenso webhooks update status through sent → viewed → signed
- **Deleted**: Not deleted; legal record retention required

**Example Instance**:
```json
{
  "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
  "quote_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "documenso_document_id": "doc_abc123xyz",
  "template_version": "1.2.0",
  "status": "signed",
  "customer_email": "richard@example.com",
  "sent_at": "2026-01-21T15:05:00Z",
  "viewed_at": "2026-01-21T15:07:00Z",
  "signed_at": "2026-01-21T15:12:00Z",
  "signature_ip": "192.168.1.100",
  "company_signed_at": "2026-01-21T15:12:05Z",
  "signed_pdf_url": "https://storage.example.com/contracts/d4e5f6a7.pdf",
  "created_at": "2026-01-21T15:00:00Z",
  "updated_at": "2026-01-21T15:12:05Z"
}
```

---

### Entity: orders

**Purpose**: Represents a confirmed roofing job after contract signing. Central record for fulfillment tracking.

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| quote_id | uuid | Yes | FK → quotes.id, unique | Source quote |
| contract_id | uuid | Yes | FK → contracts.id, unique | Signed contract |
| confirmation_number | text | Yes | Unique, format 'RR-XXXXXX' | Customer-facing order number |
| status | enum | Yes | order_status enum, default 'pending' | Fulfillment status |
| customer_email | text | Yes | Valid email | Customer email (denormalized) |
| customer_phone | text | No | E.164 format | Customer phone (denormalized) |
| customer_name | text | No | Max 200 chars | Full name (denormalized) |
| clerk_user_id | text | No | Max 100 chars | Clerk user ID for portal access |
| property_address | text | Yes | Max 500 chars | Installation address (denormalized) |
| property_city | text | Yes | Max 100 chars | City (denormalized) |
| property_state | text | Yes | 2 chars | State (denormalized) |
| property_zip | text | Yes | 5-9 chars | ZIP (denormalized) |
| selected_tier | enum | Yes | tier enum | Package selected |
| total_amount | decimal(10,2) | Yes | Positive number | Total contract value |
| deposit_amount | decimal(10,2) | Yes | Positive number | Deposit amount |
| balance_amount | decimal(10,2) | Yes | Non-negative | Remaining balance |
| is_financed | boolean | Yes | Default false | Whether using financing |
| financing_provider | text | No | 'wisetack' \| 'hearth' | Financing provider if applicable |
| jobnimbus_job_id | text | No | Max 100 chars | JobNimbus job ID |
| notes | text | No | Max 2000 chars | Internal notes |
| created_at | timestamp | Yes | Auto-set, UTC | Order creation timestamp |
| updated_at | timestamp | Yes | Auto-update, UTC | Last modification timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| quote | Quote | 1:1 | Source quote |
| contract | Contract | 1:1 | Signed contract |
| payments | Payment | 1:N | Payment records |
| appointments | Appointment | 1:N | Scheduled appointments |
| status_history | OrderStatusHistory | 1:N | Status change audit trail |
| notifications | Notification | 1:N | Sent notifications |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| orders_confirmation_idx | confirmation_number | unique | Customer lookup |
| orders_clerk_user_idx | clerk_user_id | btree | Portal authentication |
| orders_status_idx | status | btree | Filter by status |
| orders_email_idx | customer_email | btree | Email lookups |
| orders_jobnimbus_idx | jobnimbus_job_id | btree | CRM sync |

**Lifecycle**:
- **Created**: After contract signed AND deposit paid (F09/F10), status = 'pending'
- **Modified**: Progress through fulfillment: signed → materials_ordered → crew_scheduled → in_progress → complete
- **Deleted**: status = 'cancelled' (soft delete); data retained

**Example Instance**:
```json
{
  "id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "quote_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "contract_id": "d4e5f6a7-b8c9-0123-def4-567890123456",
  "confirmation_number": "RR-A1B2C3",
  "status": "crew_scheduled",
  "customer_email": "richard@example.com",
  "customer_phone": "+14155551234",
  "customer_name": "Richard Thompson",
  "clerk_user_id": "user_xyz789",
  "property_address": "4521 Beverly Drive",
  "property_city": "Highland Park",
  "property_state": "TX",
  "property_zip": "75205",
  "selected_tier": "better",
  "total_amount": "14500.00",
  "deposit_amount": "1450.00",
  "balance_amount": "13050.00",
  "is_financed": false,
  "jobnimbus_job_id": "jn_job_67890",
  "created_at": "2026-01-21T15:20:00Z",
  "updated_at": "2026-01-23T09:00:00Z"
}
```

---

### Entity: payments

**Purpose**: Records all payment transactions processed through Stripe.

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| order_id | uuid | Yes | FK → orders.id | Associated order |
| stripe_payment_intent_id | text | Yes | Unique, max 100 chars | Stripe PaymentIntent ID |
| stripe_customer_id | text | No | Max 100 chars | Stripe Customer ID |
| stripe_charge_id | text | No | Max 100 chars | Stripe Charge ID |
| payment_type | text | Yes | 'deposit' \| 'balance' \| 'partial' | Type of payment |
| amount | decimal(10,2) | Yes | Positive number | Payment amount |
| currency | text | Yes | 3-char ISO code, default 'usd' | Currency code |
| status | text | Yes | 'pending' \| 'processing' \| 'succeeded' \| 'failed' \| 'refunded' | Payment status |
| payment_method_type | text | No | 'card' \| 'us_bank_account' | Payment method used |
| card_brand | text | No | 'visa' \| 'mastercard' \| 'amex' \| 'discover' | Card brand if card payment |
| card_last_four | text | No | 4 digits | Last 4 digits of card |
| receipt_url | text | No | Valid URL | Stripe receipt URL |
| failure_code | text | No | Max 100 chars | Stripe failure code if failed |
| failure_message | text | No | Max 500 chars | Failure description |
| refund_amount | decimal(10,2) | No | Non-negative | Amount refunded |
| refunded_at | timestamp | No | UTC | When refund processed |
| metadata | jsonb | No | JSON object | Additional payment metadata |
| created_at | timestamp | Yes | Auto-set, UTC | Payment creation timestamp |
| completed_at | timestamp | No | UTC | When payment succeeded |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| order | Order | N:1 | Parent order |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| payments_order_idx | order_id | btree | Find payments for order |
| payments_stripe_pi_idx | stripe_payment_intent_id | unique | Webhook idempotency |
| payments_status_idx | status | btree | Filter by status |

**Lifecycle**:
- **Created**: When Stripe PaymentIntent created (F09), status = 'pending'
- **Modified**: Stripe webhook updates status → succeeded/failed
- **Deleted**: Not deleted; financial record retention required

**Example Instance**:
```json
{
  "id": "f6a7b8c9-d0e1-2345-f678-901234567890",
  "order_id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "stripe_payment_intent_id": "pi_3MqtYZ2eZvKYlo2C1234567",
  "stripe_customer_id": "cus_N1234567890",
  "payment_type": "deposit",
  "amount": "1450.00",
  "currency": "usd",
  "status": "succeeded",
  "payment_method_type": "card",
  "card_brand": "visa",
  "card_last_four": "4242",
  "receipt_url": "https://pay.stripe.com/receipts/...",
  "created_at": "2026-01-21T15:15:00Z",
  "completed_at": "2026-01-21T15:15:03Z"
}
```

---

### Entity: appointments

**Purpose**: Tracks scheduled inspections and installations via Cal.com.

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| order_id | uuid | Yes | FK → orders.id | Associated order |
| calcom_booking_id | text | No | Max 100 chars | Cal.com booking ID |
| calcom_event_type_id | text | No | Max 100 chars | Cal.com event type |
| calcom_uid | text | No | Max 100 chars | Cal.com unique identifier |
| appointment_type | text | Yes | 'inspection' \| 'installation' | Type of appointment |
| scheduled_start | timestamp | Yes | UTC | Appointment start time |
| scheduled_end | timestamp | Yes | UTC | Appointment end time |
| time_zone | text | Yes | IANA timezone, default 'America/Chicago' | Customer's timezone |
| status | text | Yes | 'hold' \| 'confirmed' \| 'rescheduled' \| 'cancelled' \| 'completed' \| 'no_show' | Appointment status |
| reschedule_count | integer | Yes | Default 0, max 2 | Number of reschedules |
| previous_datetime | timestamp | No | UTC | Previous scheduled time if rescheduled |
| cancellation_reason | text | No | Max 500 chars | Reason if cancelled |
| cancelled_at | timestamp | No | UTC | Cancellation timestamp |
| completed_at | timestamp | No | UTC | Completion timestamp |
| notes | text | No | Max 1000 chars | Appointment notes |
| created_at | timestamp | Yes | Auto-set, UTC | Appointment creation timestamp |
| updated_at | timestamp | Yes | Auto-update, UTC | Last modification timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| order | Order | N:1 | Parent order |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| appointments_order_idx | order_id | btree | Find appointments for order |
| appointments_calcom_idx | calcom_booking_id | btree | Webhook lookups |
| appointments_date_idx | scheduled_start | btree | Date range queries |
| appointments_status_idx | status | btree | Filter by status |

**Lifecycle**:
- **Created**: When slot selected during checkout (F07), status = 'hold' or 'confirmed'
- **Modified**: Cal.com webhooks update on reschedule/cancel
- **Deleted**: Not deleted; marked 'cancelled'

**Example Instance**:
```json
{
  "id": "a7b8c9d0-e1f2-3456-7890-123456789012",
  "order_id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "calcom_booking_id": "cal_booking_xyz123",
  "calcom_event_type_id": "roof-inspection",
  "appointment_type": "inspection",
  "scheduled_start": "2026-02-01T09:00:00Z",
  "scheduled_end": "2026-02-01T12:00:00Z",
  "time_zone": "America/Chicago",
  "status": "confirmed",
  "reschedule_count": 0,
  "created_at": "2026-01-21T15:10:00Z",
  "updated_at": "2026-01-21T15:10:00Z"
}
```

---

### Entity: sms_consents

**Purpose**: TCPA-compliant tracking of SMS consent with full audit trail.

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| phone | text | Yes | E.164 format | Phone number consented |
| lead_id | uuid | No | FK → leads.id | Associated lead |
| consent_text | text | Yes | Max 1000 chars | Exact consent text shown to user |
| consent_text_version | text | Yes | Semver format | Version of consent text |
| consented_at | timestamp | Yes | UTC | When consent was given |
| ip_address | text | Yes | IPv4 or IPv6 | User's IP address at consent |
| user_agent | text | Yes | Max 500 chars | Browser user agent string |
| consent_source | text | Yes | 'web_form' \| 'sms_reply' | How consent was obtained |
| is_active | boolean | Yes | Default true | Whether consent is currently active |
| opted_out_at | timestamp | No | UTC | When user opted out |
| opt_out_source | text | No | 'sms_stop' \| 'web_form' \| 'manual' | How opt-out was received |
| opt_out_processed_by | text | No | 'system' \| 'manual' | Who processed opt-out |
| created_at | timestamp | Yes | Auto-set, UTC | Record creation timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| lead | Lead | N:1 | Associated lead (optional) |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| sms_consents_phone_idx | phone | btree | Lookup by phone number |
| sms_consents_active_idx | phone, is_active | btree | Find active consent for phone |
| sms_consents_lead_idx | lead_id | btree | Find consents for lead |

**Lifecycle**:
- **Created**: When user checks SMS consent checkbox (F26)
- **Modified**: When user opts out via STOP or other mechanism
- **Deleted**: Never deleted; compliance requires retention

**Example Instance**:
```json
{
  "id": "b8c9d0e1-f2a3-4567-8901-234567890123",
  "phone": "+14155551234",
  "lead_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "consent_text": "I agree to receive text message updates about my roofing project. Message & data rates may apply. Reply STOP to unsubscribe.",
  "consent_text_version": "1.0.0",
  "consented_at": "2026-01-21T14:35:00Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...",
  "consent_source": "web_form",
  "is_active": true,
  "created_at": "2026-01-21T14:35:00Z"
}
```

---

### Entity: quote_shares

**Purpose**: Manages shareable quote links for spouse/family review (F21).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| quote_id | uuid | Yes | FK → quotes.id | Associated quote |
| token | text | Yes | Unique, 32+ chars | Unguessable share token |
| expires_at | timestamp | Yes | UTC, future date | When link expires (30 days default) |
| view_count | integer | Yes | Default 0 | Number of times viewed |
| last_viewed_at | timestamp | No | UTC | Last view timestamp |
| created_by_ip | text | No | IPv4 or IPv6 | IP that created share link |
| created_at | timestamp | Yes | Auto-set, UTC | Share creation timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| quote | Quote | N:1 | Parent quote |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| quote_shares_token_idx | token | unique | Fast token lookup |
| quote_shares_quote_idx | quote_id | btree | Find shares for quote |
| quote_shares_expires_idx | expires_at | btree | Find expired shares |

**Lifecycle**:
- **Created**: When user clicks "Share Quote" (F21)
- **Modified**: view_count incremented on each view
- **Deleted**: Soft delete when expired; or hard delete after 90 days

**Example Instance**:
```json
{
  "id": "c9d0e1f2-a3b4-5678-9012-345678901234",
  "quote_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "token": "a8f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5",
  "expires_at": "2026-02-20T14:30:00Z",
  "view_count": 3,
  "last_viewed_at": "2026-01-22T10:00:00Z",
  "created_at": "2026-01-21T14:30:00Z"
}
```

---

### Entity: quote_photos

**Purpose**: Stores property photo uploads for quote documentation (F18).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| quote_id | uuid | Yes | FK → quotes.id | Associated quote |
| file_url | text | Yes | Valid URL, max 500 chars | URL to stored file |
| file_name | text | Yes | Max 255 chars | Original filename |
| file_size_bytes | integer | Yes | Max 10MB | File size in bytes |
| mime_type | text | Yes | image/* types | File MIME type |
| storage_key | text | Yes | Max 255 chars | Storage provider key |
| thumbnail_url | text | No | Valid URL | Thumbnail URL if generated |
| description | text | No | Max 500 chars | User-provided description |
| uploaded_by_ip | text | No | IPv4 or IPv6 | Uploader's IP |
| sort_order | integer | Yes | Default 0 | Display order |
| created_at | timestamp | Yes | Auto-set, UTC | Upload timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| quote | Quote | N:1 | Parent quote |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| quote_photos_quote_idx | quote_id | btree | Find photos for quote |
| quote_photos_order_idx | quote_id, sort_order | btree | Ordered retrieval |

**Lifecycle**:
- **Created**: When user uploads photo (F18)
- **Modified**: If description updated
- **Deleted**: Soft delete; files retained in storage for 90 days

**Example Instance**:
```json
{
  "id": "d0e1f2a3-b4c5-6789-0123-456789012345",
  "quote_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "file_url": "https://storage.example.com/photos/d0e1f2a3.jpg",
  "file_name": "roof-damage-1.jpg",
  "file_size_bytes": 2458000,
  "mime_type": "image/jpeg",
  "storage_key": "quotes/b2c3d4e5/photos/d0e1f2a3.jpg",
  "thumbnail_url": "https://storage.example.com/photos/d0e1f2a3-thumb.jpg",
  "description": "Shingle damage near chimney",
  "sort_order": 1,
  "created_at": "2026-01-21T14:40:00Z"
}
```

---

### Entity: quote_line_items

**Purpose**: Stores itemized pricing breakdown for transparency (F20).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| quote_id | uuid | Yes | FK → quotes.id | Associated quote |
| tier | enum | Yes | tier enum | Which tier this item belongs to |
| category | text | Yes | 'materials' \| 'labor' \| 'permits' \| 'disposal' \| 'warranty' \| 'other' | Line item category |
| name | text | Yes | Max 200 chars | Display name |
| description | text | No | Max 500 chars | Detailed description |
| quantity | decimal(10,2) | No | Positive number | Quantity if applicable |
| unit | text | No | 'sqft' \| 'each' \| 'linear_ft' \| 'hour' | Unit of measure |
| unit_price | decimal(10,2) | No | Positive number | Price per unit |
| amount | decimal(10,2) | Yes | Number (can be negative for discounts) | Total line amount |
| sort_order | integer | Yes | Default 0 | Display order within tier |
| is_included | boolean | Yes | Default true | Whether included in total |
| created_at | timestamp | Yes | Auto-set, UTC | Creation timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| quote | Quote | N:1 | Parent quote |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| quote_line_items_quote_idx | quote_id, tier | btree | Find items for quote tier |
| quote_line_items_order_idx | quote_id, tier, sort_order | btree | Ordered retrieval |

**Lifecycle**:
- **Created**: When pricing calculated (F02/F03)
- **Modified**: If pricing recalculated
- **Deleted**: Cascade delete with quote (or soft delete)

**Example Instance**:
```json
{
  "id": "e1f2a3b4-c5d6-7890-1234-567890123456",
  "quote_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "tier": "better",
  "category": "materials",
  "name": "Architectural Shingles",
  "description": "Owens Corning Duration architectural shingles",
  "quantity": "24.50",
  "unit": "squares",
  "unit_price": "185.00",
  "amount": "4532.50",
  "sort_order": 1,
  "is_included": true,
  "created_at": "2026-01-21T14:30:00Z"
}
```

---

### Entity: order_status_history

**Purpose**: Audit trail for order status changes to power the timeline view (F13).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| order_id | uuid | Yes | FK → orders.id | Associated order |
| from_status | enum | No | order_status enum | Previous status (null for initial) |
| to_status | enum | Yes | order_status enum | New status |
| changed_at | timestamp | Yes | Auto-set, UTC | When status changed |
| changed_by | text | No | 'system' \| 'crm_sync' \| 'admin' \| user_id | Who/what made the change |
| source | text | No | 'webhook' \| 'api' \| 'manual' | Change source |
| note | text | No | Max 500 chars | Optional note about change |
| metadata | jsonb | No | JSON object | Additional context |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| order | Order | N:1 | Parent order |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| order_status_history_order_idx | order_id, changed_at | btree | Timeline queries |

**Lifecycle**:
- **Created**: Automatically when order.status changes
- **Modified**: Never modified (immutable audit log)
- **Deleted**: Never deleted

**Example Instance**:
```json
{
  "id": "f2a3b4c5-d6e7-8901-2345-678901234567",
  "order_id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "from_status": "signed",
  "to_status": "materials_ordered",
  "changed_at": "2026-01-22T10:00:00Z",
  "changed_by": "crm_sync",
  "source": "webhook",
  "note": "Materials ordered via JobNimbus workflow"
}
```

---

### Entity: financing_applications

**Purpose**: Tracks Wisetack/Hearth financing pre-qualification applications (F06).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| quote_id | uuid | Yes | FK → quotes.id | Associated quote |
| provider | text | Yes | 'wisetack' \| 'hearth' | Financing provider |
| provider_application_id | text | No | Max 100 chars | Provider's application ID |
| provider_prequal_link | text | No | Valid URL | Pre-qual embed/redirect URL |
| status | text | Yes | 'pending' \| 'submitted' \| 'approved' \| 'partial' \| 'declined' \| 'expired' | Application status |
| requested_amount | decimal(10,2) | Yes | Positive number | Amount requested |
| approved_amount | decimal(10,2) | No | Non-negative | Amount approved |
| available_terms | jsonb | No | Array of term options | Available financing terms |
| selected_term_months | integer | No | 12, 24, 36, 48, 60 | Selected term |
| monthly_payment | decimal(10,2) | No | Positive number | Monthly payment for selected term |
| apr | decimal(5,2) | No | Percentage | APR if disclosed |
| prequal_completed_at | timestamp | No | UTC | When prequal completed |
| expires_at | timestamp | No | UTC | When approval expires |
| created_at | timestamp | Yes | Auto-set, UTC | Application creation timestamp |
| updated_at | timestamp | Yes | Auto-update, UTC | Last modification timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| quote | Quote | N:1 | Parent quote |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| financing_applications_quote_idx | quote_id | btree | Find applications for quote |
| financing_applications_provider_idx | provider_application_id | btree | Webhook lookups |

**Lifecycle**:
- **Created**: When user starts financing flow (F06)
- **Modified**: Provider webhooks update status
- **Deleted**: Not deleted; retained for compliance

**Example Instance**:
```json
{
  "id": "a3b4c5d6-e7f8-9012-3456-789012345678",
  "quote_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "provider": "wisetack",
  "provider_application_id": "wt_app_abc123",
  "status": "approved",
  "requested_amount": "14500.00",
  "approved_amount": "15000.00",
  "available_terms": [
    {"months": 24, "monthly_payment": 650, "apr": 9.99},
    {"months": 36, "monthly_payment": 450, "apr": 10.99},
    {"months": 48, "monthly_payment": 350, "apr": 11.99}
  ],
  "selected_term_months": 36,
  "monthly_payment": "450.00",
  "apr": "10.99",
  "prequal_completed_at": "2026-01-21T15:02:00Z",
  "expires_at": "2026-02-20T15:02:00Z",
  "created_at": "2026-01-21T15:00:00Z",
  "updated_at": "2026-01-21T15:02:00Z"
}
```

---

### Entity: notifications

**Purpose**: Tracks all sent notifications (email/SMS) for delivery status and debugging (F10).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| order_id | uuid | No | FK → orders.id | Associated order if applicable |
| quote_id | uuid | No | FK → quotes.id | Associated quote if applicable |
| lead_id | uuid | No | FK → leads.id | Associated lead if applicable |
| type | text | Yes | 'email' \| 'sms' | Notification channel |
| template_name | text | Yes | Max 100 chars | Template identifier |
| recipient | text | Yes | Email or phone | Recipient address |
| subject | text | No | Max 200 chars | Email subject line |
| content_preview | text | No | Max 500 chars | First N chars of content |
| status | text | Yes | 'pending' \| 'queued' \| 'sent' \| 'delivered' \| 'failed' \| 'bounced' | Delivery status |
| provider | text | Yes | 'resend' \| 'signalwire' | Delivery provider |
| provider_message_id | text | No | Max 100 chars | Provider's message ID |
| sent_at | timestamp | No | UTC | When message sent |
| delivered_at | timestamp | No | UTC | When delivery confirmed |
| failed_at | timestamp | No | UTC | When delivery failed |
| failure_reason | text | No | Max 500 chars | Failure details |
| metadata | jsonb | No | JSON object | Additional context |
| created_at | timestamp | Yes | Auto-set, UTC | Record creation timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| order | Order | N:1 | Associated order |
| quote | Quote | N:1 | Associated quote |
| lead | Lead | N:1 | Associated lead |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| notifications_order_idx | order_id | btree | Find notifications for order |
| notifications_quote_idx | quote_id | btree | Find notifications for quote |
| notifications_provider_idx | provider_message_id | btree | Webhook lookups |
| notifications_status_idx | status, created_at | btree | Queue processing |

**Lifecycle**:
- **Created**: When notification queued
- **Modified**: Provider webhooks update delivery status
- **Deleted**: Retained for 90 days, then purged

**Example Instance**:
```json
{
  "id": "b4c5d6e7-f8a9-0123-4567-890123456789",
  "order_id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "type": "email",
  "template_name": "order_confirmation",
  "recipient": "richard@example.com",
  "subject": "Your Roofing Project is Confirmed! - RR-A1B2C3",
  "status": "delivered",
  "provider": "resend",
  "provider_message_id": "msg_xyz789",
  "sent_at": "2026-01-21T15:20:05Z",
  "delivered_at": "2026-01-21T15:20:08Z",
  "created_at": "2026-01-21T15:20:00Z"
}
```

---

### Entity: webhook_events

**Purpose**: Idempotent webhook processing log for debugging and replay (all integrations).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| event_id | text | Yes | Unique, max 200 chars | Provider's event ID for idempotency |
| source | text | Yes | 'stripe' \| 'documenso' \| 'calcom' \| 'wisetack' \| 'roofr' \| 'signalwire' \| 'resend' | Webhook source |
| event_type | text | Yes | Max 100 chars | Event type (e.g., 'payment_intent.succeeded') |
| payload | jsonb | Yes | JSON object | Full webhook payload |
| signature_valid | boolean | Yes | Default true | Whether signature verified |
| status | text | Yes | 'received' \| 'processing' \| 'processed' \| 'failed' \| 'ignored' | Processing status |
| processed_at | timestamp | No | UTC | When processing completed |
| error_message | text | No | Max 500 chars | Error details if failed |
| retry_count | integer | Yes | Default 0 | Number of processing attempts |
| next_retry_at | timestamp | No | UTC | When to retry if failed |
| created_at | timestamp | Yes | Auto-set, UTC | Webhook receipt timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| (none) | - | - | Standalone audit table |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| webhook_events_event_id_idx | event_id | unique | Idempotency check |
| webhook_events_source_type_idx | source, event_type | btree | Filter by source/type |
| webhook_events_status_idx | status, next_retry_at | btree | Retry processing |
| webhook_events_created_idx | created_at | btree | Cleanup old events |

**Lifecycle**:
- **Created**: Immediately when webhook received (before processing)
- **Modified**: Updated during and after processing
- **Deleted**: Purged after 90 days

**Example Instance**:
```json
{
  "id": "c5d6e7f8-a9b0-1234-5678-901234567890",
  "event_id": "evt_3MqtYZ2eZvKYlo2C1234567",
  "source": "stripe",
  "event_type": "payment_intent.succeeded",
  "payload": {"id": "pi_...", "object": "payment_intent", "...": "..."},
  "signature_valid": true,
  "status": "processed",
  "processed_at": "2026-01-21T15:15:05Z",
  "retry_count": 0,
  "created_at": "2026-01-21T15:15:03Z"
}
```

---

### Entity: pricing_tiers

**Purpose**: Configuration for Good/Better/Best package definitions (F28).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| tier | enum | Yes | tier enum, unique | Tier identifier |
| name | text | Yes | Max 100 chars | Display name (e.g., "Better Package") |
| tagline | text | No | Max 200 chars | Marketing tagline |
| material_cost_per_sqft | decimal(6,2) | Yes | Positive number | Material cost per square foot |
| shingle_type | text | Yes | Max 200 chars | Shingle product name |
| shingle_brand | text | No | Max 100 chars | Manufacturer name |
| warranty_years | integer | Yes | Positive integer | Workmanship warranty years |
| manufacturer_warranty_years | integer | No | Positive integer | Material warranty years |
| description | text | No | Max 1000 chars | Detailed description |
| features | jsonb | No | Array of strings | Feature bullet points |
| is_recommended | boolean | Yes | Default false | Show "Recommended" badge |
| is_active | boolean | Yes | Default true | Whether tier is available |
| sort_order | integer | Yes | Default 0 | Display order |
| created_at | timestamp | Yes | Auto-set, UTC | Creation timestamp |
| updated_at | timestamp | Yes | Auto-update, UTC | Last modification timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| (none) | - | - | Configuration table |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| pricing_tiers_tier_idx | tier | unique | Lookup by tier |
| pricing_tiers_active_idx | is_active, sort_order | btree | Active tiers ordered |

**Lifecycle**:
- **Created**: Seeded during initial deployment
- **Modified**: Updated by admin for pricing changes
- **Deleted**: Soft delete via is_active = false

**Example Instance**:
```json
{
  "id": "d6e7f8a9-b0c1-2345-6789-012345678901",
  "tier": "better",
  "name": "Better Package",
  "tagline": "Our most popular choice",
  "material_cost_per_sqft": "3.50",
  "shingle_type": "Architectural Shingles",
  "shingle_brand": "Owens Corning Duration",
  "warranty_years": 25,
  "manufacturer_warranty_years": 50,
  "description": "Premium architectural shingles with enhanced durability and curb appeal.",
  "features": [
    "Architectural shingles",
    "25-year workmanship warranty",
    "50-year manufacturer warranty",
    "Algae resistance",
    "Enhanced wind rating"
  ],
  "is_recommended": true,
  "is_active": true,
  "sort_order": 2,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-21T10:00:00Z"
}
```

---

### Entity: pricing_config

**Purpose**: Key-value configuration for pricing rules (F27, F29).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| key | text | Yes | Unique, max 100 chars | Configuration key |
| value | text | Yes | Max 500 chars | Configuration value |
| value_type | text | Yes | 'string' \| 'number' \| 'boolean' \| 'json' | Value data type |
| description | text | No | Max 500 chars | Human-readable description |
| category | text | No | Max 50 chars | Grouping category |
| updated_at | timestamp | Yes | Auto-update, UTC | Last modification timestamp |
| updated_by | text | No | Max 100 chars | Who last updated |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| (none) | - | - | Configuration table |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| pricing_config_key_idx | key | unique | Fast key lookup |
| pricing_config_category_idx | category | btree | Filter by category |

**Lifecycle**:
- **Created**: Seeded during initial deployment
- **Modified**: Updated by admin as needed
- **Deleted**: Soft delete; historical values retained

**Expected Keys**:
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| deposit_percentage | number | 0.10 | Deposit as percentage of total |
| deposit_minimum | number | 500 | Minimum deposit amount |
| deposit_maximum | number | 2500 | Maximum deposit amount |
| labor_cost_per_sqft | number | 1.75 | Base labor cost per sqft |
| permit_cost | number | 250 | Permit cost estimate |
| disposal_cost_per_sqft | number | 0.35 | Disposal cost per sqft |
| complexity_multiplier_simple | number | 1.0 | Simple roof multiplier |
| complexity_multiplier_moderate | number | 1.15 | Moderate roof multiplier |
| complexity_multiplier_complex | number | 1.3 | Complex roof multiplier |
| pitch_multiplier_standard | number | 1.0 | Standard pitch (4:12 - 7:12) |
| pitch_multiplier_steep | number | 1.10 | Steep pitch (8:12 - 10:12) |
| pitch_multiplier_very_steep | number | 1.20 | Very steep pitch (>10:12) |
| quote_validity_days | number | 30 | Days until quote expires |

**Example Instance**:
```json
{
  "id": "e7f8a9b0-c1d2-3456-7890-123456789012",
  "key": "deposit_percentage",
  "value": "0.10",
  "value_type": "number",
  "description": "Deposit as percentage of total project price",
  "category": "deposit",
  "updated_at": "2026-01-01T00:00:00Z",
  "updated_by": "system"
}
```

---

### Entity: out_of_area_leads

**Purpose**: Captures leads from outside service area for future expansion (F01).

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | uuid | Yes | Primary key, auto-generated | Unique identifier |
| email | text | Yes | Valid email format | Contact email |
| zip | text | Yes | 5-digit format | ZIP code entered |
| city | text | No | Max 100 chars | City if known |
| state | text | No | 2 chars | State abbreviation |
| address | text | No | Max 500 chars | Full address if entered |
| ip_address | text | No | IPv4 or IPv6 | Capture IP |
| user_agent | text | No | Max 500 chars | Browser info |
| utm_source | text | No | Max 100 chars | UTM tracking |
| utm_medium | text | No | Max 100 chars | UTM tracking |
| utm_campaign | text | No | Max 100 chars | UTM tracking |
| notified | boolean | Yes | Default false | Whether expansion email sent |
| notified_at | timestamp | No | UTC | When notification sent |
| created_at | timestamp | Yes | Auto-set, UTC | Capture timestamp |

**Relationships**:
| Relationship | Target | Cardinality | Description |
|--------------|--------|-------------|-------------|
| (none) | - | - | Standalone capture table |

**Indexes**:
| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| out_of_area_leads_email_idx | email | btree | Lookup by email |
| out_of_area_leads_zip_idx | zip | btree | Expansion planning |
| out_of_area_leads_notified_idx | notified | btree | Find un-notified leads |

**Lifecycle**:
- **Created**: When user enters address outside service area (TX/GA/NC/AZ) (F01)
- **Modified**: When expansion notification sent
- **Deleted**: Retained for market analysis; purged after 2 years

**Example Instance**:
```json
{
  "id": "f8a9b0c1-d2e3-4567-8901-234567890123",
  "email": "interested@example.com",
  "zip": "90210",
  "city": "Beverly Hills",
  "state": "CA",
  "notified": false,
  "created_at": "2026-01-21T14:00:00Z"
}
```

---

## Data Types and Enums

### Enumerations

**Enum: quote_status**
| Value | Description |
|-------|-------------|
| preliminary | Initial estimate based on property data |
| measuring | Roofr measurement requested |
| final | Detailed measurement-based quote ready |
| selected | Customer selected a package |
| signed | Contract signed |
| paid | Deposit paid |
| expired | Quote validity period ended |

**Enum: tier**
| Value | Description |
|-------|-------------|
| good | Basic package (3-tab shingles, 10-year warranty) |
| better | Mid-tier package (architectural, 25-year warranty) |
| best | Premium package (premium architectural, 50-year warranty) |

**Enum: order_status**
| Value | Description |
|-------|-------------|
| pending | Order created, awaiting scheduling |
| signed | Contract signed |
| materials_ordered | Materials procurement started |
| crew_scheduled | Crew assigned to job |
| in_progress | Installation underway |
| complete | Job finished |
| cancelled | Order cancelled |

### Custom Types

**Type: PricingData (JSONB)**
```typescript
{
  good: {
    total: number;
    materials: number;
    labor: number;
    permits: number;
    disposal: number;
    warranty: number;
    adjustments: number;
  };
  better: { /* same structure */ };
  best: { /* same structure */ };
}
```

**Type: FinancingTerms (JSONB)**
```typescript
{
  months: number;
  monthly_payment: number;
  apr: number;
  total_cost: number;
}[]
```

**Type: UTMParams**
```typescript
{
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}
```

---

## Validation Rules

### Field-Level Validation

| Entity | Field | Rule | Error Message |
|--------|-------|------|---------------|
| leads | email | Valid email format (regex) | "Please enter a valid email address" |
| leads | phone | E.164 format or 10-digit US | "Please enter a valid phone number" |
| leads | state | Must be 'TX', 'GA', 'NC', or 'AZ' for service area | "We currently serve Texas, Georgia, North Carolina, and Arizona" |
| leads | zip | 5-digit numeric | "Please enter a valid ZIP code" |
| quotes | total_price | Must be positive | "Price must be greater than zero" |
| quotes | deposit_amount | Between 500 and 2500 | "Deposit must be between $500 and $2,500" |
| payments | amount | Must be positive | "Payment amount must be greater than zero" |
| sms_consents | consent_text | Non-empty string | "Consent text is required" |
| quote_photos | file_size_bytes | Max 10MB (10485760) | "File size must be under 10MB" |
| quote_photos | mime_type | Must match image/* | "Only image files are allowed" |
| appointments | scheduled_start | Must be in future | "Appointment must be scheduled for a future date" |

### Entity-Level Validation

| Entity | Rule | Description |
|--------|------|-------------|
| quotes | selected_tier_requires_pricing | selected_tier can only be set if pricing_data exists |
| quotes | deposit_requires_total | deposit_amount requires total_price to be set |
| orders | contract_must_be_signed | order creation requires contract.status = 'signed' |
| orders | balance_calculation | balance_amount must equal total_amount - deposit_amount |
| appointments | max_reschedules | reschedule_count must be <= 2 |
| appointments | no_past_appointments | scheduled_start must be > now() for new appointments |
| payments | deposit_before_balance | 'deposit' payment required before 'balance' payment |

### Business Rules

| Rule | Entities Involved | Description |
|------|-------------------|-------------|
| service_area_validation | leads, quotes | Address must be in TX, GA, NC, or AZ for quote creation |
| sms_requires_consent | notifications, sms_consents | SMS can only be sent if active consent exists for phone |
| deposit_formula | quotes, pricing_config | deposit = min(max(total * 0.10, 500), 2500) |
| quote_expiration | quotes | Quotes expire 30 days after creation |
| reschedule_limit | appointments | Max 2 reschedules; beyond that requires phone call |
| consent_versioning | sms_consents | New consent record required if consent_text changes |

---

## Persistence Strategy

### Chosen Strategy

| Data Category | Storage Type | Technology | Rationale |
|---------------|--------------|------------|-----------|
| Core business data | SQL | Neon PostgreSQL | Transactional integrity, relationships, complex queries |
| Session state | Memory + URL | React state + searchParams | Ephemeral, reconstructible |
| File storage | Object storage | Vercel Blob | Photos, PDFs, scalable |
| Cache | Memory | TanStack Query | Server state caching in browser |

### Storage Location Mapping

| Entity | Storage | Table/Collection/File | Notes |
|--------|---------|----------------------|-------|
| leads | Neon PostgreSQL | leads | Primary lead storage |
| quotes | Neon PostgreSQL | quotes | Quote data with JSONB pricing |
| measurements | Neon PostgreSQL | measurements | Raw Roofr responses in JSONB |
| contracts | Neon PostgreSQL | contracts | Metadata; PDFs in Blob storage |
| orders | Neon PostgreSQL | orders | Denormalized for portal queries |
| payments | Neon PostgreSQL | payments | Financial records |
| appointments | Neon PostgreSQL | appointments | Booking records |
| sms_consents | Neon PostgreSQL | sms_consents | TCPA compliance |
| quote_shares | Neon PostgreSQL | quote_shares | Short-lived tokens |
| quote_photos | Neon PostgreSQL + Blob | quote_photos (metadata), Blob (files) | Hybrid storage |
| quote_line_items | Neon PostgreSQL | quote_line_items | Pricing breakdown |
| order_status_history | Neon PostgreSQL | order_status_history | Immutable audit log |
| financing_applications | Neon PostgreSQL | financing_applications | Pre-qual records |
| notifications | Neon PostgreSQL | notifications | Delivery tracking |
| webhook_events | Neon PostgreSQL | webhook_events | Idempotency + debugging |
| pricing_tiers | Neon PostgreSQL | pricing_tiers | Business config |
| pricing_config | Neon PostgreSQL | pricing_config | Key-value config |
| out_of_area_leads | Neon PostgreSQL | out_of_area_leads | Expansion planning |

### Sensitive Data Handling

| Data | Sensitivity Level | Storage Approach | Encryption |
|------|-------------------|------------------|------------|
| Customer email | PII | Standard storage | At rest (Neon default) |
| Customer phone | PII | Standard storage | At rest (Neon default) |
| Customer name | PII | Standard storage | At rest (Neon default) |
| Customer address | PII | Standard storage | At rest (Neon default) |
| IP addresses | PII | Standard storage | At rest (Neon default) |
| Payment card data | PCI | NOT stored - Stripe handles | N/A - tokenized |
| Bank account data | PCI | NOT stored - Stripe handles | N/A - tokenized |
| Signed contracts | Confidential | Blob storage with presigned URLs | At rest (Vercel default) |
| TCPA consent | Legal/Compliance | Immutable records | At rest (Neon default) |

---

## State Management (UI Application)

### Global State Structure

```typescript
AppState {
  // Server state (TanStack Query)
  serverState: {
    quote: Quote | null;           // Current quote being viewed/edited
    order: Order | null;           // Current order in portal
    user: ClerkUser | null;        // Authenticated user
  };

  // Form state (React Hook Form)
  formState: {
    addressForm: { address, city, state, zip };
    contactForm: { email, phone, firstName, lastName };
    paymentForm: { /* managed by Stripe Elements */ };
  };

  // URL state (Next.js searchParams)
  urlState: {
    step: 'address' | 'estimate' | 'packages' | 'financing' | 'schedule' | 'sign' | 'pay' | 'confirm';
    tier?: 'good' | 'better' | 'best';
    quoteId?: string;
  };

  // Context state (React Context)
  contextState: {
    theme: 'light';                // Theme (light only for MVP)
    toasts: Toast[];               // Notification queue
  };

  // Local state (Component state)
  uiState: {
    isLoading: boolean;
    modalOpen: string | null;
    expandedSections: string[];
  };
}
```

### State Domains

**Domain: Quote Session**
| Key | Type | Source | Description |
|-----|------|--------|-------------|
| currentQuote | Quote | API/TanStack Query | Active quote data |
| selectedTier | tier enum | URL state | Currently selected package |
| scheduledSlot | CalendarSlot | Local state | Selected appointment slot |
| financingStatus | string | API | Pre-qual status |

**Domain: Portal**
| Key | Type | Source | Description |
|-----|------|--------|-------------|
| userOrders | Order[] | API/TanStack Query | User's orders |
| activeOrder | Order | API/TanStack Query | Currently viewed order |
| orderStatus | StatusHistory[] | API | Order timeline |

### State Synchronization

| State | Sync Strategy | Trigger | Conflict Resolution |
|-------|---------------|---------|---------------------|
| quote.status | Push | Status change events | Server wins |
| quote.selectedTier | Push | User selection | Optimistic update, rollback on error |
| order.status | Pull | Polling (15 min) / Webhooks | Server wins |
| appointment | Pull | Cal.com webhooks | Server wins |
| payment.status | Pull | Stripe webhooks | Server wins |

---

## Data Flow Diagrams

### Flow: Quote Creation (F01 → F02)

**Trigger**: User enters valid address and submits

```
[Browser]                    [Next.js Server]                    [External Services]
    │                              │                                     │
    │  1. POST /api/quotes         │                                     │
    │  { address, city, state }    │                                     │
    │─────────────────────────────►│                                     │
    │                              │  2. Validate address                │
    │                              │     (service area check)            │
    │                              │                                     │
    │                              │  3. Create lead record              │
    │                              │     INSERT INTO leads               │
    │                              │                                     │
    │                              │  4. Create quote record             │
    │                              │     INSERT INTO quotes              │
    │                              │     status = 'preliminary'          │
    │                              │                                     │
    │                              │  5. Calculate preliminary pricing   │
    │                              │     (F27-F29 business rules)        │
    │                              │                                     │
    │                              │  6. Create line items               │
    │                              │     INSERT INTO quote_line_items    │
    │                              │                                     │
    │                              │  7. Sync to CRM                     │
    │                              │─────────────────────────────────────►│
    │                              │     JobNimbus: Create contact/job   │
    │                              │◄─────────────────────────────────────│
    │                              │                                     │
    │  8. Return quote + pricing   │                                     │
    │◄─────────────────────────────│                                     │
    │                              │                                     │
    │  9. Redirect to /quote/{id}  │                                     │
```

**Side Effects**:
- Lead record created in database
- Quote record created with preliminary status
- JobNimbus contact and job created (async)
- Analytics event fired

---

### Flow: Checkout Completion (F08 → F09 → F10)

**Trigger**: User completes e-signature and payment

```
[Browser]                    [Next.js Server]                    [External Services]
    │                              │                                     │
    │  ══════════ E-SIGNATURE FLOW ══════════                           │
    │                              │                                     │
    │  1. User signs contract      │                                     │
    │     (Documenso embed)        │                                     │
    │─────────────────────────────►│                                     │
    │                              │─────────────────────────────────────►│
    │                              │     Documenso: Submit signature      │
    │                              │◄─────────────────────────────────────│
    │                              │                                     │
    │                              │  2. Webhook: document.completed     │
    │                              │◄─────────────────────────────────────│
    │                              │     Documenso                       │
    │                              │                                     │
    │                              │  3. Update contract record          │
    │                              │     status = 'signed'               │
    │                              │                                     │
    │  ══════════ PAYMENT FLOW ══════════                               │
    │                              │                                     │
    │  4. POST /api/payments       │                                     │
    │     { quoteId, paymentMethod }│                                    │
    │─────────────────────────────►│                                     │
    │                              │  5. Create payment intent           │
    │                              │─────────────────────────────────────►│
    │                              │     Stripe: PaymentIntent.create    │
    │                              │◄─────────────────────────────────────│
    │                              │                                     │
    │  6. Confirm payment (client) │                                     │
    │─────────────────────────────►│─────────────────────────────────────►│
    │                              │     Stripe: PaymentIntent.confirm   │
    │                              │◄─────────────────────────────────────│
    │                              │                                     │
    │                              │  7. Webhook: payment_intent.succeeded
    │                              │◄─────────────────────────────────────│
    │                              │     Stripe                          │
    │                              │                                     │
    │  ══════════ ORDER CREATION ══════════                             │
    │                              │                                     │
    │                              │  8. Create order record             │
    │                              │     INSERT INTO orders              │
    │                              │     Generate confirmation_number    │
    │                              │                                     │
    │                              │  9. Confirm Cal.com booking         │
    │                              │─────────────────────────────────────►│
    │                              │     Cal.com: Confirm hold           │
    │                              │◄─────────────────────────────────────│
    │                              │                                     │
    │                              │  10. Send notifications             │
    │                              │─────────────────────────────────────►│
    │                              │     Resend: Confirmation email      │
    │                              │     SignalWire: Confirmation SMS    │
    │                              │◄─────────────────────────────────────│
    │                              │                                     │
    │                              │  11. Sync to CRM                    │
    │                              │─────────────────────────────────────►│
    │                              │     JobNimbus: Update job status    │
    │                              │◄─────────────────────────────────────│
    │                              │                                     │
    │  12. Redirect to /confirm    │                                     │
    │◄─────────────────────────────│                                     │
```

**Side Effects**:
- Contract marked as signed
- Payment record created
- Order record created with confirmation number
- Appointment confirmed
- Email + SMS sent
- JobNimbus updated
- Clerk user created (if not exists)

---

## Migration Strategy

### Migration Approach

**Strategy**: Forward-only migrations with Drizzle Kit

**Tool/Process**: Drizzle Kit (`drizzle-kit push` for dev, `drizzle-kit generate` + `drizzle-kit migrate` for production)

### Migration Guidelines

1. **Forward-only**: No rollback support in production; fix-forward approach
2. **Zero-downtime**: Use additive changes; avoid dropping columns in use
3. **Data preservation**: Always migrate data before dropping columns
4. **Testing**: Run migrations against Neon branch before production

### Migration Process

```bash
# Development: Direct push to dev branch
pnpm drizzle-kit push

# Production: Generate and apply migration
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Preview environments: Use Neon branching
# Each preview gets its own database branch
```

### Version History

| Version | Date | Changes | Migration Notes |
|---------|------|---------|-----------------|
| 1.0.0 | 2026-01-XX | Initial schema | 18 tables, seed pricing config |

---

## Query Patterns

### Read Patterns

| Query | Frequency | Entities | Indexes Needed |
|-------|-----------|----------|----------------|
| Get quote by ID | High | quotes, measurements, quote_line_items | quotes.id (PK) |
| Get order for portal | High | orders, payments, appointments, status_history | orders.clerk_user_id |
| Find quote by share token | Medium | quote_shares, quotes | quote_shares.token (unique) |
| Check SMS consent | Medium | sms_consents | sms_consents.phone, is_active |
| Get pricing tiers | High | pricing_tiers | pricing_tiers.is_active |
| Webhook idempotency check | High | webhook_events | webhook_events.event_id (unique) |

### Write Patterns

| Operation | Frequency | Entities | Transaction Required |
|-----------|-----------|----------|---------------------|
| Create quote | High | leads, quotes, quote_line_items | Yes |
| Update quote status | Medium | quotes, order_status_history | Yes |
| Process payment | Medium | payments, orders | Yes |
| Create order | Low | orders, order_status_history | Yes |
| Record consent | Low | sms_consents | No |
| Log webhook | High | webhook_events | No |

### Performance Considerations

| Concern | Pattern | Mitigation |
|---------|---------|------------|
| Quote pricing calculation | Computed on every tier display | Cache pricing_data JSONB; recalculate only on measurement update |
| Order status timeline | Multiple joins for timeline view | Denormalize recent status to orders table; query history for full timeline |
| Webhook deduplication | Every webhook checks for duplicate | Unique index on event_id; use bloom filter cache for hot events |
| Photo retrieval | Multiple photos per quote | Paginate; use presigned URLs with edge caching |
| CRM sync latency | Blocking user flow | Queue all CRM operations; async processing |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [07-technical-architecture.md](./07-technical-architecture.md) | Contains preliminary schema this doc expands |
| [09-api-contracts.md](./09-api-contracts.md) | API endpoints that expose this data |
| [04-feature-breakdown.md](./04-feature-breakdown.md) | Features driving data requirements |
| [INTEGRATION-SPECS.md](./INTEGRATION-SPECS.md) | External integrations with data contracts |
| [03-product-requirements.md](./03-product-requirements.md) | Business requirements driving data needs |
| [11-security-considerations.md](./11-security-considerations.md) | Security requirements for data |

---

## Document Completion Checklist

- [x] All entities from features (doc 04) are defined (18 tables)
- [x] All relationships have cardinality documented
- [x] ER diagram created (ASCII)
- [x] Validation rules cover all constraints
- [x] Persistence strategy chosen and justified
- [x] Sensitive data handling documented
- [x] Migration approach defined
- [x] Query patterns documented
- [x] Related Documents links included

**Status: COMPLETE**
