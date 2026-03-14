# Results Roofing Ops Dashboard Audit

Date: February 25, 2026
URL: https://app.resultsroofing.com/ops
Auth method: Already authenticated — no login gate encountered. Session was active on the initial tab.

---

## Navigation Structure

The sidebar is organized into 5 category groups with 13 primary nav items, plus 2 footer links. Quick Action links on the Dashboard reveal 4 additional hidden routes not in the sidebar.

**MANAGE**
- Dashboard (`/ops`)
- Jobs (`/ops/jobs`)
- Customers (`/ops/customers`)
- Calendar (`/ops/calendar`)

**SALES**
- Estimates (`/ops/estimates`)
- Invoices (`/ops/invoices`)
- Payments (`/ops/payments`)
- Materials (`/ops/materials`)

**COMMUNICATE**
- Inbox (`/ops/inbox`)
- Documents (`/ops/documents`)

**AUTOMATE**
- Automations (`/ops/automations`)
- Reports (`/ops/reports`)

**ADMIN**
- Team (`/ops/team`)
- Blog (`/ops/blog`)
- Settings (`/ops/settings`)

**Footer Links**
- Back to Site (`/`)
- Exit Ops (button)

**Hidden Routes (accessible via Quick Actions / direct URL only)**
- CRM Contacts (`/ops/crm/contacts`)
- CRM Pipeline (`/ops/crm/pipeline`)
- SMS Center (`/ops/messaging/sms`)
- Business Analytics (`/ops/analytics`)

---

## Feature Inventory

### Dashboard (Home)

Location: `/ops`
Purpose: Central operations overview with KPIs and quick navigation.

Capabilities:
- View 4 KPI stat cards: Total Contacts (8,445), Conversations (8,409), Pipeline Value ($0), Open Deals (0)
- View Lead & Job Activity line chart (monthly leads and completed jobs, Sep–Feb)
- View Sales Pipeline horizontal bar chart (deals by stage: New Request, Contacted, Scheduled, Closed)
- Access Quick Actions: Manage Contacts, SMS Center, Sales Pipeline, Analytics
- Toggle between 3 tabs: Overview, Analytics, Reports (all currently render identical content — placeholder behavior)

UI Elements: 4 stat cards, 1 line chart, 1 horizontal bar chart, 4 quick-action link cards, 3-tab toggle

Integrations: Data sourced from GoHighLevel (contacts/conversations count suggests GHL sync)

Status: Partially functional — stat cards show live data, but the Analytics and Reports tabs within Dashboard are not differentiated from Overview.

Limitations/Gaps: The three Dashboard tabs (Overview, Analytics, Reports) all show the same content. No date range selector on the dashboard. Quick Actions link to hidden routes not accessible from sidebar navigation.

---

### Jobs

Location: `/ops/jobs`
Purpose: Job tracking via Kanban board.

Capabilities:
- View jobs across 4 pipeline stages in Kanban columns: New Request, Contacted, Scheduled, Closed
- Search jobs with text search bar
- Toggle Board view (button exists but only one view available)
- Create new job via "+ New Job" modal (fields: Job Name/Address*, Estimated Value)
- Refresh data

UI Elements: Search bar, Board toggle button, 4-column Kanban board with color-coded stage indicators, Refresh and + New Job buttons

Integrations: None visible

Status: Partially functional — reports "100 jobs across 4 stages" but all columns show 0 jobs, suggesting a data sync issue. The New Job form is minimal with only 2 fields.

Limitations/Gaps: No list view option. No job detail view. No drag-and-drop visible. No filters beyond search. No assignee, dates, or status fields on the New Job form. Data mismatch between header count (100) and displayed count (0).

---

### Customers

Location: `/ops/customers`
Purpose: Customer/lead management with contact records.

Capabilities:
- View 4 stat cards: Total Contacts (20), With Email (5), With Phone (15), Sources (4)
- Search by name, email, phone
- Filter by Source dropdown: All Sources, Call: google, chat widget, Results Roofing Inspection Calendar, RESULTS ROOFING
- View customer table with columns: Name (sortable), Email, Phone, Location, Added, Source
- Row actions via "..." menu: View Details, Delete
- View customer detail modal with fields: Email, Phone, Location, Source, Added date, Tags (badge chips)
- Create new customer via "+ New Customer" modal (fields: First Name*, Last Name, Email, Phone, City, State, Source dropdown)
- Source dropdown on create form: Website, Referral, Google Ads, Door Knock, Facebook, Manual
- Refresh data

