'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RefreshCw,
  AlertCircle,
  X,
  Flag,
  Loader2,
  GripVertical,
  ChevronDown,
  Square,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { staggerContainer, fadeInUp } from '@/lib/animation-variants';
import { CommandBar } from '@/components/features/admin/CommandBar';
import styles from './page.module.css';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'feature' | 'bug' | 'refactor' | 'design' | 'docs' | 'test' | 'chore';
  checklist: ChecklistItem[];
  feedbackId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  // SOW fields
  phaseId: string | null;
  phaseName: string | null;
  sowDeliverable: string | null;
}

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#64748B' },
  { id: 'todo', label: 'To Do', color: '#3B82F6' },
  { id: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { id: 'review', label: 'Review', color: '#A855F7' },
  { id: 'done', label: 'Done', color: '#22C55E' },
] as const;

const PRIORITY_COLORS = {
  low: '#64748B',
  medium: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444',
};

const CATEGORY_LABELS = {
  feature: 'Feature',
  bug: 'Bug',
  refactor: 'Refactor',
  design: 'Design',
  docs: 'Docs',
  test: 'Test',
  chore: 'Chore',
};

// ============================================
// Active Sprint Button + Dialog
// ============================================
interface ActiveSprintButtonProps {
  tasks: Task[];
  onChecklistChange: (taskId: string, checklist: ChecklistItem[]) => void;
  onAddChecklistItem: (taskId: string, text: string) => void;
}

