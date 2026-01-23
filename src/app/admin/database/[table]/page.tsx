'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Edit2,
  Trash2,
  Save,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import styles from './page.module.css';

interface TableData {
  table: string;
  records: Record<string, unknown>[];
  columns: string[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  editable: boolean;
}

const TABLE_DISPLAY_NAMES: Record<string, string> = {
  leads: 'Leads',
  quotes: 'Quotes',
  orders: 'Orders',
  contracts: 'Contracts',
  payments: 'Payments',
  appointments: 'Appointments',
  measurements: 'Measurements',
  pricing_tiers: 'Pricing Tiers',
  sms_consents: 'SMS Consents',
  webhook_events: 'Webhook Events',
  feedback: 'Feedback',
  dev_tasks: 'Dev Tasks',
  dev_notes: 'Dev Notes',
};

// Columns to hide from the table view (too long or not useful)
const HIDDEN_COLUMNS = ['rawResponse', 'pricingData', 'metadata'];

// Columns that shouldn't be edited
const READ_ONLY_COLUMNS = ['id', 'createdAt', 'updatedAt'];

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    return new Date(value).toLocaleString();
  }
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 50) + '...';
  if (typeof value === 'string' && value.length > 100) return value.slice(0, 100) + '...';
  return String(value);
}

function truncateId(id: string): string {
  if (!id || id.length < 12) return id;
  return `${id.slice(0, 8)}...`;
}

export default function TableViewerPage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table: tableName } = use(params);
  const [data, setData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, unknown>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/tables/${tableName}?page=${page}&limit=25`);
      if (!response.ok) throw new Error('Failed to fetch table data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [tableName, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (record: Record<string, unknown>) => {
    setEditingId(record.id as string);
    setEditingData({ ...record });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/tables/${tableName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData),
      });
      if (!response.ok) throw new Error('Failed to save changes');
      await fetchData();
      setEditingId(null);
      setEditingData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/tables/${tableName}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete record');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/tables/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecordData),
      });
      if (!response.ok) throw new Error('Failed to create record');
      await fetchData();
      setShowCreateForm(false);
      setNewRecordData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const displayName = TABLE_DISPLAY_NAMES[tableName] || tableName;
  const visibleColumns = data?.columns.filter((col) => !HIDDEN_COLUMNS.includes(col)) || [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/database" className={styles.backButton} aria-label="Back to database overview">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className={styles.title}>{displayName}</h1>
            <p className={styles.subtitle}>
              {data?.pagination.totalCount.toLocaleString() || 0} records
              {!data?.editable && (
                <span className={styles.readOnlyBadge}>
                  <Lock size={12} />
                  Read-only
                </span>
              )}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {data?.editable && (
            <button
              onClick={() => setShowCreateForm(true)}
              className={styles.createButton}
              disabled={showCreateForm}
            >
              <Plus size={18} />
              Add Record
            </button>
          )}
          <button
            onClick={fetchData}
            className={styles.refreshButton}
            disabled={loading}
            aria-label="Refresh data"
          >
            <RefreshCw size={18} className={loading ? styles.spinning : ''} />
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && data?.editable && (
        <div className={styles.createForm}>
          <h3 className={styles.formTitle}>Create New Record</h3>
          <div className={styles.formGrid}>
            {visibleColumns
              .filter((col) => col !== 'id' && col !== 'createdAt' && col !== 'updatedAt')
              .map((column) => (
                <div key={column} className={styles.formField}>
                  <label htmlFor={`new-${column}`}>{column}</label>
                  <input
                    id={`new-${column}`}
                    type="text"
                    value={String(newRecordData[column] ?? '')}
                    onChange={(e) =>
                      setNewRecordData((prev) => ({ ...prev, [column]: e.target.value }))
                    }
                  />
                </div>
              ))}
          </div>
          <div className={styles.formActions}>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewRecordData({});
              }}
              className={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>
            <button onClick={handleCreate} className={styles.saveButton} disabled={saving}>
              {saving ? <Loader2 size={16} className={styles.spinning} /> : <Save size={16} />}
              Create
            </button>
          </div>
        </div>
      )}

      {loading && !data ? (
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinning} />
          <span>Loading records...</span>
        </div>
      ) : (
        <>
          {/* Data Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  {data?.editable && <th className={styles.actionsColumn}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data?.records.map((record) => (
                  <tr key={record.id as string}>
                    {visibleColumns.map((column) => (
                      <td key={column}>
                        {editingId === record.id && !READ_ONLY_COLUMNS.includes(column) ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={String(editingData[column] ?? '')}
                            onChange={(e) =>
                              setEditingData((prev) => ({ ...prev, [column]: e.target.value }))
                            }
                          />
                        ) : column === 'id' ? (
                          <span className={styles.idCell} title={record[column] as string}>
                            {truncateId(record[column] as string)}
                          </span>
                        ) : (
                          formatCellValue(record[column])
                        )}
                      </td>
                    ))}
                    {data?.editable && (
                      <td className={styles.actionsCell}>
                        {editingId === record.id ? (
                          <>
                            <button
                              onClick={handleSave}
                              className={styles.iconButton}
                              disabled={saving}
                              aria-label="Save changes"
                            >
                              {saving ? <Loader2 size={16} className={styles.spinning} /> : <Save size={16} />}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className={styles.iconButton}
                              disabled={saving}
                              aria-label="Cancel editing"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(record)}
                              className={styles.iconButton}
                              aria-label="Edit record"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id as string)}
                              className={`${styles.iconButton} ${styles.deleteButton}`}
                              disabled={deleting === record.id}
                              aria-label="Delete record"
                            >
                              {deleting === record.id ? (
                                <Loader2 size={16} className={styles.spinning} />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {data?.records.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumns.length + (data.editable ? 1 : 0)} className={styles.emptyRow}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={styles.paginationButton}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <span className={styles.paginationInfo}>
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className={styles.paginationButton}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
