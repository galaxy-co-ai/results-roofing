'use client';

import { Check } from 'lucide-react';
import { defineStepper } from '@/components/ui/stepper';
import { cn } from '@/lib/utils';

// Define the quote wizard steps
const { Stepper, useStepper } = defineStepper(
  { id: 'quote', label: 'Get Quote', description: 'Enter your address' },
  { id: 'customize', label: 'Customize', description: 'Choose your package' },
  { id: 'schedule', label: 'Schedule', description: 'Pick a date' }
);

interface QuoteStepperProps {
  currentStage: 1 | 2 | 3;
  quoteId?: string;
  className?: string;
}

/**
 * QuoteStepper - A polished stepper for the quote wizard
 *
 * Uses shadcn-stepper for a consistent, accessible design.
 */
export function QuoteStepper({ currentStage, quoteId, className }: QuoteStepperProps) {
  // Map stage number to step ID
  const stepIds = ['quote', 'customize', 'schedule'] as const;
  const currentStepId = stepIds[currentStage - 1];

  return (
    <Stepper.Provider
      initialStep={currentStepId}
      variant="horizontal"
      labelOrientation="horizontal"
      className={cn('mx-auto max-w-2xl', className)}
    >
      <Stepper.Navigation aria-label="Quote progress" className="px-4">
        <Stepper.Step of="quote" icon={currentStage > 1 ? <Check className="h-4 w-4" /> : undefined}>
          <Stepper.Title className="hidden sm:block">Get Quote</Stepper.Title>
        </Stepper.Step>
        <Stepper.Step of="customize" icon={currentStage > 2 ? <Check className="h-4 w-4" /> : undefined}>
          <Stepper.Title className="hidden sm:block">Customize</Stepper.Title>
        </Stepper.Step>
        <Stepper.Step of="schedule">
          <Stepper.Title className="hidden sm:block">Schedule</Stepper.Title>
        </Stepper.Step>
      </Stepper.Navigation>
    </Stepper.Provider>
  );
}

export default QuoteStepper;
