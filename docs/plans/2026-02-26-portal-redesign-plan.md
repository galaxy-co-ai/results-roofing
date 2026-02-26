# Portal Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the existing customer portal with a research-driven, phase-aware redesign that adapts content across 5 lifecycle stages (Pre-Quote → Quoted → Contracted → In-Progress → Complete).

**Architecture:** Component-driven React (Next.js 14 App Router) with a phase detection hook that maps database state to UI phases. Each portal page renders different content based on the detected phase. Shared layout wraps all pages with a push-sidebar (desktop) or bottom-tab-bar (mobile). CSS Modules + Tailwind + semantic CSS custom properties for styling.

**Tech Stack:** Next.js 14, TypeScript, React Query, Clerk auth, Drizzle ORM, Neon Postgres, CSS Modules, Tailwind CSS, Lucide icons.

**Design Reference:** `designs/portal.pen` (wireframes), `docs/plans/2026-02-26-portal-redesign-design.md` (spec), `designs/brand.md` (tokens).

---

## Task 1: Portal Phase Detection System

**Why:** Every component in the redesign adapts based on which lifecycle phase the customer is in. This is the foundation all pages depend on.

**Files:**
- Create: `src/lib/portal/phases.ts`
- Create: `src/lib/portal/phases.test.ts`
- Create: `src/hooks/usePortalPhase.ts`

### Step 1: Define phase types and detection logic

Create `src/lib/portal/phases.ts`:

```typescript
import type { Order, PendingQuote, Contract } from '@/hooks/useOrders';

export enum PortalPhase {
  PRE_QUOTE = 1,    // No quote record
  QUOTED = 2,       // Quote exists, no signed contract
  CONTRACTED = 3,   // Contract signed + deposit paid
  IN_PROGRESS = 4,  // Installation underway (shell only)
  COMPLETE = 5,     // Project finished (shell only)
}

export interface PhaseContext {
  phase: PortalPhase;
  order: Order | null;
  quote: PendingQuote | null;
  hasSignedContract: boolean;
  hasDeposit: boolean;
  checklistStep: number; // 1-5, which step is active
}

/**
 * Maps database state to portal phase.
 *
 * Phase 1: No orders AND no pending quotes
 * Phase 2: Has pending quote OR order with status 'pending' (no signed contract)
 * Phase 3: Order with status 'deposit_paid' or 'scheduled'
 * Phase 4: Order with status 'in_progress'
 * Phase 5: Order with status 'completed'
 */
export function detectPhase(
  orders: Order[],
  pendingQuotes: PendingQuote[],
  contracts: Contract[],
): PhaseContext {
  // Check most advanced order first
  const order = orders[0] ?? null;
  const quote = pendingQuotes[0] ?? null;
  const hasSignedContract = contracts.some(c => c.status === 'signed');
  const hasDeposit = order?.status === 'deposit_paid'
    || order?.status === 'scheduled'
    || order?.status === 'in_progress'
    || order?.status === 'completed';

  if (order?.status === 'completed') {
    return { phase: PortalPhase.COMPLETE, order, quote, hasSignedContract, hasDeposit, checklistStep: 5 };
  }

  if (order?.status === 'in_progress') {
    return { phase: PortalPhase.IN_PROGRESS, order, quote, hasSignedContract, hasDeposit, checklistStep: 5 };
  }

  if (hasDeposit && hasSignedContract) {
    return { phase: PortalPhase.CONTRACTED, order, quote, hasSignedContract, hasDeposit, checklistStep: 5 };
  }

  if (order || quote) {
    return { phase: PortalPhase.QUOTED, order, quote, hasSignedContract, hasDeposit, checklistStep: 2 };
  }

  return { phase: PortalPhase.PRE_QUOTE, order: null, quote: null, hasSignedContract: false, hasDeposit: false, checklistStep: 1 };
}
```

### Step 2: Write tests for phase detection

