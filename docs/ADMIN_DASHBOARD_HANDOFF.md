# Admin Dashboard Planning Handoff

> **Purpose:** Brainstorm and define the complete vision for Results Roofing's internal admin dashboard
> **Tech Stack:** Next.js 14 + shadcn/ui blocks + Clerk Organizations + existing Neon DB

---

## Executive Summary

Results Roofing needs a comprehensive back-office system to manage the full customer lifecycle from lead capture through project completion and ongoing customer relationships. This document outlines all proposed modules, user roles, and integration points for discussion.

---

## 1. Proposed Dashboard Modules

### 1.1 Operations Hub (Home Dashboard)

**Purpose:** At-a-glance view of business health and urgent items

| Widget | Description |
|--------|-------------|
| **Today's Schedule** | Installation crews, appointments, deliveries |
| **Revenue Snapshot** | MTD deposits, outstanding balances, collected |
| **Pipeline Summary** | Leads → Quotes → Scheduled → In Progress → Complete |
| **Action Required** | Unsigned contracts, failed payments, support tickets |
| **Weather Alerts** | 7-day forecast for service areas (impacts scheduling) |
| **Team Activity** | Recent actions by staff members |

**shadcn blocks to consider:**
- `dashboard-01` through `dashboard-07` from shadcn/ui blocks
- Stats cards, charts (recharts already installed), activity feeds

---

### 1.2 Leads Module

**Purpose:** Capture, qualify, and convert leads

| Feature | Description |
|---------|-------------|
| **Lead Inbox** | All new leads with source attribution |
| **Lead Scoring** | Auto-score based on property value, urgency, location |
| **Lead Assignment** | Manual or round-robin to sales reps |
| **Communication Log** | Calls, emails, SMS history |
| **Lead Sources** | Track: website, referral, paid ads, partners |
| **Follow-up Reminders** | Automated task creation for sales |
| **Bulk Actions** | Mass email, reassign, archive |

**Statuses:** `new` → `contacted` → `qualified` → `quoted` → `won` | `lost` | `unqualified`

**Questions to discuss:**
- Do we need lead capture forms beyond the main quote flow?
- Integration with paid ad platforms (Google Ads, Meta) for attribution?
- What qualifies a "hot" vs "cold" lead?

---

### 1.3 Quotes Module

**Purpose:** Manage all quotes from creation through conversion

| Feature | Description |
|---------|-------------|
| **Quote List** | Filterable table with status, value, age |
| **Quote Detail** | Full breakdown: measurements, materials, pricing |
| **Quote Builder** | Manual quote creation for phone/in-person sales |
| **Pricing Adjustments** | Discounts, add-ons, custom line items |
| **Quote Comparison** | Side-by-side tier comparison view |
| **Expiration Management** | Auto-expire, extend, or archive |
| **Quote PDF Export** | Branded PDF generation |
| **Quote Sharing** | Generate customer-facing links |

**Statuses:** `draft` → `sent` → `viewed` → `selected` → `scheduled` → `converted` | `expired` | `declined`

**Questions to discuss:**
- Should sales reps be able to override pricing?
- Approval workflow for large discounts?
- Quote templates for common scenarios?

---

### 1.4 Orders & Projects Module

**Purpose:** Track jobs from deposit through completion

| Feature | Description |
|---------|-------------|
| **Project Board** | Kanban view: Deposit Paid → Materials Ordered → Scheduled → In Progress → QA → Complete |
| **Project Timeline** | Gantt-style view of all active jobs |
| **Project Detail** | Customer info, crew assignment, materials, photos, notes |
| **Crew Assignment** | Assign installation teams to projects |
| **Material Tracking** | What's ordered, delivered, on-site |
| **Photo Documentation** | Before/during/after photos |
| **Customer Updates** | Send status updates to customer portal |
| **Completion Checklist** | QA sign-off, final walkthrough, cleanup |

