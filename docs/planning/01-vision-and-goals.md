# 01 - Vision and Goals

<!-- AI: This is the first document to complete in the discovery phase. It captures WHY the project exists and WHAT success looks like. Complete this before moving to user personas (doc 02). -->

## Problem Statement

**Affluent homeowners in premium markets (Texas, Atlanta, Wilmington NC, Phoenix)** needing roof replacement face a fragmented, high-friction buying process:

1. **Multi-day delays**: They request quotes through contact forms and wait 2-5 days for a sales visit
2. **Manual measurements**: Roofers climb on roofs or wait for satellite reports, adding more delays
3. **Opaque pricing**: Quotes arrive as single numbers with no breakdown of materials, labor, or warranty options
4. **Financing confusion**: Understanding monthly payments requires separate applications and more waiting
5. **Time scarcity**: High-income professionals lack time for multiple contractor meetings and follow-ups

**The result**: Qualified buyers drop off during this multi-day process. Time-constrained affluent homeowners—who expect premium service and Amazon-like transparency—abandon and price-shop competitors. Roofing contractors like Results Roofing lose deals to whoever responds fastest, not whoever provides the best value.

**For Results Roofing specifically**: The current website (resultsroofing.com) is a basic brochure site that captures leads via contact forms but provides no self-service quoting, no pricing transparency, and no differentiation from competitors. Every lead requires manual follow-up, and there's no visibility into where leads drop off in the sales process.

---

## Vision Statement

**Any homeowner in our target markets (Texas, Atlanta, Wilmington NC, Phoenix) can go from "I need a new roof" to "I've signed and scheduled my project" in under 10 minutes—on their phone, without a single phone call.**

The experience should feel like:
- **Simple on the surface**: Clear steps, no jargon, no walls of text
- **Powerful underneath**: Instant satellite measurements, real-time pricing, automated financing pre-qual
- **Guided throughout**: The user always knows where they are, what's next, and what to expect
- **Transparent always**: Full breakdown of materials, labor, warranties, and financing terms—no hidden costs

When complete, Results Roofing will be the only roofing contractor in their markets offering a true self-service quote-to-signed-contract experience, matching the UX sophistication of modern e-commerce while handling the complexity of construction estimating and financing behind the scenes.

---

## Success Criteria

### Funnel Conversion (Business Impact)
| Metric | Target | Timeframe | How to Measure |
|--------|--------|-----------|----------------|
| Lead → Qualified Quote | ≥ 35% | 3 months post-launch | Server-side events + GA4 funnel |
| Quote → Signed Agreement | ≥ 15% | 3 months post-launch | E-signature completion webhook |
| Signed → Scheduled | ≥ 90% | At launch | Booking confirmation events |
| Full funnel (Lead → Scheduled) | ≥ 4.7% | 6 months post-launch | Calculated from above |

### User Experience (Speed & Satisfaction)
| Metric | Target | Timeframe | How to Measure |
|--------|--------|-----------|----------------|
| Quote response time (p95) | ≤ 3 seconds | At launch | Server latency monitoring |
| Mobile LCP (key pages) | ≤ 2.5 seconds | At launch | Core Web Vitals / Lighthouse CI |
| Time to complete full flow | < 10 minutes | At launch | Session duration analytics |
| Portal satisfaction (CSAT) | ≥ 8/10 | 3 months post-launch | In-app survey after booking |

### Technical Quality (Reliability)
| Metric | Target | Timeframe | How to Measure |
|--------|--------|-----------|----------------|
| Estimator availability | ≥ 99.9% | At launch | Synthetic checks + uptime monitoring |
| Checkout success rate | ≥ 98.5% | At launch | Payment completion / attempts |
| Error rate (5xx responses) | < 0.1% | At launch | Server logs / observability |

### Attribution (Marketing ROI)
| Metric | Target | Timeframe | How to Measure |
|--------|--------|-----------|----------------|
| Jobs mapped to campaign/source | ≥ 90% | 3 months post-launch | sGTM + offline conversions upload |

---

