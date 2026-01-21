# 07 - Technical Architecture

> **Purpose:** Defines the system architecture for the Results Roofing web application. This document bridges design specifications (docs 05-06) with implementation patterns (docs 08-17).

**Status:** COMPLETE
**Last Updated:** 2026-01-21

---

## Architecture Pattern Selection

**Primary Pattern:** Server-Rendered Architecture (SSR)

| Project Type | Primary Pattern | Rationale |
|--------------|-----------------|-----------|
| Web SSR | Next.js App Router | SEO for marketing pages, fast initial paint, server-side data fetching, React Server Components for performance |

This application is a conversion-focused web app where:
- Landing pages need SEO for organic traffic
- Initial load performance directly impacts conversion rates
- Quote data should be server-rendered for security and performance
- Portal pages benefit from server components for data fetching

---

## System Architecture Diagram

### High-Level Overview

```
                                    RESULTS ROOFING ARCHITECTURE
    ┌─────────────────────────────────────────────────────────────────────────────────────┐
    │                                      CLIENTS                                         │
    │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                          │
    │   │   Mobile     │    │   Desktop    │    │   Tablet     │                          │
    │   │   Browser    │    │   Browser    │    │   Browser    │                          │
    │   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                          │
    └──────────┼───────────────────┼───────────────────┼──────────────────────────────────┘
               │                   │                   │
               └───────────────────┼───────────────────┘
                                   │ HTTPS
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────┐
    │                              VERCEL EDGE NETWORK                                     │
    │   ┌─────────────────────────────────────────────────────────────────────────────┐   │
    │   │  CDN (Static Assets)  │  Edge Functions  │  SSL/TLS  │  DDoS Protection   │   │
    │   └─────────────────────────────────────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────┐
    │                           VERCEL APPLICATION SERVER                                  │
    │                                                                                      │
    │   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────────────┐   │
    │   │  Next.js App    │   │  API Routes     │   │  Serverless Functions           │   │
    │   │  Router         │   │  /api/*         │   │  (Webhooks, Background Jobs)    │   │
    │   │                 │   │                 │   │                                 │   │
    │   │  Server         │   │  Route          │   │  Webhook Handlers:              │   │
    │   │  Components     │   │  Handlers       │   │  - /api/webhooks/stripe         │   │
    │   │                 │   │                 │   │  - /api/webhooks/documenso      │   │
    │   │  Client         │   │  Server         │   │  - /api/webhooks/calcom         │   │
    │   │  Components     │   │  Actions        │   │  - /api/webhooks/wisetack       │   │
    │   └────────┬────────┘   └────────┬────────┘   └───────────────┬─────────────────┘   │
    │            │                     │                            │                      │
    │            └─────────────────────┼────────────────────────────┘                      │
    │                                  │                                                   │
    │   ┌─────────────────────────────────────────────────────────────────────────────┐   │
    │   │                         MIDDLEWARE LAYER                                     │   │
    │   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐   │   │
    │   │  │  Auth   │  │  Rate   │  │ Logging │  │  CORS   │  │  Error Handler  │   │   │
    │   │  │ (Clerk) │  │ Limiting│  │         │  │         │  │                 │   │   │
    │   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘   │   │
    │   └─────────────────────────────────────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────────────────────────────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
               ▼                   ▼                   ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────────────────────┐
    │  NEON POSTGRESQL │ │   VERCEL BLOB    │ │           EXTERNAL SERVICES              │
    │                  │ │   (File Storage) │ │                                          │
    │  - quotes        │ │                  │ │  ┌────────────┐  ┌────────────────────┐  │
    │  - orders        │ │  - Contracts     │ │  │   Clerk    │  │    Google Places   │  │
    │  - leads         │ │  - Photos        │ │  │   (Auth)   │  │    (Address API)   │  │
    │  - measurements  │ │  - Documents     │ │  └────────────┘  └────────────────────┘  │
    │  - payments      │ │                  │ │                                          │
    │  - appointments  │ └──────────────────┘ │  ┌────────────┐  ┌────────────────────┐  │
    │  - consents      │                      │  │   Stripe   │  │      Roofr         │  │
    │                  │                      │  │ (Payments) │  │   (Measurements)   │  │
    └──────────────────┘                      │  └────────────┘  └────────────────────┘  │
                                              │                                          │
                                              │  ┌────────────┐  ┌────────────────────┐  │
                                              │  │  Cal.com   │  │    Documenso       │  │
                                              │  │ (Booking)  │  │   (E-Signature)    │  │
                                              │  └────────────┘  └────────────────────┘  │
                                              │                                          │
                                              │  ┌────────────┐  ┌────────────────────┐  │
                                              │  │  Wisetack  │  │    JobNimbus       │  │
                                              │  │(Financing) │  │      (CRM)         │  │
                                              │  └────────────┘  └────────────────────┘  │
                                              │                                          │
                                              │  ┌────────────┐  ┌────────────────────┐  │
                                              │  │ SignalWire │  │      Resend        │  │
                                              │  │   (SMS)    │  │     (Email)        │  │
                                              │  └────────────┘  └────────────────────┘  │
                                              └──────────────────────────────────────────┘
```

### Data Flow Diagram

