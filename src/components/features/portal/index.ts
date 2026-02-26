/**
 * Portal Feature Components
 * Components specific to the customer portal
 */

// Legacy components (still used by existing pages)
export { PortalUserCard } from './PortalUserCard';
export { PortalSidebar } from './PortalSidebar';

// Payment components
export { PaymentProgressCard, PaymentProgressCardSkeleton } from './PaymentProgressCard';
export { PaymentOptionCard, PaymentOptionCardSkeleton } from './PaymentOptionCard';
export { PaymentHistoryTable, PaymentHistoryTableSkeleton } from './PaymentHistoryTable';

// Redesign components
export { PortalSidebarV2 } from './PortalSidebarV2/PortalSidebarV2';
export { PortalHeader } from './PortalHeader/PortalHeader';
export { BottomTabBar } from './BottomTabBar/BottomTabBar';
export { ProjectTimeline } from './ProjectTimeline/ProjectTimeline';
export { Checklist } from './Checklist/Checklist';
export { ChecklistStep } from './Checklist/ChecklistStep';
export { EmptyStateLocked } from './EmptyStateLocked/EmptyStateLocked';
export { QuoteSummaryCard } from './QuoteSummaryCard/QuoteSummaryCard';
export { PhaseShell } from './PhaseShell/PhaseShell';
export { QuoteWizard } from './QuoteWizard/QuoteWizard';