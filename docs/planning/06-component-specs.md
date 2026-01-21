# 06 - Component Specs

> **Purpose:** Defines all UI components for the Results Roofing web application. Components implement the designs from 05-ui-ux-design.md using tokens from BRAND-ASSETS.md.

**Status:** COMPLETE
**Last Updated:** 2026-01-21

---

## Component Architecture Overview

### Component Model

**Framework:** React 18+ with Next.js App Router

**Component Format:** `.tsx` files with named exports. Each component has:
- `ComponentName.tsx` - Component implementation
- `ComponentName.test.tsx` - Unit tests (co-located)
- `index.ts` - Barrel export (in component folder)

**State Management:**
- **Local state:** React useState/useReducer for UI-only state
- **Form state:** React Hook Form with Zod validation
- **Server state:** React Query (TanStack Query) for API data
- **Global state:** React Context for theme, auth, quote session

**Styling Approach:**
- CSS Modules with design token CSS custom properties
- Ark UI as headless component foundation
- No Tailwind - custom design system only

### Component Organization

**Strategy:** Hybrid (Type-based + Feature-based)

Base/shared components organized by type. Feature-specific components grouped by domain.

**Folder Structure:**
```
src/
├── components/
│   ├── ui/                    # Shared UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── ...
│   ├── layout/                # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Container/
│   │   └── ...
│   ├── navigation/            # Navigation components
│   │   ├── ProgressIndicator/
│   │   ├── BottomTabBar/
│   │   ├── SideNav/
│   │   └── ...
│   └── features/              # Feature-specific components
│       ├── quote/
│       │   ├── AddressInput/
│       │   ├── PackageTierCard/
│       │   └── ...
│       ├── checkout/
│       │   ├── OrderSummary/
│       │   ├── PaymentForm/
│       │   └── ...
│       └── portal/
│           ├── StatusTimeline/
│           ├── QuickActionGrid/
│           └── ...
└── lib/
    └── ark-ui/                # Ark UI component wrappers
```

---

## Component Hierarchy

```
AppRoot (layout.tsx)
├── Header
│   ├── Logo
│   ├── TrustBadge (desktop)
│   └── MobileMenu (mobile)
├── Main
│   ├── [Quote Flow Pages]
│   │   ├── ProgressIndicator
│   │   ├── PageContent
│   │   │   ├── AddressInput
│   │   │   ├── PackageTierCard (x3)
│   │   │   ├── PackageComparison
│   │   │   ├── FinancingOptions
│   │   │   ├── DatePicker
│   │   │   ├── ContractSummary
│   │   │   └── PaymentForm
│   │   └── StickyFooter (mobile)
│   │       └── Button (primary CTA)
│   ├── [Checkout Pages]
│   │   ├── ProgressIndicator
│   │   ├── CheckoutForm
│   │   └── OrderSummary (sidebar/collapsible)
│   └── [Portal Pages]
│       ├── SideNav (desktop) / BottomTabBar (mobile)
│       ├── StatusTimeline
│       ├── QuickActionGrid
│       └── DocumentList
├── Footer
│   ├── TrustFooter
│   └── LegalLinks
├── ModalContainer
│   └── [Dynamic modals: Share, Breakdown, etc.]
└── ToastContainer
    └── [Dynamic toasts]
```

### Hierarchy Notes

- **Header/Footer** are layout-level, rendered in root layout
- **ProgressIndicator** is rendered conditionally in quote/checkout flows only
- **StickyFooter** appears on mobile only, contains primary CTA
- **SideNav/BottomTabBar** are mutually exclusive based on viewport
- **Modals/Toasts** render into portal containers at root level

---

## Component Categories

| Category | Components | Description |
|----------|------------|-------------|
| **Inputs** | AddressAutocomplete, TextInput, Textarea, RadioCardGroup, Checkbox, Select, DatePicker | Form input elements |
| **Buttons** | Button (variants: primary, secondary, ghost, danger), IconButton | Clickable actions |
| **Cards** | Card, PackageTierCard, SummaryCard, QuickActionCard | Content containers |
| **Navigation** | ProgressIndicator, BottomTabBar, SideNav, Breadcrumb | Wayfinding elements |
| **Layout** | Header, Footer, Container, Section, StickyFooter, CollapsiblePanel | Page structure |
| **Feedback** | Toast, Modal, Skeleton, Spinner, ErrorMessage, Badge | User feedback |
| **Data Display** | StatusTimeline, PriceBreakdown, DocumentList | Structured data |

---

## Shared/Base Components

### Button

**Purpose:** Trigger actions when clicked. Primary interactive element throughout the application.

**Variants:**

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| `primary` | Sandstone | White | None | Main CTAs: "Get My Free Estimate", "Continue" |
| `secondary` | Transparent | Charcoal | Sand | Supporting actions: "View Details", "Change Selection" |
| `ghost` | Transparent | Slate | None | Low-emphasis: "Skip", "Cancel" |
| `danger` | Error | White | None | Destructive actions (rare in this app) |

**Sizes:**

| Size | Height | Padding | Font Size | Min Width | Use Case |
|------|--------|---------|-----------|-----------|----------|
| `sm` | 36px | 12px 16px | 14px | 64px | Dense UI, inline actions |
| `md` | 44px | 12px 24px | 16px | 80px | Default, most contexts |
| `lg` | 52px | 16px 32px | 18px | 96px | Primary CTAs, mobile touch targets |

