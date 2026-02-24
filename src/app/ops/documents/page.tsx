'use client';

import { useCallback, useState } from 'react';
import {
  FolderOpen,
  FileSignature,
  RefreshCw,
  AlertCircle,
  X,
  ExternalLink,
  Download,
  ChevronRight,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderInput,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OpsPageHeader } from '@/components/ui/ops';
import { useOpsDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '@/hooks/ops/use-ops-queries';
import { useNullableParam } from '@/hooks/ops/use-ops-filters';
import { useToast } from '@/components/ui/Toast';
import type { OpsDocument } from '@/types/ops';

const FOLDER_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  deposits: { label: 'Deposits', icon: <FileSignature className="size-5" style={{ color: 'var(--ops-accent-pipeline)' }} /> },
  contracts: { label: 'Contracts', icon: <FileSignature className="size-5" style={{ color: 'var(--ops-accent-crm)' }} /> },
  invoices: { label: 'Invoices', icon: <FileSignature className="size-5" style={{ color: 'var(--ops-accent-analytics)' }} /> },
  general: { label: 'General', icon: <FolderOpen className="size-5 text-muted-foreground" /> },
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: <Clock className="size-3" /> },
  sent: { label: 'Sent', variant: 'outline', icon: <Clock className="size-3" /> },
  viewed: { label: 'Viewed', variant: 'outline', icon: <Eye className="size-3" /> },
  signed: { label: 'Signed', variant: 'default', icon: <CheckCircle2 className="size-3" /> },
  completed: { label: 'Completed', variant: 'default', icon: <CheckCircle2 className="size-3" /> },
  declined: { label: 'Declined', variant: 'destructive', icon: <XCircle className="size-3" /> },
  expired: { label: 'Expired', variant: 'destructive', icon: <XCircle className="size-3" /> },
};

const EMPTY_DOC_FORM = {
  name: '',
  type: 'other' as string,
  status: 'pending' as string,
  folder: 'general' as string,
  customerName: '',
  customerEmail: '',
  propertyAddress: '',
};

