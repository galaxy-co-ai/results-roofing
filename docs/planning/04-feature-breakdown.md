# 04 - Feature Breakdown

<!-- AI: This document breaks requirements (doc 03) into implementable features. Complete after docs 01-03 and before design docs (05+). This bridges discovery and design phases. Updated Session 16 for self-pay pivot - F16-F18 repurposed from insurance to ROI/Value Messaging. -->

## Feature Index

| ID | Feature Name | Priority | Effort | Status | Sprint |
|----|--------------|----------|--------|--------|--------|
| F01 | Address Validation & Service Area Check | P0 | M | Planned | 1 |
| F02 | Preliminary Price Estimate | P0 | L | Planned | 1 |
| F03 | Detailed Measurement-Based Quote | P0 | L | Planned | 2 |
| F04 | Package Comparison View | P0 | M | Planned | 2 |
| F05 | Package Selection & Checkout Entry | P0 | S | Planned | 2 |
| F06 | Financing Pre-Qualification | P0 | M | Planned | 3 |
| F07 | Appointment Scheduling | P0 | M | Planned | 3 |
| F08 | Contract E-Signature | P0 | L | Planned | 3 |
| F09 | Deposit Payment | P0 | M | Planned | 3 |
| F10 | Confirmation & Notifications | P0 | M | Planned | 3 |
| F11 | Portal Authentication | P0 | M | Planned | 4 |
| F12 | Quote & Contract Viewer | P0 | M | Planned | 4 |
| F13 | Project Status Timeline | P0 | M | Planned | 4 |
| F14 | Appointment Rescheduling | P0 | S | Planned | 4 |
| F15 | Balance Payment | P0 | S | Planned | 4 |
| F16 | ROI & Value Messaging Display | P0 | S | Planned | 2 |
| F17 | Replacement Motivation Capture | P0 | S | Planned | 2 |
| F18 | Premium Material Showcase | P0 | M | Planned | 2 |
| F19 | Trust & Credentials Display | P0 | M | Planned | 1 |
| F20 | Itemized Pricing Breakdown | P0 | M | Planned | 2 |
| F21 | Shareable Quote Links | P0 | M | Planned | 2 |
| F22 | JobNimbus Lead Sync | P0 | L | Planned | 1 |
| F23 | E-Signature Status Sync | P0 | M | Planned | 3 |
| F24 | Booking Calendar Sync | P0 | M | Planned | 3 |
| F25 | Payment Status Sync | P0 | M | Planned | 3 |
| F26 | TCPA Consent Tracking | P0 | M | Planned | 1 |
| F27 | Deposit Calculation Engine | P0 | S | Planned | 2 |
| F28 | Good/Better/Best Tier Pricing | P0 | L | Planned | 2 |
| F29 | Complexity & Pitch Pricing | P0 | M | Planned | 2 |

---

## Effort Estimation Guide

| Size | Typical Scope | Time Range | Example |
|------|---------------|------------|---------|
| **S** (Small) | Single component, no new patterns | 1-2 hours | Add a button, fix styling, simple bug fix |
| **M** (Medium) | Multiple components, follows existing patterns | 2-8 hours | New form, API integration, feature enhancement |
| **L** (Large) | New patterns, multiple files, needs design | 1-3 days | New page/view, complex component, new data model |
| **XL** (Extra Large) | Architectural changes, multiple systems | 3-5 days | Auth system, major refactor, new infrastructure |

**If larger than XL**: Break into smaller features. XL is the maximum for a single feature.

---

## Feature Details

### Core Funnel Features (F01-F10)

---

### F01: Address Validation & Service Area Check

#### User Story

As **Richard** (affluent homeowner preparing for roof replacement), I want to enter my property address and immediately know if Results Roofing serves my area, so that I don't waste time if they can't help me.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Gate to entire funnel - nothing works without valid address |
| Effort | M | Google Places integration + service area logic + out-of-area handling |
| Risk | Low | Well-documented APIs; clear success criteria |

#### Acceptance Criteria

- [ ] Address autocomplete appears after typing 3+ characters
- [ ] Autocomplete shows formatted addresses from Google Places
- [ ] User can select address from dropdown or continue typing
- [ ] Selected address is validated and geocoded (lat/long stored)
- [ ] Service area check validates against target markets (TX affluent, Atlanta GA, Wilmington NC, Phoenix AZ)
- [ ] Valid service area address: proceeds to estimate (F02)
- [ ] Invalid address (outside service area): shows friendly message + email capture form
- [ ] Out-of-area email capture: stores email, zip, timestamp for future expansion leads
- [ ] Address validation completes in < 1 second (p95)
- [ ] Works on mobile keyboard with autocomplete enabled
- [ ] Handles edge cases: PO boxes (reject with message), new construction (allow with warning)
- [ ] Unit/apartment numbers handled (roof service for single-family only - display guidance)

#### UI/UX Notes

- **Input**: Single address field with autocomplete dropdown
- **Loading**: Subtle spinner in field during lookup
- **Success**: Checkmark icon, address formatted below field
- **Error - Invalid**: Red outline, inline error message
- **Error - Out of Area**: Modal/inline message with empathy ("We'd love to help! We're not in your area yet.") + email capture
- **Mobile**: Full-width input, dropdown should not overlap keyboard

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Raw address input | User | Session only |
| Formatted address | Google Places API | Quote record |
| Lat/long coordinates | Google Places API | Quote record |
| Service area list | Static config (zip codes or boundary polygons for target markets) | Environment/DB config |
| Out-of-area lead | Email capture form | `out_of_area_leads` table |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Google Places | Autocomplete + geocode | Rate limit ~17K/day on free tier |
| JobNimbus (F22) | Create lead on valid address | Triggered after validation |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Blocks | F02 (Preliminary Estimate) | Need address to estimate |
| Blocks | F22 (Lead Sync) | Need address to create CRM record |
| Blocks | All funnel features | Address is foundation |

#### Technical Notes

- Use `@googlemaps/react-wrapper` or headless Places API
- Debounce autocomplete requests (300ms)
- Store normalized address format for downstream matching
- Consider: Address might exist in Google but not have Roofr data - handle gracefully

#### Open Questions

- None - service area (TX, GA, NC, AZ target markets) confirmed in PRD

---

### F02: Preliminary Price Estimate

#### User Story

As **Richard**, I want to see a ballpark price estimate within seconds of entering my address, so that I can immediately understand if a new roof fits my plans before committing more time.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Key differentiator - instant pricing (78% want transparency) |
| Effort | L | Requires preliminary data source, pricing engine, 3-tier display |
| Risk | Medium | Accuracy depends on preliminary sq ft data source |

#### Acceptance Criteria

- [ ] Estimate displays within 3 seconds of valid address submission
- [ ] Shows price RANGE for all three tiers (Good/Better/Best)
- [ ] Price format: "$X,XXX - $XX,XXX" range per tier
- [ ] Clearly labeled as "Preliminary Estimate" with explanation
- [ ] Explanation text: "Based on typical homes in your area. Final price based on detailed measurements."
- [ ] If sq ft data unavailable: show "Request Detailed Quote" with explanation
- [ ] Estimate includes base materials + labor (not financing, permits shown separately if applicable)
- [ ] User can proceed to request detailed quote (triggers Roofr measurement)
- [ ] User can proceed directly to package selection with preliminary pricing
- [ ] Estimate saved to session/DB with timestamp
- [ ] CTA clear: "Get Exact Price" (triggers F03) or "Continue with Estimate"

#### UI/UX Notes

- **Layout**: Three cards side-by-side (desktop) or stacked (mobile) for Good/Better/Best
- **Each card shows**: Tier name, price range, key differentiator (e.g., "50-Year Warranty")
- **Visual hierarchy**: "Best" tier may be highlighted for affluent market (quality-focused)
- **Loading state**: Skeleton cards while calculating
- **Trust element**: Show "Pricing updated [date]" to indicate freshness
- **Disclaimer**: Small text explaining estimate basis

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Address sq ft (preliminary) | County assessor data OR Roofr instant estimate OR ML model | Cache by address |
| Pricing rules | F27-F29 business logic | DB config |
| Tier definitions | Static config | DB/config |
| Generated estimate | Calculated | `quotes` table (status: preliminary) |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Roofr (future) | Instant estimate API if available | May not exist - fallback needed |
| County data | Property data lookup | May need third-party (CoreLogic, ATTOM) |
| Internal | Pricing engine (F27-F29) | Business rules |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F01 (Address Validation) | Need valid address |
| Requires | F27 (Deposit Calc) | Deposit shown if proceeding |
| Requires | F28 (Tier Pricing) | Three-tier pricing logic |
| Requires | F29 (Complexity Pricing) | Adjustments if complexity known |
| Blocks | F03 (Detailed Quote) | Preliminary is shown first |
| Blocks | F04 (Package Comparison) | Initial data for comparison |

