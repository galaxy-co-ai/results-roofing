'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
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
import { staggerContainer, fadeInUp } from '@/lib/animation-variants';
import styles from '../../ops.module.css';

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

      // Get stages from the first pipeline (or use defaults)
      const pipeline = data.pipelines?.[0];
      if (pipeline) {
        setStages(pipeline.stages || []);
      } else {
        // Default stages for demo
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
    // Optimistic update
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
        // Revert on error
        fetchPipeline();
      }
    } catch {
      // Revert on error
      fetchPipeline();
    }
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    // TODO: Open opportunity detail modal
    console.log('View opportunity:', opportunity);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    // TODO: Open edit modal
    console.log('Edit opportunity:', opportunity);
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    setOpportunities((prev) => prev.filter((opp) => opp.id !== opportunityId));

    try {
      await fetch(`/api/ops/opportunities/${opportunityId}`, {
        method: 'DELETE',
      });
    } catch {
      // Refresh on error
      fetchPipeline();
    }
  };

  const handleMessageContact = (opportunity: Opportunity) => {
    // TODO: Navigate to messaging
    console.log('Message contact for opportunity:', opportunity);
  };

  // Calculate stats
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
    <motion.div initial="initial" animate="animate" variants={staggerContainer}>
      {/* Header */}
      <motion.header variants={fadeInUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <Kanban size={24} style={{ color: '#22C55E' }} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Sales Pipeline</h1>
            <p className={styles.pageDescription}>
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
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button size="sm" style={{ background: '#22C55E' }}>
            <Plus size={14} />
            Add Deal
          </Button>
        </div>
      </motion.header>

      {/* Stats */}
      <motion.div variants={fadeInUp} className={styles.statsGrid} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className={styles.statLabel}>Total Deals</p>
              <p className={styles.statValue}>{stats.totalDeals}</p>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(34, 197, 94, 0.1)',
              }}
            >
              <Kanban size={20} style={{ color: '#22C55E' }} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className={styles.statLabel}>Pipeline Value</p>
              <p className={styles.statValue}>{formatCurrency(stats.totalValue)}</p>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(6, 182, 212, 0.1)',
              }}
            >
              <DollarSign size={20} style={{ color: '#06B6D4' }} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className={styles.statLabel}>Average Deal</p>
              <p className={styles.statValue}>{formatCurrency(stats.averageValue)}</p>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(139, 92, 246, 0.1)',
              }}
            >
              <TrendingUp size={20} style={{ color: '#8B5CF6' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          variants={fadeInUp}
          className="mb-4 p-3 rounded-lg flex items-center gap-2"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
          }}
        >
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Pipeline Board */}
      <motion.div variants={fadeInUp}>
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
      </motion.div>
    </motion.div>
  );
}