**States:**
- **Default:** Base styling per variant
- **Hover:** Primary→Terracotta, Secondary→Sand Light bg, Ghost→Sand Light bg
- **Focus:** 2px Sandstone outline, 2px offset
- **Active:** Scale 95%, 100ms transition
- **Disabled:** 50% opacity, cursor not-allowed
- **Loading:** Spinner replaces text, button disabled

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | No | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Button size |
| `disabled` | `boolean` | No | `false` | Disable interaction |
| `loading` | `boolean` | No | `false` | Show loading spinner |
| `fullWidth` | `boolean` | No | `false` | Expand to container width |
| `leftIcon` | `ReactNode` | No | - | Icon before text |
| `rightIcon` | `ReactNode` | No | - | Icon after text |
| `type` | `'button' \| 'submit' \| 'reset'` | No | `'button'` | HTML button type |
| `onClick` | `() => void` | No | - | Click handler |
| `children` | `ReactNode` | Yes | - | Button content |

**Accessibility:**
- Renders as `<button>` element
- `aria-disabled` when disabled (not `disabled` attr, for focus)
- `aria-busy="true"` when loading
- Visible focus indicator meets WCAG 2.1
- Minimum 44x44px touch target (enforced by size)

---

### IconButton

**Purpose:** Icon-only buttons for compact UI areas (close, menu, back).

**Sizes:**

| Size | Dimensions | Icon Size |
|------|------------|-----------|
| `sm` | 32x32px | 16px |
| `md` | 40x40px | 20px |
| `lg` | 48x48px | 24px |

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `icon` | `ReactNode` | Yes | - | Lucide icon component |
| `label` | `string` | Yes | - | Accessible label (aria-label) |
| `variant` | `'default' \| 'ghost'` | No | `'default'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Button size |
| `disabled` | `boolean` | No | `false` | Disable interaction |
| `onClick` | `() => void` | No | - | Click handler |

**Accessibility:**
- `aria-label` required (label prop)
- Same focus/touch requirements as Button

---

### TextInput

**Purpose:** Single-line text input for forms.

**Types:**

| Type | Usage | Features |
|------|-------|----------|
| `text` | General text | Standard input |
| `email` | Email addresses | Email keyboard on mobile |
| `tel` | Phone numbers | Number pad on mobile |
| `password` | Passwords | Toggle visibility icon |
| `search` | Search queries | Clear button |

**States:**
- **Default:** Sand border, White bg
- **Focus:** Sandstone border, subtle glow (0 0 0 3px rgba(196,167,125,0.15))
- **Filled:** Charcoal text
- **Error:** Error border, Error bg at 5% opacity
- **Disabled:** Sand bg, 50% opacity
- **Read-only:** Cream bg, no focus ring

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | `'text' \| 'email' \| 'tel' \| 'password' \| 'search'` | No | `'text'` | Input type |
| `value` | `string` | Yes | - | Controlled value |
| `onChange` | `(value: string) => void` | Yes | - | Change handler |
| `placeholder` | `string` | No | - | Placeholder text |
| `label` | `string` | No | - | Label text (renders above) |
| `error` | `string` | No | - | Error message |
| `hint` | `string` | No | - | Helper text below input |
| `disabled` | `boolean` | No | `false` | Disable input |
| `readOnly` | `boolean` | No | `false` | Read-only mode |
| `required` | `boolean` | No | `false` | Required field |
| `leftIcon` | `ReactNode` | No | - | Icon inside left |
| `rightIcon` | `ReactNode` | No | - | Icon inside right |
| `autoComplete` | `string` | No | - | Autocomplete hint |

**Dimensions:**
- Height: 48px (includes padding)
- Padding: 12px 16px (with icon: 12px 16px 12px 44px)
- Border radius: 8px (radius-md)
- Font size: 16px (prevents iOS zoom)

**Accessibility:**
- Label associated via `id`/`htmlFor`
- `aria-invalid="true"` when error
- `aria-describedby` links to error/hint
- Error announced to screen readers

---

### Textarea

**Purpose:** Multi-line text input.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | - | Controlled value |
| `onChange` | `(value: string) => void` | Yes | - | Change handler |
| `placeholder` | `string` | No | - | Placeholder text |
| `label` | `string` | No | - | Label text |
| `error` | `string` | No | - | Error message |
| `rows` | `number` | No | `4` | Visible rows |
| `maxLength` | `number` | No | - | Character limit |
| `disabled` | `boolean` | No | `false` | Disable input |

**Behavior:**
- Auto-resize optional (grows with content)
- Character count shown when maxLength set

---

### RadioCardGroup

**Purpose:** Mutually exclusive selection using card-style radio buttons. Used for motivation capture, financing terms, time slots.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | Form field name |
| `value` | `string` | Yes | - | Selected value |
| `onChange` | `(value: string) => void` | Yes | - | Selection handler |
| `options` | `RadioCardOption[]` | Yes | - | Available options |
| `orientation` | `'vertical' \| 'horizontal'` | No | `'vertical'` | Layout direction |
| `error` | `string` | No | - | Error message |

**RadioCardOption type:**
```typescript
interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}
```

**Styling:**
- Unselected: White bg, Sand border
- Hover: Sand Light bg
- Selected: Sandstone border (2px), Sand Light bg
- Focus: Sandstone outline
- Disabled: 50% opacity

**Dimensions:**
- Min height: 56px (touch target)
- Padding: 16px
- Border radius: 8px
- Gap between cards: 12px

---

### Checkbox

**Purpose:** Boolean toggle for terms acceptance, opt-ins.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `checked` | `boolean` | Yes | - | Checked state |
| `onChange` | `(checked: boolean) => void` | Yes | - | Change handler |
| `label` | `ReactNode` | Yes | - | Label content (can include links) |
| `error` | `string` | No | - | Error message |
| `disabled` | `boolean` | No | `false` | Disable interaction |

**Styling:**
- Box: 20x20px, Sand border, White bg
- Checked: Sandstone bg, white checkmark
- Focus: Sandstone outline
- Checkmark animates in (100ms draw)

**Accessibility:**
- Custom styled but uses native checkbox for a11y
- Label clickable
- Focus visible

---

### Select

**Purpose:** Dropdown selection for predefined options.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | - | Selected value |
| `onChange` | `(value: string) => void` | Yes | - | Selection handler |
| `options` | `SelectOption[]` | Yes | - | Available options |
| `placeholder` | `string` | No | `'Select...'` | Placeholder text |
| `label` | `string` | No | - | Label text |
| `error` | `string` | No | - | Error message |
| `disabled` | `boolean` | No | `false` | Disable selection |

**SelectOption type:**
```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