```
QUOTE FLOW DATA LIFECYCLE

[1. Address Entry]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Google Places API  →  Validate Address  →  Check Service Area      │
│                              │                                       │
│                              ▼                                       │
│                    ┌─────────────────┐                               │
│                    │  Create Lead    │  →  JobNimbus Sync (async)   │
│                    │  in Database    │                               │
│                    └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
[2. Preliminary Quote]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Pricing Engine (F27-F29)  →  Calculate Tier Prices                 │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  Property Data   │  Tier Config  │  Complexity Rules    │        │
│  │  (estimated sqft)│  (materials)  │  (multipliers)       │        │
│  └─────────────────────────────────────────────────────────┘        │
│         │                                                            │
│         ▼                                                            │
│  Store Quote (status: preliminary)  →  Trigger Roofr Request        │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
[3. Detailed Quote - Async]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Roofr Webhook  →  Store Measurements  →  Recalculate Quote         │
│        │                                                             │
│        ▼                                                             │
│  Update Quote (status: final)  →  Notify User (Email/SMS)           │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
[4. Checkout Flow]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Package Selection  →  Financing (Optional)  →  Schedule Booking    │
│         │                    │                        │              │
│         │              Wisetack API            Cal.com API           │
│         │                    │                        │              │
│         ▼                    ▼                        ▼              │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  Update Quote  │  Store Financing  │  Hold Appointment  │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
[5. Contract & Payment]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Generate Contract  →  Documenso Sign  →  Stripe Payment            │
│         │                    │                    │                  │
│         ▼                    ▼                    ▼                  │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  Store Contract  │  Update Status   │  Record Payment   │        │
│  │  PDF             │  via Webhook     │  via Webhook      │        │
│  └─────────────────────────────────────────────────────────┘        │
│         │                                                            │
│         ▼                                                            │
│  Create Order  →  Confirm Booking  →  Send Notifications            │
│                         │                    │                       │
│                   Cal.com API          Resend + SignalWire           │
│                         │                                            │
│                         ▼                                            │
│                  JobNimbus Full Sync                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Runtime** | Node.js | 20.x LTS | Active LTS, Vercel optimized |
| **Framework** | Next.js | 14.x | App Router, RSC, Vercel integration |
| **Language** | TypeScript | 5.x | Type safety, IDE support, catch errors early |
| **React** | React | 18.x | Server Components, Suspense, concurrent features |
| **Database** | Neon PostgreSQL | Latest | Serverless Postgres, Vercel integration, branching |
| **ORM** | Drizzle ORM | 0.29+ | Type-safe, lightweight, great DX |
| **Auth** | Clerk | Latest | Managed auth, magic links, session management |
| **Styling** | CSS Modules | - | Scoped CSS, design tokens, no runtime cost |
| **Components** | Ark UI | 3.x | Headless, accessible, composable |
| **Forms** | React Hook Form | 7.x | Performance, validation integration |
| **Validation** | Zod | 3.x | Schema validation, TypeScript inference |
| **Server State** | TanStack Query | 5.x | Caching, revalidation, optimistic updates |
| **Payments** | Stripe | Latest | PCI compliance, Elements, webhooks |
| **Email** | Resend | Latest | Developer-friendly, React Email templates |
| **Testing** | Vitest + Testing Library | Latest | Fast, Vite-compatible, component testing |
| **Hosting** | Vercel | - | Zero-config, edge functions, analytics |
| **File Storage** | Vercel Blob | - | Simple uploads, CDN-backed |

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@clerk/nextjs": "^4.29.0",
    "@neondatabase/serverless": "^0.7.0",
    "drizzle-orm": "^0.29.0",
    "@tanstack/react-query": "^5.17.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "@ark-ui/react": "^3.0.0",
    "@stripe/stripe-js": "^2.4.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "lucide-react": "^0.309.0",
    "resend": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "drizzle-kit": "^0.20.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## Frontend Architecture

### Next.js App Router Structure

```
src/
├── app/                          # App Router pages
│   ├── layout.tsx                # Root layout (providers, analytics)
│   ├── page.tsx                  # Landing page (marketing)
│   ├── globals.css               # Global styles + tokens
│   │
│   ├── (marketing)/              # Marketing route group
│   │   ├── layout.tsx            # Marketing layout (full header/footer)
│   │   ├── about/
│   │   └── contact/
│   │
│   ├── (quote)/                  # Quote flow route group
│   │   ├── layout.tsx            # Quote layout (progress indicator)
│   │   ├── page.tsx              # Address entry (F01)
│   │   ├── estimate/             # Preliminary quote (F02)
│   │   ├── packages/             # Package comparison (F04)
│   │   ├── checkout/             # Multi-step checkout
│   │   │   ├── financing/        # F06
│   │   │   ├── schedule/         # F07
│   │   │   ├── contract/         # F08
│   │   │   └── payment/          # F09
│   │   └── confirmation/         # F10
│   │
│   ├── (portal)/                 # Customer portal route group
│   │   ├── layout.tsx            # Portal layout (sidebar/tabs)
│   │   ├── portal/
│   │   │   ├── page.tsx          # Dashboard (F11)
│   │   │   ├── documents/        # F12
│   │   │   ├── schedule/         # F14
│   │   │   └── payments/         # F15
│   │   └── [[...sign-in]]/       # Clerk auth pages
│   │
│   ├── api/                      # API routes
│   │   ├── quotes/
│   │   ├── webhooks/
│   │   └── ...
│   │
│   └── share/                    # Public share routes
│       └── [token]/              # Shareable quote (F21)
│
├── components/                   # React components (per 06-component-specs.md)
├── lib/                          # Utilities and integrations
├── hooks/                        # Custom React hooks
└── types/                        # TypeScript type definitions
```

### Server Components vs Client Components

**Default: Server Components**

Server Components are the default. Use for:
- Pages that fetch data
- Static content
- SEO-critical content
- Components without interactivity

**Client Components (`'use client'`)**

Use client components only when needed:
- Interactive forms (React Hook Form)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, geolocation)
- Third-party client libraries (Stripe Elements)
- State that changes on user interaction

```
Component Classification:

SERVER COMPONENTS (default)          CLIENT COMPONENTS ('use client')
────────────────────────────────     ────────────────────────────────
- Page layouts                       - AddressAutocomplete (Google API)
- Header/Footer                      - PackageComparison (selection)
- StatusTimeline (display)           - DatePicker (interaction)
- DocumentList (display)             - PaymentForm (Stripe Elements)
- PriceBreakdown (display)           - Modal (open/close state)
- SummaryCard (display)              - Toast (notifications)
                                     - Form inputs (controlled state)
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT LAYERS                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  URL STATE (Router)                                              │   │
│   │  - Current step in funnel (/quote/packages)                      │   │
│   │  - Quote ID in URL params                                        │   │
│   │  - Portal section                                                │   │
│   │  Tool: Next.js useSearchParams, usePathname                      │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  SERVER STATE (TanStack Query)                                   │   │
│   │  - Quote data (quotes, pricing, measurements)                    │   │
│   │  - User projects (orders, appointments)                          │   │
│   │  - Available slots (Cal.com availability)                        │   │
│   │  Features: Caching, revalidation, optimistic updates             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  FORM STATE (React Hook Form + Zod)                              │   │
│   │  - Address input                                                 │   │
│   │  - Checkout forms (contact, payment)                             │   │
│   │  - Portal forms (reschedule)                                     │   │
│   │  Features: Validation, error messages, submission handling       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  CONTEXT STATE (React Context)                                   │   │
│   │  - Theme (light mode only for MVP)                               │   │
│   │  - Auth state (Clerk provides)                                   │   │
│   │  - Quote session (current quote in progress)                     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  LOCAL STATE (useState/useReducer)                               │   │
│   │  - UI toggles (modal open, accordion expanded)                   │   │
│   │  - Transient input values before submission                      │   │
│   │  - Loading/error states for individual operations                │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Fetching Patterns

**Server-Side Data Fetching (Preferred)**

