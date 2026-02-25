# Ops Dashboard Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix broken UX, upgrade key pages from placeholder-quality to production-quality, and add missing contractor workflows.

**Architecture:** All changes are within the existing `/ops` dashboard (Next.js App Router pages + React Query hooks + GHL API). No new database tables needed. Some tasks are code-only fixes, others require Pencil wireframes before implementation.

**Tech Stack:** Next.js 14, TypeScript, React Query (TanStack), shadcn/ui, Tailwind CSS, GHL API

---

## Phase 1: Quick Fixes (Ship Immediately)

### Task 1: Fix Refresh Buttons Across All Pages

**Problem:** Refresh buttons call `refetch()` from React Query hooks but may silently fail (GHL 500s were just fixed) or lack visual feedback that anything happened.

**Files:**
- Modify: `src/app/ops/customers/page.tsx` (line ~148)
- Modify: `src/app/ops/inbox/page.tsx` (line ~150)
- Modify: `src/app/ops/automations/page.tsx` (line ~115)
- Modify: `src/app/ops/documents/page.tsx` (line ~230)
- Modify: `src/app/ops/invoices/page.tsx` (line ~128)
- Modify: `src/app/ops/estimates/page.tsx` (line ~102)
- Modify: `src/app/ops/materials/page.tsx` (line ~130)
- Modify: `src/app/ops/analytics/page.tsx` (line ~117)

**Step 1: Verify refresh works on deployed version**
Visit `app.resultsroofing.com/ops` in browser, click Refresh on each page. Note which ones actually fail vs which work now that GHL env vars are fixed.

**Step 2: Add toast feedback to all refresh buttons**
Every refresh button should show a brief toast ("Refreshed" or "Failed to refresh") so users know something happened. Pattern:

```tsx
import { toast } from 'sonner'; // or whatever toast lib is in use

async function handleRefresh() {
  try {
    await refetch();
    toast.success('Refreshed');
  } catch {
    toast.error('Failed to refresh');
  }
}
```

Replace all bare `onClick={() => refetch()}` with `onClick={handleRefresh}`.

**Step 3: Verify each page's refresh button works**
Test on local dev server for each of the 8 pages listed above.

**Step 4: Commit**
```bash
git add -A && git commit -m "fix(ops): add toast feedback to all refresh buttons"
```

---

### Task 2: Fix Customers Table Formatting

**Problem:** Column widths too wide, phone numbers not formatted as `xxx-xxx-xxxx`.

**Files:**
- Modify: `src/app/ops/customers/page.tsx` (lines ~232-280)

**Step 1: Add phone formatter utility**
Create a simple phone formatter (inline or in a utils file):

```tsx
function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  // Strip non-digits
  const digits = phone.replace(/\D/g, '');
  // Handle US numbers: strip leading 1 if 11 digits
  const d = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone; // Return original if not standard format
}
```

**Step 2: Apply to phone column**
Replace `{c.phone || '—'}` with `{formatPhone(c.phone)}`

**Step 3: Tighten column widths**
Add explicit widths to TableHead elements:

```tsx
<TableHead className="w-[200px]">Name</TableHead>
<TableHead className="w-[200px]">Email</TableHead>
<TableHead className="w-[120px]">Phone</TableHead>
<TableHead className="w-[140px]">Location</TableHead>
<TableHead className="w-[100px]">Added</TableHead>
<TableHead className="w-[80px]">Source</TableHead>
<TableHead className="w-10" />
```

**Step 4: Truncate long email addresses**
```tsx
<TableCell className="text-muted-foreground truncate max-w-[200px]">{c.email || '—'}</TableCell>
```

**Step 5: Verify visually, commit**
```bash
git commit -m "fix(ops): tighten customers table columns and format phone numbers"
```

---

### Task 3: Fix Inbox Contact Names ("Unknown")

**Problem:** All conversation contacts show as "Unknown" because GHL returns `fullName`/`contactName` at the top level, but our code expects `conv.contact?.name`.

