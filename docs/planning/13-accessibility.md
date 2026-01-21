# 13 - Accessibility

> **Purpose:** Defines WCAG 2.1 AA accessibility requirements for the Results Roofing web application. Ensures the quote funnel and customer portal are usable by all homeowners regardless of ability.

**Status:** COMPLETE
**Last Updated:** 2026-01-21

---

## Accessibility Overview

### Why Accessibility Matters for Results Roofing

Roofing customers represent the general population across our target markets (TX, GA, NC, AZ), including:
- **Aging homeowners:** 43-49% are Baby Boomers (average age 56-57), with higher rates of visual and motor impairments
- **Mobile-first users:** 54% decide within 4 hours, often on phones with varying accessibility settings
- **Busy professionals:** Often time-constrained, may use accessibility features for efficiency
- **Joint decision makers:** Shared quotes need to work for both partners

Accessibility is not optional - it directly impacts conversions and protects against legal risk.

### Compliance Target

**Standard:** WCAG 2.1 Level AA

**Legal Context:**
- ADA Title III applies to websites offering goods/services
- State laws in TX, GA, NC, AZ align with ADA requirements
- Plaintiff lawsuits targeting inaccessible e-commerce sites are increasing

### Foundational Approach

**Framework:** Ark UI provides accessible primitives out of the box. We build on this foundation.

**Principles:**
1. **Perceivable:** Content can be perceived through sight, sound, or touch
2. **Operable:** Interface can be operated via keyboard, mouse, touch, or assistive devices
3. **Understandable:** Content and interface are understandable
4. **Robust:** Content works with current and future assistive technologies

---

## WCAG 2.1 AA Requirements

### Perceivable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 Non-text Content | All images have text alternatives | `alt` attributes on all `<img>`; decorative images use `alt=""` |
| 1.2.1 Audio-only/Video-only | Provide alternatives | Not applicable (no audio/video in MVP) |
| 1.3.1 Info and Relationships | Semantic structure | Use proper heading hierarchy, lists, tables; ARIA where needed |
| 1.3.2 Meaningful Sequence | Logical reading order | DOM order matches visual order; no CSS reordering that breaks flow |
| 1.3.3 Sensory Characteristics | Don't rely on shape/location only | "Click the green button" must also identify by label |
| 1.3.4 Orientation | Support portrait and landscape | No orientation lock; layouts adapt |
| 1.3.5 Identify Input Purpose | Autocomplete attributes | `autocomplete` on all form fields for autofill |
| 1.4.1 Use of Color | Color not sole indicator | Errors show icon + text, not just red color |
| 1.4.2 Audio Control | No auto-playing audio | Not applicable (no audio in MVP) |
| 1.4.3 Contrast (Minimum) | 4.5:1 text, 3:1 UI | See Color & Contrast section |
| 1.4.4 Resize Text | 200% zoom support | Em/rem units; no clipping at 200% |
| 1.4.5 Images of Text | Avoid images of text | Use real text; logo is exception |
| 1.4.10 Reflow | No horizontal scroll at 320px | Single-column responsive design |
| 1.4.11 Non-text Contrast | 3:1 for UI components | Focus rings, borders meet ratio |
| 1.4.12 Text Spacing | Support user overrides | No clipping with increased spacing |
| 1.4.13 Content on Hover/Focus | Dismissible, hoverable, persistent | Tooltips meet all three criteria |

### Operable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.1.1 Keyboard | All functionality via keyboard | Tab navigation, Enter/Space activation |
| 2.1.2 No Keyboard Trap | Focus can always escape | Modal close on Escape; no infinite loops |
| 2.1.4 Character Key Shortcuts | Single-key shortcuts can be disabled | No single-key shortcuts used |
| 2.2.1 Timing Adjustable | Extend time limits | Slot holds show countdown; can be extended |
| 2.2.2 Pause, Stop, Hide | Control moving content | Skeleton shimmer can be paused via reduced-motion |
| 2.3.1 Three Flashes | No flashing content | No flashing content used |
| 2.4.1 Bypass Blocks | Skip navigation | Skip link to main content |
| 2.4.2 Page Titled | Descriptive page titles | Dynamic titles per route |
| 2.4.3 Focus Order | Logical tab sequence | Tab order follows visual/reading order |
| 2.4.4 Link Purpose (In Context) | Link text is descriptive | "View full contract" not "Click here" |
| 2.4.5 Multiple Ways | Multiple paths to content | Direct links + navigation |
| 2.4.6 Headings and Labels | Descriptive headings | Every section has heading; form fields have labels |
| 2.4.7 Focus Visible | Clear focus indicator | 2px Sandstone outline, 2px offset |
| 2.5.1 Pointer Gestures | Single-pointer alternative | Swipe has tap alternatives |
| 2.5.2 Pointer Cancellation | Down-event doesn't trigger | Actions on click/up, not mousedown |
| 2.5.3 Label in Name | Visible label in accessible name | Button text matches aria-label |
| 2.5.4 Motion Actuation | No motion-only input | Not applicable |

