# 15 - File Architecture

> **Purpose:** Defines the folder structure, naming conventions, and organization patterns for the Results Roofing web application. This document ensures consistent file placement and import patterns across the codebase.

**Status:** COMPLETE
**Last Updated:** 2026-01-21

---

## Project Root Structure

```
results-roofing/
├── .github/                        # GitHub configuration
│   ├── workflows/                  # CI/CD workflows
│   │   ├── ci.yml                  # Main CI pipeline
│   │   └── preview.yml             # Preview deployment
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                           # Documentation (this framework)
│   ├── planning/                   # Planning documents (01-23)
│   ├── roadmap/                    # Sprint planning
│   └── reference/                  # Reference docs
│
├── public/                         # Static assets (copied as-is to build)
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   └── images/                     # Static images
│       ├── logo.svg
│       ├── og-image.png            # Social sharing
│       └── trust-badges/           # Certification badges
│
├── src/                            # Application source code
│   ├── app/                        # Next.js App Router
│   ├── components/                 # React components
│   ├── lib/                        # Utilities, services, integrations
│   ├── hooks/                      # Custom React hooks
│   ├── db/                         # Database (Drizzle ORM)
│   ├── types/                      # TypeScript type definitions
│   └── styles/                     # Global styles and design tokens
│
├── tests/                          # Test configuration and shared utilities
│   ├── setup.ts                    # Vitest setup file
│   ├── mocks/                      # Shared mocks
│   │   ├── handlers.ts             # MSW handlers
│   │   └── server.ts               # MSW server
│   └── fixtures/                   # Test data fixtures
│       ├── quotes.ts
│       ├── orders.ts
│       └── users.ts
│
├── drizzle/                        # Drizzle migrations (generated)
│   └── migrations/                 # SQL migration files
│       ├── 0000_initial.sql
│       └── meta/
│           └── _journal.json
│
├── .env.example                    # Environment variable template
├── .env.local                      # Local environment (gitignored)
├── .eslintrc.cjs                   # ESLint configuration
├── .gitignore
├── .prettierrc                     # Prettier configuration
├── drizzle.config.ts               # Drizzle Kit configuration
├── next.config.js                  # Next.js configuration
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js               # PostCSS (if needed)
├── README.md
├── tsconfig.json                   # TypeScript configuration
└── vitest.config.ts                # Vitest configuration
```

---

## App Router Structure (`src/app/`)

The App Router follows Next.js 14 conventions with route groups for logical organization.