#### Technical Notes

- **Preliminary data source decision needed**: Options:
  1. Roofr instant API (if exists)
  2. County assessor API (CoreLogic, ATTOM Data)
  3. Simple sq ft estimator (avg sq ft per home age/type)
  4. User self-reports sq ft (fallback)
- Cache preliminary estimates by address (24-hour expiry)
- Track conversion: preliminary → detailed quote request

#### Open Questions

- None - UX approach (show preliminary, refine later) confirmed in PRD

---

### F03: Detailed Measurement-Based Quote

#### User Story

As **Richard**, I want to receive an accurate, detailed quote based on professional roof measurements, so that I know exactly what I'll pay without surprises.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Accurate pricing essential for trust and closing |
| Effort | L | Roofr integration, async handling, quote update logic, UI for refined estimate |
| Risk | Medium | 24-48 hour Roofr turnaround requires async UX design |

#### Acceptance Criteria

- [ ] User can request detailed measurement (triggers Roofr API)
- [ ] System displays "Measurement in progress" status with expected timeframe
- [ ] User receives email when detailed quote is ready
- [ ] User receives SMS when detailed quote is ready (if consented)
- [ ] Quote page shows updated pricing with "Measurements Complete" badge
- [ ] Quote shows full breakdown: sq ft, pitch, facet count, complexity rating
- [ ] Price updated from preliminary to final (may go up or down)
- [ ] If preliminary was shown: highlight what changed and why
- [ ] Quote includes: materials (itemized), labor, permits, disposal, warranty
- [ ] PDF version available for download
- [ ] Quote valid for 30 days (expiration shown)
- [ ] Quote shareable via link (F21)

#### UI/UX Notes

- **Pending state**: Progress indicator, "We're measuring your roof" with illustration
- **Ready notification**: "Your detailed quote is ready!" email/SMS with direct link
- **Quote page**: Clean breakdown with expandable sections for detail
- **Change highlight**: If price differs from preliminary by >10%, explain why (e.g., "Your roof is larger than average for your area")
- **Trust signals**: Show Roofr logo/badge as third-party verification

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Roofr job ID | Roofr API response | `measurements` table |
| Measurement status | Roofr polling/webhook | `measurements` table |
| Sq ft total | Roofr report | `measurements` table |
| Pitch (primary) | Roofr report | `measurements` table |
| Complexity rating | Roofr report OR calculated | `measurements` table |
| Final quote | Pricing engine | `quotes` table (status: final) |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Roofr | Submit measurement request | On user action or auto after address |
| Roofr | Poll status OR receive webhook | Check every 4 hours or webhook |
| Roofr | Retrieve report | When status = complete |
| Resend (F10) | Send "quote ready" email | Triggered by webhook/poll |
| SignalWire (F10) | Send "quote ready" SMS | If consent captured |
| JobNimbus (F22) | Update job with quote details | Sync final quote |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F01 (Address Validation) | Need valid address |
| Requires | F02 (Preliminary Estimate) | Shown while waiting |
| Requires | F27-F29 (Pricing Rules) | Calculate final price |
| Requires | F22 (JobNimbus Sync) | Update CRM with quote |
| Blocks | F04 (Package Comparison) | Final data for comparison |
| Blocks | F08 (E-Signature) | Contract needs final pricing |

#### Technical Notes

- Implement Roofr adapter per INTEGRATION-SPECS.md pattern
- Polling strategy: check every 4 hours, max 72 hours
- Webhook preferred if Roofr supports
- Store raw Roofr response for debugging
- Handle Roofr failure gracefully (manual measurement fallback)

#### Open Questions

- None - async UX approach confirmed in PRD

---

### F04: Package Comparison View

#### User Story

As **Richard**, I want to compare Good/Better/Best roofing packages side-by-side, so that I can make an informed decision about which option best fits my quality expectations and neighborhood standards.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Core decision point - 78% want transparent pricing comparison |
| Effort | M | UI-heavy, educational tooltips, responsive design |
| Risk | Low | Standard comparison UI pattern |

#### Acceptance Criteria

- [ ] Three packages displayed side-by-side (desktop) or stacked (mobile)
- [ ] Each package shows: name, price, materials, warranty, estimated timeline
- [ ] Material details: shingle brand/type, underlayment, flashing, ventilation
- [ ] Warranty terms clear: material warranty vs. workmanship warranty
- [ ] Differences between tiers highlighted visually
- [ ] Educational tooltips on hover/tap for technical terms
- [ ] "Best" tier may be highlighted for affluent market (premium buyers)
- [ ] Monthly payment preview shown (soft-pull not required yet)
- [ ] "What's included in all packages" section (labor, permits, cleanup, etc.)
- [ ] Mobile: swipe between packages or expandable accordions
- [ ] User can select package to proceed (F05)
- [ ] Comparison data matches final quote (F03) or preliminary (F02)

#### UI/UX Notes

- **Card layout**: Equal visual weight, Best tier emphasized for premium market
- **Price display**: Total prominently, monthly payment estimate smaller
- **Feature comparison**: Checkmarks for included items, clear differentiation
- **Tooltips**: Info icons for terms like "architectural shingles," "ice & water shield"
- **Trust elements**: Brand logos for materials (Owens Corning, GAF, etc.)
- **CTA per card**: "Select Good/Better/Best" buttons

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Package definitions | Business config | `package_tiers` table |
| Material specs per tier | Business config | `package_tiers` or related |
| Warranty terms | Business config | `package_tiers` |
| Calculated prices | F27-F29 pricing engine | `quotes` table |
| Financing estimates | Simple calculation (no API yet) | Calculated on display |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| None directly | Display only | Uses already-calculated quote data |
| Wisetack (F06) | Soft link to financing | Shown after selection if needed |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F02 OR F03 | Need pricing data to display |
| Requires | F28 (Tier Pricing) | Package definitions |
| Requires | F20 (Itemized Pricing) | Breakdown data |
| Blocks | F05 (Package Selection) | User selects from here |

#### Technical Notes

- Build as reusable comparison component
- Consider animation for tier highlight on hover
- Lazy-load tooltip content for performance
- Ensure table is accessible (screen reader announces comparisons)

#### Open Questions

- None - tier structure confirmed in PRD

---

### F05: Package Selection & Checkout Entry

#### User Story

As **Richard**, I want to select my preferred roofing package and proceed to checkout, so that I can lock in my price and move forward with the project efficiently.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Conversion point - must be frictionless |
| Effort | S | Simple selection logic, cart/session management |
| Risk | Low | Standard e-commerce pattern |

#### Acceptance Criteria

- [ ] Each package card has clear "Select" CTA
- [ ] Clicking "Select" highlights chosen package
- [ ] Selected package persists in session and DB
- [ ] "Continue to Checkout" button appears after selection
- [ ] User can change selection before checkout submission
- [ ] Selection shows summary: package name, total price, deposit amount (F27)
- [ ] Mobile: sticky bottom bar with selection summary + CTA
- [ ] If user returns later: previously selected package pre-selected
- [ ] Analytics event fired on package selection (tier, price, quote_id)

#### UI/UX Notes

- **Selection feedback**: Card border highlight, checkmark, subtle animation
- **Summary bar**: Fixed position showing "You selected: Best Package - $18,500"
- **Change option**: "Change selection" link returns to comparison
- **Checkout CTA**: Primary button, clear "Proceed to Checkout" or "Next: Schedule & Pay"
- **Mobile**: Bottom sheet or sticky bar for selection summary

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Selected package ID | User action | `quotes.selected_tier` |
| Selection timestamp | System | `quotes.tier_selected_at` |
| Package details | F28 tier definitions | Reference |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| JobNimbus (F22) | Update job with selected package | Sync selection |
| Analytics | Track selection event | Conversion funnel |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F04 (Package Comparison) | User selects from comparison |
| Requires | F27 (Deposit Calc) | Show deposit amount |
| Blocks | F06 (Financing) | Next step in funnel |
| Blocks | F07 (Scheduling) | Next step in funnel |
| Blocks | F08 (E-Signature) | Package in contract |

#### Technical Notes

- Use URL state or session for package selection
- Prevent double-submission
- Log all selection changes for analytics

#### Open Questions

- None

---

### F06: Financing Pre-Qualification

#### User Story

As **Richard**, I want to check financing options in under 60 seconds without hurting my credit, so that I can understand my monthly payment options and preserve my capital for other investments.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Provides payment flexibility - even affluent buyers value options |
| Effort | M | Wisetack embed integration, flow management |
| Risk | Medium | Third-party embed UX; approval/denial handling |

#### Acceptance Criteria

