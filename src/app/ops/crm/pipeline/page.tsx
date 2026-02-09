'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  PipelineBoard,
  type PipelineStage,
  type Opportunity,
} from '@/components/features/ops/crm/PipelineBoard';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { OpsPageHeader, OpsStatCard } from '@/components/ui/ops';

interface PipelineStats {
  totalDeals: number;
  totalValue: number;
  averageValue: number;
}

export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ops/pipelines?opportunities=true');
      if (!response.ok) throw new Error('Failed to fetch pipeline');

      const data = await response.json();

      const pipeline = data.pipelines?.[0];
      if (pipeline) {
        setStages(pipeline.stages || []);
      } else {
        setStages([
          { id: 'stage-1', name: 'New Lead', position: 0 },
          { id: 'stage-2', name: 'Contacted', position: 1 },
          { id: 'stage-3', name: 'Quote Sent', position: 2 },
          { id: 'stage-4', name: 'Negotiation', position: 3 },
          { id: 'stage-5', name: 'Won', position: 4 },
        ]);
      }

      setOpportunities(data.opportunities || []);
    } catch {
      setError('Could not load pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handleMoveOpportunity = async (opportunityId: string, newStageId: string) => {
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === opportunityId ? { ...opp, pipelineStageId: newStageId } : opp
      )
    );

    try {
      const response = await fetch(`/api/ops/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStageId: newStageId }),
      });

      if (!response.ok) {
        fetchPipeline();
      }
    } catch {
      fetchPipeline();
    }
  };

  const handleViewOpportunity = (_opportunity: Opportunity) => {
    // TODO: Open opportunity detail modal
  };

  const handleEditOpportunity = (_opportunity: Opportunity) => {
    // TODO: Open edit modal
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    setOpportunities((prev) => prev.filter((opp) => opp.id !== opportunityId));

    try {
      await fetch(`/api/ops/opportunities/${opportunityId}`, {
        method: 'DELETE',
      });
    } catch {
      fetchPipeline();
    }
  };

  const handleMessageContact = (_opportunity: Opportunity) => {
    // TODO: Navigate to messaging
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
            onClick={fetchPipeline}
            disabled={loading}
            className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
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
              onClick={() => setError(null)}
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
    </div>
  );
}
