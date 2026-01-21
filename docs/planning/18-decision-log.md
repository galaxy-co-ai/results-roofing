# 18 - Decision Log

Track all significant decisions made during the project.

<!-- AI: This document is an ongoing Architecture Decision Record (ADR) log. Add decisions as they're made throughout the project lifecycle. Each decision should capture context, options, rationale, and consequences to help future maintainers understand WHY things were done a certain way. -->

---

## How to Use This Document

<!-- AI: Explain the purpose and usage:
- Add decisions when they have lasting impact on the project
- Document decisions while context is fresh
- Include rejected alternatives to show due diligence
- Update status as decisions evolve
- Link related decisions together -->

---

## Decision Template

<!-- AI: Use this template for each significant decision: -->

```markdown
## [YYYY-MM-DD] Decision: [Title]

### Context
What situation prompted this decision? What problem are we solving?

### Options Considered
1. **Option A** - Pros: ... Cons: ...
2. **Option B** - Pros: ... Cons: ...
3. **Option C** - Pros: ... Cons: ...

### Decision
We chose Option [X] because [rationale].

### Consequences
- Positive: Benefits we gain
- Negative: Costs or limitations we accept
- Risks: Potential future issues

### Status
[Proposed | Accepted | Deprecated | Superseded by #XX]

### Related Decisions
- Links to related decisions if any
```

---

## Decision Categories

<!-- AI: Organize decisions by category for easier navigation: -->

### Framework & Language Decisions
<!-- AI: Document choices about core technologies -->

### Architecture Decisions
<!-- AI: Document structural choices -->

### Process Decisions
<!-- AI: Document workflow and process choices -->

### Integration Decisions
<!-- AI: Document third-party service and API choices -->

---

## Decisions

<!-- AI: Add decisions below using the template. Keep chronological order (newest first). Example structure:

### [YYYY-MM-DD] Decision: [Primary Language/Framework]

**Context**: [What prompted this technology choice?]

**Options Considered**:
1. **[Option A]** - Pros: [benefits]. Cons: [drawbacks].
2. **[Option B]** - Pros: [benefits]. Cons: [drawbacks].

**Decision**: We chose [X] because [rationale aligned with project goals].

**Consequences**:
- Positive: [What we gain]
- Negative: [What we accept]
- Risks: [What could go wrong]

**Status**: Accepted

---
-->

## [2026-01-21] Decision: Target Market Pivot - Self-Pay Only

### Context
Initial planning assumed a dual market strategy targeting both storm damage/insurance claim customers and self-pay customers in TX/OK. After further market analysis and strategic discussions, a major pivot was made to focus exclusively on affluent self-pay homeowners in premium markets.

### Options Considered
1. **Dual market (Insurance + Self-Pay)** - Pros: Larger addressable market, leverages TX/OK storm activity. Cons: Complex UX (two user journeys), insurance claim filing has legal/compliance complexity, 47% claim denial rate creates poor user experience, longer sales cycles.
2. **Self-Pay Only (Affluent Markets)** - Pros: Simpler UX, faster sales cycle, higher margins, customers who value quality over price. Cons: Smaller market, requires premium positioning.
3. **Insurance-Only** - Pros: High volume in storm markets. Cons: Seasonal, dependent on weather events, complex claim processes, high denial rates.

### Decision
We chose **Self-Pay Only targeting affluent homeowners** because:
- Simpler single-user-journey UX drives higher conversion
- Affluent customers ($150K-$500K+ HH income) value convenience and quality over price
- No insurance claim complexity or compliance burden
- Faster decision cycles (days vs weeks/months for insurance)
- Higher margins on premium materials
- Geographic expansion to high-income markets: TX (Highland Park, Westlake, University Park), GA (Buckhead, Sandy Springs), NC (Wrightsville Beach, Landfall), AZ (Paradise Valley, North Scottsdale)

### Consequences
- Positive: Dramatically simplified UX, clearer value proposition, premium brand positioning
- Negative: Abandons TX/OK storm damage market opportunity
- Risks: Must effectively reach affluent demographic through marketing

### Changes Made
- Removed features F16-F18 (Insurance Support) and repurposed as F16-F18 (ROI & Value Messaging)
- Replaced StormDamageQuestion, InsuranceBanner components with MotivationCapture, ROIValueDisplay, PremiumMaterialShowcase
- Changed `is_storm_damage` field to `replacement_motivation` enum
- Updated service areas from TX/OK to TX, GA, NC, AZ
- Updated personas from Maria (storm damage victim) to Richard Thompson, Elizabeth Crawford, Michael & Sarah Patel (affluent homeowners)

### Status
Accepted

### Related Decisions
- Supersedes insurance-related portions of "Product Requirements - Open Questions Resolved"
- Supersedes insurance portions of "MVP Feature Prioritization"

---

## [2026-01-21] Decision: Tech Stack Selection

### Context
Need to select the core technology stack for the Results Roofing website overhaul. The app is a conversion funnel with multiple integrations (measurement, CRM, e-signature, payments, booking).