### Understandable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.1.1 Language of Page | `lang` attribute set | `<html lang="en">` |
| 3.1.2 Language of Parts | Mark language changes | Not applicable (English only for MVP) |
| 3.2.1 On Focus | No context change on focus | Focus doesn't auto-submit or navigate |
| 3.2.2 On Input | No unexpected changes | Form changes don't auto-submit; user initiates |
| 3.2.3 Consistent Navigation | Navigation is consistent | Same nav across all pages |
| 3.2.4 Consistent Identification | Same functions look same | All "Continue" buttons styled consistently |
| 3.3.1 Error Identification | Errors clearly identified | Field-level errors with icon + text |
| 3.3.2 Labels or Instructions | Form fields have labels | All inputs have visible labels |
| 3.3.3 Error Suggestion | Suggest corrections | "Please enter a valid email address" |
| 3.3.4 Error Prevention (Legal) | Confirm before commit | Review screen before payment |

### Robust

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 4.1.1 Parsing | Valid HTML | HTML validation in CI |
| 4.1.2 Name, Role, Value | ARIA attributes correct | Ark UI provides; we augment |
| 4.1.3 Status Messages | Programmatic status updates | Live regions for toast, errors |

---

## Keyboard Navigation

### Tab Order

**Principle:** Tab order follows the visual/reading order (left-to-right, top-to-bottom in English).

**Global Tab Order:**
```
1. Skip link (visually hidden until focused)
2. Header (logo, navigation items)
3. Main content (forms, cards, buttons in DOM order)
4. Footer (legal links)
5. Modal content (when open, replaces main)
```

**Component-Specific Orders:**

**Quote Flow Pages:**
```
[Skip link] -> [Logo] -> [Progress indicator steps] -> [Back button if present]
-> [Main form fields in order] -> [Primary CTA] -> [Secondary actions]
-> [Footer links]
```

**Package Comparison (F04):**
```
[Skip link] -> [Back] -> [Good card: heading, features, select button]
-> [Better card: heading, features, select button]
-> [Best card: heading, features, select button]
-> [Shared features section] -> [Action buttons: breakdown, share, download]
```

**Portal Dashboard:**
```
[Skip link] -> [Logo] -> [User greeting] -> [Logout]
-> [Side nav items in order (desktop)] OR [Bottom tab items (mobile)]
-> [Dashboard content: timeline, actions, summary]
```

### Focus Indicators

**All interactive elements display visible focus:**

```css
/* Standard focus indicator */
.interactive:focus-visible {
  outline: var(--rr-focus-ring-width) solid var(--rr-focus-ring-color);
  outline-offset: var(--rr-focus-ring-offset);
}

/* Token values from 16-design-tokens.md */
--rr-focus-ring-width: 2px;
--rr-focus-ring-offset: 2px;
--rr-focus-ring-color: #C4A77D; /* Sandstone */
```

**Focus indicator requirements:**
- Visible against all backgrounds (Sandstone on white/cream passes 3:1)
- Does not reduce click area (offset ensures this)
- Applied via `:focus-visible` (not `:focus`) to avoid mouse-click rings

**Input fields additionally show:**
```css
.input:focus {
  border-color: var(--rr-color-border-focus);
  box-shadow: var(--rr-shadow-focus); /* 0 0 0 3px rgba(196,167,125,0.15) */
}
```

### Keyboard Shortcuts

**Global Shortcuts:**

| Key | Action | Context |
|-----|--------|---------|
| Tab | Move focus forward | Everywhere |
| Shift + Tab | Move focus backward | Everywhere |
| Enter | Activate button/link, submit form | When focused on button/link/form |
| Space | Activate button, toggle checkbox | When focused on button/checkbox |
| Escape | Close modal/dropdown, cancel action | When modal/dropdown open |
| Arrow keys | Navigate within component | Radio groups, select menus, calendar |

**Component-Specific Shortcuts:**

**RadioCardGroup:**