```typescript
// app/(quote)/packages/page.tsx
export default async function PackagesPage({
  searchParams,
}: {
  searchParams: { quoteId: string };
}) {
  // Server-side data fetch
  const quote = await getQuoteById(searchParams.quoteId);
  const packages = await getPackagePricing(quote);

  return (
    <PackageComparison
      packages={packages}
      quoteId={quote.id}
    />
  );
}
```

**Client-Side Data Fetching (Interactive)**

```typescript
// For data that changes based on user interaction
'use client';

function AvailableSlots({ eventTypeId }: { eventTypeId: string }) {
  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', eventTypeId],
    queryFn: () => fetchAvailableSlots(eventTypeId),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading) return <SlotsSkeleton />;
  return <SlotPicker slots={slots} />;
}
```

**Server Actions (Mutations)**

```typescript
// app/actions/quote.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const SelectPackageSchema = z.object({
  quoteId: z.string().uuid(),
  tier: z.enum(['good', 'better', 'best']),
});

export async function selectPackage(formData: FormData) {
  const input = SelectPackageSchema.parse({
    quoteId: formData.get('quoteId'),
    tier: formData.get('tier'),
  });

  await db.update(quotes)
    .set({ selectedTier: input.tier, tierSelectedAt: new Date() })
    .where(eq(quotes.id, input.quoteId));

  // Sync to CRM
  await jobNimbusAdapter.updateJob(input.quoteId, { selectedTier: input.tier });

  revalidatePath(`/quote/packages`);
  redirect(`/quote/checkout/financing?quoteId=${input.quoteId}`);
}
```

---

## Backend Architecture

### API Routes Structure

```
src/app/api/
├── quotes/
│   ├── route.ts                    # POST: Create quote
│   ├── [quoteId]/
│   │   ├── route.ts                # GET: Get quote, PATCH: Update quote
│   │   └── share/
│   │       └── route.ts            # POST: Generate share link
│
├── measurements/
│   └── [quoteId]/
│       └── route.ts                # POST: Request measurement
│
├── financing/
│   └── prequal/
│       └── route.ts                # POST: Generate Wisetack link
│
├── appointments/
│   ├── availability/
│   │   └── route.ts                # GET: Available slots
│   ├── hold/
│   │   └── route.ts                # POST: Hold slot
│   └── [appointmentId]/
│       └── route.ts                # PATCH: Reschedule, DELETE: Cancel
│
├── contracts/
│   └── [quoteId]/
│       └── route.ts                # POST: Generate contract
│
├── payments/
│   ├── intent/
│   │   └── route.ts                # POST: Create payment intent
│   └── [paymentId]/
│       └── route.ts                # GET: Payment status
│
├── webhooks/
│   ├── stripe/
│   │   └── route.ts                # Stripe webhooks
│   ├── documenso/
│   │   └── route.ts                # E-signature webhooks
│   ├── calcom/
│   │   └── route.ts                # Booking webhooks
│   ├── wisetack/
│   │   └── route.ts                # Financing webhooks
│   └── roofr/
│       └── route.ts                # Measurement webhooks
│
└── internal/
    ├── sync-crm/
    │   └── route.ts                # Manual CRM sync trigger
    └── health/
        └── route.ts                # Health check endpoint
```

### Webhook Handler Pattern

All webhooks follow a consistent security and processing pattern:

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // 1. Get raw body for signature verification
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  // 2. Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3. Idempotency check
  const existingEvent = await db.query.webhookEvents.findFirst({
    where: eq(webhookEvents.eventId, event.id),
  });

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 4. Log event for debugging
  await db.insert(webhookEvents).values({
    eventId: event.id,
    type: event.type,
    payload: event,
    processedAt: null,
  });

  // 5. Return 200 immediately, process async
  // (In production, use a queue like Vercel KV or Inngest)
  processWebhookAsync(event);

  return NextResponse.json({ received: true });
}

async function processWebhookAsync(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      // ... other event types
    }

    // Mark as processed
    await db.update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(webhookEvents.eventId, event.id));
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Log error but don't throw - webhook already acknowledged
  }
}
```

### Server Actions Architecture

Server Actions handle form submissions and mutations:

```
src/app/actions/
├── quote.ts          # selectPackage, updateQuote, shareQuote
├── appointment.ts    # holdSlot, confirmBooking, reschedule
├── payment.ts        # createPaymentIntent, confirmPayment
├── contract.ts       # generateContract, recordSignature
├── lead.ts           # submitLead, updateLeadStatus
└── consent.ts        # recordTcpaConsent, updateConsent
```

**Action Pattern:**

```typescript
// src/app/actions/quote.ts
'use server';

import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// 1. Define input schema
const CreateQuoteSchema = z.object({
  address: z.object({
    formatted: z.string(),
    lat: z.number(),
    lng: z.number(),
    city: z.string(),
    state: z.enum(['TX', 'GA', 'NC', 'AZ']),
    zip: z.string(),
  }),
  replacementMotivation: z.enum(['pre_sale_prep', 'roof_age', 'carrier_requirement', 'curb_appeal', 'energy_efficiency', 'other']).optional(),
});