**Behavior:**
- Uses Ark UI Select for accessible dropdown
- Keyboard navigable (arrow keys, type-ahead)
- Dropdown positioned intelligently (flip if needed)

---

### DatePicker

**Purpose:** Date selection for scheduling appointments (F07).

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `Date \| null` | Yes | - | Selected date |
| `onChange` | `(date: Date) => void` | Yes | - | Selection handler |
| `minDate` | `Date` | No | today | Earliest selectable date |
| `maxDate` | `Date` | No | - | Latest selectable date |
| `disabledDates` | `Date[]` | No | `[]` | Specific dates to disable |
| `availableDates` | `Date[]` | No | - | If set, only these dates selectable |
| `label` | `string` | No | - | Label text |
| `error` | `string` | No | - | Error message |

**Calendar Styling:**
- Month header: Inter 500, 18px
- Day cells: 40x40px (mobile), 36x36px (desktop)
- Today: Dotted Sandstone border
- Selected: Sandstone bg, white text
- Disabled: 30% opacity
- Hover (available): Sand Light bg

**Behavior:**
- Opens as inline calendar (not modal on mobile)
- Month navigation via chevron buttons
- Keyboard: Arrow keys to navigate, Enter to select
- Closes on selection or outside click

---

### AddressAutocomplete

**Purpose:** Google Places-powered address input (F01). Core entry point for quote flow.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | - | Current input value |
| `onChange` | `(value: string) => void` | Yes | - | Input change handler |
| `onSelect` | `(place: PlaceResult) => void` | Yes | - | Place selection handler |
| `placeholder` | `string` | No | `'Enter your address'` | Placeholder |
| `error` | `string` | No | - | Error message |
| `loading` | `boolean` | No | `false` | Show loading state |

**PlaceResult type:**
```typescript
interface PlaceResult {
  formattedAddress: string;
  streetNumber: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  placeId: string;
}
```

**Behavior:**
- Debounced API calls (300ms)
- Shows dropdown with suggestions
- Validates service area (TX, GA, NC, AZ) on selection
- Shows checkmark on valid selection
- Shows error for out-of-area

**Styling:**
- Uses TextInput as base with Home icon
- Dropdown: White bg, shadow-md, 8px radius
- Suggestion items: 48px height, hover Sand Light

---

## Navigation Components

### ProgressIndicator

**Purpose:** Show user's position in quote/checkout funnel. Builds confidence and reduces anxiety.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `steps` | `ProgressStep[]` | Yes | - | Step definitions |
| `currentStep` | `number` | Yes | - | Current step (0-indexed) |
| `variant` | `'dots' \| 'segments'` | No | `'dots'` | Visual style |

**ProgressStep type:**
```typescript
interface ProgressStep {
  label: string;
  href?: string; // If provided, completed steps are clickable
}
```

**Default Steps (from 05-ui-ux-design.md):**
1. Address
2. Estimate
3. Package
4. Schedule
5. Complete

**Styling:**
- **Dots variant (mobile):**
  - Completed: Sandstone filled circle (8px)
  - Current: Sandstone filled circle (12px)
  - Pending: Stone outline circle (8px)
  - Gap: 8px

- **Segments variant (desktop):**
  - Completed: Sandstone bar + checkmark
  - Current: Sandstone bar + label
  - Pending: Sand bar
  - Connector lines between

**Accessibility:**
- `role="navigation"` with `aria-label="Progress"`
- Current step: `aria-current="step"`
- Steps are list items for screen readers

---

### BottomTabBar

**Purpose:** Portal navigation on mobile (< 768px). Persistent at viewport bottom.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `TabItem[]` | Yes | - | Navigation items |
| `activeItem` | `string` | Yes | - | Active item ID |
| `onSelect` | `(id: string) => void` | Yes | - | Selection handler |

**TabItem type:**
```typescript
interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: string; // e.g., "Due" for payments
}
```

**Default Items (Portal):**
| ID | Label | Icon | Badge |
|----|-------|------|-------|
| `dashboard` | Home | Home | - |
| `documents` | Docs | FileText | - |
| `schedule` | Apt | Calendar | - |
| `payments` | Pay | CreditCard | "Due" if balance |
| `help` | Help | HelpCircle | - |