UI Elements: 4 stat cards, search bar, Source filter dropdown, data table with sortable columns, row action menus, detail modal, create modal

Integrations: GoHighLevel (contact data synced, sources like "Call: google", "chat widget" indicate GHL origin)

Status: Fully functional — live data, working search, filters, and CRUD operations.

Limitations/Gaps: No bulk actions (select/delete multiple). No edit capability visible (only View Details and Delete). No pagination controls visible. No export option on this page.

---

### CRM Contacts (Hidden Route)

Location: `/ops/crm/contacts`
Purpose: Enhanced contact management view with tags and source attribution.

Capabilities:
- View all 20 contacts with avatar initials (color-coded)
- Search contacts
- View table columns: Name (sortable), Email, Phone, Location, Tags, Added (sortable)
- Source displayed as subtitle under name (e.g., "Via Call: Google", "Via Chat Widget")
- Tags displayed as colored badge chips (robot reply, alert user, appt, pushed to jn, booked, xfer, lsa, dallas)
- Row actions via "..." menu
- Add Contact button
- Refresh data

UI Elements: Search bar, data table with avatar initials, tag badges, sortable columns, row actions

Integrations: GoHighLevel (tags and source attribution come from GHL)

Status: Fully functional — this is a more feature-rich version of the Customers page with tag visibility.

Limitations/Gaps: Not accessible from sidebar navigation — only via Quick Actions on Dashboard. Relationship to Customers page is unclear (appears to be the same data with different presentation).

---

### CRM Pipeline (Hidden Route)

Location: `/ops/crm/pipeline`
Purpose: Sales deal pipeline management.

Capabilities:
- View 3 stat cards: Total Deals (100), Pipeline Value ($0), Average Deal ($0)
- View Kanban board with 4 stages: New Request, Contacted, Scheduled, Closed — each showing count and dollar value
- "Drop deals here" placeholder in each column (suggests drag-and-drop intended)
- Create new deal via "+ Add Deal" modal (fields: Deal Name, Stage dropdown, Value, Status dropdown, Contact section with Name/Email/Phone)
- Refresh data

UI Elements: 3 stat cards, 4-column Kanban board, drag-drop zones, Add Deal modal with nested Contact fieldset

Integrations: None visible

Status: Partially functional — shows 100 total deals but all columns show 0. Data mismatch similar to Jobs page.

Limitations/Gaps: Not accessible from sidebar. Deals don't appear to populate into columns. No filters or search.

---

### Calendar

Location: `/ops/calendar`
Purpose: Appointment scheduling and management.

Capabilities:
- View monthly calendar grid with today highlighted (Feb 25, 2026)
- Navigate months with previous/next arrows and Today button
- View color-coded event types in legend: Appointment (blue), Inspection (pink), Installation (green), Follow-Up (yellow)
- Upcoming Appointments sidebar panel
- Month Summary sidebar: Total, Scheduled, Completed, Cancelled (all 0)
- Create new appointment via "+ New Appointment" modal (fields: Type dropdown, Date picker, Start Time, End Time, Order ID, Attendee Name, Attendee Email, Attendee Phone, Notes)
- Appointment Type options: Installation, Inspection, Follow-up
- Refresh data

UI Elements: Monthly calendar grid, navigation arrows, Today button, color-coded legend, sidebar with Upcoming Appointments and Month Summary, create appointment modal

Integrations: Cal.com listed in Settings but not yet connected. Order ID field suggests link to estimates/invoices.

Status: Functional but empty — no appointments scheduled. The form is complete with all necessary fields.

Limitations/Gaps: No week or day view. No ability to click on a calendar date to create an appointment. No recurring appointment support visible. Cal.com integration not yet connected.

---

### Estimates

Location: `/ops/estimates`
Purpose: Quote/estimate management for roofing jobs.