```
src/app/
├── layout.tsx                      # Root layout (providers, fonts, analytics)
├── page.tsx                        # Landing page (/)
├── globals.css                     # Global styles + CSS custom properties
├── not-found.tsx                   # Custom 404 page
├── error.tsx                       # Global error boundary
├── loading.tsx                     # Global loading UI
│
├── (marketing)/                    # Marketing pages route group
│   ├── layout.tsx                  # Marketing layout (full header/footer)
│   ├── about/
│   │   └── page.tsx                # /about
│   ├── contact/
│   │   └── page.tsx                # /contact
│   └── roi-calculator/
│       └── page.tsx                # /roi-calculator (F16 - ROI value messaging)
│
├── (quote)/                        # Quote flow route group
│   ├── layout.tsx                  # Quote layout (progress indicator)
│   ├── page.tsx                    # Address entry / (F01)
│   ├── estimate/
│   │   └── page.tsx                # /estimate (F02 preliminary)
│   ├── packages/
│   │   └── page.tsx                # /packages (F04 comparison)
│   ├── checkout/
│   │   ├── layout.tsx              # Checkout sub-layout (order summary)
│   │   ├── financing/
│   │   │   └── page.tsx            # /checkout/financing (F06)
│   │   ├── schedule/
│   │   │   └── page.tsx            # /checkout/schedule (F07)
│   │   ├── contract/
│   │   │   └── page.tsx            # /checkout/contract (F08)
│   │   └── payment/
│   │       └── page.tsx            # /checkout/payment (F09)
│   └── confirmation/
│       └── page.tsx                # /confirmation (F10)
│
├── (portal)/                       # Customer portal route group
│   ├── layout.tsx                  # Portal layout (sidebar/tabs, auth)
│   ├── portal/
│   │   ├── page.tsx                # /portal (dashboard, F11)
│   │   ├── documents/
│   │   │   └── page.tsx            # /portal/documents (F12)
│   │   ├── schedule/
│   │   │   └── page.tsx            # /portal/schedule (F14)
│   │   └── payments/
│   │       └── page.tsx            # /portal/payments (F15)
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx            # Clerk sign-in
│   └── sign-up/
│       └── [[...sign-up]]/
│           └── page.tsx            # Clerk sign-up
│
├── share/                          # Public share routes
│   └── [token]/
│       └── page.tsx                # /share/[token] (F21)
│
├── api/                            # API routes
│   ├── quotes/
│   │   ├── route.ts                # POST /api/quotes (create)
│   │   └── [quoteId]/
│   │       ├── route.ts            # GET, PATCH /api/quotes/[quoteId]
│   │       └── share/
│   │           └── route.ts        # POST /api/quotes/[quoteId]/share
│   │
│   ├── leads/
│   │   └── route.ts                # POST /api/leads
│   │
│   ├── measurements/
│   │   └── [quoteId]/
│   │       └── route.ts            # POST /api/measurements/[quoteId]
│   │
│   ├── financing/
│   │   └── prequal/
│   │       └── route.ts            # POST /api/financing/prequal
│   │
│   ├── appointments/
│   │   ├── availability/
│   │   │   └── route.ts            # GET /api/appointments/availability
│   │   ├── hold/
│   │   │   └── route.ts            # POST /api/appointments/hold
│   │   └── [appointmentId]/
│   │       └── route.ts            # PATCH, DELETE
│   │
│   ├── contracts/
│   │   └── [quoteId]/
│   │       └── route.ts            # POST /api/contracts/[quoteId]
│   │
│   ├── payments/
│   │   ├── intent/
│   │   │   └── route.ts            # POST /api/payments/intent
│   │   └── [paymentId]/
│   │       └── route.ts            # GET /api/payments/[paymentId]
│   │
│   ├── pricing/
│   │   └── tiers/
│   │       └── route.ts            # GET /api/pricing/tiers
│   │
│   ├── portal/
│   │   ├── projects/
│   │   │   ├── route.ts            # GET /api/portal/projects
│   │   │   └── [projectId]/
│   │   │       ├── route.ts        # GET /api/portal/projects/[projectId]
│   │   │       ├── documents/
│   │   │       │   └── route.ts    # GET documents
│   │   │       ├── payments/
│   │   │       │   └── route.ts    # GET payments
│   │   │       └── reschedule/
│   │   │           └── route.ts    # POST reschedule
│   │   └── route.ts                # GET /api/portal (user info)
│   │
│   ├── webhooks/
│   │   ├── stripe/
│   │   │   └── route.ts            # POST /api/webhooks/stripe
│   │   ├── documenso/
│   │   │   └── route.ts            # POST /api/webhooks/documenso
│   │   ├── calcom/
│   │   │   └── route.ts            # POST /api/webhooks/calcom
│   │   ├── wisetack/
│   │   │   └── route.ts            # POST /api/webhooks/wisetack
│   │   ├── roofr/
│   │   │   └── route.ts            # POST /api/webhooks/roofr
│   │   ├── signalwire/
│   │   │   └── route.ts            # POST /api/webhooks/signalwire
│   │   ├── resend/
│   │   │   └── route.ts            # POST /api/webhooks/resend
│   │   └── clerk/
│   │       └── route.ts            # POST /api/webhooks/clerk
│   │
│   └── internal/
│       ├── health/
│       │   └── route.ts            # GET /api/internal/health
│       └── sync-crm/
│           └── route.ts            # POST /api/internal/sync-crm
│
└── actions/                        # Server Actions
    ├── quote.ts                    # createQuote, selectPackage, shareQuote
    ├── lead.ts                     # submitLead
    ├── appointment.ts              # holdSlot, confirmBooking, reschedule
    ├── payment.ts                  # createPaymentIntent, processDeposit
    ├── contract.ts                 # generateContract, recordSignature
    ├── consent.ts                  # recordTcpaConsent
    └── checkout.ts                 # processCheckout (orchestration)
```