**Styling:**
- Height: 64px + safe-area-inset-bottom
- Background: White
- Border-top: 1px Sand
- Icon: 24px, Slate (inactive), Sandstone (active)
- Label: 12px, below icon
- Badge: Error red pill, white text

**Behavior:**
- Fixed position at bottom
- Active item highlighted
- Tap navigates via Next.js Link

---

### SideNav

**Purpose:** Portal navigation on desktop (>= 1024px). Left sidebar.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `NavItem[]` | Yes | - | Navigation items |
| `activeItem` | `string` | Yes | - | Active item ID |
| `collapsed` | `boolean` | No | `false` | Collapsed state (icons only) |
| `onToggle` | `() => void` | No | - | Collapse toggle handler |

**NavItem type:**
```typescript
interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: string;
}
```

**Styling:**
- Width: 240px (expanded), 64px (collapsed)
- Background: White
- Border-right: 1px Sand
- Item height: 48px
- Active: Sand Light bg, Sandstone left border (3px)
- Hover: Sand Light bg

---

### Header

**Purpose:** Site header with logo, trust signals, and navigation.

**Variants:**

| Variant | Usage | Contents |
|---------|-------|----------|
| `marketing` | Landing page | Logo, Trust badge, Phone (desktop) |
| `checkout` | Quote/checkout flow | Logo, Progress indicator |
| `portal` | Customer portal | Logo, User greeting, Logout |

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'marketing' \| 'checkout' \| 'portal'` | No | `'marketing'` | Header style |
| `showBack` | `boolean` | No | `false` | Show back button |
| `onBack` | `() => void` | No | - | Back button handler |
| `user` | `{ name: string } \| null` | No | `null` | Current user (portal) |
| `progressProps` | `ProgressIndicatorProps` | No | - | Progress indicator props |

**Styling:**
- Height: 64px (desktop), 56px (mobile)
- Background: White
- Border-bottom: 1px Sand
- Logo: Left-aligned
- Content: Centered (checkout) or right-aligned

**Responsive:**
- Mobile: Logo + menu button (if needed)
- Desktop: Full contents visible

---

### Footer

**Purpose:** Trust signals and legal links.

**Variants:**

| Variant | Usage |
|---------|-------|
| `full` | Marketing pages |
| `minimal` | Checkout/portal |

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'full' \| 'minimal'` | No | `'minimal'` | Footer style |

**Contents (full):**
- Trust line: License numbers, service area, years in business
- Legal links: Privacy, Terms, Refunds
- Copyright

**Contents (minimal):**
- Single line: Legal links + copyright

**Styling:**
- Background: Cream
- Padding: 24px (full), 16px (minimal)
- Text: Body Small, Stone color

---

## Layout Components

### Container

**Purpose:** Constrain content width and center horizontally.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | No | `'md'` | Max width |
| `padding` | `boolean` | No | `true` | Include horizontal padding |
| `children` | `ReactNode` | Yes | - | Content |

**Sizes:**

| Size | Max Width | Usage |
|------|-----------|-------|
| `sm` | 480px | Forms, narrow content |
| `md` | 720px | Quote flow main content |
| `lg` | 1024px | Comparison tables, portal |
| `full` | 100% | Full-bleed sections |

**Styling:**
- Horizontal padding: 16px (mobile), 24px (desktop)
- Centered with margin auto

---

### Section

**Purpose:** Vertical content section with consistent spacing.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `spacing` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Vertical padding |
| `background` | `'white' \| 'cream' \| 'sand'` | No | `'white'` | Background color |
| `children` | `ReactNode` | Yes | - | Content |

**Spacing:**

| Size | Padding |
|------|---------|
| `sm` | 24px 0 |
| `md` | 48px 0 |
| `lg` | 96px 0 |

---

### StickyFooter

**Purpose:** Mobile sticky CTA bar at bottom of screen. Contains primary action.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | - | Content (typically Button) |
| `show` | `boolean` | No | `true` | Visibility toggle |

**Styling:**
- Position: fixed bottom
- Background: White
- Border-top: 1px Sand
- Padding: 16px + safe-area-inset-bottom
- Shadow: shadow-lg (upward)

**Behavior:**
- Only renders on mobile (< 768px)
- Hides when keyboard is open (mobile)
- Content above must account for footer height

---

### CollapsiblePanel

**Purpose:** Expandable/collapsible content section. Used for order summary on mobile checkout.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | - | Panel header |
| `summary` | `ReactNode` | No | - | Collapsed preview |
| `defaultOpen` | `boolean` | No | `false` | Initial state |
| `children` | `ReactNode` | Yes | - | Expanded content |

**Styling:**
- Header: 56px height, clickable
- Chevron icon rotates on expand
- Content animates height (200ms ease-out)

**Accessibility:**
- `aria-expanded` on trigger
- `aria-controls` linking to content
- Content receives focus when opened

---

## Feedback Components

### Toast

**Purpose:** Transient notifications for actions and status updates.

**Variants:**

| Variant | Icon | Color | Usage |
|---------|------|-------|-------|
| `success` | Check | Success | "Contract signed", "Payment processed" |
| `error` | AlertCircle | Error | "Payment failed", "Session expired" |
| `warning` | AlertTriangle | Warning | "Slot almost full" |
| `info` | Info | Info | "Quote saved" |

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | No | `'info'` | Toast type |
| `title` | `string` | Yes | - | Primary message |
| `description` | `string` | No | - | Secondary message |
| `duration` | `number` | No | `5000` | Auto-dismiss ms (0 = manual) |
| `action` | `{ label: string; onClick: () => void }` | No | - | Action button |