- [ ] Financing option presented after package selection (not required)
- [ ] User can skip financing and proceed to full payment
- [ ] "Check my rate" triggers Wisetack pre-qual embed
- [ ] Pre-qual completes in < 60 seconds
- [ ] Soft credit pull only (no impact to credit score) - clearly communicated
- [ ] Approval: shows approved amount, term options, monthly payments
- [ ] Partial approval: shows approved amount if less than project total
- [ ] Denial: shows graceful message, option to proceed without financing
- [ ] User can select financing term (12/24/36/48 months if available)
- [ ] Selected financing terms persist to contract (F08)
- [ ] Wisetack pre-qual status synced to quote record
- [ ] User can return to change financing decision before signing

#### UI/UX Notes

- **Entry point**: "Pay Over Time" option alongside "Pay in Full Today"
- **Soft pull callout**: Badge/text "Checking rates won't affect your credit score"
- **Embed**: Wisetack widget inline or modal
- **Approval display**: Monthly payment prominently ("$387/month for 48 months")
- **Comparison**: Show total cost of financing vs. cash price
- **Skip option**: Clear "No thanks, I'll pay in full" button
- **Positioning**: For affluent market, position as "smart capital management" not "can't afford"

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Pre-qual request | Wisetack API | `financing_applications` table |
| Approval status | Wisetack webhook | `financing_applications` |
| Approved amount | Wisetack webhook | `financing_applications` |
| Selected term | User action | `quotes.financing_term` |
| Monthly payment | Calculated | Displayed, stored in quote |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Wisetack | Generate pre-qual link/embed | On user action |
| Wisetack | Webhook: prequal_complete | Updates application status |
| JobNimbus (F22) | Update job with financing status | Sync approval/denial |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F05 (Package Selection) | Need price to finance |
| Blocks | F08 (E-Signature) | Financing terms in contract |

#### Technical Notes

- Wisetack embed via iframe or SDK (check current integration method)
- Handle timeout gracefully (> 90 seconds)
- Store approval for 30 days (or per Wisetack policy)
- Build adapter pattern for future Hearth integration (P1)

#### Open Questions

- None - Wisetack confirmed as primary provider

---

### F07: Appointment Scheduling

#### User Story

As **Richard**, I want to book my inspection or installation appointment online from available time slots, so that I can complete this efficiently without phone calls.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Eliminates phone friction - time-poor customers value self-service |
| Effort | M | Cal.com integration, slot holds, checkout flow integration |
| Risk | Medium | Slot hold logic must prevent double-booking |

#### Acceptance Criteria

- [ ] Calendar shows available appointment slots (next 2-4 weeks)
- [ ] Slots pulled from Cal.com availability API
- [ ] User can select date and time slot
- [ ] Selected slot held for 15 minutes during checkout
- [ ] Hold released if checkout abandoned or times out
- [ ] Booking confirmed only after payment (F09) succeeds
- [ ] User receives confirmation with calendar invite (.ics)
- [ ] User can see selected appointment in checkout summary
- [ ] Business rules respected: no weekends (unless configured), blackout dates, lead time
- [ ] Mobile: date picker optimized for touch
- [ ] If no slots available: show "Call us to schedule" fallback

#### UI/UX Notes

- **Calendar view**: Week view or list view with time slots
- **Slot display**: Show date, time window (e.g., "Morning 8am-12pm")
- **Selection feedback**: Highlighted slot, "Reserved for 15 min" indicator
- **Summary**: "Your appointment: Tuesday, Feb 15, 8am-12pm"
- **Timer**: Subtle countdown if showing hold expiration

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Available slots | Cal.com API | Cached, refresh every 5 min |
| Selected slot | User action | `quotes.scheduled_slot` |
| Hold ID | Cal.com hold API | `appointment_holds` table |
| Confirmed booking | Cal.com booking API | `appointments` table |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Cal.com | Get availability | Slots for event type |
| Cal.com | Hold slot | Reserve during checkout |
| Cal.com | Confirm booking | After payment success |
| Cal.com | Release hold | On abandon/timeout |
| Cal.com | Webhook | booking.created → CRM sync |
| JobNimbus (F24) | Sync booking | Update job calendar |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F05 (Package Selection) | Know what we're scheduling |
| Requires | F09 (Payment) | Booking confirms after payment |
| Blocks | F08 (E-Signature) | Date in contract |
| Blocks | F10 (Confirmation) | Appointment in confirmation |
| Blocks | F14 (Reschedule) | Need booking to reschedule |

#### Technical Notes

- Cal.com event type: "Roof Inspection" or "Installation" (configure in Cal.com)
- Hold mechanism: use Cal.com's built-in hold or implement via tentative booking
- Background job to release expired holds
- Handle timezone: display in user's local time, store UTC

#### Open Questions

- None - Cal.com confirmed; slot hold approach confirmed

---

### F08: Contract E-Signature

#### User Story

As **Richard**, I want to review and sign my roofing contract online, so that I can finalize my project without printing, scanning, or mailing documents.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Legal requirement to close deal |
| Effort | L | Documenso integration, contract generation, signing flow, storage |
| Risk | Medium | Self-hosted Documenso requires ops; contract template critical |

#### Acceptance Criteria

- [ ] Contract generated with quote details (address, package, price, terms)
- [ ] Contract includes: scope of work, payment terms, warranty, cancellation policy
- [ ] User can review full contract before signing
- [ ] Scroll-through or pagination required before signature
- [ ] User signs via typed name, drawn signature, or click-to-sign
- [ ] Signing timestamp and IP recorded
- [ ] Company counter-signature applied automatically
- [ ] Both parties receive signed PDF via email
- [ ] Signed contract stored in system (linked to quote/job)
- [ ] Contract accessible in customer portal (F12)
- [ ] Documenso webhook triggers status update

#### UI/UX Notes

- **Review phase**: PDF viewer or HTML preview with key terms highlighted
- **Key terms callout**: Box summarizing total price, deposit, warranty, start date
- **Signature capture**: Simple typed signature sufficient for MVP
- **Completion**: Green checkmark, "Contract Signed!" celebration
- **Email preview**: Show recipient email address before sending

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Contract template | Business config | `contract_templates` table |
| Populated contract | Merge quote data + template | `contracts` table |
| Documenso document ID | Documenso API | `contracts.documenso_id` |
| Signature status | Documenso webhook | `contracts.status` |
| Signed PDF | Documenso API | Object storage + `contracts.pdf_url` |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Documenso | Create document | Upload populated contract |
| Documenso | Add recipients | Customer + company signer |
| Documenso | Send for signature | Embed or email link |
| Documenso | Webhook: completed | Update status, fetch PDF |
| JobNimbus (F23) | Update job status | Mark as "Signed" |
| Resend | Send signed copy | Both parties |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F05 (Package Selection) | Package in contract |
| Requires | F06 (Financing) | Terms in contract if financed |
| Requires | F07 (Scheduling) | Date in contract |
| Requires | F03 OR F02 | Pricing data in contract |
| Requires | F20 (Itemized Pricing) | Breakdown in contract |
| Blocks | F09 (Payment) | Sign before pay (or simultaneous) |
| Blocks | F12 (Contract Viewer) | Signed contract in portal |
| Blocks | F23 (E-Sign Sync) | Triggers CRM update |

#### Technical Notes

- Documenso self-hosted deployment needed pre-MVP
- Contract template: use document generation (HTML → PDF or template merge)
- Consider embedded signing vs. redirect to Documenso
- Store raw webhook payloads for audit trail

#### Open Questions

- None - Documenso confirmed

---

### F09: Deposit Payment

#### User Story

As **Richard**, I want to pay my deposit securely with a credit card or bank transfer, so that I can lock in my appointment and start my project.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Revenue collection; confirms customer commitment |
| Effort | M | Stripe integration, payment form, receipt handling |
| Risk | Low | Stripe is well-documented and reliable |

#### Acceptance Criteria

- [ ] Deposit amount displayed clearly (calculated per F27)
- [ ] Payment methods: credit card and ACH bank transfer
- [ ] Card payment via Stripe Elements (PCI compliant - no card data on our servers)
- [ ] ACH payment via Stripe (if enabled)
- [ ] Payment processing shows loading state
- [ ] Success: confirmation screen with receipt number
- [ ] Failure: clear error message with retry option
- [ ] Receipt emailed immediately via Stripe or custom email
- [ ] Payment recorded in database with Stripe payment intent ID
- [ ] Idempotency: prevent double-charge on retry/refresh
- [ ] If payment fails after retry: save progress, allow return later
- [ ] Refund policy clearly displayed before payment

#### UI/UX Notes