Create `src/lib/portal/phases.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { detectPhase, PortalPhase } from './phases';

describe('detectPhase', () => {
  it('returns PRE_QUOTE when no orders or quotes exist', () => {
    const result = detectPhase([], [], []);
    expect(result.phase).toBe(PortalPhase.PRE_QUOTE);
    expect(result.checklistStep).toBe(1);
  });

  it('returns QUOTED when a pending quote exists', () => {
    const quote = { id: 'q1', status: 'measured', address: '123 Main', city: 'Austin', state: 'TX', zip: '78701', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, scheduledDate: null, createdAt: '', updatedAt: '' };
    const result = detectPhase([], [quote], []);
    expect(result.phase).toBe(PortalPhase.QUOTED);
    expect(result.checklistStep).toBe(2);
  });

  it('returns QUOTED when order exists but no signed contract', () => {
    const order = { id: 'o1', status: 'pending', confirmationNumber: 'RR-001', propertyAddress: '123 Main', propertyCity: 'Austin', propertyState: 'TX', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, balanceDue: 12000, scheduledStartDate: null, createdAt: '', updatedAt: '' };
    const result = detectPhase([order], [], []);
    expect(result.phase).toBe(PortalPhase.QUOTED);
  });

  it('returns CONTRACTED when deposit paid and contract signed', () => {
    const order = { id: 'o1', status: 'deposit_paid', confirmationNumber: 'RR-001', propertyAddress: '123 Main', propertyCity: 'Austin', propertyState: 'TX', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, balanceDue: 12000, scheduledStartDate: null, createdAt: '', updatedAt: '' };
    const contract = { id: 'c1', status: 'signed', signedAt: '2026-01-01' };
    const result = detectPhase([order], [], [contract]);
    expect(result.phase).toBe(PortalPhase.CONTRACTED);
    expect(result.checklistStep).toBe(5);
  });

  it('returns IN_PROGRESS for active installation', () => {
    const order = { id: 'o1', status: 'in_progress', confirmationNumber: 'RR-001', propertyAddress: '123 Main', propertyCity: 'Austin', propertyState: 'TX', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, balanceDue: 12000, scheduledStartDate: '2026-03-15', createdAt: '', updatedAt: '' };
    const contract = { id: 'c1', status: 'signed', signedAt: '2026-01-01' };
    const result = detectPhase([order], [], [contract]);
    expect(result.phase).toBe(PortalPhase.IN_PROGRESS);
  });

  it('returns COMPLETE for finished project', () => {
    const order = { id: 'o1', status: 'completed', confirmationNumber: 'RR-001', propertyAddress: '123 Main', propertyCity: 'Austin', propertyState: 'TX', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, balanceDue: 0, scheduledStartDate: '2026-03-15', createdAt: '', updatedAt: '' };
    const contract = { id: 'c1', status: 'signed', signedAt: '2026-01-01' };
    const result = detectPhase([order], [], [contract]);
    expect(result.phase).toBe(PortalPhase.COMPLETE);
  });
});
```

### Step 3: Run tests

```bash
npx vitest run src/lib/portal/phases.test.ts
```

Expected: All 6 tests pass.

### Step 4: Create the React hook

Create `src/hooks/usePortalPhase.ts`:

```typescript
'use client';

import { useMemo } from 'react';
import { useOrders, useOrderDetails } from './useOrders';
import { detectPhase, type PhaseContext } from '@/lib/portal/phases';

export function usePortalPhase(email: string | null) {
  const { data: ordersData, isLoading: ordersLoading } = useOrders(email);
  const currentOrderId = ordersData?.orders[0]?.id ?? null;
  const { data: details, isLoading: detailsLoading } = useOrderDetails(currentOrderId);

  const phaseContext = useMemo<PhaseContext | null>(() => {
    if (!ordersData) return null;
    return detectPhase(
      ordersData.orders,
      ordersData.pendingQuotes,
      details?.contracts ?? [],
    );
  }, [ordersData, details]);

  return {
    phase: phaseContext,
    isLoading: ordersLoading || detailsLoading,
    order: phaseContext?.order ?? null,
    quote: phaseContext?.quote ?? null,
    details,
  };
}
```

### Step 5: Commit

```bash
git add src/lib/portal/ src/hooks/usePortalPhase.ts
git commit -m "feat(portal): add phase detection system for portal redesign"
```

---

## Task 2: Portal Layout Shell

**Why:** The new layout replaces the old sidebar-overlay pattern with a push-sidebar (desktop) and bottom-tab-bar (mobile). Every page lives inside this shell.