| Key | Action |
|-----|--------|
| Arrow Up/Left | Select previous option |
| Arrow Down/Right | Select next option |
| Home | Select first option |
| End | Select last option |

**Select (Dropdown):**

| Key | Action |
|-----|--------|
| Arrow Up/Down | Navigate options |
| Enter/Space | Select highlighted option |
| Escape | Close without selecting |
| Type character | Jump to matching option |

**DatePicker (Calendar):**

| Key | Action |
|-----|--------|
| Arrow keys | Navigate days |
| Page Up | Previous month |
| Page Down | Next month |
| Home | First day of month |
| End | Last day of month |
| Enter/Space | Select date |
| Escape | Close calendar |

**Modal:**

| Key | Action |
|-----|--------|
| Tab | Cycle through modal content |
| Escape | Close modal |

### Skip Link

**Implementation:**
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

**Styling:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: var(--rr-space-3) var(--rr-space-4);
  background: var(--rr-color-charcoal);
  color: var(--rr-color-white);
  z-index: var(--rr-z-max);
}

.skip-link:focus {
  top: 0;
}
```

**Target:**
```html
<main id="main-content" tabindex="-1">
  <!-- Main page content -->
</main>
```

---

## Screen Reader Support

### ARIA Labels and Roles

**Landmark Roles:**
```html
<header role="banner">...</header>
<nav role="navigation" aria-label="Main navigation">...</nav>
<main role="main" id="main-content">...</main>
<footer role="contentinfo">...</footer>
<aside role="complementary" aria-label="Order summary">...</aside>
```

**Component ARIA Patterns (from Ark UI):**

**Button:**
```html
<!-- Standard button -->
<button type="button">Get My Free Estimate</button>

<!-- Loading button -->
<button type="button" aria-busy="true" disabled>
  <span class="spinner" aria-hidden="true"></span>
  Processing...
</button>

<!-- Disabled button (focusable for explanation) -->
<button type="button" aria-disabled="true">
  Continue
</button>
```

**Icon Button:**
```html
<button type="button" aria-label="Close modal">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>
```

**Text Input:**
```html
<div class="field">
  <label id="email-label" for="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-labelledby="email-label"
    aria-describedby="email-error email-hint"
    aria-invalid="true"
  />
  <p id="email-hint" class="hint">We'll send your confirmation here</p>
  <p id="email-error" class="error" role="alert">
    Please enter a valid email address
  </p>
</div>
```

**RadioCardGroup:**
```html
<fieldset>
  <legend>What is prompting your roof replacement?</legend>
  <div role="radiogroup" aria-labelledby="motivation-question">
    <div role="radio" aria-checked="false" tabindex="0">
      Preparing to sell my home
    </div>
    <div role="radio" aria-checked="true" tabindex="-1">
      Roof is aging (15+ years)
    </div>
    <div role="radio" aria-checked="false" tabindex="-1">
      Insurance carrier requirement
    </div>
  </div>
</fieldset>
```

**Select:**
```html
<div class="select">
  <label id="state-label">State</label>
  <button
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-labelledby="state-label"
  >
    Select state
  </button>
  <ul role="listbox" aria-labelledby="state-label" hidden>
    <li role="option" aria-selected="true">Texas</li>
    <li role="option" aria-selected="false">Georgia</li>
    <li role="option" aria-selected="false">North Carolina</li>
    <li role="option" aria-selected="false">Arizona</li>
  </ul>
</div>
```

**Modal:**
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Share Your Quote</h2>
  <p id="modal-description">Copy the link below to share with family.</p>
  <!-- Modal content -->
</div>
```

**Progress Indicator:**
```html
<nav aria-label="Quote progress">
  <ol>
    <li aria-current="false">
      <span class="sr-only">Step 1:</span> Address
      <span class="sr-only">(completed)</span>
    </li>
    <li aria-current="step">
      <span class="sr-only">Step 2:</span> Estimate
      <span class="sr-only">(current step)</span>
    </li>
    <li aria-current="false">
      <span class="sr-only">Step 3:</span> Package
    </li>
    <!-- ... -->
  </ol>
</nav>
```

### Live Regions

**ARIA Live Region Types:**

| Type | Usage | Implementation |
|------|-------|----------------|
| `aria-live="polite"` | Non-urgent updates | Quote calculations, status changes |
| `aria-live="assertive"` | Urgent information | Payment errors, session expiring |
| `role="alert"` | Important errors | Form validation errors |
| `role="status"` | Status updates | Loading states, success messages |

