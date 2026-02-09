# Results Roofing - INDEX

> Instant roof replacement quote platform for self-pay homeowners.
> Next.js 14, TypeScript, Drizzle, Neon, Clerk, Stripe

## Routes (App Router)

### Pages
| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/app/page.tsx` | Landing page |
| `/about` | `src/app/about/page.tsx` | About page |
| `/contact` | `src/app/contact/page.tsx` | Contact form |
| `/services` | `src/app/services/page.tsx` | Services listing |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy |
| `/terms` | `src/app/terms/page.tsx` | Terms of service |
| `/sign-in` | `src/app/(auth)/sign-in/` | Clerk sign-in |
| `/sign-up` | `src/app/(auth)/sign-up/` | Clerk sign-up |

### Quote Wizard (v1)
| Route | File | Purpose |
|-------|------|---------|
| `/quote/new` | `src/app/quote/new/page.tsx` | Start new quote |
| `/quote/resume` | `src/app/quote/resume/page.tsx` | Resume saved quote |
| `/quote/[id]/confirm` | `src/app/quote/[id]/confirm/` | Property confirmation |
| `/quote/[id]/customize` | `src/app/quote/[id]/customize/page.tsx` | Package selection |
| `/quote/[id]/checkout` | `src/app/quote/[id]/checkout/` | Checkout flow |
| `/quote/[id]/deposit` | `src/app/quote/[id]/deposit/` | Deposit auth |
| `/quote/[id]/schedule` | `src/app/quote/[id]/schedule/page.tsx` | Schedule install |
| `/quote/[id]/confirmation` | `src/app/quote/[id]/confirmation/page.tsx` | Order confirmation |
| `/quote/[id]/success` | `src/app/quote/[id]/success/page.tsx` | Success page |

### Quote Wizard (v2 - XState)
| Route | File | Purpose |
|-------|------|---------|
| `/quote-v2` | `src/app/quote-v2/page.tsx` | V2 entry point |
| `/quote-v2/[id]` | `src/app/quote-v2/[id]/page.tsx` | V2 wizard shell |

### Portal (authenticated)
| Route | File | Purpose |
|-------|------|---------|
| `/portal` | `src/app/portal/page.tsx` | Portal home |
| `/portal/dashboard` | `src/app/portal/dashboard/page.tsx` | Customer dashboard |
| `/portal/documents` | `src/app/portal/documents/page.tsx` | Documents |
| `/portal/payments` | `src/app/portal/payments/page.tsx` | Payment history |
| `/portal/schedule` | `src/app/portal/schedule/page.tsx` | Schedule management |

### Ops Dashboard (internal)
| Route | File | Purpose |
|-------|------|---------|
| `/ops` | `src/app/ops/page.tsx` | Ops home |
| `/ops/crm/contacts` | `src/app/ops/crm/contacts/page.tsx` | CRM contacts |
| `/ops/crm/pipeline` | `src/app/ops/crm/pipeline/page.tsx` | Sales pipeline |
| `/ops/messaging/email` | `src/app/ops/messaging/email/page.tsx` | Email messaging |
| `/ops/messaging/sms` | `src/app/ops/messaging/sms/page.tsx` | SMS messaging |
| `/ops/analytics` | `src/app/ops/analytics/page.tsx` | Analytics dashboard |
| `/ops/blog/posts` | `src/app/ops/blog/posts/page.tsx` | Blog management |
| `/ops/documents` | `src/app/ops/documents/page.tsx` | Document management |
| `/ops/support` | `src/app/ops/support/page.tsx` | Support inbox |

### Admin (dev panel)
| Route | File | Purpose |
|-------|------|---------|
| `/admin` | `src/app/admin/page.tsx` | Admin home |
| `/admin/changelog` | `src/app/admin/changelog/page.tsx` | Changelog |
| `/admin/database` | `src/app/admin/database/page.tsx` | DB browser |
| `/admin/feedback` | `src/app/admin/feedback/page.tsx` | User feedback |
| `/admin/notes` | `src/app/admin/notes/page.tsx` | Dev notes |
| `/admin/sow` | `src/app/admin/sow/page.tsx` | Scope of work |
| `/admin/tasks` | `src/app/admin/tasks/page.tsx` | Dev tasks |

## API Routes

### Quote APIs
| Endpoint | File | Purpose |
|----------|------|---------|
| `POST /api/quotes` | `src/app/api/quotes/route.ts` | Create quote |
| `POST /api/quotes/resume` | `src/app/api/quotes/resume/route.ts` | Resume quote |
| `GET /api/quotes/share/[token]` | `src/app/api/quotes/share/[token]/route.ts` | Shared quote |
| `POST /api/quotes/[id]/confirm` | `.../confirm/route.ts` | Confirm property |
| `POST /api/quotes/[id]/contact` | `.../contact/route.ts` | Submit contact |
| `POST /api/quotes/[id]/contract` | `.../contract/route.ts` | Contract ops |
| `POST /api/quotes/[id]/deposit-auth` | `.../deposit-auth/route.ts` | Deposit authorization |
| `POST /api/quotes/[id]/docuseal` | `.../docuseal/route.ts` | Docuseal integration |
| `POST /api/quotes/[id]/finalize` | `.../finalize/route.ts` | Finalize quote |
| `POST /api/quotes/[id]/financing` | `.../financing/route.ts` | Financing options |
| `POST /api/quotes/[id]/manual-measurement` | `.../manual-measurement/route.ts` | Manual sqft entry |
| `POST /api/quotes/[id]/satellite-measurement` | `.../satellite-measurement/route.ts` | **Google Solar satellite measurement** |
| `POST /api/quotes/[id]/save-draft` | `.../save-draft/route.ts` | Save draft |
| `POST /api/quotes/[id]/schedule` | `.../schedule/route.ts` | Schedule install |
| `POST /api/quotes/[id]/select-tier` | `.../select-tier/route.ts` | Select pricing tier |
| `POST /api/quotes/[id]/share` | `.../share/route.ts` | Share quote |

### Other APIs
| Endpoint | Purpose |
|----------|---------|
| `/api/payments/create-intent` | Stripe payment intent |
| `/api/payments/webhook` | Stripe webhook |
| `/api/contracts/` | Contract CRUD |
| `/api/pricing-tiers` | Pricing tier data |
| `/api/leads/out-of-area` | Out-of-area lead capture |
| `/api/analytics/collect` | Analytics events |
| `/api/webhooks/documenso` | Documenso webhook |
| `/api/webhooks/docuseal` | Docuseal webhook |
| `/api/quote-v2/[id]/checkpoint` | V2 wizard checkpoint |
| `/api/ops/*` | Ops dashboard APIs (CRM, blog, messaging, support) |
| `/api/admin/*` | Admin panel APIs (AI, notes, tasks, feedback) |

## Database Schema

All in `src/db/schema/`:

| File | Tables | Notes |
|------|--------|-------|
| `quotes.ts` | `quotes` | Core quote records |
| `quote-drafts.ts` | `quote_drafts` | XState-persisted wizard state |
| `quote-shares.ts` | `quote_shares` | Shareable quote links |
| `measurements.ts` | `measurements` | Roof measurements (includes `confidence`, `imageryQuality`, `imageryDate` columns for satellite data) |
| `pricing-tiers.ts` | `pricing_tiers` | Good/Better/Best tiers |
| `orders.ts` | `orders` | Finalized orders |
| `payments.ts` | `payments` | Payment records |
| `contracts.ts` | `contracts` | E-signed contracts |
| `documents.ts` | `documents` | Generated docs |
| `leads.ts` | `leads` | Lead records |
| `out-of-area-leads.ts` | `out_of_area_leads` | Leads outside service area |
| `appointments.ts` | `appointments` | Scheduled appointments |
| `feedback.ts` | `feedback` | User feedback |
| `changelog.ts` | `changelog` | Dev changelog |
| `dev-notes.ts` | `dev_notes` | Dev notes |
| `dev-tasks.ts` | `dev_tasks` | Dev tasks |
| `ai-memories.ts` | `ai_memories` | AI memory store |
| `sms-consents.ts` | `sms_consents` | TCPA consent records |
| `webhook-events.ts` | `webhook_events` | Webhook event log |
| `relations.ts` | - | Drizzle relation definitions |
| `index.ts` | - | Barrel export |

## Integration Adapters

All in `src/lib/integrations/adapters/`:

| Adapter | File | Status |
|---------|------|--------|
| **Google Solar** | `google-solar.ts` | **Active** - satellite roof measurement via Google Solar API |
| Documenso | `documenso.ts` | E-signatures |
| Docuseal | `docuseal.ts` | E-signatures (alt) |
| GHL Messaging | `ghl-messaging.ts` | GoHighLevel SMS/email |
| JobNimbus | `jobnimbus.ts` | CRM sync |
| Resend | `resend.ts` | Transactional email |
| SignalWire | `signalwire.ts` | Telephony |
| Wisetack | `wisetack.ts` | Financing |

## Pricing / Estimation

All in `src/lib/pricing/`:

| File | Purpose |
|------|---------|
| `estimate-sqft.ts` | **Two-tier sqft estimation with satellite support** - uses Google Solar data when available, falls back to address-based heuristic |
| `calculate-quote.ts` | Price calculation from sqft + tier |
| `index.ts` | Barrel export |
| `pricing.test.ts` | Unit tests |

## Hooks

All in `src/hooks/`:

| Hook | File | Purpose |
|------|------|---------|
| `useSatelliteMeasurement` | `useSatelliteMeasurement.ts` | **React Query hook for satellite measurement API** |
| `useQuote` | `useQuote.ts` | Quote data fetching |
| `useQuoteDraft` | `useQuoteDraft.ts` | Draft state management |
| `usePricingTiers` | `usePricingTiers.ts` | Pricing tier data |
| `useOrders` | `useOrders.ts` | Order management |
| `useAnalytics` | `useAnalytics.ts` | Analytics tracking |
| `useDevUser` | `useDevUser.ts` | Dev user bypass |
| `useMobile` | `use-mobile.tsx` | Responsive detection |

## Component Structure

```
src/components/
├── features/           # Domain-specific components
│   ├── address/        # Address autocomplete + property confirmation
│   ├── checkout/       # Deposit, financing, payment, scheduling
│   ├── contract/       # Signature capture
│   ├── documents/      # Doc viewer + templates (contract, materials, etc.)
│   ├── faq/            # FAQ bar + modal
│   ├── feedback/       # Feedback widget
│   ├── landing/        # Hero form, how-it-works, reviews, scroll CTA
│   ├── ops/            # Ops dashboard components (analytics, blog, CRM, etc.)
│   ├── payment/        # Inline confirmation
│   ├── portal/         # Sidebar, user card, quick actions, timeline
│   ├── quote/          # V1 wizard stages + shared components
│   ├── quote-v2/       # V2 XState wizard (WizardShell, steps, machine)
│   └── support/        # Chat widget + contextual support
├── layout/             # Container, Footer, Header, StickyFooter
├── providers/          # Analytics + global providers
└── ui/                 # Primitives (button, card, dialog, etc.)
```

## Key Files Added This Session

| File | Status | Description |
|------|--------|-------------|
| `src/lib/integrations/adapters/google-solar.ts` | NEW | Google Solar API adapter for satellite roof measurement |
| `src/lib/pricing/estimate-sqft.ts` | REPLACED | Two-tier estimation: satellite data when available, address heuristic fallback |
| `src/app/api/quotes/[id]/satellite-measurement/route.ts` | NEW | API route triggering satellite measurement for a quote |
| `src/hooks/useSatelliteMeasurement.ts` | NEW | React hook wrapping satellite measurement API |
| `src/db/schema/measurements.ts` | MODIFIED | Added `confidence`, `imageryQuality`, `imageryDate` columns |
