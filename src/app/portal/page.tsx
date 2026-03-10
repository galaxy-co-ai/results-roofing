'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { ProjectTimeline } from '@/components/features/portal/ProjectTimeline/ProjectTimeline';
import { Checklist } from '@/components/features/portal/Checklist/Checklist';
import { QuoteSummaryCard } from '@/components/features/portal/QuoteSummaryCard/QuoteSummaryCard';
import { QuoteWizard } from '@/components/features/portal/QuoteWizard/QuoteWizard';
import { PhaseShell } from '@/components/features/portal/PhaseShell/PhaseShell';
import { ContractFloatingCard } from '@/components/features/contract/ContractFloatingCard/ContractFloatingCard';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { PortalPhase } from '@/lib/portal/phases';
import { trackEvent } from '@/lib/analytics';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './page.module.css';

function MyProjectSkeleton() {
  return (
    <div className={styles.page}>
      <PortalHeader title="My Project" />
      <div className={styles.skeletonBlock} style={{ height: 48 }} />
      <div className={styles.skeletonBlock} style={{ height: 200 }} />
    </div>
  );
}

function Phase1Content({ email }: { email: string }) {
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleWizardComplete = useCallback(() => {
    setWizardOpen(false);
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

function Phase2Content({ quote, order }: { quote: any; order: any }) {
  const [contractOpen, setContractOpen] = useState(false);

  const address = order?.propertyAddress || quote?.address || '';
  const city = order?.propertyCity || quote?.city || '';
  const state = order?.propertyState || quote?.state || '';
  const tier = order?.selectedTier || quote?.selectedTier || 'good';
  const total = order?.totalPrice || quote?.totalPrice || 0;
  const installDate = order?.scheduledStartDate || quote?.scheduledDate || null;
  const quoteId = order?.quoteId || quote?.id || '';

  return (
    <>
      <p className={styles.subtitle}>Your quote is ready — review and sign your contract</p>
      <ProjectTimeline currentStage={2} />
      <QuoteSummaryCard
        address={address}
        city={city}
        state={state}
        packageTier={tier}
        totalPrice={total}
        installDate={installDate}
      />
      <Checklist
        activeStep={2}
        stepCtas={{ 2: { label: 'Review Contract →', onClick: () => setContractOpen(true) } }}
      />
      <ContractFloatingCard
        isOpen={contractOpen}
        onClose={() => setContractOpen(false)}
        onSigned={() => {
          setContractOpen(false);
          window.location.reload();
        }}
        order={{
          id: quoteId,
          quoteId,
          propertyAddress: address,
          propertyCity: city,
          propertyState: state,
          selectedTier: tier,
          totalPrice: total,
        }}
        contract={null}
      />
    </>
  );
}

function Phase3Content({ order, quote, hasDeposit, checklistStep }: { order: any; quote: any; hasDeposit: boolean; checklistStep: number }) {
  const address = order?.propertyAddress || quote?.address || '';
  const city = order?.propertyCity || quote?.city || '';
  const state = order?.propertyState || quote?.state || '';
  const tier = order?.selectedTier || quote?.selectedTier || 'good';
  const total = order?.totalPrice || quote?.totalPrice || 0;
  const installDate = order?.scheduledStartDate || quote?.scheduledDate || null;

  const subtitle = hasDeposit
    ? 'Your project is underway — installation is being scheduled'
    : 'Contract signed — book your consultation and submit your deposit';

  return (
    <>
      <p className={styles.subtitle}>{subtitle}</p>
      <ProjectTimeline currentStage={checklistStep} />
      <QuoteSummaryCard
        address={address}
        city={city}
        state={state}
        packageTier={tier}
        totalPrice={total}
        installDate={installDate}
      />
      <Checklist
        activeStep={checklistStep}
        stepCtas={{
          3: { label: 'Book Consultation →', href: '/portal/schedule' },
          4: { label: 'Submit Deposit →', href: '/portal/payments' },
        }}
      />
    </>
  );
}

function MyProjectContent({ email }: { email: string | null }) {
  const { phase, isLoading, order, quote } = usePortalPhase(email);
  const hasTrackedLogin = useRef(false);

  // Analytics: track portal login once per mount
  useEffect(() => {
    if (!isLoading && email && !hasTrackedLogin.current) {
      hasTrackedLogin.current = true;
      trackEvent('portal_login', {});
    }
  }, [isLoading, email]);

  if (isLoading) return <MyProjectSkeleton />;

  return (
    <div className={styles.page}>
      <PortalHeader title="My Project" />
      {phase?.phase === PortalPhase.PRE_QUOTE && <Phase1Content email={email!} />}
      {phase?.phase === PortalPhase.QUOTED && <Phase2Content quote={quote} order={order} />}
      {phase?.phase === PortalPhase.CONTRACTED && (
        <Phase3Content
          order={order}
          quote={quote}
          hasDeposit={phase.hasDeposit}
          checklistStep={phase.checklistStep}
        />
      )}
      {phase?.phase === PortalPhase.IN_PROGRESS && (
        <PhaseShell phase="in-progress" page="project" />
      )}
      {phase?.phase === PortalPhase.COMPLETE && (
        <PhaseShell phase="complete" page="project" />
      )}
    </div>
  );
}

function ClerkMyProject() {
  const { user } = useUser();
  return <MyProjectContent email={user?.primaryEmailAddress?.emailAddress ?? null} />;
}

function DevMyProject() {
  return <MyProjectContent email={MOCK_USER.primaryEmailAddress.emailAddress} />;
}

export default function MyProjectPage() {
  if (DEV_BYPASS_ENABLED) return <DevMyProject />;
  return <ClerkMyProject />;
}
