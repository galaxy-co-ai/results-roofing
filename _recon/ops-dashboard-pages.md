# Ops Dashboard — Page Definitions

> Every page the rebuilt ops dashboard should have, organized by section.

---

## Navigation Structure

```
/ops
├── /ops/dashboard              ← Home / overview
├── /ops/jobs                   ← Job board (kanban + list)
│   └── /ops/jobs/[id]          ← Single job detail
├── /ops/customers              ← Customer directory
│   └── /ops/customers/[id]     ← Single customer profile
├── /ops/calendar               ← Scheduling & calendar
├── /ops/estimates              ← Estimates & proposals
│   └── /ops/estimates/[id]     ← Single estimate detail
├── /ops/invoices               ← Invoicing
│   └── /ops/invoices/[id]      ← Single invoice detail
├── /ops/payments               ← Payment tracking
├── /ops/materials              ← Material orders
│   └── /ops/materials/[id]     ← Single order detail
├── /ops/inbox                  ← Unified communications
├── /ops/documents              ← Document management
│   └── /ops/documents/[id]     ← Document editor/viewer
├── /ops/reports                ← Reporting & analytics
├── /ops/automations            ← Workflow automations
│   └── /ops/automations/[id]   ← Automation editor
├── /ops/team                   ← Team management
├── /ops/blog                   ← Blog / content management
│   └── /ops/blog/[id]          ← Post editor
└── /ops/settings               ← Ops settings
```

---

## Page Definitions

### 1. `/ops/dashboard` — Command Center

**Purpose:** At-a-glance business health. The first thing you see when you open ops.

**Content:**
- **KPI cards row:** New leads (this week/month), Revenue (closed jobs), Close rate, Avg job value, Speed to lead (avg time from new lead → first contact)
- **Pipeline snapshot:** Mini horizontal bar showing job count + value per stage
- **Recent activity feed:** Latest job updates, proposals sent/signed, payments received, messages — chronological stream
- **Upcoming tasks:** Next 5 overdue or due-today tasks across all jobs
- **Upcoming calendar:** Next 3 scheduled appointments
- **Quick actions:** New job, New estimate, New invoice buttons

**Why it matters:** Roofr has a performance dashboard but it's separate from the job board. Ours combines the two — you land here and immediately know what needs attention.

---

### 2. `/ops/jobs` — Job Board

**Purpose:** The core pipeline view. Every active job lives here.

**Views:**
- **Board view (default):** Kanban columns for each stage, drag-and-drop between stages
- **List view:** Sortable table with all jobs, filterable by status/assignee/date/value

**Default pipeline stages:**
1. New Lead
2. Appointment Scheduled
3. Measurement Complete
4. Proposal Sent
5. Proposal Signed
6. Pre-Production
7. Materials Ordered
8. In Progress
9. Punch List
10. Complete
11. Lost (hidden column, accessible via filter)

**Job cards show:**
- Customer name + address
- Job value (dollar amount)
- Task progress (e.g. "Tasks 4/6")
- Status badges (measurement status, proposal status, payment status)
- Assigned team member avatar(s)
- Last updated timestamp
- Priority indicator (if flagged)

