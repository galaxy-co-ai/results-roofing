# Ops Dashboard — Production Readiness Plan

> Goal: Ship a contractor-ready ops dashboard that looks like a full dev team built it.
> No fake data visible to users. Every button works or isn't shown.

## Status After Remediation (Rounds 1-6)

**Functional pages (real APIs, loading skeletons, URL state):**
- Dashboard — stats API, chart skeleton
- CRM Contacts — GHL integration
- CRM Pipeline — GHL integration, drag-drop
- SMS Conversations — GHL integration
- Email Conversations — GHL integration
- Support Tickets — local DB (Drizzle/Neon)
- Documents — local DB

**Broken/mock pages (no backend, fake data in session):**
- Jobs, Customers, Calendar, Estimates, Invoices, Payments, Materials,
  Analytics, Automations, Reports, Team, Settings, Inbox

**Critical gap:** Sidebar nav links to mock pages. Functional pages
(CRM, Messaging, Support) aren't reachable from nav.

---

## Phase 1: Ship-Blocking Fixes

### 1.1 — Reorganize sidebar navigation
**File:** `src/components/ops/shell/OpsSidebar.tsx`

Replace current 5-group nav with structure that maps to real pages:

```
OVERVIEW
  Dashboard        /ops

CRM
  Contacts         /ops/crm/contacts
  Pipeline         /ops/crm/pipeline

MESSAGING
  SMS              /ops/messaging/sms
  Email            /ops/messaging/email

SUPPORT
  Tickets          /ops/support

CONTENT
  Documents        /ops/documents
  Blog             /ops/blog
```

Remove nav items that link to mock-data pages. Keep those pages in the
codebase but unreachable from nav until they have real backends.

### 1.2 — Fix stub buttons and handlers
| Page | Issue | Fix |
|------|-------|-----|
| Support (`support/page.tsx`) | "New Ticket" button has no handler | Wire to a create-ticket dialog or remove |
| Contacts (`crm/contacts/page.tsx`) | View/Edit/Message stubs do nothing | Wire to contact detail drawer or link to GHL |
| Blog (`blog/page.tsx`) | "New Post" button is a stub | Wire to `/ops/blog/posts` create flow |
| Dashboard (`page.tsx`) | Activity chart uses hardcoded data | Replace with real stats or remove chart |

### 1.3 — Fix conversations API mismatch
**File:** `src/app/api/ops/conversations/route.ts`

The `useSendMessage` hook POSTs to `/api/ops/conversations/{conversationId}`
with `{ body }`, but the POST route expects `SendMessageSchema` with
`type`, `contactId`, `message`. Either:
- Add a separate POST route on `[id]/route.ts` for sending to existing conversations
- Or adjust the hook to match the schema

### 1.4 — Remove mock data fallbacks from APIs
**Files:** `dashboard/stats/route.ts`, `contacts/route.ts`, `conversations/route.ts`, `pipelines/route.ts`

When GHL isn't configured, return `503 Service Unavailable` with a clear
message instead of silently returning mock data with `mock: true`.

Frontend should show a "Connect GoHighLevel" card when it gets 503.

---

## Phase 2: Design Constitution Compliance

### 2.1 — Replace hardcoded hex values with semantic tokens
**Priority CSS files (by violation count):**

| File | Violations | Key Colors to Replace |
|------|------------|----------------------|
| messaging.module.css | ~15 | `#06B6D4` → `var(--ops-accent-documents)`, `#EF4444` → `var(--admin-status-error)`, `#F59E0B` → `var(--admin-status-warning)` |
| blog.module.css | ~8 | `rgba(107,114,128,...)` → semantic status tokens |
| analytics.module.css | ~4 | `#059669` / `#dc2626` → status tokens |
| support.module.css | ~3 | Accent colors → tokens |

Also remove CSS fallback values (`var(--color-bg-primary, #ffffff)` → `var(--card)`).