**Root Cause:** GHL conversations search response returns:
```json
{"contactName": "Nauedd Vahidi", "fullName": "Nauedd Vahidi", "contactId": "oKO70fnV..."}
```
But our `Conversation` type expects: `contact?: { name?: string }` (nested object).

**Files:**
- Modify: `src/app/ops/inbox/page.tsx` (lines ~269, ~300)
- Modify: `src/types/ops.ts` (Conversation interface)
- Possibly modify: `src/hooks/ops/use-ops-queries.ts` (useOpsConversations, line ~279)

**Step 1: Update Conversation type to include top-level name fields**
In `src/types/ops.ts`, add to Conversation interface:
```tsx
export interface Conversation {
  id: string;
  contactId: string;
  contactName?: string;  // GHL returns this
  fullName?: string;     // GHL returns this
  contact?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  // ... rest of fields
}
```

**Step 2: Create name resolver for conversations**
In `src/app/ops/inbox/page.tsx`:
```tsx
function getConversationName(conv: Conversation): string {
  return conv.contactName || conv.fullName || conv.contact?.name || 'Unknown';
}
```

**Step 3: Replace all `conv.contact?.name || 'Unknown'` with `getConversationName(conv)`**

**Step 4: Verify inbox shows real names, commit**
```bash
git commit -m "fix(ops): resolve conversation contact names from GHL response fields"
```

---

## Phase 2: UX Upgrades (Medium Effort)

### Task 4: Blog Article → Full Floating Editor

**Problem:** Clicking a blog article opens a tiny "Edit Post" dialog with only Title/Excerpt/Author/Status fields. Should open a larger floating editor with the full article content editable.

**Files:**
- Modify: `src/app/ops/blog/page.tsx` (lines ~297-334, the edit dialog)
- Modify: `src/types/ops.ts` (BlogPost type — ensure `content` field exists)

**Step 1: Expand the Edit Post dialog**
Replace the small `<DialogContent>` with a larger slide-over or full-width dialog:

```tsx
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
```

**Step 2: Add content/body textarea**
Add a rich text area (or at minimum a large textarea) for the blog post body/content:

```tsx
<div className="space-y-2">
  <Label>Content</Label>
  <Textarea
    value={formContent}
    onChange={(e) => setFormContent(e.target.value)}
    placeholder="Write your blog post content..."
    className="min-h-[400px] font-mono text-sm"
  />
</div>
```

**Step 3: Add preview toggle (optional)**
Side-by-side markdown preview if content is markdown, or a simple preview pane.

**Step 4: Wire save to include content field**
Ensure `handleUpdate` sends the content field to the API.

**Step 5: Verify, commit**
```bash
git commit -m "feat(ops): expand blog editor to full-content floating panel"
```

---

### Task 5: Invoice/Estimate → Floating Document Preview

**Problem:** Clicking an invoice or estimate opens a small detail dialog. Should open a large floating preview that looks like the actual document.

**Files:**
- Modify: `src/app/ops/invoices/page.tsx` (lines ~281-307)
- Modify: `src/app/ops/estimates/page.tsx` (lines ~237-260)

**Step 1: Design document preview layout**
Create a shared document preview component:

```
src/components/features/ops/DocumentPreview.tsx
```

Layout: header (company logo, doc number, date) → customer info → line items table → totals → footer (terms, signature area).

**Step 2: Replace small dialog with large preview**
```tsx
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
  <DocumentPreview type="invoice" data={viewInvoice} />
</DialogContent>
```

**Step 3: Add print/download button**
```tsx
<Button onClick={() => window.print()}>Print / Download PDF</Button>
```

**Step 4: Verify, commit**
```bash
git commit -m "feat(ops): add document preview for invoices and estimates"
```

---

### Task 6: Automations → Premade Template Gallery

**Problem:** Current "New Automation" dialog has freeform Name/Trigger/Actions inputs. Contractors won't build their own automations. They need a gallery of premade automations they can activate with a toggle.

