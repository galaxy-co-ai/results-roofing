# Designs Directory

This directory contains all visual design files created with pencil.dev for the Results Roofing project.

## File Structure

```
designs/
├── components/          # Component library designs
│   ├── ui/              # Base UI components (Button, Input, Card, etc.)
│   ├── features/        # Feature-specific components
│   │   └── package-tier-cards.pen  # Package tier card designs
│   └── layout/          # Layout components (Header, Footer, etc.)
├── screens/             # Full screen designs
│   ├── quote-flow/      # Quote flow screens (Address → Estimate → Packages → Checkout)
│   └── portal/          # Customer portal screens
├── system/              # Design system
│   └── tokens.pen       # Visual design tokens reference
└── flows/               # User flow diagrams
    └── quote-journey.pen # Complete quote-to-contract flow visualization
```

## Design File Organization

Design files mirror the project's component structure (`src/components/`) and route structure (`src/app/`) to maintain consistency and easy navigation.

### Naming Conventions

- **Component files**: `kebab-case.pen` (e.g., `package-tier-cards.pen`)
- **Screen files**: `kebab-case.pen` (e.g., `estimate-page.pen`)
- **Flow files**: `kebab-case.pen` (e.g., `quote-journey.pen`)

### Design Tokens

All designs use the project's design tokens from `src/styles/tokens/`:
- Colors: `--rr-color-*` (e.g., `#C4A77D` for sandstone)
- Spacing: `--rr-space-*` (4px base grid)
- Typography: `--rr-font-*` (Inter font family)

## Current Designs

### ✅ Component Library - UI Components

#### Package Tier Cards
**Location**: `designs/components/features/package-tier-cards.pen`

Visual design for the three-tier package comparison (Good/Better/Best) used in the quote flow. Includes:
- Desktop layout (3 cards side-by-side)
- All tier details (pricing, features, materials)
- "Most Popular" badge on Better tier
- Deposit information
- Select buttons with proper hierarchy

**Status**: Complete

#### Button Component Library
**Location**: `designs/components/ui/button.pen`

Comprehensive button component library with:
- **Variants**: Primary, Secondary, Ghost, Danger (all as reusable components)
- **Sizes**: Small (36px), Medium (44px), Large (52px)
- **States**: Default, Hover, Disabled, Loading
- **With Icons**: Left icon, right icon, full-width examples
- All variants follow design tokens exactly

**Status**: Complete

#### TextInput Component Library
**Location**: `designs/components/ui/text-input.pen`

Complete text input component showcase:
- **States**: Default, Focus, Error, Disabled
- **With Icons**: Left icon (search), Right icon (password visibility)
- **Input Types**: Email, Phone, Search (with clear button)
- Error messages and helper text examples
- All follow 48px height, 8px radius, proper spacing

**Status**: Complete

#### Card Component Library
**Location**: `designs/components/ui/card.pen`

Card component variants:
- **Basic Card**: Standard card with shadow
- **Elevated Card**: Stronger shadow for emphasis
- **Outlined Card**: Border-focused variant
- **Card with Actions**: Includes header, content, and footer with buttons
- All cards use proper padding (24px), radius (8px), and shadows

**Status**: Complete

#### Progress Indicator Component
**Location**: `designs/components/navigation/progress-indicator.pen`

Progress indicator for quote flow:
- **Dots Variant (Mobile)**: 5 dots showing completed/current/pending states
- **Segments Variant (Desktop)**: Horizontal bar with 5 segments
- Shows Address → Estimate → Package → Schedule → Complete flow
- Uses sandstone color for active/completed, sand for pending

**Status**: Complete

#### Badge Component Library
**Location**: `designs/components/ui/badge.pen`

Badge variants for status indicators:
- **Default**: Neutral badge
- **Success**: Green badge
- **Warning**: Yellow badge
- **Error**: Red badge
- **Info**: Blue badge
- **Popular**: Sandstone badge with star icon (used on package cards)

**Status**: Complete

#### Checkbox Component Library
**Location**: `designs/components/ui/checkbox.pen`

Checkbox component states:
- **Unchecked**: Default state
- **Checked**: Sandstone background with white checkmark
- **Disabled**: 50% opacity
- **With Description**: Checkbox with helper text below
- All follow 20x20px box, 4px radius, proper spacing