**Styling:**
- Position: Top-right (desktop), top-center (mobile)
- Width: 320px (desktop), calc(100% - 32px) (mobile)
- Background: White
- Border-left: 4px in variant color
- Shadow: shadow-lg
- Border-radius: 8px

**Animation:**
- Enter: Slide in from right, fade in (200ms)
- Exit: Fade out, slide up (150ms)

**Behavior:**
- Stacks with 8px gap (newest on top)
- Max 3 visible, oldest dismissed
- Swipe to dismiss on mobile
- Pause timer on hover

---

### Modal

**Purpose:** Overlay dialogs for focused interactions.

**Variants:**

| Variant | Width | Usage |
|---------|-------|-------|
| `sm` | 400px | Confirmations, simple forms |
| `md` | 560px | Share quote, breakdown view |
| `lg` | 720px | Contract viewer |
| `fullscreen` | 100% | Mobile forms |

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | `boolean` | Yes | - | Visibility state |
| `onClose` | `() => void` | Yes | - | Close handler |
| `title` | `string` | Yes | - | Modal title |
| `size` | `'sm' \| 'md' \| 'lg' \| 'fullscreen'` | No | `'md'` | Modal width |
| `closeOnOverlay` | `boolean` | No | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | No | `true` | Close on Escape key |
| `children` | `ReactNode` | Yes | - | Modal content |
| `footer` | `ReactNode` | No | - | Footer content (buttons) |

**Styling:**
- Backdrop: Charcoal at 50% opacity
- Background: White
- Border-radius: 12px (16px on mobile fullscreen = 0)
- Padding: 24px
- Header: Title + close button

**Animation:**
- Backdrop: Fade in (150ms)
- Modal: Scale from 95% + fade in (200ms ease-out)
- Close: Reverse (150ms ease-in)

**Accessibility:**
- `role="dialog"` with `aria-modal="true"`
- `aria-labelledby` pointing to title
- Focus trapped within modal
- Focus returns to trigger on close
- Body scroll locked

---

### Skeleton

**Purpose:** Placeholder loading state that matches content layout.

**Variants:**

| Variant | Usage |
|---------|-------|
| `text` | Text lines |
| `heading` | Headings |
| `avatar` | Circular images |
| `card` | Full card placeholder |
| `button` | Button placeholder |

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'text' \| 'heading' \| 'avatar' \| 'card' \| 'button'` | No | `'text'` | Skeleton type |
| `width` | `string \| number` | No | `'100%'` | Element width |
| `height` | `string \| number` | No | variant-based | Element height |
| `lines` | `number` | No | `1` | Number of text lines |

**Styling:**
- Background: Sand at 50% opacity
- Animation: Shimmer pulse (1.5s ease-in-out infinite)
- Border-radius: Matches actual element

**Predefined Skeletons:**
- `PackageTierCardSkeleton` - Matches PackageTierCard
- `SummaryCardSkeleton` - Matches SummaryCard
- `TimelineSkeleton` - Matches StatusTimeline

---

### Spinner

**Purpose:** Inline loading indicator.

**Sizes:**

| Size | Dimensions | Usage |
|------|------------|-------|
| `sm` | 16px | Inline with text |
| `md` | 24px | Buttons, inputs |
| `lg` | 40px | Section loading |
| `xl` | 56px | Page loading |

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | No | `'md'` | Spinner size |
| `color` | `string` | No | `'sandstone'` | Spinner color |
| `label` | `string` | No | - | Accessible label |

**Styling:**
- SVG circle with animated stroke
- Sandstone color by default
- Rotation animation (1s linear infinite)

**Accessibility:**
- `role="status"` with `aria-label`
- Hidden from screen readers if decorative

---

### ErrorMessage

**Purpose:** Display validation or system errors inline.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `message` | `string` | Yes | - | Error text |
| `icon` | `boolean` | No | `true` | Show error icon |

**Styling:**
- Color: Error
- Font size: 14px (Body Small)
- Icon: AlertCircle, 16px
- Gap: 8px between icon and text
- Animation: Fade in + slight shake (200ms)

**Accessibility:**
- `role="alert"` for immediate announcement
- Associated with input via `aria-describedby`

---

### Badge

**Purpose:** Status indicators, counts, labels.

**Variants:**

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| `default` | Sand | Slate | General labels |
| `primary` | Sandstone | White | Highlights |
| `success` | Success light | Success | Completed |
| `warning` | Warning light | Warning dark | Attention |
| `error` | Error light | Error | Problems |

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error'` | No | `'default'` | Badge style |
| `size` | `'sm' \| 'md'` | No | `'md'` | Badge size |
| `children` | `ReactNode` | Yes | - | Badge content |

**Styling:**
- Border-radius: full (pill shape)
- Padding: 2px 8px (sm), 4px 12px (md)
- Font size: 12px (sm), 14px (md)
- Font weight: 500

---

## Card Components

### Card

**Purpose:** Base container for grouped content.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined'` | No | `'default'` | Card style |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | No | `'md'` | Internal padding |
| `interactive` | `boolean` | No | `false` | Hover/click styles |
| `onClick` | `() => void` | No | - | Click handler |
| `children` | `ReactNode` | Yes | - | Card content |

**Styling:**

| Variant | Background | Border | Shadow |
|---------|------------|--------|--------|
| `default` | White | 1px Sand | shadow-sm |
| `elevated` | White | None | shadow-md |
| `outlined` | Transparent | 1px Sand | None |