**Toolbar:**
- Search (by address, customer name, or job #)
- Filter by: assignee, stage, date range, value range, source
- Sort by: date created, last updated, value, customer name
- "+ New Job" button

**Beyond Roofr:** Pipeline stage customization in settings, bulk actions (move multiple jobs, reassign), stage-level revenue totals visible on column headers.

---

### 3. `/ops/jobs/[id]` — Job Detail

**Purpose:** Single source of truth for one job. Everything about this job in one place.

**Layout:** Tabbed or sectioned single-page view.

**Sections:**
- **Header:** Customer name, address, job #, stage badge, assigned team, job value, created date
- **Overview tab:**
  - Property details (address, sqft, roof type, pitch, satellite imagery if available)
  - Job timeline / activity log (every status change, message, document, payment — chronological)
  - Internal notes
- **Tasks tab:**
  - Checklist of tasks with assignee, due date, status
  - Add task button
  - Auto-created tasks based on stage (from automations)
- **Estimates & Proposals tab:**
  - All estimates/proposals linked to this job
  - Status (draft, sent, viewed, signed, rejected)
  - Quick-create new estimate button
- **Invoices tab:**
  - All invoices for this job
  - Payment status per invoice
  - Create invoice (can auto-populate from signed proposal)
- **Documents tab:**
  - Contracts, work orders, uploaded files, generated PDFs
  - Upload button, generate from template button
- **Communications tab:**
  - Email and SMS thread for this job's customer
  - Send message inline
- **Payments tab:**
  - Payment history for this job
  - Deposit status, remaining balance
- **Materials tab:**
  - Material orders linked to this job
  - Order status tracking
- **Photos tab:**
  - Job site photos (upload, annotate)
  - Before/during/after categorization

**Sidebar:** Quick info card (customer contact, job value, stage, next task due), action buttons (send proposal, create invoice, send message).

**Beyond Roofr:** Photo management with categorization, job-level P&L summary (revenue vs. materials + labor costs = margin).

---

### 4. `/ops/customers` — Customer Directory

**Purpose:** All customers and leads in one searchable directory.

**Content:**
- Searchable, filterable table of all contacts
- Columns: Name, Email, Phone, Address, Total jobs, Total revenue, Last activity, Source, Status (lead/active/past)
- Click-through to customer profile
- "+ New Customer" button
- Import/export functionality

**Filters:** Status (lead, active customer, past customer), source, date range, has active job.

**Beyond Roofr:** Lifetime value tracking, referral source attribution, customer health score (based on payment history, communication responsiveness).

---

### 5. `/ops/customers/[id]` — Customer Profile

**Purpose:** Full history with a single customer.

**Content:**
- **Header:** Name, contact info, address, customer since date, lifetime value
- **Jobs section:** All jobs for this customer (past and current) with status + value
- **Communication history:** Email/SMS timeline
- **Documents:** All contracts, proposals, invoices associated
- **Payments:** Full payment history across all jobs
- **Notes:** Internal notes about this customer
- **Activity log:** Chronological feed of all interactions

---

### 6. `/ops/calendar` — Scheduling & Calendar

**Purpose:** Team-wide scheduling view for appointments, installations, and follow-ups.

**Content:**
- **Calendar views:** Day, Week, Month
- **Event types:** Appointment, Inspection, Installation, Follow-up, Internal meeting (color-coded)
- **Team filter:** View by team member or all
- **Job linking:** Every event links to its job
- **Quick-create:** Click a timeslot to create event, assign to job + team member
- **Sidebar:** Upcoming events list, unscheduled jobs needing appointments

**Beyond Roofr:** Crew availability view (who's free when), installation day blocks (multi-day jobs), weather integration (flag days with bad forecast).

---

### 7. `/ops/estimates` — Estimates & Proposals

**Purpose:** Manage all estimates and proposals across all jobs.

**Content:**
- Table of all estimates/proposals
- Columns: Estimate #, Customer, Job address, Amount, Status (draft/sent/viewed/signed/rejected/expired), Created date, Sent date, Signed date
- Filters: Status, date range, assigned rep, value range
- Bulk actions: resend, archive
- "+ New Estimate" button

**Status tracking:** Sent → Viewed (with timestamp) → Signed or Rejected.

---

### 8. `/ops/estimates/[id]` — Estimate Detail / Builder

**Purpose:** Create, edit, preview, and send estimates/proposals.

**Content:**
- **Estimate builder:** Line items with description, quantity, unit price, total
- **Good/Better/Best:** Toggle multi-tier pricing presentation
- **Materials auto-fill:** Pull from measurement data if available
- **Branding:** Company logo, colors, custom cover page
- **Discount options:** Percentage or fixed amount
- **Terms & conditions:** Configurable per template
- **Preview:** PDF preview of final document
- **Actions:** Save draft, Send (email/SMS), Download PDF, Convert to invoice
- **Activity log:** Sent, opened, viewed (with timestamps), signed

**Beyond Roofr:** Estimate expiration dates with auto-reminder, comparison view (show customer what changed between revisions).

---

### 9. `/ops/invoices` — Invoicing

**Purpose:** Create, track, and manage all invoices.

**Content:**
- Table of all invoices
- Columns: Invoice #, Customer, Job, Amount, Status (draft/sent/viewed/paid/overdue/partial), Due date, Payment method
- Summary cards at top: Total outstanding, Overdue amount, Paid this month, Avg days to pay
- Filters: Status, date range, customer, overdue only
- "+ New Invoice" button

---

### 10. `/ops/invoices/[id]` — Invoice Detail / Builder

**Purpose:** Create, edit, and manage a single invoice.

**Content:**
- **Invoice builder:** Line items (auto-populated from signed proposal or manual entry)
- **Deposit / partial payment:** Split invoice into deposit + final or milestone payments
- **Branding:** Consistent with estimate templates
- **Payment terms:** Net 15/30/60, custom due date
- **Payment link:** Auto-generated link customer can pay from
- **Actions:** Save draft, Send (email/SMS), Download PDF, Record manual payment, Mark as paid
- **Payment history:** All payments applied to this invoice with dates + methods
- **Reminder automation:** Overdue reminders (configurable frequency)

---

### 11. `/ops/payments` — Payment Tracking

**Purpose:** Central view of all money movement.

**Content:**
- Table of all payments received
- Columns: Date, Customer, Invoice #, Amount, Method (card/ACH/check/cash), Payment status (approved/pending/failed/refunded), Funding status (funded/not funded)
- Summary cards: Total received (this month), Outstanding, Overdue, Avg transaction
- Filters: Date range, method, status, customer
- Search by invoice #, customer name
- Export to CSV

**Beyond Roofr:** Cash flow forecast (expected payments based on outstanding invoices + due dates), payment method breakdown chart.

---

### 12. `/ops/materials` — Material Orders

**Purpose:** Create and track material orders to suppliers.

**Content:**
- Table of all material orders
- Columns: Order #, Job address, Supplier, Items, Total cost, Status (draft/sent/confirmed/delivered/cancelled), Order date, Delivery date
- "+ New Order" button
- Filters: Status, supplier, date range

---

### 13. `/ops/materials/[id]` — Material Order Detail

**Purpose:** Create, edit, and send a material order.

**Content:**
- **Header:** Order #, status badge, job link
- **Supplier selection:** Supplier name + branch location
- **Materials table:** Item name, unit of measure, customization, qty, unit cost, total
- **Add item** from catalog or manual entry
- **Estimated total**
- **Notes to supplier** (delivery instructions, special requests)
- **Order details:** Job location, delivery address
- **Actions:** Save draft, Preview, Send to supplier, Download PDF
- **Status timeline:** Draft → Sent → Confirmed → Shipped → Delivered

**Beyond Roofr:** Material cost tracking feeds into job costing automatically, reorder from previous order template.

---

### 14. `/ops/inbox` — Unified Communications

**Purpose:** Single inbox for all customer email and SMS, linked to jobs.

**Content:**
- **Conversation list (left panel):** All threads, sorted by most recent, with unread badges
- **Message view (right panel):** Full conversation thread (email + SMS interleaved)
- **Compose:** Send email or SMS, attach documents/proposals/invoices
- **Job linking:** Every conversation auto-linked to its job (or manually linkable)
- **Templates:** Quick-insert message templates with personalization tokens
- **Filters:** Unread, by job, by team member, by channel (email/SMS)
- **Team assignment:** Assign conversations to team members

**Beyond Roofr:** Internal notes within conversation (visible to team only, not sent to customer), canned response library with categories, AI-suggested replies.

---

### 15. `/ops/documents` — Document Management

**Purpose:** Central hub for all document templates and generated documents.

**Content:**
- **Templates tab:** Reusable document templates (contracts, agreements, work orders, checklists)
- **All documents tab:** Every generated document across all jobs
- Columns: Name, Type, Job, Customer, Status (draft/sent/signed/expired), Created date
- Search + filters
- "+ New Template" and "+ New Document" buttons

---

### 16. `/ops/documents/[id]` — Document Editor / Viewer

**Purpose:** Build, edit, and manage a single document.

**Content:**
- **Template builder:** Upload PDF or build from scratch
- **Fillable fields:** Drag-and-drop fields onto document (Signature, Initials, Text, Checkbox, Date)
- **Field assignment:** Customer vs. Contractor fields (tabbed)
- **Dynamic fields:** Auto-fill from job data (customer name, address, job value, etc.)
- **Preview:** Final document preview
- **Actions:** Save template, Send for signature, Download, Track status
- **Signature tracking:** Sent → Viewed → Signed (with timestamps)

**Beyond Roofr:** Version history, conditional sections (show/hide based on job type), bulk send to multiple signers.

---

### 17. `/ops/reports` — Reporting & Analytics

**Purpose:** Business intelligence and performance tracking.

**Content:**
- **Overview dashboard:**
  - Revenue chart (monthly trend)
  - Jobs won vs. lost (bar chart)
  - Lead conversion funnel (new → qualified → proposal → signed → complete)
  - Avg job value trend
  - Revenue by source

- **Sales performance:**
  - Rep leaderboard (jobs won, revenue, close rate)
  - Speed to lead by rep
  - Proposal conversion rate by rep
  - Lost job reasons breakdown (pie/bar chart)

- **Lead analytics:**
  - Leads by source (referral, website, ad, door knock, etc.)
  - Conversion rate by source
  - Cost per lead by source (if ad spend tracked)
  - Lead volume trend

- **Financial:**
  - Revenue vs. expenses (if job costing active)
  - Avg margin per job
  - Outstanding receivables aging
  - Monthly cash flow

- **Operational:**
  - Avg days per stage (where are jobs getting stuck?)
  - Task completion rates
  - Avg project duration (start to complete)

**Date range selector** on all views. **Export to CSV/PDF.**

**Beyond Roofr:** Custom date comparisons (this month vs. last month), goal tracking (set monthly targets, show progress), job costing profitability report.

---

### 18. `/ops/automations` — Workflow Automations

**Purpose:** Set up trigger-based automations to reduce manual work.

**Content:**
- List of all automations with name, trigger, action(s), status (active/paused), last triggered date
- "+ New Automation" button
- Toggle active/paused per automation

---

### 19. `/ops/automations/[id]` — Automation Editor

**Purpose:** Build and configure a single automation.

**Content:**
- **Trigger selection:**
  - Job enters stage [X]
  - Proposal status changes to [sent/viewed/signed/rejected]
  - Invoice becomes overdue
  - Payment received
  - Calendar event approaching (X hours before)
  - New lead created
  - Task overdue

- **Action(s):**
  - Send email (select template + recipient)
  - Send SMS (select template + recipient)
  - Create task (assign to team member, set due date)
  - Change job stage
  - Send notification to team member
  - Wait [X] hours/days (delay step)

- **Conditions:** Optional filters (only if job value > $X, only for jobs assigned to [person], etc.)
- **Visual builder:** Step-by-step flow visualization (trigger → condition → action → delay → action)
- **Test run:** Dry-run an automation against a sample job
- **Activity log:** History of every time this automation fired

---

### 20. `/ops/team` — Team Management

**Purpose:** Manage team members, roles, and permissions.

**Content:**
- Team member list: Name, email, role, active jobs count, last active
- **Roles:** Admin (full access), Manager (all jobs, can't change settings), Member (assigned jobs only)
- **Invite:** Send invite to new team member
- **Performance:** Quick stats per member (jobs won, revenue, tasks completed)
- **Permissions matrix:** What each role can see/do

**Beyond Roofr:** Commission tracking (set % per rep, auto-calculate from closed jobs), workload balancing (who has capacity).

---

### 21. `/ops/blog` — Blog / Content Management

**Purpose:** Manage blog posts for the public-facing website. SEO content engine.

**Content:**
- Post list: Title, status (draft/published/scheduled), author, publish date, views
- "+ New Post" button
- Filters: Status, author, date range
- Categories/tags management

*Already partially built — keep and polish.*

---

### 22. `/ops/blog/[id]` — Post Editor

**Purpose:** Write and publish blog posts.

**Content:**
- Rich text editor (markdown or WYSIWYG)
- Title, slug, excerpt, featured image
- Category and tag assignment
- SEO fields (meta title, meta description)
- Publish / Schedule / Save draft actions
- Preview

---

### 23. `/ops/settings` — Ops Settings

**Purpose:** Configure the ops dashboard behavior.

**Sections:**
- **Company profile:** Logo, name, address, phone, email, license #, branding colors
- **Pipeline stages:** Add, rename, reorder, delete stages
- **Templates:** Default email/SMS templates, document templates
- **Integrations:** API keys and connection status for external services (Stripe, Resend, SignalWire, Google Solar, suppliers, etc.)
- **Notifications:** Configure which events trigger notifications and to whom
- **Payment settings:** Stripe configuration, payment methods enabled, processing fee handling
- **Team:** Manage roles and permissions (links to /ops/team)
- **Data:** Export all data, import contacts

---

## Page Count Summary

| Section | Pages | Routes |
|---------|-------|--------|
| Dashboard | 1 | 1 |
| Jobs | 2 | 2 (list + detail) |
| Customers | 2 | 2 (list + detail) |
| Calendar | 1 | 1 |
| Estimates | 2 | 2 (list + detail/builder) |
| Invoices | 2 | 2 (list + detail/builder) |
| Payments | 1 | 1 |
| Materials | 2 | 2 (list + detail) |
| Inbox | 1 | 1 |
| Documents | 2 | 2 (list + detail/editor) |
| Reports | 1 | 1 (tabbed internally) |
| Automations | 2 | 2 (list + editor) |
| Team | 1 | 1 |
| Blog | 2 | 2 (list + editor) |
| Settings | 1 | 1 (sectioned internally) |
| **Total** | **23** | **23** |

---

## What We Have Beyond Roofr

1. **Satellite measurement** already integrated (Google Solar)
2. **Job-level P&L** (revenue vs. material + labor = margin)
3. **Photo management** with before/during/after categorization
4. **Cash flow forecasting** from outstanding invoices
5. **Commission tracking** per sales rep
6. **Custom date comparisons** in reports
7. **AI-suggested replies** in inbox
8. **Automation test runs** (dry-run against sample data)
9. **Document version history**
10. **Blog/content engine** for SEO (Roofr charges $199/mo for this)
11. **Weather integration** on calendar (flag bad forecast days)
12. **Customer health scores** based on payment + communication patterns
