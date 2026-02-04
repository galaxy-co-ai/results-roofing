'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  MapPin,
  Tag,
  ExternalLink,
  MoreHorizontal,
  Edit2,
  Trash2,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  tags?: string[];
  source?: string;
  dateAdded?: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  onMessage?: (contact: Contact) => void;
  loading?: boolean;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getContactName(contact: Contact): string {
  if (contact.name) return contact.name;
  if (contact.firstName || contact.lastName) {
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  }
  return contact.email || contact.phone || 'Unknown';
}

function getInitials(contact: Contact): string {
  const name = getContactName(contact);
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const columnHelper = createColumnHelper<Contact>();

export function ContactsTable({
  contacts,
  onView,
  onEdit,
  onDelete,
  onMessage,
  loading = false,
}: ContactsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => getContactName(row), {
        id: 'name',
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Name</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-cyan-500" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5 text-cyan-500" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-30" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const contact = row.original;
          const name = getContactName(contact);
          const initials = getInitials(contact);

          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-xs font-medium">
                {initials}
              </div>
              <div>
                <button
                  className="font-medium text-foreground hover:text-cyan-600 transition-colors text-left"
                  onClick={() => onView?.(contact)}
                >
                  {name}
                </button>
                {contact.source && (
                  <p className="text-xs text-muted-foreground capitalize">
                    via {contact.source}
                  </p>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('email', {
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <Mail className="h-3 w-3" />
            <span>Email</span>
          </button>
        ),
        cell: ({ getValue }) => {
          const email = getValue();
          if (!email) return <span className="text-muted-foreground">—</span>;
          return (
            <a
              href={`mailto:${email}`}
              className="text-foreground hover:text-cyan-600 transition-colors"
            >
              {email}
            </a>
          );
        },
      }),
      columnHelper.accessor('phone', {
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <Phone className="h-3 w-3" />
            <span>Phone</span>
          </button>
        ),
        cell: ({ getValue }) => {
          const phone = getValue();
          if (!phone) return <span className="text-muted-foreground">—</span>;
          return (
            <a
              href={`tel:${phone}`}
              className="text-foreground hover:text-cyan-600 transition-colors font-mono text-sm"
            >
              {phone}
            </a>
          );
        },
      }),
      columnHelper.accessor((row) => `${row.city || ''} ${row.state || ''}`.trim(), {
        id: 'location',
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <MapPin className="h-3 w-3" />
            <span>Location</span>
          </button>
        ),
        cell: ({ row }) => {
          const { city, state } = row.original;
          if (!city && !state) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="text-foreground">
              {[city, state].filter(Boolean).join(', ')}
            </span>
          );
        },
      }),
      columnHelper.accessor('tags', {
        header: () => (
          <span className="inline-flex items-center gap-1 text-xs font-medium">
            <Tag className="h-3 w-3" />
            <span>Tags</span>
          </span>
        ),
        cell: ({ getValue }) => {
          const tags = getValue();
          if (!tags || tags.length === 0) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/20"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor('dateAdded', {
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Added</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-cyan-500" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5 text-cyan-500" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-30" />
            )}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground tabular-nums text-sm">
            {formatDate(getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView?.(contact)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMessage?.(contact)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit?.(contact)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(contact.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [onView, onEdit, onDelete, onMessage]
  );

  const table = useReactTable({
    data: contacts,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9 h-9 bg-background"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-[13px]">
            <thead className="bg-muted/30 [&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-11 px-4 text-left align-middle text-xs font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    Loading contacts...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div
                        style={{
                          padding: '1rem',
                          borderRadius: '50%',
                          background: 'rgba(6, 182, 212, 0.08)',
                          marginBottom: '1rem',
                        }}
                      >
                        <Users size={32} style={{ color: '#06B6D4', opacity: 0.6 }} />
                      </div>
                      <h3 className="text-sm font-medium text-foreground mb-1">
                        {globalFilter ? 'No contacts match your search' : 'No contacts yet'}
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-[240px]">
                        {globalFilter
                          ? 'Try adjusting your search terms'
                          : 'Add your first contact or sync from GoHighLevel to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} contacts
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-background px-3 text-sm"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
