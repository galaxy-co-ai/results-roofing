'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  RefreshCw,
  AlertCircle,
  ChevronRight,
  X,
  GripVertical,
  Flag,
  Loader2,
} from 'lucide-react';
import styles from './page.module.css';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'feature' | 'bug' | 'refactor' | 'design' | 'docs' | 'test' | 'chore';
  feedbackId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#666' },
  { id: 'todo', label: 'To Do', color: '#3B82F6' },
  { id: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { id: 'review', label: 'Review', color: '#A855F7' },
  { id: 'done', label: 'Done', color: '#22C55E' },
];

const PRIORITY_COLORS = {
  low: '#666',
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/tasks');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setTasks(data.tasks || []);
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
        setTasks((prev) => [task, ...prev]);
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
    setUpdatingId(taskId);
    
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        const { task } = await response.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
      }
    } catch {
      // Silent fail
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch {
      // Silent fail
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Task Board</h1>
          <p className={styles.subtitle}>{tasks.length} tasks</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => setShowAddForm(true)}
            className={styles.addButton}
          >
            <Plus size={16} />
            Add Task
          </button>
          <button onClick={fetchTasks} className={styles.refreshButton} aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

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

      {/* Kanban Board */}
      {!isLoading && !error && (
        <div className={styles.board}>
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className={styles.column}>
                <div className={styles.columnHeader}>
                  <span 
                    className={styles.columnDot}
                    style={{ background: column.color }}
                  />
                  <span className={styles.columnLabel}>{column.label}</span>
                  <span className={styles.columnCount}>{columnTasks.length}</span>
                </div>
                
                <div className={styles.columnContent}>
                  {columnTasks.map((task) => (
                    <div key={task.id} className={styles.taskCard}>
                      <div className={styles.taskHeader}>
                        <span 
                          className={styles.priorityBadge}
                          style={{ background: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority] }}
                        >
                          <Flag size={10} />
                          {task.priority}
                        </span>
                        <span className={styles.categoryBadge}>
                          {CATEGORY_LABELS[task.category]}
                        </span>
                      </div>
                      
                      <h3 className={styles.taskTitle}>{task.title}</h3>
                      
                      {task.description && (
                        <p className={styles.taskDescription}>{task.description}</p>
                      )}
                      
                      <div className={styles.taskActions}>
                        <select
                          className={styles.statusSelect}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                          disabled={updatingId === task.id}
                        >
                          {COLUMNS.map((col) => (
                            <option key={col.id} value={col.id}>{col.label}</option>
                          ))}
                        </select>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label="Delete task"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className={styles.emptyColumn}>
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
