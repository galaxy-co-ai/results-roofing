# Ops Dashboard Wireframes

> 4 unique layout archetypes. All other pages derive from these.
> Reference `ops-design-spec.md` for exact tokens, colors, spacing.

---

## 1. Ops Shell (Global Layout)

The skeleton every page lives inside. Sidebar + header + content area.

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixed)    │  PAGE HEADER (64px)                      │
│ ┌───────────────────┐    │  ┌─────────────────────────────────────┐ │
│ │ [Logo] Results     │    │  │  Page Title (Sora 700)    [+ New] [⚙]│
│ │        Roofing     │    │  │  Breadcrumb (12px caption)          │ │
│ └───────────────────┘    │  └─────────────────────────────────────┘ │
│                          │                                          │
│ MANAGE (11px overline)   │  CONTENT AREA (fluid, max 1440px)       │
│ ┌───────────────────┐    │  ┌─────────────────────────────────────┐ │
│ │ 🏠 Dashboard      │    │  │                                     │ │
│ │ 📋 Jobs           │    │  │  padding: 24px                      │ │
│ │ 👥 Customers      │    │  │  bg: --ops-bg-page (#F7F9FC)        │ │
│ │ 📅 Calendar       │    │  │                                     │ │
│ └───────────────────┘    │  │  [ Page-specific content here ]     │ │
│                          │  │                                     │ │
│ SALES (11px overline)    │  │                                     │ │
│ ┌───────────────────┐    │  │                                     │ │
│ │ 📝 Estimates      │    │  │                                     │ │
│ │ 📄 Invoices       │    │  │                                     │ │
│ │ 💰 Payments       │    │  │                                     │ │
│ │ 📦 Materials      │    │  │                                     │ │
│ └───────────────────┘    │  │                                     │ │
│                          │  │                                     │ │
│ COMMUNICATE              │  │                                     │ │
│ ┌───────────────────┐    │  │                                     │ │
│ │ 📬 Inbox       (3)│    │  │                                     │ │
│ │ 📁 Documents      │    │  │                                     │ │
│ └───────────────────┘    │  │                                     │ │
│                          │  │                                     │ │
│ AUTOMATE                 │  │                                     │ │
│ ┌───────────────────┐    │  │                                     │ │
│ │ ⚡ Automations     │    │  │                                     │ │
│ │ 📊 Reports        │    │  │                                     │ │
│ └───────────────────┘    │  │                                     │ │
│                          │  │                                     │ │
│ ─────────────────────    │  │                                     │ │
│ ADMIN                    │  │                                     │ │
│ ┌───────────────────┐    │  │                                     │ │
│ │ 👤 Team           │    │  │                                     │ │
│ │ 📰 Blog           │    │  │                                     │ │
│ │ ⚙️ Settings        │    │  └─────────────────────────────────────┘ │
│ └───────────────────┘    │                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Sidebar Specs
- Width: 240px expanded, 64px collapsed (icons only), hidden on mobile (drawer)
- Background: --ops-bg-sidebar (#FFFFFF)
- Border-right: 1px solid --ops-border-subtle (#E4E8EF)
- Logo area: 48px height, 16px top padding
- Nav groups: labeled with 11px/600 uppercase overline, --ops-text-tertiary
- Nav group spacing: 24px between groups
- Nav items: 36px height, 8px radius, 6px 12px padding, 14px/500 Inter
- Nav item spacing: 2px between items in same group
- Active: bg --ops-bg-active (#EBF2FF), text --ops-accent (#1E6CFF)
- Hover: bg --ops-bg-hover (#EEF1F6)
- Icons: 18px Lucide, 10px gap to label
- Unread badge: red dot or count badge, right-aligned
- Collapse trigger: bottom of sidebar or header hamburger on mobile
- Transition: width 300ms ease-in-out

### Page Header Specs
- Height: 64px
- Padding: 0 24px
- Border-bottom: 1px solid --ops-border-subtle
- Background: --ops-bg-surface (#FFFFFF)
- Title: h1 token (Sora 700, clamp)
- Breadcrumb: 12px caption, --ops-text-tertiary, below title or inline
- Action buttons: right-aligned, primary + secondary
- Sticky: yes (z-index 10)

### Responsive Behavior
- >= 1024px: sidebar expanded (240px), persistent
- 768-1023px: sidebar collapsed (64px), hover-expand with overlay
- < 768px: sidebar hidden, hamburger in header, slides as drawer over content

---

## 2. Command Center Dashboard (/ops/dashboard)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Dashboard                          [+ New Job ▾] │
│            │                                                    │
│            │  ┌─── KPI CARDS ROW (4-col grid, 16px gap) ─────┐ │
│            │  │┌──────────┐┌──────────┐┌──────────┐┌────────┐│ │
│            │  ││NEW LEADS ││ REVENUE  ││CLOSE RATE││AVG JOB ││ │
│            │  ││ (overline)││(overline)││(overline)││(overln) ││ │
│            │  ││   23     ││ $184,200 ││  34.2%   ││ $12,850││ │
│            │  ││(metric)  ││ (metric) ││ (metric) ││(metric) ││ │
│            │  ││ ↑ 12%    ││ ↑ 8%     ││ ↓ 2.1%  ││ ↑ 4%   ││ │
│            │  ││vs last mo││vs last mo││vs last mo││vs last ││ │
│            │  │└──────────┘└──────────┘└──────────┘└────────┘│ │
│            │  └──────────────────────────────────────────────┘ │
│            │                                                    │
│            │  ┌─── PIPELINE SNAPSHOT (full width card) ───────┐ │
│            │  │ New(17) → Appt(4) → Measured(6) → Sent(8) →  │ │
│            │  │ Signed(3) → PreProd(2) → InProg(1) → Done(12)│ │
│            │  │ [horizontal stacked bar, proportional widths] │ │
│            │  │ Total pipeline value: $482,300                │ │
│            │  └──────────────────────────────────────────────┘ │
│            │                                                    │
│            │  ┌─── 2-COL LAYOUT (16px gap) ───────────────────┐│
│            │  │                                                ││
│            │  │ LEFT COL (60%)         RIGHT COL (40%)        ││
│            │  │ ┌─────────────────┐   ┌──────────────────┐   ││
│            │  │ │ RECENT ACTIVITY │   │ UPCOMING TASKS   │   ││
│            │  │ │ (card)          │   │ (card)           │   ││
│            │  │ │                 │   │                  │   ││
│            │  │ │ • Job #1042     │   │ ☐ Call Sarah re  │   ││
│            │  │ │   moved to      │   │   estimate       │   ││
│            │  │ │   "Proposal     │   │   Due: Today     │   ││
│            │  │ │   Sent"         │   │                  │   ││
│            │  │ │   2 min ago     │   │ ☐ Order materials│   ││
│            │  │ │                 │   │   for 123 Main   │   ││
│            │  │ │ • Payment       │   │   Due: Tomorrow  │   ││
│            │  │ │   $12,500       │   │                  │   ││
│            │  │ │   received from │   │ ☐ Schedule crew  │   ││
│            │  │ │   John D.      │   │   for 456 Oak    │   ││
│            │  │ │   15 min ago    │   │   Due: Wed       │   ││
│            │  │ │                 │   │                  │   ││
│            │  │ │ • Proposal      │   │ [View all tasks] │   ││
│            │  │ │   signed by     │   └──────────────────┘   ││
│            │  │ │   Maria L.     │                           ││
│            │  │ │   1 hour ago    │   ┌──────────────────┐   ││
│            │  │ │                 │   │ UPCOMING APPTS   │   ││
│            │  │ │ [View all]      │   │ (card)           │   ││
│            │  │ └─────────────────┘   │                  │   ││
│            │  │                       │ 📅 Inspection    │   ││
│            │  │                       │   123 Main St    │   ││
│            │  │                       │   Today 2:00 PM  │   ││
│            │  │                       │                  │   ││
│            │  │                       │ 📅 Install       │   ││
│            │  │                       │   789 Elm Ave    │   ││
│            │  │                       │   Tomorrow 8 AM  │   ││
│            │  │                       │                  │   ││
│            │  │                       │ [View calendar]  │   ││
│            │  │                       └──────────────────┘   ││
│            │  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Specs
- KPI cards: 4-col grid, 16px gap, equal width
  - Card: 20px padding, 12px radius, shadow-sm, white bg
  - Label: 11px/600 uppercase overline, --ops-text-tertiary
  - Value: 28px/700 Sora (--ops-text-metric), tabular-nums
  - Trend: 13px/500, green (#10B981) for up, red (#EF4444) for down, arrow icon + percentage
  - Comparison: 12px/400, --ops-text-tertiary ("vs last month")
- Pipeline snapshot: full-width card
  - Horizontal stacked bar, each stage proportional to job count
  - Stage colors match kanban column colors from design spec
  - Labels below bar: stage name + count
  - Total value right-aligned
- 2-col layout: 60/40 split below pipeline
  - Recent activity: chronological feed, icon + description + timestamp
    - Activity types: stage change, payment, proposal, message, task
    - Max 8 items visible, "View all" link at bottom
  - Upcoming tasks: checklist style
    - Task name, linked job, due date
    - Overdue items highlighted with --ops-status-warning
    - Max 5 items, "View all tasks" link
  - Upcoming appointments: next 3 calendar events
    - Event type icon, address, date/time
    - "View calendar" link

### Responsive
- < 1024px: KPI cards become 2x2 grid
- < 768px: KPI cards stack to single column, 2-col becomes single column (tasks first, then activity)

---

## 3. Kanban Job Board (/ops/jobs)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Jobs                                    [+ New Job]   │
│            │  [Board View] [List View]  [Settings]                  │
│            │                                                         │
│            │  ┌─ TOOLBAR ──────────────────────────────────────────┐ │
│            │  │ [🔍 Search addresses or customers...]              │ │
│            │  │ [Assignee ▾] [Stage ▾] [Date ▾] [Value ▾] [View ▾]│ │
│            │  └────────────────────────────────────────────────────┘ │
│            │                                                         │
│            │  ┌─ KANBAN BOARD (horizontal scroll) ─────────────────┐│
│            │  │                                                     ││
│            │  │ NEW LEAD (17)     APPT SCHED (4)   PROPOSAL SENT   ││
│            │  │ $0               $68,000          (8) $96,000       ││
│            │  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│            │  │ │▎2187 Herndon│ │▎1 Carriage  │ │▎2726 Askew  │   ││
│            │  │ │▎Ave, Clovis,│ │▎Dr, Kansas  │ │▎Ave, Kansas │   ││
│            │  │ │▎CA          │ │▎City, MO    │ │▎City, MO    │   ││
│            │  │ │             │ │    $19,000   │ │    $6,000   │   ││
│            │  │ │ Tasks 0/0   │ │ Tasks 2/3 ⚡│ │ Tasks 4/6 ⚡│   ││
│            │  │ │┌───────────┐│ │┌───────────┐│ │┌───────────┐│   ││
│            │  │ ││✅ Measured ││ ││✅ Measured ││ ││✅ Measured ││   ││
│            │  │ ││📄 Draft   ││ ││📄 Draft   ││ ││📨 Sent    ││   ││
│            │  │ │└───────────┘│ │└───────────┘│ │└───────────┘│   ││
│            │  │ │• New  · -- │ │• New · 3h ago│ │• New · 6h   │   ││
│            │  │ │  No updates│ │         [JS] │ │        [TC] │   ││
│            │  │ └─────────────┘ └─────────────┘ └─────────────┘   ││
│            │  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│            │  │ │▎214 N 3rd   │ │▎13790 Marine│ │▎9 Sugar Bowl│   ││
│            │  │ │▎St, River   │ │▎Dr, White   │ │▎Ln, Gulf    │   ││
│            │  │ │▎Falls, WI   │ │▎Rock, BC    │ │▎Breeze, FL  │   ││
│            │  │ │             │ │    $17,000   │ │    $27,000  │   ││
│            │  │ │ Tasks 2/2   │ │ Tasks 2/3 ⚡│ │ Tasks 6/6   │   ││
│            │  │ │┌───────────┐│ │┌───────────┐│ │┌───────────┐│   ││
│            │  │ ││🔄 In Prog ││ ││✅ Measured ││ ││✅ Measured ││   ││
│            │  │ ││   No Props ││ ││📄 Draft   ││ ││❌ Rejected ││   ││
│            │  │ │└───────────┘│ │└───────────┘│ │└───────────┘│   ││
│            │  │ │• New · 4h   │ │• 2d · 3h ago│ │• 5d · 3d    │   ││
│            │  │ │        [AB] │ │        [JS] │ │        [TC] │   ││
│            │  │ └─────────────┘ └─────────────┘ └─────────────┘   ││
│            │  │                                                     ││
│            │  │ [... more columns scroll right →]                  ││
│            │  └─────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### Kanban Specs

**Board container:**
- Horizontal scroll, columns don't wrap
- Scroll area starts below toolbar
- Padding: 0 24px 24px 24px (no top, toolbar handles it)

**Columns:**
- Width: 280px min, 320px max
- Gap between columns: 16px
- Header: 40px height
  - Stage name: 13px/600 uppercase, --ops-text-secondary
  - Count: neutral badge next to name
  - Revenue: 13px/500 tabular-nums, --ops-text-tertiary, right-aligned
- Card area: vertical scroll within column
- Card gap: 8px
- Drop zone: 2px dashed --ops-accent border, --ops-accent-subtle bg when dragging over

**Job cards (reference the Roofr CRM screenshot):**
- Width: fill column
- Padding: 12px
- Radius: 8px
- Border: 1px solid --ops-border-subtle
- Left border: 3px solid [stage-color] (see design spec status system)
- Shadow: --ops-shadow-xs at rest
- Hover: --ops-shadow-sm
- Drag: opacity 0.85, --ops-shadow-md, scale(1.02)
- Card content top-to-bottom:
  1. Address: 14px/500, --ops-text-primary (2 lines max, truncate)
  2. Value: 14px/600 tabular-nums, right-aligned on same line as address
  3. Task progress: "Tasks 4/6" 12px/400, lightning bolt icon if automations active
  4. Status badges row: measurement status + proposal status (11px badges)
  5. Footer: source label + "· time ago" 12px --ops-text-tertiary + assignee avatar (24px circle) right-aligned

**Toolbar:**
- Background: --ops-bg-surface
- Padding: 16px 24px
- Border-bottom: 1px solid --ops-border-subtle
- Sticky below page header (z-index 10)
- View toggle: Board View / List View as tab-style buttons
- Search: full-width input, 36px height
- Filters: secondary button dropdowns, inline row below search

**List view (alternate):**
- Standard table archetype (see Table Archetype below)
- Columns: Job #, Address, Customer, Value, Stage, Assigned, Tasks, Last Updated, Actions
- Row click opens job detail

### Responsive
- < 1024px: columns 260px, fewer visible
- < 768px: switch to list view by default, kanban accessible but cramped

---

## 4. Unified Inbox (/ops/inbox)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Inbox                                                 │
│            │                                                         │
│            │  ┌─ SPLIT PANE LAYOUT ────────────────────────────────┐ │
│            │  │                                                     │ │
│            │  │ CONVERSATION LIST (320px)  │  MESSAGE VIEW (fluid)  │ │
│            │  │ ┌─────────────────────┐   │ ┌────────────────────┐ │ │
│            │  │ │[🔍 Search...]       │   │ │ THREAD HEADER      │ │ │
│            │  │ │[All ▾] [Unread ▾]   │   │ │ John Davis         │ │ │
│            │  │ │                     │   │ │ 2187 Herndon Ave   │ │ │
│            │  │ │ ┌─────────────────┐ │   │ │ Job #1042 [→]     │ │ │
│            │  │ │ │ ● John Davis    │ │   │ │ ┌──────┐┌───────┐ │ │ │
│            │  │ │ │   Re: Your roof │ │   │ │ │ Email││  SMS  │ │ │ │
│            │  │ │ │   estimate...   │ │   │ │ └──────┘└───────┘ │ │ │
│            │  │ │ │   📧 2m ago     │ │   │ ├────────────────────┤ │ │
│            │  │ │ │   Job #1042     │ │   │ │                    │ │ │
│            │  │ │ └─────────────────┘ │   │ │ MESSAGE THREAD     │ │ │
│            │  │ │ ┌─────────────────┐ │   │ │                    │ │ │
│            │  │ │ │   Sarah Miller  │ │   │ │ ┌── FROM THEM ───┐ │ │ │
│            │  │ │ │   Thanks for    │ │   │ │ │ Hi, I got the  │ │ │ │
│            │  │ │ │   the quick...  │ │   │ │ │ estimate. Can  │ │ │ │
│            │  │ │ │   📱 15m ago    │ │   │ │ │ we discuss the │ │ │ │
│            │  │ │ │   Job #1038     │ │   │ │ │ Better package?│ │ │ │
│            │  │ │ └─────────────────┘ │   │ │ │ 10:23 AM  📧   │ │ │ │
│            │  │ │ ┌─────────────────┐ │   │ │ └────────────────┘ │ │ │
│            │  │ │ │   Mike Torres   │ │   │ │                    │ │ │
│            │  │ │ │   When can the  │ │   │ │ ┌── FROM US ─────┐ │ │ │
│            │  │ │ │   crew start?   │ │   │ │ │ Absolutely! The│ │ │ │
│            │  │ │ │   📱 1h ago     │ │   │ │ │ Better package │ │ │ │
│            │  │ │ │   Job #1035     │ │   │ │ │ includes...    │ │ │ │
│            │  │ │ └─────────────────┘ │   │ │ │ 10:45 AM  📧   │ │ │ │
│            │  │ │                     │   │ │ └────────────────┘ │ │ │
│            │  │ │ [... more convos]   │   │ │                    │ │ │
│            │  │ │                     │   │ │ ┌── FROM THEM ───┐ │ │ │
│            │  │ │                     │   │ │ │ Sounds good,   │ │ │ │
│            │  │ │                     │   │ │ │ let's go with  │ │ │ │
│            │  │ │                     │   │ │ │ it. When do I  │ │ │ │
│            │  │ │                     │   │ │ │ sign?           │ │ │ │
│            │  │ │                     │   │ │ │ 11:02 AM  📱   │ │ │ │
│            │  │ │                     │   │ │ └────────────────┘ │ │ │
│            │  │ │                     │   │ │                    │ │ │
│            │  │ │                     │   │ ├────────────────────┤ │ │
│            │  │ │                     │   │ │ COMPOSE            │ │ │
│            │  │ │                     │   │ │ [📧 Email ▾]      │ │ │
│            │  │ │                     │   │ │ ┌────────────────┐ │ │ │
│            │  │ │                     │   │ │ │ Type a message │ │ │ │
│            │  │ │                     │   │ │ │                │ │ │ │
│            │  │ │                     │   │ │ └────────────────┘ │ │ │
│            │  │ │                     │   │ │ [📎][📋 Template]  │ │ │
│            │  │ │                     │   │ │            [Send ▸]│ │ │
│            │  │ └─────────────────────┘   │ └────────────────────┘ │ │
│            │  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Inbox Specs

**Split pane:**
- Conversation list: 320px fixed width
- Message view: fluid, fills remaining space
- Divider: 1px solid --ops-border-subtle
- Resizable: optional (nice-to-have), drag handle on divider

**Conversation list:**
- Background: --ops-bg-surface
- Search: 36px input, full width, 12px padding from edges
- Filters: secondary buttons below search (All, Unread, by channel, by assignee)
- Conversation items:
  - Height: auto (min ~72px)
  - Padding: 12px
  - Border-bottom: 1px solid --ops-border-subtle
  - Hover: --ops-bg-hover
  - Selected: --ops-bg-active, left border 3px --ops-accent
  - Unread: blue dot (8px, --ops-accent) top-left, name in 500 weight
  - Name: 14px/500
  - Preview: 13px/400, --ops-text-secondary, 1 line truncated
  - Channel icon: 📧 email or 📱 SMS, 12px
  - Timestamp: 12px/400, --ops-text-tertiary, right-aligned
  - Job link: 12px, --ops-text-tertiary, below preview

**Message view:**
- Thread header:
  - Customer name: 18px/600 Inter
  - Address: 14px/400, --ops-text-secondary
  - Job link: badge with job #, clickable (opens job detail)
  - Channel tabs: Email / SMS toggle
- Message bubbles:
  - From them: left-aligned, --ops-bg-inset bg, 12px radius
  - From us: right-aligned, --ops-accent-subtle bg, 12px radius
  - Padding: 12px 16px
  - Max width: 70% of message view
  - Timestamp: 11px, --ops-text-tertiary, below bubble
  - Channel indicator: small icon next to timestamp (📧 or 📱)
- Compose area:
  - Sticky bottom
  - Border-top: 1px solid --ops-border-subtle
  - Padding: 16px
  - Channel selector: dropdown (Email / SMS)
  - Text input: multi-line, auto-grow, min 80px height
  - Actions row: attach file, insert template, send button (primary, right-aligned)

### Responsive
- < 1024px: conversation list becomes full-width, message view is a drill-in (back button to return)
- < 768px: same drill-in pattern, full screen message view

---

## 5. Table Archetype (used by 9 pages)

This is NOT a separate page — it's the template for: Customers, Estimates, Invoices, Payments, Materials, Documents, Automations, Team, Blog.

```
┌──────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  [Page Title]                         [+ New ____] │
│            │                                                     │
│            │  ┌─ SUMMARY CARDS (optional, contextual) ────────┐ │
│            │  │ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────┐│ │
│            │  │ │Total    │ │Outstanding│ │Overdue  │ │Avg   ││ │
│            │  │ │$284,200 │ │$48,500   │ │$12,300  │ │$14.2k││ │
│            │  │ └─────────┘ └──────────┘ └─────────┘ └──────┘│ │
│            │  └──────────────────────────────────────────────┘  │
│            │                                                     │
│            │  ┌─ TOOLBAR ──────────────────────────────────────┐ │
│            │  │ [🔍 Search by name, #, etc...]                 │ │
│            │  │ [Status ▾] [Date ▾] [Assignee ▾]  [Export CSV] │ │
│            │  └────────────────────────────────────────────────┘ │
│            │                                                     │
│            │  ┌─ TABLE ───────────────────────────────────────┐  │
│            │  │ ┌──────────────────────────────────────────┐  │  │
│            │  │ │ COL1 ↕  COL2 ↕  COL3 ↕  STATUS  ACTIONS│  │  │
│            │  │ ├──────────────────────────────────────────┤  │  │
│            │  │ │ data    data    data   [badge]    [•••]  │  │  │
│            │  │ ├──────────────────────────────────────────┤  │  │
│            │  │ │ data    data    data   [badge]    [•••]  │  │  │
│            │  │ ├──────────────────────────────────────────┤  │  │
│            │  │ │ data    data    data   [badge]    [•••]  │  │  │
│            │  │ ├──────────────────────────────────────────┤  │  │
│            │  │ │ data    data    data   [badge]    [•••]  │  │  │
│            │  │ └──────────────────────────────────────────┘  │  │
│            │  │                                               │  │
│            │  │ ┌─ PAGINATION ──────────────────────────────┐ │  │
│            │  │ │ Showing 1-20 of 156     [← 1 2 3 ... 8 →]│ │  │
│            │  │ └──────────────────────────────────────────┘ │  │
│            │  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Table Archetype Specs
- Summary cards: ONLY on pages that benefit (Invoices: outstanding/overdue, Payments: totals, Reports: KPIs). Not on every table page.
- Toolbar: sticky below page header, search + filter buttons inline
- Table:
  - Header: 40px height, --ops-bg-inset, 12px/600 uppercase, --ops-text-tertiary, 0.04em tracking
  - Rows: 48px default, 40px compact mode
  - Row border: 1px solid --ops-border-subtle bottom
  - Row hover: --ops-bg-hover
  - Row click: navigates to detail page (cursor: pointer)
  - Cell padding: 12px 16px
  - Numeric columns: right-aligned, tabular-nums
  - Status column: badge component (from design spec)
  - Actions column: "•••" icon button → dropdown (View, Edit, Delete, etc.)
  - Sortable columns: ↕ icon next to header text, active sort shows ↑ or ↓
- Pagination: 48px height, right-aligned, "Showing X-Y of Z" left, page buttons right
- Empty state: centered, 160px from top, illustration + heading + description + CTA button

### Per-page column definitions:

**Customers:** Name, Email, Phone, Jobs, Lifetime Value, Last Activity, Source, Status
**Estimates:** # , Customer, Address, Amount, Status, Created, Sent, Signed
**Invoices:** # , Customer, Job, Amount, Status, Due Date, Method, Funding
**Payments:** Date, Customer, Invoice #, Amount, Method, Payment Status, Funding Status
**Materials:** Order #, Job, Supplier, Total, Status, Ordered, Delivery
**Documents:** Name, Type, Job, Customer, Status, Created
**Automations:** Name, Trigger, Action(s), Status (active/paused), Last Triggered
**Team:** Name, Email, Role, Active Jobs, Last Active
**Blog:** Title, Status, Author, Published, Views

---

## Navigation Grouping (Final)

```
MANAGE
  Dashboard     /ops/dashboard     Home icon
  Jobs          /ops/jobs           ClipboardList icon
  Customers     /ops/customers      Users icon
  Calendar      /ops/calendar       Calendar icon

SALES
  Estimates     /ops/estimates      FileText icon
  Invoices      /ops/invoices       Receipt icon
  Payments      /ops/payments       DollarSign icon
  Materials     /ops/materials      Package icon

COMMUNICATE
  Inbox         /ops/inbox          Mail icon (with unread badge)
  Documents     /ops/documents      FolderOpen icon

AUTOMATE
  Automations   /ops/automations    Zap icon
  Reports       /ops/reports        BarChart3 icon

ADMIN
  Team          /ops/team           UserCog icon
  Blog          /ops/blog           Newspaper icon
  Settings      /ops/settings       Settings icon
```