- **Amount display**: "Deposit: $1,850" with breakdown if helpful
- **Payment form**: Stripe Elements card input
- **ACH toggle**: "Pay with bank account" option
- **Security badges**: "Secure payment powered by Stripe" + lock icon
- **Processing**: "Processing payment..." with spinner
- **Success**: Checkmark, receipt number, "You're all set!" message
- **Failure**: Red alert, specific error (card declined, insufficient funds)

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Deposit amount | F27 calculation | `quotes.deposit_amount` |
| Payment intent ID | Stripe API | `payments.stripe_payment_intent_id` |
| Payment status | Stripe webhook | `payments.status` |
| Receipt URL | Stripe API | `payments.receipt_url` |
| Payment method | User selection | `payments.method` (card/ach) |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Stripe | Create payment intent | Amount, metadata |
| Stripe | Confirm payment | Client-side via Elements |
| Stripe | Webhook: payment_intent.succeeded | Update DB, trigger confirmation |
| Stripe | Webhook: payment_intent.failed | Update DB, notify user |
| JobNimbus (F25) | Sync payment status | Update job with payment |
| Resend (F10) | Send receipt email | Triggered on success |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F27 (Deposit Calc) | Calculate amount |
| Requires | F07 (Scheduling) | Slot confirmed after payment |
| Requires | F08 (E-Signature) | Sign before or with payment |
| Blocks | F10 (Confirmation) | Payment triggers confirmation |
| Blocks | F15 (Balance Payment) | Sets up remaining balance |
| Blocks | F25 (Payment Sync) | Triggers CRM update |

#### Technical Notes

- Use Stripe Payment Intents for modern payment flow
- Enable 3D Secure for fraud protection
- Idempotency key on payment intent creation
- Webhook signature verification per INTEGRATION-SPECS.md
- Store minimum PCI data (last 4 digits, brand for display only)

#### Open Questions

- None - Stripe confirmed; deposit formula confirmed in PRD

---

### F10: Confirmation & Notifications

#### User Story

As **Richard**, I want to receive immediate confirmation via email and text after completing my purchase, so that I have peace of mind that everything went through and know what to expect next.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | 40% cite poor communication - immediate confirmation is table stakes |
| Effort | M | Email template, SMS integration, confirmation page |
| Risk | Low | Standard notification pattern |

#### Acceptance Criteria

- [ ] Confirmation page displays immediately after payment success
- [ ] Confirmation email sent within 30 seconds
- [ ] Confirmation SMS sent within 30 seconds (if consent given)
- [ ] Email includes: order summary, scheduled date, deposit paid, next steps
- [ ] Email includes: PDF of signed contract (or link)
- [ ] Email includes: customer portal link with magic link auth
- [ ] SMS includes: short confirmation + portal link
- [ ] Confirmation page shows: summary, scheduled date, portal CTA, "What's Next" section
- [ ] "What's Next" explains: materials ordering, crew scheduling, day-of expectations
- [ ] Confirmation page shareable / printable
- [ ] Confirmation number generated and displayed

#### UI/UX Notes

- **Confirmation page**: Clean, professional celebration moment
- **Summary card**: Package, price, deposit paid, appointment date
- **Portal CTA**: "Track Your Project" button prominently displayed
- **Next steps timeline**: Visual timeline of what happens next
- **Print/share**: Print button for records

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Confirmation number | Generated | `orders.confirmation_number` |
| Email content | Template + quote data | Rendered at send time |
| SMS content | Template + quote data | Rendered at send time |
| Email status | Resend webhook | `notifications` table |
| SMS status | SignalWire webhook | `notifications` table |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Resend | Send confirmation email | Triggered by payment success |
| SignalWire | Send confirmation SMS | If TCPA consent exists |
| Clerk | Generate magic link | For portal access in email |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F09 (Payment) | Triggered by payment success |
| Requires | F08 (E-Signature) | Contract PDF attached |
| Requires | F07 (Scheduling) | Appointment date in message |
| Requires | F26 (TCPA) | Consent required for SMS |
| Blocks | F11 (Portal Auth) | Magic link in email |

#### Technical Notes

