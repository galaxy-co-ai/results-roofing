/**
 * Quote Feature Components
 * Components specific to the quote flow
 */

// Original components
export { MotivationCapture, type ReplacementMotivation } from './MotivationCapture';
export { ROIValueDisplay } from './ROIValueDisplay';
export { PackageTierCard } from './PackageTierCard';
export { ManualRoofEntry, type ManualRoofData } from './ManualRoofEntry';
export { QuoteErrorBoundary } from './QuoteErrorBoundary';
export { QuoteProgressBar } from './QuoteProgressBar';
export { SaveQuoteModal } from './SaveQuoteModal';

// Wizard components (Phase 4)
export { QuoteWizardProvider, useQuoteWizard, STAGE_CONFIG } from './QuoteWizardProvider';
export type {
  WizardStage,
  Stage1SubStep,
  Stage2SubStep,
  Stage3SubStep,
  SubStep,
  QuoteWizardState,
} from './QuoteWizardProvider';

export { StageIndicator } from './StageIndicator';
export { OrderSummarySidebar } from './OrderSummarySidebar';

// Stage containers
export { Stage1Container } from './stages/Stage1';
export { Stage2Container } from './stages/Stage2';
export { Stage3Container, ScheduleContainer } from './stages/Stage3';