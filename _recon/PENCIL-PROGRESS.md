# Pencil Wireframe Progress

## Status: ALL WIREFRAMES COMPLETE + POLISHED — Ready for Code Build

29 pages (27 ops + 2 showcase) + 6 extra components built across 6 sessions. 56 ops tokens loaded. Full audit + polish pass complete. User doing blog page planning in parallel.

---

## Reusable Components (frame `EJU3j`)

| Component | ID | Override Path |
|---|---|---|
| Nav Item | `HhwFw` | Label: `/sX6iK` |
| Nav Item Active | `dZ1ir` | Label: `/bFLT3` |
| Nav Group Label | `mPbcZ` | Content directly |
| Button Primary | `txLW5` | Text: `/8pMav` |
| Button Secondary | `Uts82` | Text: `/5HDlW` |
| Button Ghost | `ZGt69` | (unchecked) |
| Badge Success | `Sqnvu` | Text: `/wAgSl` |
| Badge Warning | `L662e` | (unchecked) |
| Badge Error | `vp2yL` | (unchecked) |
| Badge Info | `uNDNY` | **BROKEN inline** — `/BLTEF` path fails in children arrays. Use styled text instead. |
| Badge Neutral | `96qvi` | Text: `/BLTEF` |
| KPI Card | `0MlGI` | Label: `/JF76I`, Value: `/5NfpZ`, Trend: `/wF1rd`, Comparison: `/4Zjni` |
| Input Field | `NJZzS` | — |
| Card | `0qioY` | — |
| Kanban Card | `RjN3e` | Address: `/fP2iA`, Value: `/iDtFT`, Tasks: `/IOZWI`, Meta: `/SbXJY` |

---

## Complete Page Inventory

### Original 7 Pages + 6 Extra Components

| # | Page | Frame ID | Content ID | Status |
|---|---|---|---|---|
| 1 | Ops Shell (master template) | `fbUdX` | — | Complete |
| 2 | Dashboard | `hls2B` | `j9oR9` | Complete |
| 3 | Kanban Board | `C3loV` | `Q2dep` | Complete |
| 4 | Unified Inbox | `h0wlv` | — | Complete |
| 5 | Table — Invoices | `RfJst` | `LgWOe` | Complete |
| 6 | Calendar | `sp5md` | `qg3kH` | Complete |
| 7 | Slide-over Detail Panel | `k6EtA` | — | Complete |
| 8 | Form Modal | `af1D4` | — | Complete |
| 9 | Document Template — Estimate | `wLciX` | — | Complete |
| 10 | Empty State | `3MUTW` | — | Complete |
| 11 | Toast Notifications | `biezP` | — | Complete |
| 12 | Notification Dropdown | `mgfdf` | — | Complete |

### Batch A — Table Pages (copied from Invoices shell)

| # | Page | Frame ID | Route | Status |
|---|---|---|---|---|
| 13 | Customers | `8u4D1` | `/ops/customers` | Complete |
| 14 | Estimates | `hmdWm` | `/ops/estimates` | Complete |
| 15 | Payments | `GEy0I` | `/ops/payments` | Complete |
| 16 | Materials | `sQ8Yk` | `/ops/materials` | Complete |
| 17 | Documents | `KXntN` | `/ops/documents` | Complete |
| 18 | Automations | `SKrTO` | `/ops/automations` | Complete |

### Batch B — Detail Pages (copied from master shell)

| # | Page | Frame ID | Content ID | Route | Status |
|---|---|---|---|---|---|
| 19 | Job Detail | `AFPcc` | `hSJGG` | `/ops/jobs/[id]` | Complete |
| 20 | Customer Profile | `I2ovi` | `dTj58` | `/ops/customers/[id]` | Complete |
| 21 | Estimate Builder | `4ppOu` | `6eZWQ` | `/ops/estimates/[id]` | Complete |
| 22 | Invoice Builder | `YjSe3` | `TDAd9` | `/ops/invoices/[id]` | Complete |
| 23 | Material Order Detail | `582Du` | `1Bd3V` | `/ops/materials/[id]` | Complete |

### Batch C — Unique Layouts

