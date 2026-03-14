# Competitive Analysis: Results Roofing vs. JobNimbus

**Date:** February 25, 2026
**Prepared from:** Full platform audits of both systems conducted same day

---

## 1. Executive Summary

Results Roofing (RR) is a custom-built, single-tenant ops dashboard serving one roofing company. JobNimbus (JN) is a mature, multi-tenant SaaS platform that Results Roofing LLC currently pays $17,588/month to use across 269 users and 12 locations. The two platforms are at fundamentally different stages of maturity. JN has years of iteration behind it, a deep feature set built primarily for insurance restoration contractors, and an ecosystem of 21+ integrations. RR has a clean modern UI, roofing-specific domain logic baked in, a working quote engine with Google Solar integration, and a unified communication inbox — but many of its modules are empty shells or placeholders with no data flowing through them.

The gap is real but not as devastating as it first appears, because the two products serve different business models. JN's complexity is driven by the insurance restoration workflow: claims, adjusters, supplements, COC documents, reinspection cycles, and multi-party financial reconciliation. Results Roofing targets retail self-pay homeowners — a fundamentally simpler transaction where the homeowner gets a quote, picks a tier, pays, and the roof gets installed. Roughly 40-50% of JN's feature surface area exists to serve insurance workflows that are irrelevant to RR's retail model. The question is not "can RR replicate all of JobNimbus" but "can RR deliver a complete retail roofing ops workflow that makes the $17.5K/month JN bill unnecessary for the retail side of the business."

Today the answer is no — RR has critical gaps in job detail views, invoicing, automation, and team management that would prevent anyone from running daily operations through it. But the path to "good enough for retail" is shorter than it looks. RR needs to nail about 8-10 features to become a viable standalone ops platform for the retail workflow, while JN will always carry the overhead of insurance complexity that RR's retail customers never touch.

---

## 2. Feature-by-Feature Comparison

