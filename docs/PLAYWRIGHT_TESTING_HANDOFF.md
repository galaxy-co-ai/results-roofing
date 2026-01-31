# Playwright Testing Handoff - Quote Flow Assessment

## Mission

Use Playwright (via browser automation MCP tools) to **manually test the complete quote flow** in the Results Roofing web app. Navigate through the user journey, interact with all UI elements, and provide a **comprehensive assessment** of:

1. UI/UX quality and responsiveness
2. Functionality and error handling
3. Visual polish and design consistency
4. Accessibility and usability issues
5. Bugs or broken flows discovered

---

## Project Context

**Results Roofing** is a Next.js 14 app for instant roofing quotes. The quote flow is a multi-step wizard:

```
Homepage → /quote/new → /quote/[id]/customize → /quote/[id]/schedule → /quote/[id]/deposit → /quote/[id]/success
```

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Modules + Tailwind + Design tokens (`--rr-*`)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Payments**: Stripe (test mode available)
- **Auth**: Clerk (for portal access)

### Recent Changes
The **deposit page** (`/quote/[id]/deposit`) was just redesigned from a two-column layout to a **single-column, mobile-first card**. This is a priority area to test.

---

## Environment Setup

### Option 1: Use the Dev Server (Recommended)

```bash
cd ~/workspace/results-roofing
pnpm dev
```

The app runs at **http://localhost:3000**

### Option 2: Use Deployed Preview

If available, use the Vercel preview URL. Check for `.vercel` or ask the user.

---

## Testing Approach

Use the **Claude in Chrome MCP tools** (`mcp__claude-in-chrome__*`) to:

1. Navigate to pages
2. Capture snapshots for accessibility tree analysis
3. Take screenshots for visual assessment
4. Interact with forms, buttons, and UI elements
5. Test responsive layouts by resizing the browser

### Key MCP Tools to Use

| Tool | Purpose |
|------|---------|
| `tabs_context_mcp` | Get current browser tabs |
| `tabs_create_mcp` | Create new tab for testing |
| `navigate` | Go to URLs |
| `browser_snapshot` | Get accessibility tree (preferred over screenshots for interaction) |
| `browser_take_screenshot` | Visual capture |
| `browser_click` | Click elements |
| `browser_type` | Type into inputs |
| `form_input` | Fill form fields |
| `find` | Find elements by description |
| `resize_window` | Test responsive layouts |

---

## Test Scenarios

### 1. Homepage (`/`)

**Test:**
- [ ] Hero section displays correctly
- [ ] Address input is visible and functional
- [ ] CTA button ("Get Your Free Quote") works
- [ ] Trust signals visible (roofs installed count, ratings)
- [ ] Navigation header works
- [ ] Footer links work

**Enter address:** `123 Main Street, Houston, TX 77001`

---

### 2. Quote Stage 1 (`/quote/new`)

**Test:**
- [ ] Page loads with "Get Your Instant Quote" heading
- [ ] Stage indicator shows 3 stages with Stage 1 active
- [ ] Address entry form works (Google Places autocomplete)
- [ ] Service area notice is visible
- [ ] Trust signals appear
- [ ] Manual entry fallback works
- [ ] Form validation (try empty submit)
- [ ] After address entry, property confirmation appears

**Sub-steps within Stage 1:**
1. Address Entry →
2. Property Confirm (shows satellite image) →
3. Price Preview (shows estimated price range)

---

### 3. Quote Stage 2: Customize (`/quote/[id]/customize`)

**Note:** You need a valid quote ID. Either:
- Complete Stage 1 to get a real quote ID, OR
- Use a seeded test quote if available

**Test:**
- [ ] Package selection shows 3 tiers (Essential, Preferred, Signature)
- [ ] Each tier card shows price, features, warranty
- [ ] Package hover/selection states work
- [ ] "What's Included" expands
- [ ] Order summary sidebar updates on selection
- [ ] Continue button enables after selection
- [ ] Responsive: sidebar collapses on mobile

---

### 4. Schedule Page (`/quote/[id]/schedule`)

**Test:**
- [ ] Calendar displays available dates
- [ ] Date selection works (click to select)
- [ ] Time slot selection (Morning/Afternoon)
- [ ] Selected date/time is highlighted
- [ ] Continue button works
- [ ] Mobile calendar is usable

---

### 5. Deposit Page (`/quote/[id]/deposit`) - PRIORITY

**This page was just redesigned. Test thoroughly!**

**Layout Tests:**
- [ ] Single-column card layout (not two-column)
- [ ] Card is centered on tablet/desktop
- [ ] Full-width on mobile (375px)
- [ ] Max-width: 480px (tablet), 520px (desktop)