| # | Page | Frame ID | Content ID | Route | Status |
|---|---|---|---|---|---|
| 24 | Reports | `luo0x` | `FgKGg` | `/ops/reports` | Complete |
| 25 | Automation Editor | `Jxjmk` | `z57aR` | `/ops/automations/[id]` | Complete |
| 26 | Settings | `OKFMo` | `TtSlX` | `/ops/settings` | Complete |

### Batch D — Remaining

| # | Page | Frame ID | Content ID | Route | Status |
|---|---|---|---|---|---|
| 27 | Team | `z1sYV` | `vbdoP` | `/ops/team` | Complete |
| — | Blog | — | — | `/ops/blog` | User defining requirements separately |

### Showcase Pages (client-facing, toggle between views)

| # | Page | Frame ID | Route | Status |
|---|---|---|---|---|
| 28 | Showcase — For Your Team | `pTo0h` | `/showcase` (toggle) | Complete |
| 29 | Showcase — For Homeowners | `3UQpu` | `/showcase` (toggle) | Complete |

**Showcase structure (shared):** Nav bar → Pill toggle [For Homeowners | For Your Team] → Hero → Browser mockup (grid bg) → Stats bar → Feature grid (3x2, icon+title inline) → Carousel (arrows + dots) → CTA footer → Footer

**For Your Team content:** Ops dashboard focus — Job Pipeline, Estimates & Invoices, CRM, Inbox, Automations, Reports. 27 pages carousel. "Start Free Trial" CTA.

**For Homeowners content:** Customer experience focus — Instant Satellite Quote, Transparent Pricing, Easy Financing, Customer Portal, Real-time Updates, Digital Documents. Quote flow carousel. "Get My Free Quote" CTA.

**Code note:** Single `/showcase` route with toggle state. Gradient fade dot grid background behind browser mockup (CSS implementation).

---

## 56 Variables Loaded

All ops tokens set in the Pencil file. Omit `filePath` parameter — uses active editor.

---

## Key Gotchas