**Padding:**

| Size | Value |
|------|-------|
| `none` | 0 |
| `sm` | 16px |
| `md` | 24px |
| `lg` | 32px |

- Border-radius: 12px (radius-lg)
- Hover (interactive): shadow-md, slight lift

---

### PackageTierCard

**Purpose:** Display Good/Better/Best package options (F02, F04).

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tier` | `'good' \| 'better' \| 'best'` | Yes | - | Package tier |
| `name` | `string` | Yes | - | Package name |
| `price` | `{ min: number; max: number } \| number` | Yes | - | Price range or exact |
| `monthlyPayment` | `number` | No | - | Monthly estimate |
| `features` | `PackageFeature[]` | Yes | - | Feature list |
| `warranty` | `string` | Yes | - | Warranty term |
| `timeline` | `string` | Yes | - | Estimated timeline |
| `recommended` | `boolean` | No | `false` | Show recommended badge |
| `selected` | `boolean` | No | `false` | Selection state |
| `onSelect` | `() => void` | Yes | - | Selection handler |

**PackageFeature type:**
```typescript
interface PackageFeature {
  label: string;
  value: string;
  tooltip?: string;
}
```

**Styling:**

| Tier | Border | Header | Badge |
|------|--------|--------|-------|
| `good` | Sand | None | None |
| `better` | Sandstone 2px | Sand Light bg | "Recommended" |
| `best` | Terracotta 2px | Sandstone 10% bg | "Premium" |

**Layout:**
- Header: Tier name, badge (if any)
- Price: Large, prominent
- Monthly: Smaller, "from $X/mo"
- Features: Stacked list with labels
- CTA: Button at bottom

**States:**
- Default: As styled above
- Hover: Shadow increases, slight scale (1.02)
- Selected: Checkmark overlay, muted (for confirmation view)

---

### SummaryCard

**Purpose:** Order/quote summary display.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `address` | `string` | Yes | - | Property address |
| `packageName` | `string` | Yes | - | Selected package |
| `total` | `number` | Yes | - | Total price |
| `deposit` | `number` | Yes | - | Deposit amount |
| `balance` | `number` | No | - | Remaining balance |
| `installDate` | `string` | No | - | Scheduled date |
| `expandable` | `boolean` | No | `false` | Can expand for details |
| `expanded` | `boolean` | No | `false` | Expanded state |
| `onToggle` | `() => void` | No | - | Toggle handler |
| `breakdown` | `LineItem[]` | No | - | Detailed breakdown |

**LineItem type:**
```typescript
interface LineItem {
  label: string;
  amount: number;
  type: 'item' | 'subtotal' | 'total';
}
```

**Layout:**
- Compact: Address, package, total, deposit on one card
- Expanded: Full line-item breakdown

---

### QuickActionCard

**Purpose:** Portal action shortcuts (View Docs, Reschedule, Pay, Help).

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `icon` | `ReactNode` | Yes | - | Action icon |
| `label` | `string` | Yes | - | Action label |
| `href` | `string` | Yes | - | Navigation target |
| `badge` | `string` | No | - | Badge text |
| `disabled` | `boolean` | No | `false` | Disabled state |

**Styling:**
- Size: 80x80px min
- Layout: Icon (32px) above label (14px)
- Background: White
- Border: 1px Sand
- Hover: Sand Light bg
- Badge: Top-right corner

---

## Data Display Components

### StatusTimeline

**Purpose:** Show project progress in portal (F13).

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `steps` | `TimelineStep[]` | Yes | - | Timeline steps |
| `orientation` | `'vertical' \| 'horizontal'` | No | `'vertical'` | Layout |

**TimelineStep type:**
```typescript
interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  date?: string;
  status: 'completed' | 'current' | 'upcoming';
}
```

**Default Steps:**
1. Contract Signed
2. Materials Ordered
3. Crew Scheduled
4. Installation Day
5. Project Complete

**Styling:**
- Completed: Sandstone circle with checkmark
- Current: Sandstone circle, pulsing indicator
- Upcoming: Stone outline circle
- Connector: 2px line between nodes
- Date/description: Body Small, Stone color

---

### PriceBreakdown

**Purpose:** Itemized pricing display (F20).

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `BreakdownItem[]` | Yes | - | Line items |
| `showSubtotals` | `boolean` | No | `false` | Show section subtotals |

**BreakdownItem type:**
```typescript
interface BreakdownItem {
  category?: string; // Group header
  label: string;
  amount: number;
  quantity?: number;
  unit?: string;
  isTotal?: boolean;
}
```

**Layout:**
- Category headers: Bold, full-width
- Line items: Label left, amount right
- Quantity/unit: Smaller, below label
- Total: Separator line above, bold

---

### DocumentList

**Purpose:** List documents in portal (F12).

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `documents` | `Document[]` | Yes | - | Document list |
| `onView` | `(id: string) => void` | Yes | - | View handler |
| `onDownload` | `(id: string) => void` | Yes | - | Download handler |

**Document type:**
```typescript
interface Document {
  id: string;
  name: string;
  type: 'quote' | 'contract' | 'receipt' | 'warranty';
  date: string;
  size?: string;
}
```

**Styling:**
- Row: 56px height, hover Sand Light
- Icon: Document type icon left
- Actions: View/Download buttons right

---

## Feature Components

### Feature: Quote Flow

#### ROIValueDisplay

**Purpose:** Show ROI and value messaging to reinforce purchase decision (F16).

**Location:** `src/components/features/quote/ROIValueDisplay/`

**Composition:** Uses Card, Badge

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'sidebar' \| 'inline' \| 'compact'` | No | `'sidebar'` | Display style |
| `showSource` | `boolean` | No | `true` | Show data source citation |