**Header Section:**
- [ ] Tier badge with sparkle icon displays
- [ ] Tier name is uppercase (e.g., "ESSENTIAL TIER")
- [ ] Edit link is right-aligned
- [ ] Address displays with house icon
- [ ] Date/time displays with calendar icon

**Form Section:**
- [ ] Signature pad is 100px height
- [ ] Signature pad accepts drawing (click and drag)
- [ ] "Clear" button works on signature pad
- [ ] Email input works with validation
- [ ] Email helper text shows below input
- [ ] Terms & Agreement checkbox toggles
- [ ] Terms section expands/collapses with chevron
- [ ] "What Happens Next" expands to show timeline
- [ ] Timeline has numbered steps with icons

**Pricing Section:**
- [ ] Centered text alignment
- [ ] Total price is large (24px, bold)
- [ ] Deposit amount is smaller, green (#166534)
- [ ] "fully refundable" text appears

**CTA Section:**
- [ ] Button shows "Secure My Spot — $500"
- [ ] Button is disabled until form is complete
- [ ] Hint text shows when disabled
- [ ] Trust badges appear below button (Secure, 3-Day Refund, 4.9 Rating)
- [ ] "Not ready? Save this quote" link works
- [ ] Button has hover/focus states

**Responsive Tests:**
- [ ] Test at 375px width (mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1200px width (desktop)
- [ ] No horizontal scroll on any viewport

---

### 6. Success Page (`/quote/[id]/success`)

**Test:**
- [ ] Confirmation message displays
- [ ] Order number shows (if available)
- [ ] Next steps information appears
- [ ] "View Your Portal" link works (may require auth)

---

### 7. Responsive Testing

Test each page at these breakpoints:
- **Mobile**: 375px x 667px (iPhone SE)
- **Tablet**: 768px x 1024px (iPad)
- **Desktop**: 1440px x 900px

Use `resize_window` tool to change viewport size.

---

### 8. Accessibility Tests

For each page:
- [ ] Single `<h1>` per page
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Form labels are associated with inputs
- [ ] Buttons have accessible names
- [ ] Images have alt text
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works
- [ ] Error messages use `role="alert"`

---

## Assessment Report Format

After testing, provide a structured report:

```markdown
# Quote Flow Test Report

## Summary
- Overall Quality: [Excellent / Good / Needs Work / Poor]
- Critical Issues Found: [count]
- Minor Issues Found: [count]

## Page-by-Page Findings

### Homepage
- **Status**: [Pass / Issues Found]
- **Issues**: [list any problems]
- **Screenshots**: [if taken]

### Quote Stage 1
[...]

### Deposit Page (Priority)
- **Layout**: [Pass / Fail] - describe findings
- **Form Functionality**: [Pass / Fail]
- **Responsive**: [Pass / Fail at each breakpoint]
- **Issues**: [detailed list]

## Bugs Found
1. [Bug description] - Severity: [Critical / High / Medium / Low]
   - Steps to reproduce
   - Expected behavior
   - Actual behavior

## UX Recommendations
1. [Recommendation]

## Visual Polish
- [ ] Consistent spacing
- [ ] Color consistency with design system
- [ ] Typography hierarchy clear
- [ ] Interactive states work (hover, focus, active)
```

---

## Known Limitations

1. **Database dependency**: Some pages require valid quote data. You may see redirects or 404s for invalid quote IDs.

2. **Google Maps**: Address autocomplete requires API key. May not work in test environment.

3. **Stripe**: Payment flows require Stripe test mode. The deposit page doesn't actually process payments without proper setup.

4. **Clerk Auth**: Portal pages require authentication. May redirect to sign-in.

---

## Files for Reference

If you need to understand component structure:

```
src/
├── app/
│   └── quote/
│       ├── new/page.tsx           # Stage 1
│       └── [id]/
│           ├── customize/page.tsx  # Stage 2
│           ├── schedule/page.tsx   # Schedule selection
│           ├── deposit/            # PRIORITY - just redesigned
│           │   ├── page.tsx
│           │   └── DepositPageClient.tsx
│           └── success/page.tsx    # Confirmation
├── components/
│   └── features/
│       └── checkout/
│           └── DepositAuthCard/    # The card component
│               ├── DepositAuthCard.tsx
│               └── DepositAuthCard.module.css
```

---

## Start Testing

1. Call `tabs_context_mcp` with `createIfEmpty: true`
2. Navigate to `http://localhost:3000`
3. Begin testing homepage
4. Work through the flow sequentially
5. Take screenshots at key points
6. Document all findings

Good luck! Provide a thorough assessment.