| Feature Area | JobNimbus | Results Roofing | Verdict |
|---|---|---|---|
| **Contact/Customer Management** | 14,354+ contacts. Rich detail pages with activity feeds, related jobs, documents, photos, financials, tags, custom fields, QuickBooks sync status, related contacts. 5 contact types (Customer, Supplier, Subcontractor, Adjuster, Realtor). CSV import/export. | 20 contacts displayed (8,445 synced from GHL but mostly not rendered). Basic table with name, email, phone, location, source. Detail modal shows limited fields. No edit capability. Two redundant contact views (Customers + hidden CRM Contacts). | **Behind** |
| **Job Management & Detail Views** | Full job record with 12 sub-pages: Dashboard, Activity, Fields, Tasks, Photos, Documents, Estimates, Material & Work Orders, Payments & Invoices, Profit Tracker, Forms, Custom Documents. Stage progress bar. Map integration. Comprehensive custom fields (25+ insurance/roofing fields). | 4-column Kanban board showing 0 of 100 reported jobs (data sync broken). New Job form has only 2 fields (name, value). No job detail view exists. No sub-pages, no activity feed, no linked records. | **Behind (Critical)** |
| **Pipeline/Boards (Kanban)** | Fully customizable Kanban with drag-and-drop. Card title/body templates using merge tags. Column totals. Filters by location, type, sales rep, assignee, subcontractor. Board-level access control. 25-stage insurance pipeline configured. Multiple boards supported. | Two separate Kanban views (Jobs + hidden CRM Pipeline) both showing 0 items despite 100 reported. 4 fixed stages. No drag-and-drop confirmed. No filters beyond search. Settings has 10-stage pipeline that doesn't match the Kanban stages. | **Behind** |
| **Calendar & Scheduling** | Day/Week/Month/Agenda views. Google Maps integration for geographic dispatch. Team member and subcontractor filtering. Work order types on calendar. Color-coding by location. Show/hide completed tasks. Mini-calendar for quick navigation. | Monthly view only. No week/day/agenda views. No map view. Color-coded legend for 4 event types. Empty — 0 appointments. Cal.com integration listed but not connected. No click-to-create on date cells. | **Behind** |
| **Estimating & Quoting** | Full estimate system with manufacturer-specific layouts (Owens Corning, GAF, CertainTeed, etc.), per-location templates, estimate designs (branded PDFs), measurement token integration (EagleView, HOVER), profit settings, financing (Sunlight Financial), email settings, page settings, notifications. Products & Services catalog. | 14 real estimates in pipeline with tier-based pricing (Better/Best), Google Solar satellite measurement integration, 7-stage estimate pipeline (Preliminary through Converted), deposit calculations, square footage. No create button — estimates generated via public quote tool. No edit capability from ops dashboard. | **Parity (different strengths)** |
| **Invoicing** | Full invoice system with templates, QuickBooks sync, per-job invoice tracking, credit memos, invoice numbering templates with merge tags (`{{locationcode}}-{{estimateid}}`). Invoice reports available. | Empty shell — 0 invoices, no create button, no manual invoice creation mechanism. Status filters and CSV export exist but nothing to filter or export. | **Behind (Critical)** |
| **Payments** | Native payment processor (JobNimbus Payments) with per-location merchant accounts, ACH/E-Check active, credit cards configurable, daily disbursement reconciliation, merchant fee tracking, customer fee passthrough options. QuickBooks payment sync. 7 verified locations. | Empty shell — 0 payments. Stripe connected but no transactions. Filter by method (CC, ACH, Financing) and status. CSV export. No payment link generation. No manual payment recording. | **Behind** |
| **Materials & Work Orders** | Dedicated Material Orders AND Work Orders as separate entities. Per-job tracking with delivery dates, status, supplier, internal notes, total cost, type. Supplier database. Measurements button integration. Reports for both. Work order scheduling on calendar. | 3-field form (address, supplier, total). No line items, no delivery dates, no material types, no supplier catalog. 0 orders. No work order concept at all. | **Behind** |
| **Communications (SMS/Email)** | Engage: native SMS platform with 9 dedicated business phone numbers across markets, TCPA-compliant scheduling, contact list (21,562), conversation assignment (me/unassigned/others/archive), scheduled messages, monthly SMS billing ledger. Email via jobnimbusmail.com forwarding to M365. Email templates library. | Unified inbox combining SMS + Email in threaded view with system events. 15 real conversations. Channel filtering (All/Unread/Email/SMS). New message modal with channel toggle. SignalWire (SMS) not connected. Resend (email) connected. Most contact names show as "Unknown." | **Behind (but better UX pattern)** |
| **Automations & Workflows** | Real automation engine: event-based and time-based triggers across 9 entity types. Conditions with AND/OR logic on any field. 6 action types (Create Task, Send Text, Send Email, Change Status, Change Parent Status, Webhook). Production automations running (collection reminders, build scheduling). | Placeholder only — text form with Name/Trigger/Action free-text fields. No trigger selection, no conditions, no actions, no engine. 0 automations. Relies on GoHighLevel for actual automation. | **Behind (Critical)** |
| **Reporting & Analytics** | Insights dashboard with KPI cards across 4 time periods, Top 5 charts (Lead Sources, Sales Reps), year-over-year comparison charts, filterable by Sales Rep/Lead Source/Job Type. Classic Reports with 14 report types, 30+ saved reports, saveable to dashboard. Team Activity Report. | 3 overlapping analytics pages (Dashboard, Reports, Analytics — all partially functional). Quote Conversion Funnel with real data. Revenue all $0. No date range selector on Reports. No custom report builder. No export. | **Behind** |
| **Team Management & Roles** | 269 users across 7 access profiles (Sales, Manager, Admin, Operations, The "U", Senior Sales, Sales II). Per-role permissions controlling feature access. Groups for manager-based team visibility. Seat-based pricing by role. | 0 team members. Free-text role field (no predefined roles). No access control. No permissions system. No groups. | **Behind (Critical)** |
| **Custom Fields** | Rich custom field system for Contacts, Jobs, and Work Orders. Field types: Date, Decimal, Number, Text, Boolean, Options List. Drag to reorder. Hide/Edit/Delete. 25+ custom fields configured on jobs (insurance-specific). | No custom field system. Pipeline stages in Settings are the closest equivalent. Estimate records have Tier field but no user-configurable custom fields. | **Behind** |
| **Document & Photo Management** | Per-job Documents and Photos tabs with upload, download all, filter, sort, search. Attachment categories (configurable). Company Documents board for shared files. CompanyCam integration for real-time job site photos. | Document metadata records in 4 folders (Deposits, Contracts, Invoices, General) — but no file upload, no actual files, no preview. Documenso integration listed but not connected. No photo management at all. | **Behind** |
| **Templates (Email, Estimate, Invoice)** | Comprehensive template system: 7 template types (Invoice, Credit Memo, Estimate, Document, Email, Work Order, Material Order). 20+ email templates configured (insurance and retail variants, English and Spanish). Estimate layouts per manufacturer and per location. Custom document templates with template questions for conditional logic. | No template system. No email templates. No estimate templates (estimates generated by public quote tool with built-in tier logic). No document templates. | **Behind** |
| **Multi-Location Support** | 12 locations configured (DFW, HTX, CTX, ATX, ATL, WNC, RNC, MSC, CSTX, ANM + 2 disabled). Per-location: logo, phone, address, payment merchant, estimate layouts, products, phone numbers. Location-based filtering across boards, calendar, reports. Number templates with `{{locationcode}}`. | No multi-location support. Single company profile in Settings (unfilled). No location concept in any module. | **Behind** |
| **Marketing Tools** | AssistAI: AI phone answering service (33 calls answered, 54 min saved in 30 days). ROI Reporting (in development). Website Management (coming soon). | Built-in blog CMS with 17+ published SEO articles managed directly from ops dashboard. No AI answering. No other marketing tools. | **Mixed** (RR has blog; JN has AI answering) |
| **Customer-Facing Features** | No customer portal visible. No support widgets. Customer-facing interaction is through estimates/invoices sent via email. | Support chat widget, searchable FAQ (5 topics), 3-step feedback form — all live on every page. Customer-facing support suite is polished and functional. | **Ahead** |
| **Integrations Ecosystem** | 21+ integrations: 4 native (Payments, Engage, AssistAI, Google Maps), 7 configurable via Settings (QuickBooks, EagleView, CompanyCam, HOVER, Beacon, Xactimate, naturalForms, Sunlight Financial), 10+ via API (Zapier, Make, GHL, SalesRabbit, Hail Recon, etc.). | 8 integrations referenced: 4 connected (Stripe, Resend, Google Solar, GHL implicit), 4 pending (SignalWire, Cal.com, Documenso, Google Analytics). | **Behind** |
| **API Access** | Public REST API with key management. Multiple active API keys for different services. Access profile (role) assignment per key. | No API. No webhook endpoints documented. No programmatic access for external tools. | **Behind** |
| **Search (Global)** | Global search (Ctrl+K) across Jobs, Contacts, Documents, Estimates, Material Orders, Work Orders, Invoices. | Per-page search bars on most pages. No global/cross-module search. | **Behind** |
| **Mobile/Field Access** | Not explicitly audited but implied by Field role ($30/seat), mobile-oriented features (CompanyCam, SalesRabbit, fence measurements on mobile). | No mobile app or mobile-optimized views documented. No field access features. | **Behind** |