**Files:**
- Rewrite: `src/app/portal/layout.tsx`
- Rewrite: `src/app/portal/layout.module.css`
- Create: `src/components/features/portal/PortalSidebarV2/PortalSidebarV2.tsx`
- Create: `src/components/features/portal/PortalSidebarV2/PortalSidebarV2.module.css`
- Create: `src/components/features/portal/PortalHeader/PortalHeader.tsx`
- Create: `src/components/features/portal/PortalHeader/PortalHeader.module.css`
- Create: `src/components/features/portal/BottomTabBar/BottomTabBar.tsx`
- Create: `src/components/features/portal/BottomTabBar/BottomTabBar.module.css`
- Update: `src/components/features/portal/index.ts`

### Step 1: Build the sidebar

`PortalSidebarV2.tsx` — Key specs from design doc:
- Always collapsed (72px icon-only)
- `border-radius: 0 12px 12px 0` (rounded top-right, bottom-right)
- 16px vertical inset from screen edges (total height = viewport - 32px, centered)
- Push layout — content uses `margin-left: 72px`, sidebar is `position: fixed`
- 4 nav items: My Project (FolderKanban), Payments (CreditCard), Documents (FileText), Schedule (Calendar)
- Logo links to `/portal`, not marketing site
- No user avatar — avatar is in the Header
- Active state: `var(--rr-color-surface-selected)` background + `var(--rr-color-blue)` icon
- Hidden on mobile (≤768px) — replaced by BottomTabBar

Nav items:
```typescript
const NAV_ITEMS = [
  { id: 'project', label: 'My Project', href: '/portal', icon: FolderKanban },
  { id: 'payments', label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { id: 'documents', label: 'Documents', href: '/portal/documents', icon: FileText },
  { id: 'schedule', label: 'Schedule', href: '/portal/schedule', icon: Calendar },
];
```

CSS critical properties:
```css
.sidebar {
  position: fixed;
  left: 0;
  top: 16px;
  bottom: 16px;
  width: 72px;
  border-radius: 0 12px 12px 0;
  background: var(--rr-color-bg-secondary);
  border-right: 1px solid var(--rr-color-border-default);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 8px;
  z-index: 10;
}

@media (max-width: 768px) {
  .sidebar { display: none; }
}
```

### Step 2: Build the header

`PortalHeader.tsx` — Reusable across all pages:
- Props: `title: string`
- Left: page title (24px mobile, 28px desktop, weight 700)
- Right: Help button (bordered, message-circle icon + "Help" label) + user avatar (32px circle, initials from Clerk)
- 2px `var(--rr-color-blue)` accent underline below the header row
- Uses Clerk's `useUser()` for initials, with fallback

```typescript
interface PortalHeaderProps {
  title: string;
}
```

### Step 3: Build the bottom tab bar

`BottomTabBar.tsx`:
- Visible only on mobile (≤768px)
- Fixed to bottom of screen
- 4 items matching sidebar nav
- Active state with blue icon + label
- Safe area inset for notched phones

### Step 4: Rewrite the layout

`layout.tsx` — New structure:
```tsx
<ClerkProvider>
  <div className={styles.portalLayout}>
    <PortalSidebarV2 />
    <main className={styles.mainContent}>
      {children}
    </main>
    <BottomTabBar />
  </div>
</ClerkProvider>
```

`layout.module.css`:
```css
.portalLayout {
  min-height: 100vh;
  background: var(--rr-color-bg-primary);
}

.mainContent {
  margin-left: 72px;
  padding: 32px 40px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .mainContent {
    margin-left: 0;
    padding: 16px;
    padding-bottom: 80px; /* space for bottom tab bar */
  }
}
```

### Step 5: Update barrel export

Add new components to `src/components/features/portal/index.ts`.

### Step 6: Verify layout renders

```bash
npm run dev
```
Visit `/portal` — should see icon sidebar on left, content area, bottom tabs on mobile. Header will be added per-page in later tasks.

### Step 7: Commit

```bash
git add src/app/portal/layout.tsx src/app/portal/layout.module.css src/components/features/portal/
git commit -m "feat(portal): new layout shell with push-sidebar, header, and bottom tabs"
```