**Statuses:** `deposit_paid` → `materials_ordered` → `materials_delivered` → `scheduled` → `in_progress` → `quality_check` → `complete` → `warranty_active`

**Questions to discuss:**
- Do crews use mobile app or just office manages?
- Photo upload from field?
- Integration with crew scheduling software?

---

### 1.5 Payments & Invoicing Module

**Purpose:** Track all money in and out

| Feature | Description |
|---------|-------------|
| **Deposits** | All $500 deposits with status |
| **Invoices** | Generate and send invoices for balance due |
| **Payment History** | Full ledger per customer |
| **Payment Links** | Generate Stripe payment links |
| **Refunds** | Process and track refunds |
| **Financing Tracking** | Wisetack loan status and payouts |
| **Accounts Receivable** | Aging report, overdue alerts |
| **Revenue Reports** | Daily/weekly/monthly revenue |

**Invoice Types:**
- Deposit invoice (auto-generated)
- Progress invoice (optional mid-project)
- Final invoice (balance due)
- Warranty invoice (extended warranty upsell)

**Questions to discuss:**
- Net terms for any customers (Net 30)?
- Integration with accounting software (QuickBooks, Xero)?
- Commission tracking for sales reps?

---

### 1.6 Customer Management (CRM)

**Purpose:** 360° view of every customer relationship

| Feature | Description |
|---------|-------------|
| **Customer Profile** | Contact info, properties, lifetime value |
| **Property History** | All quotes/jobs for a property |
| **Communication Timeline** | All emails, calls, SMS, portal activity |
| **Documents** | Contracts, invoices, warranties, photos |
| **Notes** | Internal notes and tags |
| **Referral Tracking** | Who referred whom, referral bonuses |
| **Customer Tags** | VIP, repeat customer, difficult, etc. |
| **Merge Duplicates** | Combine duplicate customer records |

**Customer Types:**
- `lead` - Not yet converted
- `customer` - Has at least one completed job
- `repeat` - Multiple jobs
- `referrer` - Has referred others

**Questions to discuss:**
- Sync with JobNimbus or replace it?
- Customer satisfaction surveys?
- Loyalty/referral program structure?

---

### 1.7 Suppliers & Inventory

**Purpose:** Manage material suppliers and track inventory

| Feature | Description |
|---------|-------------|
| **Supplier Directory** | Contact info, terms, lead times |
| **Product Catalog** | Materials with SKUs, costs, markup |
| **Price Lists** | Supplier pricing by tier/volume |
| **Purchase Orders** | Generate POs for jobs |
| **Delivery Tracking** | Expected delivery dates |
| **Cost Tracking** | Actual vs estimated material costs |
| **Supplier Performance** | On-time delivery %, quality issues |

**Material Categories:**
- Shingles (by brand, color, warranty tier)
- Underlayment
- Flashing & trim
- Ventilation
- Gutters (if offered)
- Misc supplies

**Questions to discuss:**
- Multiple suppliers for same materials?
- Minimum order quantities?
- Warehouse/storage tracking needed?

---

### 1.8 Product Catalog (Customer-Facing)

**Purpose:** Manage what customers see in the quote flow

| Feature | Description |
|---------|-------------|
| **Pricing Tiers** | Good/Better/Best configuration |
| **Materials Per Tier** | What's included in each package |
| **Warranty Options** | Warranty terms per tier |
| **Add-Ons** | Optional upgrades (gutters, skylights, etc.) |
| **Pricing Rules** | Base rates, per-sqft pricing, complexity factors |
| **Regional Pricing** | Price adjustments by market |
| **Seasonal Pricing** | Promotional pricing periods |

**Questions to discuss:**
- How often do prices change?
- Approval workflow for price changes?
- A/B testing different pricing?

---

### 1.9 Content Management (Blog/Marketing)

**Purpose:** Manage blog posts and marketing content