### Route Group Conventions

| Group | URL Prefix | Purpose | Layout Features |
|-------|-----------|---------|-----------------|
| `(marketing)` | None | SEO pages | Full header/footer, trust signals |
| `(quote)` | None | Quote funnel | Progress indicator, minimal footer |
| `(portal)` | None | Customer area | Sidebar/tabs, auth required |

### Page File Conventions

| File | Purpose | Component Type |
|------|---------|----------------|
| `page.tsx` | Route content | Server Component (default) |
| `layout.tsx` | Shared layout | Server Component |
| `loading.tsx` | Suspense fallback | Server Component |
| `error.tsx` | Error boundary | Client Component (`'use client'`) |
| `not-found.tsx` | 404 handling | Server Component |

---

## Components Structure (`src/components/`)

Components follow a hybrid organization: shared UI by type, feature-specific by domain.

```
src/components/
├── ui/                             # Shared UI primitives
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── IconButton/
│   │   └── ...
│   ├── TextInput/
│   │   └── ...
│   ├── Textarea/
│   │   └── ...
│   ├── Select/
│   │   └── ...
│   ├── Checkbox/
│   │   └── ...
│   ├── RadioCardGroup/
│   │   └── ...
│   ├── DatePicker/
│   │   └── ...
│   ├── Card/
│   │   └── ...
│   ├── Badge/
│   │   └── ...
│   ├── Modal/
│   │   └── ...
│   ├── Toast/
│   │   └── ...
│   ├── Skeleton/
│   │   └── ...
│   ├── Spinner/
│   │   └── ...
│   ├── ErrorMessage/
│   │   └── ...
│   └── index.ts                    # Barrel export for UI components
│
├── layout/                         # Layout components
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.module.css
│   │   └── index.ts
│   ├── Footer/
│   │   └── ...
│   ├── Container/
│   │   └── ...
│   ├── Section/
│   │   └── ...
│   ├── StickyFooter/
│   │   └── ...
│   ├── CollapsiblePanel/
│   │   └── ...
│   └── index.ts
│
├── navigation/                     # Navigation components
│   ├── ProgressIndicator/
│   │   └── ...
│   ├── BottomTabBar/
│   │   └── ...
│   ├── SideNav/
│   │   └── ...
│   └── index.ts
│
├── feedback/                       # Feedback components
│   ├── ToastContainer/
│   │   └── ...
│   ├── ModalContainer/
│   │   └── ...
│   └── index.ts
│
├── data-display/                   # Data display components
│   ├── StatusTimeline/
│   │   └── ...
│   ├── PriceBreakdown/
│   │   └── ...
│   ├── DocumentList/
│   │   └── ...
│   └── index.ts
│
└── features/                       # Feature-specific components
    ├── quote/                      # Quote flow components
    │   ├── AddressAutocomplete/
    │   │   ├── AddressAutocomplete.tsx
    │   │   ├── AddressAutocomplete.module.css
    │   │   ├── AddressAutocomplete.test.tsx
    │   │   ├── use-places-autocomplete.ts  # Co-located hook
    │   │   └── index.ts
    │   ├── MotivationCapture/
    │   │   └── ...
    │   ├── ROIValueDisplay/
    │   │   └── ...
    │   ├── PremiumMaterialShowcase/
    │   │   └── ...
    │   ├── PackageTierCard/
    │   │   └── ...
    │   ├── PackageComparison/
    │   │   └── ...
    │   └── index.ts
    │
    ├── checkout/                   # Checkout components
    │   ├── OrderSummary/
    │   │   └── ...
    │   ├── PaymentForm/
    │   │   └── ...
    │   ├── ContractViewer/
    │   │   └── ...
    │   ├── FinancingOptions/
    │   │   └── ...
    │   └── index.ts
    │
    └── portal/                     # Portal components
        ├── ProjectDashboard/
        │   └── ...
        ├── QuickActionCard/
        │   └── ...
        ├── RescheduleForm/
        │   └── ...
        ├── SummaryCard/
        │   └── ...
        └── index.ts
```

