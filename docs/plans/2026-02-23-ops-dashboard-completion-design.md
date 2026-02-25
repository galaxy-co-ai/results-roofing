# Ops Dashboard Completion — Design Document

**Date:** 2026-02-23
**Scope:** Complete all gaps in the `/ops` dashboard except Google Analytics integration (blocked on DNS)

## Context

The ops dashboard has 22 pages. An audit revealed:
- **15 pages** use real DB/GHL data via React Query
- **3 pages** are pure `useState` mocks (Materials, Automations, Team)
- **5 pages** are read-only that need write operations
- **Settings** is mostly "Coming soon" toasts
- **Several pages** are missing key capabilities (new conversations, ticket creation, etc.)

GHL is configured in production (env vars confirmed). Mock fallback is dev-only.

## Existing Patterns (must follow)

| Pattern | Convention |
|---------|-----------|
| IDs | UUID with `defaultRandom()` |
| Timestamps | `timestamp({ withTimezone: true })` + `defaultNow()` |
| Status fields | PostgreSQL `pgEnum()` |
| Money | `decimal(10, 2)` |
| No soft deletes | Status enums handle logical deletion |
| Schema location | `src/db/schema/` (exported from `index.ts`) |
| Queries | `src/db/queries/` (centralized, not inline) |
| API routes | `src/app/api/ops/` |
| Hooks | `src/hooks/ops/use-ops-queries.ts` |
| Types | `src/types/ops.ts` |

---

## Phase 1: Data Foundation — New DB Tables

### 1a. `materials_orders` table

```
id              UUID PK
job             varchar NOT NULL          -- job address/name
supplier        varchar NOT NULL
total           decimal(10,2) NOT NULL    -- dollar amount
status          pgEnum: draft | sent | confirmed | delivered | cancelled
orderedAt       timestamp (nullable)
deliveryAt      timestamp (nullable)
notes           text (nullable)
createdAt       timestamp default now()
updatedAt       timestamp default now()
```

### 1b. `automations` table

```
id              UUID PK
name            varchar NOT NULL
trigger         text NOT NULL             -- trigger condition description
actions         text NOT NULL             -- action description
status          pgEnum: active | paused
lastTriggeredAt timestamp (nullable)
runs            integer default 0
createdAt       timestamp default now()
updatedAt       timestamp default now()
```

Note: Automations are descriptive records only (no execution engine). Future work could wire these to actual triggers.

### 1c. `team_members` table

```
id              UUID PK
name            varchar NOT NULL
email           varchar NOT NULL UNIQUE
phone           varchar (nullable)
role            pgEnum: admin | manager | member
activeJobs      integer default 0
revenue         decimal(10,2) default 0
lastActiveAt    timestamp (nullable)
createdAt       timestamp default now()
updatedAt       timestamp default now()
```

### 1d. `company_settings` table (single-row config)

```
id              UUID PK
companyName     varchar NOT NULL
phone           varchar
address         text
email           varchar
licenseNumber   varchar
updatedAt       timestamp default now()
```

### 1e. `pipeline_stages` table

```
id              UUID PK
name            varchar NOT NULL
position        integer NOT NULL          -- sort order
color           varchar (nullable)        -- hex color for UI
isDefault       boolean default false     -- can't be deleted
createdAt       timestamp default now()
updatedAt       timestamp default now()
```

Seed with the 10 existing stages from the Settings page.

### 1f. `notification_preferences` table

```
id              UUID PK
eventType       pgEnum: new_lead | proposal_signed | payment_received | invoice_overdue | task_overdue
emailEnabled    boolean default false
smsEnabled      boolean default false
updatedAt       timestamp default now()
```

Seed with 5 rows (one per event type).

### API Routes Needed

| Route | Methods | Table |
|-------|---------|-------|
| `/api/ops/materials` | GET, POST | materials_orders |
| `/api/ops/materials/[id]` | PATCH, DELETE | materials_orders |
| `/api/ops/automations` | GET, POST | automations |
| `/api/ops/automations/[id]` | PATCH, DELETE | automations |
| `/api/ops/team` | GET, POST | team_members |
| `/api/ops/team/[id]` | PUT, DELETE | team_members |
| `/api/ops/settings` | GET, PUT | company_settings |
| `/api/ops/settings/pipeline` | GET, POST, PUT, DELETE | pipeline_stages |
| `/api/ops/settings/notifications` | GET, PUT | notification_preferences |
| `/api/ops/settings/export` | GET | multi-table CSV export |
| `/api/ops/settings/import` | POST | contacts CSV import |

