# JobNimbus Platform Audit

**Date:** February 25, 2026
**Account:** CB Media (logged in as "CM")
**Actual Client:** Results Roofing LLC (multi-location roofing company)
**Plan Tier:** CRM — **Established** | Engage — **Enterprise**
**Monthly Billing:** $17,588.00 + sales tax

---

## Navigation Structure

### Top Navigation Bar
- **[RR Logo]** — Clicks to Dashboard (default.aspx)
- **Hamburger Menu** — Expands full sidebar
- **Boards** — Direct link to most recent board
- **Calendar** — Full calendar view
- **Insights** — Analytics dashboard
- **Engage** — SMS/messaging inbox
- **Payments** — Payment disbursements
- **Marketing** — Marketing tools hub
- **[+]** — Quick-create (Add Job, Add Task, Add Board)
- **Search** — Global search (Ctrl+K) — filters: Jobs, Contacts, Documents, Estimates, Material Orders, Work Orders, Invoices
- **Activity Feed icon** — Right-panel slide-out of recent activity
- **Bell icon** — Notifications panel (Unread / All tabs)
- **CM avatar** — Account dropdown: Profile, Password, Settings, Disable Job Sidebar toggle, Logout

### Hamburger Sidebar Items
- Jobs
- Calendar (pinnable)
- Insights
- Classic Reports
- Engage
- Payments
- Marketing
- Boards
  - **Sales - All Markets** (11,265 items) — active Kanban board
  - **Company Documents** — company-wide file library

---

## Feature Inventory

---

### 1. Dashboard (Home)

**Location:** `app.jobnimbus.com/default.aspx`
**Purpose:** Personalized home screen with task list and quick-access report widgets.

**Capabilities:**
- View and manage "My Tasks" with Incomplete/Complete filter toggle and "+ Add task"
- Customize dashboard via "Customize Dashboard" — select any saved Classic Report to display as a widget; drag-and-drop to reorder
- "Jobs" widget shows tabular list of recent jobs with Name, Type, Status, Primary Contact, Assigned To; "+ Add job" button
- Pagination controls for each widget (items per page configurable)
- Dashboard reflects real-time data from underlying reports

**UI Elements:** Task checklist table, jobs list table, multiple report widgets (configurable), pagination controls.

**Available Dashboard Widgets:** My Tasks, Jobs, Contacts, + any of ~30+ saved Classic Reports including: Contacts To Verify with GHL, GHL Contacts (Active/Inactive/Verified), Retro Updates, Supplement Board Report, All Company Lead Sources, Commercial GC Done, Invoices to sync to QB, Payments to sync to QB, 2025/2026 Lead Source Reports, Adjuster Contact List, Aged Jobs, Aged Jobs Reports (Commercial/Residential), Contact Zip-Code Reports, Contracts This Month, Fully Signed Estimates (Last Month / Last 2 Years), Incompleted Send COC Tasks, Jobs History, Jobs in Reinspection Request, May 2023 Storm, My Jobs, My Payments, Old Jobs, Results Roofing AR Aging (and Team variant), Signed Contracts - Last 90 Days (and CB variant), Suppliers, YTD Lost HTX, Estimates, Invoices, Payments, Credit Memos.

**Integrations Referenced:** None on this page directly.
**Limitations/Gaps:** Dashboard cannot show charts/graphs — only tabular reports and a task list. No drag-and-drop calendar or summary KPIs on the home screen.

---

### 2. Contacts (List)

**Location:** `app.jobnimbus.com/contactlist`
**Purpose:** Master database of all contacts (customers, adjusters, suppliers, subcontractors, realtors, etc.).

**Capabilities:**
- View all 14,354+ contacts in tabular list
- Columns: Display Name, Type, Status, Sales Rep, Address Info (customizable via "Customize" button)
- Filter by Type, Status, Sales Rep, Assignee, Location (dropdowns in board view)
- "+ Add contact" button
- "+ Import contacts" button (CSV import)
- "Export to CSV" and "Export to Excel" via "..." menu
- Click-through to individual Contact Detail page
- Toggle between Boards view and List view