Capabilities:
- View 4 stat cards: Total Quotes (14), Total Value ($277,213), Signed/Converted (0), Active Pipeline (14, $277,213)
- Search estimates
- Filter by Status dropdown: All Statuses, Preliminary, Measured, Selected, Financed, Scheduled, Signed, Converted
- View table with columns: Customer, Address, Amount (sortable), Status (badge), Tier, Created, and "..." action menu
- Row actions: View Details, Archive, Delete
- Quote Details modal displays: Customer, Amount, Address (full with zip), Status badge, Tier, Sq Ft, Deposit amount, Created date, Expires date
- Tier system: Better, Best (visible in data)
- Refresh data

UI Elements: 4 stat cards, search bar, Status filter dropdown, data table with sortable Amount column, status badges, row action menus, detail modal

Integrations: Google Solar (satellite measurements for Sq Ft data), custom quote engine

Status: Fully functional — populated with 14 real quotes showing active pipeline progression.

Limitations/Gaps: No "Create Estimate" button (estimates appear to be generated through the public-facing quote tool). No edit capability visible. No inline status change. Amount column shows the sort icon but no other sort options on other columns.

---

### Invoices

Location: `/ops/invoices`
Purpose: Invoice tracking and management.

Capabilities:
- View 4 stat cards: Total Invoiced ($0), Outstanding ($0), Overdue (0, red-colored), Paid ($0, green-colored)
- Search invoices
- Filter by Status dropdown: All Statuses, Pending, Deposit Paid, Scheduled, In Progress, Completed, Cancelled, Refunded
- Export CSV button
- Refresh data

UI Elements: 4 stat cards (with color-coded values), search bar, Status filter dropdown, Export CSV button, empty state display

Integrations: Stripe (implied for payment processing)

Status: Functional but empty — "No orders yet" empty state. The infrastructure is in place.

Limitations/Gaps: No "Create Invoice" button. No way to manually create invoices. Invoices appear to be system-generated. Empty state shows no guidance on how invoices get created.

---

### Payments

Location: `/ops/payments`
Purpose: Payment tracking across methods.

Capabilities:
- View 4 stat cards: Total Received ($0, green), Pending ($0), Failed ($0, red), Avg Transaction ($0)
- Search by customer or invoice #
- Filter by Method dropdown: All Methods, Credit Card, ACH, Financing
- Filter by Status dropdown: All Statuses, Succeeded, Pending, Processing, Failed, Refunded
- Export CSV button
- Refresh data

UI Elements: 4 stat cards with color-coded values, search bar, 2 filter dropdowns (Method and Status), Export CSV button, empty state display

Integrations: Stripe (payment processing — Connected in Settings)

Status: Functional but empty — "No payments recorded yet." Payment infrastructure ready but no transactions processed.

Limitations/Gaps: No manual payment recording button. Financing as a method suggests a third-party financing integration that isn't listed in Settings. No payment link generation capability visible.

---

### Materials

Location: `/ops/materials`
Purpose: Material order and supplier tracking for roofing jobs.

Capabilities:
- View 3 stat cards: Total Spend ($0), Pending Orders (0), Delivered (0)
- Create new material order via "+ New Order" modal (fields: Job Address, Supplier, Total)
- Empty state with icon and description: "No material orders yet. Create your first material order to start tracking suppliers and deliveries."
- Refresh data

UI Elements: 3 stat cards, New Order button (header and empty state), create modal

Integrations: None visible

Status: Functional but empty — material order creation works, tracking awaits first order.

Limitations/Gaps: Minimal form with only 3 fields — no line items, no material types, no delivery date, no order status, no supplier catalog. Very basic compared to what a roofing materials tracking system would need.

---

### Inbox (Unified Communications)

Location: `/ops/inbox`
Purpose: Unified messaging inbox combining SMS and Email conversations.

Capabilities:
- View all 15 conversations with 0 unread indicator
- Search conversations
- Filter tabs: All, Unread, Email, SMS
- View conversation list with: contact name, timestamp, message preview, channel icon (SMS or Email)
- Select conversation to view threaded message detail in split-pane layout
- View individual messages with: content, timestamp, delivery status (undelivered, completed), channel icon
- View system events within conversations (e.g., "DnD enabled by customer", "Opportunity created")
- Reply inline with message input and Send button
- Toggle between Email and SMS view for a selected conversation
- Create new conversation via "+ New Message" modal (fields: Channel toggle SMS/Email, To search contacts, Message textarea)
- Refresh data