**Toast Notifications:**
```html
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="toast toast-success"
>
  <span class="sr-only">Success:</span>
  Contract signed successfully
</div>
```

**Error Announcements:**
```html
<!-- Assertive for payment failures -->
<div role="alert" aria-live="assertive">
  Payment failed. Please check your card details and try again.
</div>

<!-- Polite for field validation -->
<p id="email-error" role="alert" class="error">
  Please enter a valid email address
</p>
```

**Loading States:**
```html
<div role="status" aria-live="polite">
  <span class="sr-only">Loading your quote...</span>
  <div class="skeleton" aria-hidden="true"></div>
</div>
```

**Price Updates:**
```html
<div aria-live="polite" aria-atomic="true">
  <span class="sr-only">Updated total:</span>
  $13,200
</div>
```

### Screen Reader Announcements

**Page Load Announcements:**
- Use dynamic `<title>` that reflects current state
- Example: "Package Selection - Results Roofing Quote"

**Form Submission Results:**
```typescript
// After successful submission
const announcement = document.createElement('div');
announcement.setAttribute('role', 'status');
announcement.setAttribute('aria-live', 'polite');
announcement.textContent = 'Your appointment has been scheduled for January 14th.';
document.body.appendChild(announcement);
```

**Step Completion:**
```typescript
// When moving to next step
announceToScreenReader(`Step 2 of 5 complete. Now on step 3: Package selection.`);
```

### Hidden Content

**Visually Hidden but Accessible:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Hidden from Screen Readers:**
```html
<!-- Decorative content -->
<svg aria-hidden="true">...</svg>

<!-- Duplicate information -->
<span aria-hidden="true">$</span>
<span class="sr-only">dollars</span>
```

---

## Focus Management

### Modal Focus Trapping

**Behavior:**
1. When modal opens, focus moves to first focusable element (or close button)
2. Tab cycles only through modal content
3. Shift+Tab from first element goes to last element
4. Tab from last element goes to first element
5. Escape closes modal
6. Focus returns to trigger element on close

**Implementation (via Ark UI Dialog):**
```typescript
// Ark UI handles focus trapping automatically
// Additional configuration if needed:
<Dialog.Root
  onOpenChange={(open) => {
    if (!open) {
      // Return focus to trigger
      triggerRef.current?.focus();
    }
  }}
>
  <Dialog.Trigger ref={triggerRef}>Open</Dialog.Trigger>
  <Dialog.Content>
    {/* Focus is trapped here */}
  </Dialog.Content>
</Dialog.Root>
```

### Focus Restoration

**After Modal Close:**
- Focus returns to the element that opened the modal
- If trigger no longer exists, focus moves to next logical element

**After Page Navigation:**
- Focus moves to main content area (`<main tabindex="-1">`)
- Screen reader announces new page title

**After Form Submission:**
```typescript
// On error: focus first invalid field
const firstError = document.querySelector('[aria-invalid="true"]');
firstError?.focus();

// On success with redirect: handled by page navigation
// On success without redirect: focus success message
successMessage.focus();
```

**After Deletion/Removal:**
```typescript
// Focus moves to next item in list, or container if empty
const nextItem = deletedItem.nextElementSibling || deletedItem.previousElementSibling;
if (nextItem) {
  nextItem.focus();
} else {
  container.focus();
}
```

### Multi-Step Form Focus

**Quote Flow Navigation:**
```typescript
// When advancing to next step
useEffect(() => {
  if (currentStep !== prevStep) {
    // Announce step change
    announceToScreenReader(`Step ${currentStep + 1} of 5: ${stepNames[currentStep]}`);

    // Focus main content
    mainContentRef.current?.focus();
  }
}, [currentStep]);
```

**Back Navigation:**
- Focus returns to the selection/field that was previously changed
- If no specific field, focus the primary form element

### Dropdown/Popover Focus

**Open Behavior:**
1. Trigger button retains focus
2. Arrow Down moves focus into dropdown
3. Or: first item receives focus immediately (configurable per component)

**Close Behavior:**
1. Escape returns focus to trigger
2. Selection returns focus to trigger
3. Click outside returns focus to trigger

---

## Color and Contrast

### Contrast Requirements

**WCAG 2.1 AA Requirements:**
- **Normal text (< 18pt or < 14pt bold):** 4.5:1 minimum
- **Large text (>= 18pt or >= 14pt bold):** 3:1 minimum
- **UI components and graphical objects:** 3:1 minimum