export default function DocumentsPage() {
  const [selectedFolder, setSelectedFolder] = useNullableParam('folder');
  const { data, isLoading: loading, error: queryError, refetch } = useOpsDocuments(selectedFolder);
  const documents = data?.documents || [];
  const folderStats = data?.folderStats || [];
  const error = queryError ? 'Could not load documents' : null;

  // Mutations
  const createDoc = useCreateDocument();
  const updateDoc = useUpdateDocument();
  const deleteDoc = useDeleteDocument();
  const { success, error: toastError } = useToast();

  // Dialog state
  const [showCreate, setShowCreate] = useState(false);
  const [docForm, setDocForm] = useState(EMPTY_DOC_FORM);
  const [renameTarget, setRenameTarget] = useState<OpsDocument | null>(null);
  const [renameName, setRenameName] = useState('');
  const [moveTarget, setMoveTarget] = useState<OpsDocument | null>(null);
  const [moveFolder, setMoveFolder] = useState('general');
  const [deleteTarget, setDeleteTarget] = useState<OpsDocument | null>(null);

  const handleFolderClick = useCallback((folder: string | null) => {
    setSelectedFolder(folder);
  }, [setSelectedFolder]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || { label: status, variant: 'secondary' as const, icon: null };
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  function openCreate() {
    setDocForm({ ...EMPTY_DOC_FORM, folder: selectedFolder || 'general' });
    setShowCreate(true);
  }

  function handleCreate() {
    if (!docForm.name.trim()) {
      toastError('Missing name', 'Document name is required');
      return;
    }
    createDoc.mutate(
      {
        name: docForm.name,
        type: docForm.type,
        status: docForm.status,
        folder: docForm.folder,
        customerName: docForm.customerName || undefined,
        customerEmail: docForm.customerEmail || undefined,
        propertyAddress: docForm.propertyAddress || undefined,
      },
      {
        onSuccess: () => {
          success('Document created');
          setShowCreate(false);
        },
        onError: (err) => toastError('Failed to create', err.message),
      }
    );
  }

  function handleRename() {
    if (!renameTarget || !renameName.trim()) return;
    updateDoc.mutate(
      { id: renameTarget.id, name: renameName },
      {
        onSuccess: () => {
          success('Document renamed');
          setRenameTarget(null);
        },
        onError: (err) => toastError('Failed to rename', err.message),
      }
    );
  }

  function handleMove() {
    if (!moveTarget) return;
    updateDoc.mutate(
      { id: moveTarget.id, folder: moveFolder },
      {
        onSuccess: () => {
          success(`Moved to ${FOLDER_CONFIG[moveFolder]?.label || moveFolder}`);
          setMoveTarget(null);
        },
        onError: (err) => toastError('Failed to move', err.message),
      }
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteDoc.mutate(deleteTarget.id, {
      onSuccess: () => {
        success('Document deleted');
        setDeleteTarget(null);
      },
      onError: (err) => toastError('Failed to delete', err.message),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <OpsPageHeader title="Documents" />

        <div className="flex items-center gap-2">
          {selectedFolder && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 size-4" /> New Document
            </Button>
          )}
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
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => refetch()} className="ml-4">
              <X className="size-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Breadcrumb */}
      {selectedFolder && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => handleFolderClick(null)}
            className="hover:text-foreground transition-colors"
          >
            <Home className="size-4" />
          </button>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">
            {FOLDER_CONFIG[selectedFolder]?.label || selectedFolder}
          </span>
        </div>
      )}

      {/* Folder Grid (when no folder selected) */}
      {!selectedFolder && loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-lg border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!selectedFolder && !loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {folderStats.map((stat) => {
            const config = FOLDER_CONFIG[stat.folder] || { label: stat.folder, icon: <FolderOpen className="size-5" /> };
            return (
              <Card
                key={stat.folder}
                className="cursor-pointer rounded-lg border border-border hover:bg-accent/50 transition-colors duration-150"
                onClick={() => handleFolderClick(stat.folder)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {stat.count} document{stat.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {folderStats.length === 0 && !loading && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <FolderOpen className="size-10 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No documents yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Documents will appear here when customers sign deposit authorizations
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Documents Table (when folder is selected) */}
      {selectedFolder && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {FOLDER_CONFIG[selectedFolder]?.icon}
              {FOLDER_CONFIG[selectedFolder]?.label || selectedFolder}
            </CardTitle>
            <CardDescription className="tabular-nums">
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-3.5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileSignature className="size-10 mx-auto mb-4 opacity-50" />
                <p>No documents in this folder yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{doc.customerName || '\u2014'}</p>
                          <p className="text-xs text-muted-foreground">{doc.customerEmail || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {doc.propertyAddress || '\u2014'}
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.signedAt ? formatDate(doc.signedAt) : formatDate(doc.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {doc.docusealDocumentUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={doc.docusealDocumentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="size-4" />
                              </a>
                            </Button>
                          )}
                          {doc.quoteId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`/ops/crm/pipeline?quote=${doc.quoteId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="size-4" />
                              </a>
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setRenameTarget(doc); setRenameName(doc.name); }}>
                                <Pencil className="size-4 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setMoveTarget(doc); setMoveFolder(doc.folder); }}>
                                <FolderInput className="size-4 mr-2" /> Move to Folder
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(doc)}
                              >
                                <Trash2 className="size-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Document Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
            <DialogDescription>Create a new document record</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Document Name</Label>
                <Input id="doc-name" placeholder="e.g. Deposit Authorization - Smith" value={docForm.name} onChange={e => setDocForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-folder">Folder</Label>
                  <Select value={docForm.folder} onValueChange={v => setDocForm(f => ({ ...f, folder: v }))}>
                    <SelectTrigger id="doc-folder"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposits">Deposits</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-type">Type</Label>
                  <Select value={docForm.type} onValueChange={v => setDocForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger id="doc-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit_authorization">Deposit Auth</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="change_order">Change Order</SelectItem>
                      <SelectItem value="warranty">Warranty</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-status">Status</Label>
                <Select value={docForm.status} onValueChange={v => setDocForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger id="doc-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-customer">Customer Name</Label>
                  <Input id="doc-customer" placeholder="Optional" value={docForm.customerName} onChange={e => setDocForm(f => ({ ...f, customerName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-email">Customer Email</Label>
                  <Input id="doc-email" type="email" placeholder="Optional" value={docForm.customerEmail} onChange={e => setDocForm(f => ({ ...f, customerEmail: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-address">Property Address</Label>
                <Input id="doc-address" placeholder="Optional" value={docForm.propertyAddress} onChange={e => setDocForm(f => ({ ...f, propertyAddress: e.target.value }))} />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createDoc.isPending}>
              {createDoc.isPending ? 'Creating...' : 'Create Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2">
              <Label htmlFor="rename-input">New Name</Label>
              <Input
                id="rename-input"
                value={renameName}
                onChange={e => setRenameName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRename()}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={updateDoc.isPending}>
              {updateDoc.isPending ? 'Saving...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Dialog */}
      <Dialog open={!!moveTarget} onOpenChange={(open) => !open && setMoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Document</DialogTitle>
            <DialogDescription>
              Move &quot;{moveTarget?.name}&quot; to a different folder
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2">
              <Label htmlFor="move-folder">Target Folder</Label>
              <Select value={moveFolder} onValueChange={setMoveFolder}>
                <SelectTrigger id="move-folder"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposits">Deposits</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="invoices">Invoices</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveTarget(null)}>Cancel</Button>
            <Button onClick={handleMove} disabled={updateDoc.isPending}>
              {updateDoc.isPending ? 'Moving...' : 'Move'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteDoc.isPending}>
              {deleteDoc.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