---

## 3. Where Results Roofing Is Ahead

These are genuine advantages — areas where RR has capabilities JN either lacks or does worse.

1. **Customer-facing support suite.** RR has a live chat widget, searchable FAQ, and structured feedback form on every page. JN has no customer portal or support widgets. For a retail business where the homeowner IS the customer (not an insurance adjuster), this direct support layer is a real differentiator.

2. **Google Solar satellite integration for instant quotes.** RR uses Google Solar API to pull satellite roof measurements directly into estimates, enabling instant online quoting without a site visit. JN uses EagleView (manual order, takes time) and HOVER (requires smartphone photos). The instant, automated nature of RR's approach is better suited to retail self-serve.

3. **Built-in blog/content CMS.** 17+ published SEO articles managed directly from the ops dashboard. JN has no content management — their "Website Management" is listed as "coming soon." For a retail brand that needs organic search presence, having content ops alongside business ops is a genuine advantage.

4. **Unified communication inbox.** RR's Inbox combines SMS and Email in a single threaded view with system events inline. JN's email and SMS are separate systems (Engage for SMS, jobnimbusmail.com forwarding for email). The unified approach is a better UX pattern, even if RR's implementation currently has data quality issues (unknown contacts).

5. **Tier-based quoting model.** RR's Better/Best tier system with automatic deposit calculations is purpose-built for retail self-pay. JN's estimating is oriented around insurance scopes with manufacturer-specific layouts — more complexity than a retail homeowner needs.

6. **Modern, clean UI.** RR has a consistent, modern design language with stat cards, modals, and a well-organized sidebar. JN's interface is functional but reflects years of feature accumulation with less visual coherence (ASP.NET-era URLs, mixed UI patterns).

7. **Quote-to-ops pipeline continuity.** Estimates generated through the public-facing quote tool flow directly into the ops dashboard pipeline. The customer journey from "get a quote on the website" to "ops team manages the job" is seamless. JN requires manual job creation or import.

---

## 4. Critical Gaps (Must Address)