## Non-Goals

### Out of Scope for MVP (Change Order if Needed)

**Platform & Infrastructure:**
- We will NOT build native mobile apps—the responsive web app serves mobile users adequately
- We will NOT support geographic routing beyond initial target markets (TX, GA, NC, AZ)—further expansion is post-launch
- We will NOT deploy to on-premise workloads—cloud-only (Vercel)
- We will NOT build call-center tooling—internal ops tools are separate

**Features Deferred:**
- We will NOT support multiple measurement vendors in MVP—Roofr only, with adapter pattern for future swap
- We will NOT build robust dashboards in MVP—basic GA4 analytics suffice initially
- We will NOT implement A/B testing framework in MVP—defer to Phase 7
- We will NOT build advanced pricing rules (complexity multipliers, regional pricing)—simple 3-tier Good/Better/Best
- We will NOT support manual-estimate fallback with full SLA tracking in MVP Option A (included in Option B)

**Integrations:**
- We will NOT integrate multiple CRMs simultaneously—JobNimbus only for MVP, adapter pattern for future
- We will NOT build a custom ERP or project management system
- We will NOT use WordPress, Supabase, or Twilio (project non-negotiables)

**Content & Brand:**
- We will NOT do a full brand redesign—using existing Results Roofing brand assets
- We will NOT build a net-new CMS—marketing pages use Next.js ISR with minimal content management

### Explicitly Deferred to Post-MVP
- Customer portal advanced features (change orders, warranty docs, crew calendar)
- Multi-language support
- Extensive accessibility (WCAG AAA)—targeting AA compliance only
- LTV modeling and advanced attribution pipeline

---

## Key Differentiators

### vs. Traditional Roofing Contractors (Status Quo)

| Differentiator | How We're Different | Why It Matters |
|----------------|---------------------|----------------|
| **Instant quotes** | Real-time pricing from address entry vs. 2-5 day wait for sales visit | Captures mobile users who expect immediate answers |
| **Self-service** | Complete flow without phone calls vs. mandatory sales interaction | Appeals to younger homeowners who prefer digital-first |
| **Transparent pricing** | Full breakdown (materials, labor, warranties) vs. single opaque number | Builds trust, reduces "hidden fee" anxiety |
| **Financing clarity** | Pre-qual in 60 seconds vs. separate application process | Removes #1 purchase barrier for mid-market buyers |

### vs. Gunner Roofing (Direct Competitor Template)

| Differentiator | How We're Different | Why It Matters |
|----------------|---------------------|----------------|
| **Simpler UX** | Cleaner flow with fewer screens and no jargon | Lower drop-off, higher completion rates |
| **Premium positioning** | ROI-focused messaging with value transparency for affluent buyers | Appeals to self-pay customers seeking quality over lowest price |
| **Multi-market presence** | Serving premium neighborhoods across TX, GA, NC, AZ | Trusted local service in high-value markets |
| **Modern tech stack** | Built on Next.js/Vercel with better performance | Faster load times, better mobile experience |

### Core UX Philosophy (The "Hidden Complexity" Advantage)

The differentiator is not the features—competitors can copy features. The differentiator is **execution quality**:

1. **Simple surface, powerful engine**: User sees 5-7 clean screens while the backend orchestrates measurements, pricing calculations, financing APIs, CRM updates, and booking holds
2. **Progressive disclosure**: Show only what's needed at each step—no overwhelming forms or walls of text
3. **Clear wayfinding**: User always knows: where they are, what's next, and how long it takes
4. **Recovery paths**: Every error state has a clear next action—no dead ends

---

## Target Timeline

**Engagement Term**: Q4 2025 - Q1 2026
**MVP Approach**: Option A (2-week sprint, ~140-160 hours)

