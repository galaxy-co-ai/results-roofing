'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Kanban,
  Plus,
  RefreshCw,
  AlertCircle,
  X,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  PipelineBoard,
  type PipelineStage,
  type Opportunity,
} from '@/components/features/ops/crm/PipelineBoard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

interface PipelineStats {
  totalDeals: number;
  totalValue: number;
  averageValue: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="size-5" style={{ color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-500/10 p-2">
            <Kanban className="size-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
            <p className="text-sm text-muted-foreground">
              Track and manage your deals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPipeline}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 size-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Deals"
          value={stats.totalDeals}
          icon={Kanban}
          iconColor="#22C55E"
        />
        <StatCard
          label="Pipeline Value"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          iconColor="#06B6D4"
        />
        <StatCard
          label="Average Deal"
          value={formatCurrency(stats.averageValue)}
          icon={TrendingUp}
          iconColor="#8B5CF6"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4">
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