These gaps would prevent a roofing company from using RR as their primary ops tool. They are blockers for replacing JN on the retail workflow.

1. **No job detail view.** This is the single biggest gap. JN has a 12-sub-page job record (activity, tasks, photos, documents, estimates, financials, profit tracking, forms). RR has a Kanban board that displays 0 jobs and no way to click into a job to see or manage anything about it. Every roofing ops workflow centers on the job record. Without it, the platform is unusable for daily operations.

2. **Automations are non-functional.** RR's automation "module" is a text form — no triggers, no conditions, no actions, no engine. JN has a real automation system driving production workflows (collection reminders, build scheduling, status-based task creation). Even a retail workflow needs basic automations: follow-up reminders after quote delivery, deposit confirmation notifications, build day reminders, review requests after completion. Without automation, everything is manual.

3. **No invoice creation or management.** The invoices page is an empty shell with no way to create, edit, or send an invoice. For a retail self-pay business where the homeowner pays directly, invoicing is the revenue mechanism. This is a hard blocker.

4. **Jobs/Pipeline data not rendering.** Both the Jobs Kanban and CRM Pipeline report 100 items but display 0. This is either a data sync issue or a rendering bug, but it means the pipeline — the core operational view — is broken. Even if the UI existed, no one can use it today.

5. **Team management is empty.** 0 team members, free-text roles, no permissions. JN manages 269 users across 7 role profiles with per-role access control. RR doesn't need 269 seats, but it needs at minimum: admin, sales rep, and installer/crew roles with appropriate visibility restrictions. You can't hand a login to a sales rep who can see and delete everything.

6. **No task/to-do system.** JN has tasks per job, per contact, and on the calendar — with time tracking, task types, completion status, and automation-driven task creation. RR has no task concept anywhere. Roofing operations run on task lists: schedule inspection, order materials, confirm build day, send completion docs, collect payment.

---

## 5. Significant Gaps (Should Address)

Important for competitiveness but not hard blockers for a minimal viable retail ops workflow.

1. **No custom fields.** JN has configurable fields (Date, Decimal, Number, Text, Boolean, Options List) on contacts, jobs, and work orders. RR has no custom field system. Retail ops will need at minimum: preferred contact method, HOA approval status, financing preference, and roof type/material details.

2. **No document/file upload or storage.** RR's Documents section creates metadata records but cannot attach actual files. No file upload, no preview, no download. For retail: contracts, signed proposals, warranty docs, before/after photos need to live somewhere accessible.

3. **Calendar missing week/day views and map.** JN's calendar has Day/Week/Month/Agenda views plus a Google Maps dispatch view. RR has monthly only. For scheduling installations and inspections, day and week views are essential — monthly is too zoomed out.

4. **No email/SMS templates.** JN has 20+ email templates (including retail-specific ones) and 7 template types. RR has no templates. Retail operations need at minimum: quote follow-up, deposit confirmation, build day schedule, completion notification, review request, and warranty information templates.

5. **Pipeline stage mismatch.** Settings defines a 10-stage pipeline (New Lead through Complete) but the Jobs Kanban shows 4 stages (New Request, Contacted, Scheduled, Closed). This disconnect means the pipeline configuration isn't driving the actual board, which will confuse anyone trying to use it.

6. **Three redundant analytics pages.** Dashboard, Reports (/ops/reports), and Analytics (/ops/analytics) overlap significantly with no clear hierarchy. This needs consolidation into one coherent reporting section.

7. **Hidden routes not in navigation.** CRM Contacts, CRM Pipeline, SMS Center, and Business Analytics are only accessible via Quick Actions or direct URL. If these features exist, they should be in the sidebar or merged into their parent modules.

8. **No QuickBooks or accounting integration.** JN syncs bidirectionally with QuickBooks (contacts, jobs, estimates, invoices, payments, products, taxes). For a real business, accounting integration isn't optional — it's how the books get done.

---

## 6. Nice-to-Have Gaps

Features JN has that are useful but not essential for RR's retail self-pay model.

1. **Multi-location support.** JN manages 12 locations with per-location everything (logos, phones, payment merchants, estimate layouts, phone numbers). RR currently operates in specific markets, but if it's a single-brand retail operation, multi-location complexity may not be needed immediately. Becomes important if/when RR scales to multiple markets.

2. **Profit Tracker / Job Costing.** JN has a dedicated Profit Tracker per job with planned vs. actual revenue/cost, commissions, and margin analysis. Valuable for mature operations but not a day-one requirement for retail ops.