UI Elements: Split-pane layout (conversation list + detail), search bar, 4 filter tabs, channel toggle, inline reply input, New Message modal

Integrations: GoHighLevel (message data synced), SignalWire (SMS — listed but not connected in Settings), Resend (email delivery — Connected)

Status: Fully functional — live conversation data with active SMS and Email threads showing real messaging activity.

Limitations/Gaps: No message templates. No bulk messaging. No scheduled send. No attachment support visible. Contact names mostly show as "Unknown."

---

### SMS Center (Hidden Route)

Location: `/ops/messaging/sms`
Purpose: Dedicated SMS conversation management.

Capabilities:
- View all SMS conversations with avatar initials
- Search conversations
- Filter tabs: All, Unread, Starred
- View conversation list with: name, timestamp, message preview, delivery status icons
- Select conversation for threaded view in split-pane layout
- Create new conversation via "+ New Conversation" button
- Refresh data

UI Elements: Split-pane layout, search bar, 3 filter tabs (note: includes Starred — different from Inbox), avatar icons, conversation detail pane

Integrations: GoHighLevel, SignalWire

Status: Fully functional — shows live SMS conversation data.

Limitations/Gaps: Not accessible from sidebar. Adds "Starred" filter not available in Inbox. Redundant with Inbox SMS filter.

---

### Documents

Location: `/ops/documents`
Purpose: Document organization and management for roofing projects.

Capabilities:
- View 4 document folders: Deposits, Contracts, Invoices, General (each showing document count)
- Navigate into folder via click, breadcrumb navigation (Home > Folder)
- Create new document via "+ New Document" modal (fields: Document Name, Folder dropdown, Type dropdown, Status dropdown, Customer Name, Customer Email, Property Address)
- Folder options: Deposits, Contracts, Invoices, General
- Document Type options: Deposit Auth, Contract, Invoice, Receipt, Change Order, Warranty, Other
- Document Status: Pending (default; other options not confirmed but dropdown exists)
- Refresh data

UI Elements: 4 folder cards with icons and counts, breadcrumb navigation, empty state, create document modal with 7 fields and 3 dropdowns

Integrations: Documenso (document signing — listed in Settings but not connected)

Status: Functional but empty — all folders show 0 documents. Document creation form is comprehensive.

Limitations/Gaps: No file upload capability visible — documents are metadata records only, no actual file attachment. No preview or download. Documenso integration not connected. No search within documents.

---

### Automations

Location: `/ops/automations`
Purpose: Workflow automation for business processes.

Capabilities:
- View 3 stat cards: Active (0), Total Runs (0), Time Saved (~0 min)
- Create new automation via "+ New Automation" modal (fields: Name, Trigger, Action(s) — all free-text inputs)
- Empty state: "No automations yet. Create your first automation to streamline workflows like follow-ups, reminders, and notifications."
- Refresh data

UI Elements: 3 stat cards, empty state with icon, New Automation button, create modal with 3 text fields

Integrations: None visible

Status: Placeholder — the automation form is purely text-based with no trigger/action builder, no conditional logic, no integration connectors. This is a basic record-keeping form, not a functional automation engine.

Limitations/Gaps: No visual workflow builder. No trigger type selection (dropdown/event-based). No action type selection. No conditional branching. No integration with any other module. This is the weakest feature in the platform — essentially a note-taking form dressed as automation.

---

### Reports

Location: `/ops/reports`
Purpose: Business intelligence and analytics reporting.

Capabilities:
- View 3 tabs: Overview, Sales Performance, Lead Analytics
- **Overview tab**: 4 stat cards (Revenue MTD $0, Orders 0, Quotes Generated 14, Avg Order Value $0), Quote Conversion Funnel horizontal bar chart (New Lead 14/100%, Measured 14/100%, Tier Selected 10/71.4%, Financing 8/57.1%, Scheduled 8/57.1%), Leads by Source bar chart (Direct), Revenue Trend line chart (Jan 31–Feb 21, flat at $0)
- **Sales Performance tab**: Sales Rep Leaderboard with empty state "Team performance tracking — Set up team members to track individual performance"
- **Lead Analytics tab**: Lead Source Breakdown horizontal bar (Direct: 14)
- Refresh data