**Value Propositions Displayed:**
1. "68% ROI at Resale" - Average return on investment
2. "Sell 12 Days Faster" - Speed to sale benefit
3. "Premium Savings" - Potential insurance premium reduction

**Styling:**
- Sidebar: Vertical stack, subtle background
- Inline: Horizontal cards on desktop, stack on mobile
- Compact: Single-line value highlights

---

#### MotivationCapture

**Purpose:** Capture customer's replacement motivation (F17).

**Location:** `src/components/features/quote/MotivationCapture/`

**Composition:** Uses RadioCardGroup

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onSelect` | `(motivation: ReplacementMotivation) => void` | Yes | - | Selection handler |
| `onSkip` | `() => void` | No | - | Skip handler |

**ReplacementMotivation type:**
```typescript
type ReplacementMotivation =
  | 'pre_sale_prep'
  | 'roof_age'
  | 'carrier_requirement'
  | 'curb_appeal'
  | 'energy_efficiency'
  | 'other';
```

**Options:**
1. "Preparing to sell my home"
2. "Roof is aging/end of life"
3. "Insurance carrier requiring replacement"
4. "Improving curb appeal"
5. "Energy efficiency upgrade"

---

#### PremiumMaterialShowcase

**Purpose:** Highlight premium material options with visual appeal (F18).

**Location:** `src/components/features/quote/PremiumMaterialShowcase/`

**Composition:** Uses Card, Modal

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `materials` | `PremiumMaterial[]` | Yes | - | Available materials |
| `onSelect` | `(materialId: string) => void` | No | - | Selection handler |
| `variant` | `'grid' \| 'carousel'` | No | `'grid'` | Display mode |

**PremiumMaterial type:**
```typescript
interface PremiumMaterial {
  id: string;
  name: string;
  manufacturer: string;
  imageUrl: string;
  tier: 'better' | 'best';
  highlights: string[];
}
```

---

#### PackageComparison

**Purpose:** Side-by-side comparison of all tiers (F04).

**Location:** `src/components/features/quote/PackageComparison/`

**Composition:** Uses PackageTierCard (x3), CollapsiblePanel

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `packages` | `PackageData[]` | Yes | - | Three packages |
| `selectedTier` | `'good' \| 'better' \| 'best' \| null` | Yes | - | Current selection |
| `onSelect` | `(tier: string) => void` | Yes | - | Selection handler |
| `includedFeatures` | `string[]` | Yes | - | Shared features list |

**Layout:**
- Mobile: Stacked cards, swipeable
- Desktop: Three columns, equal height

---

### Feature: Checkout

#### OrderSummary

**Purpose:** Checkout sidebar/collapsible summary.

**Location:** `src/components/features/checkout/OrderSummary/`

**Composition:** Uses SummaryCard, CollapsiblePanel (mobile)

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `quote` | `QuoteData` | Yes | - | Quote data |
| `variant` | `'sidebar' \| 'collapsible'` | No | `'sidebar'` | Display mode |

**Responsive:**
- Mobile (< 768px): Collapsible above sticky footer
- Desktop (>= 1024px): Fixed sidebar, 320px width

---

#### PaymentForm

**Purpose:** Stripe payment input (F09, F15).

**Location:** `src/components/features/checkout/PaymentForm/`

**Composition:** Uses Stripe Elements, Button

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `amount` | `number` | Yes | - | Amount in cents |
| `onSuccess` | `(paymentIntent: PaymentIntent) => void` | Yes | - | Success handler |
| `onError` | `(error: StripeError) => void` | Yes | - | Error handler |
| `paymentMethods` | `('card' \| 'us_bank_account')[]` | No | `['card']` | Enabled methods |

**States:**
- Idle: Form visible
- Processing: Button loading, form disabled
- Success: Callback, form hidden
- Error: Error message, retry enabled

**Security:**
- PCI-compliant via Stripe Elements
- No card data touches our servers
- Lock icon + "Secured by Stripe" badge

---

#### ContractViewer

**Purpose:** Display and sign contract (F08).

**Location:** `src/components/features/checkout/ContractViewer/`

**Composition:** Uses Modal, TextInput

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `contractUrl` | `string` | Yes | - | Contract PDF URL |
| `contractSummary` | `ContractSummary` | Yes | - | Key terms |
| `onSign` | `(signature: string) => void` | Yes | - | Sign handler |

**ContractSummary type:**
```typescript
interface ContractSummary {
  address: string;
  packageName: string;
  total: number;
  deposit: number;
  installDate: string;
  warranty: string;
  keyTerms: string[];
}
```

**Layout:**
- Summary card with key info
- "View Full Contract" opens PDF modal
- Signature input: Type full legal name
- Consent checkbox
- Sign CTA

---

### Feature: Portal

#### ProjectDashboard

**Purpose:** Main portal view (F11, F12, F13).

**Location:** `src/components/features/portal/ProjectDashboard/`

**Composition:** Uses StatusTimeline, QuickActionCard, SummaryCard

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `project` | `ProjectData` | Yes | - | Project data |

**ProjectData type:**
```typescript
interface ProjectData {
  id: string;
  address: string;
  status: ProjectStatus;
  timeline: TimelineStep[];
  quote: QuoteData;
  documents: Document[];
  balance: number;
  installDate: string;
}
```

**Layout:**
- Header: Address
- Status timeline
- Quick action grid (2x2)
- Quote summary

---

#### RescheduleForm

**Purpose:** Self-service rescheduling (F14).

**Location:** `src/components/features/portal/RescheduleForm/`

**Composition:** Uses DatePicker, RadioCardGroup, Button

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentDate` | `Date` | Yes | - | Current appointment |
| `availableDates` | `Date[]` | Yes | - | Available slots |
| `onReschedule` | `(date: Date, timeSlot: string) => void` | Yes | - | Submit handler |
| `onCancel` | `() => void` | Yes | - | Cancel handler |
| `rescheduleCount` | `number` | Yes | - | Previous reschedules |