### Component File Structure

Each component folder contains:

```
ComponentName/
├── ComponentName.tsx           # Component implementation
├── ComponentName.module.css    # Scoped styles (CSS Modules)
├── ComponentName.test.tsx      # Unit tests (co-located)
├── ComponentName.types.ts      # Types (if complex, otherwise inline)
└── index.ts                    # Barrel export
```

**index.ts pattern:**
```typescript
// src/components/ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

---

## Library Structure (`src/lib/`)

Utilities, services, and integration adapters.

```
src/lib/
├── utils/                          # Pure utility functions
│   ├── format.ts                   # formatCurrency, formatDate, formatPhone
│   ├── validation.ts               # isValidServiceArea, isValidEmail
│   ├── pricing.ts                  # calculateDeposit, calculateTierPrice
│   ├── cn.ts                       # className merging utility
│   └── index.ts
│
├── constants/                      # Application constants
│   ├── service-areas.ts            # TX/GA/NC/AZ target markets
│   ├── pricing.ts                  # Base rates, multipliers
│   ├── routes.ts                   # Route path constants
│   └── index.ts
│
├── api/                            # API utilities
│   ├── response.ts                 # Standard response builders
│   ├── errors.ts                   # ApiError class, error codes
│   ├── rate-limit.ts               # Rate limiting utilities
│   └── index.ts
│
├── auth/                           # Authentication utilities
│   ├── index.ts                    # getAuthenticatedUser, verifyOwnership
│   └── middleware.ts               # Auth middleware helpers
│
├── cache/                          # Caching utilities
│   ├── index.ts                    # Cache helpers
│   └── keys.ts                     # Cache key generators
│
├── email/                          # Email utilities
│   ├── templates/                  # React Email templates
│   │   ├── QuoteConfirmation.tsx
│   │   ├── OrderConfirmation.tsx
│   │   ├── AppointmentReminder.tsx
│   │   └── MagicLink.tsx
│   └── index.ts                    # sendEmail function
│
├── integrations/                   # External service integrations
│   ├── adapters/                   # Adapter pattern implementations
│   │   ├── measurement/
│   │   │   ├── types.ts            # MeasurementAdapter interface
│   │   │   ├── roofr.adapter.ts    # Roofr implementation
│   │   │   └── index.ts            # Factory: createMeasurementAdapter()
│   │   │
│   │   ├── crm/
│   │   │   ├── types.ts            # CrmAdapter interface
│   │   │   ├── jobnimbus.adapter.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── esignature/
│   │   │   ├── types.ts            # ESignatureAdapter interface
│   │   │   ├── documenso.adapter.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── booking/
│   │   │   ├── types.ts            # BookingAdapter interface
│   │   │   ├── calcom.adapter.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── financing/
│   │   │   ├── types.ts            # FinancingAdapter interface
│   │   │   ├── wisetack.adapter.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── sms/
│   │   │   ├── types.ts            # SmsAdapter interface
│   │   │   ├── signalwire.adapter.ts
│   │   │   └── index.ts
│   │   │
│   │   └── email/
│   │       ├── types.ts            # EmailAdapter interface
│   │       ├── resend.adapter.ts
│   │       └── index.ts
│   │
│   ├── stripe/                     # Stripe (direct SDK, no adapter)
│   │   ├── client.ts               # Server-side Stripe instance
│   │   └── webhooks.ts             # Webhook verification
│   │
│   ├── google-places/              # Google Places
│   │   └── client.ts               # Places API client
│   │
│   └── index.ts                    # Re-export all adapters
│
├── ark-ui/                         # Ark UI component wrappers
│   ├── Dialog.tsx                  # Pre-styled Dialog
│   ├── Toast.tsx                   # Pre-styled Toast
│   ├── Select.tsx                  # Pre-styled Select
│   └── index.ts
│
└── providers/                      # React context providers
    ├── QueryProvider.tsx           # TanStack Query provider
    ├── ToastProvider.tsx           # Toast context
    ├── QuoteSessionProvider.tsx    # Quote flow session context
    └── index.ts