| Feature | Description |
|---------|-------------|
| **Blog Posts** | Create, edit, schedule, publish |
| **Rich Text Editor** | WYSIWYG with image uploads |
| **Categories & Tags** | Organize content |
| **SEO Settings** | Meta titles, descriptions, OG images |
| **Draft/Publish Workflow** | Save drafts, schedule publishing |
| **Author Management** | Assign authors to posts |
| **Analytics** | Page views, time on page, conversions |

**Content Types:**
- Blog posts (SEO, educational)
- Case studies (before/after projects)
- FAQs
- Service area pages
- Landing pages (for ad campaigns)

**Questions to discuss:**
- Who writes content? Staff or contractors?
- Approval workflow before publishing?
- Integration with social media auto-posting?

---

### 1.10 Financing Management

**Purpose:** Track all financing applications and loans

| Feature | Description |
|---------|-------------|
| **Applications** | All Wisetack pre-qual attempts |
| **Approval Status** | Pending, approved, declined, expired |
| **Loan Details** | Amount, term, monthly payment |
| **Funding Status** | When Wisetack funds the merchant |
| **Customer Communication** | Remind customers to complete application |

**Questions to discuss:**
- Multiple financing providers (Wisetack + Hearth)?
- In-house financing for VIP customers?
- Financing approval rate metrics?

---

### 1.11 Reporting & Analytics

**Purpose:** Business intelligence and KPIs

| Report | Description |
|--------|-------------|
| **Sales Pipeline** | Funnel conversion rates |
| **Revenue** | By period, source, rep, region |
| **Quote Performance** | Win rate, average value, time to close |
| **Customer Acquisition Cost** | By source/channel |
| **Project Profitability** | Revenue vs actual costs per job |
| **Crew Performance** | Jobs completed, quality scores |
| **Supplier Analysis** | Cost trends, delivery performance |

**Dashboard KPIs:**
- Lead → Quote conversion rate
- Quote → Sale conversion rate
- Average job value
- Average days to close
- Customer satisfaction score
- Repeat customer rate

---

### 1.12 Settings & Configuration

| Setting | Description |
|---------|-------------|
| **Company Profile** | Business info, logo, contact |
| **Service Areas** | ZIP codes, cities, states served |
| **Business Hours** | Scheduling availability |
| **Email Templates** | Customize transactional emails |
| **SMS Templates** | Customize text messages |
| **Notification Preferences** | Who gets notified of what |
| **Integrations** | API keys, webhook URLs |
| **Audit Log** | Track all admin actions |

---

## 2. User Roles & Permissions (Clerk Organizations)

### 2.1 Proposed Role Hierarchy

```
Organization (Results Roofing)
├── Owner (full access)
├── Admin (nearly full access)
├── Sales Manager
│   └── Sales Rep
├── Operations Manager
│   └── Project Coordinator
├── Finance Manager
│   └── Bookkeeper
└── Marketing Manager
    └── Content Writer
```

### 2.2 Role Definitions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Owner** | Business owner | Everything + billing, delete org |
| **Admin** | Office manager / IT | Everything except billing |
| **Sales Manager** | Manages sales team | All leads, quotes, customers, sales reports, manage sales reps |
| **Sales Rep** | Individual salesperson | Own leads, create quotes, view customers |
| **Operations Manager** | Manages projects/crews | All projects, scheduling, crews, suppliers |
| **Project Coordinator** | Day-to-day project mgmt | Assigned projects, update status |
| **Finance Manager** | Accounting oversight | All payments, invoices, reports |
| **Bookkeeper** | Data entry | Create invoices, record payments |
| **Marketing Manager** | Content & campaigns | Blog, analytics, marketing reports |
| **Content Writer** | Blog author | Create/edit drafts, no publish |

### 2.3 Permission Matrix (Draft)

