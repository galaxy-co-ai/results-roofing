# Ops Dashboard Remediation Plan

## Completed (Phase 1) — commit afe6cbd
- [x] Auth gap: documents API route protection
- [x] Middleware-level /api/ops route auth
- [x] OpsSidebar nav restructure (5 sections, 15 items)
- [x] Error boundary (ops/error.tsx)
- [x] Centralize types → src/types/ops.ts (18 types)
- [x] React Query adoption → src/hooks/ops/use-ops-queries.ts (all 8 pages, 17 hooks)

---

## Phase 2: Wire & Polish (Execution Plan)

### Round 1 — Dashboard Real Data

**Problem:** Dashboard stat cards show hardcoded strings ("1,234", "$142,500", etc.) and
charts use inline mock arrays. No aggregation endpoint exists.

**Solution:** Create a `/api/ops/dashboard/stats` endpoint that aggregates from existing
GHL proxy endpoints, a `useOpsDashboardStats()` hook, and derive pipeline chart data from
the existing `useOpsPipeline()` hook.

#### Task 1.1: Create dashboard stats API route
**File:** `src/app/api/ops/dashboard/stats/route.ts` (NEW)
- GET handler that calls existing internal endpoints:
  - `/api/ops/contacts` → count contacts
  - `/api/ops/conversations?type=TYPE_SMS` + `TYPE_EMAIL` → count conversations
  - `/api/ops/pipelines?opportunities=true` → sum monetaryValue, count by stage
- Returns: `{ contacts: number, conversations: number, pipelineValue: number, pipelineByStage: {stage, count, value}[] }`
- Uses internal fetch to `localhost` with cookie forwarding for auth
- Mock fallback: return zeros when GHL not connected (consistent with existing pattern)

#### Task 1.2: Add dashboard types + hook
**Files:** `src/types/ops.ts`, `src/hooks/ops/use-ops-queries.ts`
- Add `DashboardStats` type to ops.ts
- Add `useOpsDashboardStats()` hook with 60s staleTime (matches health)
- Add `opsKeys.dashboardStats()` to key factory

#### Task 1.3: Wire dashboard page to real data
**File:** `src/app/ops/page.tsx`
- Replace stat card hardcoded values with `useOpsDashboardStats()` data
- Replace `pipelineData` array with derived data from `useOpsDashboardStats()`
- Keep `activityData` as-is with a `// TODO: time-series endpoint` comment
  (no historical data source exists — honest > broken)
- Format numbers properly: toLocaleString for counts, Intl.NumberFormat for currency

---

### Round 2 — Support Page CRUD

**Problem:** 4 handler functions have `// TODO: API call` comments. Two API routes are
missing entirely. No React Query mutations exist for tickets.

#### Task 2.1: Create ticket CRUD API route
**File:** `src/app/api/ops/support/tickets/[id]/route.ts` (NEW)
- PATCH handler: update ticket status/priority/tags (mock: return updated ticket)
- DELETE handler: delete ticket (mock: return success)
- Auth check via ops_session cookie (consistent with all other ops routes)
- GHL integration stub: log intent, return mock success

#### Task 2.2: Add ticket mutations to hooks
**File:** `src/hooks/ops/use-ops-queries.ts`
- `useUpdateTicket()` — PATCH /api/ops/support/tickets/{id}
  - Invalidates tickets list on success
- `useDeleteTicket()` — DELETE /api/ops/support/tickets/{id}
  - Invalidates tickets list on success
- `useSendTicketMessage()` — POST /api/ops/support/tickets/{id}/messages
  - Invalidates ticket messages + tickets list on success

#### Task 2.3: Wire support page handlers to mutations
**File:** `src/app/ops/support/page.tsx`
- `handleStatusChange` → `updateTicket.mutate({ ticketId, status })`
- `handleArchive` → `updateTicket.mutate({ ticketId, status: 'closed' })`
- `handleDelete` → `deleteTicket.mutate(ticketId)`
- `handleSendMessage` → `sendTicketMessage.mutate({ ticketId, body, channel })`
- Remove all TODO comments
- Remove `setSending` manual state — use mutation's `isPending`