- **filePath:** Do NOT pass "Untitled.pen" — omit entirely
- **Icon fonts:** Lucide icons show "not found" warning but still render
- **Nav item overrides:** `U(instance+"/sX6iK", {content: "..."})` for Nav Item, `U(instance+"/bFLT3", {content: "..."})` for Active
- **Copying shells:** Copy `fbUdX` for new screens. Content area will be empty
- **Nav swap:** Use `R()` to swap between `HhwFw`/`dZ1ir` — can't change `ref` via `U()`
- **Button labels:** Primary = `/8pMav`, Secondary = `/5HDlW` (different components, different IDs!)
- **Text widths:** Need `textGrowth: "fixed-width"` to honor explicit pixel widths
- **Children on Insert:** Works for frame nodes too, not just ref — reduces op count dramatically
- **Kanban columns:** Use `fill_container` not fixed width to prevent overflow
- **KPI Card descendants:** `JF76I` (label), `5NfpZ` (value), `wF1rd` (trend), `4Zjni` (comparison)
- **Kanban Card descendants:** `fP2iA` (address), `iDtFT` (value), `IOZWI` (tasks), `SbXJY` (meta)
- **Badge Info inline BROKEN:** `uNDNY` descendant path `/BLTEF` fails when used in children arrays. Use styled text nodes instead.
- **Variable fills render black:** `$ops-surface-secondary`, `$ops-text-secondary` etc. render as `#000000` on inline children. Use hex colors directly: `#F8F9FA` (surface-secondary), `#6B7280` (text-secondary), `#1F2937` (text-primary), `#9CA3AF` (text-tertiary), `#E5E7EB` (border-default).
- **Batch fix applied:** `replace_all_matching_properties` fixed black fills BUT broke text on 3 pages (changed text fill to background color). Manual fix: updated all 160 text nodes with explicit `fill` values.
- **CRITICAL — text color = `fill`, NOT `textColor`:** Pencil silently ignores `textColor`. Always use `fill` on text nodes.
- **Financial alignment:** All monetary columns use `textAlign: "right"`, Qty columns use `textAlign: "center"`. Totals cards use `alignItems: "flex_end"` + rows `width: "fill_container"` + value text `textAlign: "right"`.
- **Estimate preview header:** Text was white (#FFFFFF) on gray (#f7f9fc) — fixed to #6b7789.
- **Table rows MUST have:** `layout: "horizontal"`, `alignItems: "center"`, primary text column `width: "fill_container"`. Only use fixed widths on narrow columns (Qty, Price, Amount, Status, Date).
- **Toolbar/header bars MUST have:** `layout: "horizontal"`, `alignItems: "center"`. Use spacer frame `{height: 1, width: "fill_container"}` to push actions right.
- **flexWrap doesn't work reliably:** Cards shrink instead of wrapping. Use explicit row frames (insert two frames, move 3 cards into each).
- **KPI row frames need explicit `layout: "horizontal"`** — without it, cards stack/overlap.

---

## Audit Log

### Session 5

| Fix | Pages Affected | Ops |
|-----|----------------|-----|
| Black fill replacement (#000000 → #f7f9fc) | All Batch A-D | batch replace |
| Text color restoration (160 nodes) | Automation Editor, Settings, Team | 8 batch_design calls |
| Financial column right-alignment | 7 pages (builders + tables + material order) | 67 property updates |
| Preview header text color | Estimate Builder | 4 updates |
| Color consistency assessment | All pages | No changes needed |
| Showcase page built | New page (pTo0h) | ~60 ops |
| Feature grid fix (flexWrap → explicit rows) | Showcase | 9 ops |

### Session 6 (Polish + Showcase v2)

| Fix | Pages Affected | Ops |
|-----|----------------|-----|
| Totals right-alignment (rows fill_container + textAlign right) | Estimate Builder, Invoice Builder | 16 updates |
| Preview "Total Due" right-alignment | Estimate Builder | 2 updates |
| Toolbar/header bar centering (layout + alignItems) | Estimate, Invoice, Material Order builders | 3 updates |
| Reports KPI row + tab bar + charts row layout | Reports | 3 updates |
| Automation Editor: top bar, card headers, icons, arrows centering | Automation Editor | 17 updates |
| Automations list: KPI row, toolbar, table rows, pagination layout | Automations list | 8 updates |
| Team page: avatar shrink (48→36), text centering, online dots to header, explicit 3x2 grid | Team | ~50 updates |
| Showcase: feature card icon+title inline (all 6 cards) | Both showcase pages | 30 updates |
| Showcase: pill toggle added (For Homeowners / For Your Team) | Both showcase pages | 7 ops each |
| Showcase: carousel redesign (arrows + 3 cards + dots) | Both showcase pages | ~20 ops each |
| Showcase — Homeowners page created (copy + full content swap) | New page (3UQpu) | Copy + ~40 updates |
| Demo section grid background tint | Both showcase pages | 2 updates |

---

## Remaining Work

1. **Code Plan Session** — Read existing codebase, map dependencies, create detailed Phase 1 plan
2. **Phase 1 Code Build** — Foundation (ops-tokens.css, Sidebar, PageHeader, OpsShell)
3. **Showcase code build** — Convert Pencil wireframes to Next.js `/showcase` route
4. **Blog pages** — User defining requirements (templates, features). Wireframe + build after Phase 1.
5. **Phases 2-13** — Per BUILD-PLAN.md

---

## Phase 1 Build Tasks (after wireframes)

| # | Task | Files |
|---|---|---|
| 1.1 | Create `src/styles/ops-tokens.css` with all --ops-* variables | New file |
| 1.2 | Create `src/styles/ops-utilities.css` with ops-specific utility classes | New file |
| 1.3 | Update `tailwind.config.ts` — extend with ops tokens | Existing |
| 1.4 | Rebuild `src/app/ops/layout.tsx` — next/font loading, ops shell wrapper | Existing |
| 1.5 | Build `src/components/ops/shell/Sidebar.tsx` | New |
| 1.6 | Build `src/components/ops/shell/PageHeader.tsx` | New |
| 1.7 | Build `src/components/ops/shell/OpsShell.tsx` — sidebar + header + content | New |
| 1.8 | Add shadcn variable overrides in ops layout scope | 1.1 update |