```

### Adapter Factory Pattern

Each adapter folder follows this structure:

```typescript
// src/lib/integrations/adapters/measurement/types.ts
export interface MeasurementAdapter {
  requestMeasurement(address: string, quoteId: string): Promise<{ jobId: string }>;
  getStatus(jobId: string): Promise<MeasurementStatus>;
  getReport(jobId: string): Promise<MeasurementReport>;
  handleWebhook(payload: unknown, signature: string): Promise<MeasurementReport | null>;
}

// src/lib/integrations/adapters/measurement/index.ts
import { MeasurementAdapter } from './types';
import { RoofrAdapter } from './roofr.adapter';

export function createMeasurementAdapter(): MeasurementAdapter {
  const vendor = process.env.MEASUREMENT_VENDOR || 'roofr';

  switch (vendor) {
    case 'roofr':
      return new RoofrAdapter();
    default:
      throw new Error(`Unknown measurement vendor: ${vendor}`);
  }
}

export type { MeasurementAdapter, MeasurementReport, MeasurementStatus } from './types';
```

---

## Database Structure (`src/db/`)

Drizzle ORM schema and database utilities.

```
src/db/
├── index.ts                        # Database client export
├── schema.ts                       # All table definitions
├── schema/                         # Schema split by domain (alternative)
│   ├── leads.ts
│   ├── quotes.ts
│   ├── orders.ts
│   ├── payments.ts
│   ├── appointments.ts
│   ├── contracts.ts
│   ├── consents.ts
│   ├── webhooks.ts
│   ├── pricing.ts
│   └── index.ts                    # Re-export all schemas
│
├── queries/                        # Reusable query functions
│   ├── quotes.ts                   # getQuoteById, getQuotesByLead
│   ├── orders.ts                   # getOrdersByUser, getOrderWithDetails
│   ├── payments.ts                 # getPaymentsByOrder
│   └── index.ts
│
├── migrations/                     # SQL migrations (generated)
│   └── (managed by Drizzle Kit)
│
└── seed.ts                         # Development seed data
```

### Database Client Setup

```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
```

---

## Hooks Structure (`src/hooks/`)

Custom React hooks, organized by purpose.

```
src/hooks/
├── use-quote.ts                    # Quote data fetching/mutations
├── use-quote-session.ts            # Quote session context hook
├── use-toast.ts                    # Toast notifications
├── use-media-query.ts              # Responsive breakpoints
├── use-local-storage.ts            # LocalStorage with SSR safety
├── use-debounce.ts                 # Debounced values
├── use-form-persistence.ts         # Form state persistence
└── index.ts                        # Barrel export
```

### Hook Naming Conventions

| Pattern | Purpose | Example |
|---------|---------|---------|
| `use-[noun].ts` | Data/state hooks | `use-quote.ts`, `use-user.ts` |
| `use-[verb]-[noun].ts` | Action hooks | `use-create-quote.ts` |
| `use-[adjective].ts` | Utility hooks | `use-debounce.ts` |

---

## Types Structure (`src/types/`)

Shared TypeScript type definitions.

```
src/types/
├── index.ts                        # Re-export all types
├── api.ts                          # API request/response types
├── database.ts                     # Database entity types (from Drizzle)
├── forms.ts                        # Form schema types
├── integrations.ts                 # External service types
└── global.d.ts                     # Global type augmentations
```

### Type Organization Rules

| Type Category | Location | Example |
|---------------|----------|---------|
| Component props | Co-located in component | `Button.tsx` contains `ButtonProps` |
| API contracts | `src/types/api.ts` | `CreateQuoteRequest`, `QuoteResponse` |
| Database entities | `src/types/database.ts` | Inferred from Drizzle schema |
| Form schemas | `src/types/forms.ts` | Zod schemas with inferred types |
| Shared/global | `src/types/index.ts` | `Quote`, `Order`, `User` |

---

## Styles Structure (`src/styles/`)

Global styles and design tokens.

```
src/styles/
├── tokens/
│   ├── colors.css                  # Color CSS custom properties
│   ├── typography.css              # Font family, sizes, weights
│   ├── spacing.css                 # Spacing scale
│   ├── shadows.css                 # Shadow definitions
│   └── radius.css                  # Border radius
│
├── base/
│   ├── reset.css                   # CSS reset/normalize
│   └── globals.css                 # Global element styles
│
└── index.css                       # Import all (imported in layout.tsx)
```

### CSS Custom Property Naming

```css
/* Color tokens */
--color-sandstone: #C4A77D;
--color-terracotta: #B86B4C;
--color-charcoal: #2C2C2C;

