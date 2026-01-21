# 03 - Product Requirements Document (PRD)

<!-- AI: This document defines WHAT features the product needs. Requirements trace back to persona pain points and use cases from 02-user-personas.md. Updated Session 16 for self-pay pivot - removed insurance features F16-F18. -->

## Requirements Overview

This PRD uses MoSCoW prioritization:
- **Must Have (P0)**: MVP requirements. Without these, the product doesn't solve the core problem.
- **Should Have (P1)**: Important for good experience. Include if time allows in MVP sprint.
- **Could Have (P2)**: Nice enhancements. Defer to post-MVP.
- **Won't Have (P3)**: Explicitly out of scope (documented in doc 01 Non-Goals).

**Traceability**: Every P0 requirement maps to persona use cases and research-backed pain points:
- 78% want transparent pricing (only 25% of competitors provide it)
- 70% worry about unreliable contractors / scams
- 40% cite poor communication as biggest challenge
- 54% of homeowners decide within 4 hours of researching
- 60-68% ROI on new roof for resale
- 19% insurance premium reduction with new roof

**Target Personas**: Richard Thompson (affluent executive), Elizabeth Crawford (downsizing retiree), Michael & Sarah Patel (young affluent professionals)

**Target Markets**: Texas (Highland Park, Westlake, etc.), Atlanta GA (Buckhead, etc.), Wilmington NC, Phoenix AZ (Paradise Valley, etc.)

---

## Functional Requirements

### Must Have (P0) - MVP

#### Core Funnel Flow

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F01 | User can enter property address and see it validated | Address autocomplete from Google Places; validates service area (TX, GA, NC, AZ target markets); clear error if outside area with email capture option | Richard UC1: Instant estimate; Anti-persona handling |
| F02 | User can see instant preliminary price estimate within 3 seconds | Shows price range based on address (sq ft from county data or instant estimate) before Roofr report completes; range shows Good/Better/Best tiers | Richard UC1; Pain: 78% want transparent pricing |
| F03 | User can view detailed measurement-based quote after Roofr report returns | Full breakdown: sq ft, pitch, complexity; materials, labor, permits itemized per tier; shows "updated from preliminary" if changed | Richard UC3: Compare packages; Pain: Opaque pricing |
| F04 | User can compare Good/Better/Best packages side-by-side | Table view showing: materials (brand/type), warranty terms, estimated timeline, price; differences highlighted; educational tooltips | Richard UC3; Key Insight #8: Premium package emphasis |
| F05 | User can select a package and proceed to checkout | Clear CTA per tier; selected package persists through checkout; can change selection before payment | Richard workflow: Share with spouse |
| F06 | User can complete soft-pull financing pre-qualification in <60 seconds | Wisetack embed shows monthly payment options; no hard credit pull; approval/denial displayed immediately; can proceed without financing | Richard UC4; Key Insight #6: Financing as option |
| F07 | User can schedule inspection/install appointment from available slots | Cal.com integration shows real availability; holds slot during checkout (15-minute hold); confirms upon payment | Richard UC5; Pain: Time scarcity |
| F08 | User can review and e-sign contract | Documenso integration; contract pre-filled with quote details, address, selected package; customer signs digitally; company counter-sign automated | Quote to Signed success metric |
| F09 | User can pay deposit via credit card or ACH | Stripe integration; deposit amount shown clearly (see F27); PCI-compliant; receipt emailed immediately | Checkout success rate ≥98.5% |
| F10 | User receives confirmation email and SMS after completing checkout | Resend + SignalWire; includes: summary, scheduled date, portal link, what to expect next | Pain: Poor communication (40%) |

#### Customer Portal

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F11 | User can access portal via magic link or email/password | Clerk auth; magic link sent in confirmation; can create password later; session persists 30 days | Richard UC6; Open Q6 resolved |
| F12 | User can view their quote details and signed contract | PDF download available; breakdown matches checkout view; contract shows both signatures | Richard UC6: Track status |
| F13 | User can see project timeline and current status | Milestones: Signed, Materials Ordered, Crew Scheduled, In Progress, Complete; updates sync from JobNimbus | Pain: Poor communication |
| F14 | User can reschedule appointment (within policy) | Cal.com reschedule; shows available slots; respects business rules (e.g., minimum notice); updates CRM | Richard UC6 |
| F15 | User can pay remaining balance | Stripe integration; shows amount due; supports partial payments if allowed | Full funnel completion |