**Files:**
- Modify: `src/app/ops/automations/page.tsx` (entire page rework)
- Modify: `src/types/ops.ts` (OpsAutomation type — add `templateId`, `isTemplate` fields)

**Step 1: Define premade automation templates**
Create a templates constant with roofing-specific automations:

```tsx
const AUTOMATION_TEMPLATES = [
  {
    id: 'new-lead-followup',
    name: 'New Lead Follow-Up',
    description: 'Sends SMS + email within 5 minutes of new lead submission',
    trigger: 'New lead created',
    actions: ['Send welcome SMS', 'Send intro email', 'Notify team'],
    category: 'leads',
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    description: 'Sends reminders 24hr and 1hr before scheduled appointments',
    trigger: 'Appointment scheduled',
    actions: ['SMS reminder 24hr before', 'SMS reminder 1hr before'],
    category: 'scheduling',
  },
  {
    id: 'quote-followup',
    name: 'Quote Follow-Up',
    description: 'Follows up 3 days after sending a quote if no response',
    trigger: 'Quote sent + 3 days with no response',
    actions: ['Send follow-up email', 'Send follow-up SMS'],
    category: 'sales',
  },
  {
    id: 'review-request',
    name: 'Review Request',
    description: 'Asks for Google review 3 days after job completion',
    trigger: 'Job marked complete + 3 days',
    actions: ['Send review request SMS with link', 'Send review request email'],
    category: 'reputation',
  },
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    description: 'Sends reminder when balance is due in 3 days',
    trigger: 'Invoice due date - 3 days',
    actions: ['Send payment reminder email', 'Send payment reminder SMS'],
    category: 'billing',
  },
  {
    id: 'stale-lead-nurture',
    name: 'Stale Lead Nurture',
    description: 'Re-engages leads that haven\'t responded in 14 days',
    trigger: 'Lead inactive for 14 days',
    actions: ['Send nurture email', 'Move to nurture pipeline stage'],
    category: 'leads',
  },
  {
    id: 'job-completion-notification',
    name: 'Job Completion Notification',
    description: 'Notifies customer and sends warranty info when job is marked complete',
    trigger: 'Job status changed to complete',
    actions: ['Send completion email with warranty docs', 'Send satisfaction survey SMS'],
    category: 'operations',
  },
  {
    id: 'weather-alert',
    name: 'Storm Follow-Up',
    description: 'Sends check-in message to past customers after severe weather in their area',
    trigger: 'Weather alert in service area',
    actions: ['Send storm check-in SMS to customers in affected zip codes'],
    category: 'proactive',
  },
];
```

**Step 2: Replace freeform dialog with template gallery**
Replace the "New Automation" button with "Browse Automations" that opens a gallery grid. Each card shows name, description, category badge, and an Activate/Deactivate toggle.

**Step 3: Rework the page layout**
- Top: Stats cards (Active, Paused, Total runs) — keep these
- Middle: Grid of automation template cards
- Each card: name, description, status toggle (active/paused), run count
- No "create from scratch" option

**Step 4: Verify, commit**
```bash
git commit -m "feat(ops): replace custom automations with premade template gallery"
```

---

### Task 7: Materials → Rename + Material Catalogue Page

**Problem:** "Materials" should be "Material Orders." Need a separate "Material Catalogue" page with inventory management.

**Files:**
- Modify: `src/app/ops/layout.tsx` or sidebar component (rename nav item)
- Rename: `src/app/ops/materials/page.tsx` (this becomes Material Orders)
- Create: `src/app/ops/materials/catalogue/page.tsx` (new page)

**Step 1: Research real material order forms**
Before building, research what fields roofing contractors actually need on material orders. Key fields typically include:
- Supplier (ABC Supply, SRS Distribution, Beacon)
- Job/property address linked
- Line items with: product name, SKU, quantity, unit (bundle/roll/linear ft/each), unit price, total
- Delivery date requested, delivery instructions
- PO number, order status tracking
- Notes/special instructions