**Status**: Complete

#### Select Component Library
**Location**: `designs/components/ui/select.pen`

Select dropdown component showcase:
- **States**: Default, Selected, Error, Disabled
- **Dropdown Menu**: Open state with options, selected state highlighting, disabled options
- All follow 48px height, 8px radius, proper chevron icons

**Status**: Complete

#### Textarea Component Library
**Location**: `designs/components/ui/textarea.pen`

Textarea component (multi-line input):
- **States**: Default, Filled, Error
- **With Character Count**: Shows remaining characters (e.g., "67 / 500")
- All follow proper min-height (96px), padding, and styling

**Status**: Complete

#### RadioCardGroup Component Library
**Location**: `designs/components/ui/radio-card-group.pen`

Radio card selection component:
- **Vertical Layout**: Cards stacked with icons, labels, descriptions
- **Horizontal Layout**: Cards side-by-side (for time slots, etc.)
- **States**: Unselected (white), Selected (sandstone border, sand light bg)
- All follow 56px min-height, 8px radius, proper spacing

**Status**: Complete

#### IconButton Component Library
**Location**: `designs/components/ui/icon-button.pen`

Icon-only button component:
- **Sizes**: Small (32px), Medium (40px), Large (48px)
- **Variants**: Default, Ghost, Primary, Danger
- **States**: Default, Hover, Disabled
- All follow proper touch targets and accessibility

**Status**: Complete

### ✅ Quote Flow Screens

#### Step 1: Address Entry (Landing Page)
**Location**: `designs/screens/quote-flow/step-01-address-entry.pen` (Desktop)
**Location**: `designs/screens/quote-flow/step-01-address-entry-mobile.pen` (Mobile)

Desktop landing page design:
- Header with logo, rating, phone
- Hero section with title and subtitle
- Address input card with CTA button
- Value props (no credit card, instant results)
- Trust badges (BBB A+, GAF, Owens Corning)
- Footer with licensing info

Mobile design:
- Simplified header with logo
- Stacked layout for address card
- Vertical trust badges
- Mobile-optimized spacing and typography

**Status**: Complete

#### Step 2: Preliminary Estimate
**Location**: `designs/screens/quote-flow/step-02-preliminary-estimate.pen` (Desktop)
**Location**: `designs/screens/quote-flow/step-02-preliminary-estimate-mobile.pen` (Mobile)

Desktop design:
- Three-tier package cards side-by-side
- "Better" tier highlighted with recommended badge
- Price ranges and monthly payment estimates
- "Get Exact Price" CTA

Mobile design:
- Stacked package cards
- Sticky footer with CTA
- Mobile-optimized card sizing

**Status**: Complete

#### Step 3: Package Comparison
**Location**: `designs/screens/quote-flow/step-03-package-comparison.pen`

Detailed side-by-side comparison:
- Three package cards with full details
- "Included in all packages" section
- Action buttons (View Breakdown, Share Quote, Download PDF)
- Better tier emphasized with border and badge

**Status**: Complete

#### Step 4: Package Selection Summary
**Location**: "designs/screens/quote-flow/step-04-package-selection-summary.pen"

Confirmation screen before checkout:
- Selected package summary card
- Total vs. deposit breakdown
- "What's Next" preview steps
- Phone number for support
- Proceed to checkout CTA

**Status**: Complete

#### Step 5: Financing Check
**Location**: `designs/screens/quote-flow/step-05-financing-check.pen`

Payment options selection:
- Pay in full option
- Finance option with Wisetack branding
- "No impact to credit score" messaging
- Skip option for later

**Status**: Complete

#### Step 6: Schedule Appointment
**Location**: `designs/screens/quote-flow/step-06-schedule-appointment.pen`

Installation scheduling:
- Calendar interface
- Time slot selection (Morning, Afternoon, Evening)
- Selected date display
- Sticky footer with confirmation

**Status**: Complete

#### Step 7: Sign Contract
**Location**: `designs/screens/quote-flow/step-07-sign-contract.pen`

Contract review and signature:
- Contract summary card
- Key terms highlighted
- Typed signature input
- View full contract link
- Sign & continue CTA

