'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  DollarSign,
  User,
  Phone,
  Mail,
  MoreHorizontal,
  ExternalLink,
  MessageSquare,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import styles from './PipelineBoard.module.css';

export interface PipelineStage {
  id: string;
  name: string;
  position?: number;
}

export interface Opportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  monetaryValue?: number;
  contactId: string;
  createdAt?: string;
  contact?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface PipelineBoardProps {
  stages: PipelineStage[];
  opportunities: Opportunity[];
  onMoveOpportunity: (opportunityId: string, newStageId: string) => void;
  onViewOpportunity?: (opportunity: Opportunity) => void;
  onEditOpportunity?: (opportunity: Opportunity) => void;
  onDeleteOpportunity?: (opportunityId: string) => void;
  onMessageContact?: (opportunity: Opportunity) => void;
  loading?: boolean;
}

function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Stage colors
const STAGE_COLORS: Record<string, string> = {
  'New Lead': '#3B82F6',
  'Contacted': '#8B5CF6',
  'Quote Sent': '#F59E0B',
  'Negotiation': '#EC4899',
  'Won': '#22C55E',
  'Lost': '#EF4444',
};

function getStageColor(stageName: string): string {
  return STAGE_COLORS[stageName] || '#06B6D4';
}

// Opportunity Card Component
interface OpportunityCardProps {
  opportunity: Opportunity;
  stageName: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMessage?: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

function OpportunityCard({
  opportunity,
  stageName,
  onView,
  onEdit,
  onDelete,
  onMessage,
  isDragging,
  isOverlay,
}: OpportunityCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: opportunity.id,
    data: { opportunity },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const stageColor = getStageColor(stageName);

  return (
    <div
      ref={!isOverlay ? setNodeRef : undefined}
      style={!isOverlay ? style : undefined}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''} ${isOverlay ? styles.cardOverlay : ''}`}
    >
      {/* Header with drag handle */}
      <div className={styles.cardHeader}>
        <button className={styles.dragHandle} {...attributes} {...listeners}>
          <GripVertical size={14} />
        </button>
        <div
          className={styles.valueBadge}
          style={{ background: `${stageColor}15`, color: stageColor }}
        >
          <DollarSign size={10} />
          {formatCurrency(opportunity.monetaryValue)}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onView}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h4 className={styles.cardTitle}>{opportunity.name}</h4>

      {/* Contact info */}
      {opportunity.contact && (
        <div className={styles.cardContact}>
          <User size={12} />
          <span>{opportunity.contact.name || 'Unknown'}</span>
        </div>
      )}

      {/* Footer */}
      <div className={styles.cardFooter}>
        {opportunity.contact?.phone && (
          <a href={`tel:${opportunity.contact.phone}`} className={styles.cardLink}>
            <Phone size={10} />
          </a>
        )}
        {opportunity.contact?.email && (
          <a href={`mailto:${opportunity.contact.email}`} className={styles.cardLink}>
            <Mail size={10} />
          </a>
        )}
        {opportunity.createdAt && (
          <span className={styles.cardDate}>{formatDate(opportunity.createdAt)}</span>
        )}
      </div>
    </div>
  );
}

// Column Component
interface ColumnProps {
  stage: PipelineStage;
  opportunities: Opportunity[];
  totalValue: number;
  onViewOpportunity?: (opportunity: Opportunity) => void;
  onEditOpportunity?: (opportunity: Opportunity) => void;
  onDeleteOpportunity?: (opportunityId: string) => void;
  onMessageContact?: (opportunity: Opportunity) => void;
}

function Column({
  stage,
  opportunities,
  totalValue,
  onViewOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onMessageContact,
}: ColumnProps) {
  const stageColor = getStageColor(stage.name);

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span className={styles.columnDot} style={{ background: stageColor }} />
        <span className={styles.columnName}>{stage.name}</span>
        <span className={styles.columnCount}>{opportunities.length}</span>
      </div>
      <div className={styles.columnValue}>{formatCurrency(totalValue)}</div>

      <SortableContext items={opportunities.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.columnContent} data-stage-id={stage.id}>
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              stageName={stage.name}
              onView={() => onViewOpportunity?.(opportunity)}
              onEdit={() => onEditOpportunity?.(opportunity)}
              onDelete={() => onDeleteOpportunity?.(opportunity.id)}
              onMessage={() => onMessageContact?.(opportunity)}
            />
          ))}

          {opportunities.length === 0 && (
            <div className={styles.emptyColumn}>Drop deals here</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Main Pipeline Board Component
export function PipelineBoard({
  stages,
  opportunities,
  onMoveOpportunity,
  onViewOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onMessageContact,
  loading = false,
}: PipelineBoardProps) {
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const opp = opportunities.find((o) => o.id === event.active.id);
    if (opp) setActiveOpportunity(opp);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOpportunity(null);

    if (!over) return;

    const opportunityId = active.id as string;
    const opportunity = opportunities.find((o) => o.id === opportunityId);
    if (!opportunity) return;

    // Check if dropped over a stage
    const overElement = document.querySelector(`[data-stage-id="${over.id}"]`);
    let newStageId: string | null = null;

    if (overElement) {
      newStageId = over.id as string;
    } else {
      // Dropped over another opportunity - get its stage
      const overOpportunity = opportunities.find((o) => o.id === over.id);
      if (overOpportunity) {
        newStageId = overOpportunity.pipelineStageId;
      }
    }

    // If no stage found, check by element position
    if (!newStageId) {
      for (const stage of stages) {
        const colElement = document.querySelector(`[data-stage-id="${stage.id}"]`);
        if (colElement) {
          const rect = colElement.getBoundingClientRect();
          const { activatorEvent } = event;
          if (activatorEvent && 'clientX' in activatorEvent && 'clientY' in activatorEvent) {
            const x = (activatorEvent as MouseEvent).clientX;
            const y = (activatorEvent as MouseEvent).clientY;
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
              newStageId = stage.id;
              break;
            }
          }
        }
      }
    }

    if (newStageId && newStageId !== opportunity.pipelineStageId) {
      onMoveOpportunity(opportunityId, newStageId);
    }
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter((o) => o.pipelineStageId === stageId);
  };

  const getStageValue = (stageId: string) => {
    return getOpportunitiesByStage(stageId).reduce(
      (sum, o) => sum + (o.monetaryValue || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Loading pipeline...
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No pipeline configured</p>
      </div>
    );
  }

  // Get active stage name for overlay
  const activeStage = activeOpportunity
    ? stages.find((s) => s.id === activeOpportunity.pipelineStageId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {stages.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            opportunities={getOpportunitiesByStage(stage.id)}
            totalValue={getStageValue(stage.id)}
            onViewOpportunity={onViewOpportunity}
            onEditOpportunity={onEditOpportunity}
            onDeleteOpportunity={onDeleteOpportunity}
            onMessageContact={onMessageContact}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOpportunity && activeStage && (
          <OpportunityCard
            opportunity={activeOpportunity}
            stageName={activeStage.name}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
