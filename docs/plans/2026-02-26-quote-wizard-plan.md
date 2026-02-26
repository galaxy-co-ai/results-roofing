# In-Portal Quote Wizard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Embed the full quote wizard inline in the portal's My Project page so customers never leave their dashboard to get a quote.

**Architecture:** A `<QuoteWizard />` component with local `useState` for step management renders below the Checklist in Phase1Content. Five steps (Address → Confirm → Package → Schedule → Contact) call existing API routes. On completion, a brief success moment plays before `usePortalPhase` re-evaluates to Phase 2. No backend changes — all existing endpoints.

**Tech Stack:** Next.js 14 (App Router), React Query, CSS Modules, existing design tokens (`--rr-color-*`), Mapbox Geocoding + Static Maps, existing `/api/quotes/*` routes.

**Design doc:** `docs/plans/2026-02-26-quote-wizard-design.md`

---

## Task 1: Extend ChecklistStep to Support onClick CTAs

The Checklist currently only supports `href` links. The wizard needs to trigger an onClick callback instead.

**Files:**
- Modify: `src/components/features/portal/Checklist/ChecklistStep.tsx`
- Modify: `src/components/features/portal/Checklist/Checklist.tsx`

**Step 1: Update ChecklistStep props to accept onClickCta**

In `src/components/features/portal/Checklist/ChecklistStep.tsx`, add `onClickCta` to the props interface and update the active CTA render to support both `href` and `onClick`:

```tsx
// ChecklistStep.tsx — full file

'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import styles from './Checklist.module.css';

interface ChecklistStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'locked';
  ctaLabel?: string;
  ctaHref?: string;
  onClickCta?: () => void;
  dependencyText?: string;
}

export function ChecklistStep({
  stepNumber,
  title,
  description,
  status,
  ctaLabel,
  ctaHref,
  onClickCta,
  dependencyText,
}: ChecklistStepProps) {
  if (status === 'completed') {
    return (
      <div className={styles.stepCompleted}>
        <div className={styles.checkIcon}>
          <Check size={14} />
        </div>
        <span className={styles.stepCompletedTitle}>{title}</span>
        <span className={styles.completedLabel}>Completed</span>
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className={styles.stepLocked}>
        <div className={styles.numberBadgeLocked}>{stepNumber}</div>
        <span className={styles.stepLockedTitle}>{title}</span>
        {dependencyText && (
          <span className={styles.dependencyText}>{dependencyText}</span>
        )}
      </div>
    );
  }

  // Active
  return (
    <div className={styles.stepActive}>
      <div className={styles.stepActiveContent}>
        <div className={styles.numberBadgeActive}>{stepNumber}</div>
        <div className={styles.stepActiveText}>
          <span className={styles.stepActiveTitle}>{title}</span>
          {description && (
            <span className={styles.stepActiveDescription}>{description}</span>
          )}
        </div>
      </div>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className={styles.stepActiveCta}>
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && !ctaHref && onClickCta && (
        <button type="button" onClick={onClickCta} className={styles.stepActiveCta}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export type { ChecklistStepProps };
```

**Step 2: Update Checklist props to pass onClickCta**

In `src/components/features/portal/Checklist/Checklist.tsx`, update `ChecklistProps` to accept onClick callbacks alongside href:

```tsx
// Checklist.tsx — full file

'use client';

import { ChecklistStep } from './ChecklistStep';
import styles from './Checklist.module.css';

const CHECKLIST_STEPS = [
  { title: 'Get Your Quote', description: 'Enter your address and select your roofing package' },
  { title: 'Sign Your Contract', description: 'Review your contract and sign electronically' },
  { title: 'Book Your Consultation', description: 'Schedule a consultation with our team' },
  { title: 'Submit Your Deposit', description: 'Secure your installation date with a deposit' },
  { title: 'Installation Scheduled', description: 'Your installation date is being confirmed' },
];

interface StepCta {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface ChecklistProps {
  activeStep: number; // 1-5
  stepCtas?: Record<number, StepCta>;
}

export function Checklist({ activeStep, stepCtas = {} }: ChecklistProps) {
  const progressPercent = Math.max(20, ((activeStep - 1) / (CHECKLIST_STEPS.length - 1)) * 100);

  return (
    <div className={styles.checklist}>
      <div className={styles.progressBarTrack}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className={styles.steps}>
        {CHECKLIST_STEPS.map((step, index) => {
          const stepNum = index + 1;
          const status = stepNum < activeStep
            ? 'completed'
            : stepNum === activeStep
            ? 'active'
            : 'locked';

          const cta = stepCtas[stepNum];

          return (
            <ChecklistStep
              key={stepNum}
              stepNumber={stepNum}
              title={step.title}
              description={step.description}
              status={status}
              ctaLabel={cta?.label}
              ctaHref={cta?.href}
              onClickCta={cta?.onClick}
              dependencyText={status === 'locked' ? `Complete step ${activeStep} first` : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: Zero errors. All existing usages of `Checklist` still work because `href` is still supported and `onClick` is optional.

**Step 4: Commit**

```bash
git add src/components/features/portal/Checklist/ChecklistStep.tsx src/components/features/portal/Checklist/Checklist.tsx
git commit -m "feat(portal): add onClick CTA support to Checklist component"
```

---

## Task 2: QuoteWizard Shell + WizardState

Create the orchestrator component with step state management and the CSS module. No steps implemented yet — just the shell that renders a placeholder per step.

**Files:**
- Create: `src/components/features/portal/QuoteWizard/QuoteWizard.tsx`
- Create: `src/components/features/portal/QuoteWizard/QuoteWizard.module.css`

**Step 1: Create the QuoteWizard component**

```tsx
// src/components/features/portal/QuoteWizard/QuoteWizard.tsx

'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './QuoteWizard.module.css';

type WizardStep = 'ADDRESS' | 'CONFIRM' | 'PACKAGE' | 'SCHEDULE' | 'CONTACT' | 'COMPLETE';

interface WizardState {
  step: WizardStep;
  quoteId: string | null;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
    placeId: string;
    formattedAddress: string;
  } | null;
  estimate: {
    sqft: number;
    sqftRange: { min: number; max: number };
    tiers: Array<{ tier: string; minPrice: number; maxPrice: number }>;
  } | null;
}

const INITIAL_STATE: WizardState = {
  step: 'ADDRESS',
  quoteId: null,
  address: null,
  estimate: null,
};

const STEP_TITLES: Record<WizardStep, { title: string; description: string }> = {
  ADDRESS: { title: 'Enter Your Address', description: 'We\'ll use satellite imagery to measure your roof' },
  CONFIRM: { title: 'Confirm Your Property', description: 'Make sure we have the right location' },
  PACKAGE: { title: 'Choose Your Package', description: 'Select the roofing package that fits your needs' },
  SCHEDULE: { title: 'Pick Your Date', description: 'Choose your preferred installation date' },
  CONTACT: { title: 'Your Contact Info', description: 'We\'ll send your quote details here' },
  COMPLETE: { title: '', description: '' },
};

interface QuoteWizardProps {
  onComplete: () => void;
}

export function QuoteWizard({ onComplete }: QuoteWizardProps) {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const queryClient = useQueryClient();

  const goTo = useCallback((step: WizardStep, updates?: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates, step }));
  }, []);

  const goBack = useCallback(() => {
    const backMap: Partial<Record<WizardStep, WizardStep>> = {
      CONFIRM: 'ADDRESS',
      PACKAGE: 'CONFIRM',
      SCHEDULE: 'PACKAGE',
      CONTACT: 'SCHEDULE',
    };
    const prev = backMap[state.step];
    if (prev) setState(s => ({ ...s, step: prev }));
  }, [state.step]);

  const handleComplete = useCallback(() => {
    setState(s => ({ ...s, step: 'COMPLETE' }));
    // Brief celebration, then trigger phase re-evaluation
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onComplete();
    }, 1500);
  }, [queryClient, onComplete]);

  const stepMeta = STEP_TITLES[state.step];

  if (state.step === 'COMPLETE') {
    return (
      <div className={styles.wizard}>
        <div className={styles.completionMoment}>
          <div className={styles.completionIcon}>✓</div>
          <h3 className={styles.completionTitle}>Your quote is ready!</h3>
          <p className={styles.completionDescription}>Review your quote details below</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wizard}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{stepMeta.title}</h3>
        <p className={styles.stepDescription}>{stepMeta.description}</p>
      </div>

      <div className={styles.stepContent}>
        {/* Step components will be wired in Tasks 3-7 */}
        {state.step === 'ADDRESS' && <div>AddressStep placeholder</div>}
        {state.step === 'CONFIRM' && <div>ConfirmStep placeholder</div>}
        {state.step === 'PACKAGE' && <div>PackageStep placeholder</div>}
        {state.step === 'SCHEDULE' && <div>ScheduleStep placeholder</div>}
        {state.step === 'CONTACT' && <div>ContactStep placeholder</div>}
      </div>

      {state.step !== 'ADDRESS' && (
        <button type="button" onClick={goBack} className={styles.backLink}>
          ← Back
        </button>
      )}
    </div>
  );
}