3. **Work Orders (separate from Material Orders).** JN tracks work orders as their own entity with types, suppliers, scheduling, and calendar integration. RR could fold this into a simpler task/checklist system for retail jobs.

4. **Classic Reports (14 report types, 30+ saved).** JN's report builder is deep — 14 entity-specific report types with save/dashboard/export. RR needs basic reporting (revenue, pipeline, lead sources) but not the insurance-specific reports (supplement board, COC tasks, reinspection tracking, aged claims).

5. **EagleView/HOVER measurement integration.** RR already has Google Solar doing the same job (arguably better for retail instant quoting). These are more relevant for insurance scopes that need Xactimate-compatible measurements.

6. **SalesRabbit / door-to-door canvassing integration.** Specific to insurance restoration's door-knock sales model. Retail self-pay customers come through the website, Google Ads, and referrals — not door knocking after storms.

7. **Hail Recon / storm tracking.** Insurance restoration tool for identifying hail-damaged neighborhoods. Irrelevant to retail self-pay.

8. **Xactimate import.** Insurance claims estimation tool. Completely irrelevant to retail.

9. **AssistAI phone answering.** Useful but not critical. RR's chat widget and FAQ may serve the retail customer better than phone-based AI anyway.

10. **CompanyCam integration.** Useful for field documentation but RR could achieve the same with basic photo upload on job records.

11. **Forms system.** JN has field survey/inspection forms that submit to job records. Useful for standardization but not a retail blocker — RR's inspection is simpler (satellite measurement + site visit confirmation).

12. **Credit Memos.** An accounting construct for insurance reconciliation (supplement adjustments, partial refunds). Retail self-pay rarely needs credit memos — refunds can be handled through Stripe directly.

---

## 7. The $17,588/Month Question

Results Roofing LLC pays $17,588/month for JobNimbus. That's $211,056/year. The question is: how much of that spend serves the retail self-pay model that RR's custom platform targets?

### What the $17.5K buys

- **269 user seats** at $20-$55/seat across Sales (202), Admin (58), and Subcontractor (9) roles
- **Established tier CRM** with multi-location, deep customization, and full API access
- **Enterprise Engage** with 9 dedicated phone numbers and SMS capacity
- **Native payment processing** with 7 verified merchant locations
- **Mature automation engine** driving production workflows
- **21+ integrations** including QuickBooks, EagleView, CompanyCam, and the full API ecosystem

### How much is insurance-specific

A conservative estimate of JN feature surface area that exists primarily for insurance restoration:

- **Insurance pipeline stages** (~60% of the 25-stage board): Claim Filed, Adjuster Scheduled, Adjuster Approved, Reinspection Request, Reinspect Sent, Pre-Supp Requested, Pre-Supp Sent, Completion Docs Sent, Reinspect Denied — these are pure insurance workflow
- **Custom fields** (~80% insurance): Insurance Carrier, Claim #, Date of Loss, Reinspection dates, PRE-SUPP/POST-SUPP amounts and dates, COC flags
- **Automations** (~70% insurance): Collection tasks at 15/30/45/60 days, build scheduling filtered by "Residential Insurance" type — the observed automations are insurance-workflow-driven
- **Saved reports** (~60% insurance): Supplement Board, COC Tasks, Reinspection tracking, Adjuster Contact List, Aged Claims, May 2023 Storm
- **Email templates** (~50% insurance): Claims Process, Appraisal vs. Public Adjuster, COC, Post-Supp, Insurance Follow-up, FEMA
- **Integrations** (~30% insurance): Xactimate, Hail Recon, and several API integrations service the insurance side
- **Job Workflows** (~55% insurance): 5 of 9 workflows are insurance-specific (Residential Insurance, Commercial GC Insurance, plus 3 hidden market-specific ones)
- **Engage phone numbers** (shared): 9 numbers serve both insurance and retail, but the volume is predominantly insurance-driven

### What retail actually needs

A retail self-pay roofing operation needs:

1. **Lead capture and contact management** — website form, phone, referral tracking
2. **Quote generation** — satellite measurement, tier-based pricing, deposit calculation
3. **Pipeline tracking** — 6-8 stages: Lead, Quoted, Deposit Paid, Scheduled, In Progress, Punch List, Complete, Closed
4. **Scheduling** — inspection appointments, installation dates, crew assignment
5. **Invoicing and payment collection** — generate invoice, collect payment (CC/ACH/financing)
6. **Basic communication** — email confirmations, SMS appointment reminders, review requests
7. **Basic automation** — follow-up after quote, deposit confirmation, build day reminder, completion notification, review request
8. **Document management** — signed proposals, contracts, warranties, before/after photos
9. **Reporting** — revenue, pipeline, conversion rates, lead source ROI
10. **Team management** — admin, sales, installer roles with basic permissions