---

## Phase 2: Wire Mock Pages to Real Data

Replace `useState` with React Query hooks in:
- **Materials** — `useOpsMaterials()`, `useCreateMaterial()`, `useUpdateMaterial()`, `useDeleteMaterial()`
- **Automations** — `useOpsAutomations()`, `useCreateAutomation()`, `useUpdateAutomation()`, `useDeleteAutomation()`
- **Team** — `useOpsTeam()`, `useInviteTeamMember()`, `useUpdateTeamMember()`, `useDeleteTeamMember()`

Add types to `src/types/ops.ts`:
- `MaterialOrder`, `MaterialOrderStatus`
- `Automation`, `AutomationStatus`
- `TeamMember`, `TeamMemberRole`

---

## Phase 3: Write Operations for Read-Only Pages

### Estimates
- Status updates (archive, reactivate)
- Delete estimate
- No manual creation (estimates come from quote flow)

### Invoices
- Status updates: mark paid, void, mark overdue
- No manual creation (invoices come from orders)

### Calendar
- Create appointment (type, date/time, attendee info, notes)
- Edit appointment (reschedule, update notes)
- Cancel appointment (with reason)

### Documents
- Upload document (file upload to storage, record in DB)
- Rename document
- Delete document
- Move between folders

### Payments
- Status-only: mark as reconciled
- No manual creation (payments come from Stripe)

---

## Phase 4: Missing Capabilities

### New Conversation Initiation (Inbox, SMS, Email)
- "New Message" button → contact picker → compose → send via GHL API
- New mutation hook: `useCreateConversation()`
- API: POST to GHL create conversation endpoint

### Create Ticket (Support)
- Wire existing "New Ticket" button to a creation modal
- Fields: subject, priority, channel, contact (picker or manual entry), initial message
- API: POST `/api/ops/support/tickets` (already exists, just need UI)

### Contacts CRM Action Handlers
- **View**: Open detail modal with full contact info
- **Edit**: Inline edit or modal form → PUT `/api/ops/contacts/[id]`
- **Message**: Open conversation or create new one for contact

### Dashboard — Real Activity Chart
- Replace hardcoded mock data with real query
- Source from recent orders, quotes, appointments aggregated by day
- New API endpoint or extend `/api/ops/dashboard/stats`

### Reports — Real Data Cards
- **Sales Rep Leaderboard**: Query team_members by revenue (once table exists)
- **Lead Source Breakdown**: Aggregate leads by `utmSource` from leads table (no GA needed)

---

## Phase 5: Settings — Full Implementation

### Company Info Tab
- Wire save to `/api/ops/settings` PUT
- Load existing values on mount from GET

### Pipeline Management Tab
- List stages from `pipeline_stages` table
- Drag-to-reorder (update `position`)
- Add new stage
- Rename stage
- Delete stage (prevent if default)

### Integrations Tab
- Read-only status display (already shows connected/disconnected correctly)
- "Connect" buttons open docs/instructions rather than auto-connecting
- Show actual connection status from env var checks

### Notifications Tab
- Load preferences from `notification_preferences` table
- Toggle checkboxes save immediately (optimistic update)

### Data Tab
- **Export**: Stream CSV of contacts, orders, quotes, payments
- **Import**: CSV upload for contacts → parse, validate, insert into leads table

---

## Phase 6: Cleanup

- Delete unused analytics chart stubs: `AreaChart.tsx`, `BarChart.tsx`, `DonutChart.tsx`, `ActivityFeed.tsx`
- Remove or export orphaned `docuseal.ts` adapter
- Sweep remaining TODO comments in contacts CRM handlers
- Verify all ESLint warnings from build (the `useMemo` dependency warnings) are addressed

---

## Out of Scope

- Google Analytics integration (blocked on DNS/nameserver transfer)
- Automation execution engine (automations are descriptive records only)
- Real-time messaging (websocket push for SMS/email — future)
- Role-based access control (team members exist but no auth gating per role)