// 2. Export server action
export async function createQuote(
  input: z.infer<typeof CreateQuoteSchema>
) {
  // 3. Validate input
  const validated = CreateQuoteSchema.parse(input);

  // 4. Perform database operation
  const [quote] = await db.insert(quotes).values({
    id: crypto.randomUUID(),
    address: validated.address.formatted,
    lat: validated.address.lat,
    lng: validated.address.lng,
    city: validated.address.city,
    state: validated.address.state,
    zip: validated.address.zip,
    replacementMotivation: validated.replacementMotivation,
    status: 'preliminary',
    createdAt: new Date(),
  }).returning();

  // 5. Trigger async operations
  await Promise.all([
    // Create CRM lead (non-blocking)
    jobNimbusAdapter.createLead(quote).catch(console.error),
    // Request measurement (non-blocking)
    roofrAdapter.requestMeasurement(quote.address).catch(console.error),
  ]);

  // 6. Revalidate and redirect
  revalidatePath('/quote');
  redirect(`/quote/estimate?quoteId=${quote.id}`);
}
```

### Middleware

```typescript
// src/middleware.ts
import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default authMiddleware({
  // Public routes (no auth required)
  publicRoutes: [
    '/',
    '/quote(.*)',
    '/share/(.*)',
    '/api/webhooks/(.*)',
    '/api/quotes',
    '/api/quotes/(.*)',
    '/about',
    '/contact',
  ],

  // Routes that require authentication
  // Everything under /portal/* requires auth (default)

  afterAuth(auth, req) {
    // Custom middleware logic after Clerk auth

    // Rate limiting for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      // Implement rate limiting check
      // (use Vercel KV or edge config in production)
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## Database Architecture

### Database: Neon PostgreSQL

**Why Neon:**
- Serverless PostgreSQL (scales to zero, instant on)
- Vercel integration (auto connection string)
- Database branching (preview environments)
- Connection pooling included
- Generous free tier

### ORM: Drizzle

**Why Drizzle over Prisma:**
- Lighter weight, faster cold starts (important for serverless)
- SQL-like syntax (easier to reason about)
- Better TypeScript inference
- No binary dependencies

### Schema Design

```typescript
// src/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const quoteStatusEnum = pgEnum('quote_status', [
  'preliminary', 'measuring', 'final', 'selected', 'signed', 'paid', 'expired'
]);

export const tierEnum = pgEnum('tier', ['good', 'better', 'best']);

export const orderStatusEnum = pgEnum('order_status', [
  'pending', 'signed', 'materials_ordered', 'crew_scheduled', 'in_progress', 'complete', 'cancelled'
]);

// Tables
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email'),
  phone: text('phone'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zip: text('zip').notNull(),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  jobNimbusContactId: text('jobnimbus_contact_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id),
  status: quoteStatusEnum('status').default('preliminary').notNull(),

  // Address (denormalized for convenience)
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),

  // Replacement motivation (self-pay customers)
  replacementMotivation: text('replacement_motivation'), // 'pre_sale_prep' | 'roof_age' | 'carrier_requirement' | 'curb_appeal' | 'energy_efficiency' | 'other'

  // Measurements (populated by Roofr)
  measurementId: uuid('measurement_id'),
  sqftTotal: decimal('sqft_total', { precision: 10, scale: 2 }),
  pitchPrimary: decimal('pitch_primary', { precision: 4, scale: 2 }),
  complexity: text('complexity'), // 'simple' | 'moderate' | 'complex'

  // Pricing (calculated)
  pricingData: jsonb('pricing_data'), // { good: {...}, better: {...}, best: {...} }

  // Selection
  selectedTier: tierEnum('selected_tier'),
  tierSelectedAt: timestamp('tier_selected_at'),

  // Financing
  financingStatus: text('financing_status'), // 'approved' | 'declined' | 'pending'
  financingApplicationId: text('financing_application_id'),
  financingTerm: text('financing_term'),

  // Scheduling
  scheduledSlotId: text('scheduled_slot_id'),
  scheduledDate: timestamp('scheduled_date'),

  // Totals
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),

  // CRM
  jobNimbusJobId: text('jobnimbus_job_id'),

  // Timestamps
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const measurements = pgTable('measurements', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').references(() => quotes.id).notNull(),
  vendor: text('vendor').default('roofr').notNull(),
  vendorJobId: text('vendor_job_id'),
  status: text('status').default('pending').notNull(), // 'pending' | 'complete' | 'failed'

  // Results
  sqftTotal: decimal('sqft_total', { precision: 10, scale: 2 }),
  pitchPrimary: decimal('pitch_primary', { precision: 4, scale: 2 }),
  facetCount: decimal('facet_count'),
  complexity: text('complexity'),
  rawResponse: jsonb('raw_response'),

  // Timestamps
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').references(() => quotes.id).notNull(),

  // Documenso
  documensoDocumentId: text('documenso_document_id'),
  status: text('status').default('pending').notNull(), // 'pending' | 'sent' | 'signed' | 'expired'

  // Signed document
  signedPdfUrl: text('signed_pdf_url'),
  signedAt: timestamp('signed_at'),
  signatureIp: text('signature_ip'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').references(() => quotes.id).notNull(),
  contractId: uuid('contract_id').references(() => contracts.id).notNull(),

  // Customer (copied from lead for denormalization)
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  customerName: text('customer_name'),
  clerkUserId: text('clerk_user_id'),

  // Status
  status: orderStatusEnum('status').default('pending').notNull(),
  confirmationNumber: text('confirmation_number').notNull(),

  // Appointment
  appointmentId: uuid('appointment_id'),
  scheduledDate: timestamp('scheduled_date'),

  // CRM
  jobNimbusJobId: text('jobnimbus_job_id'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),

  // Stripe
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),
  stripeCustomerId: text('stripe_customer_id'),

  // Details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('usd').notNull(),
  status: text('status').default('pending').notNull(),
  paymentMethod: text('payment_method'), // 'card' | 'us_bank_account'
  receiptUrl: text('receipt_url'),

  // Type
  paymentType: text('payment_type').notNull(), // 'deposit' | 'balance' | 'partial'

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),

  // Cal.com
  calcomBookingId: text('calcom_booking_id'),
  calcomEventTypeId: text('calcom_event_type_id'),

  // Details
  scheduledStart: timestamp('scheduled_start').notNull(),
  scheduledEnd: timestamp('scheduled_end').notNull(),
  timeZone: text('time_zone').default('America/Chicago').notNull(),

  // Status
  status: text('status').default('confirmed').notNull(), // 'hold' | 'confirmed' | 'rescheduled' | 'cancelled'
  rescheduleCount: decimal('reschedule_count').default('0'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const smsConsents = pgTable('sms_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').notNull(),
  leadId: uuid('lead_id').references(() => leads.id),

  // Consent details (TCPA compliance)
  consentedAt: timestamp('consented_at').notNull(),
  consentText: text('consent_text').notNull(), // Exact text shown
  consentTextVersion: text('consent_text_version').notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent').notNull(),

  // Opt-out
  optedOutAt: timestamp('opted_out_at'),
  optOutSource: text('opt_out_source'), // 'sms_stop' | 'web_form' | 'manual'

  // Active status
  isActive: boolean('is_active').default(true).notNull(),
});

export const quoteShares = pgTable('quote_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').references(() => quotes.id).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  viewCount: decimal('view_count').default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: text('event_id').notNull().unique(),
  source: text('source').notNull(), // 'stripe' | 'documenso' | 'calcom' | 'wisetack' | 'roofr'
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pricing configuration
export const pricingTiers = pgTable('pricing_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tier: tierEnum('tier').notNull(),
  name: text('name').notNull(),
  materialCostPerSqft: decimal('material_cost_per_sqft', { precision: 6, scale: 2 }).notNull(),
  shingleType: text('shingle_type').notNull(),
  warrantyYears: decimal('warranty_years').notNull(),
  description: text('description'),
  features: jsonb('features'), // Array of feature strings
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pricingConfig = pgTable('pricing_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Database Indexes

```typescript
// src/db/schema.ts (continued)
import { index } from 'drizzle-orm/pg-core';

// Add indexes for common queries
export const leadsIndexes = {
  emailIdx: index('leads_email_idx').on(leads.email),
  jobNimbusIdx: index('leads_jobnimbus_idx').on(leads.jobNimbusContactId),
};

export const quotesIndexes = {
  leadIdx: index('quotes_lead_idx').on(quotes.leadId),
  statusIdx: index('quotes_status_idx').on(quotes.status),
  createdIdx: index('quotes_created_idx').on(quotes.createdAt),
};

export const ordersIndexes = {
  clerkUserIdx: index('orders_clerk_user_idx').on(orders.clerkUserId),
  confirmationIdx: index('orders_confirmation_idx').on(orders.confirmationNumber),
  statusIdx: index('orders_status_idx').on(orders.status),
};

export const smsConsentsIndexes = {
  phoneIdx: index('sms_consents_phone_idx').on(smsConsents.phone),
  activeIdx: index('sms_consents_active_idx').on(smsConsents.isActive),
};

export const quoteSharesIndexes = {
  tokenIdx: index('quote_shares_token_idx').on(quoteShares.token),
  expiresIdx: index('quote_shares_expires_idx').on(quoteShares.expiresAt),
};

export const webhookEventsIndexes = {
  eventIdIdx: index('webhook_events_event_id_idx').on(webhookEvents.eventId),
  sourceTypeIdx: index('webhook_events_source_type_idx').on(webhookEvents.source, webhookEvents.type),
};
```

---

## Integration Architecture

### Adapter Pattern

All external integrations use the adapter pattern for vendor flexibility:

```
src/lib/integrations/
├── adapters/
│   ├── measurement/
│   │   ├── types.ts                # MeasurementAdapter interface
│   │   ├── roofr.adapter.ts        # Roofr implementation
│   │   └── index.ts                # Factory function
│   │
│   ├── crm/
│   │   ├── types.ts                # CrmAdapter interface
│   │   ├── jobnimbus.adapter.ts    # JobNimbus implementation
│   │   └── index.ts                # Factory function
│   │
│   ├── esignature/
│   │   ├── types.ts                # ESignatureAdapter interface
│   │   ├── documenso.adapter.ts    # Documenso implementation
│   │   └── index.ts                # Factory function
│   │
│   ├── booking/
│   │   ├── types.ts                # BookingAdapter interface
│   │   ├── calcom.adapter.ts       # Cal.com implementation
│   │   └── index.ts                # Factory function
│   │
│   ├── financing/
│   │   ├── types.ts                # FinancingAdapter interface
│   │   ├── wisetack.adapter.ts     # Wisetack implementation
│   │   └── index.ts                # Factory function
│   │
│   ├── sms/
│   │   ├── types.ts                # SmsAdapter interface
│   │   ├── signalwire.adapter.ts   # SignalWire implementation
│   │   └── index.ts                # Factory function
│   │
│   └── email/
│       ├── types.ts                # EmailAdapter interface
│       ├── resend.adapter.ts       # Resend implementation
│       └── index.ts                # Factory function
│
└── index.ts                        # Re-export all adapters
```

### Adapter Example: Measurement

```typescript
// src/lib/integrations/adapters/measurement/types.ts
export interface MeasurementReport {
  id: string;
  address: string;
  sqftTotal: number;
  facets: Facet[];
  pitchPrimary: number;
  complexity: 'simple' | 'moderate' | 'complex';
  vendor: string;
  rawDataUri?: string;
  createdAt: Date;
}

export interface MeasurementStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  estimatedCompletionAt?: Date;
}

export interface MeasurementAdapter {
  requestMeasurement(address: string, quoteId: string): Promise<{ jobId: string }>;
  getStatus(jobId: string): Promise<MeasurementStatus>;
  getReport(jobId: string): Promise<MeasurementReport>;
  handleWebhook(payload: unknown, signature: string): Promise<MeasurementReport | null>;
}
```

```typescript
// src/lib/integrations/adapters/measurement/roofr.adapter.ts
import { MeasurementAdapter, MeasurementReport, MeasurementStatus } from './types';

const ROOFR_API_BASE = 'https://api.roofr.com/v1';

export class RoofrAdapter implements MeasurementAdapter {
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.ROOFR_API_KEY!;
    this.webhookSecret = process.env.ROOFR_WEBHOOK_SECRET!;
  }

  async requestMeasurement(address: string, quoteId: string) {
    const response = await fetch(`${ROOFR_API_BASE}/measurements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/roofr`,
        metadata: { quoteId },
      }),
    });

    if (!response.ok) {
      throw new Error(`Roofr API error: ${response.status}`);
    }

    const data = await response.json();
    return { jobId: data.job_id };
  }

  async getStatus(jobId: string): Promise<MeasurementStatus> {
    const response = await fetch(`${ROOFR_API_BASE}/measurements/${jobId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });

    const data = await response.json();

    return {
      jobId,
      status: this.mapStatus(data.status),
      estimatedCompletionAt: data.estimated_completion_at
        ? new Date(data.estimated_completion_at)
        : undefined,
    };
  }

  async getReport(jobId: string): Promise<MeasurementReport> {
    const response = await fetch(`${ROOFR_API_BASE}/measurements/${jobId}/report`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });

    const data = await response.json();

    return this.transformReport(data);
  }

  async handleWebhook(payload: unknown, signature: string): Promise<MeasurementReport | null> {
    // Verify webhook signature
    if (!this.verifySignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const data = payload as RoofrWebhookPayload;

    if (data.event === 'measurement.complete') {
      return this.transformReport(data.report);
    }

    return null;
  }

  private mapStatus(roofrStatus: string): MeasurementStatus['status'] {
    const statusMap: Record<string, MeasurementStatus['status']> = {
      'pending': 'pending',
      'in_progress': 'processing',
      'completed': 'complete',
      'failed': 'failed',
    };
    return statusMap[roofrStatus] || 'pending';
  }

  private transformReport(data: RoofrReportData): MeasurementReport {
    return {
      id: data.id,
      address: data.address,
      sqftTotal: data.total_area,
      facets: data.facets,
      pitchPrimary: data.primary_pitch,
      complexity: this.calculateComplexity(data),
      vendor: 'roofr',
      rawDataUri: data.report_url,
      createdAt: new Date(data.created_at),
    };
  }

  private calculateComplexity(data: RoofrReportData): 'simple' | 'moderate' | 'complex' {
    const facetCount = data.facets.length;

    if (facetCount <= 4 && data.primary_pitch <= 6) return 'simple';
    if (facetCount <= 12 && data.primary_pitch <= 9) return 'moderate';
    return 'complex';
  }

  private verifySignature(payload: unknown, signature: string): boolean {
    // Implement HMAC verification per Roofr docs
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  }
}
```

```typescript
// src/lib/integrations/adapters/measurement/index.ts
import { MeasurementAdapter } from './types';
import { RoofrAdapter } from './roofr.adapter';

export function createMeasurementAdapter(): MeasurementAdapter {
  const vendor = process.env.MEASUREMENT_VENDOR || 'roofr';

  switch (vendor) {
    case 'roofr':
      return new RoofrAdapter();
    // Future: case 'eagleview': return new EagleViewAdapter();
    default:
      throw new Error(`Unknown measurement vendor: ${vendor}`);
  }
}

export type { MeasurementAdapter, MeasurementReport, MeasurementStatus } from './types';
```

### Integration Summary

| Integration | Adapter | Communication Pattern | Error Handling |
|-------------|---------|----------------------|----------------|
| **Roofr** | `MeasurementAdapter` | Request → Webhook callback (24-48h) | Retry 3x, fallback to manual |
| **JobNimbus** | `CrmAdapter` | Bidirectional sync | Queue + retry, log failures |
| **Documenso** | `ESignatureAdapter` | Request → Webhook on completion | Retry, manual fallback |
| **Cal.com** | `BookingAdapter` | Real-time API + webhooks | Cache slots, retry |
| **Wisetack** | `FinancingAdapter` | Embed → Webhook on decision | Timeout handling, skip option |
| **Stripe** | Direct SDK | Payment Intent + webhooks | Standard Stripe error handling |
| **SignalWire** | `SmsAdapter` | Fire-and-forget with status | Retry 2x, log failures |
| **Resend** | `EmailAdapter` | Fire-and-forget with tracking | Retry 3x, queue |
| **Google Places** | Direct API | Real-time autocomplete | Debounce, fallback |

---

## Authentication Architecture

### Clerk Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLERK AUTH FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   PUBLIC ROUTES (No Auth)                                            │
│   ─────────────────────                                              │
│   /                           Landing page                           │
│   /quote/*                    Quote flow (anonymous until checkout)  │
│   /share/*                    Public quote share links               │
│   /api/webhooks/*             Webhook endpoints                      │
│                                                                      │
│   PROTECTED ROUTES (Auth Required)                                   │
│   ───────────────────────────                                        │
│   /portal/*                   Customer portal                        │
│   /api/portal/*               Portal API routes                      │
│                                                                      │
│   AUTH METHODS (Customer Portal)                                     │
│   ─────────────────────────────                                      │
│   1. Magic Link (primary)     Sent in confirmation email             │
│   2. Email/Password           Optional account creation              │
│   3. OAuth - Google           P1 (deferred from MVP)                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Session Management

```typescript
// src/lib/auth.ts
import { auth, currentUser } from '@clerk/nextjs';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Get authenticated user with their projects
export async function getAuthenticatedUser() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  // Get user's orders
  const userOrders = await db.query.orders.findMany({
    where: eq(orders.clerkUserId, userId),
    with: {
      quote: true,
      contract: true,
      payments: true,
      appointments: true,
    },
  });

  return {
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
    orders: userOrders,
  };
}

// Link Clerk user to order (on first portal access)
export async function linkUserToOrder(orderId: string) {
  const { userId } = auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  await db.update(orders)
    .set({ clerkUserId: userId })
    .where(eq(orders.id, orderId));
}

// Verify user owns this order (authorization)
export async function verifyOrderOwnership(orderId: string) {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  return order?.clerkUserId === userId;
}
```

### Magic Link Flow

```
MAGIC LINK AUTHENTICATION

[1. Order Completion]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Generate Clerk Magic Link                                           │
│  - Link to /portal?orderId={orderId}                                 │
│  - Valid for 24 hours                                                │
│  - Single use (Clerk default)                                        │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
[2. Confirmation Email]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Email contains:                                                     │
│  - Order summary                                                     │
│  - "View Your Project" CTA button → Magic Link                       │
│  - Contract PDF attachment                                           │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
[3. User Clicks Link]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Clerk verifies magic link token                                     │
│  - Creates session if valid                                          │
│  - Creates Clerk user if first time                                  │
│  - Links to existing user if email matches                           │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
[4. Portal Access]
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Link Clerk user ID to order                                         │
│  Redirect to /portal/dashboard                                       │
│  Session persists for 30 days                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Caching Strategy

### Cache Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CACHING ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   LAYER 1: EDGE CACHE (Vercel CDN)                                   │
│   ──────────────────────────────                                     │
│   - Static assets (images, fonts, CSS, JS)                           │
│   - Marketing pages (ISR with 1 hour revalidation)                   │
│   - Trust badge/credentials data (static)                            │
│   Duration: 1 hour - 1 year (asset-dependent)                        │
│                                                                      │
│   LAYER 2: ROUTE CACHE (Next.js)                                     │
│   ─────────────────────────────                                      │
│   - RSC payloads for marketing pages                                 │
│   - Static pricing tier definitions                                  │
│   - ROI and value messaging content                                  │
│   Duration: Revalidated on-demand or time-based                      │
│                                                                      │
│   LAYER 3: DATA CACHE (React Query)                                  │
│   ─────────────────────────────────                                  │
│   - Quote data (staleTime: 30 seconds)                               │
│   - User projects (staleTime: 1 minute)                              │
│   - Cal.com availability (staleTime: 5 minutes)                      │
│   Duration: In-memory, component lifecycle                           │
│                                                                      │
│   LAYER 4: REQUEST MEMOIZATION (React cache())                       │
│   ──────────────────────────────────────────                         │
│   - Database queries within single request                           │
│   - Prevents duplicate fetches in RSC tree                           │
│   Duration: Single request                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Cache Configuration

```typescript
// src/lib/cache.ts
import { unstable_cache } from 'next/cache';

// Pricing tier definitions (rarely change)
export const getCachedPricingTiers = unstable_cache(
  async () => {
    return db.query.pricingTiers.findMany({
      where: eq(pricingTiers.isActive, true),
    });
  },
  ['pricing-tiers'],
  { revalidate: 3600, tags: ['pricing'] } // 1 hour
);

// Pricing config (rarely change)
export const getCachedPricingConfig = unstable_cache(
  async () => {
    const configs = await db.query.pricingConfig.findMany();
    return Object.fromEntries(configs.map(c => [c.key, c.value]));
  },
  ['pricing-config'],
  { revalidate: 3600, tags: ['pricing'] }
);

// Trust/credentials data (static)
export const getCachedCredentials = unstable_cache(
  async () => {
    // Could be from CMS or static config
    return {
      yearsInBusiness: 15,
      licenseNumbers: {
        TX: 'TACLA12345',
        GA: 'GA-RBC12345',
        NC: 'NC-78901',
        AZ: 'ROC-234567',
      },
      certifications: ['Owens Corning Preferred', 'GAF Master Elite'],
      googleReviews: { rating: 4.8, count: 234 },
    };
  },
  ['credentials'],
  { revalidate: 86400, tags: ['credentials'] } // 24 hours
);
```

### Revalidation Triggers

```typescript
// src/app/actions/admin.ts
'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

// Admin updates pricing - invalidate cache
export async function updatePricingTier(tierId: string, data: PricingTierInput) {
  await db.update(pricingTiers).set(data).where(eq(pricingTiers.id, tierId));

  // Invalidate pricing cache
  revalidateTag('pricing');
}

// Quote updated - invalidate specific paths
export async function onQuoteUpdated(quoteId: string) {
  revalidatePath(`/quote/estimate?quoteId=${quoteId}`);
  revalidatePath(`/quote/packages?quoteId=${quoteId}`);
}
```

---

## Environment Strategy

### Environment Tiers

| Environment | Purpose | Database | Integrations |
|-------------|---------|----------|--------------|
| **Development** | Local development | Neon branch (dev) | Test/sandbox keys |
| **Preview** | PR previews | Neon branch (auto) | Test/sandbox keys |
| **Staging** | Pre-production testing | Neon branch (staging) | Test/sandbox keys |
| **Production** | Live application | Neon main | Production keys |

### Environment Variables

```bash
# .env.example

# ─────────────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────────────
DATABASE_URL=                           # Neon connection string (pooled)
DATABASE_URL_UNPOOLED=                  # Neon direct connection (migrations)

# ─────────────────────────────────────────────────────────────────────
# AUTHENTICATION (Clerk)
# ─────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=      # Public key (client-side)
CLERK_SECRET_KEY=                       # Secret key (server-side)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/portal/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/portal/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/portal
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/portal

# ─────────────────────────────────────────────────────────────────────
# PAYMENTS (Stripe)
# ─────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=     # Public key (client-side)
STRIPE_SECRET_KEY=                      # Secret key (server-side)
STRIPE_WEBHOOK_SECRET=                  # Webhook signing secret

# ─────────────────────────────────────────────────────────────────────
# MEASUREMENT (Roofr)
# ─────────────────────────────────────────────────────────────────────
ROOFR_API_KEY=
ROOFR_WEBHOOK_SECRET=
MEASUREMENT_VENDOR=roofr

# ─────────────────────────────────────────────────────────────────────
# CRM (JobNimbus)
# ─────────────────────────────────────────────────────────────────────
JOBNIMBUS_API_KEY=
CRM_VENDOR=jobnimbus

# ─────────────────────────────────────────────────────────────────────
# E-SIGNATURE (Documenso)
# ─────────────────────────────────────────────────────────────────────
DOCUMENSO_API_URL=                      # Self-hosted URL
DOCUMENSO_API_KEY=
DOCUMENSO_WEBHOOK_SECRET=

# ─────────────────────────────────────────────────────────────────────
# BOOKING (Cal.com)
# ─────────────────────────────────────────────────────────────────────
CALCOM_API_KEY=
CALCOM_EVENT_TYPE_ID=
CALCOM_WEBHOOK_SECRET=

# ─────────────────────────────────────────────────────────────────────
# FINANCING (Wisetack)
# ─────────────────────────────────────────────────────────────────────
WISETACK_MERCHANT_ID=
WISETACK_API_KEY=
WISETACK_WEBHOOK_SECRET=

# ─────────────────────────────────────────────────────────────────────
# SMS (SignalWire)
# ─────────────────────────────────────────────────────────────────────
SIGNALWIRE_PROJECT_ID=
SIGNALWIRE_API_TOKEN=
SIGNALWIRE_SPACE_URL=
SIGNALWIRE_PHONE_NUMBER=

# ─────────────────────────────────────────────────────────────────────
# EMAIL (Resend)
# ─────────────────────────────────────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=quotes@resultsroofing.com

# ─────────────────────────────────────────────────────────────────────
# ADDRESS VALIDATION (Google)
# ─────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=

# ─────────────────────────────────────────────────────────────────────
# FILE STORAGE (Vercel Blob)
# ─────────────────────────────────────────────────────────────────────
BLOB_READ_WRITE_TOKEN=

# ─────────────────────────────────────────────────────────────────────
# APPLICATION
# ─────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Neon Database Branching

```
NEON DATABASE BRANCHES

main (Production)
 │
 ├── staging (Staging environment)
 │
 ├── dev (Development - shared)
 │
 └── preview/* (Auto-created for PR previews)
     ├── preview/pr-123
     ├── preview/pr-124
     └── ...

Benefits:
- Isolated data for each PR preview
- No risk to production data
- Instant branch creation (copy-on-write)
- Auto-cleanup when PR merges/closes
```

---

## Deployment Architecture

### Vercel Deployment

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL DEPLOYMENT PIPELINE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   [GitHub Push]                                                      │
│        │                                                             │
│        ▼                                                             │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Vercel Build                                                │   │
│   │  - Install dependencies (pnpm install)                       │   │
│   │  - Run type check (tsc --noEmit)                             │   │
│   │  - Run lint (eslint .)                                       │   │
│   │  - Run tests (vitest run)                                    │   │
│   │  - Build app (next build)                                    │   │
│   │  - Generate Drizzle types                                    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│        │                                                             │
│        ├── main branch ────────────► Production                      │
│        │                                                             │
│        ├── staging branch ─────────► Staging                         │
│        │                                                             │
│        └── PR branches ────────────► Preview (unique URL)            │
│                                                                      │
│   Deployment Outputs:                                                │
│   - Static assets → CDN                                              │
│   - Server functions → Serverless                                    │
│   - API routes → Serverless                                          │
│   - Middleware → Edge                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION INFRASTRUCTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                    VERCEL                                  │     │
│   │                                                            │     │
│   │   ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │     │
│   │   │   Edge     │  │  Function  │  │   Static Assets    │  │     │
│   │   │  Network   │  │  Compute   │  │      (CDN)         │  │     │
│   │   │            │  │            │  │                    │  │     │
│   │   │ - SSL/TLS  │  │ - Node.js  │  │ - JS bundles       │  │     │
│   │   │ - DDoS     │  │ - RSC      │  │ - CSS              │  │     │
│   │   │ - Routing  │  │ - API      │  │ - Images           │  │     │
│   │   │ - Middleware│ │ - Webhooks │  │ - Fonts            │  │     │
│   │   └────────────┘  └────────────┘  └────────────────────┘  │     │
│   │                                                            │     │
│   │   ┌────────────────────────────────────────────────────┐  │     │
│   │   │              Vercel Integrations                    │  │     │
│   │   │                                                     │  │     │
│   │   │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │  │     │
│   │   │  │   Neon   │  │  Blob    │  │   Analytics     │   │  │     │
│   │   │  │ Postgres │  │ Storage  │  │   (Optional)    │   │  │     │
│   │   │  └──────────┘  └──────────┘  └─────────────────┘   │  │     │
│   │   └────────────────────────────────────────────────────┘  │     │
│   └───────────────────────────────────────────────────────────┘     │
│                                                                      │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                  EXTERNAL SERVICES                         │     │
│   │                                                            │     │
│   │   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │     │
│   │   │ Clerk  │ │ Stripe │ │ Roofr  │ │Cal.com │ │Wisetack│ │     │
│   │   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │     │
│   │                                                            │     │
│   │   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │     │
│   │   │Documen.│ │JobNimb.│ │SignalW.│ │ Resend │             │     │
│   │   └────────┘ └────────┘ └────────┘ └────────┘             │     │
│   └───────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Scaling Considerations

| Component | Scaling Strategy | Bottleneck Mitigation |
|-----------|-----------------|----------------------|
| **Application** | Vercel auto-scales serverless | N/A (managed) |
| **Database** | Neon auto-scales compute | Connection pooling via pgbouncer |
| **File Storage** | Vercel Blob CDN | N/A (managed) |
| **Webhooks** | Serverless (auto-scale) | Queue for processing (future) |
| **External APIs** | Rate limiting | Implement backoff, caching |

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Core Web Vitals |
| **FID (First Input Delay)** | < 100ms | Core Web Vitals |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Core Web Vitals |
| **TTFB (Time to First Byte)** | < 600ms | Server response |
| **Quote Generation** | < 3s | Application metric |
| **Page Load (Quote Pages)** | < 2s | Application metric |
| **API Response (p95)** | < 500ms | Application metric |

---

## Key Architectural Decisions

### Decision: Framework - Next.js App Router

- **Context**: Need SEO for marketing, fast interactivity for checkout
- **Options Considered**: Next.js Pages Router, Remix, SvelteKit, Astro
- **Choice**: Next.js 14 App Router
- **Rationale**:
  - Server Components reduce client bundle
  - Streaming enables faster perceived performance
  - Server Actions simplify mutations
  - Vercel integration is seamless
  - Team familiarity with React ecosystem
- **Trade-offs**:
  - App Router is newer, some patterns still evolving
  - More complex mental model (server vs client components)
- **Consequences**:
  - Default to Server Components
  - Use `'use client'` only when necessary
  - Leverage Server Actions for mutations

### Decision: ORM - Drizzle over Prisma

- **Context**: Need type-safe database queries for serverless
- **Options Considered**: Prisma, Drizzle, raw SQL, Kysely
- **Choice**: Drizzle ORM
- **Rationale**:
  - Lighter weight (smaller bundle, faster cold starts)
  - SQL-like syntax more predictable
  - No binary dependencies (important for serverless)
  - Excellent TypeScript inference
- **Trade-offs**:
  - Less mature ecosystem than Prisma
  - Fewer built-in features (no client-side caching)
- **Consequences**:
  - Manual migration management
  - SQL knowledge helpful for complex queries

### Decision: State Management - Hybrid Approach

- **Context**: App has both server data and interactive forms
- **Options Considered**: Redux, Zustand, Jotai, TanStack Query only
- **Choice**: TanStack Query (server) + React Hook Form (forms) + Context (global)
- **Rationale**:
  - No single solution fits all state types
  - TanStack Query excels at server state caching
  - React Hook Form is performant for forms
  - Context sufficient for theme/auth (small surface)
- **Trade-offs**:
  - Multiple libraries to learn
  - No single source of truth
- **Consequences**:
  - Clear separation of state concerns
  - Each tool used for its strength

### Decision: Integration Pattern - Adapters

- **Context**: Multiple external vendors, client wants flexibility to switch
- **Options Considered**: Direct SDK usage, Service layer, Adapter pattern
- **Choice**: Adapter pattern with factory functions
- **Rationale**:
  - Isolates vendor-specific code
  - Common interface for each integration type
  - Easy to swap vendors (config change + new adapter)
  - Simplifies testing (mock adapters)
- **Trade-offs**:
  - More upfront code structure
  - May over-abstract for simple integrations
- **Consequences**:
  - All integrations follow same pattern
  - Vendor change = new adapter implementation
  - Environment variable controls active vendor

### Decision: Authentication - Clerk (Managed)

- **Context**: Need customer portal auth with magic links
- **Options Considered**: NextAuth.js, Clerk, Auth0, custom
- **Choice**: Clerk
- **Rationale**:
  - Magic links built-in (key requirement)
  - Excellent Next.js integration
  - Session management handled
  - No auth infrastructure to maintain
- **Trade-offs**:
  - Vendor dependency
  - Cost at scale (free tier generous)
- **Consequences**:
  - Use Clerk middleware for route protection
  - Use Clerk hooks for user data
  - Link Clerk user ID to our order records

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [03-product-requirements.md](./03-product-requirements.md) | Requirements this architecture supports |
| [04-feature-breakdown.md](./04-feature-breakdown.md) | Features requiring technical implementation |
| [06-component-specs.md](./06-component-specs.md) | Frontend component architecture |
| [08-data-models.md](./08-data-models.md) | Detailed schema and relationships |
| [09-api-contracts.md](./09-api-contracts.md) | API endpoint specifications |
| [11-security-requirements.md](./11-security-requirements.md) | Security architecture details |
| [15-file-architecture.md](./15-file-architecture.md) | Folder structure implementation |
| [17-code-patterns.md](./17-code-patterns.md) | Implementation patterns |
| [18-decision-log.md](./18-decision-log.md) | Architectural decision records |
| [19-cicd-pipeline.md](./19-cicd-pipeline.md) | Build and deployment automation |
| [INTEGRATION-SPECS.md](./INTEGRATION-SPECS.md) | Vendor integration details |

---

## Quality Checklist

Before marking this document complete:

- [x] Single architecture pattern selected (SSR with Next.js App Router)
- [x] All tech stack layers documented with versions and rationale
- [x] High-level system architecture diagram included
- [x] Data flow diagram shows quote lifecycle
- [x] Frontend architecture covers RSC, state management, data fetching
- [x] Backend architecture covers API routes, server actions, webhooks
- [x] Database schema strategy documented with Drizzle
- [x] Integration architecture with adapter pattern defined
- [x] Authentication architecture with Clerk documented
- [x] Caching strategy covers all layers
- [x] Environment strategy covers dev/preview/staging/prod
- [x] Deployment architecture with Vercel documented
- [x] 5 key architectural decisions documented with ADR format
- [x] Related documents cross-referenced

**Status: COMPLETE** - Ready for Phase 2B continuation (08-data-models.md)