| Module | Owner | Admin | Sales Mgr | Sales Rep | Ops Mgr | Proj Coord | Finance Mgr | Bookkeeper | Mktg Mgr |
|--------|-------|-------|-----------|-----------|---------|------------|-------------|------------|----------|
| Dashboard | ✅ | ✅ | ✅ | Limited | ✅ | Limited | ✅ | Limited | Limited |
| Leads | ✅ | ✅ | ✅ | Own | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quotes | ✅ | ✅ | ✅ | Own | View | View | View | View | ❌ |
| Orders | ✅ | ✅ | View | View | ✅ | Assigned | View | View | ❌ |
| Payments | ✅ | ✅ | View | ❌ | View | ❌ | ✅ | ✅ | ❌ |
| Customers | ✅ | ✅ | ✅ | Own | View | View | View | View | ❌ |
| Suppliers | ✅ | ✅ | ❌ | ❌ | ✅ | View | View | ❌ | ❌ |
| Catalog | ✅ | ✅ | View | View | View | View | View | ❌ | ❌ |
| Blog | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reports | ✅ | ✅ | Sales | ❌ | Ops | ❌ | Finance | ❌ | Mktg |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Users | ✅ | ✅ | Team | ❌ | Team | ❌ | Team | ❌ | Team |

### 2.4 Clerk Implementation Notes

```typescript
// Clerk organization metadata structure
interface OrgMetadata {
  plan: 'starter' | 'professional' | 'enterprise';
  features: string[];
  limits: {
    users: number;
    projects: number;
  };
}

// Clerk user public metadata
interface UserPublicMetadata {
  role: Role;
  department: 'sales' | 'operations' | 'finance' | 'marketing';
  managerId?: string;
  hireDate: string;
}

// Custom claims for session
interface SessionClaims {
  org_role: Role;
  org_permissions: string[];
}
```

**Clerk Features to Enable:**
- Organizations (multi-tenant if needed later)
- Custom roles (beyond basic admin/member)
- Organization invitations
- Role-based UI rendering
- API route protection by role

---

## 3. Technical Architecture

### 3.1 Proposed File Structure

```
src/app/admin/
├── layout.tsx                 # Admin layout with sidebar
├── page.tsx                   # Dashboard home
├── leads/
│   ├── page.tsx              # Lead list
│   └── [id]/page.tsx         # Lead detail
├── quotes/
│   ├── page.tsx              # Quote list
│   ├── new/page.tsx          # Manual quote builder
│   └── [id]/page.tsx         # Quote detail
├── orders/
│   ├── page.tsx              # Order/project list (table + kanban)
│   └── [id]/page.tsx         # Project detail
├── payments/
│   ├── page.tsx              # Payment list
│   ├── invoices/page.tsx     # Invoice management
│   └── deposits/page.tsx     # Deposit tracking
├── customers/
│   ├── page.tsx              # Customer list
│   └── [id]/page.tsx         # Customer 360 view
├── suppliers/
│   ├── page.tsx              # Supplier list
│   └── [id]/page.tsx         # Supplier detail
├── catalog/
│   ├── page.tsx              # Product catalog
│   └── pricing/page.tsx      # Pricing configuration
├── blog/
│   ├── page.tsx              # Post list
│   ├── new/page.tsx          # New post editor
│   └── [slug]/edit/page.tsx  # Edit post
├── reports/
│   ├── page.tsx              # Report hub
│   ├── sales/page.tsx        # Sales reports
│   ├── operations/page.tsx   # Ops reports
│   └── finance/page.tsx      # Finance reports
├── settings/
│   ├── page.tsx              # Settings hub
│   ├── company/page.tsx      # Company profile
│   ├── team/page.tsx         # User management
│   ├── integrations/page.tsx # API connections
│   └── notifications/page.tsx # Notification prefs
└── api/
    └── admin/                # Admin-only API routes
```

### 3.2 shadcn/ui Components to Install