UI Elements: 3-tab interface, 4 stat cards, 3 chart types (horizontal bar, vertical bar, line chart), empty state for Sales Performance

Integrations: Data from estimates pipeline feeds the Quote Conversion Funnel

Status: Partially functional — Overview has real data visualization. Sales Performance requires team members. Lead Analytics is basic.

Limitations/Gaps: No date range selector on Reports page. No export functionality. No custom report builder. Sales Performance completely empty pending team setup. Revenue data all $0 suggesting payment/invoice tracking not yet active.

---

### Business Analytics (Hidden Route)

Location: `/ops/analytics`
Purpose: Advanced business analytics with date-range filtering.

Capabilities:
- Date range picker with prev/next navigation (Jan 27 – Feb 25)
- View 4 stat cards: Revenue ($0), Orders (0), Quotes (14), Avg Order ($0)
- Performance Overview: 30-day trend line chart with toggle tabs for Revenue, Orders, Quotes
- Quote Pipeline: All-time horizontal bars by status — Measured (4), Selected (2), Scheduled (8)
- Lead Sources: Placeholder — "Connect CRM for lead source tracking"
- Website Traffic: Placeholder — "Connect Google Analytics for traffic data"
- Refresh data

UI Elements: Date range picker with navigation, 4 stat cards, line chart with 3 toggle options, horizontal bar chart, 2 placeholder cards

Integrations: References Google Analytics (not connected)

Status: Partially functional — date picker and charts work, but Lead Sources and Website Traffic are placeholder sections awaiting integration connections.

Limitations/Gaps: Not accessible from sidebar. Google Analytics not connected. Lead source tracking needs CRM connection (odd since CRM data exists). No export. Duplicates some Reports page functionality.

---

### Team

Location: `/ops/team`
Purpose: Team member management and performance tracking.

Capabilities:
- View team member count (0 team members)
- Invite team member via "+ Invite Member" modal (fields: Full Name, Email, Phone, Role — text input defaulting to "Member")
- Empty state: "No team members yet. Invite your first team member to start tracking performance and assigning jobs."
- Refresh data

UI Elements: Empty state with icon, Invite Member button (header and empty state), invite modal with 4 fields

Integrations: None visible

Status: Functional but empty — invitation form works, no team members set up.

Limitations/Gaps: Role is a free-text field rather than a dropdown (no predefined roles like Admin, Sales Rep, Installer, etc.). No role-based access control visible. No performance metrics view.

---

### Blog (Content Management)

Location: `/ops/blog`
Purpose: Content management for SEO — blog post creation and management.

Capabilities:
- View all blog posts in table: Title, Status (badge), Author, Published date, Views (sortable), "..." actions
- Search posts
- Filter by Status dropdown: All Statuses, Draft, Published, Scheduled, Archived
- Row actions: Edit, Unpublish, Delete
- Create new post via "+ New Post" modal (fields: Title*, Excerpt, Author, Status dropdown default Draft)
- Edit post via modal (fields: Title*, Excerpt, Author, Status dropdown)
- Blog Status dropdown options on create/edit: Draft, Published (confirmed), plus others from filter
- Refresh data
- Currently 17+ published posts covering roofing topics (all by Dalton Reed, published Feb 2026)

UI Elements: Search bar, Status filter dropdown, data table with status badges and sortable Views column, row action menus, create/edit post modals

Integrations: None visible (publishes to resultsroofing.com blog)

Status: Fully functional — populated with substantial content library of roofing-focused SEO blog posts.

Limitations/Gaps: No rich text editor — blog editing is title/excerpt only, no body content editor visible. No image upload. No categories or tags. No SEO metadata fields. No preview link. Views column shows "—" for all posts.

---

### Settings

Location: `/ops/settings`
Purpose: Platform configuration across 5 areas.

#### Settings > Company