#### Trust & Transparency

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F19 | User sees company credentials and trust signals throughout flow | Display: years in business, license numbers, insurance proof, BBB rating, review count; visible on key pages | Pain: 70% fear contractor quality |
| F20 | User sees itemized pricing breakdown (not just total) | Materials line items (shingles, underlayment, flashing, etc.); labor; permits; disposal; warranty; financing cost if applicable | Pain: 78% want transparency |
| F21 | User can share quote with others (e.g., spouse) via link | Unique shareable URL; recipient sees full quote without auth; link expires after 30 days | Richard workflow: Discuss with wife; Key Insight #10: Easy sharing |

#### ROI & Value Messaging

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F16 | User sees ROI and value messaging during quote flow | Display: 60-68% resale value ROI, 1-3 weeks faster home sale, 19% insurance premium savings; contextual based on roof age | Richard UC2: Understand ROI; Key Insight #4 |
| F17 | User can indicate primary motivation for replacement | Optional question: "What's driving your roof replacement?" Options: Pre-sale prep, Roof age/end of life, Insurance carrier requirement, Curb appeal, Energy efficiency, Other | Analytics + personalization opportunity |
| F18 | User sees premium material options highlighted | Best tier prominently featured; architectural and premium shingle options explained; energy efficiency benefits noted | Key Insight #8: Premium package emphasis; Beth/Patel needs |

#### Backend Integration

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F22 | Lead is created in JobNimbus upon address entry | Contact + Job created with source attribution (utm params); updates on each funnel step | CRM sync requirement |
| F23 | E-signature completion updates JobNimbus status | Webhook from Documenso triggers status change; PDF attached to job record | CRM sync |
| F24 | Booking confirmation syncs to JobNimbus calendar | Cal.com webhook updates job with scheduled date; creates calendar event | CRM sync |
| F25 | Payment receipt syncs to JobNimbus | Stripe webhook updates job with payment status and amount | CRM sync |
| F26 | TCPA consent is recorded for SMS communication | Consent timestamp, exact text shown, IP, user agent stored in DB; opt-out handling via STOP keyword | Legal compliance |

#### Business Rules

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F27 | Deposit amount is percentage-based with minimum | 10% of project total, minimum $500, maximum $2,500; displayed clearly before payment | Open Q4 resolved |
| F28 | Good/Better/Best pricing uses defined material tiers | Good: 3-tab standard, 10-year warranty; Better: architectural, 25-year warranty; Best: premium architectural, 50-year warranty; labor/timeline consistent | Open Q5 resolved |
| F29 | Pricing adjusts for roof complexity and pitch | Base price × complexity multiplier (simple: 1.0, moderate: 1.15, complex: 1.3) × pitch adjustment (per Roofr data) | Accurate estimating |

### Should Have (P1) - Important

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F30 | User can save progress and return via email link | "Save my quote" captures email; sends magic link to resume; quote persists 14 days | Reduce abandonment |
| F31 | User can live-chat with sales team during quote flow | Chat widget (Intercom/Crisp/similar); shows during business hours; fallback to contact form | Pain: Communication preference |
| F32 | User receives automated follow-up if quote abandoned | Email sequence at 1hr, 24hr, 72hr post-abandonment; links back to saved quote | Lead nurturing |
| F33 | User sees estimated project start date before booking | Based on current workload/season; shows range like "typically 2-3 weeks from signing" | Expectation setting |
| F34 | User can view and download material spec sheets | PDF links for shingle options, underlayment, etc.; educational content | Beth: Cares about specs and warranty |
| F35 | User receives project milestone notifications | SMS/email at key stages: materials ordered, crew scheduled, work starting tomorrow, complete | Pain: Communication |
| F36 | User can leave feedback/review after project completion | In-portal prompt; routes to Google/Yelp; captures NPS | Success indicator validation |
| F37 | User can see Google Reviews embedded on trust pages | Pull live reviews via API; show aggregate rating and recent positive reviews | Trust building |

