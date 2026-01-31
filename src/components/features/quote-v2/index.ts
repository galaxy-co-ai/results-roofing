// Main components
export { WizardShell } from './WizardShell';
export { WizardProvider, useWizard, useWizardData, useWizardActions } from './WizardContext';
export { WizardProgress, WizardProgressBar } from './WizardProgress';
export { WizardSidebar } from './WizardSidebar';
export { WizardFooter } from './WizardFooter';
export { StepAnimator, FadeAnimator } from './StepAnimator';

// State machine
export {
  wizardMachine,
  getStageFromState,
  getProgressPercentage,
  getStepInfo,
  type WizardContext,
  type WizardContextType,
  type WizardEvent,
  type WizardStage,
  type TierPriceRange,
} from './WizardMachine';

// Step components
export * from './steps';