- Queue notifications for reliability (don't block confirmation page)
- Retry failed sends with exponential backoff
- Track delivery status for support debugging
- Consider: SMS character limits (160 chars per segment)

#### Open Questions

- None

---

### Customer Portal Features (F11-F15)

---

### F11: Portal Authentication

#### User Story

As **Richard**, I want to access my customer portal easily via a link in my email or by logging in with my email address, so that I can check my project status without hassle.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Portal access is core to post-purchase experience |
| Effort | M | Clerk integration, magic link flow, session management |
| Risk | Low | Clerk is well-documented |

#### Acceptance Criteria

- [ ] Magic link in confirmation email logs user directly into portal
- [ ] Magic link valid for 24 hours
- [ ] User can request new magic link from login page
- [ ] User can create password for persistent login (optional)
- [ ] Login page supports email/password if account exists
- [ ] Session persists for 30 days (remember me default)
- [ ] Portal protected: all /portal/* routes require auth
- [ ] User sees only their own projects (multi-project support)
- [ ] Password reset flow available
- [ ] Social login (Google OAuth) deferred to P1

#### UI/UX Notes

- **Login page**: Clean email input with "Send Magic Link" primary action
- **Magic link email**: Clear "Access Your Portal" button
- **Password creation**: Optional prompt after magic link login
- **Session expired**: Clear message with re-login option

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| User account | Clerk | Clerk-managed |
| User email | Quote/order record | Clerk profile linked |
| Session | Clerk | Clerk-managed |
| Customer-project link | Our DB | `users.clerk_id` → `orders` |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Clerk | User creation | On quote/order completion |
| Clerk | Magic link generation | For email links |
| Clerk | Session validation | Middleware on /portal routes |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F10 (Confirmation) | First portal link sent here |
| Blocks | F12-F15 | All portal features require auth |

#### Technical Notes

- Use Clerk's Next.js middleware for route protection
- Link Clerk user ID to our user/customer record
- Handle edge case: user completes quote without account, then creates account with same email

#### Open Questions

- None - email/password + magic link confirmed; OAuth deferred to P1

---

### F12: Quote & Contract Viewer

#### User Story

As **Richard**, I want to view my quote details and download my signed contract from the portal, so that I have my documents accessible whenever I need them.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Document access is expected in customer portal |
| Effort | M | PDF rendering/download, quote display, auth integration |
| Risk | Low | Standard document viewer |

#### Acceptance Criteria

- [ ] Portal dashboard shows quote summary (package, price, date)
- [ ] "View Full Quote" expands to itemized breakdown (F20 display)
- [ ] "Download Quote PDF" generates/downloads quote document
- [ ] "View Signed Contract" opens contract PDF
- [ ] "Download Contract PDF" downloads signed document
- [ ] Documents load quickly (< 2 seconds)
- [ ] All documents properly secured (user can only see their own)
- [ ] Historical quotes visible if multiple projects

#### UI/UX Notes

- **Dashboard card**: Quote summary with expand/download options
- **PDF viewer**: In-browser PDF preview or download
- **Contract section**: Clear "Signed Contract" label with both parties' signatures visible in preview

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Quote data | `quotes` table | Our DB |
| Quote PDF | Generated or cached | Object storage |
| Contract PDF | Documenso | Object storage / Documenso URL |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Documenso | Fetch signed document | If not cached locally |
| Object storage | Retrieve PDFs | S3/Vercel Blob |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F11 (Portal Auth) | Access control |
| Requires | F08 (E-Signature) | Signed contract exists |
| Requires | F03 (Detailed Quote) | Quote data exists |

#### Technical Notes

- Cache signed contract locally to reduce Documenso calls
- Generate quote PDF on-demand or at quote finalization
- Use presigned URLs for secure document access

#### Open Questions

- None

---

### F13: Project Status Timeline

#### User Story

As **Richard**, I want to see where my project is in the process and what's coming next, so that I feel informed and don't have to call for updates.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | 40% cite poor communication - status visibility is key |
| Effort | M | Timeline UI, JobNimbus sync, status mapping |
| Risk | Medium | Depends on JobNimbus status field consistency |

#### Acceptance Criteria

- [ ] Timeline shows project milestones: Signed → Materials Ordered → Crew Scheduled → In Progress → Complete
- [ ] Current milestone highlighted / animated
- [ ] Completed milestones show checkmark with date
- [ ] Upcoming milestones show expected status
- [ ] Status syncs from JobNimbus (via polling or webhook)
- [ ] Sync interval: every 15 minutes or on webhook
- [ ] Additional status notes from CRM displayed if present
- [ ] Estimated completion date shown if available
- [ ] "Questions?" link to contact support

#### UI/UX Notes

- **Visual timeline**: Vertical or horizontal progress indicator
- **Milestone cards**: Status name, date, optional note
- **Current state**: Pulsing dot or highlighted card
- **Mobile**: Vertical timeline works better

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Project status | JobNimbus job status | `orders.status` |
| Status timestamps | JobNimbus or our tracking | `order_status_history` table |
| Status mapping | Config | Map JobNimbus statuses to display milestones |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| JobNimbus | Get job status | Polling or webhook |
| JobNimbus | Webhook: status changed | If available, preferred |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F11 (Portal Auth) | Access control |
| Requires | F22 (JobNimbus Sync) | Job exists in CRM |

#### Technical Notes

- Define milestone-to-JobNimbus-status mapping as config
- Cache status to reduce API calls
- Consider: manual status update capability if CRM sync fails

#### Open Questions

- None

---

### F14: Appointment Rescheduling

#### User Story

As **Richard**, I want to reschedule my appointment through the portal if my plans change, so that I can adjust without making a phone call.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Self-service reduces support burden |
| Effort | S | Cal.com reschedule flow, policy enforcement |
| Risk | Low | Cal.com has built-in reschedule |

#### Acceptance Criteria

- [ ] "Reschedule" button visible on portal dashboard
- [ ] Rescheduling shows available slots (same as F07)
- [ ] Business rules enforced: minimum notice period (e.g., 48 hours)
- [ ] If within restricted window: show message "Please call to reschedule"
- [ ] Successful reschedule: confirmation message + updated date
- [ ] New confirmation email sent with updated date
- [ ] Calendar invite updated (cancellation + new invite)
- [ ] Reschedule syncs to JobNimbus (F24)
- [ ] Reschedule limit: max 2 reschedules (configurable), then requires call

#### UI/UX Notes

- **CTA**: "Need to reschedule?" link
- **Calendar**: Same slot picker as checkout
- **Confirmation**: "Your new appointment is [date]"
- **Restrictions**: Clear explanation if restricted

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Current booking | `appointments` table | Our DB |
| Reschedule count | Tracking | `appointments.reschedule_count` |
| New slot | Cal.com availability | `appointments` updated |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Cal.com | Cancel original booking | Via API |
| Cal.com | Create new booking | Same as F07 |
| JobNimbus | Update job calendar | F24 sync |
| Resend | Send updated confirmation | Email with new date |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F11 (Portal Auth) | Access control |
| Requires | F07 (Scheduling) | Original booking exists |
| Requires | F24 (Booking Sync) | Sync updated booking |

#### Technical Notes

- Use Cal.com's reschedule link if available, or implement via cancel + create
- Enforce business rules in our code, not just Cal.com

#### Open Questions

- None

---

### F15: Balance Payment

#### User Story

As **Richard**, I want to pay my remaining balance through the portal when work is complete, so that I can settle my account easily without checks or cash.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Payment collection completes the transaction |
| Effort | S | Reuse F09 payment flow, balance calculation |
| Risk | Low | Same Stripe integration |

#### Acceptance Criteria

- [ ] Portal shows remaining balance (total - deposit)
- [ ] "Pay Balance" button visible when balance > $0
- [ ] Payment flow same as F09 (Stripe Elements)
- [ ] Partial payments supported (configurable)
- [ ] Receipt emailed after payment
- [ ] Payment synced to JobNimbus (F25)
- [ ] If balance is $0: show "Paid in Full" badge
- [ ] If financed: show financing status instead of pay button

#### UI/UX Notes

- **Balance display**: "Remaining Balance: $16,650"
- **Payment breakdown**: Show deposit paid, remaining
- **Financed projects**: "Financing with Wisetack - payments will be billed directly"

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Total price | `quotes.total_price` | Our DB |
| Deposit paid | `payments` table | Summed |
| Balance | Calculated | Total - payments |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Stripe | Payment (same as F09) | Different amount |
| JobNimbus (F25) | Sync payment | Update job |
| Resend | Receipt email | Triggered on success |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F11 (Portal Auth) | Access control |
| Requires | F09 (Deposit Payment) | Payment flow exists |

#### Technical Notes

- Reuse payment component from F09
- Calculate balance server-side for accuracy

#### Open Questions

- None

---

### ROI & Value Messaging Features (F16-F18)

---

### F16: ROI & Value Messaging Display

#### User Story

As **Richard**, I want to see concrete data on the value a new roof provides (resale ROI, insurance savings, faster home sale), so that I can justify the investment to myself and my spouse.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Affluent buyers want data to support decisions |
| Effort | S | Static content display with contextual triggers |
| Risk | Low | Simple UI addition |

#### Acceptance Criteria

- [ ] Value messaging displayed during quote flow after address validation
- [ ] Key statistics shown: 60-68% ROI on resale, 1-3 weeks faster home sale, 19% insurance premium reduction
- [ ] Messaging is contextual: if roof age known, reference it ("A 22-year-old roof like yours...")
- [ ] Value callouts shown on package comparison page (F04)
- [ ] "Why Replace Now" section expandable for detail
- [ ] Data points cited with source (for credibility)
- [ ] Messaging tone: informative, not pushy

#### UI/UX Notes

- **Placement**: Info banner or card in quote flow, above or beside pricing
- **Format**: Key stats with icons (dollar sign for ROI, clock for faster sale, etc.)
- **Expandable**: "Learn more about roof replacement value" expands to full content
- **Professional tone**: Appeals to data-driven decision makers

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| ROI statistics | Research data | Static content |
| Premium savings data | Research data | Static content |
| Roof age (if known) | Property data or user input | Quote record |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| None | Static content | No external APIs |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F01 (Address) | In quote flow |

#### Technical Notes

- Build as reusable ValueMessaging component
- Consider A/B testing different messaging approaches (P2)

#### Open Questions

- None

---

### F17: Replacement Motivation Capture

#### User Story

As **Results Roofing (analytics)**, I want to understand why customers are replacing their roof, so that we can optimize marketing and personalize the experience.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Analytics insight + personalization opportunity |
| Effort | S | Simple optional question in flow |
| Risk | Low | Simple UI addition |

#### Acceptance Criteria

- [ ] Optional question displayed during quote flow: "What's driving your roof replacement?"
- [ ] Options include:
  - Pre-sale preparation (selling home soon)
  - Roof age / end of life
  - Insurance carrier requirement (non-renewal notice)
  - Curb appeal / home update
  - Energy efficiency
  - Other (free text)
- [ ] Selection saved to quote record
- [ ] Selection synced to JobNimbus lead (custom field or tag)
- [ ] Question is skippable - user can proceed without answering
- [ ] Response informs analytics dashboards
- [ ] Future: Can personalize content based on motivation

#### UI/UX Notes

- **Placement**: After address validation, before estimate display
- **Question format**: Radio buttons or card selection
- **Helpful text**: "This helps us provide relevant information"
- **Skip option**: Clear "Skip" or "I'd rather not say" option

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Motivation selection | User input | `quotes.replacement_motivation` |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| JobNimbus (F22) | Tag or custom field | Segment leads by motivation |
| Analytics | Track motivation distribution | Dashboard reporting |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F01 (Address) | In quote flow |

#### Technical Notes

- Simple enum field
- Analytics event on selection
- Future: personalization engine can use this data

#### Open Questions

- None

---

### F18: Premium Material Showcase

#### User Story

As **Richard** (or Beth/Patel), I want to see detailed information about premium roofing materials, so that I can choose options appropriate for my upscale neighborhood.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Affluent buyers want premium options prominently featured |
| Effort | M | Content creation, UI display, integration with package comparison |
| Risk | Low | Content-driven feature |

#### Acceptance Criteria

- [ ] Premium (Best) tier materials highlighted in package comparison (F04)
- [ ] Material showcase includes: brand names, aesthetic options, durability ratings
- [ ] Energy efficiency benefits explained (reflective shingles, ventilation)
- [ ] Visual samples: shingle color/style options shown
- [ ] Warranty comparison: clearly show premium tier's 50-year warranty advantage
- [ ] "Popular in your area" indicator for materials common in affluent neighborhoods
- [ ] Material spec sheets downloadable (PDF links)
- [ ] Manufacturer certifications displayed

#### UI/UX Notes

- **Best tier prominence**: Visually distinguished in comparison view
- **Material gallery**: Thumbnail images of shingle options
- **Tooltips**: Technical specs on hover/tap
- **Trust signals**: Manufacturer logos (GAF, Owens Corning, CertainTeed)
- **Neighborhood context**: "Architectural shingles are standard in Highland Park"

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Material specifications | Business config | Static content |
| Shingle images | Manufacturer assets | Static assets |
| Spec sheets | Manufacturer PDFs | Static assets |
| Area-specific recommendations | Business config | Config |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| None directly | Static content | Uses configured material data |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F04 (Package Comparison) | Materials shown in comparison |
| Requires | F28 (Tier Pricing) | Material tiers defined |

#### Technical Notes

- Build as enhancement to F04 Package Comparison
- Store material specs in CMS or config for easy updates
- Consider: shingle color visualization on roof photo (P2/F42)

#### Open Questions

- None

---

### Trust & Transparency Features (F19-F21)

---

### F19: Trust & Credentials Display

#### User Story

As **Richard**, I want to see Results Roofing's credentials, reviews, and business history throughout the quote process, so that I can trust them as a legitimate, reputable company.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | 70% fear contractor quality - trust signals are conversion critical |
| Effort | M | Component design, data sourcing, placement strategy |
| Risk | Low | Static/semi-static content |

#### Acceptance Criteria

- [ ] Trust elements visible on key pages: landing, estimate, checkout, portal
- [ ] Display includes: years in business, license number(s), insurance proof
- [ ] Display includes: BBB rating/badge (if applicable)
- [ ] Display includes: Google review rating and count
- [ ] Display includes: manufacturer certifications (Owens Corning, GAF, etc.)
- [ ] Trust footer or sidebar consistent across pages
- [ ] Credentials verifiable (links to license lookup, BBB page)
- [ ] Mobile: collapsible or footer placement to avoid clutter

#### UI/UX Notes

- **Trust bar**: Horizontal bar with icons/badges
- **Verification links**: "Verify our license" links to state board
- **Review snippet**: Star rating + count + link to Google reviews
- **Certifications**: Logo badges for manufacturer programs
- **Placement**: Below fold on landing, sidebar/footer on estimate pages

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Company info | Static config | Environment/DB config |
| Google reviews | Google Places API OR manual | Cached, refresh daily |
| Certifications | Static config | Static assets |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Google Places (optional) | Fetch reviews | For live review count |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| None | Standalone | Can build independently |

#### Technical Notes

- Build as reusable TrustBar component
- Review data: start with static, add Google API later (P1: F37)
- Cache credentials data aggressively (rarely changes)

#### Open Questions

- None

---

### F20: Itemized Pricing Breakdown

#### User Story

As **Richard**, I want to see exactly what I'm paying for with line-item detail, so that I can trust the price is fair and understand where my money is going.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | 78% want transparency; only 25% of competitors provide it |
| Effort | M | Pricing engine output, UI display, educational content |
| Risk | Low | Display layer; pricing logic in F27-F29 |

#### Acceptance Criteria

- [ ] Breakdown shown on quote page (F03) and package comparison (F04)
- [ ] Line items include: shingles, underlayment, flashing, ridge vent, drip edge
- [ ] Line items include: labor, permits, disposal/dump fees
- [ ] Line items include: warranty (if separate cost)
- [ ] Each line shows: item name, quantity (if applicable), price
- [ ] Total equals sum of line items
- [ ] Expandable detail: click item for description/specification
- [ ] Breakdown matches contract (F08) line items
- [ ] If financing: show total financed vs. cash breakdown
- [ ] PDF quote includes same breakdown

#### UI/UX Notes

- **Table format**: Clean itemized table with subtotals
- **Expandable**: Accordion or tooltip for item details
- **Materials grouped**: All materials together, labor separate
- **Taxes/fees**: Clear if included or separate
- **Comparison**: Same breakdown per tier for comparison

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Line items | Pricing engine (F27-F29) | `quote_line_items` table |
| Item descriptions | Business config | Static content |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| None | Display only | Uses calculated quote data |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F02 or F03 | Need quote data |
| Requires | F28 (Tier Pricing) | Material costs |
| Requires | F29 (Complexity Pricing) | Labor adjustments |
| Blocks | F04 (Comparison) | Used in comparison view |
| Blocks | F08 (Contract) | Contract includes breakdown |

#### Technical Notes

- Store line items as JSON or separate table
- Build reusable PriceBreakdown component

#### Open Questions

- None

---

### F21: Shareable Quote Links

#### User Story

As **Richard**, I want to share my quote with my wife via a link, so that we can review it together and make a decision.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Couples make decisions together - sharing is essential |
| Effort | M | Unique link generation, auth-free viewing, expiration |
| Risk | Low | Standard pattern |

#### Acceptance Criteria

- [ ] "Share Quote" button on quote page
- [ ] Generates unique, unguessable URL (UUID or hash)
- [ ] Shared link opens full quote view without authentication
- [ ] Shared view shows: all quote details, breakdown, but NOT personal data (email, phone)
- [ ] Shared view includes: "This is [Name]'s quote for [Address]"
- [ ] Shared view includes: Results Roofing branding and contact
- [ ] Link expires after 30 days
- [ ] Expired links show friendly message + CTA to request new quote
- [ ] Copy link button with confirmation
- [ ] Optional: email share option (opens email client with link)

#### UI/UX Notes

- **Share button**: Icon + "Share" text
- **Modal**: Shows link with copy button, optional email share
- **Shared page**: Clean quote view, professional presentation, no navigation to sensitive areas
- **Expiry warning**: If < 7 days remaining, show expiration date

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Share token | Generated UUID | `quote_shares` table |
| Share link | Constructed URL | Derived from token |
| Expiration date | Created + 30 days | `quote_shares.expires_at` |
| View count | Optional tracking | `quote_shares.view_count` |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| None | Internal feature | No external APIs |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F02 or F03 | Need quote to share |

#### Technical Notes

- Use crypto.randomUUID() for share tokens
- Index share token for fast lookup
- Rate limit share creation (prevent abuse)

#### Open Questions

- None

---

### Backend Integration Features (F22-F26)

---

### F22: JobNimbus Lead Sync

#### User Story

As **Results Roofing (sales team)**, I want every website lead automatically created in JobNimbus, so that our sales process continues seamlessly without manual data entry.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | CRM sync essential for operations |
| Effort | L | JobNimbus API integration, data mapping, error handling |
| Risk | Medium | API availability and data model alignment |

#### Acceptance Criteria

- [ ] Contact created in JobNimbus when user enters valid address (F01)
- [ ] Contact includes: name (if collected), email, phone, address
- [ ] Job created linked to contact
- [ ] Job includes: source attribution (utm params, "Website - Instant Quote")
- [ ] Job includes: replacement motivation (from F17) as tag or custom field
- [ ] Job updated at each funnel step: estimate viewed, package selected, signed, paid
- [ ] Quote details synced to job (package, price, selected date)
- [ ] Sync failures logged and retried (exponential backoff)
- [ ] Failed syncs alert ops team (or visible in admin)
- [ ] Duplicate handling: check for existing contact by email before creating

#### UI/UX Notes

- Entirely backend - no user-facing UI
- Admin: sync status visible (P1)

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Contact data | Quote form | `leads` table |
| Job data | Quote/order | `orders` table |
| JobNimbus IDs | API response | `leads.jobnimbus_contact_id`, `orders.jobnimbus_job_id` |
| Sync status | Tracking | `sync_log` table |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| JobNimbus | POST /contacts | Create contact |
| JobNimbus | POST /jobs | Create job |
| JobNimbus | PUT /jobs/{id} | Update job status |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F01 (Address) | Lead data source |
| Blocks | F23, F24, F25 | Job must exist for status syncs |
| Blocks | F13 (Status Timeline) | Status read from CRM |

#### Technical Notes

- Implement per INTEGRATION-SPECS.md adapter pattern
- Queue sync operations for reliability
- Store JobNimbus IDs for subsequent updates
- Consider webhook from JobNimbus for bidirectional sync (if available)

#### Open Questions

- None

---

### F23: E-Signature Status Sync

#### User Story

As **Results Roofing (ops team)**, I want JobNimbus automatically updated when a customer signs their contract, so that the job status reflects reality without manual updates.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Accurate job status essential for ops |
| Effort | M | Documenso webhook → JobNimbus API |
| Risk | Low | Well-defined trigger (signature complete) |

#### Acceptance Criteria

- [ ] Documenso "document.completed" webhook triggers sync
- [ ] JobNimbus job status updated to "Signed" (or configured status)
- [ ] Signed contract PDF attached to JobNimbus job (if API supports)
- [ ] Webhook verified via signature (security)
- [ ] Idempotent: duplicate webhooks handled
- [ ] Failure logged and retried

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Signature event | Documenso webhook | Processed |
| Contract PDF | Documenso API | Attached to CRM |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Documenso | Webhook receive | document.completed |
| JobNimbus | PUT /jobs/{id} | Update status |
| JobNimbus | File attachment | If supported |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F08 (E-Signature) | Signature triggers event |
| Requires | F22 (Lead Sync) | Job must exist |

#### Technical Notes

- Webhook endpoint: /api/webhooks/documenso
- Verify Documenso webhook signature

#### Open Questions

- None

---

### F24: Booking Calendar Sync

#### User Story

As **Results Roofing (ops team)**, I want JobNimbus calendar updated when a customer books or reschedules, so that our scheduling is accurate across systems.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Accurate scheduling prevents double-booking |
| Effort | M | Cal.com webhook → JobNimbus API |
| Risk | Low | Well-defined trigger (booking events) |

#### Acceptance Criteria

- [ ] Cal.com "booking.created" webhook triggers sync
- [ ] Cal.com "booking.rescheduled" webhook triggers update
- [ ] Cal.com "booking.cancelled" webhook triggers cancellation
- [ ] JobNimbus job updated with scheduled date
- [ ] JobNimbus calendar event created (if supported)
- [ ] Webhook verified and idempotent

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Booking event | Cal.com webhook | Processed |
| Scheduled date | Cal.com data | `appointments` + JobNimbus |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Cal.com | Webhook receive | booking.* events |
| JobNimbus | PUT /jobs/{id} | Update scheduled date |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F07 (Scheduling) | Booking triggers event |
| Requires | F22 (Lead Sync) | Job must exist |

#### Technical Notes

- Webhook endpoint: /api/webhooks/calcom
- Map Cal.com event types to our appointment types

#### Open Questions

- None

---

### F25: Payment Status Sync

#### User Story

As **Results Roofing (ops team)**, I want JobNimbus updated when a customer makes a payment, so that job financials are accurate without manual entry.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Financial accuracy essential |
| Effort | M | Stripe webhook → JobNimbus API |
| Risk | Low | Stripe webhooks are reliable |

#### Acceptance Criteria

- [ ] Stripe "payment_intent.succeeded" webhook triggers sync
- [ ] JobNimbus job updated with payment amount and date
- [ ] Deposit vs. balance payment distinguished
- [ ] Stripe "charge.refunded" webhook triggers update (if applicable)
- [ ] Webhook signature verified
- [ ] Idempotent handling

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Payment event | Stripe webhook | `payments` table |
| Payment amount | Stripe data | JobNimbus job |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Stripe | Webhook receive | payment_intent.succeeded |
| JobNimbus | PUT /jobs/{id} | Update payment info |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F09 (Deposit) | Payment triggers event |
| Requires | F22 (Lead Sync) | Job must exist |

#### Technical Notes

- Webhook endpoint: /api/webhooks/stripe
- Stripe webhook signing with STRIPE_WEBHOOK_SECRET

#### Open Questions

- None

---

### F26: TCPA Consent Tracking

#### User Story

As **Results Roofing (compliance)**, I want explicit SMS consent recorded with timestamp and exact text shown, so that we're protected legally and can honor opt-out requests.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Legal compliance - non-negotiable |
| Effort | M | Consent UI, database storage, opt-out handling |
| Risk | Medium | Must be legally compliant |

#### Acceptance Criteria

- [ ] SMS consent checkbox on quote form (near phone number)
- [ ] Checkbox unchecked by default (opt-in, not opt-out)
- [ ] Consent text clearly states: "I agree to receive SMS messages..."
- [ ] If consented: record timestamp, exact text shown, IP address, user agent
- [ ] Consent stored in database with audit trail
- [ ] No SMS sent without consent record
- [ ] SignalWire STOP keyword auto-handled (network level)
- [ ] Our system marks consent as revoked when STOP received
- [ ] Opt-out timestamp recorded
- [ ] Consent data exportable for compliance audit
- [ ] Consent check before every SMS send

#### UI/UX Notes

- **Checkbox**: Standard checkbox with consent text
- **Text**: "I agree to receive text message updates about my roofing project. Message & data rates may apply. Reply STOP to unsubscribe."
- **Placement**: Below phone number input

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Consent given | Checkbox | `sms_consent` table |
| Consent text | Static (versioned) | Stored with record |
| Consent timestamp | System | `sms_consent.consented_at` |
| IP address | Request | `sms_consent.ip_address` |
| User agent | Request | `sms_consent.user_agent` |
| Opt-out timestamp | SignalWire or user action | `sms_consent.opted_out_at` |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| SignalWire | STOP handling | Network-level, but we track |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Blocks | F10 (Confirmation SMS) | No SMS without consent |

#### Technical Notes

- Version consent text - if text changes, new consent required
- Legal review of consent text before launch
- Consider: double opt-in (SMS confirmation) for extra protection

#### Open Questions

- None

---

### Business Rules Features (F27-F29)

---

### F27: Deposit Calculation Engine

#### User Story

As **a homeowner**, I want to see a clear deposit amount that follows predictable rules, so that I know what to expect and can budget accordingly.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Deposit is required for checkout |
| Effort | S | Simple calculation logic |
| Risk | Low | Rules are defined |

#### Acceptance Criteria

- [ ] Deposit = 10% of total project price
- [ ] Minimum deposit: $500
- [ ] Maximum deposit: $2,500
- [ ] Deposit calculated automatically based on selected package price
- [ ] Deposit displayed clearly before payment (F09)
- [ ] Deposit amount stored with quote
- [ ] Balance = Total - Deposit (for F15)

#### Business Rules

```
deposit = min(max(total * 0.10, 500), 2500)

Examples:
- $8,000 project → $800 deposit (10%)
- $4,000 project → $500 deposit (minimum)
- $30,000 project → $2,500 deposit (maximum)
```

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Total price | Pricing engine | Input |
| Deposit amount | Calculated | `quotes.deposit_amount` |
| Deposit percentage | Config | Environment/DB config |
| Min/max | Config | Environment/DB config |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| None | Internal calculation | Used by F09 |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F28 (Tier Pricing) | Need total price |
| Blocks | F09 (Payment) | Calculate deposit amount |

#### Technical Notes

- Pure function: `calculateDeposit(totalPrice, config)`
- Store config values (10%, $500, $2500) as environment variables for easy adjustment

#### Open Questions

- None - rules confirmed in PRD

---

### F28: Good/Better/Best Tier Pricing

#### User Story

As **a homeowner**, I want to understand how the three pricing tiers differ, so that I can choose the option that matches my quality expectations and budget.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Core pricing structure |
| Effort | L | Pricing model, material costs, configuration |
| Risk | Medium | Must accurately reflect business margins |

#### Acceptance Criteria

- [ ] Three tiers defined: Good, Better, Best
- [ ] Each tier specifies: shingle type, warranty years, material grade
- [ ] Good: 3-tab standard shingles, 10-year workmanship warranty
- [ ] Better: Architectural shingles, 25-year workmanship warranty
- [ ] Best: Premium architectural shingles, 50-year workmanship warranty
- [ ] Labor cost same across tiers (installation is consistent)
- [ ] Material cost differs by tier (defined per sq ft)
- [ ] Each tier price = (material cost × sq ft) + labor + permits + disposal
- [ ] Tier definitions configurable (admin can update pricing)
- [ ] Pricing displayed per F04

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Tier definitions | Business config | `pricing_tiers` table |
| Material cost per sq ft | Config per tier | `pricing_tiers` |
| Labor cost per sq ft | Config | `pricing_config` |
| Permit cost | Config or estimate | `pricing_config` |
| Disposal cost | Config | `pricing_config` |
| Calculated tier prices | Engine output | `quotes` (one per tier) |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| None | Internal pricing logic | No external APIs |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F03 (Measurements) | Sq ft needed for pricing |
| Requires | F29 (Complexity) | Adjustments applied |
| Blocks | F02, F04 | Tier prices displayed |
| Blocks | F20 | Itemized breakdown |

#### Technical Notes

- Build pricing engine as testable module
- Configuration via database or admin UI
- Consider: regional pricing variations (future)

#### Open Questions

- None - tier structure confirmed in PRD

---

### F29: Complexity & Pitch Pricing

#### User Story

As **a homeowner**, I want accurate pricing that reflects my roof's actual difficulty, so that I'm not overcharged for a simple roof or underquoted for a complex one.

#### Priority & Effort

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Priority | P0 | Accurate pricing essential for trust and margins |
| Effort | M | Complexity classification, multiplier logic |
| Risk | Medium | Complexity assessment may need refinement |

#### Acceptance Criteria

- [ ] Complexity levels: Simple (1.0x), Moderate (1.15x), Complex (1.3x)
- [ ] Complexity determined by: number of facets, valleys, dormers, roof accessibility
- [ ] Complexity from Roofr report OR manual assessment
- [ ] Pitch adjustment: steeper pitch = higher labor (ladder/safety equipment)
- [ ] Pitch thresholds defined (e.g., >8:12 = steep premium)
- [ ] Final price = base tier price × complexity multiplier × pitch adjustment
- [ ] Adjustments visible in breakdown (F20) when significant
- [ ] Manual complexity override capability (for edge cases)

#### Business Rules

```
Complexity multipliers:
- Simple: 1.0 (basic ranch, few facets)
- Moderate: 1.15 (typical suburban, multiple facets)
- Complex: 1.3 (many dormers, valleys, steep sections)

Pitch adjustments:
- Standard (4:12 to 7:12): 1.0
- Steep (8:12 to 10:12): 1.10
- Very steep (>10:12): 1.20

Final = Base Price × Complexity × Pitch
```

#### Data Requirements

| Data | Source | Storage |
|------|--------|---------|
| Complexity rating | Roofr report or manual | `measurements.complexity` |
| Pitch (primary) | Roofr report | `measurements.pitch` |
| Multipliers | Config | `pricing_config` |
| Adjustments applied | Calculated | `quotes.adjustments` (JSON) |

#### Integration Touchpoints

| Integration | Operation | Notes |
|-------------|-----------|-------|
| Roofr | Complexity/pitch data | From measurement report |

#### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Requires | F03 (Measurements) | Source of complexity/pitch |
| Blocks | F28 (Tier Pricing) | Multipliers applied to base |

#### Technical Notes

- If Roofr doesn't provide complexity, derive from facet count
- Store adjustment breakdown for audit/explanation

#### Open Questions

- None - multipliers confirmed in PRD

---

## Feature Dependency Graph

```
[FUNNEL FOUNDATION]
F01 (Address) ──┬──► F02 (Preliminary) ──┬──► F03 (Detailed) ──► F04 (Compare) ──► F05 (Select)
                │                        │                                              │
                │                        └──► F16 (ROI Value) ◄── F17 (Motivation)     │
                │                                                                       │
                │                                                                       │
                └──► F22 (Lead Sync) ◄──────────────────────────────────────────────────┘

[CHECKOUT FLOW]
F05 (Select) ──► F06 (Financing) ──► F07 (Schedule) ──► F08 (E-Sign) ──► F09 (Payment) ──► F10 (Confirm)
                                          │                   │                │
                                          │                   │                └──► F25 (Pay Sync)
                                          │                   └──► F23 (E-Sign Sync)
                                          └──► F24 (Booking Sync)

[PORTAL]
F10 (Confirm) ──► F11 (Auth) ──┬──► F12 (Docs)
                               ├──► F13 (Status)
                               ├──► F14 (Reschedule)
                               └──► F15 (Balance)

[TRUST & PRICING - Parallel Development]
F19 (Trust Display) - Independent
F18 (Premium Materials) ◄── F04 (Compare)
F20 (Itemized) ◄── F28 (Tiers) ◄── F29 (Complexity)
F21 (Shareable) ◄── F02/F03

[BUSINESS RULES - Foundation]
F27 (Deposit) ◄── F28 (Tiers)
F28 (Tiers) ◄── F29 (Complexity) ◄── F03 (Measurements)

[COMPLIANCE]
F26 (TCPA) ──► F10 (SMS Notifications)
```

### Critical Path

The critical path for MVP (minimum time to functional checkout):

```
F01 → F02 → F04 → F05 → F07 → F08 → F09 → F10
  │                ↑
  └── F28 ← F29 ───┘

Supporting parallel: F16, F17, F18, F19, F22, F26
```

**Critical Path Analysis:**
1. **F01 (Address)** → Start of funnel (M effort)
2. **F02 (Preliminary)** → Requires F28/F29 pricing (L effort)
3. **F04 (Compare)** → Display tier options (M effort)
4. **F05 (Select)** → User commits (S effort)
5. **F07 (Schedule)** → Book appointment (M effort)
6. **F08 (E-Sign)** → Contract (L effort)
7. **F09 (Payment)** → Collect deposit (M effort)
8. **F10 (Confirm)** → Send confirmations (M effort)

**Critical Path Total:** 2L + 5M + 1S = ~5-7 days core funnel

**Parallel work (not on critical path):**
- F03 (Detailed Quote) - Can run async after F02
- F06 (Financing) - Optional in flow
- F11-F15 (Portal) - Post-purchase, can ship after core funnel
- F16-F18 (ROI/Value) - Enhancement to flow
- F19-F21 (Trust) - Can develop in parallel
- F22-F26 (Backend sync) - Can ship incrementally

---

## Priority Summary

| Priority | Count | Total Effort | Features |
|----------|-------|--------------|----------|
| P0 (Must Have) | 29 | 7L + 14M + 8S | F01-F29 (all features in this doc) |
| P1 (Should Have) | 8 | (see PRD F30-F37) | Deferred to post-MVP |
| P2 (Nice to Have) | 7 | (see PRD F40-F46) | Deferred to post-MVP |

**Effort Breakdown by Category:**

| Category | Features | Effort |
|----------|----------|--------|
| Core Funnel | F01-F10 | 3L + 5M + 2S |
| Portal | F11-F15 | 3M + 2S |
| ROI & Value | F16-F18 | 1M + 2S |
| Trust | F19-F21 | 3M |
| Backend | F22-F26 | 1L + 4M |
| Business Rules | F27-F29 | 1L + 1M + 1S |

---

## MVP Scope

### MVP Features (Must Ship)

All 29 P0 features are required for MVP. Grouped by sprint:

**Sprint 1 - Foundation:**
- [ ] F01: Address Validation & Service Area Check
- [ ] F02: Preliminary Price Estimate
- [ ] F19: Trust & Credentials Display
- [ ] F22: JobNimbus Lead Sync
- [ ] F26: TCPA Consent Tracking

**Sprint 2 - Quote & Comparison:**
- [ ] F03: Detailed Measurement-Based Quote
- [ ] F04: Package Comparison View
- [ ] F05: Package Selection & Checkout Entry
- [ ] F16: ROI & Value Messaging Display
- [ ] F17: Replacement Motivation Capture
- [ ] F18: Premium Material Showcase
- [ ] F20: Itemized Pricing Breakdown
- [ ] F21: Shareable Quote Links
- [ ] F27: Deposit Calculation Engine
- [ ] F28: Good/Better/Best Tier Pricing
- [ ] F29: Complexity & Pitch Pricing

**Sprint 3 - Checkout:**
- [ ] F06: Financing Pre-Qualification
- [ ] F07: Appointment Scheduling
- [ ] F08: Contract E-Signature
- [ ] F09: Deposit Payment
- [ ] F10: Confirmation & Notifications
- [ ] F23: E-Signature Status Sync
- [ ] F24: Booking Calendar Sync
- [ ] F25: Payment Status Sync

**Sprint 4 - Portal:**
- [ ] F11: Portal Authentication
- [ ] F12: Quote & Contract Viewer
- [ ] F13: Project Status Timeline
- [ ] F14: Appointment Rescheduling
- [ ] F15: Balance Payment

### Post-MVP Backlog

Features explicitly deferred (from PRD P1/P2/P3):

- F30-F37: P1 features (save progress, live chat, abandoned cart, notifications)
- F40-F46: P2 features (multi-financing, video consult, visualization, weather, referrals, Spanish, energy data)
- F50-F58: P3 features (native apps, 3D viz, multi-region, insurance integration, etc.)

---

## Feature Changelog

| Date | Feature | Change | Reason |
|------|---------|--------|--------|
| 2026-01-21 | All | Initial feature breakdown created | Phase 1 Discovery completion |
| 2026-01-21 | F16-F18 | Repurposed from Insurance Support to ROI & Value Messaging | Self-pay pivot (Session 16) |
| 2026-01-21 | All | Updated persona references from Maria to Richard/Beth/Patel | Self-pay pivot (Session 16) |
| 2026-01-21 | F01 | Updated service area from TX/OK to target markets (TX, GA, NC, AZ) | Self-pay pivot (Session 16) |

---

## Related Documents

| Doc | Relationship |
|-----|--------------|
| [03-product-requirements.md](./03-product-requirements.md) | Requirements these features implement |
| [02-user-personas.md](./02-user-personas.md) | Personas referenced in user stories |
| [06-component-specs.md](./06-component-specs.md) | Component designs for features |
| [Sprint docs](../roadmap/sprints/) | Features assigned to sprints |
| [progress-tracker.md](../roadmap/progress-tracker.md) | Feature completion status |
| [18-decision-log.md](./18-decision-log.md) | Major feature decisions |
| [AGENT-GUIDE.md](./AGENT-GUIDE.md) | How to lead the process |
| [INTEGRATION-SPECS.md](./INTEGRATION-SPECS.md) | API contracts for integrations |

---

## Document Completion Checklist

- [x] All P0 requirements from doc 03 have corresponding features (29 features)
- [x] Every feature has user story, priority, effort, and acceptance criteria
- [x] All feature dependencies are mapped
- [x] Dependency graph shows critical path
- [x] MVP scope is clearly defined
- [x] No remaining [TBD] markers
- [x] UI/UX notes included for user-facing features
- [x] Data requirements documented
- [x] Integration touchpoints mapped to INTEGRATION-SPECS.md
- [x] Updated for self-pay pivot (Session 16) - F16-F18 repurposed, personas updated

**Status: COMPLETE** - Updated for self-pay pivot. Ready to proceed.