**Status**: Complete

#### Step 8: Payment
**Location**: `designs/screens/quote-flow/step-08-payment.pen`

Deposit payment screen:
- Deposit amount prominently displayed
- Payment method selection (Card/ACH)
- Payment form with card details
- Stripe security badge
- Refund policy link

**Status**: Complete

#### Step 9: Confirmation
**Location**: `designs/screens/quote-flow/step-09-confirmation.pen`

Success confirmation screen:
- Success icon and celebration message
- Confirmation number
- Project summary card
- "What Happens Next" steps
- Portal and home navigation buttons

**Status**: Complete

### ✅ Feedback Components

#### Toast Component Library
**Location**: `designs/components/feedback/toast.pen`

Toast notification variants:
- **Success**: Green border, check icon
- **Error**: Red border, alert icon
- **Warning**: Yellow border, warning icon
- **Info**: Blue border, info icon
- All include title, description, and proper shadows

**Status**: Complete

#### Modal Component Library
**Location**: `designs/components/feedback/modal.pen`

Modal dialog variants:
- **Small Modal**: Confirmation dialogs
- **Medium Modal**: Forms and content (e.g., Share Quote)
- **With Backdrop**: Semi-transparent overlay
- All include header, content, footer with actions

**Status**: Complete

#### Skeleton Component Library
**Location**: `designs/components/feedback/skeleton.pen`

Loading skeleton variants:
- **Text Skeleton**: Multiple lines with varying widths
- **Heading Skeleton**: Large placeholder
- **Button Skeleton**: Button-shaped placeholder
- **Card Skeleton**: Complete card structure with title, lines, button

**Status**: Complete

#### Spinner Component Library
**Location**: `designs/components/feedback/spinner.pen`

Loading spinner variants:
- **Sizes**: Small (16px), Medium (24px), Large (40px), XL (56px)
- **In Context**: Button spinner, page spinner with text
- Uses Lucide loader icon

**Status**: Complete

### ✅ Design System

#### Design Tokens Style Guide
**Location**: `designs/system/design-tokens-style-guide.pen`

Complete visual reference for design tokens:
- **Color Palette**: Brand colors (Sandstone, Terracotta, Charcoal) and neutral palette (Cream, Sand Light, Sand, Stone, Slate)
- **Typography Scale**: Heading 1-3, Body, Small with sizes and weights
- **Spacing Scale**: Visual representation of 4px base grid (4px, 8px, 16px, 24px, 32px)

**Status**: Complete

### ✅ Portal Screens

#### Portal Dashboard
**Location**: `designs/screens/portal/dashboard.pen`

Customer portal dashboard:
- Sidebar navigation (Dashboard, Documents, Schedule, Payments, Get Help)
- Welcome message with user name
- Project status card with progress bar
- Timeline showing contract signed, deposit paid, installation scheduled
- Quick action cards (View Documents, Manage Schedule, Make Payment)

**Status**: Complete

#### Portal Documents
**Location**: `designs/screens/portal/documents.pen`

Document management screen:
- Sidebar navigation with Documents active
- List of documents (Contract, Receipts, Warranty)
- Document metadata (date, size)
- Download actions
- Pending documents shown as disabled

**Status**: Complete

#### Portal Schedule
**Location**: `designs/screens/portal/schedule.pen`

Schedule management screen:
- Sidebar navigation with Schedule active
- Installation appointment card
- Date, time window, and address display
- Reschedule button

**Status**: Complete

#### Portal Payments
**Location**: `designs/screens/portal/payments.pen`

Payment management screen:
- Sidebar navigation with Payments active
- Payment summary card (Total, Deposit Paid, Balance Due)
- Payment history list
- Payment details (date, method, amount)

**Status**: Complete

## Usage

These design files serve as:
1. **Visual reference** for developers implementing components
2. **Design validation** to ensure specs match visual intent
3. **Stakeholder communication** for reviews and approvals
4. **Design-to-code handoff** documentation

## Related Documentation

- Component specs: `docs/planning/06-component-specs.md`
- UI/UX design: `docs/planning/05-ui-ux-design.md`
- Design tokens: `docs/planning/16-design-tokens.md`
- File architecture: `docs/planning/15-file-architecture.md`