/* Semantic colors */
--color-primary: var(--color-sandstone);
--color-error: #DC2626;

/* Typography */
--font-family-sans: 'Inter', system-ui, sans-serif;
--font-size-base: 1rem;

/* Spacing */
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;

/* Component-specific */
--button-height-md: 44px;
--input-height: 48px;
```

---

## Naming Conventions

### File Naming

| File Type | Convention | Example |
|-----------|------------|---------|
| React components | PascalCase | `Button.tsx`, `PackageTierCard.tsx` |
| CSS Modules | PascalCase matching component | `Button.module.css` |
| Hooks | kebab-case with `use-` prefix | `use-quote.ts`, `use-toast.ts` |
| Utilities | kebab-case | `format.ts`, `validation.ts` |
| Types (standalone) | kebab-case | `api.ts`, `forms.ts` |
| Tests | Same as source + `.test` | `Button.test.tsx` |
| Server Actions | kebab-case by domain | `quote.ts`, `payment.ts` |
| API routes | `route.ts` (Next.js convention) | `route.ts` |

### Folder Naming

| Folder Type | Convention | Example |
|-------------|------------|---------|
| Component folders | PascalCase | `Button/`, `PackageTierCard/` |
| Category folders | kebab-case | `data-display/`, `ark-ui/` |
| Feature folders | kebab-case | `quote/`, `checkout/`, `portal/` |
| Route folders | kebab-case | `checkout/`, `sign-in/` |

### Export Naming

| Export Type | Convention | Example |
|-------------|------------|---------|
| Components | Named, PascalCase | `export { Button }` |
| Hooks | Named, camelCase | `export { useQuote }` |
| Utilities | Named, camelCase | `export { formatCurrency }` |
| Types | Named, PascalCase | `export type { ButtonProps }` |
| Constants | Named, SCREAMING_SNAKE | `export const SERVICE_AREAS` |

### React Component Conventions

```typescript
// Function component with named export
export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button {...props} />;
}

// NOT: export default function Button
// NOT: const Button = () => {}
// NOT: const Button: React.FC<ButtonProps>
```

---

## Import Patterns

### Import Order

All imports follow this order, enforced by ESLint:

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 2. Third-party libraries
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 3. Internal absolute imports (path aliases)
import { Button } from '@/components/ui';
import { db } from '@/db';
import { formatCurrency } from '@/lib/utils';
import { useQuote } from '@/hooks';

// 4. Relative imports (same feature/module)
import { PackageTierCard } from './PackageTierCard';
import { calculateTotal } from './utils';

// 5. Type imports (always last, use 'import type')
import type { Quote } from '@/types';
import type { PackageComparisonProps } from './types';
```

### Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/db/*": ["./src/db/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

### Path Alias Usage

| Alias | Usage | Example |
|-------|-------|---------|
| `@/*` | Any src file | `import { cn } from '@/lib/utils'` |
| `@/components/*` | Components | `import { Button } from '@/components/ui'` |
| `@/lib/*` | Utilities | `import { formatCurrency } from '@/lib/utils'` |
| `@/hooks/*` | Hooks | `import { useQuote } from '@/hooks'` |
| `@/db/*` | Database | `import { db } from '@/db'` |
| `@/types/*` | Types | `import type { Quote } from '@/types'` |

---

## Barrel Exports

### When to Use Barrel Exports

| Use Barrels For | Don't Use Barrels For |
|-----------------|----------------------|
| Shared UI components (`@/components/ui`) | Feature-specific components |
| Hooks (`@/hooks`) | Large modules with many exports |
| Types (`@/types`) | Files with circular dependency risk |
| Utilities (`@/lib/utils`) | API routes |

### Barrel Export Patterns

**UI Components:**
```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { TextInput } from './TextInput';
export { Card } from './Card';
export { Modal } from './Modal';
// ... all shared UI components

// Usage:
import { Button, TextInput, Card } from '@/components/ui';
```

**Hooks:**
```typescript
// src/hooks/index.ts
export { useQuote } from './use-quote';
export { useToast } from './use-toast';
export { useMediaQuery } from './use-media-query';

// Usage:
import { useQuote, useToast } from '@/hooks';
```

**Feature Components (No Barrel):**
```typescript
// Feature components imported directly
import { PackageComparison } from '@/components/features/quote/PackageComparison';
import { PaymentForm } from '@/components/features/checkout/PaymentForm';

// NOT: import { PackageComparison } from '@/components/features/quote';
```

---

## Co-location Rules

### Files That Stay Together

| Primary File | Co-located Files | Location |
|--------------|------------------|----------|
| `Component.tsx` | `.module.css`, `.test.tsx`, `types.ts` | Same folder |
| `use-feature.ts` | Related hook utilities | Same folder if complex |
| `route.ts` | Route-specific utilities | Same API folder |
| `page.tsx` | Page-specific components | Same route folder (rare) |

### Files That Go in Shared Folders

| File Type | Location | Rationale |
|-----------|----------|-----------|
| Global styles | `src/styles/` | Apply across all components |
| Shared types | `src/types/` | Used by multiple modules |
| Test utilities | `tests/` | Shared test helpers |
| Test fixtures | `tests/fixtures/` | Shared test data |
| Mocks | `tests/mocks/` | MSW handlers, service mocks |

### Co-location Example

```
src/components/features/quote/PackageComparison/
├── PackageComparison.tsx           # Main component
├── PackageComparison.module.css    # Styles (co-located)
├── PackageComparison.test.tsx      # Tests (co-located)
├── PackageComparisonSkeleton.tsx   # Loading state (co-located)
├── use-package-selection.ts        # Component-specific hook (co-located)
└── index.ts
```

---

## File Templates

### React Component Template

```typescript
// src/components/ui/[ComponentName]/[ComponentName].tsx
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import styles from './[ComponentName].module.css';
import { cn } from '@/lib/utils';

export interface [ComponentName]Props extends ComponentPropsWithoutRef<'div'> {
  /** Prop description */
  variant?: 'default' | 'secondary';
}

export const [ComponentName] = forwardRef<HTMLDivElement, [ComponentName]Props>(
  function [ComponentName]({ variant = 'default', className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.root, styles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

### Server Action Template

```typescript
// src/app/actions/[domain].ts
'use server';

import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db';