---

### Round 3 — Pipeline Board Completion

**Problem:** View/Edit/Message handlers are no-ops. Delete bypasses React Query.

#### Task 3.1: Create opportunity detail/edit modal
**File:** `src/components/features/ops/pipeline/OpportunityModal.tsx` (NEW)
- Single modal component with view/edit modes
- View mode: show all opportunity fields read-only
- Edit mode: form with stage, value, status, contact fields
- Uses existing `Opportunity` type from `@/types/ops`
- On save: call existing PATCH /api/ops/opportunities/{id}

#### Task 3.2: Add missing pipeline mutations
**File:** `src/hooks/ops/use-ops-queries.ts`
- `useCreateOpportunity()` — POST /api/ops/pipelines (body: opportunity data)
- `useDeleteOpportunity()` — DELETE /api/ops/opportunities/{id}
  - Invalidates pipeline on success
- `useUpdateOpportunity()` — PATCH /api/ops/opportunities/{id} (general updates)

#### Task 3.3: Wire pipeline page handlers
**File:** `src/app/ops/crm/pipeline/page.tsx`
- `handleViewOpportunity` → open OpportunityModal in view mode
- `handleEditOpportunity` → open OpportunityModal in edit mode
- `handleDeleteOpportunity` → use `deleteOpportunity.mutate()` instead of raw fetch
- `handleMessageContact` → `router.push('/ops/messaging/sms?contact={contactId}')`
- Add "Add Deal" button → open OpportunityModal in create mode

---

### Round 4 — Loading Skeletons

**Problem:** Only SupportInbox has loading skeletons. Every other page shows nothing or
a bare spinner during load.

#### Task 4.1: Create skeleton components
**Files:** (all NEW under `src/components/ui/ops/`)
- `OpsTableSkeleton.tsx` — configurable rows/cols, used by contacts + documents
- `OpsCardGridSkeleton.tsx` — grid of pulsing cards, used by pipeline board
- `OpsChartSkeleton.tsx` — pulsing rectangle matching chart container size

#### Task 4.2: Wire skeletons into pages
**Files:** All ops pages that have loading states
- Dashboard: chart skeletons while stats load
- Contacts: table skeleton
- Documents: table skeleton (folder view) + card skeleton (folder grid)
- Pipeline: board skeleton
- Blog: table skeleton
- Conversations (SMS/Email): list skeleton (already has some — verify)

#### Task 4.3: Export from barrel + verify
- Add to `src/components/ui/ops/index.ts`
- TypeCheck passes

---

### Round 5 — URL State for Filters

**Problem:** All search/filter state uses `useState`. Lost on refresh. Not shareable.

#### Task 5.1: Install nuqs + create filter hook
- `npm install nuqs`
- Create `src/hooks/ops/use-ops-filters.ts` with `useOpsFilters(config)` helper
  - Wraps nuqs `useQueryState` for search, status, sort
  - Returns `{ search, setSearch, status, setStatus, ... }`

#### Task 5.2: Wire into pages
**Files:** 7 pages with filters
- Contacts: search + status + source + sort
- Pipeline: (search if it has one)
- Blog posts: search + status
- SMS/Email: search + filter
- Support: search + status
- Documents: folder (already uses state, move to URL)

---

### Round 6 — E2E Tests

**Files:** `tests/e2e/ops/`
- Ops auth flow (login/logout)
- Contact list + create + delete
- Pipeline view + drag-drop
- Support ticket view + status change + message send
- Blog post create + publish
- Document folder navigation

---

## Deferred (Not in Phase 2)
- Activity chart time-series endpoint (no data source exists)
- Avg Response Time metric (needs message timestamp analysis)
- Percentage change deltas on stat cards (needs historical comparison)
- 9 standalone pages (jobs, customers, calendar, etc.) API integration
  → These pages have full UI with local mock data. API wiring deferred until
    GHL endpoints or local DB tables are ready for each domain.
