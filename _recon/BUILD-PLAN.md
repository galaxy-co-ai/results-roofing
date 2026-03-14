# Ops Dashboard — Build Plan

> Start here after compaction. This is the roadmap.

## Continue From Here

**Status:** Research & design complete. Ready to build.
**Next step:** User does revision pass on wireframes.md, then we start Phase 1.

### Recon Files (read these first)
1. `_recon/ops-design-spec.md` — Canonical design tokens, colors, typography, spacing, component specs
2. `_recon/wireframes.md` — 4 layout wireframes + table archetype + nav grouping
3. `_recon/ops-dashboard-pages.md` — All 23 page definitions with content specs
4. `_recon/roofr-feature-map.md` — Roofr competitive analysis + gap matrix
5. `_recon/screenshots/` — 7 Roofr inspo screenshots

### Key Decisions Already Made
- All ops tokens use `--ops-` prefix (replaces conflicting --rr-, --admin-, shadcn HSL systems)
- Fonts: Sora (headlines) + Inter (body, 14px default) + JetBrains Mono (data) — loaded via next/font
- Shadcn components reused via CSS variable override in ops layout (no component duplication)
- Sidebar: 240px expanded, 64px collapsed, hidden on mobile
- Dark mode tokens pre-defined but NOT implemented yet (light only for v1)
- 23 pages across 15 sections, 7 unique archetypes

---

## Build Phases

### Phase 1: Foundation (Build First)
Create the ops shell and token system. Everything else plugs into this.

| # | Task | Files | Depends On |
|---|------|-------|------------|
| 1.1 | Create `src/styles/ops-tokens.css` with all --ops-* variables | New file | Nothing |
| 1.2 | Create `src/styles/ops-utilities.css` with ops-specific utility classes | New file | 1.1 |
| 1.3 | Update `tailwind.config.ts` — extend with ops tokens | Existing | 1.1 |
| 1.4 | Rebuild `src/app/ops/layout.tsx` — next/font loading (Sora, Inter, JetBrains Mono), ops shell wrapper, data-layout="ops" attribute | Existing | 1.1 |
| 1.5 | Build `src/components/ops/shell/Sidebar.tsx` — nav groups, items, collapse, responsive | New | 1.4 |
| 1.6 | Build `src/components/ops/shell/PageHeader.tsx` — title, breadcrumb, actions slot | New | 1.4 |
| 1.7 | Build `src/components/ops/shell/OpsShell.tsx` — sidebar + header + content composition | New | 1.5, 1.6 |
| 1.8 | Add shadcn variable overrides in ops layout scope | 1.1 update | 1.1 |

**Deliverable:** Empty ops dashboard with working sidebar nav, header, and content area. All pages render inside the shell.

### Phase 2: Core Components
Reusable building blocks used across multiple pages.

| # | Task | Files |
|---|------|-------|
| 2.1 | `StatusBadge` component (5 variants: success, warning, error, info, neutral) | New |
| 2.2 | `KpiCard` component (label, value, trend, comparison) | New |
| 2.3 | `DataTable` component (sortable columns, pagination, row hover, empty state) | New (or extend shadcn table) |
| 2.4 | `FilterToolbar` component (search + filter dropdowns) | New |
| 2.5 | `ActivityFeed` component (icon + text + timestamp list) | New |
| 2.6 | `TaskChecklist` component (checkbox + task + due date) | New |

**Location:** `src/components/ops/ui/`

### Phase 3: Dashboard Page
The command center — most complex composition.

| # | Task |
|---|------|
| 3.1 | `/ops/dashboard` page with KPI cards row |
| 3.2 | Pipeline snapshot bar (stacked horizontal bar) |
| 3.3 | Recent activity feed (left column) |
| 3.4 | Upcoming tasks + appointments (right column) |
| 3.5 | API: `/api/ops/dashboard` — aggregated stats endpoint |

### Phase 4: Jobs (Kanban)
The second most complex page. Core workflow.

| # | Task |
|---|------|
| 4.1 | Schema: add `jobs` table (or rename/extend `orders`) with pipeline stages |
| 4.2 | Schema: add `tasks` table (job-linked, assignable) |
| 4.3 | `KanbanColumn` component |
| 4.4 | `KanbanCard` component (address, value, tasks, badges, avatar) |
| 4.5 | `KanbanBoard` component (horizontal scroll, drag-and-drop with dnd-kit) |
| 4.6 | `/ops/jobs` page — board view + list view toggle |
| 4.7 | `/ops/jobs/[id]` — job detail page (tabbed: overview, tasks, estimates, invoices, docs, comms, payments, materials, photos) |
| 4.8 | API: CRUD for jobs, tasks, stage transitions |

