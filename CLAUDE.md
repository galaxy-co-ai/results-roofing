# Results Roofing - Claude Code Instructions

## Quick Start

```bash
npm run dev          # Start dev server (localhost:3000)
npm run typecheck    # Check TypeScript
npm run db:studio    # Open Drizzle Studio
```

---

## Project Overview

Instant roof replacement quote platform for self-pay homeowners.

| Key | Value |
|-----|-------|
| Stack | Next.js 14, TypeScript, Drizzle, Neon, Clerk, Stripe |
| Status | MVP ~75% complete |
| Design | `designs/brand.md` (local to project) |

---

## File Structure

```
src/
├── app/           # Next.js App Router (pages + API routes)
│   ├── api/       # REST endpoints
│   ├── admin/     # Dev admin panel
│   ├── ops/       # Internal ops dashboard (GHL CRM)
│   ├── quote/     # Quote wizard flow (v1)
│   ├── quote-v2/  # Quote wizard (v2, XState)
│   └── portal/    # Customer dashboard (protected)
├── components/    # ui/ + features/ + layout/
├── db/            # Drizzle schema + queries
├── hooks/         # React Query hooks
├── lib/           # Utils + integrations
├── styles/        # Design tokens + globals
└── types/         # TypeScript definitions
```

See `INDEX.md` for full route map. See `src/INDEX.md` for feature → file mapping.

---

## Key Patterns

### Database Queries
Centralized in `src/db/queries/` — use existing functions, don't write raw queries in components.

### Integration Adapters
All external services in `src/lib/integrations/adapters/` with consistent interface:
- **Google Solar** — Active (satellite roof measurement, ~$0.075/request)
- **Stripe** — Active (payment intents, customer management, webhooks)
- Resend, Wisetack, SignalWire, JobNimbus, Documenso, Docuseal — mostly stubbed

### Quote Flow
Two versions coexist:
- **v1** — Context + useReducer, multi-page (`/quote/new` → `/quote/[id]/customize` → ...)
- **v2** — XState machine, single-page (`/quote-v2/[id]`), state persisted in `quote_drafts`

### Auth
- **Clerk** handles auth. Protected routes use Clerk middleware.
- **Portal** requires sign-in.
- **Dev bypass** via `DEV_BYPASS_ENABLED` + `MOCK_USER` in `src/lib/auth/dev-bypass.ts`

### Styling
- Semantic CSS tokens in `src/styles/tokens/colors.css` (`--rr-color-*`)
- Tailwind for utility classes + custom `hover-hover` variant for `@media (hover: hover)`
- CSS Modules for quote wizard and portal layout
- Design constitution: `designs/CLAUDE.md`

---

## Gotchas

- **Stripe SDK** — Use latest API version, types break with mismatches
- **Stripe expanded types** — `charge.payment_method` needs cast when expanded (TS doesn't know)
- **Mapbox tokens** — Domain restricted, check env vars
- **Neon** — Use `@neondatabase/serverless`, not `pg`
- **drizzle-kit push** — Use `--force` flag in non-interactive terminals
- **Empty dirs** — Have `.gitkeep` files, don't delete them
- **Google Solar API** — NOT_FOUND errors are free, successful queries cost
- **PDF rendering** — `@react-pdf/renderer`'s `renderToBuffer` needs `as any` cast, response needs `new Uint8Array(buffer)`
- **Focus outlines** — Programmatic `.focus()` shows browser default outline; add `outline: none` on non-interactive containers

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run db:push` | Push schema to Neon |
| `npm run db:studio` | Drizzle Studio GUI |
| `npm run db:seed` | Seed pricing tiers |

---

## Environment

Copy `.env.example` to `.env.local`. Required:
- `DATABASE_URL` — Neon connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `GOOGLE_SOLAR_API_KEY`

---

## Session Continuity

On session start:
1. Read this file + `INDEX.md`
2. Read `src/INDEX.md` for feature → file mapping
3. Check `docs/roadmap/progress-tracker.md` for latest status

Before session ends:
1. Update INDEX files if features/routes changed
2. Update progress-tracker.md if milestones hit