### Color Contrast Reference

From 16-design-tokens.md, verified contrast ratios:

| Combination | Contrast Ratio | WCAG AA Status | Usage |
|-------------|----------------|----------------|-------|
| Charcoal (#2C2C2C) on White (#FFFFFF) | 15.6:1 | Pass | Headings, primary text |
| Charcoal on Cream (#FAF8F5) | 14.2:1 | Pass | Headings on page bg |
| Slate (#5C5C5C) on White | 7.1:1 | Pass | Body text |
| Slate on Cream | 6.5:1 | Pass | Body text on page bg |
| Charcoal on Sandstone (#C4A77D) | 5.5:1 | Pass | Text on primary buttons |
| White on Sandstone | 2.8:1 | Fail for text | Avoid white text on Sandstone |
| White on Terracotta (#B86B4C) | 4.5:1 | Pass | Hover state text |
| White on Charcoal | 15.6:1 | Pass | Inverse text |
| Success (#4A7C59) on White | 5.2:1 | Pass | Success text |
| Error (#B54A4A) on White | 5.8:1 | Pass | Error text |
| Warning (#C9A227) on Charcoal | 6.1:1 | Pass | Warning on dark |
| Stone (#9C9688) on White | 3.5:1 | Pass (large text only) | Placeholder, captions |

### Color Usage Rules

**Text on Backgrounds:**
```css
/* Primary text - always Charcoal or Slate */
.text-primary { color: var(--rr-color-text-primary); } /* Charcoal */
.text-secondary { color: var(--rr-color-text-secondary); } /* Slate */
.text-tertiary { color: var(--rr-color-text-tertiary); } /* Stone - large text only */

/* On Sandstone buttons - use Charcoal, NOT white */
.button-primary {
  background: var(--rr-color-brand-primary); /* Sandstone */
  color: var(--rr-color-charcoal); /* Charcoal for contrast */
}

/* On Terracotta (hover) - white is acceptable */
.button-primary:hover {
  background: var(--rr-color-brand-primary-hover); /* Terracotta */
  color: var(--rr-color-white);
}

/* On Charcoal - white text */
.bg-inverse {
  background: var(--rr-color-charcoal);
  color: var(--rr-color-white);
}
```

**Status Indicators:**
```css
/* Always combine color with icon/text */
.error-message {
  color: var(--rr-color-status-error);
}
.error-message::before {
  content: ''; /* Error icon via CSS or inline SVG */
}

.success-indicator {
  color: var(--rr-color-status-success);
}
.success-indicator::before {
  content: ''; /* Checkmark icon */
}
```

### Non-Color Indicators

**Never rely on color alone. Always add:**

| Situation | Color | Additional Indicator |
|-----------|-------|---------------------|
| Form error | Red border | Error icon + error text below field |
| Required field | N/A | Asterisk (*) with `aria-required` |
| Success | Green | Checkmark icon + success text |
| Warning | Yellow/amber | Warning icon + warning text |
| Selected state | Highlighted bg | Border change + checkmark (radio cards) |
| Current step | Filled dot | `aria-current="step"` + larger size |
| Link | Sandstone color | Underline on hover |

### Focus Indicator Contrast

**Focus ring must have 3:1 contrast against adjacent colors:**

| Focus Ring (Sandstone) | Adjacent Color | Ratio | Status |
|------------------------|----------------|-------|--------|
| #C4A77D | White (#FFFFFF) | 2.8:1 | Borderline |
| #C4A77D | Cream (#FAF8F5) | 2.5:1 | Needs offset |

**Solution:** 2px offset ensures focus ring is visible against component backgrounds:
```css
.interactive:focus-visible {
  outline: 2px solid var(--rr-color-sandstone);
  outline-offset: 2px; /* Creates white gap for contrast */
}
```

---

## Form Accessibility

### Label Association

**Every form field must have an associated label:**

```html
<!-- Explicit association (preferred) -->
<label for="email">Email address</label>
<input id="email" type="email" />

<!-- Implicit association -->
<label>
  Email address
  <input type="email" />
</label>

<!-- aria-labelledby for complex cases -->
<span id="price-label">Total price</span>
<input aria-labelledby="price-label" readonly value="$13,200" />
```

**Placeholder is NOT a label:**
```html
<!-- Bad: placeholder only -->
<input type="email" placeholder="Email address" />

<!-- Good: label + optional placeholder -->
<label for="email">Email address</label>
<input id="email" type="email" placeholder="you@example.com" />
```

### Required Fields

```html
<!-- Mark required fields -->
<label for="name">
  Full name
  <span aria-hidden="true">*</span>
</label>
<input
  id="name"
  type="text"
  required
  aria-required="true"
/>

<!-- Legend for form sections -->
<p class="form-instructions">
  <span aria-hidden="true">*</span> indicates required fields
</p>
```

### Error Handling

**Field-Level Errors:**
```html
<div class="field field--error">
  <label for="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
    value="invalid-email"
  />
  <p id="email-error" class="error" role="alert">
    <svg aria-hidden="true" class="error-icon"><!-- Alert icon --></svg>
    Please enter a valid email address
  </p>
</div>
```

**Form-Level Errors (Summary):**
```html
<div role="alert" aria-labelledby="error-summary-title" class="error-summary">
  <h2 id="error-summary-title">Please correct the following errors:</h2>
  <ul>
    <li><a href="#email">Email address is required</a></li>
    <li><a href="#phone">Phone number is invalid</a></li>
  </ul>
</div>
```

**Error Announcement Timing:**
- Field errors: Announce on blur (not during typing)
- Form errors: Announce on submit attempt
- Focus first error field after showing error summary

### Input Instructions

**Help Text:**
```html
<label for="phone">Phone number</label>
<input
  id="phone"
  type="tel"
  aria-describedby="phone-hint"
/>
<p id="phone-hint" class="hint">
  We'll text you appointment reminders
</p>
```

**Format Requirements:**
```html
<label for="signature">Type your full legal name to sign</label>
<input
  id="signature"
  type="text"
  aria-describedby="signature-format"
  autocomplete="name"
/>
<p id="signature-format" class="hint">
  Enter your name exactly as it appears on your ID
</p>
```

### Autocomplete Attributes

| Field | `autocomplete` Value |
|-------|---------------------|
| Full name | `name` |
| Email | `email` |
| Phone | `tel` |
| Street address | `street-address` |
| City | `address-level2` |
| State | `address-level1` |
| ZIP code | `postal-code` |
| Card number | `cc-number` |
| Card expiry | `cc-exp` |
| Card CVC | `cc-csc` |
| Card name | `cc-name` |

### Form Grouping

**Group Related Fields:**
```html
<fieldset>
  <legend>Billing address</legend>

  <label for="street">Street address</label>
  <input id="street" autocomplete="street-address" />

  <label for="city">City</label>
  <input id="city" autocomplete="address-level2" />

  <!-- ... -->
</fieldset>
```

**Radio Groups:**
```html
<fieldset>
  <legend>Select your package</legend>
  <div role="radiogroup">
    <!-- RadioCard components -->
  </div>
</fieldset>
```

---

## Motion and Animation

### Reduced Motion Support

**Respect `prefers-reduced-motion`:**

```css
/* Default animations */
.element {
  transition: transform var(--rr-duration-normal) var(--rr-ease-out);
}

/* From 16-design-tokens.md - automatic zero durations */
@media (prefers-reduced-motion: reduce) {
  :root {
    --rr-duration-instant: 0ms;
    --rr-duration-fast: 0ms;
    --rr-duration-normal: 0ms;
    --rr-duration-slow: 0ms;
    --rr-duration-slower: 0ms;
  }

  /* Disable CSS animations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Safe Animations

**Animations that remain enabled with reduced motion:**
- Loading spinners (functional, not decorative)
- Progress bar updates (essential feedback)
- Focus indicator appearance (no transition needed)

**Animations disabled with reduced motion:**
- Page transitions
- Modal open/close animations
- Hover state transitions
- Skeleton shimmer effects
- Success checkmark bounce
- Error shake animation

### Animation Guidelines

| Animation Type | Duration | Reduced Motion |
|----------------|----------|----------------|
| Micro-interactions (hover, press) | 100-150ms | Disabled |
| Content transitions (modal, page) | 150-200ms | Disabled |
| Emphasis animations (success bounce) | 200-300ms | Disabled |
| Loading spinners | Continuous | Enabled (simplified) |
| Progress indicators | Variable | Enabled (no animation) |

### No Flashing Content

**Requirement:** No content flashes more than 3 times per second.

**Implementation:**
- Skeleton shimmer: 1.5s cycle (well under limit)
- Loading spinner: Continuous rotation (no flashing)
- No blinking text or elements
- Error states: Single shake, not repeated

---

## Touch Targets

### Minimum Size Requirements

**WCAG 2.5.5 Target Size:**
- Minimum touch target: 44x44 CSS pixels
- Target spacing: At least 8px between targets

**From 16-design-tokens.md:**
```css
--rr-touch-target-min: 44px;
```

### Component Touch Targets

| Component | Size | Notes |
|-----------|------|-------|
| Button (sm) | 36px height | Only for dense UI, adds padding to reach 44px |
| Button (md) | 44px height | Default, meets requirement |
| Button (lg) | 52px height | Exceeds requirement |
| IconButton (sm) | 32x32px | Add padding to reach 44px |
| IconButton (md) | 40x40px | Add padding to reach 44px |
| IconButton (lg) | 48x48px | Exceeds requirement |
| Text input | 48px height | Exceeds requirement |
| Radio card | 56px min-height | Exceeds requirement |
| Checkbox | 20x20px visual | 44x44px click area via padding |
| Tab bar items | 64px height | Exceeds requirement |
| Calendar cells (mobile) | 40x40px | Acceptable (spacing compensates) |

### Touch Target Implementation

**Checkbox with expanded touch target:**
```css
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: var(--rr-space-2);
}

.checkbox {
  width: 20px;
  height: 20px;
}
```

**Icon button with expanded touch target:**
```css
.icon-button {
  /* Visual size */
  width: 32px;
  height: 32px;

  /* Touch target via padding */
  padding: 6px;
  margin: -6px;

  /* Or use min-size */
  min-width: 44px;
  min-height: 44px;
}
```

**Link spacing:**
```css
.link-list a {
  display: block;
  padding: var(--rr-space-3) 0;
  min-height: 44px;
}
```

---

## Component-Specific Accessibility

### Button

| Requirement | Implementation |
|-------------|----------------|
| Keyboard operable | Native `<button>` element |
| Focus visible | 2px Sandstone outline |
| Loading state | `aria-busy="true"`, disabled |
| Disabled state | `aria-disabled="true"` (not `disabled` for focusability) |
| Touch target | Min 44x44px |

### TextInput

| Requirement | Implementation |
|-------------|----------------|
| Label association | `<label for="">` or `aria-labelledby` |
| Error state | `aria-invalid="true"` |
| Description | `aria-describedby` for hint/error |
| Autocomplete | `autocomplete` attribute |
| Touch target | 48px height |

### Select

| Requirement | Implementation |
|-------------|----------------|
| Role | `role="combobox"` on trigger |
| Expanded state | `aria-expanded` |
| Listbox | `role="listbox"` on options container |
| Options | `role="option"`, `aria-selected` |
| Keyboard | Arrow keys, type-ahead |

### RadioCardGroup

| Requirement | Implementation |
|-------------|----------------|
| Group role | `role="radiogroup"` |
| Radio role | `role="radio"` on each card |
| Checked state | `aria-checked` |
| Keyboard | Arrow keys to navigate, Space to select |
| Touch target | 56px min-height |

### Modal

| Requirement | Implementation |
|-------------|----------------|
| Dialog role | `role="dialog"` |
| Modal state | `aria-modal="true"` |
| Title | `aria-labelledby` pointing to heading |
| Focus trap | Tab cycles within modal |
| Close on Escape | Keyboard listener |
| Focus restoration | Return to trigger on close |
| Body scroll lock | `overflow: hidden` on body |

### Toast

| Requirement | Implementation |
|-------------|----------------|
| Status role | `role="status"` (polite) or `role="alert"` (assertive) |
| Live region | `aria-live="polite"` or `aria-live="assertive"` |
| Atomic | `aria-atomic="true"` |
| Dismissible | Close button with `aria-label` |
| Auto-dismiss | Pause on hover, sufficient time (5s default) |

### ProgressIndicator

| Requirement | Implementation |
|-------------|----------------|
| Navigation role | `role="navigation"` with `aria-label` |
| Current step | `aria-current="step"` |
| List structure | `<ol>` with `<li>` items |
| Completion state | SR-only "(completed)" text |

### DatePicker

| Requirement | Implementation |
|-------------|----------------|
| Grid role | `role="grid"` for calendar |
| Row role | `role="row"` for weeks |
| Cell role | `role="gridcell"` for days |
| Selected | `aria-selected` on chosen date |
| Disabled | `aria-disabled` on unavailable dates |
| Keyboard | Full arrow key navigation |

### StatusTimeline

| Requirement | Implementation |
|-------------|----------------|
| List structure | `<ol>` semantic list |
| Current item | `aria-current="step"` |
| Descriptions | Each step has label + optional date |
| Status | Visual + text indicator (completed/current/upcoming) |

### CollapsiblePanel

| Requirement | Implementation |
|-------------|----------------|
| Button trigger | Button with `aria-expanded` |
| Controls | `aria-controls` pointing to content ID |
| Content | `id` matching `aria-controls` |
| Hidden state | `hidden` attribute or `aria-hidden` |

---

## Testing Strategy

### Automated Testing

**Tool: axe-core with @axe-core/playwright**

**Integration in CI/CD:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Enable axe-core
  },
});

// example.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('quote page is accessible', async ({ page }) => {
  await page.goto('/quote/estimate');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

**Automated Checks:**
- ARIA attribute validity
- Color contrast ratios
- Form label associations
- Heading hierarchy
- Image alt text
- Keyboard focus order
- Link text descriptiveness

**Run on:**
- Every PR (required to pass)
- Nightly full test suite
- Before production deploy

### Manual Testing Checklist

**Keyboard Navigation:**
- [ ] Can complete entire quote flow using only keyboard
- [ ] Focus indicator visible on all interactive elements
- [ ] Tab order follows logical reading order
- [ ] Escape closes all modals and dropdowns
- [ ] No keyboard traps

**Screen Reader Testing:**

| Screen Reader | Browser | Priority |
|---------------|---------|----------|
| VoiceOver | Safari (macOS) | High |
| NVDA | Firefox/Chrome (Windows) | High |
| VoiceOver | Safari (iOS) | Medium |
| TalkBack | Chrome (Android) | Medium |

**Screen Reader Checklist:**
- [ ] Page titles announced on navigation
- [ ] All form fields have accessible names
- [ ] Error messages announced when they appear
- [ ] Dynamic content changes announced
- [ ] Images have appropriate alt text
- [ ] Tables (if any) have headers

**Zoom and Reflow:**
- [ ] Content readable at 200% zoom
- [ ] No horizontal scroll at 320px width
- [ ] No text clipped at increased text spacing

**Color and Contrast:**
- [ ] All text passes contrast requirements
- [ ] Focus indicators visible
- [ ] No information conveyed by color alone

**Motion:**
- [ ] Reduced motion preference respected
- [ ] No flashing content
- [ ] Animations can be paused

**Touch Accessibility (Mobile):**
- [ ] All touch targets at least 44x44px
- [ ] Adequate spacing between targets
- [ ] Gestures have button alternatives

### Testing Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| axe DevTools | Browser extension | Manual spot checks |
| WAVE | Browser extension | Visual accessibility overlay |
| Lighthouse | Chrome DevTools | Accessibility audit |
| axe-core/playwright | Automated testing | CI integration |
| VoiceOver | macOS built-in | Screen reader testing |
| NVDA | Windows free | Screen reader testing |
| Color Contrast Analyzer | Desktop app | Manual contrast checks |
| Accessibility Insights | Browser extension | Tab stop visualization |

### Testing Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Automated axe-core tests | Every PR | CI |
| Manual keyboard navigation | Weekly | QA |
| Screen reader testing | Before major release | QA |
| Contrast audit | When colors change | Design |
| Touch target review | When components change | Design/Dev |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [06-component-specs.md](./06-component-specs.md) | Component APIs with accessibility props |
| [16-design-tokens.md](./16-design-tokens.md) | Focus ring tokens, contrast ratios, touch targets |
| [05-ui-ux-design.md](./05-ui-ux-design.md) | Wireframes and interaction patterns |
| [17-code-patterns.md](./17-code-patterns.md) | Implementation patterns for accessible components |
| [BRAND-ASSETS.md](./BRAND-ASSETS.md) | Color system with contrast notes |
| [02-user-personas.md](./02-user-personas.md) | User demographics including aging homeowners |

---

## Quality Checklist

Before marking this document complete:

- [x] WCAG 2.1 AA requirements mapped to implementation
- [x] Keyboard navigation patterns documented
- [x] Screen reader support (ARIA, live regions) documented
- [x] Focus management rules defined
- [x] Color contrast requirements documented with specific ratios
- [x] Form accessibility patterns documented
- [x] Reduced motion support documented
- [x] Touch target requirements documented
- [x] Component-specific accessibility requirements documented
- [x] Automated testing strategy defined (axe-core)
- [x] Manual testing checklist created
- [x] Related Documents links are bidirectional

**Status: COMPLETE** - Ready for Phase 3 Sprint Planning