// 1. Schema definition
const CreateResourceSchema = z.object({
  field: z.string().min(1, 'Field is required'),
});

// 2. Action export
export async function createResource(
  input: z.infer<typeof CreateResourceSchema>
) {
  // 3. Validate input
  const validated = CreateResourceSchema.parse(input);

  // 4. Auth check (if needed)
  const { userId } = auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // 5. Database operation
  const [resource] = await db.insert(resources)
    .values({ ...validated })
    .returning();

  // 6. Revalidate and redirect
  revalidatePath('/resources');
  redirect(`/resources/${resource.id}`);
}
```

### API Route Template

```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { ApiError, createSuccessResponse, createErrorResponse } from '@/lib/api';

const CreateResourceSchema = z.object({
  field: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate body
    const body = await request.json();
    const input = CreateResourceSchema.parse(body);

    // 2. Database operation
    const [resource] = await db.insert(resources)
      .values(input)
      .returning();

    // 3. Return success response
    return NextResponse.json(
      createSuccessResponse(resource),
      { status: 201 }
    );
  } catch (error) {
    // 4. Handle errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', error.issues),
        { status: 400 }
      );
    }

    console.error('API error:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
```

### Hook Template

```typescript
// src/hooks/use-[resource].ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UseResourceOptions {
  enabled?: boolean;
}

export function useResource(id: string, options: UseResourceOptions = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResource(id),
    enabled: options.enabled ?? true,
  });

  const mutation = useMutation({
    mutationFn: updateResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', id] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
```

### Drizzle Schema Template

```typescript
// src/db/schema/[resource].ts
import { pgTable, uuid, text, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Fields
  name: text('name').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true).notNull(),

  // Foreign keys
  parentId: uuid('parent_id').references(() => parents.id),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  parent: one(parents, {
    fields: [resources.parentId],
    references: [parents.id],
  }),
  children: many(children),
}));
```

---

## Special Files Reference

### Next.js Special Files

| File | Purpose | Location |
|------|---------|----------|
| `layout.tsx` | Shared layout wrapper | Route folders |
| `page.tsx` | Route content | Route folders |
| `loading.tsx` | Suspense fallback | Route folders |
| `error.tsx` | Error boundary | Route folders |
| `not-found.tsx` | 404 page | Route folders |
| `route.ts` | API endpoint | `api/` folders |
| `middleware.ts` | Edge middleware | `src/` root |
| `globals.css` | Global styles | `app/` |

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `drizzle.config.ts` | Drizzle Kit configuration |
| `vitest.config.ts` | Vitest test configuration |
| `.eslintrc.cjs` | ESLint rules |
| `.prettierrc` | Prettier formatting |
| `postcss.config.js` | PostCSS plugins |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [07-technical-architecture.md](./07-technical-architecture.md) | System architecture this structure implements |
| [06-component-specs.md](./06-component-specs.md) | Components organized within this structure |
| [08-data-models.md](./08-data-models.md) | Schema definitions for `/db` folder |
| [09-api-contracts.md](./09-api-contracts.md) | API routes organized in this structure |
| [17-code-patterns.md](./17-code-patterns.md) | Implementation patterns using this structure |
| [BRAND-ASSETS.md](./BRAND-ASSETS.md) | Design tokens for `/styles` folder |

---

## Quality Checklist

Before marking this document complete:

- [x] Root directory structure documented with all folders
- [x] App Router structure covers all routes from 05-ui-ux-design.md
- [x] Component organization matches 06-component-specs.md
- [x] Integration adapters structure matches 07-technical-architecture.md
- [x] Database structure documented for Drizzle ORM
- [x] All naming conventions documented (files, folders, exports)
- [x] Import order and path aliases configured
- [x] Barrel export rules defined
- [x] Co-location rules clear and actionable
- [x] File templates provided for common patterns
- [x] Related documents cross-referenced

**Status: COMPLETE** - Ready for Phase 2B continuation (17-code-patterns.md requires 15 + 16)
