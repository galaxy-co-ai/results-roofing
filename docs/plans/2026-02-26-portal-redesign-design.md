# Portal Redesign — Design Document

**Date:** 2026-02-26
**Scope:** Wide — full portal redesign from scratch, research-driven
**Branch:** TBD (will create from main)

---

## Problem Statement

The current customer portal has critical UX failures:
- Payments page shows wrong state despite Dashboard having quote data
- Documents and Schedule pages are dead ends with no CTAs
- No deposit payment path exists within the portal
- Sidebar overlays content instead of pushing it
- Mobile layout clips at 390px on all pages
- No progress indicator across the customer journey
- "Start a quote" CTA ejects users out of the portal to `/quote/new`

The portal needs a ground-up redesign informed by industry leaders, not patches.

---

## Research Summary

Studied customer portals across home services, solar, construction, fintech, healthcare, and SaaS onboarding. Key patterns:

| Pattern | Source | Application |
|---------|--------|-------------|
| Pizza tracker / project timeline | Sunvoy, Freedom Solar, Domino's | Visual progress bar showing Quote → Contract → Deposit → Install → Complete |
| Card-based dashboard hub | Houzz Pro, Buildertrend | Each domain (payments, docs, schedule) as a summary card with CTA |
| Actionable empty states | SaaS best practices (Intuit, Gusto) | Every empty page has: why empty + what will appear + CTA to unblock |
| Onboarding checklist + Zeigarnik | Airtable, Intercom | 3-5 step checklist, start at step 1 pre-highlighted, locked steps show dependency |
| Financial transparency / ledger | Fintech, Buildertrend, Houzz Pro | Full cost breakdown from day one — not just "pay now" |
| Calm trust-building design | MyChart, fintech portals | Whitespace, semantic color, accessible, no alarm aesthetics |
| Mobile-first omnichannel | Universal | Responsive-first, not responsive-patched. Works at 390px. |

Full research sources in conversation history (2026-02-26 session).

---

## Portal Structure

### Pages

| Page | Sidebar Label | Purpose |
|------|--------------|---------|
| **My Project** | My Project | Timeline tracker + adaptive onboarding checklist + next action card |
| **Payments** | Payments | Financial ledger, deposit/balance breakdown, pay buttons, receipt history |
| **Documents** | Documents | Contract, warranty, materials spec, project docs with previews |
| **Schedule** | Schedule | Installation timeline, preparation checklist, appointment details |

The quote wizard lives embedded inside "My Project" — not a separate page.

### Sidebar

- Fixed position, pushes content (not overlays)
- Collapsed: 72px icon-only
- Rounded corners (top-right and bottom-right only), inset from screen edges with 16px vertical padding
- Mobile: bottom tab bar (4 items matching sidebar pages)
- Logo links to `/portal` (My Project), not marketing site
- No user avatar in sidebar — avatar lives in the page header

### Page Header

- Reusable component across all pages
- Left: page title (28px, weight 700)
- Right: Help button (bordered, icon + label) + user avatar (32px circle, initials)
- 2px `$--primary` accent underline below the header row
- Consistent across all pages, title changes per page via instance override

---

## Project Lifecycle Phases

The portal adapts its content based on which phase the customer is in.

### Phase 1: Pre-Quote
**Trigger:** User has portal account but no quote/order record.

| Page | Content |
|------|---------|
| My Project | Onboarding checklist with step 1 ("Get Your Quote") active. Quote wizard embedded in content area below checklist. |
| Payments | Actionable empty state: "Complete your quote to see your project pricing." No outbound link. |
| Documents | Actionable empty state: "Your documents will appear after your contract is signed." |
| Schedule | Actionable empty state: "Your installation timeline will appear after your deposit is confirmed." |

**Checklist state:**
1. **Get Your Quote** ← active, CTA visible
2. Sign Your Contract ← locked ("Complete step 1")
3. Book Your Consultation ← locked
4. Submit Your Deposit ← locked
5. Installation Scheduled ← locked

### Phase 2: Quoted (no contract)
**Trigger:** Quote record exists, no signed contract.

| Page | Content |
|------|---------|
| My Project | Quote summary card (address + package/total/date inline on desktop). Checklist step 2 active. Timeline shows "Quoted" stage highlighted. |
| Payments | Skeleton empty state with lock overlay, progress indicator ("Step 2 of 5"), CTA to sign contract. |
| Documents | Skeleton empty state with lock overlay, progress indicator, CTA to sign contract. |
| Schedule | Skeleton empty state with lock overlay, progress indicator, CTA to sign contract. |

**Checklist state:**
1. Get Your Quote ← completed (checkmark)
2. **Sign Your Contract** ← active, CTA visible
3. Book Your Consultation ← locked
4. Submit Your Deposit ← locked
5. Installation Scheduled ← locked

### Phase 3: Contracted & Deposited
**Trigger:** Contract signed + consultation completed + deposit paid.

| Page | Content |
|------|---------|
| My Project | Project details card (full info). Timeline shows "Deposited" stage. Checklist shows step 5 active. |
| Payments | Full ledger: deposit paid (with receipt), remaining balance, payment schedule, financing status if applicable. |
| Documents | Contract (signed), warranty, materials spec. Each with icon-only actions: view, download, share, print. |
| Schedule | Installation date, time window, preparation checklist (clear driveway, secure pets, etc.), crew info if available. |

**Checklist state:**
1. Get Your Quote ← completed
2. Sign Your Contract ← completed
3. Book Your Consultation ← completed
4. Submit Your Deposit ← completed
5. **Installation Scheduled** ← active (or completed with date shown)

