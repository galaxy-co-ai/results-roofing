# Source Index — Feature → File Map

Quick-reference for finding code by feature. Updated 2026-02-26.

## Portal (Redesigned)

Phase-aware customer portal with 5 lifecycle phases. `/portal/dashboard` removed — merged into `/portal`.

### Phase Detection
| Feature | Key Files |
|---------|-----------|
| Phase enum + logic | `lib/portal/phases.ts` — Phase enum, detection logic, PhaseContext interface |
| Phase tests | `lib/portal/phases.test.ts` — 6 tests covering all phase transitions |
| Phase hook | `hooks/usePortalPhase.ts` — React hook composing useOrders + useOrderDetails + detectPhase |

### Layout
| Feature | Key Files |
|---------|-----------|
| Portal shell | `app/portal/layout.tsx` — SidebarV2 + BottomTabBar |
| Layout styles | `app/portal/layout.module.css` — 72px margin-left desktop, 0 mobile |

### Components
| Feature | Key Files |
|---------|-----------|
| Sidebar | `components/features/portal/PortalSidebarV2/` — Fixed 72px icon-only sidebar |
| Header | `components/features/portal/PortalHeader/` — Page header with title, help, avatar |
| Bottom tabs | `components/features/portal/BottomTabBar/` — Mobile bottom nav (≤768px) |
| Timeline | `components/features/portal/ProjectTimeline/` — 6-stage horizontal tracker |
| Checklist | `components/features/portal/Checklist/` — 5-step onboarding checklist |
| Empty state | `components/features/portal/EmptyStateLocked/` — Skeleton + lock empty state |
| Quote card | `components/features/portal/QuoteSummaryCard/` — Address + metadata card |
| Phase shell | `components/features/portal/PhaseShell/` — Phase 4-5 placeholders |
| Payment progress | `components/features/portal/PaymentProgressCard.tsx` |
| Payment options | `components/features/portal/PaymentOptionCard.tsx` |
| Payment history | `components/features/portal/PaymentHistoryTable.tsx` |

### Pages
| Feature | Key Files |
|---------|-----------|
| My Project | `app/portal/page.tsx` — Phase-adaptive content |
| Payments | `app/portal/payments/page.tsx` — Locked → ledger |
| Documents | `app/portal/documents/page.tsx` — Locked → icon-action rows |
| Schedule | `app/portal/schedule/page.tsx` — Locked → install details |

### APIs
| Feature | Key Files |
|---------|-----------|
| Order details API | `app/api/portal/orders/[id]/route.ts` |
| Receipt PDF API | `app/api/portal/receipts/[paymentId]/route.ts` |
| Receipt template | `lib/pdf/receipt-template.tsx` |

## Quote Wizard (v1)

| Feature | Key Files |
|---------|-----------|
| Entry point | `app/quote/new/page.tsx` |
| Provider/state | `components/features/quote/QuoteWizardProvider.tsx` |
| Stage 1 (address) | `components/features/quote/stages/Stage1/Stage1Container.tsx` |
| Stage 2 (packages) | `components/features/quote/stages/Stage2/` |
| Stage 3 (checkout) | `components/features/quote/stages/Stage3/` |
| Address entry | `components/features/address/` |
| Package tier cards | `components/features/quote/PackageTierCard/` |
| Checkout flow | `app/quote/[id]/checkout/page.tsx` |
| Order confirmation | `app/quote/[id]/confirmation/page.tsx` |

## Quote Wizard (v2 — XState)

| Feature | Key Files |
|---------|-----------|
| Entry point | `app/quote-v2/page.tsx`, `app/quote-v2/[id]/page.tsx` |
| State machine | `components/features/quote-v2/WizardMachine.ts` |
| Steps | `components/features/quote-v2/steps/` |
| Checkpoint API | `app/api/quote-v2/[id]/checkpoint/route.ts` |

## Payments & Stripe

| Feature | Key Files |
|---------|-----------|
| Create intent | `app/api/payments/create-intent/route.ts` |
| Webhook handler | `app/api/payments/webhook/route.ts` |
| Stripe adapter | `lib/integrations/adapters/stripe.ts` |
| Payment drawer | `components/features/checkout/PaymentDrawer.tsx` |
| Payment form | `components/features/checkout/PaymentForm.tsx` |
| Deposit auth card | `components/features/checkout/DepositAuthCard/` |

## Satellite Measurement

| Feature | Key Files |
|---------|-----------|
| Google Solar adapter | `lib/integrations/adapters/google-solar.ts` |
| Measurement API | `app/api/quotes/[id]/satellite-measurement/route.ts` |
| React hook | `hooks/useSatelliteMeasurement.ts` |
| Sqft estimation | `lib/pricing/estimate-sqft.ts` |
| DB schema | `db/schema/measurements.ts` |

## Pricing

| Feature | Key Files |
|---------|-----------|
| Price calculation | `lib/pricing/calculate-quote.ts` |
| Sqft estimation | `lib/pricing/estimate-sqft.ts` |
| Tier definitions | `db/schema/pricing-tiers.ts` |
| Tier API | `app/api/pricing-tiers/route.ts` |

## Database

| Area | Key Files |
|------|-----------|
| All schemas | `db/schema/index.ts` (barrel) |
| Relations | `db/schema/relations.ts` |
| Core queries | `db/queries/index.ts` (barrel) |
| Connection | `db/index.ts` |

## Ops Dashboard (Internal)

| Feature | Key Files |
|---------|-----------|
| Layout/auth | `app/ops/layout.tsx`, `app/ops/OpsLogin.tsx` |
| CRM contacts | `app/ops/crm/contacts/page.tsx` |
| Pipeline | `app/ops/crm/pipeline/page.tsx` |
| Messaging | `app/ops/messaging/email/page.tsx`, `.../sms/page.tsx` |
| Blog | `app/ops/blog/posts/page.tsx` |
| Analytics | `app/ops/analytics/page.tsx` |
| GHL client | `lib/ghl/client.ts`, `lib/ghl/api/` |
| GHL webhook | `app/api/ops/webhooks/ghl/route.ts` |

## Design Tokens & Styles

| Area | Key Files |
|------|-----------|
| Color tokens | `styles/tokens/colors.css` (all `--rr-color-*` vars) |
| Typography | `styles/tokens/typography.css` |
| Spacing | `styles/tokens/spacing.css` |
| Globals | `styles/globals.css` |
| Tailwind config | `tailwind.config.ts` (includes `hover-hover` variant) |

## Auth

| Area | Key Files |
|------|-----------|
| Clerk middleware | `middleware.ts` |
| Dev bypass | `lib/auth/dev-bypass.ts` |
| Ops auth | `lib/ops/auth.ts` |