### Could Have (P2) - Nice to Have

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F40 | User can view financing options from multiple providers | Show Wisetack + Hearth options side-by-side for larger projects (>$25K) | Financing flexibility |
| F41 | User can request a video call consultation | Cal.com event type for video chat; optional before signing | Complex decision support |
| F42 | User can see roof visualization with selected shingle color | Basic 2D overlay (not 3D viz); shows color on representative roof photo | Visual decision aid |
| F43 | User receives weather-triggered delay notifications | Integration with weather API; proactive SMS if scheduled work impacted | Proactive communication |
| F44 | User can apply referral code for discount | Track referral source; apply $ or % discount; attribute to referrer | Referral program |
| F45 | Spanish language support | Full translation of quote flow and portal; language detection or toggle | Demographics relevance |
| F46 | Energy efficiency comparison data | Show potential utility savings with premium materials; solar-ready options | Patel persona: Values sustainability |

### Won't Have (P3) - Out of Scope

| ID | Requirement | Reason | Revisit When |
|----|-------------|--------|--------------|
| F50 | Native mobile apps | Responsive web covers use cases; apps add significant complexity and maintenance | After stable web launch + user research shows demand |
| F51 | 3D roof visualization | High complexity, marginal MVP value; Gunner has but unclear ROI | Post-MVP if competitor pressure |
| F52 | Multi-region geographic routing | Focus on 4 target markets for MVP; expansion requires ops capacity | When Results Roofing expands service area |
| F53 | Full CRM replacement | JobNimbus is established; we integrate, not replace | Never (not our business) |
| F54 | Insurance claim filing integration | Self-pay only platform; no insurance carrier integration needed | Not applicable - out of target market |
| F55 | Custom repair estimates | MVP is full replacement only; repairs have different economics | Post-MVP if significant repair lead volume |
| F56 | A/B testing framework | Focus on shipping MVP first; optimize later | Phase 7 per timeline |
| F57 | Advanced analytics dashboards | GA4 + basic metrics suffice initially | Post-launch when patterns emerge |
| F58 | Multi-CRM simultaneous support | One CRM (JobNimbus) for MVP; adapter pattern allows future swap | When business requires different CRM |

---

## Non-Functional Requirements

### Performance

| Metric | Target | Measurement Method | Priority |
|--------|--------|-------------------|----------|
| Preliminary quote response time (p95) | ≤ 3 seconds | Server-side latency monitoring + RUM | P0 |
| Mobile LCP (quote flow pages) | ≤ 2.5 seconds | Lighthouse CI in pipeline + Core Web Vitals | P0 |
| Full page load (3G connection) | ≤ 4 seconds | Lighthouse throttled tests | P0 |
| Time to interactive | ≤ 3.5 seconds | Lighthouse TBT proxy | P0 |
| API response time (internal APIs) | ≤ 200ms (p95) | Server-side logging | P1 |
| Initial JS bundle size | ≤ 150KB gzipped | Build output analysis | P1 |
| Largest Contentful Paint (CLS) | ≤ 0.1 | Core Web Vitals | P1 |

### Reliability

| Metric | Target | Measurement Method | Priority |
|--------|--------|-------------------|----------|
| Estimator availability | ≥ 99.9% (8.7 hrs downtime/year) | Synthetic checks (Checkly or similar) | P0 |
| Checkout success rate | ≥ 98.5% | Payment completion / attempts | P0 |
| Error rate (5xx responses) | < 0.1% | Server logs / Vercel analytics | P0 |
| Integration failure recovery | Auto-retry with exponential backoff | Integration test scenarios | P0 |
| Data persistence | Zero data loss on unexpected errors | Auto-save + transaction guarantees | P0 |
| External API timeout handling | Graceful degradation with user messaging | Manual testing + monitoring | P1 |

### Security

| Requirement | Implementation | Priority |
|-------------|---------------|----------|
| All traffic over HTTPS | Vercel automatic SSL; HSTS header | P0 |
| PCI compliance for payments | Stripe-hosted checkout; no card data touches our servers | P0 |
| API authentication | Clerk JWT for protected routes; API keys for webhooks | P0 |
| Input validation | Zod schemas on all form inputs; sanitize before DB | P0 |
| SQL injection prevention | Parameterized queries via ORM (Prisma/Drizzle) | P0 |
| XSS prevention | React auto-escaping; CSP headers | P0 |
| CSRF protection | SameSite cookies; origin validation | P0 |
| Secrets management | Environment variables via Vercel; never in code | P0 |
| Rate limiting | API routes rate-limited (100 req/min per IP) | P1 |
| Webhook signature verification | HMAC validation for all inbound webhooks | P0 |