---

## Task 3: Project Timeline Component

**Why:** The timeline is the primary progress indicator across the customer journey. Used on every My Project page variant.

**Files:**
- Create: `src/components/features/portal/ProjectTimeline/ProjectTimeline.tsx`
- Create: `src/components/features/portal/ProjectTimeline/ProjectTimeline.module.css`

### Specs

- 6 stages: Quote → Contract → Consultation → Deposit → Install → Complete
- Horizontal bar on desktop, compact horizontal (scrollable if needed) on mobile
- Stage states: `completed` (green dot + line), `current` (blue dot), `upcoming` (gray dot + line)
- Props: `currentStage: number` (1-6, maps to which stage is active)
- Completed stages: filled green dot (`var(--rr-color-success)`), green connecting line
- Current stage: filled blue dot (`var(--rr-color-blue)`), bold label
- Upcoming: gray dot (`var(--rr-color-border-default)`), muted label

```typescript
interface ProjectTimelineProps {
  currentStage: number; // 1=Quote, 2=Contract, 3=Consultation, 4=Deposit, 5=Install, 6=Complete
}

const STAGES = ['Quote', 'Contract', 'Consult', 'Deposit', 'Install', 'Complete'];
```

Each stage renders: `[dot] [connecting-line] [dot]...` with labels below.

### Commit

```bash
git commit -m "feat(portal): add ProjectTimeline component with 6-stage tracker"
```

---

## Task 4: Onboarding Checklist Components

**Why:** The checklist drives user action through the lifecycle. Each step type (active, completed, locked) has distinct visual treatment.

**Files:**
- Create: `src/components/features/portal/Checklist/ChecklistStep.tsx`
- Create: `src/components/features/portal/Checklist/Checklist.tsx`
- Create: `src/components/features/portal/Checklist/Checklist.module.css`

### Specs

**ChecklistStep** — 3 variants via `status` prop:

1. **Active:** Card with 2px `var(--rr-color-blue)` border. Left zone: number badge (blue circle) + title + description. Right zone: CTA text-link. Full-width on mobile (CTA below content).

2. **Completed:** Compact row. Green checkmark icon + title + "Completed" label. Reduced padding (16px), gap 12px.

3. **Locked:** Compact row. Gray number badge + title + dependency text (e.g., "Complete step 2 to unlock"). 60% opacity.

```typescript
interface ChecklistStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'locked';
  ctaLabel?: string;      // For active steps
  ctaHref?: string;       // For active steps
  dependencyText?: string; // For locked steps
}
```

**Checklist** — Renders all 5 steps with a progress bar:

```typescript
const CHECKLIST_STEPS = [
  { title: 'Get Your Quote', description: 'Enter your address and select your roofing package' },
  { title: 'Sign Your Contract', description: 'Review your contract and sign electronically' },
  { title: 'Book Your Consultation', description: 'Schedule a consultation with our team' },
  { title: 'Submit Your Deposit', description: 'Secure your installation date with a deposit' },
  { title: 'Installation Scheduled', description: 'Your installation date is being confirmed' },
];
```

Progress bar: starts at ~20% when step 1 is active (Zeigarnik effect), fills proportionally.

### Commit

```bash
git commit -m "feat(portal): add Checklist component with active/completed/locked steps"
```

---

## Task 5: Empty State (Locked) Component

**Why:** Three pages (Payments, Documents, Schedule) show locked empty states in early phases. This is a shared component with skeleton preview.

**Files:**
- Create: `src/components/features/portal/EmptyStateLocked/EmptyStateLocked.tsx`
- Create: `src/components/features/portal/EmptyStateLocked/EmptyStateLocked.module.css`

### Specs

- Lock icon in a 48px circle at top
- Title (e.g., "No Payment Information")
- Description (contextual per page)
- Progress indicator: "Step X of 5" in blue
- Skeleton preview: 3-4 gray bars at varying widths (320, 240, 280, 120px) at 40% opacity
- CTA button at bottom pointing to the unblocking action

```typescript
interface EmptyStateLockedProps {
  title: string;
  description: string;
  currentStep: number;
  ctaLabel: string;
  ctaHref: string;
  icon?: LucideIcon; // defaults to Lock
}
```