### Phase 5: CRM (Customers)
| # | Task |
|---|------|
| 5.1 | Schema: `customers` table (or extend `leads`) |
| 5.2 | `/ops/customers` — table page |
| 5.3 | `/ops/customers/[id]` — customer profile |
| 5.4 | API: customer CRUD + aggregation |

### Phase 6: Sales Suite (Estimates, Invoices, Payments, Materials)
| # | Task |
|---|------|
| 6.1 | Schema: `estimates` table (extend from quotes?) |
| 6.2 | Schema: `invoices` table |
| 6.3 | Schema: `material_orders` table |
| 6.4 | `/ops/estimates` + `/ops/estimates/[id]` (builder) |
| 6.5 | `/ops/invoices` + `/ops/invoices/[id]` (builder) |
| 6.6 | `/ops/payments` — payment ledger |
| 6.7 | `/ops/materials` + `/ops/materials/[id]` (order form) |
| 6.8 | APIs for each |

### Phase 7: Communication (Inbox)
| # | Task |
|---|------|
| 7.1 | Schema: `conversations`, `messages` tables |
| 7.2 | `/ops/inbox` — split pane layout |
| 7.3 | Conversation list component |
| 7.4 | Message thread component |
| 7.5 | Compose area with channel selector |
| 7.6 | Wire to Resend (email) + SignalWire (SMS) adapters |

### Phase 8: Documents
| # | Task |
|---|------|
| 8.1 | Schema: extend `documents` table with template support |
| 8.2 | `/ops/documents` — template + document list |
| 8.3 | `/ops/documents/[id]` — document viewer/editor |
| 8.4 | PDF generation integration |

### Phase 9: Calendar
| # | Task |
|---|------|
| 9.1 | Schema: extend `appointments` table |
| 9.2 | `/ops/calendar` — day/week/month views |
| 9.3 | Event creation linked to jobs |

### Phase 10: Reports & Analytics
| # | Task |
|---|------|
| 10.1 | `/ops/reports` — tabbed dashboard (overview, sales, leads, financial, operational) |
| 10.2 | Chart components (bar, line, pie, funnel) |
| 10.3 | API: aggregation endpoints |

### Phase 11: Automations
| # | Task |
|---|------|
| 11.1 | Schema: `automations`, `automation_actions`, `automation_logs` tables |
| 11.2 | `/ops/automations` — list page |
| 11.3 | `/ops/automations/[id]` — visual builder |
| 11.4 | Automation engine (trigger evaluation, action execution) |

### Phase 12: Team & Settings
| # | Task |
|---|------|
| 12.1 | `/ops/team` — team management |
| 12.2 | `/ops/settings` — sectioned settings page |
| 12.3 | Role-based access control middleware |

### Phase 13: Blog (Polish Existing)
| # | Task |
|---|------|
| 13.1 | Migrate existing `/ops/blog` into new shell |
| 13.2 | Polish editor to match design spec |

---

## Database Schema Additions Needed

New tables (estimated):
- `jobs` (or rename orders) — core job tracking with pipeline stages
- `tasks` — job-linked tasks with assignee, due date, status
- `customers` — unified customer records (merge leads + orders contacts)
- `estimates` — estimates/proposals with versioning
- `invoices` — invoice records with line items
- `invoice_line_items` — line items for invoices
- `material_orders` — material order records
- `material_order_items` — line items for material orders
- `conversations` — email/SMS conversation threads
- `messages` — individual messages within conversations
- `automations` — automation definitions
- `automation_actions` — steps within automations
- `automation_logs` — execution history
- `team_members` — team/role management (may use Clerk orgs)

Existing tables to extend:
- `appointments` — add event type, job link, team member
- `documents` — add template flag, fillable fields schema
- `payments` — add funding status, method details

---

## Tech Choices

| Need | Choice | Why |
|------|--------|-----|
| Drag & drop (kanban) | `@dnd-kit/core` | Best React DnD lib, accessible, performant |
| Charts | `recharts` or `@tremor/react` | Already common in Next.js ecosystem |
| Calendar | `@schedule-x/react` or build custom | Evaluate — may be simpler to build |
| Rich text (blog) | Keep existing or `tiptap` | Evaluate current editor |
| PDF generation | `@react-pdf/renderer` or server-side | For estimates, invoices, docs |
| Real-time (inbox) | Polling initially, WebSockets later | Keep it simple for v1 |

---

## What NOT To Do

1. **Don't delete existing token files.** Quote flow and portal still use them.
2. **Don't rebuild quote flow.** It works. Ops is a separate surface.
3. **Don't implement dark mode.** Tokens are defined, but build light only for v1.
4. **Don't over-engineer automations.** Start with simple trigger→action, not a visual flow builder.
5. **Don't build material supplier integrations.** Manual entry first, integrations later.
6. **Don't add real-time features.** Polling/refresh for v1, WebSockets in v2.