**Contact Detail Page Sub-Sections:**
- **Header:** Profile photo, Name, Contact ID (e.g. #DFW-33092), breadcrumb
- **Left panel:** Contact information (First/Last Name, Email, Phone, Address), Workflow section (Type, Status, Days in Status, Assigned To, Texting Opt Out badge, Synced with QuickBooks, Is Archived, Created By), Tags, Related Contacts
- **Tab: Activity** — Filterable log (by type: User Created, etc.), Related toggle, + Send text message, + Send email, + Add note; displays all interaction history
- **Tab: Jobs** — Table of related jobs (Name, Type, Status, Sales Rep, Primary Contact, Assigned To); "+ Add job"
- **Tab: Documents** — Upload, Download All; filter dropdown; search; Related toggle
- **Tab: Photos** — Sort (Date Created), filter, search, Related toggle, Download All
- **Tab: Financials** — Estimates table (Estimate #, Date, Internal Note, QB Sync, Signature Status, Total, Status); Budgets; Material Orders; Invoices; Credit Memos; Payments

**Contact Types (from workflows):** Customer, Supplier, Subcontractor, Adjuster, Realtor

**UI Elements:** Sortable/filterable table, detail panel with field groups, tabbed sections, import/export buttons.

**Integrations:** QuickBooks (sync status shown per contact), CompanyCam (linked), @mentions in notes.

**Limitations/Gaps:** No bulk messaging from contact list directly. No visible map view of contacts. Bulk operations limited to import/export.

---

### 3. Boards

**Location:** `app.jobnimbus.com/boards/[board-id]`
**Purpose:** Kanban-style visual pipeline management for tracking Contacts or Jobs through workflow stages.

**Capabilities:**
- Full Kanban board with drag-and-drop cards across columns
- Toggle between Contacts view and Jobs view (top-right "Contacts" button)
- Each column = one workflow status stage; shows count of cards
- Dollar total can be displayed per column (with permission)
- "Hide" cards in a column (Cards in this column are hidden. Show cards toggle)
- Filter board by: Location, Type, Sales Rep, Assignee, Subcontractor
- Board settings ("..." -> Edit Board, Delete Board):
  - Name and color customization
  - Type (Contacts or Jobs)
  - Available to (team access control)
  - Filter(s) on the board — "+ Add Filter"
  - **Card Title Template** (uses merge tags: `{{name}}`, etc.)
  - **Card Body Template** (3 rows with merge tags: address fields, custom fields like `{{cf_date_4|date}}`, booleans, currency — supports full field templating)
  - Columns: Name, Status, Sort, Totals; drag to reorder; "+ Add Column"
  - Note: "Column Totals will only display if the user has permission to see that information"
- "+ Add workflow" (creates new pipeline stages)
- Boards accessible from hamburger menu sidebar

**Default Stages in "Sales - All Markets" Board (Jobs view):**
Lead -> Booked Appt -> Inspection -> Claim Filed -> Adjuster Scheduled -> Adjuster Approved -> Reinspection Request -> Reinspect Sent -> Contract Review -> Pending Realtor Estimate -> Contract Sent -> Signed Contract -> Pre-Supp Requested -> Pre Supp Sent -> Need to Schedule Build -> Build Scheduled -> Waiting on Trades -> Job/Trades Complete -> Completion Docs Sent -> Need to Collect -> Paid & Closed -> Thank You/Reviews -> No Damage -> Reinspect Denied -> Lost -> Archive

**UI Elements:** Kanban with drag-and-drop, column headers with counts/totals, card templates with merge-tag customization, filter bar, view toggle.

**Integrations:** None directly; board data pulls from contacts/jobs.

**Limitations/Gaps:** No list view within Boards (only Kanban). Board cannot currently show custom date fields as swimlanes. No time-in-stage analytics within boards themselves.

---

### 4. Jobs (Contacts)

**Location:** `app.jobnimbus.com/job/[id]`
**Purpose:** Individual project/job record containing all work, financial, and communication data for a single job.

**Left Sidebar Sub-Pages:**
1. **Dashboard** — Overview: Contact info, Tasks (View All), Financial Summary (View Profit Tracker); right panel: photo, address (map/copy/edit), Overview/Custom Fields tab, Description, Details (Status, Type, Lead Source, Assigned, Location, Start/End dates, Sales Rep, Subcontractors, QuickBooks sync status, CompanyCam ID), Tags, Related Contacts
2. **Activity** — Full activity feed with + Create Note, Email, Task, Message buttons; filter and search
3. **Fields** — Custom field editor organized in grouped sections (insurance-specific fields documented below)
4. **Tasks** — Task list with sort, filter, search; time tracking
5. **Photos** — Photo gallery with upload, download, filter, sort
6. **Documents** — Document library with upload, download, filter, search, Related toggle
7. **Estimates** — Estimates list; Settings gear; Measurements button; table: Estimate #, Date, Signature Status, Status, Internal Notes, Total
8. **Material & Work Orders** — Two tables: Material Orders (# / Delivery Date / Status / Internal Note / Total Cost / Supplier) and Work Orders (# / Date / Status / Internal Note / Total Cost / Type / Supplier); Measurements button
9. **Payments & Invoices** — Four tables: Invoices (#/Date/Status/Note/Paid/Due/Total), Payments (#/Date/Updated/Status/Method/Created By/Total), Credit Memos (#/Date/Updated/Related/Status/Total), Budgets
10. **Profit Tracker** — Dedicated job costing page: KPIs (Actual Profit Margin, Planned Revenue, Planned Cost, Actual Revenue, Actual Cost); Tabs: Cost, Commissions; Group By dropdown; Add Section; onboarding guide
11. **Forms** — Submitted form responses (Response #, Date, Title, Description, Submitted By); Settings gear
12. **Custom Documents** — Custom Doc #, Date, Signature Status, Status, Type, Template Name, Created By

**Job Detail - Custom Fields (Fields section) examples:**
Waiting on More Info (dropdown), Pause Automations (dropdown), Insurance Carrier (text), Claim # (text), Date of Loss (date), Build Date (date), Trades (dropdown Yes/No), Trades Completed (date), Roof Only (dropdown), Reinspection Sent Date, Reinspection Approved Date, Reinspect Denied (date), PRE-SUPP Sent (date), PRE-SUPP Approved Amount (currency), PRE-SUPP Approved Date, PRE-SUPP Denied Date, Post Supp Denied Date, POST-SUPP/COC Sent (date), POST-SUPP Approved Amount (currency), POST-SUPP Approved Date, COC Only - RD Released (dropdown), GAF Warranty Number (text), Retro Update, WebFX Close Date Reference

**Stage Progress Bar:** Lead -> Estimating -> Sold -> In Production -> Accounts Receivable -> Completed (visual pipeline stage indicator at top of every job)

**UI Elements:** Multi-tab sidebar nav, stage progress bar, rich detail panels, financial tables, map integration, photo gallery, form responses.

**Integrations:** QuickBooks (sync per job), CompanyCam (job linked by ID), @mentions in notes, Google Maps (address view).

---

### 5. Calendar

**Location:** `app.jobnimbus.com/calendar2`
**Purpose:** Scheduling, task visualization, and geographic dispatch planning.

**Capabilities:**
- Views: Day, Week, Month, Agenda
- Previous/Next navigation + date range header
- Create tasks/events from calendar (click on date/time slot)
- Color-code by Location toggle
- "Show Completed Tasks" toggle
- Map view (pin icon) — plots all scheduled jobs/tasks on interactive Google Map (geographic overview of the DFW area and other markets)
- Export/sync icon (calendar export)
- Refresh button

**Left Sidebar Filters:**
- **Team Members** filter — Search, multi-select checkboxes for each team member
- **Subcontractors** filter — Search, multi-select (Angel Sanchez, Cedar Peak Fencing, DFW Siding and Patio, etc.)
- **Calendars** — Toggleable item types:
  - **Tasks:** Task, Inspection Appt, Need Revised Scope, Phone Call, Get Photos Adjuster Needs, Money Released, Customer Service Issue, Insurance Follow-up, HO Follow-up, Exterior, Need to Collect, Gutters Scheduled, Windows Scheduled, Fence Scheduled, Missing Invoice, Send Final Invoice
  - **Contacts:** Customer, Supplier, Subcontractor, Adjuster, Realtor
  - **Work Orders:** (by type and market: Siding CTX/HTX/ATL, Gutter DFW/CTX/HTX, Garage CTX/HTX/ATL, Exterior-DFW/CTX/HTX, and others)
  - **(Select All)** checkbox
- **Quick Navigation** — Mini-calendar for rapid date jumping

**UI Elements:** Multi-view calendar grid, left sidebar filter panel, Google Maps integration, mini-calendar.

**Integrations:** Google Maps (map view); no native Google Calendar or Outlook sync was visible but export icon present.

**Limitations/Gaps:** No visible two-way Google Calendar or Outlook sync. No resource/crew scheduling view. Calendar events appear limited to tasks and work orders (not standalone event types).

---

### 6. Insights

**Location:** `app.jobnimbus.com/insights`
**Purpose:** Real-time sales and operational analytics dashboard.

**Capabilities:**
- Toggle between Jobs view and Contacts view
- Global filters: Sales Rep, Lead Source, Job Type dropdowns
- Right-side Filters panel with: Global Filters, Sales Data filter (Lead Source values: AI Lead, Best Storm Leads, Call Center, Company Lead, Door Knock, Existing Client Referral, Facebook/IG Ad, Facebook/IG Post, GAF Lead, Google Ad, Website Lead, etc.)
- Per-widget: filter icon, expand icon, "..." menu

**Default KPI Cards (4 time periods each: Last Week / This Month / This Quarter / This Year):**
- Leads count
- Sold dollar value
- Close Rate %
- Estimating Conversion %

**Chart Widgets:**
- Top 5 Lead Sources This Year (horizontal bar chart with dollar values)
- Top 5 Sales Reps This Year (horizontal bar chart with dollar values)
- Lead Flow - This Year vs. Last Year (multi-line chart: 2024/2025/2026 overlaid by month)
- Historical Sales - This Year vs. Last Year (multi-line chart with dollar values)
- (Additional charts load via lazy loading below)

**"Classic Reports" Button** — navigates to full reporting page (see Classic Reports section)

**UI Elements:** KPI metric cards, horizontal bar charts, multi-year line charts, filter dropdowns, right-side filter panel.

**Limitations/Gaps:** Limited to Jobs or Contacts view (no cross-entity dashboards). Cannot create custom chart types (charts appear fixed). No drill-down from chart segments.

---

### 7. Classic Reports

**Location:** `app.jobnimbus.com/classicreports`
**Purpose:** Tabular grid-based reports for all entity types; saveable and dashboardable.

**Capabilities:**
- **Team Activity Report** — pre-built team activity report
- **My Saved Reports** — list of all custom saved reports with search
- **Create Report** — creates new reports; available types:
  1. Task Report
  2. Job Report
  3. Contact Report
  4. Activity Report
  5. Estimate Report
  6. Material Order Report
  7. Work Order Report
  8. Budget Report
  9. Commission Report
  10. Invoice Report
  11. Credit Memo Report
  12. Payment Report
  13. Document Report
  14. Time Log Report
- Each report can be saved and added to the dashboard
- Reports can be exported (to CSV/Excel from the contacts list view)
- "..." per report: Edit, Duplicate, Delete

**Saved Reports in Account (examples):**
Contacts To Verify with GHL, GHL Contacts (Active/Inactive/Verified), Retro Updates, Supplement Board Report, All Company Lead Sources, Commercial GC Done, Invoices to sync to QB, Payments to sync to QB, 2025 Lead Source Report, 2026 Lead Source Report (CB), Adjuster Contact List, Aged Jobs, Aged Jobs Reports, Contact Zip-Code Reports, Contracts This Month, Fully Signed Estimates, Incompleted COC Tasks, Jobs History, Jobs in Reinspection, May 2023 Storm, My Jobs, My Payments, Old Jobs, AR Aging reports, Signed Contracts reports, YTD Lost HTX, and more.

**UI Elements:** Report list with type labels, Create Report dropdown with 14 types, Team Activity link.

---

### 8. Engage (Communications)

**Location:** `app.jobnimbus.com/engage/messenger/`
**Purpose:** Two-way SMS/text messaging platform with team inbox, contact list, and usage management.

**Sub-Sections:**

**Conversations Inbox:**
- Tabs: Assigned to me | Unassigned | Others | Archive
- "+" new conversation button, filter icon
- Three-column layout: conversation list, message thread, contact details
- "New Conversation" shortcut

**Contact List:**
- 21,562 contacts displayed with Display Name + Mobile Phone
- "Send Message" action per contact
- Search bar

**Scheduled Messages:**
- View of all scheduled outbound messages (currently none)

**Settings > Phone Numbers:**
- "My Phone Numbers" — manage multiple Engage numbers
- Table: Mobile Number, Line Name, Location Default, User Default Number, Subscribed
- Active lines: CTX Main (215-344-4859), DFW Main (682-204-6224), Claims (682-254-3444), ATL Main (770-284-3835), HTX Main (832-225-4866), MSC Main (843-396-1119), WNC Main (910-600-0828), CSTX Main (979-269-8283), RNC Main (984-206-3852)
- "+ New Number" button, "Transfer Number" button
- **Automated Text Sending**: TCPA-compliant operating hours (8:00 AM - 6:00 PM); day-of-week toggles (per account: Sun off, Mon off, Tue on, Wed on, Thu on, Fri off, Sat off)

**Settings > Forwarding:**
- (Page not audited in detail; forwards inbound calls/messages)

**Settings > Transactions:**
- Monthly SMS billing ledger
- Debits: Incoming MMS, Default Phone Numbers, Outgoing MMS, Incoming SMS, Outgoing SMS (Feb 2026: 743 outgoing SMS)
- Credits: Monthly SMS Credits, Default Phone Numbers
- "Export [Month] Summary" button
- Month selector dropdown

**Settings > Credits:**
- (SMS credit balance/purchase page)

**UI Elements:** 3-panel inbox layout, contact list table, scheduled messages list, phone number management table, TCPA compliance settings, billing ledger.

**Integrations:** None external; native SMS platform built-in.

**Limitations/Gaps:** No email campaigns or drip sequences visible in Engage (only SMS). No bulk SMS broadcast feature visible. No templates library within Engage itself (templates are in Settings > Templates). No visible email inbox (email is separate via jobnimbusmail.com forwarding).

---

### 9. Payments

**Location:** `app.jobnimbus.com/beta/payments-reconciliation/disbursements`
**Purpose:** View and reconcile payment disbursements processed through JobNimbus Payments.

**Capabilities:**
- Date range filter (Last 30 days, custom)
- Daily payout reconciliation table: Payout Date, Amount (Gross), Merchant Fees (red negative), Customer Fees, Amount (Net), Status
- Expandable rows (">" chevron) to see transaction details within a payout
- Status badge: "Processed" (green)
- Pagination: 1-10 of 18 disbursements in last 30 days (averaging ~$60K-$150K/day gross)
- "Reporting Dashboard" button (links to payment analytics)

**Payment Settings** (`app.jobnimbus.com/settings/jn-payments/configure`):
- "Accepting Payments" master toggle
- Per-location configuration (DFW, WNC, ATL, ATX, HTX, CSTX, RNC — with green verified status)
- Per location: EIN, address, "Edit Fee Handling" (pass fees to customer or absorb)
- **Available payment methods per location:** Credit/Debit Cards (OFF for this account), ACH/E-Check (ON)
- "Reporting Dashboard" button

**Payment Methods Supported:** ACH/E-Check (active); Credit/Debit Cards (configured but disabled for this account)

**UI Elements:** Disbursement table with expand rows, date filter, per-location payment configuration with toggles.

**Integrations:** QuickBooks (synced flag per payment), JobNimbus Payments (native payment processor built-in).

**Limitations/Gaps:** Credit card payments are disabled for this account. No Stripe/Square/PayPal alternative mentioned. Payment links generated through invoices, not via a standalone link generator.

---

### 10. Marketing

**Location:** `app.jobnimbus.com/marketing`
**Purpose:** Marketing tools hub — "Your complete marketing automation suite."

**Available Tools:**

**AssistAI (Active — AI-powered phone answering):**
- Location: `app.jobnimbus.com/marketing/answering-service`
- Left sidebar: Dashboard, Contacts, Logs, Settings (General, Members, Security), Agents section (Default Agent, All)
- **Dashboard KPIs:** Minutes Saved, Calls Answered, Appointments Booked, Appointment Book Rate — all with 30-day trend sparklines
- **Latest Logs:** Real-time inbound call log with AI-generated summaries per call
- Calls answered by AI agent with contextual summaries (e.g., "Ron Deskins called to return a callback to Cassandra regarding claim 7009...")
- **Settings:** Organization Name (Results Roofing LLC), Avatar, Members, Security
- Live: 54 minutes saved, 33 calls answered in last 30 days

**ROI Reporting (In Development):**
- "Analytics and reporting tools to track your marketing performance and return on investment."
- "Request early access" button

**Website Management (Coming Soon):**
- "Website management solution and hosting."
- "Vote for this feature" button

**UI Elements:** Card-grid for tool selection; AssistAI has its own full sub-application with sidebar navigation.

**Integrations:** AI call answering service (API key labeled "Ai Answering service" created 4/15/2025).

**Limitations/Gaps:** Only one tool is live (AssistAI). ROI Reporting and Website Management are not yet available. No social media management, review management, or email marketing tools present.

---

### 11. Settings (Full Audit)

**Location:** `app.jobnimbus.com/customeradmin/Settings.aspx`

#### GENERAL

**General:**
- International Support toggle
- Primary Country, Culture, Time Zone
- Display Name Template (FirstName LastName, etc.)
- Auto-resize images (Optimized Resolution 1024x768)
- Manual Job number assignment toggle
- ID counters for: Jobs, Contacts, Tasks, Estimates, Budgets, Documents, Work Orders, Material Orders, Invoices, Credit Memos
- Number templates with merge tags: `{{locationcode}}-{{jobid}}`, `{{locationcode}}-{{contactid}}`, `{{taskid}}`, `{{locationcode}}-{{estimateid}}`, etc.

**Attachment Categories:** Category management for document attachments.

**Company (Multi-Location Management):**
- Company Name field
- "+ Add location" button
- Table: Logo, Company Information, Status (Active/Disabled)
- Locations: DFW (Carrollton TX, 214-301-5533), HTX (Houston TX, 346-685-2451), CTX (San Antonio TX, 210-305-8465), Results Claims Management (Carrollton TX — Disabled), ATX (Austin TX, 512-643-6128), WTX (Amarillo TX — Disabled), ATL (Atlanta GA, 770-999-0565), WNC (Wilmington NC), RNC, MSC, CSTX, ANM

**Email:**
- JobNimbus Email address ([prefix]@jobnimbusmail.com)
- Email Forward Address (configured to Microsoft 365)
- Notification rule: who gets notified when multi-job contact receives email (All Contact Assignees, etc.)
- "Show incoming email attachments in Documents or Photos tabs" checkbox

**Features (Feature Toggles):**

*Native JobNimbus Features:*
| Feature | Status | Description |
|---|---|---|
| Budget | ON | Job costing, margin analysis, commission tracking |
| Job Scheduling | ON | Start/finish dates on calendar & boards |
| Material Order | ON | Purchase orders to suppliers |
| Time Tracking | ON | Hours/minutes on tasks |
| Work Order | ON | Track trades and work items |
| Groups | ON | Manager-based sales team grouping |
| Company Documents | ON | Company-wide document library |
| Template Questions | ON | Questions in document templates |
| Advanced Workflows | ON | Protect statuses from certain roles |
| Contact Scheduling | ON | Start/finish dates for contacts |
| Location Based Products | OFF | Per-location product/price list |
| Work Order Scheduling | ON | Work orders on calendar |
| Proposals Beta | OFF | Create proposals from estimates |
| Fence Measurements | OFF | Map-based fence measurement tool (mobile) |

*3rd Party Features:*
| Integration | Status | Description |
|---|---|---|
| naturalForms | OFF | Digitize paper forms |
| QuickBooks | ON | Accounting sync |
| EagleView | ON | Aerial measurements for estimates |
| CompanyCam | ON | Real-time job photo capture |
| HOVER | OFF | 3D model from smartphone photos |
| Beacon Roofing Supply | OFF | Material ordering from Beacon |
| Xactimate | OFF | Import claims from Xactanalysis |

**Lead Source:** Manage available lead source values (AI Lead, Best Storm Leads, Call Center, Company Lead, Door Knock, Existing Client Referral, Facebook/IG Ad, Facebook/IG Post, GAF Lead, Google Ad, Google Search, Website Lead, etc.)

**Note Type:** Custom note categories.

**Products & Services:** Product/service catalog for use in estimates (can be location-specific if Location Based Products feature enabled).

**Task Type:** Manage task type values.

#### USER MANAGEMENT & SUBSCRIPTION

**Access Profiles (Roles):**
| Role | Description | Members |
|---|---|---|
| Sales | Tools for selling; includes Field access; no Settings/Subscription access | 100+ sales reps |
| Manager | Mid-level management | ~14 users |
| Admin | Full access including Settings & Subscription | ~60 users |
| Operations | (Defined but empty) | 0 |
| The "U" | Large field operations group | ~50+ users |
| Senior Sales | Senior performers | Anthony Collins, Hlinc Homer, Javonn Branch, Joshua Kim, Patrick Thomas |
| Sales II | (Smaller group) | Ricky Ballard, Shannon Blair, Stephen Aguilar |

**Groups:** Group sales teams under managers; manager controls visibility of their team's contacts/jobs/tasks/calendars.

**Subscription:**
- **CRM Plan: Established** — "For scaling companies with multiple locations who need deep customization and integrations." — 269 total users
- **Engage Plan: Enterprise** — "Ideal for companies with over 10 employees" — 0 phone lines (numbers managed separately)
- **Seat pricing:** Sales $55/seat (202/242 filled), Admin $55/seat discounted from $75 (58/60 filled), Field $30/seat (0/0), Subcontractor $20/seat (9/9 filled)
- **Billing:** $17,588.00 + sales tax/month, next payment March 23, 2026
- "Manage Subscription" button, "Cancel subscription" link

**Team:** List of all team members and their profile settings.

#### WORKFLOWS & FIELDS

**Contact Fields:** Custom fields for Contact records. Field types available: Date, Decimal, Number, Text, Boolean (Yes/No), Options List. Drag to reorder. Hide/Edit/Delete. Current: Gate Code (Text), Referral Name (Text), Salesrabbit ID (Text).

**Contact Workflows:** Pipeline stages for Contacts (similar to Job Workflows).

**Job Fields:** Custom fields for Job records (rich set of insurance/roofing fields pre-configured — see Job detail above for the full list).

**Job Workflows (Pipelines):**
| Name | Visibility | Access |
|---|---|---|
| Residential Insurance | Visible | Assignees |
| Residential Retail | Visible | Everyone |
| Commercial GC Insurance | Visible | Assignees |
| Commercial GC Retail | Visible | Assignees |
| Repair Jobs | Visible | Everyone |
| Commercial GC | Hidden | Assignees |
| HTX Market | Hidden | Assignees |
| DFW Market | Hidden | Assignees |
| CTX Market | Hidden | Assignees |

Each workflow defines the ordered list of statuses. "+ Add workflow" and drag-to-reorder supported.

**Work Order Fields:** Custom fields for Work Order records.

**Work Order Workflows:** Pipeline stages for Work Orders.

#### ESTIMATING

**Estimate Settings** (`app.jobnimbus.com/estimates/settings/`):

Sub-pages with own left sidebar:
- **Estimate Layouts** — Create reusable layouts; "Explore sample estimate layouts" with manufacturer logos (Owens Corning, GAF, CertainTeed, TAMKO, James Hardie); per-location layouts; drag to reorder; "+ Estimate Layout"; table: Name, Default toggle, Edit/Copy/Delete
  - Current DFW layouts: Retail Realtor, Retail, Insurance Coastal Code, Repair, Retail Class 4 Impact Resistant Shingle, Inspection Layout, Retail - Coastal Code
- **Templates** — Estimate item/line templates (expandable dropdown)
- **Estimate Designs** — Visual design/branding of estimate PDFs
- **Sales PDFs** — Sales presentation PDF configuration
- **Measurement Tokens** — Integration with aerial measurement services (EagleView, HOVER)
- **Profit Settings** — Default profit margin targets
- **Financing** — Direct Integration: **Sunlight Financial** ("Get Started With Sunlight Financial"); Custom Financing Library builder
- **Email Settings** — Default email behavior when sending estimates
- **Page Settings** — Page layout settings for estimate PDFs
- **Notifications** — Notification preferences for estimate activity

#### FINANCIALS

**Budgets:** Budget template settings.

**Capital:** (Job costing capital settings.)

**Commissions:** Commission calculation and tracking setup; linked to Profit Tracker.

**Payments:** Navigates to JobNimbus Payments configuration (see Payments section above).

**QuickBooks:**
- Error status banner with "Show Sync Errors" button
- Last Sync Time: 2/25/2026 1:26 PM | "Sync Now" button
- Sync Type: 2-way sync / Import from QB into JN / Export from JN into QB (currently: Export)
- Record Types to sync (each with "View Field Map" link): Contacts (Customers), Jobs, Estimates, Invoices, Credit Memos, Invoice Payments, Products/Services, Taxes
- Note: "Syncing estimates from QuickBooks to JobNimbus is not supported"
- Backup confirmation checkbox
- "Disable QuickBooks Integration" link

**Taxes:** Tax rate configuration for invoices/estimates.

#### AUTOMATIONS

**Automations:**
- Full list of all automations with: Name, Active checkbox, Conditions, Actions
- "+ Add Automation" button; per-automation: Edit, Duplicate, Delete

**Trigger Types:**
1. **Event based** — When a [Entity] is [Event]
   - Entities: Contact, Job, Task, Work Order, Material Order, Estimate, Invoice, Payment, Attachment
   - Events: Created, Modified, (others per entity)
2. **Time based** — [Number] [Minutes/Hours/Days/Weeks] [Before/After] [Date Field]
   - Optional: "On the next [day of week]" and "At [time]" constraints
   - Trigger record: Contact, Job, etc.

**Conditions:** "If [field] is equal to [value]" with AND/OR logic (Require all / Require any); "+ Add condition"

**Actions:**
1. Create Task
2. Send Text Message
3. Send Email
4. Change Status (Parent Contact)
5. Change Status
6. Webhook

**Example Automations Running:**
- Time-based: Create collection tasks at 15/30/45/60 days after "Need to Collect" status change
- Event-based: Create "Needs Build Day" task when Job is Modified + Status = Need to Schedule Build + Type = Residential Insurance + Location = [specific market] (separate automation per market)

#### SUPPLIERS

**Suppliers:** Supplier contact database for material ordering; referenced in Material Orders and Work Orders.

#### FORMS & TEMPLATES

**Forms:** Form builder for field surveys/inspection forms; responses viewable per job (see Job > Forms). Settings gear for form management.

**Smart Estimate Templates:** AI-assisted or smart templates for estimates.

**Template Questions:** Add questions to document templates (used for conditional logic in custom documents).

**Templates:** Document template library with "Add template" dropdown:
- **Template Types:** Invoice, Credit Memo, Estimate, Document, Email, Work Order, Material Order
- **Current Email Templates include:** (Insurance) / (Retail) Next Steps and Expectations in Claims Process, Appraisal vs. Public Adjuster, Build Day Expectations, COC only, COC/Post, Confirm Lead (English + Spanish), Email asking for revised estimate, FEMA, Insurance Follow-up, Payment Submitted, Personal Property Request, Post Sup sent by portal, Post-Supp Approval / Money Released, and many more.

#### INTEGRATIONS

**API:**
- Public REST API for programmatic access
- "New API key" button
- All keys have: Key value, Description, Access Profile (e.g., Admin), Created date
- Active API integrations seen in account:
  - CompanyCam (multiple keys, 2019-2026)
  - Zapier (multiple keys, 2020-2025)
  - Simplii (2021)
  - AI Answering Service (2025)
  - GHL — GoHighLevel (2025)
  - Bulk Edit tool (2025)
  - Make (formerly Integromat) (2025)
  - IntegrationsFX (2025)
  - Consolidata (2025)
  - Hail Recon (2026)
  - Sales Rabbit (multiple keys, 2026)
  - Company Cam (additional key, 2026)
  - Retail Site API (2026)

**CompanyCam:** Photo documentation integration settings (credentials, sync configuration).

**EagleView:** Aerial measurement integration settings (credentials, project types).

---

## Integrations Catalog

### Native / Built-In
1. **JobNimbus Payments** — In-app ACH/E-Check and credit card processing (native payment processor with per-location merchant accounts)
2. **JobNimbus Engage** — Native SMS/two-way texting platform with dedicated phone numbers
3. **AssistAI** — Native AI phone answering service (JobNimbus-built, in Marketing hub)
4. **Google Maps** — Embedded map in calendar view and job address display

### 3rd Party — Available via Settings
5. **QuickBooks Online** — Bidirectional accounting sync (Contacts, Jobs, Estimates, Invoices, Credit Memos, Payments, Products, Taxes)
6. **EagleView** — Aerial measurement -> estimate line items (roof measurements, material quantities)
7. **CompanyCam** — Real-time job photography; photos sync to job record; linked by CompanyCam project ID
8. **HOVER** — 3D home model from smartphone photos; estimate generation (configurable, OFF for this account)
9. **Beacon Roofing Supply** — Direct material ordering from Beacon within JobNimbus (configurable, OFF)
10. **Xactimate** — Insurance claim estimate import via Xactanalysis (configurable, OFF)
11. **naturalForms** — Paper form digitization (configurable, OFF)
12. **Sunlight Financial** — Consumer financing integration on estimates

### 3rd Party — Via API Keys (Active in This Account)
13. **Zapier** — Multi-step workflow automation (3+ keys active)
14. **GoHighLevel (GHL)** — CRM/marketing automation integration
15. **Make (Integromat)** — Visual workflow automation
16. **IntegrationsFX** — Integration middleware
17. **Consolidata** — Data aggregation/reporting tool
18. **SalesRabbit** — Door-to-door sales canvassing app (Salesrabbit ID is a Contact custom field)
19. **Hail Recon** — Hail storm lead generation/tracking
20. **Simplii** — (Third-party integration tool)
21. **Microsoft 365** — Email forwarding (claims@NETORGFT5757205.onmicrosoft.com)

---

## Automation Capabilities

### Trigger Types
| Type | Description |
|---|---|
| Event Based | Fires when a record entity event occurs (Created, Modified) |
| Time Based | Fires at a calculated time relative to a date field on a record |

### Trigger Entities (Event-Based)
Contact, Job, Task, Work Order, Material Order, Estimate, Invoice, Payment, Attachment

### Trigger Timing (Time-Based)
- Number + unit: Minutes, Hours, Days, Weeks
- Direction: Before or After
- Reference date field: Date Created, Date Status Change (and likely other date fields)
- Optional day-of-week constraint ("On the next Sunday")
- Optional specific time ("At 12:00 AM")

### Conditions
- Field-value comparisons ("If Status is equal to X")
- Multi-condition logic: AND (Require all) or OR (Require any)
- Supported condition fields: Status, Type, Location, and likely any custom field

### Actions
1. **Create Task** — Creates a new task with configurable type, name, assignee, due date
2. **Send Text Message** — Sends an Engage SMS message (from a configured phone number)
3. **Send Email** — Sends a template email
4. **Change Status** — Updates the status of the triggering record
5. **Change Status (Parent Contact)** — Updates the parent contact's status when triggered by a job/task
6. **Webhook** — Sends an HTTP POST to an external URL (enables any external integration)

### Real-World Examples Configured
- Create collection reminder tasks at 15/30/45/60 days after entering "Need to Collect" status
- Create "Needs Build Day" task when job is modified to "Need to Schedule Build" status, filtered by job type (Residential Insurance) and specific market location (9 separate automations, one per market)

---

## Pricing/Plan Features

### Plan: Established (CRM) + Enterprise (Engage)

**Established CRM** is described as: "For scaling companies with multiple locations who need deep customization and integrations." This implies it includes:
- Multi-location management
- Deep custom field configuration
- Full workflow customization
- All native features (budgets, time tracking, work orders, etc.)
- Advanced access profiles and groups
- API access
- Unlimited automations
- Full Insights + Classic Reports

**Enterprise Engage** includes:
- Multiple dedicated business phone numbers (9 active)
- TCPA-compliant automated SMS scheduling
- High SMS volume capacity (743+ outgoing SMS/month observed)

**Seat Pricing:**
- Sales role: $55/user/month (202 of 242 filled = ~$11,110/mo for Sales alone)
- Admin role: $55/user/month (discounted from $75; 58/60 filled)
- Field role: $30/user/month (0 filled)
- Subcontractor role: $20/user/month (9 filled)
- Total: 269 users, $17,588/month + tax