function ActiveSprintButton({ tasks, onChecklistChange, onAddChecklistItem }: ActiveSprintButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [addingToTaskId, setAddingToTaskId] = useState<string | null>(null);

  // Get active tasks: in_progress first, then todo
  const activeTasks = tasks
    .filter(t => t.status === 'in_progress' || t.status === 'todo')
    .sort((a, b) => {
      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
      if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  const handleToggleItem = (task: Task, itemId: string) => {
    const updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onChecklistChange(task.id, updatedChecklist);
  };

  const handleAddItem = (taskId: string) => {
    if (!newItemText.trim()) return;
    onAddChecklistItem(taskId, newItemText.trim());
    setNewItemText('');
    setAddingToTaskId(null);
  };

  const getCompletionPercent = (task: Task) => {
    if (!task.checklist || task.checklist.length === 0) return 0;
    const completed = task.checklist.filter(i => i.completed).length;
    return Math.round((completed / task.checklist.length) * 100);
  };

  // Calculate overall stats
  const totalItems = activeTasks.reduce((acc, t) => acc + (t.checklist?.length || 0), 0);
  const completedItems = activeTasks.reduce((acc, t) => acc + (t.checklist?.filter(i => i.completed).length || 0), 0);
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={styles.sprintTrigger}
        aria-label="Open Active Sprint"
      >
        <Sparkles size={12} />
        <span>Sprint</span>
        {activeTasks.length > 0 && (
          <span className={styles.sprintBadge}>{activeTasks.length}</span>
        )}
        {totalItems > 0 && (
          <div className={styles.sprintProgress}>
            <div 
              className={styles.sprintProgressFill}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        )}
      </button>

      {/* Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className={styles.sprintBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              className={styles.sprintPanel}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className={styles.sprintPanelHeader}>
                <Sparkles size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold flex-1">Active Sprint</h2>
                <span className="text-xs text-muted-foreground">
                  {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className={styles.sprintClose}
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div className={styles.sprintPanelContent}>
                {activeTasks.length === 0 ? (
                  <div className={styles.emptySprintState}>
                    <p className="text-sm text-muted-foreground">No active tasks</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Move tasks to &quot;To Do&quot; or &quot;In Progress&quot;
                    </p>
                  </div>
                ) : (
                  <div className={styles.activeTasksList}>
                    {activeTasks.map((task) => {
                      const completionPercent = getCompletionPercent(task);
                      const statusColor = COLUMNS.find(c => c.id === task.status)?.color || '#666';

                      return (
                        <div key={task.id} className={styles.activeTaskItem}>
                          <div className={styles.activeTaskHeader}>
                            <div 
                              className={styles.statusIndicator}
                              style={{ background: statusColor }}
                            />
                            {task.phaseName && (
                              <span className={styles.phaseBadge}>P{task.phaseId}</span>
                            )}
                            <span 
                              className={styles.priorityBadge}
                              style={{ 
                                background: `${PRIORITY_COLORS[task.priority]}15`, 
                                color: PRIORITY_COLORS[task.priority] 
                              }}
                            >
                              <Flag size={9} />
                              {task.priority.toUpperCase()}
                            </span>
                            <h3 className={styles.activeTaskTitle}>{task.title}</h3>
                            {task.checklist.length > 0 && (
                              <div className={styles.progressPill}>
                                <Progress value={completionPercent} className="w-12 h-1.5" />
                                <span className="text-[10px] text-muted-foreground ml-1">
                                  {completionPercent}%
                                </span>
                              </div>
                            )}
                          </div>

                          <div className={styles.checklistContainer}>
                            {task.checklist.map((item) => (
                              <button
                                key={item.id}
                                className={`${styles.checklistItem} ${item.completed ? styles.checklistItemCompleted : ''}`}
                                onClick={() => handleToggleItem(task, item.id)}
                              >
                                {item.completed ? (
                                  <CheckSquare size={14} className="text-emerald-500 flex-shrink-0" />
                                ) : (
                                  <Square size={14} className="text-muted-foreground flex-shrink-0" />
                                )}
                                <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                                  {item.text}
                                </span>
                              </button>
                            ))}

                            {addingToTaskId === task.id ? (
                              <div className={styles.addItemForm}>
                                <input
                                  type="text"
                                  value={newItemText}
                                  onChange={(e) => setNewItemText(e.target.value)}
                                  placeholder="Add checklist item..."
                                  className={styles.addItemInput}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddItem(task.id);
                                    if (e.key === 'Escape') setAddingToTaskId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleAddItem(task.id)}
                                  className={styles.addItemSubmit}
                                  disabled={!newItemText.trim()}
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => setAddingToTaskId(null)}
                                  className={styles.addItemCancel}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                className={styles.addChecklistButton}
                                onClick={() => setAddingToTaskId(task.id)}
                              >
                                <Plus size={12} />
                                Add item
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// Draggable Task Card Component
// ============================================
interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

function TaskCard({ task, isExpanded, onToggleExpand, onDelete, isDragging, isOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate checklist progress
  const checklistProgress = task.checklist?.length > 0
    ? `${task.checklist.filter(i => i.completed).length}/${task.checklist.length}`
    : null;

  const cardContent = (
    <div
      ref={!isOverlay ? setNodeRef : undefined}
      style={!isOverlay ? style : undefined}
      className={`${styles.taskCard} ${isDragging ? styles.taskCardDragging : ''} ${isOverlay ? styles.taskCardOverlay : ''}`}
    >
      {/* Drag Handle + Header Row */}
      <div className={styles.taskCardHeader}>
        <button
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          aria-label="Drag to move task"
        >
          <GripVertical size={14} />
        </button>
        <div className={styles.taskBadges}>
          <span 
            className={styles.priorityBadge}
            style={{ background: `${PRIORITY_COLORS[task.priority]}15`, color: PRIORITY_COLORS[task.priority] }}
          >
            <Flag size={9} />
            {task.priority}
          </span>
          <span className={styles.categoryBadge}>
            {CATEGORY_LABELS[task.category]}
          </span>
        </div>
        {checklistProgress && (
          <span className={styles.checklistBadge}>
            <CheckSquare size={10} />
            {checklistProgress}
          </span>
        )}
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          aria-label="Delete task"
        >
          <X size={12} />
        </button>
      </div>
      
      {/* Title - Always Visible */}
      <h3 className={styles.taskTitle}>{task.title}</h3>
      
      {/* Expandable Description */}
      {task.description && (
        <>
          <button
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-expanded={isExpanded}
          >
            <span className="text-xs text-muted-foreground">
              {isExpanded ? 'Hide details' : 'Show details'}
            </span>
            <ChevronDown 
              size={12} 
              className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className={styles.taskDescription}>{task.description}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );

  return cardContent;
}

// ============================================
// Droppable Column Component
// ============================================
interface ColumnProps {
  column: typeof COLUMNS[number];
  tasks: Task[];
  expandedTaskId: string | null;
  onToggleExpand: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

function Column({ column, tasks, expandedTaskId, onToggleExpand, onDeleteTask }: ColumnProps) {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span 
          className={styles.columnDot}
          style={{ background: column.color }}
        />
        <span className={styles.columnLabel}>{column.label}</span>
        <span className={styles.columnCount}>{tasks.length}</span>
      </div>
      
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.columnContent} data-column-id={column.id}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isExpanded={expandedTaskId === task.id}
              onToggleExpand={() => onToggleExpand(task.id)}
              onDelete={onDeleteTask}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className={styles.emptyColumn}>
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ============================================
// Main Tasks Page Component
// ============================================
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' as Task['priority'],
    category: 'feature' as Task['category'],
    status: 'backlog' as Task['status'],
  });
  const [isAdding, setIsAdding] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/tasks');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      // Ensure checklist is always an array
      const tasksWithChecklist = (data.tasks || []).map((t: Task) => ({
        ...t,
        checklist: t.checklist || [],
      }));
      setTasks(tasksWithChecklist);
    } catch {
      setError('Could not load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    setIsAdding(true);
    
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      
      if (response.ok) {
        const { task } = await response.json();
        setTasks((prev) => [{ ...task, checklist: task.checklist || [] }, ...prev]);
        setNewTask({ title: '', description: '', priority: 'medium', category: 'feature', status: 'backlog' });
        setShowAddForm(false);
      }
    } catch {
      // Silent fail
    } finally {
      setIsAdding(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        fetchTasks();
      }
    } catch {
      fetchTasks();
    }
  };

  const handleChecklistChange = async (taskId: string, checklist: ChecklistItem[]) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, checklist } : t)));
    
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist, autoAdvance: true }),
      });
      
      if (response.ok) {
        const { task } = await response.json();
        // Update with server response (may have auto-advanced)
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...task, checklist: task.checklist || [] } : t)));
      } else {
        fetchTasks();
      }
    } catch {
      fetchTasks();
    }
  };

  const handleAddChecklistItem = async (taskId: string, text: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    };
    
    const updatedChecklist = [...task.checklist, newItem];
    handleChecklistChange(taskId, updatedChecklist);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    
    try {
      await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch {
      fetchTasks();
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  };

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const overElement = document.querySelector(`[data-column-id="${over.id}"]`);
    let newStatus: Task['status'] | null = null;

    if (overElement) {
      newStatus = over.id as Task['status'];
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus) {
      for (const col of COLUMNS) {
        const colElement = document.querySelector(`[data-column-id="${col.id}"]`);
        if (colElement) {
          const rect = colElement.getBoundingClientRect();
          const { activatorEvent } = event;
          if (activatorEvent && 'clientX' in activatorEvent && 'clientY' in activatorEvent) {
            const x = (activatorEvent as MouseEvent).clientX;
            const y = (activatorEvent as MouseEvent).clientY;
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
              newStatus = col.id as Task['status'];
              break;
            }
          }
        }
      }
    }

    if (newStatus && newStatus !== task.status) {
      handleStatusChange(taskId, newStatus);
    }
  };

  return (
    <motion.div 
      className={styles.page}
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.header className={styles.header} variants={fadeInUp}>
        <div>
          <h1 className="text-heading-24 tracking-tight">Task Board</h1>
          <p className="text-copy-14 text-subtle mt-1">
            AI-powered sprint management
          </p>
        </div>
        <div className={styles.headerControls}>
          <ActiveSprintButton 
            tasks={tasks}
            onChecklistChange={handleChecklistChange}
            onAddChecklistItem={handleAddChecklistItem}
          />
          <CommandBar onRefreshTasks={fetchTasks} onAddTask={() => setShowAddForm(true)} />
        </div>
      </motion.header>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className={styles.modalOverlay} onClick={() => setShowAddForm(false)}>
          <form 
            className={styles.addForm} 
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddTask}
          >
            <div className={styles.formHeader}>
              <h2>Add New Task</h2>
              <button type="button" onClick={() => setShowAddForm(false)} className={styles.closeButton}>
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.formField}>
              <label htmlFor="task-title">Title</label>
              <input
                id="task-title"
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>
            
            <div className={styles.formField}>
              <label htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add details..."
                rows={3}
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className={styles.formField}>
                <label htmlFor="task-category">Category</label>
                <select
                  id="task-category"
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Task['category'] })}
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                  <option value="refactor">Refactor</option>
                  <option value="design">Design</option>
                  <option value="docs">Docs</option>
                  <option value="test">Test</option>
                  <option value="chore">Chore</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button type="button" onClick={() => setShowAddForm(false)} className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={styles.submitButton} disabled={isAdding || !newTask.title.trim()}>
                {isAdding ? <Loader2 size={16} className={styles.spinner} /> : null}
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading/Error States */}
      {isLoading && (
        <div className={styles.loading}>
          <RefreshCw size={20} className={styles.spinner} />
          Loading tasks...
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Kanban Board with Drag and Drop */}
      {!isLoading && !error && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <motion.div className={styles.board} variants={fadeInUp}>
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
                expandedTaskId={expandedTaskId}
                onToggleExpand={toggleExpand}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </motion.div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                isExpanded={false}
                onToggleExpand={() => {}}
                onDelete={() => {}}
                isOverlay
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

    </motion.div>
  );
}
