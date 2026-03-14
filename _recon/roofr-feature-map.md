# Roofr Feature Map - Ops Dashboard Recon

> Research completed 2026-02-10. Delete `_recon/` folder when done.

## Feature Areas

### 1. CRM & Pipeline
- Kanban job board with drag-and-drop stages (customizable columns)
- Job cards with docs, tasks, notes, activity timeline, file uploads
- Contact/lead management with auto-capture
- Lead source tracking and speed-to-lead metrics
- Automations (triggers: proposal status, job stage, calendar → actions: email, SMS, task, stage change)
- Internal messaging on job cards, @mentions, task assignment

### 2. Estimating & Proposals
- Instant Estimator (embeddable widget, instant price ranges)
- Aerial measurement reports (ordered in-app, 2-24hr delivery)
- DIY measurement tool (draw-on-map)
- Proposal builder (auto-generated, Good/Better/Best, e-sign, branded templates, activity tracking)

### 3. Job Management
- Customizable pipeline stages with real-time revenue per stage
- Task management (due dates, reminders, auto-creation per stage)
- Calendar with Google Calendar 2-way sync
- Work orders (crew assignments, materials lists, scope docs)
- Job costing (profit analysis, change orders coming)

### 4. Invoicing & Payments
- Invoices created from signed proposals (auto-imported line items)
- Credit card (2.8% + $0.30) and ACH (0.5%, $40 cap)
- Deposit collection, overdue alerts, automated follow-ups
- PowerPay financing integration
- QuickBooks sync

### 5. Communication
- Unified inbox (email + SMS, auto-linked to jobs)
- Gmail 2-way sync
- SMS via dedicated company number
- Automated drip sequences with personalization tokens

### 6. Reporting & Analytics
- Performance dashboard: leads, speed-to-lead, close rates, revenue, avg job value
- Team leaderboard and rep-level metrics
- Lost job reasons analysis
- Lead source performance
- Gap: no custom report builder

### 7. Marketing
- Instant Estimator as lead gen (embeddable, QR codes, multi-channel)
- AI website builder with SEO
- Lead Scout integration for field sales

### 8. Integrations
- ABC Supply, QXO, SRS Distribution (real-time material pricing/ordering)
- CompanyCam, Google Calendar, Gmail, QuickBooks
- Zapier (8,000+ apps)

### 9. Documents
- E-signature proposals with activity tracking
- PDF Signer (upload any doc, add signature fields, track status)
- Work orders distributed to crews
- Material order history dashboard

### 10. Team Management
- Manager/Member roles (members see only assigned jobs)
- Up to 10 assignees per job, primary "Job Owner" for commissions
- Seat limits by plan

---

## Current Results Roofing Coverage

| Feature | Status | Priority |
|---------|--------|----------|
| Quote wizard | ✅ Have | Keep |
| Satellite measurements | ✅ Have (Google Solar) | Keep |
| CRM contacts | ⚠️ Basic | Expand |
| Pipeline/Kanban | ⚠️ Basic | Rebuild |
| Proposals w/ e-sign | ✅ Have | Keep |
| Unified inbox | ⚠️ Partial | Build |
| SMS | ⚠️ Adapter exists | Activate |
| Task management | ❌ Missing | Build |
| Job costing | ❌ Missing | Build |
| Calendar/scheduling | ⚠️ Partial | Expand |
| Invoicing | ❌ Missing | Build |
| Automations engine | ❌ Missing | Build |
| Reporting dashboard | ⚠️ Basic | Expand |
| Work orders | ❌ Missing | Build |
| Team management | ❌ Missing | Build |
| Material ordering | ❌ Missing | Build |

## Screenshots

Drop inspiration screenshots in `_recon/screenshots/`.
Name them descriptively: `roofr-kanban.png`, `inspo-inbox-layout.png`, etc.
