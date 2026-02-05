'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  folder: string;
  customerName: string | null;
  customerEmail: string | null;
  propertyAddress: string | null;
  quoteId: string | null;
  docusealDocumentUrl: string | null;
  signedAt: string | null;
  createdAt: string;
}

interface FolderStats {
  folder: string;
  count: number;
  label: string;
  icon: React.ReactNode;
}

const FOLDER_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  deposits: { label: 'Deposits', icon: <FileSignature className="size-5 text-emerald-500" /> },
  contracts: { label: 'Contracts', icon: <FileSignature className="size-5 text-blue-500" /> },
  invoices: { label: 'Invoices', icon: <FileSignature className="size-5 text-amber-500" /> },
  general: { label: 'General', icon: <FolderOpen className="size-5 text-gray-500" /> },
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folderStats, setFolderStats] = useState<FolderStats[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (folder?: string | null) => {
    setLoading(true);
    setError(null);

    try {
      const url = folder
        ? `/api/ops/documents?folder=${encodeURIComponent(folder)}`
        : '/api/ops/documents';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.documents || []);
      setFolderStats(data.folderStats || []);
    } catch {
      setError('Could not load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(selectedFolder);
  }, [fetchDocuments, selectedFolder]);

  const handleFolderClick = (folder: string | null) => {
    setSelectedFolder(folder);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <FolderOpen className="size-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Manage signed documents and authorizations
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDocuments(selectedFolder)}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
      {!selectedFolder && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {folderStats.map((stat) => {
            const config = FOLDER_CONFIG[stat.folder] || { label: stat.folder, icon: <FolderOpen className="size-5" /> };
            return (
              <Card
                key={stat.folder}
                className="cursor-pointer transition-all hover:shadow-md hover:border-violet-200"
                onClick={() => handleFolderClick(stat.folder)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      {config.icon}
                    </div>
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-sm text-muted-foreground">
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
                <FolderOpen className="size-12 text-muted-foreground mx-auto mb-4" />
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
            <CardDescription>
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileSignature className="size-12 mx-auto mb-4 opacity-50" />
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
                          <p className="text-sm">{doc.customerName || '—'}</p>
                          <p className="text-xs text-muted-foreground">{doc.customerEmail || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {doc.propertyAddress || '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.signedAt ? formatDate(doc.signedAt) : formatDate(doc.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
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
    </div>
  );
}