export type { WizardState, WizardStep };
```

**Step 2: Create the CSS module**

```css
/* src/components/features/portal/QuoteWizard/QuoteWizard.module.css */

.wizard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: var(--rr-color-bg-secondary);
  border: 1px solid var(--rr-color-border-default);
  border-radius: 6px;
}

.stepHeader {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stepTitle {
  font-size: 18px;
  font-weight: 700;
  color: var(--rr-color-text-primary);
  margin: 0;
}

.stepDescription {
  font-size: 14px;
  color: var(--rr-color-text-secondary);
  margin: 0;
}

.stepContent {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.backLink {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--rr-color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.backLink:focus-visible {
  outline: 2px solid var(--rr-color-focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (hover: hover) {
  .backLink:hover {
    color: var(--rr-color-text-primary);
  }
}

/* Primary action button (shared by all steps) */
.primaryButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  min-height: 44px;
  background: var(--rr-color-blue);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms;
  width: 100%;
}

@media (min-width: 769px) {
  .primaryButton {
    width: auto;
  }
}

.primaryButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primaryButton:focus-visible {
  outline: 2px solid var(--rr-color-focus-ring);
  outline-offset: 2px;
}

@media (hover: hover) {
  .primaryButton:hover:not(:disabled) {
    background: var(--rr-color-blue-light);
  }
}

/* Error message */
.errorMessage {
  font-size: 13px;
  color: var(--rr-color-error);
  margin: 0;
}

/* Completion moment */
.completionMoment {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px;
  animation: fadeIn 300ms ease;
}

.completionIcon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--rr-color-success);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  animation: scaleIn 300ms ease;
}

.completionTitle {
  font-size: 20px;
  font-weight: 700;
  color: var(--rr-color-text-primary);
  margin: 0 0 4px;
}

.completionDescription {
  font-size: 14px;
  color: var(--rr-color-text-secondary);
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Form field shared styles */
.formField {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--rr-color-text-primary);
}

.input {
  padding: 10px 12px;
  min-height: 44px;
  border: 1px solid var(--rr-color-border-default);
  border-radius: 6px;
  font-size: 15px;
  color: var(--rr-color-text-primary);
  background: var(--rr-color-bg-primary);
  transition: border-color 150ms;
}

.input:focus {
  outline: none;
  border-color: var(--rr-color-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input::placeholder {
  color: var(--rr-color-text-tertiary);
}

.fieldError {
  font-size: 13px;
  color: var(--rr-color-error);
}

/* Tier grid for PackageStep */
.tierGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .tierGrid {
    grid-template-columns: 1fr;
  }
}

/* Confirm step map */
.mapContainer {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--rr-color-border-default);
}

.mapImage {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.confirmAddress {
  font-size: 15px;
  font-weight: 600;
  color: var(--rr-color-text-primary);
  margin: 0;
}

.confirmActions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.retryLink {
  background: none;
  border: none;
  color: var(--rr-color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.retryLink:focus-visible {
  outline: 2px solid var(--rr-color-focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (hover: hover) {
  .retryLink:hover {
    color: var(--rr-color-text-primary);
  }
}

/* Schedule step */
.dateRow {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .dateRow {
    flex-direction: column;
  }
}

.timeSlotGroup {
  display: flex;
  gap: 8px;
}

.timeSlot {
  flex: 1;
  padding: 12px;
  min-height: 44px;
  border: 1px solid var(--rr-color-border-default);
  border-radius: 6px;
  background: var(--rr-color-bg-secondary);
  color: var(--rr-color-text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: border-color 150ms, background-color 150ms;
}

.timeSlot:focus-visible {
  outline: 2px solid var(--rr-color-focus-ring);
  outline-offset: 2px;
}

.timeSlotSelected {
  border-color: var(--rr-color-blue);
  background: var(--rr-color-surface-selected);
  color: var(--rr-color-blue);
}

@media (hover: hover) {
  .timeSlot:hover {
    border-color: var(--rr-color-border-strong);
  }
}

/* Contact step */
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .formGrid {
    grid-template-columns: 1fr;
  }
}

.fullWidth {
  grid-column: 1 / -1;
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.checkboxInput {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  flex-shrink: 0;
  accent-color: var(--rr-color-blue);
}

.checkboxLabel {
  font-size: 13px;
  color: var(--rr-color-text-secondary);
  line-height: 1.4;
}
```

**Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 4: Commit**

```bash
git add src/components/features/portal/QuoteWizard/QuoteWizard.tsx src/components/features/portal/QuoteWizard/QuoteWizard.module.css
git commit -m "feat(portal): add QuoteWizard shell with step state management"
```

---

## Task 3: AddressStep

Integrates the existing `AddressAutocomplete` component. On address selection, calls `POST /api/quotes` to create the quote and get the estimate.

**Files:**
- Create: `src/components/features/portal/QuoteWizard/steps/AddressStep.tsx`
- Modify: `src/components/features/portal/QuoteWizard/QuoteWizard.tsx` (wire in)

**Step 1: Create AddressStep component**

```tsx
// src/components/features/portal/QuoteWizard/steps/AddressStep.tsx

'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AddressAutocomplete, type ParsedAddress } from '@/components/features/address/AddressAutocomplete';
import styles from '../QuoteWizard.module.css';

interface AddressStepProps {
  onNext: (data: {
    quoteId: string;
    address: ParsedAddress;
    estimate: {
      sqft: number;
      sqftRange: { min: number; max: number };
      tiers: Array<{ tier: string; minPrice: number; maxPrice: number }>;
    };
  }) => void;
}

export function AddressStep({ onNext }: AddressStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddressSelect(address: ParsedAddress) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streetAddress: address.streetAddress,
          city: address.city,
          state: address.state,
          zip: address.zip,
          lat: address.lat,
          lng: address.lng,
          placeId: address.placeId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create quote');
      }

      const data = await response.json();

      onNext({
        quoteId: data.id,
        address,
        estimate: data.estimate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleServiceAreaError(state: string) {
    setError(`We currently serve TX, GA, NC, AZ, and OK. ${state} is not yet in our service area.`);
  }

  return (
    <div className={styles.stepContent}>
      <AddressAutocomplete
        onAddressSelect={handleAddressSelect}
        onServiceAreaError={handleServiceAreaError}
        disabled={isSubmitting}
      />
      {isSubmitting && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Loader2 size={16} className="animate-spin" />
          <span style={{ fontSize: 14, color: 'var(--rr-color-text-secondary)' }}>
            Analyzing your property...
          </span>
        </div>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
```

**Step 2: Wire AddressStep into QuoteWizard**

In `QuoteWizard.tsx`, replace the ADDRESS placeholder:

```tsx
// Add import at top:
import { AddressStep } from './steps/AddressStep';

// Replace the ADDRESS placeholder in the stepContent div:
{state.step === 'ADDRESS' && (
  <AddressStep
    onNext={({ quoteId, address, estimate }) => {
      goTo('CONFIRM', { quoteId, address, estimate });
    }}
  />
)}
```

**Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 4: Commit**

```bash
git add src/components/features/portal/QuoteWizard/steps/AddressStep.tsx src/components/features/portal/QuoteWizard/QuoteWizard.tsx
git commit -m "feat(portal): add AddressStep to quote wizard"
```

---

## Task 4: ConfirmStep

Shows the map thumbnail and address confirmation. No API call — purely UI.

**Files:**
- Create: `src/components/features/portal/QuoteWizard/steps/ConfirmStep.tsx`
- Modify: `src/components/features/portal/QuoteWizard/QuoteWizard.tsx` (wire in)

**Step 1: Create ConfirmStep component**

Uses Mapbox Static Maps API (same pattern as existing `PropertyConfirm` at `src/components/features/quote/stages/Stage1/PropertyConfirm.tsx`).

```tsx
// src/components/features/portal/QuoteWizard/steps/ConfirmStep.tsx

'use client';

import { MapPin } from 'lucide-react';
import styles from '../QuoteWizard.module.css';

interface ConfirmStepProps {
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
    formattedAddress: string;
  };
  onConfirm: () => void;
  onRetry: () => void;
}

export function ConfirmStep({ address, onConfirm, onRetry }: ConfirmStepProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const satelliteUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${address.lng},${address.lat},18,0/600x400@2x?access_token=${mapboxToken}`
    : null;

  return (
    <div className={styles.stepContent}>
      {satelliteUrl && (
        <div className={styles.mapContainer}>
          <img
            src={satelliteUrl}
            alt={`Satellite view of ${address.formattedAddress}`}
            className={styles.mapImage}
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MapPin size={18} style={{ color: 'var(--rr-color-blue)', flexShrink: 0 }} />
        <p className={styles.confirmAddress}>
          {address.streetAddress}, {address.city}, {address.state} {address.zip}
        </p>
      </div>

      <div className={styles.confirmActions}>
        <button type="button" onClick={onConfirm} className={styles.primaryButton}>
          Yes, that&apos;s my property
        </button>
        <button type="button" onClick={onRetry} className={styles.retryLink}>
          No, try again
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Wire ConfirmStep into QuoteWizard**

In `QuoteWizard.tsx`:

```tsx
// Add import:
import { ConfirmStep } from './steps/ConfirmStep';

// Replace CONFIRM placeholder:
{state.step === 'CONFIRM' && state.address && (
  <ConfirmStep
    address={state.address}
    onConfirm={() => goTo('PACKAGE')}
    onRetry={() => goTo('ADDRESS')}
  />
)}
```

**Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 4: Commit**

```bash
git add src/components/features/portal/QuoteWizard/steps/ConfirmStep.tsx src/components/features/portal/QuoteWizard/QuoteWizard.tsx
git commit -m "feat(portal): add ConfirmStep with satellite map preview"
```

---

## Task 5: PackageStep

Three tier cards using the existing `PackageTierCard` component. Fetches pricing tiers via `usePricingTiers`. Polls for measurement completion to update prices.

**Files:**
- Create: `src/components/features/portal/QuoteWizard/steps/PackageStep.tsx`
- Modify: `src/components/features/portal/QuoteWizard/QuoteWizard.tsx` (wire in)

**Step 1: Create PackageStep component**

```tsx
// src/components/features/portal/QuoteWizard/steps/PackageStep.tsx

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { PackageTierCard } from '@/components/features/quote/PackageTierCard/PackageTierCard';
import { usePricingTiers, calculateTierPrice, getTierDisplayName } from '@/hooks/usePricingTiers';
import type { PackageTier } from '@/lib/constants';
import styles from '../QuoteWizard.module.css';

interface PackageStepProps {
  quoteId: string;
  estimate: {
    sqft: number;
    sqftRange: { min: number; max: number };
    tiers: Array<{ tier: string; minPrice: number; maxPrice: number }>;
  } | null;
  onNext: () => void;
}

export function PackageStep({ quoteId, estimate, onNext }: PackageStepProps) {
  const [selectedTier, setSelectedTier] = useState<PackageTier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: pricingTiers, isLoading: tiersLoading } = usePricingTiers();

  // Poll for measurement completion (updates quote with firm sqft)
  const { data: quoteData } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: async () => {
      const res = await fetch(`/api/quotes?id=${quoteId}`);
      if (!res.ok) throw new Error('Failed to fetch quote');
      return res.json();
    },
    refetchInterval: (query) => {
      // Stop polling once measured
      if (query.state.data?.status !== 'preliminary') return false;
      return 5000;
    },
  });

  const hasMeasurement = quoteData?.status !== 'preliminary' && quoteData?.sqftTotal;

  async function handleSelect(tier: PackageTier) {
    setSelectedTier(tier);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/select-tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to select package');
      }

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  if (tiersLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--rr-color-text-tertiary)' }} />
      </div>
    );
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.tierGrid}>
        {pricingTiers?.map((tier) => {
          // Use firm price if measurement is done, otherwise use estimate ranges
          const estimateTier = estimate?.tiers.find(t => t.tier === tier.tier);
          const firmPrice = hasMeasurement ? calculateTierPrice(tier, quoteData.sqftTotal) : null;
          const price = firmPrice
            ? firmPrice
            : estimateTier
            ? { min: estimateTier.minPrice, max: estimateTier.maxPrice }
            : 0;

          return (
            <PackageTierCard
              key={tier.id}
              tier={tier.tier}
              name={getTierDisplayName(tier.tier)}
              price={price}
              features={tier.features.map(f => ({ label: f, value: '' }))}
              warranty={`${tier.warrantyYears}-Year ${tier.warrantyType}`}
              recommended={tier.isPopular}
              selected={selectedTier === tier.tier}
              onSelect={() => handleSelect(tier.tier)}
            />
          );
        })}
      </div>

      {!hasMeasurement && (
        <p style={{ fontSize: 13, color: 'var(--rr-color-text-tertiary)', margin: 0 }}>
          Prices shown are estimates. Final pricing will be confirmed once satellite analysis completes.
        </p>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
```

**Step 2: Wire PackageStep into QuoteWizard**

In `QuoteWizard.tsx`:

```tsx
// Add import:
import { PackageStep } from './steps/PackageStep';

// Replace PACKAGE placeholder:
{state.step === 'PACKAGE' && state.quoteId && (
  <PackageStep
    quoteId={state.quoteId}
    estimate={state.estimate}
    onNext={() => goTo('SCHEDULE')}
  />
)}
```

**Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 4: Commit**

```bash
git add src/components/features/portal/QuoteWizard/steps/PackageStep.tsx src/components/features/portal/QuoteWizard/QuoteWizard.tsx
git commit -m "feat(portal): add PackageStep with tier cards and measurement polling"
```

---

## Task 6: ScheduleStep

Date picker + time slot selector. Calls `POST /api/quotes/[id]/schedule`.

**Files:**
- Create: `src/components/features/portal/QuoteWizard/steps/ScheduleStep.tsx`
- Modify: `src/components/features/portal/QuoteWizard/QuoteWizard.tsx` (wire in)

**Step 1: Create ScheduleStep component**

```tsx
// src/components/features/portal/QuoteWizard/steps/ScheduleStep.tsx

'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import styles from '../QuoteWizard.module.css';

interface ScheduleStepProps {
  quoteId: string;
  onNext: () => void;
}

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14); // Earliest available: 2 weeks out
  return d.toISOString().split('T')[0];
}

export function ScheduleStep({ quoteId, onNext }: ScheduleStepProps) {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = date && timeSlot && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const scheduledDate = new Date(`${date}T${timeSlot === 'morning' ? '09:00' : '13:00'}:00`).toISOString();

      const response = await fetch(`/api/quotes/${quoteId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate,
          timeSlot,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to schedule');
      }

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.formField}>
        <label htmlFor="install-date" className={styles.label}>Preferred Installation Date</label>
        <input
          id="install-date"
          type="date"
          min={getMinDate()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.formField}>
        <span className={styles.label}>Time Preference</span>
        <div className={styles.timeSlotGroup}>
          <button
            type="button"
            className={`${styles.timeSlot} ${timeSlot === 'morning' ? styles.timeSlotSelected : ''}`}
            onClick={() => setTimeSlot('morning')}
            disabled={isSubmitting}
          >
            Morning (8am–12pm)
          </button>
          <button
            type="button"
            className={`${styles.timeSlot} ${timeSlot === 'afternoon' ? styles.timeSlotSelected : ''}`}
            onClick={() => setTimeSlot('afternoon')}
            disabled={isSubmitting}
          >
            Afternoon (12pm–5pm)
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={styles.primaryButton}
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Continue'}
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
```

**Step 2: Wire ScheduleStep into QuoteWizard**

In `QuoteWizard.tsx`:

```tsx
// Add import:
import { ScheduleStep } from './steps/ScheduleStep';

// Replace SCHEDULE placeholder:
{state.step === 'SCHEDULE' && state.quoteId && (
  <ScheduleStep
    quoteId={state.quoteId}
    onNext={() => goTo('CONTACT')}
  />
)}
```

**Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 4: Commit**

```bash
git add src/components/features/portal/QuoteWizard/steps/ScheduleStep.tsx src/components/features/portal/QuoteWizard/QuoteWizard.tsx
git commit -m "feat(portal): add ScheduleStep with date picker and time slots"
```

---

## Task 7: ContactStep

Name, phone, email (pre-filled from Clerk), SMS consent. Calls `POST /api/quotes/[id]/contact` then `POST /api/quotes/[id]/confirm`.

**Files:**
- Create: `src/components/features/portal/QuoteWizard/steps/ContactStep.tsx`
- Modify: `src/components/features/portal/QuoteWizard/QuoteWizard.tsx` (wire in)

**Step 1: Create ContactStep component**

```tsx
// src/components/features/portal/QuoteWizard/steps/ContactStep.tsx

'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TCPA_DISCLOSURE_SHORT } from '@/lib/constants';
import styles from '../QuoteWizard.module.css';

interface ContactStepProps {
  quoteId: string;
  email: string;
  onComplete: () => void;
}

export function ContactStep({ quoteId, email, onComplete }: ContactStepProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = fullName.trim().length >= 2 && phone.trim().length >= 10 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Submit contact info
      const contactRes = await fetch(`/api/quotes/${quoteId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), smsConsent }),
      });

      if (!contactRes.ok) {
        const data = await contactRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save contact info');
      }

      // Step 2: Confirm booking
      const confirmRes = await fetch(`/api/quotes/${quoteId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email,
          phone: phone.trim(),
        }),
      });

      if (!confirmRes.ok) {
        const data = await confirmRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to confirm booking');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="full-name" className={styles.label}>Full Name</label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Smith"
            className={styles.input}
            disabled={isSubmitting}
            autoComplete="name"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="phone" className={styles.label}>Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className={styles.input}
            disabled={isSubmitting}
            autoComplete="tel"
          />
        </div>

        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            className={styles.input}
            style={{ opacity: 0.7 }}
          />
        </div>

        <div className={`${styles.fullWidth}`}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              className={styles.checkboxInput}
              disabled={isSubmitting}
            />
            <span className={styles.checkboxLabel}>
              {TCPA_DISCLOSURE_SHORT || 'I agree to receive text messages about my roofing project. Message & data rates may apply.'}
            </span>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={styles.primaryButton}
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Get My Quote'}
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
```

**Step 2: Wire ContactStep into QuoteWizard**

In `QuoteWizard.tsx`, the wizard needs to receive the user's email. Update the props:

```tsx
// Update QuoteWizardProps:
interface QuoteWizardProps {
  email: string;
  onComplete: () => void;
}

// Add import:
import { ContactStep } from './steps/ContactStep';

// Replace CONTACT placeholder:
{state.step === 'CONTACT' && state.quoteId && (
  <ContactStep
    quoteId={state.quoteId}
    email={email}
    onComplete={handleComplete}
  />
)}
```

The `email` prop will be passed from the portal page (from Clerk user session or mock user).

**Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 4: Commit**

```bash
git add src/components/features/portal/QuoteWizard/steps/ContactStep.tsx src/components/features/portal/QuoteWizard/QuoteWizard.tsx
git commit -m "feat(portal): add ContactStep with contact form and booking confirmation"
```

---

## Task 8: Wire QuoteWizard into Phase1Content

Replace the `/quote/new` link with the inline wizard. Add the wizard open/close state to Phase1Content.

**Files:**
- Modify: `src/app/portal/page.tsx`
- Modify: `src/components/features/portal/index.ts` (add export)

**Step 1: Add QuoteWizard to barrel exports**

In `src/components/features/portal/index.ts`, add:

```ts
export { QuoteWizard } from './QuoteWizard/QuoteWizard';
```

**Step 2: Update Phase1Content to embed the wizard**

Rewrite Phase1Content in `src/app/portal/page.tsx`:

```tsx
// Add useState import at top:
import { useState, useCallback } from 'react';

// Add QuoteWizard import:
import { QuoteWizard } from '@/components/features/portal/QuoteWizard/QuoteWizard';

// Replace entire Phase1Content function:
function Phase1Content({ email }: { email: string }) {
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleWizardComplete = useCallback(() => {
    setWizardOpen(false);
    // Phase re-evaluation happens via query invalidation inside QuoteWizard
  }, []);

  return (
    <>
      <p className={styles.subtitle}>Complete these steps to get started with your roof replacement</p>
      <ProjectTimeline currentStage={1} />
      <Checklist
        activeStep={1}
        stepCtas={wizardOpen ? undefined : {
          1: { label: 'Start Quote →', onClick: () => setWizardOpen(true) },
        }}
      />
      {wizardOpen && (
        <QuoteWizard email={email} onComplete={handleWizardComplete} />
      )}
    </>
  );
}
```

**Step 3: Pass email to Phase1Content**

Update `MyProjectContent` to pass email down:

```tsx
// In MyProjectContent, change:
{phase?.phase === PortalPhase.PRE_QUOTE && <Phase1Content />}
// To:
{phase?.phase === PortalPhase.PRE_QUOTE && <Phase1Content email={email!} />}
```

Note: `email` is guaranteed non-null when the portal renders (Clerk or dev bypass both provide it).

**Step 4: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 5: Commit**

```bash
git add src/app/portal/page.tsx src/components/features/portal/index.ts
git commit -m "feat(portal): embed QuoteWizard inline in Phase1Content"
```

---

## Task 9: Integration Testing + Polish

Verify the full wizard flow works end-to-end, fix any type issues, and add the step crossfade animation.

**Files:**
- Modify: `src/components/features/portal/QuoteWizard/QuoteWizard.module.css` (add transition)
- Modify: `src/components/features/portal/QuoteWizard/QuoteWizard.tsx` (add transition wrapper)

**Step 1: Add step transition animation**

In `QuoteWizard.module.css`, add:

```css
.stepTransition {
  animation: fadeIn 150ms ease;
}
```

In `QuoteWizard.tsx`, wrap the step content:

```tsx
<div className={styles.stepContent} key={state.step}>
  <div className={styles.stepTransition}>
    {/* step components */}
  </div>
</div>
```

The `key={state.step}` forces React to remount the content div on step change, triggering the fadeIn animation.

**Step 2: Run full typecheck**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 3: Run existing tests**

Run: `npx vitest run`
Expected: All existing tests pass (phase detection tests unaffected).

**Step 4: Commit**

```bash
git add src/components/features/portal/QuoteWizard/
git commit -m "feat(portal): add step crossfade transition to quote wizard"
```

---

## Task 10: Update INDEX.md + Final Verification

**Files:**
- Modify: `src/INDEX.md`
- Modify: `INDEX.md`

**Step 1: Update src/INDEX.md**

Add the QuoteWizard section under Portal Components:

```markdown
### QuoteWizard
- `src/components/features/portal/QuoteWizard/QuoteWizard.tsx` — Wizard orchestrator (step state, completion)
- `src/components/features/portal/QuoteWizard/steps/AddressStep.tsx` — Address entry via AddressAutocomplete
- `src/components/features/portal/QuoteWizard/steps/ConfirmStep.tsx` — Satellite map property confirmation
- `src/components/features/portal/QuoteWizard/steps/PackageStep.tsx` — Good/Better/Best tier selection
- `src/components/features/portal/QuoteWizard/steps/ScheduleStep.tsx` — Date + time slot picker
- `src/components/features/portal/QuoteWizard/steps/ContactStep.tsx` — Name/phone/email + SMS consent
```

**Step 2: Final typecheck + test run**

Run: `npx tsc --noEmit && npx vitest run`
Expected: Zero errors, all tests pass.

**Step 3: Commit**

```bash
git add src/INDEX.md INDEX.md
git commit -m "docs: update INDEX files with QuoteWizard components"
```

---

## Summary

| Task | Component | Files Changed | API Routes Used |
|------|-----------|---------------|-----------------|
| 1 | Checklist onClick support | 2 modified | — |
| 2 | QuoteWizard shell + CSS | 2 created | — |
| 3 | AddressStep | 1 created, 1 modified | POST /api/quotes |
| 4 | ConfirmStep | 1 created, 1 modified | — (Mapbox Static Maps) |
| 5 | PackageStep | 1 created, 1 modified | POST /api/quotes/[id]/select-tier |
| 6 | ScheduleStep | 1 created, 1 modified | POST /api/quotes/[id]/schedule |
| 7 | ContactStep | 1 created, 1 modified | POST /api/quotes/[id]/contact + /confirm |
| 8 | Phase1Content integration | 2 modified | — |
| 9 | Transitions + polish | 2 modified | — |
| 10 | INDEX updates | 2 modified | — |

**Total: 7 new files, 10 modified files, 0 backend changes, 10 commits.**