### Usability

| Requirement | Target | Priority |
|-------------|--------|----------|
| Keyboard navigation | All interactive elements focusable and operable via keyboard | P0 |
| Screen reader compatibility | WCAG 2.1 AA compliance; semantic HTML; ARIA labels | P1 |
| Loading state indication | Spinner/skeleton for any operation > 300ms | P0 |
| Error messages | All errors show user-friendly message with suggested action; no raw error codes | P0 |
| Mobile touch targets | Minimum 44x44px for all interactive elements | P0 |
| Form validation feedback | Inline validation; errors appear on blur; clear success states | P0 |
| Progress indication | Step indicator shows current position in funnel (e.g., "Step 2 of 5") | P0 |

### Compatibility

| Platform | Minimum Version | Priority |
|----------|-----------------|----------|
| Chrome (Desktop) | Last 2 major versions | P0 |
| Chrome (Android) | Last 2 major versions | P0 |
| Safari (Desktop) | Last 2 major versions | P0 |
| Safari (iOS) | iOS 15+ | P0 |
| Firefox | Last 2 major versions | P1 |
| Edge | Last 2 major versions | P1 |
| Screen width | 320px minimum (responsive) | P0 |

---

## Constraints

### Technical Constraints

- **Database**: Neon PostgreSQL via Vercel integration (connection pooling limits apply)
- **Hosting**: Vercel only (no AWS/GCP direct deployment)
- **Measurement API**: Roofr reports take 24-48 hours; UX must accommodate async delivery
- **E-signature**: Documenso self-hosted requires Docker deployment and maintenance
- **Prohibited technologies**: NO WordPress, NO Supabase, NO Twilio (project non-negotiables)
- **File upload limits**: Vercel serverless function timeout (10s default, 60s max on Pro)
- **API rate limits**: Google Places (varies by plan), Roofr (TBD), Wisetack (TBD)

### Business Constraints

- **Team size**: 1 developer (AI-assisted) + client stakeholders for UAT
- **Timeline**: MVP in ~8 weeks (140-160 hours per SOW)
- **Budget**: Infrastructure costs should stay minimal (<$100/month for MVP traffic)
- **Service area**: Texas (affluent markets), Atlanta GA, Wilmington NC, Phoenix AZ only
- **Product scope**: Full roof replacement only (no repairs)
- **CRM**: JobNimbus is the source of truth for job management; we sync, not replace
- **Customer type**: Self-pay homeowners only (no insurance claims)

### Timeline Constraints

- **Planning complete**: End of Week 1
- **MVP launch target**: Week 8-9
- **Soft launch (10% traffic)**: Before full launch
- **UAT window**: Minimum 1 week before launch
- **No hard external deadline**: Quality over arbitrary dates

---

## Assumptions

| Assumption | Impact if Wrong | Validation Plan |
|------------|-----------------|-----------------|
| Roofr API can return preliminary sq ft estimate quickly (before full report) | Would need alternative instant estimate source (county data, ML estimate) | Spike: Test Roofr API capabilities in Week 1 |
| Wisetack pre-qual embed works in our flow | Would need alternative financing provider or redirect flow | Integration test in Week 2 |
| Users have stable internet during quote flow | Would need offline support (major scope) | GA4 session completion rates post-launch |
| Primary users are on mobile (>60%) | Would deprioritize mobile-first if desktop dominant | GA4 device analytics post-launch |
| JobNimbus API supports all required operations | Would need workarounds or manual processes | API testing in Week 1 |
| Cal.com slot holds work as documented | Would need custom hold logic | Integration test in Week 2 |
| Results Roofing has brand assets (logo, colors) available | Would need brand design work (out of scope) | Request assets from client immediately |
| Documenso self-hosted is reliable at expected volume | Would need fallback to DocuSign/similar (adds cost) | Load testing before launch |
| Affluent self-pay customers value transparency over lowest price | Would need to adjust value proposition | Post-launch conversion analysis |

---

## Dependencies

### External Services