That's it. No claims, no adjusters, no supplements, no COC documents, no reinspection cycles, no Xactimate, no multi-party financial reconciliation.

### The strategic insight

Results Roofing's custom platform doesn't need to replicate JobNimbus. It needs to deliver a complete, streamlined retail workflow that makes the retail portion of the JN spend unnecessary. Even if RR LLC keeps JN for its insurance restoration business (which is likely — that workflow is deeply entrenched), pulling the retail operations onto a purpose-built platform would:

1. **Reduce JN seat count** — every retail-focused user moved off JN saves $55/month
2. **Provide a better retail experience** — no insurance clutter, streamlined pipeline, instant online quoting
3. **Create a productizable asset** — a retail roofing ops platform could serve other contractors, not just Results Roofing

The JN bill is inflated by insurance complexity that retail doesn't need. But RR can't capture that savings until the critical gaps (job details, invoicing, automation, team management, tasks) are closed.

---

## 8. Recommended Priority Stack

Build order optimized for "minimum viable retail ops platform" — the shortest path to running retail operations without JN.

1. **Fix Jobs/Pipeline data rendering.** The board reports 100 items but shows 0. This is likely a data sync or query bug. Until jobs display, nothing else matters. *(Hours, not days)*

2. **Build Job Detail View.** The single highest-value feature. Needs: overview panel (contact, address, status, dates, value), activity feed, linked estimate, linked invoice, notes, and status progression. This is the hub everything else connects to. Model it on the 10-stage retail pipeline already in Settings. *(1-2 weeks)*

3. **Build Invoice Creation + Stripe Payment Flow.** Connect estimates to invoices. "Convert to Invoice" on an estimate, generate payment link via Stripe, track payment status. This closes the revenue loop: quote -> estimate -> invoice -> payment. *(1 week)*

4. **Build Basic Task System.** Per-job task list with: title, assignee, due date, status (open/complete), type (inspection, installation, follow-up, collection). Display on job detail view and calendar. *(3-5 days)*

5. **Build Automation Engine (v1).** Start simple: event-based triggers (status change, record created) + time-based triggers (X days after date). Actions: create task, send email (via Resend), send SMS (via SignalWire — connect it). Conditions: status equals, type equals. This covers the core retail automations: follow-up after quote, build day reminder, review request. *(1-2 weeks)*

6. **Implement Team Roles + Permissions.** Define 3-4 roles (Admin, Sales, Installer, Read-Only). Gate features by role. Add team invite flow. This is prerequisite to handing logins to anyone. *(3-5 days)*

7. **Add Calendar Week/Day Views + Task Display.** Extend the existing calendar to show day and week views. Display tasks and appointments from the task system. This makes scheduling usable for daily ops. *(2-3 days)*

8. **Connect Remaining Integrations.** SignalWire (SMS sending), Cal.com (scheduling), Documenso (document signing). These are already listed in Settings — just need the connection wired up. *(2-3 days each)*

9. **Build Email/SMS Templates.** Template library with merge tags for: quote follow-up, deposit confirmation, build day schedule, completion notification, review request, warranty info. Use in automations and manual sending. *(3-5 days)*

10. **Add Document/Photo Upload.** Extend Documents section to support actual file upload and storage (Vercel Blob or S3). Enable per-job photo gallery. This rounds out the job record. *(3-5 days)*

11. **Consolidate Analytics.** Merge the three analytics pages into one Reports section with date range selector, export, and the existing charts. Kill the redundant hidden routes. *(2-3 days)*

12. **Add Custom Fields (v1).** Simple key-value custom fields on jobs and contacts. Text, date, dropdown types. This lets the ops team track retail-specific data without code changes. *(3-5 days)*

13. **Global Search.** Cross-module search (Ctrl+K pattern) across jobs, contacts, estimates, invoices. High quality-of-life improvement as data volume grows. *(2-3 days)*

14. **QuickBooks Integration.** Sync invoices and payments to QuickBooks. This is the bridge to accounting and removes a manual data entry burden. *(1 week)*

**Estimated total to minimum viable retail ops: 6-8 weeks of focused development (items 1-8).**
Items 9-14 bring it to competitive parity for the retail segment in 10-12 weeks total.