**Step 2: Rename nav item to "Material Orders"**
Update sidebar to show "Material Orders" instead of "Materials"

**Step 3: Enhance existing Material Orders page**
Add proper line-item form with roofing-specific fields (shingles, underlayment, flashing, ridge cap, etc.)

**Step 4: Create Material Catalogue page**
New page at `/ops/materials/catalogue` with:
- Searchable product database
- Categories: Shingles, Underlayment, Flashing, Ridge/Hip, Ventilation, Nails/Fasteners, Ice & Water Shield, Drip Edge
- Per-product: name, manufacturer, SKU, unit type, default price, supplier(s), in-stock status
- Supplier comparison (same product across suppliers)

**Step 5: Add nav item for Material Catalogue below Material Orders**

**Step 6: Verify, commit**
```bash
git commit -m "feat(ops): rename Materials to Material Orders, add Material Catalogue page"
```

---

## Phase 3: Design-First (Pencil Wireframes Required Before Code)

### Task 8: Documents → Template Grid

**Problem:** "+ New Document" opens a plain form. Should open a template gallery where contractors pick from premade document types, then fill in a guided form.

**Requires:** Wireframe each document template in Pencil before implementing.

**Document types to wireframe:**
1. **Deposit Authorization** — Customer authorizes deposit payment for project
2. **Roofing Contract** — Full project contract with scope, terms, warranty
3. **Change Order** — Amendments to original contract (scope/price changes)
4. **Invoice** — Billing document with line items
5. **Receipt** — Payment received confirmation
6. **Warranty Certificate** — Post-completion warranty document
7. **Inspection Report** — Pre/post roof inspection findings
8. **Insurance Supplement** — Additional work request to insurance company
9. **Scope of Work** — Detailed work breakdown for a project
10. **Lien Waiver** — Conditional/unconditional lien waiver

**Implementation after wireframes:**
- Replace "New Document" dialog with a template grid component
- Each template card: icon, title, description, "Use Template" button
- Clicking template opens a guided form pre-populated with that document type's required fields
- Generated document follows the Pencil wireframe layout

**Files (after wireframes complete):**
- Create: `src/components/features/ops/DocumentTemplateGrid.tsx`
- Create: `src/components/features/ops/templates/` (one component per template)
- Modify: `src/app/ops/documents/page.tsx` (replace create dialog)

---

## Execution Order

| Priority | Task | Type | Depends On |
|----------|------|------|------------|
| 1 | Task 1: Fix Refresh Buttons | Quick fix | Nothing |
| 2 | Task 3: Fix Inbox "Unknown" Names | Quick fix | Nothing |
| 3 | Task 2: Customers Table Formatting | Quick fix | Nothing |
| 4 | Task 4: Blog Full Editor | UX upgrade | Nothing |
| 5 | Task 5: Invoice/Estimate Preview | UX upgrade | Nothing |
| 6 | Task 6: Automations Templates | UX rework | Nothing |
| 7 | Task 7: Material Orders + Catalogue | New feature | Research |
| 8 | Task 8: Document Templates | New feature | Pencil wireframes |

Tasks 1-3 can be done in parallel. Tasks 4-6 can be done in parallel. Task 7 needs material order research first. Task 8 requires Pencil design session.

---

## Notes

- **Inbox "Unknown" contacts:** The GHL API returns `contactName` and `fullName` as top-level fields on conversations, not nested under `contact.name`. This is a data mapping issue, not a missing data issue.
- **Refresh buttons:** May already work now that GHL env vars were fixed (trailing `\n` removed 2026-02-25). Adding toast feedback regardless for UX clarity.
- **Document templates:** This is the most ambitious task. Wireframe all 10 templates in Pencil before writing any code. The guided form should make document creation feel like filling out a simple questionnaire, not a blank page.
- **Material Catalogue:** Research real supplier catalogs (ABC Supply, SRS, Beacon) to ensure our product categories and fields match what contractors actually order.