Layout: centered vertically in available space, max-width ~400px, text-align center.

### Commit

```bash
git commit -m "feat(portal): add EmptyStateLocked component with skeleton preview"
```

---

## Task 6: Quote Summary Card

**Why:** Appears on My Project page after quote is created (phases 2+). Shows project overview at a glance.

**Files:**
- Create: `src/components/features/portal/QuoteSummaryCard/QuoteSummaryCard.tsx`
- Create: `src/components/features/portal/QuoteSummaryCard/QuoteSummaryCard.module.css`

### Specs

- Card with border, rounded corners (6px)
- Desktop: single horizontal row — address (with MapPin icon) | vertical separator | PACKAGE / TOTAL / DATE metadata inline
- Mobile: stacked vertically (address row, then metadata row)
- Metadata uses `tabular-nums` for numbers
- Subtle shadow (`var(--rr-shadow-charcoal-subtle)`)

```typescript
interface QuoteSummaryCardProps {
  address: string;
  city: string;
  state: string;
  packageTier: string;    // 'good' | 'better' | 'best'
  totalPrice: number;
  installDate?: string;   // ISO date string, null if not scheduled
}
```

### Commit

```bash
git commit -m "feat(portal): add QuoteSummaryCard with horizontal desktop layout"
```

---

## Task 7: My Project Page (All Phases)

**Why:** The hub page. Adapts content based on lifecycle phase. This is the most complex page.

**Files:**
- Rewrite: `src/app/portal/page.tsx` (was redirect, now becomes My Project)
- Create: `src/app/portal/page.module.css`
- Delete: `src/app/portal/dashboard/page.tsx` (old dashboard)
- Delete: `src/app/portal/dashboard/page.module.css`

### Architecture

The page uses `usePortalPhase` to determine content:

```tsx
export default function MyProjectPage() {
  const { user } = useUser();
  const { phase, isLoading, order, quote, details } = usePortalPhase(user?.primaryEmailAddress?.emailAddress ?? null);

  if (isLoading) return <MyProjectSkeleton />;

  return (
    <div className={styles.page}>
      <PortalHeader title="My Project" />
      {phase?.phase === PortalPhase.PRE_QUOTE && <Phase1Content />}
      {phase?.phase === PortalPhase.QUOTED && <Phase2Content quote={quote} order={order} />}
      {phase?.phase === PortalPhase.CONTRACTED && <Phase3Content order={order} details={details} />}
      {/* Phases 4-5 shell content */}
    </div>
  );
}
```

### Phase 1 (Pre-Quote)

- Subtitle: "Complete these steps to get started with your roof replacement"
- Timeline: all stages gray
- Checklist: step 1 active ("Get Your Quote"), steps 2-5 locked
- Below checklist: placeholder area for embedded quote wizard (future task, out of scope)

### Phase 2 (Quoted)

- Subtitle: "Your quote is ready — review and sign your contract"
- Timeline: Quote green, Contract blue, rest gray
- QuoteSummaryCard with address + package + total
- Checklist: step 1 completed, step 2 active ("Sign Your Contract" → "Review Contract →"), steps 3-5 locked

### Phase 3 (Contracted & Deposited)

- Subtitle: "Your project is underway — installation is being scheduled"
- Timeline: Quote through Deposit green, Install blue
- QuoteSummaryCard
- Checklist: steps 1-4 completed, step 5 active ("Installation Scheduled" → "View Schedule →")

### Routing change

Remove `src/app/portal/dashboard/` directory. Update `src/app/portal/page.tsx` from redirect to full page. This makes `/portal` the My Project page directly.

### Commit

```bash
git commit -m "feat(portal): rewrite My Project page with phase-adaptive content"
```

---

## Task 8: Payments Page

**Why:** Shows financial transparency from day one — even when locked.

**Files:**
- Rewrite: `src/app/portal/payments/page.tsx`
- Rewrite: `src/app/portal/payments/page.module.css`

### Phase 1-2: Locked Empty State

```tsx
<PortalHeader title="Payments" />
<EmptyStateLocked
  title="No Payment Information"
  description="Complete your quote to see your project pricing."
  currentStep={phase.checklistStep}
  ctaLabel="Start Your Quote"
  ctaHref="/portal"
  icon={Lock}
/>
```