### Options Considered
1. **WordPress + WooCommerce** - Pros: Familiar to client, huge plugin ecosystem. Cons: Performance concerns, security burden, non-negotiable rejection by client.
2. **Next.js (App Router) + Vercel** - Pros: Modern React, excellent performance, edge functions, great DX. Cons: Requires custom development.
3. **Remix + Cloudflare** - Pros: Great data loading patterns. Cons: Smaller ecosystem, less team familiarity.

### Decision
We chose **Next.js (App Router) + Vercel** because:
- Client explicitly rejected WordPress
- Vercel provides Neon PostgreSQL integration, simplifying database setup
- App Router enables server components for better performance
- Strong TypeScript support aligns with code quality goals

### Consequences
- Positive: Modern stack, excellent performance, great DX
- Negative: Custom development for all features (no plugins)
- Risks: Team must be proficient in React Server Components

### Status
Accepted

---

## [2026-01-21] Decision: Design System Foundation

### Context
Need a component foundation for building the UI. Options range from fully custom to headless libraries to opinionated UI kits.

### Options Considered
1. **Fully custom** - Pros: Total control. Cons: Significant time investment.
2. **Ark UI (headless)** - Pros: 45+ components, accessibility built-in, unstyled. Cons: Requires styling.
3. **shadcn/ui** - Pros: Copy-paste components, Tailwind. Cons: Less flexible, specific aesthetic.
4. **Chakra UI** - Pros: Full featured. Cons: Opinionated styling, bundle size.

### Decision
We chose **Ark UI** because:
- Headless approach allows full design control
- Excellent accessibility out of the box
- Actively maintained by Chakra team
- Works well with custom design systems

Design direction: **Dune (2021) + OpenAI aesthetic** - earth tones, sand/warm metallics, clean minimalism, whitespace, sophistication.

### Consequences
- Positive: Full design control, accessibility built-in
- Negative: More styling work required
- Risks: Must maintain consistent styling across components

### Status
Accepted

---

## [2026-01-21] Decision: Integration Vendors

### Context
Multiple third-party services needed for core functionality. Must balance cost, features, and flexibility.

### Decisions Made

| Category | Choice | Rationale |
|----------|--------|-----------|
| CRM | JobNimbus (primary) | Client's existing CRM; adapter pattern for future AccuLynx, HubSpot, Salesforce |
| Measurement | Roofr | $3.50-$10/report, good API, adapter pattern for future EagleView/HOVER swap |
| E-Signature | Documenso (self-hosted) | Zero per-envelope cost, TypeScript/Next.js native, open source |
| Booking | Cal.com | Free tier, built-in timeslot holds, self-hostable option |
| Financing | Wisetack (<$25K), Hearth (>$25K) | Wisetack has fast integration; Hearth for larger projects |
| SMS | SignalWire | Client rejected Twilio; must build TCPA consent tracking |
| Email | Resend | Modern API, good deliverability; abstracted for potential pivot |
| Payments | Stripe | Industry standard, excellent docs |
| Auth | Clerk | Modern auth, good DX, customer portal + admin access |

### Consequences
- Positive: All services have good APIs and TypeScript support
- Negative: Self-hosted Documenso requires maintenance
- Risks: Vendor lock-in mitigated by adapter pattern

### Status
Accepted

---

## [2026-01-21] Competitor Research: Gunner Roofing

### Context
Gunner Roofing is the direct competitor whose flow we are replicating and improving. Research conducted to inform design decisions.

### Gunner Roofing Flow (Documented)
1. **Address input** → satellite measurements (instant)
2. **3D visualization tool** → roof color selection on actual home model
3. **Package selection** → GAF asphalt replacements
4. **Scheduling/booking** → online appointment booking
5. **DocuSign integration** → documentation and agreements
6. **Online purchase** → direct checkout
7. **Customer portal** → project tracking

### Gunner Tech Stack
- Backend: WordPress (headless via WP Engine Atlas)
- Frontend: React + Next.js
- E-signature: DocuSign

### Gunner Results
- 450% increase in website leads YoY
- 8% increase in close rates
- Lead-to-install turnaround: 2 weeks
- 504% surge in keyword rankings

### Differentiation Opportunities for Results Roofing
1. **Simpler UX** - Gunner has reported negative reviews about complexity
2. **Premium market focus** - Affluent self-pay homeowners in TX, GA, NC, AZ (see Target Market Pivot decision)
3. **Better tech** - Modern Next.js App Router vs WordPress headless
4. **ROI & value messaging** - Clear communication of long-term value for quality-conscious buyers
5. **No 3D visualizer in MVP** - Defer complexity, focus on core conversion

