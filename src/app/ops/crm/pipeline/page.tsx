'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  PipelineBoard,
  type Opportunity,
} from '@/components/features/ops/crm/PipelineBoard';
import {
  OpportunityModal,
  type OpportunityFormData,
} from '@/components/features/ops/crm/OpportunityModal';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { OpsPageHeader, OpsStatCard } from '@/components/ui/ops';
import {
  useOpsPipeline,
  useMoveOpportunity,
  useCreateOpportunity,
  useUpdateOpportunity,
  useDeleteOpportunity,
} from '@/hooks/ops/use-ops-queries';
import type { PipelineStats } from '@/types/ops';

type ModalMode = 'view' | 'edit' | 'create';

export default function PipelinePage() {
  const router = useRouter();
  const { data, isLoading: loading, error: queryError, refetch } = useOpsPipeline();
  const moveOpportunity = useMoveOpportunity();
  const createOpportunity = useCreateOpportunity();
  const updateOpportunity = useUpdateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();

  const stages = data?.stages || [];
  const opportunities = data?.opportunities || [];
  const error = queryError ? 'Could not load pipeline' : null;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const pipelineId = stages.length > 0
    ? (opportunities[0]?.pipelineId || 'pipeline-1')
    : 'pipeline-1';

  const handleMoveOpportunity = (opportunityId: string, newStageId: string) => {
    moveOpportunity.mutate({ opportunityId, stageId: newStageId });
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    deleteOpportunity.mutate(opportunityId);
  };

  const handleMessageContact = (opportunity: Opportunity) => {
    const contactId = opportunity.contact?.id || opportunity.contactId;
    router.push(`/ops/messaging/sms?contact=${encodeURIComponent(contactId)}`);
  };

  const handleAddDeal = () => {
    setSelectedOpportunity(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleSaveOpportunity = (formData: OpportunityFormData) => {
    if (modalMode === 'create') {
      createOpportunity.mutate(
        {
          name: formData.name,
          pipelineId,
          pipelineStageId: formData.pipelineStageId,
          contactId: formData.contactId || 'new-contact',
          monetaryValue: formData.monetaryValue,
          status: formData.status,
        },
        { onSuccess: () => setModalOpen(false) }
      );
    } else if (modalMode === 'edit' && selectedOpportunity) {
      updateOpportunity.mutate(
        {
          opportunityId: selectedOpportunity.id,
          name: formData.name,
          pipelineStageId: formData.pipelineStageId,
          monetaryValue: formData.monetaryValue,
          status: formData.status,
        },
        { onSuccess: () => setModalOpen(false) }
      );
    }
  };

  const stats: PipelineStats = {
    totalDeals: opportunities.length,
    totalValue: opportunities.reduce((sum, opp) => sum + (opp.monetaryValue || 0), 0),
    averageValue:
      opportunities.length > 0
        ? opportunities.reduce((sum, opp) => sum + (opp.monetaryValue || 0), 0) /
          opportunities.length
        : 0,
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <OpsPageHeader title="Sales Pipeline" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleAddDeal}
            className="bg-[var(--ops-accent-pipeline)] hover:bg-[color-mix(in_srgb,var(--ops-accent-pipeline)_90%,black)] transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
          >
            <Plus className="mr-2 size-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <OpsStatCard
          label="Total Deals"
          value={stats.totalDeals.toString()}
        />
        <OpsStatCard
          label="Pipeline Value"
          value={formatCurrency(stats.totalValue)}
        />
        <OpsStatCard
          label="Average Deal"
          value={formatCurrency(stats.averageValue)}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => refetch()}
              className="ml-4 transition-colors hover:text-[var(--admin-text-primary)]"
            >
              <X className="size-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Pipeline Board */}
      <PipelineBoard
        stages={stages}
        opportunities={opportunities}
        onMoveOpportunity={handleMoveOpportunity}
        onViewOpportunity={handleViewOpportunity}
        onEditOpportunity={handleEditOpportunity}
        onDeleteOpportunity={handleDeleteOpportunity}
        onMessageContact={handleMessageContact}
        loading={loading}
      />

      {/* Opportunity Modal */}
      <OpportunityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        opportunity={selectedOpportunity}
        stages={stages}
        pipelineId={pipelineId}
        onSave={handleSaveOpportunity}
        saving={createOpportunity.isPending || updateOpportunity.isPending}
      />
    </div>
  );
}