### Phase 3: Financial Ledger

- **Ledger card:** Total project cost, deposit (paid, with green "Paid" badge), remaining balance, financing status if applicable
- All monetary values use `tabular-nums`, right-aligned
- **Pay button:** Full-width primary button "Pay Remaining Balance" (links to Stripe checkout)
- **Payment history:** Table with columns: Date, Description, Amount, Method, Receipt (download icon)
- Uses existing `useOrderDetails` for payment data

### Commit

```bash
git commit -m "feat(portal): rewrite Payments page with ledger and locked empty state"
```

---

## Task 9: Documents Page

**Why:** Contract, warranty, and specs with quick-action icons.

**Files:**
- Rewrite: `src/app/portal/documents/page.tsx`
- Rewrite: `src/app/portal/documents/page.module.css`

### Phase 1-2: Locked Empty State

```tsx
<EmptyStateLocked
  title="No Documents Yet"
  description="Your documents will appear after your contract is signed."
  currentStep={phase.checklistStep}
  ctaLabel="Start Your Quote"
  ctaHref="/portal"
/>
```

### Phase 3: Document List

Each document row:
- Left: icon frame (36x36, category-colored background) + title + subtitle/status
- Right: 4 icon-only action buttons (Eye, Download, Share2, Printer) — each 36x36 with 8px corner radius, tooltip on hover

Documents to show:
1. Roofing Contract — "Signed" badge, file-check icon
2. Warranty Certificate — shield-check icon
3. Materials Specification — package icon

```typescript
interface DocumentRowProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  status?: 'signed' | 'pending';
  documentUrl?: string;
}
```

### Commit

```bash
git commit -m "feat(portal): rewrite Documents page with icon-action rows"
```

---

## Task 10: Schedule Page

**Why:** Installation details and preparation checklist.

**Files:**
- Rewrite: `src/app/portal/schedule/page.tsx`
- Rewrite: `src/app/portal/schedule/page.module.css`

### Phase 1-2: Locked Empty State

```tsx
<EmptyStateLocked
  title="No Schedule Yet"
  description="Your installation timeline will appear after your deposit is confirmed."
  currentStep={phase.checklistStep}
  ctaLabel="Start Your Quote"
  ctaHref="/portal"
/>
```

### Phase 3: Installation Details + Prep Checklist

**Installation Details Card:**
- "Confirmed" badge (green) in top-right
- INSTALLATION DATE: March 15, 2026
- TIME WINDOW: 7:00 AM — 5:00 PM
- CREW: Team Alpha — 4 person crew
- Labels in uppercase, 11px, muted color. Values in 16px, bold.

**Preparation Checklist Card:**
- Title: "Preparation Checklist"
- 4 checkbox items (visual only, not interactive in MVP):
  1. Clear driveway of vehicles
  2. Secure patio furniture and outdoor items
  3. Keep pets indoors during installation
  4. Remove fragile items near attic

### Commit

```bash
git commit -m "feat(portal): rewrite Schedule page with installation details and prep checklist"
```

---

## Task 11: Phase 4-5 Shell Content

**Why:** Design doc says "shell only — not built for launch." Create placeholder components so the phase system is complete.

**Files:**
- Create: `src/components/features/portal/PhaseShell/PhaseShell.tsx`

### Specs

A simple placeholder component:

```tsx
interface PhaseShellProps {
  phase: 'in-progress' | 'complete';
  page: 'project' | 'payments' | 'documents' | 'schedule';
}
```

Renders a card with an icon, a title like "Project In Progress" or "Project Complete", and a description saying this section is coming soon. Used in all 4 pages when phase is 4 or 5.

### Commit

```bash
git commit -m "feat(portal): add Phase 4-5 shell placeholders"
```

---

## Task 12: Cleanup & Barrel Exports

**Why:** Remove deprecated components, update exports, verify nothing is broken.

**Files:**
- Update: `src/components/features/portal/index.ts` — export all new components, keep old exports temporarily
- Delete (after verification): Old portal components that are fully replaced
  - `src/components/features/portal/StatusTimeline/` → replaced by ProjectTimeline
  - `src/components/features/portal/QuickActionCard/` → no longer used