**Business Rules:**
- < 48 hours: Show "Please call" message
- 2+ reschedules: Show "Please call" message
- Otherwise: Allow self-service

---

## Component Documentation Standards

### Code Documentation Format

**Format:** TSDoc (TypeScript documentation comments)

**Required Documentation:**
```typescript
/**
 * Button component for triggering actions.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleSubmit}>
 *   Get My Free Estimate
 * </Button>
 * ```
 *
 * @param props - Component props
 * @param props.variant - Visual style variant
 * @param props.size - Button size
 * @param props.disabled - Whether button is disabled
 * @param props.loading - Whether to show loading state
 * @param props.children - Button content
 */
export function Button({ variant = 'primary', ...props }: ButtonProps) {
  // implementation
}
```

### Prop Documentation Requirements

Every prop must have:
- [x] Type annotation in interface
- [x] Description in TSDoc
- [x] Default value documented (if optional)
- [x] Validation constraints noted (min/max, patterns)

### Component Documentation

**Tool:** Storybook 7+

**Story Requirements:**
- [x] Default state story
- [x] All variant stories
- [x] Interactive controls (args)
- [x] Accessibility annotations
- [x] Responsive viewport stories

---

## Component Reusability Guidelines

### When to Create a New Component

Create a new component when:
- [x] **Used 3+ times:** Same UI pattern appears in multiple places
- [x] **Standalone concept:** Has clear, single responsibility
- [x] **Complex logic:** Contains significant state or effects
- [x] **Testing boundary:** Needs isolated testing

Do NOT create a new component when:
- [x] Only used once and simple
- [x] Would require many configuration props for different uses
- [x] Just to reduce file length

### Component API Design Principles

1. **Prop Naming:**
   - Use camelCase for all props
   - Boolean props: `isX`, `hasX`, `disabled`, `loading`
   - Event handlers: `onX` (onClick, onChange, onSubmit)
   - Render props: `renderX` (renderHeader, renderItem)

2. **Composition over Configuration:**
   - Prefer children/slots over many configuration props
   - Use compound components for complex widgets

3. **Sensible Defaults:**
   - Every optional prop has a sensible default
   - Components work with minimal props

4. **Escape Hatches:**
   - Allow className override for customization
   - Spread remaining props to root element

### Accessibility Requirements

All interactive components must:
- [x] Be keyboard accessible (focusable, operable)
- [x] Have appropriate ARIA attributes
- [x] Maintain visible focus indicators (Sandstone outline)
- [x] Support screen reader announcements
- [x] Meet color contrast (4.5:1 for text, 3:1 for UI)
- [x] Have minimum 44x44px touch targets

---

## Component State Patterns

### Local State

**Use local state for:**
- UI-only state (open/closed, hover, focus)
- Form input values before submission
- Transient state that doesn't affect other components

**Example:**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [inputValue, setInputValue] = useState('');
```

### Shared State

**Props:** Pass through 1-2 levels max
- Good for: Simple parent-child relationships

**Context:** Theme, auth, quote session
- Good for: Deeply nested shared state
- Created contexts: `ThemeContext`, `QuoteSessionContext`, `AuthContext`

**React Query:** Server state (quotes, projects, documents)
- Good for: Data fetching, caching, sync

### Form State

**React Hook Form + Zod:**
```typescript
const schema = z.object({
  address: z.string().min(1, 'Address is required'),
  email: z.string().email('Invalid email'),
});

const { register, handleSubmit, formState } = useForm({
  resolver: zodResolver(schema),
});
```

### Derived State

- Compute in render when cheap
- Use `useMemo` when expensive
- Never store derived state in useState

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [05-ui-ux-design.md](./05-ui-ux-design.md) | Visual designs these components implement |
| [BRAND-ASSETS.md](./BRAND-ASSETS.md) | Design tokens components consume |
| [16-design-tokens.md](./16-design-tokens.md) | Full token system |
| [17-code-patterns.md](./17-code-patterns.md) | Implementation patterns |
| [15-file-architecture.md](./15-file-architecture.md) | Where component files live |
| [13-accessibility.md](./13-accessibility.md) | Accessibility requirements |
| [04-feature-breakdown.md](./04-feature-breakdown.md) | Features components implement |

---

## Quality Checklist

Before marking this document complete:

- [x] Component hierarchy covers all screens from doc 05
- [x] All shared components have complete prop documentation
- [x] All feature components are linked to features in doc 04
- [x] Reusability guidelines are clear and actionable
- [x] State patterns are documented with examples
- [x] Accessibility requirements are defined
- [x] Related Documents links are bidirectional

**Status: COMPLETE** - Ready for Phase 2A continuation (13-accessibility.md)