```bash
# Core components
npx shadcn@latest add table data-table
npx shadcn@latest add card chart
npx shadcn@latest add tabs sheet
npx shadcn@latest add command
npx shadcn@latest add calendar
npx shadcn@latest add avatar badge
npx shadcn@latest add sidebar

# Form components
npx shadcn@latest add form input textarea
npx shadcn@latest add select combobox
npx shadcn@latest add checkbox radio-group switch
npx shadcn@latest add date-picker

# Feedback
npx shadcn@latest add alert toast sonner
npx shadcn@latest add skeleton progress

# Blocks (pre-built layouts)
# Check: https://ui.shadcn.com/blocks
```

### 3.3 Database Schema Additions Needed

```sql
-- New tables to consider
suppliers
supplier_contacts
purchase_orders
purchase_order_items
inventory_items
blog_posts
blog_categories
user_activity_log
notification_preferences
email_templates
sms_templates
```

---

## 4. Implementation Phases (Suggested)

### Phase 1: Foundation (Week 1-2)
- [ ] Clerk Organizations setup
- [ ] Role-based middleware
- [ ] Admin layout with sidebar navigation
- [ ] Dashboard home with basic stats

### Phase 2: Core Operations (Week 3-4)
- [ ] Leads module (list, detail, status updates)
- [ ] Quotes module (list, detail, manual creation)
- [ ] Orders module (list, kanban, detail)

### Phase 3: Finance (Week 5)
- [ ] Payments module (deposits, history)
- [ ] Basic invoicing
- [ ] Revenue reports

### Phase 4: CRM (Week 6)
- [ ] Customer profiles
- [ ] Communication timeline
- [ ] Document management

### Phase 5: Extended Features (Week 7-8)
- [ ] Suppliers & inventory
- [ ] Product catalog management
- [ ] Blog CMS

### Phase 6: Polish (Week 9-10)
- [ ] Advanced reporting
- [ ] Notification system
- [ ] Audit logging
- [ ] Mobile responsiveness

---

## 5. Open Questions for Discussion

### Business Questions
1. **JobNimbus:** Replace entirely or sync with admin dashboard?
2. **Multi-location:** Will there ever be multiple offices/franchises?
3. **Crew management:** Do crews need mobile access?
4. **Commissions:** How are sales rep commissions calculated?
5. **Referral program:** Structure and tracking needs?

### Technical Questions
1. **Real-time updates:** WebSockets for live dashboard updates?
2. **Offline support:** PWA for field workers?
3. **Mobile app:** Separate mobile app or responsive web?
4. **Data retention:** How long to keep old quotes/leads?
5. **Backup/export:** Customer data export requirements?

### Design Questions
1. **Branding:** Same blue as customer site or different admin theme?
2. **Dark mode:** Support dark mode for admin?
3. **Accessibility:** WCAG compliance level?

---

## 6. Competitive Reference

### What other roofing software offers:
- **JobNimbus:** CRM, estimating, scheduling, invoicing
- **AccuLynx:** Similar + aerial measurements
- **Roofr:** Measurements + instant estimates
- **ServiceTitan:** Full field service management

### Our differentiation:
- Modern UI (not legacy software feel)
- Self-service customer portal
- Instant online quotes
- Seamless financing integration
- Built-in marketing (blog, SEO)

---

## 7. Next Steps

1. **Review this document** and mark up questions/changes
2. **Prioritize modules** - What's MVP vs nice-to-have?
3. **Define roles** - Confirm the role hierarchy makes sense
4. **Design review** - Look at shadcn blocks and pick favorites
5. **Start Phase 1** - Clerk org setup + admin layout

---

## Appendix: Existing Database Schema

Current tables that the admin will interact with:
- `leads` - Lead information
- `quotes` - Quote data
- `quote_drafts` - Saved progress
- `orders` - Converted quotes
- `payments` - Payment records
- `contracts` - E-signature contracts
- `appointments` - Scheduled installations
- `pricing_tiers` - Good/Better/Best config
- `measurements` - Roof measurements
- `webhook_events` - Integration audit trail

---

*Document created: January 31, 2026*
*For discussion in next planning session*