Capabilities:
- Edit company profile (fields: Company Name, Phone, Address, Email, License #)
- Save Changes button

UI Elements: 5 text input fields, Save button

Status: Functional but empty — all fields blank.

#### Settings > Pipeline

Capabilities:
- View and customize 10 pipeline stages in numbered order:
  1. New Lead, 2. Appointment Scheduled, 3. Measurement Complete, 4. Proposal Sent, 5. Proposal Signed, 6. Pre-Production, 7. Materials Ordered, 8. In Progress, 9. Punch List, 10. Complete
- Add new stages via "+ Add Stage" button

UI Elements: Numbered list of editable stage items, Add Stage button

Status: Fully functional — comprehensive 10-stage roofing-specific pipeline.

Limitations/Gaps: No drag-to-reorder. No delete stage option visible. No color customization per stage. These stages don't match the 4-stage Kanban visible in Jobs page (New Request, Contacted, Scheduled, Closed).

#### Settings > Integrations

Capabilities:
- View 6 integration tiles with connection status:
  - **Stripe** — Payment processing — Connected
  - **Resend** — Email delivery — Connected
  - **SignalWire** — SMS messaging — Set Up (not connected)
  - **Google Solar** — Satellite measurements — Connected
  - **Cal.com** — Scheduling — Set Up (not connected)
  - **Documenso** — Document signing — Set Up (not connected)

UI Elements: 6 integration cards with icons, descriptions, and status indicators (green dot = Connected, "Set Up" button = not connected)

Status: 3 of 6 integrations connected. 3 pending setup.

#### Settings > Notifications

Capabilities:
- Configure 5 notification event types, each with Email and SMS channel toggles:
  1. New lead received
  2. Proposal signed
  3. Payment received
  4. Invoice overdue
  5. Task overdue

UI Elements: 5 notification rows with checkbox toggles for Email and SMS (all unchecked)

Status: Functional — checkboxes work but all notifications are disabled.

#### Settings > Data

Capabilities:
- Export All Data (CSV) button
- Import Contacts button

UI Elements: 2 action buttons

Status: Functional — data import/export available.

Limitations/Gaps: No granular export (export specific modules). Import limited to contacts only.

---

### Support/Feedback Widgets (Global)

Location: Available on all pages (bottom-right corner)

**Feedback Widget**
- 3-step feedback form
- Step 1: Category selection — Something's broken (bug report), Feature idea (improvement), General feedback
- Progressive form with step indicator

**Support Chat Widget**
- Live chat dialog with greeting message
- Quick response buttons: Question about my quote, Scheduling help, Payment questions, Talk to a human
- Message input with send button

**FAQ Widget**
- Searchable FAQ modal
- Topic categories: My Project, Payments, Scheduling, Warranty, Documents
- 5 expandable FAQ entries about roofing projects (installation time, being home during work, materials used, property protection, tear-off policy)
- "Chat with Support" CTA at bottom

Status: All three widgets are functional and customer-facing.

---

## Integrations Catalog

| Integration | Purpose | Status | Used By |
|---|---|---|---|
| GoHighLevel | CRM, contacts, conversations, lead source tracking | Active (implied, not in Settings UI) | Customers, Contacts, Inbox, SMS |
| Stripe | Payment processing | Connected | Payments, Invoices |
| Resend | Email delivery | Connected | Inbox (Email), Notifications |
| Google Solar | Satellite roof measurements | Connected | Estimates (Sq Ft data) |
| SignalWire | SMS messaging | Not Connected (Set Up) | SMS Center, Inbox |
| Cal.com | Scheduling | Not Connected (Set Up) | Calendar |
| Documenso | Document signing | Not Connected (Set Up) | Documents |
| Google Analytics | Website traffic data | Referenced but not connected | Analytics page placeholder |

Total: 8 integrations referenced, 3 confirmed connected, 1 active but implicit (GHL), 4 not yet connected.

---

## Automation Capabilities

The Automations module exists but is effectively a placeholder. Current capabilities are limited to:

- Creating text-based automation records with Name, Trigger description, and Action description
- No actual automation engine — no event listeners, no conditional logic, no scheduled triggers
- Suggested use cases (from empty state): follow-ups, reminders, notifications
- Notification preferences in Settings provide the closest thing to actual automation (Email/SMS toggles for 5 event types)

The platform currently relies on GoHighLevel for actual automation workflows (missed call texts, appointment reminders, etc.) rather than its own automation engine.

---

## Platform Strengths

1. **Roofing-industry-specific pipeline**: The 10-stage pipeline in Settings perfectly mirrors a roofing contractor's workflow from New Lead through Punch List to Complete — this is domain expertise baked into the product.

2. **Google Solar integration**: Satellite-based roof measurement (Sq Ft) feeding directly into estimates is a powerful differentiator that eliminates manual measurement for initial quotes.

3. **Comprehensive estimates system**: The estimate pipeline (Preliminary -> Measured -> Selected -> Financed -> Scheduled -> Signed -> Converted) with tier-based pricing (Better/Best) and auto-calculated deposits shows mature quote management.

4. **Unified communication hub**: The Inbox combining SMS and Email in one threaded view with system events (opportunity created, DnD status) provides context-rich customer communication.

5. **Built-in SEO blog**: Having a content management system directly in the ops dashboard with 17+ published roofing articles shows commitment to organic growth and provides a marketing advantage most contractors don't have.

6. **Customer-facing support suite**: The chat widget, FAQ, and feedback form create a polished customer experience directly within the platform.

7. **Multi-channel contact sourcing**: Contact records track origin (Call: Google, Chat Widget, Inspection Calendar, etc.) enabling marketing attribution.

8. **Tag-based contact management**: The GHL-synced tagging system (appt, pushed to jn, booked, xfer, robot reply) enables sophisticated segmentation.

9. **Clean, modern UI**: Consistent design language with stat cards, modals, tables, and breadcrumb navigation across all sections. Responsive sidebar with category grouping.

10. **Data portability**: CSV export on invoices, payments, and all data via Settings ensures data isn't locked in.

---

## Platform Weaknesses

1. **Automation is essentially non-functional**: The automation module is just a text form — no real workflow engine, no triggers, no conditional logic. This is the biggest gap compared to platforms like JobNimbus.

2. **Pipeline/Jobs data mismatch**: Jobs and Pipeline both report 100 items but display 0 in columns, suggesting a data sync or rendering issue between GHL and the dashboard.

3. **No invoice creation mechanism**: Invoices page has no create button — it's unclear how invoices get generated in the workflow.

4. **Disconnected pipeline configurations**: Settings shows a 10-stage pipeline, but Jobs Kanban only shows 4 stages (New Request, Contacted, Scheduled, Closed). These don't align, creating confusion about which pipeline drives what.

5. **Hidden routes without sidebar access**: CRM Contacts, CRM Pipeline, SMS Center, and Business Analytics are accessible only via Quick Actions or direct URL — not discoverable through navigation.

6. **Minimal material order tracking**: Only 3 fields (address, supplier, total) — no line items, delivery dates, or material specifications that a roofing company would need.

7. **Blog has no body editor**: Posts can only have title and excerpt — no rich text body content editing, images, or SEO metadata.

8. **Three disconnected analytics pages**: Dashboard, Reports (/ops/reports), and Analytics (/ops/analytics) all show overlapping data with different presentations but no clear hierarchy.

9. **No task/to-do management**: No task assignment, checklists, or work order system for crews.

10. **No photo/file management**: Documents section creates metadata records but has no actual file upload or storage capability. No job site photo management.

11. **Team roles are free text**: No predefined roles, no role-based access control, no permissions system.

12. **3 of 6 integrations not connected**: SignalWire (SMS), Cal.com (scheduling), and Documenso (signing) are listed but not set up, leaving communication, scheduling, and document signing partially crippled.

13. **No mobile/responsive indicators**: No evidence of mobile app or mobile-optimized views for field crews.

14. **Contact names mostly "Unknown"**: Many contacts show as "Unknown" suggesting incomplete data sync from GHL.

---

## Summary Statistics

- Total distinct features/tools: **17** (13 sidebar sections + 4 hidden routes)
- Total integrations referenced: **8** (Stripe, Resend, SignalWire, Google Solar, Cal.com, Documenso, GoHighLevel, Google Analytics)
- Total integrations connected: **4** (Stripe, Resend, Google Solar, GoHighLevel implicit)
- Total integrations pending: **4** (SignalWire, Cal.com, Documenso, Google Analytics)
- Total automation templates: **0** (module is placeholder only)
- Total pipeline stages configured: **10**
- Total estimate records: **14** ($277,213 total value)
- Total contacts synced: **8,445** (from GHL) / **20** displayed in dashboard
- Total conversations: **8,409** / **15** displayed in Inbox
- Total blog posts: **17+** (all published)
- Total invoices: **0**
- Total payments: **0**
- Total material orders: **0**
- Total team members: **0**
- Total automations: **0**