- Update: `src/app/portal/page.tsx` — verify redirect to dashboard is removed (now serves My Project directly)

### Step 1: Update barrel export

Ensure all new components are exported:
```typescript
// New components
export { PortalSidebarV2 } from './PortalSidebarV2/PortalSidebarV2';
export { PortalHeader } from './PortalHeader/PortalHeader';
export { BottomTabBar } from './BottomTabBar/BottomTabBar';
export { ProjectTimeline } from './ProjectTimeline/ProjectTimeline';
export { Checklist, ChecklistStep } from './Checklist/Checklist';
export { EmptyStateLocked } from './EmptyStateLocked/EmptyStateLocked';
export { QuoteSummaryCard } from './QuoteSummaryCard/QuoteSummaryCard';
export { PhaseShell } from './PhaseShell/PhaseShell';

// Keep old exports until fully migrated
export { PaymentProgressCard } from './PaymentProgressCard';
export { PaymentOptionCard } from './PaymentOptionCard';
export { PaymentHistoryTable } from './PaymentHistoryTable';
```

### Step 2: Run typecheck

```bash
npm run typecheck
```

Fix any type errors from the routing change or removed components.

### Step 3: Run build

```bash
npm run build
```

Verify no build errors.

### Step 4: Commit

```bash
git commit -m "chore(portal): update exports, remove deprecated components"
```

---

## Task 13: Responsive Verification & Polish

**Why:** Design doc requires all content to work at 390px without clipping. Touch targets must be 44x44 minimum.

**Files:**
- Potentially modify: any CSS module from Tasks 2-10

### Checklist

1. **390px test:** Open Chrome DevTools, set viewport to 390px width. Navigate every page at every phase. Verify:
   - No horizontal scrolling
   - All text readable
   - Bottom tab bar visible and tappable
   - Cards don't clip

2. **Touch targets:** Verify all interactive elements (nav items, buttons, action icons) have at least 44x44 hit areas. Pad with CSS `padding` or `min-width`/`min-height` if needed.

3. **Hover guards:** All hover states wrapped in `@media (hover: hover)` to prevent sticky hover on touch devices. Use the existing Tailwind `hover-hover:` variant.

4. **Focus-visible:** All interactive elements have visible focus ring using `--rr-color-focus-ring`. Use `:focus-visible` (not `:focus`).

5. **Tabular-nums:** All monetary values, dates, and changing numbers use `font-variant-numeric: tabular-nums`.

### Commit

```bash
git commit -m "fix(portal): responsive polish and accessibility verification at 390px"
```

---

## Task 14: Update INDEX Files

**Why:** Project convention requires INDEX.md updates whenever routes or features change.

**Files:**
- Update: `INDEX.md` — update portal routes section
- Update: `src/INDEX.md` — update feature → file mapping

### Changes

- `/portal` now serves My Project (was redirect to dashboard)
- `/portal/dashboard` removed (merged into `/portal`)
- New components listed with file paths
- Phase detection system documented

### Commit

```bash
git commit -m "docs: update INDEX files for portal redesign"
```

---

## Summary

| Task | Component | Depends On |
|------|-----------|------------|
| 1 | Phase Detection System | — |
| 2 | Layout Shell (Sidebar + Header + Tabs) | — |
| 3 | Project Timeline | — |
| 4 | Onboarding Checklist | — |
| 5 | Empty State (Locked) | — |
| 6 | Quote Summary Card | — |
| 7 | My Project Page | 1, 2, 3, 4, 6 |
| 8 | Payments Page | 1, 2, 5 |
| 9 | Documents Page | 1, 2, 5 |
| 10 | Schedule Page | 1, 2, 5 |
| 11 | Phase 4-5 Shells | 1 |
| 12 | Cleanup & Exports | 7-11 |
| 13 | Responsive Polish | 7-11 |
| 14 | Update INDEX | 12 |

**Parallelization:** Tasks 1-6 are independent components — they can be built in any order or in parallel. Tasks 7-11 depend on the components and phase system. Tasks 12-14 are sequential cleanup.

**Estimated scope:** ~8-10 focused sessions across Tasks 1-14.