### Phase 4: In Progress (design shell only — not built for launch)
**Trigger:** Installation date reached, crew assigned.

| Page | Content |
|------|---------|
| My Project | Live timeline with daily updates, photo log, crew info. |
| Payments | Same ledger + any progress payments. |
| Documents | Updated with inspection reports, change orders. |
| Schedule | Real-time progress, estimated completion. |

### Phase 5: Complete (design shell only — not built for launch)
**Trigger:** Installation complete, final inspection passed.

| Page | Content |
|------|---------|
| My Project | Completed project summary, warranty start date, referral prompt, review request. |
| Payments | Final ledger, all receipts, financing payoff status. |
| Documents | Full document archive: contract, warranty, inspection report, materials spec. |
| Schedule | Project complete badge. Historical timeline preserved. |

---

## Key Components

### Project Timeline Tracker
- Horizontal bar (desktop) / vertical steps (mobile)
- 6 stages: Quote → Contract → Consultation → Deposit → Install → Complete
- Current stage highlighted in `$--primary` (blue)
- Completed stages in `$--color-success` (green)
- Future stages dimmed in `$--border` (gray)
- Always visible on My Project page

### Onboarding Checklist
- 5 steps across the full lifecycle
- Active step: card with subtle 2px `$--primary` border, number badge + title/description on left, CTA text-link on right
- Completed step: compact row with green checkmark + title + "Completed" label
- Locked step: compact row with gray number + title + dependency text, reduced opacity
- Zeigarnik: progress bar starts at ~20% when step 1 is active

### Quote Summary Card
- Appears after quote is created (phases 2+)
- Desktop: single horizontal row — address (with map-pin icon) | separator | PACKAGE / TOTAL / INSTALLATION metadata inline
- Mobile: stacked vertically (address row, then metadata row)
- Compact card format, tappable to expand details

### Financial Ledger (Payments page)
- Always shows the full picture, even pre-deposit
- Rows: Total project cost, deposit (due or paid), remaining balance, financing (if applicable)
- Payment history table below with dates, amounts, methods, receipt downloads
- `tabular-nums` on all monetary values
- Pay button prominent when payment is due

### Empty States (Skeleton + Lock Preview)
- Lock icon (48px circle) + title + description + progress indicator ("Step X of 5")
- Skeleton preview: ghosted content bars (varying widths) at 40% opacity, simulating what the page will look like when unlocked
- CTA button at the bottom pointing to the unblocking action
- Motivational, not just informational — shows users what they're working toward

### Document Actions
- Each document row shows: icon + title/description on left, icon-only action row on right
- 4 actions: view (eye), download, share, print — 36x36 touch targets with 8px corner radius
- No text labels — icons are universally understood, tooltips on hover (implementation detail)

### Responsive Layout
- Sidebar pushes content on desktop (not overlay)
- Bottom tab bar on mobile (≤768px) with 4 items
- All content must work at 390px without horizontal clipping
- Touch targets: minimum 44x44px
- `@media (hover: hover)` guards on all hover states

---

## Design Tokens

Use existing Results Roofing token system (`src/styles/tokens/`):
- `--rr-color-blue` for primary actions and active states
- `--rr-color-success` for completed steps
- `--rr-color-warning` / amber for urgency notices (48-hour reservation)
- `--rr-color-text-primary/secondary/tertiary` for hierarchy
- `--rr-color-border-default` for card borders
- `--rr-color-surface-hover` for interactive hover states
- `--rr-shadow-charcoal-subtle/medium` for elevation

---

## Out of Scope (for this design)

- Quote wizard internal flow/questions (separate brainstorm — will be thorough)
- Phase 4-5 live data integration (shell only)
- Notifications/email triggers
- Real-time updates (WebSocket/SSE)
- Multi-project support (one project per account for now)

---

## Build Scope

**Launch (build now):** Phases 1-3 — Pre-quote through deposited
**Shell only (design but don't wire up):** Phases 4-5 — In progress and complete

---

## Revision History

### Rev 2 (2026-02-26)
- Added Consultation step between Contract and Deposit (6-stage timeline, 5-step checklist)
- Reduced button height from 44px to 36px for refined, minimal feel
- Sidebar: rounded top-right/bottom-right corners, 16px vertical inset from screen edges
- Moved avatar from sidebar to page header; added Help button left of avatar
- Added 2px `$--primary` accent underline below all page headers
- Quote Summary Card: horizontal metadata layout on desktop (address + package/total/date inline)
- Checklist active step: two-zone layout (content left, CTA right)
- Checklist completed/locked steps: compacted padding and spacing
- Empty states: skeleton preview + lock icon + progress indicator replaces plain icon+text
- Document actions: icon-only row (view, download, share, print) replaces "Download" button
- Mobile screens deferred to dedicated session

### Rev 3 (2026-02-26) — Mobile
- All 9 mobile screens updated to match Rev 2 desktop changes
- Header component (avatar + Help + accent underline) added to all mobile screens
- 5-step checklists with Consultation added to all MyProject mobile screens
- CTA text corrected: Phase 2 "Review Contract →", Phase 3 "View Schedule →"
- Empty state icons normalized to lock across all pages
- Phase 3 timeline: full green coloring through Consultation stage
- Document actions: 4-icon row (view, download, share, print) on Documents P3 mobile

## Next Steps

1. ~~Wireframe all pages and phases in Pencil desktop app~~ ✓
2. ~~Screenshot and validate against this design doc~~ ✓
3. ~~Dedicated mobile wireframe session (390px screens)~~ ✓
4. Create implementation plan
5. Execute implementation plan