### 2.2 — Add missing interactive states
Every button/link needs: hover, active, focus-visible, disabled.

Focus on:
- `blog.module.css` — `.statusTab`, `.editorToolbar button`, `.cardMenu`
- `messaging.module.css` — `.filterTab`, `.actionBtn`
- `support.module.css` — `.filterToggle`, `.statusTab`

### 2.3 — Add focus-visible rings
Replace any `outline`-based focus with `box-shadow: 0 0 0 2px var(--ops-accent-default)`.

Files: `blog.module.css`, `messaging.module.css`, `support.module.css`
(search inputs and interactive elements).

### 2.4 — Add tabular-nums to remaining numeric displays
| File | Selector | What it displays |
|------|----------|-----------------|
| analytics.module.css | `.statsChange` | Percentage changes |
| blog.module.css | `.statusCount` | Post counts per status |
| messaging.module.css | `.unreadBadge` | Unread count |
| messaging.module.css | `.timestamp` | Message times |

### 2.5 — Fix spacing grid (4px)
| File | Selector | Current | Fix |
|------|----------|---------|-----|
| analytics.module.css | `.statsChange` gap | 2px | 4px |
| blog.module.css | status badge gap | 6px | 8px |
| support.module.css | filter gap | 6px (0.375rem) | 8px |

### 2.6 — Fix motion timing
Replace generic `ease` with `var(--admin-ease-out)` and hardcoded durations
with `var(--admin-duration-hover)` (150ms) across all module CSS files.

---

## Phase 3: API Hardening

### 3.1 — Add Zod validation to unvalidated endpoints
- `POST /api/ops/blog/posts` — validate title, content, status
- `POST /api/ops/documents` — validate name, folder

### 3.2 — Fix HTTP status codes
- Blog POST: return 201, not 200
- Support ticket POST: verify 201

### 3.3 — Rate limiting on write endpoints
Add rate limiter to: `POST /contacts`, `POST /tickets`, `POST /conversations`,
`POST /documents`, `POST /blog/posts`.

Note: Current in-memory rate limiter won't work on Vercel serverless.
Migrate to Upstash Redis before production.

---

## Phase 4: Polish

### 4.1 — Accessibility
- Add `aria-label` to all icon-only buttons
- Fix heading hierarchy (single h1 per page)
- Add `aria-live` to toast notifications

### 4.2 — Mobile responsiveness
- Test all ops pages at 375px
- Add scroll indicators on horizontal overflow
- Ensure 44px touch targets on mobile

### 4.3 — prefers-reduced-motion
- Verify `ops-tokens.css` media query zeroes animation durations
- Ensure CSS keyframe animations reference token durations

---

## Execution Order

| Batch | Tasks | Est. Scope |
|-------|-------|-----------|
| **Batch 1** | 1.1 (sidebar), 1.2 (stub buttons), 1.4 (mock fallbacks) | Sidebar rewrite + 4 page fixes |
| **Batch 2** | 2.1 (hex → tokens), 2.4 (tabular-nums), 2.5 (spacing) | 4 CSS files |
| **Batch 3** | 2.2 (interactive states), 2.3 (focus rings), 2.6 (motion) | 4 CSS files |
| **Batch 4** | 1.3 (conversations API), 3.1 (validation), 3.2 (status codes) | 3 API routes |
| **Batch 5** | 4.1 (a11y), 4.2 (mobile), 4.3 (motion) | Cross-cutting polish |

---

## Out of Scope (Future Work)

These items are intentionally deferred:

- **9 mock-data pages** (Jobs, Customers, Calendar, etc.) — need real backends
  or integration decisions before wiring up
- **Activity chart time-series** — no historical data source yet
- **Upstash Redis rate limiting** — infrastructure decision
- **Dark mode testing** — tokens exist but untested
- **Team invitations** — needs email integration
- **Pipeline drag-drop to different stages** — partially works, needs refinement