| Dependency | Purpose | Risk Level | Mitigation |
|------------|---------|------------|------------|
| Roofr | Roof measurements | Medium | Adapter pattern; could swap to EagleView; show preliminary estimate while waiting |
| Wisetack | Financing pre-qual | Medium | Adapter pattern; Hearth as backup; flow works without financing |
| Documenso | E-signatures | Medium | Self-hosted = we control uptime; DocuSign adapter as fallback |
| Cal.com | Appointment booking | Low | Widely used; self-hostable if needed; simple to replace |
| Stripe | Payments | Low | Industry standard; highly reliable; PCI handled |
| Clerk | Authentication | Low | Well-documented; could swap to Auth0/NextAuth if needed |
| JobNimbus | CRM sync | Medium | Core business tool; adapter pattern; sync failures queue for retry |
| SignalWire | SMS | Low | Commodity service; easy to swap providers |
| Resend | Email | Low | Commodity service; easy to swap providers |
| Google Places | Address validation | Low | Highly reliable; Mapbox as alternative |
| Vercel | Hosting | Low | Excellent reliability; platform lock-in manageable |
| Neon | Database | Low | Standard PostgreSQL; can migrate to any Postgres host |

### Third-Party Libraries

| Library | Purpose | Risk Level | Notes |
|---------|---------|------------|-------|
| Next.js | Framework | Low | Industry standard, Vercel-maintained, large ecosystem |
| React | UI library | Low | Ubiquitous, stable, well-maintained |
| Clerk SDK | Auth integration | Low | First-party SDK, well-documented |
| Stripe.js | Payment integration | Low | Required for PCI compliance |
| React Hook Form | Form handling | Low | Popular, stable, performant |
| Zod | Validation | Low | Type-safe, widely adopted |
| Ark UI | Component primitives | Low | Actively maintained, accessible by default |
| Prisma or Drizzle | ORM | Low | Either is well-maintained; decide in tech architecture |

### Risk Assessment Matrix

| Risk Level | Criteria | Action |
|------------|----------|--------|
| **Low** | Widely used, active maintenance, easy to replace, multiple alternatives | Standard monitoring |
| **Medium** | Some lock-in, async dependency, or less proven at scale | Plan mitigation, test early, monitor closely |
| **High** | Single point of failure, hard to replace, unproven | Active mitigation required; avoid if possible |

---

## Open Questions

| # | Question | Owner | Status | Decision |
|---|----------|-------|--------|----------|
| 1 | Measurement timing UX | Resolved | Decided | Show preliminary estimate immediately; refine when Roofr returns (F02, F03) |
| 2 | Service area boundary handling | Resolved | Decided | Soft stop: message + email capture for future expansion (F01) |
| 3 | Deposit amount structure | Resolved | Decided | 10% of total, min $500, max $2,500 (F27) |
| 4 | Good/Better/Best pricing rules | Resolved | Decided | Material tiers + warranty; same labor; complexity multiplier (F28, F29) |
| 5 | Portal authentication | Resolved | Decided | Email/password + magic link; defer OAuth to P1 (F11) |
| 6 | Brand assets availability | Resolved | Decided | BRAND-ASSETS.md created with Dune+OpenAI aesthetic |

---

## Related Documents

| Doc | Relationship |
|-----|--------------|
| [01-vision-and-goals.md](./01-vision-and-goals.md) | Requirements support success criteria defined there |
| [02-user-personas.md](./02-user-personas.md) | Requirements address persona pain points and use cases |
| [04-feature-breakdown.md](./04-feature-breakdown.md) | Features implement these requirements (next doc) |
| [07-technical-architecture.md](./07-technical-architecture.md) | Technical constraints inform feasibility |
| [11-security-considerations.md](./11-security-considerations.md) | Security requirements detailed there |
| [14-performance-goals.md](./14-performance-goals.md) | Performance requirements detailed there |
| [18-decision-log.md](./18-decision-log.md) | Log major requirement decisions |
| [INTEGRATION-SPECS.md](./INTEGRATION-SPECS.md) | Integration dependencies and contracts |

---

## Document Completion Checklist

- [x] At least 3 P0 (Must Have) requirements with testable acceptance criteria (26 P0 requirements)
- [x] All P0 requirements trace to persona pain points or use cases
- [x] Non-functional requirements have specific, measurable targets
- [x] All constraints documented (technical, business, timeline)
- [x] All external dependencies identified with risk levels
- [x] Assumptions documented with validation plans
- [x] Open questions resolved or explicitly deferred with owner
- [x] Updated for self-pay pivot (Session 16) - F16-F18 repurposed from insurance to ROI/value messaging

**Status: COMPLETE** - Updated for self-pay pivot. Ready to proceed.