### Sources
- [Gunner Roofing Estimator - Click Here Labs](https://clickherelabs.com/work/gunner-roofing-estimator/)
- [Yelp Reviews](https://www.yelp.com/biz/gunner-roofing-stamford-2)

### Status
Research Complete - Informs doc 05 (UI/UX Design)

---

## [2026-01-21] Decision: Product Requirements - Open Questions Resolved

### Context
Doc 01 (Vision and Goals) identified 7 open questions that needed resolution before completing the PRD. These decisions shape core product behavior.

### Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| ~~Insurance claims integration scope~~ | ~~Display-only guidance + photo upload~~ | **SUPERSEDED** - See Target Market Pivot decision; now self-pay only |
| Measurement timing UX | Show preliminary estimate immediately; refine when Roofr returns | 54% decide in <4 hours; instant feedback prevents abandonment while async measurement completes |
| Service area boundary handling | Soft stop with email capture for future expansion | Captures lead value for future; graceful UX vs hard rejection |
| Deposit amount structure | 10% of total, minimum $500, maximum $2,500 | Industry standard; minimum covers admin costs; cap limits risk |
| Good/Better/Best pricing rules | Material tiers + warranty differences; same labor; complexity multiplier | Clear value differentiation; labor consistency simplifies ops |
| Portal authentication | Email/password + magic link; defer OAuth to P1 | Magic link reduces friction; OAuth nice-to-have for MVP |
| Brand assets availability | **OPEN** - Must request from client | Blocker for Phase 2 design work |

### Consequences
- Positive: Clear scope for MVP development; all P0 requirements now implementable
- Negative: ~~Insurance integration is shallow~~ **SUPERSEDED** - No insurance integration needed
- Risks: Brand assets could block design phase if not obtained

### Status
Partially Superseded (insurance question no longer applicable per Target Market Pivot; 5/6 remaining resolved; 1 pending client response)

### Related Decisions
- Tech Stack Selection (for implementation constraints)
- Integration Vendors (for specific service capabilities)

---

## [2026-01-21] Decision: MVP Feature Prioritization (MoSCoW)

### Context
Needed to define which features are truly MVP-essential vs enhancements to prevent scope creep and ensure 8-week timeline is achievable.

### Decisions Made

**P0 Must Have (29 requirements)**:
- Core funnel: Address → Estimate → Packages → Financing → Booking → E-sign → Payment
- Customer portal: Auth, quote view, status tracking, reschedule, balance payment
- ~~Insurance support: Storm damage indicator, educational content, photo upload~~ **SUPERSEDED** - Replaced by ROI & Value Messaging (motivation capture, ROI calculator, premium material showcase)
- Trust: Credentials display, itemized pricing, shareable quotes
- Backend: JobNimbus sync, TCPA consent, business rules

**P1 Should Have (8 requirements)**: Save progress, live chat, abandoned cart follow-up, milestone notifications, Google Reviews

**P2 Could Have (6 requirements)**: Multi-provider financing, video consultations, basic roof visualization, weather alerts, referrals, Spanish

**P3 Won't Have (9 requirements)**: Native apps, 3D viz, multi-region, CRM replacement, ~~automated claim filing~~ (removed - N/A), repairs, A/B testing, advanced dashboards, multi-CRM

### Consequences
- Positive: Clear MVP boundary; 8-week timeline realistic
- Negative: Some user desires deferred (3D viz, Spanish, repairs)
- Risks: P1 features may slip if P0 takes longer than expected

### Status
Partially Superseded (insurance features replaced by ROI & Value Messaging per Target Market Pivot)

### Related Decisions
- Target Market Pivot - Self-Pay Only (supersedes insurance features)

---

*Add new decisions above this line*

---

## Decision Review Schedule

<!-- AI: Define when decisions should be reviewed:
- Major decisions: Review at each milestone
- Technology choices: Review quarterly or at major version upgrades
- Process decisions: Review after each sprint retrospective -->

| Decision Type | Review Frequency |
|---------------|------------------|
| Architecture | At major milestones |
| Technology | Quarterly |
| Process | Sprint retrospectives |
| Security | Annually or after incidents |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [Tech Decisions](../reference/tech-decisions.md) | Quick reference summary of key decisions |
| [07. Technical Architecture](./07-technical-architecture.md) | Architecture decisions in context |
| [03. Product Requirements](./03-product-requirements.md) | Requirements that drive decisions |
| [11. Security Considerations](./11-security-considerations.md) | Security decisions reference |

---

## AI Agent Instructions

When working with this decision log:

1. **Recording Decisions**
   - Document decisions when they're made, not after the fact
   - Include enough context for someone unfamiliar with the project
   - List ALL options considered, not just the winner
   - Be honest about trade-offs and risks

2. **Decision Criteria**
   - Document decisions that affect multiple files or components
   - Document technology choices with long-term implications
   - Document process changes that affect the team
   - Skip trivial implementation details

3. **Maintaining the Log**
   - Keep decisions in chronological order
   - Update status when decisions change
   - Link superseded decisions to their replacements
   - Archive very old decisions if the log becomes unwieldy

### Quality Checklist
- [ ] All major decisions documented
- [ ] Each decision includes context and rationale
- [ ] Alternatives listed with honest pros/cons
- [ ] Consequences (positive, negative, risks) documented
- [ ] Status kept up to date
- [ ] Related decisions cross-referenced