| Milestone | Target | Notes |
|-----------|--------|-------|
| Planning Complete | End of Week 1 | All discovery + design docs finalized |
| Foundations Ready | Week 2-3 | Repo, CI/CD, environments, security scaffolding |
| Core Funnel MVP | Week 3-6 | Address → Quote → Booking → Signature → Deposit |
| Hardening + UAT | Week 5-7 | Security headers, smoke tests, acceptance testing |
| Soft Launch | Week 8 | 10% traffic, monitoring, hotfixes |
| Full Launch | Week 9 | 100% traffic with stabilization window |
| Enhancements | Week 10-12 | A/B tests, polish, dashboard tuning |

### Phase Breakdown (from SOW)
- **Phase 0**: Kickoff & Discovery (10-14 hrs)
- **Phase 1**: UX & Architecture (18-24 hrs)
- **Phase 2**: Foundations & Enablers (14-20 hrs)
- **Phase 3**: Core Funnel Build (58-78 hrs)
- **Phase 4**: Analytics/Reliability/Hardening (14-20 hrs)
- **Phase 5**: UAT/Training/Content (8-12 hrs)
- **Phase 6**: Launch & Stabilization (6-8 hrs)
- **Phase 7**: Enhancements (deferred in MVP A)

---

## Open Questions

*Questions to be resolved in subsequent planning docs:*

1. **Measurement timing UX** (doc 05): Roofr reports take 24-48 hours. Do we show preliminary estimate immediately and refine later, or gate the flow until measurement returns?

2. **Service area boundary handling** (doc 05): What happens when an address is outside the coverage area? Hard stop, or lead capture for future expansion?

3. **Deposit amount structure** (doc 03): Fixed dollar amount, percentage of total, or configurable per-project?

4. **Good/Better/Best pricing rules** (doc 08): What differentiates the tiers? Materials only, or also labor/warranty/timeline differences?

5. **Portal authentication** (doc 11): Clerk is selected. Email/password + magic link, or also OAuth (Google)?

6. **Existing brand assets availability** (doc 05-06): What logos, colors, photography are available from Results Roofing?

7. **Self-pay motivation capture** (doc 03-04): How do we best capture and utilize the customer's motivation for replacement (roof age, pre-sale prep, carrier requirement, etc.)?

---

## Related Documents

| Doc | Relationship |
|-----|--------------|
| [02-user-personas.md](./02-user-personas.md) | WHO we're building for (complete next) |
| [03-product-requirements.md](./03-product-requirements.md) | WHAT features we'll build |
| [04-feature-breakdown.md](./04-feature-breakdown.md) | Detailed feature specifications |
| [18-decision-log.md](./18-decision-log.md) | Log major vision decisions here |
| [AGENT-GUIDE.md](./AGENT-GUIDE.md) | How to lead the discovery process |

---

## AI Agent Instructions

### How to Complete This Document

1. **Start with Problem Statement** - This is the foundation. If you can't articulate the problem, stop and gather more information.

2. **Ask probing questions** - Don't accept vague answers. If user says "make it easier," ask "easier than what? How much easier? For whom?"

3. **Validate with examples** - Ask for specific scenarios: "Can you describe a time when you experienced this problem?"

4. **Push for measurability** - For success criteria, keep asking "how would we know?" until you get a number.

5. **Challenge assumptions** - Ask "why not just use [existing solution]?" to surface differentiators.

### Red Flags to Address

| Red Flag | How to Address |
|----------|----------------|
| "We want to be the best" | Ask: "Best at what specifically? For whom?" |
| "Everyone needs this" | Ask: "Who specifically? What's their job/role?" |
| "It should be fast" | Ask: "How fast? What's the current speed?" |
| "Better than competitors" | Ask: "Which competitors? Better in what way?" |
| Vague success criteria | Ask: "What number would make you celebrate?" |

### Document Completion Checklist

- [x] Problem statement identifies specific pain point for specific users
- [x] Vision statement describes desirable end-state
- [x] At least 3 measurable success criteria with targets (14 metrics defined)
- [x] At least 3 explicit non-goals defined (15+ non-goals across categories)
- [x] Key differentiators articulate why this vs alternatives
- [x] No remaining [TBD] markers (open questions deferred to appropriate docs)

**Status: COMPLETE** - Ready to proceed to 02-user-personas.md
