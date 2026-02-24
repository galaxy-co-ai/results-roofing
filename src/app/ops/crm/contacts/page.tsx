'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  X,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Tag,
  Calendar,
} from 'lucide-react';
import { ContactsTable, type Contact } from '@/components/features/ops/crm/ContactsTable';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { OpsPageHeader } from '@/components/ui/ops';
import { useToast } from '@/components/ui/Toast';
import { useOpsContacts, useCreateContact, useDeleteContact, useUpdateContact } from '@/hooks/ops/use-ops-queries';

function getContactName(c: Contact): string {
  if (c.name) return c.name;
  if (c.firstName || c.lastName) return `${c.firstName || ''} ${c.lastName || ''}`.trim();
  return c.email || c.phone || 'Unknown';
}

function formatDate(dateString?: string): string {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ContactsPage() {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const { data: contacts = [], isLoading: loading, error: queryError, refetch } = useOpsContacts();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();
  const updateContact = useUpdateContact();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    source: 'manual',
  });

  // View / Edit dialog state
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
  });

  const error = localError || (queryError ? 'Could not load contacts' : null);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.email && !newContact.phone) return;

    try {
      await createContact.mutateAsync(newContact);
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        source: 'manual',
      });
      setShowAddDialog(false);
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to create contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteContact.mutateAsync(contactId);
    } catch {
      refetch();
    }
  };

  const handleViewContact = (contact: Contact) => {
    setViewContact(contact);
  };

  const handleEditContact = (contact: Contact) => {
    setEditForm({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      city: contact.city || '',
      state: contact.state || '',
    });
    setEditContact(contact);
  };

  const handleSaveEdit = async () => {
    if (!editContact) return;
    try {
      await updateContact.mutateAsync({
        contactId: editContact.id,
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        city: editForm.city || undefined,
        state: editForm.state || undefined,
      });
      showSuccess('Contact updated', `${editForm.firstName} ${editForm.lastName} saved`);
      setEditContact(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update contact';
      if (msg.includes('GHL not configured')) {
        showError('GHL integration required', 'Connect GoHighLevel to edit contacts');
      } else {
        showError('Error', msg);
      }
    }
  };

  const handleMessageContact = (contact: Contact) => {
    router.push(`/ops/inbox?contact=${contact.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <OpsPageHeader title="Contacts" />

        <div className="flex items-center gap-2">
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
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
          >
            <Plus className="mr-2 size-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setLocalError(null)}
              className="ml-4 transition-colors hover:text-[var(--admin-text-primary)]"
            >
              <X className="size-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Contacts Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Contacts</CardTitle>
          <CardDescription>
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactsTable
            contacts={contacts}
            loading={loading}
            onView={handleViewContact}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onMessage={handleMessageContact}
          />
        </CardContent>
      </Card>

      {/* Add Contact Sheet */}
      <Sheet open={showAddDialog} onOpenChange={setShowAddDialog}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Add New Contact</SheetTitle>
            <SheetDescription>
              Add a new lead or customer to your CRM.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleAddContact} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newContact.firstName}
                    onChange={(e) =>
                      setNewContact({ ...newContact, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newContact.lastName}
                    onChange={(e) =>
                      setNewContact({ ...newContact, lastName: e.target.value })
                    }
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newContact.city}
                    onChange={(e) =>
                      setNewContact({ ...newContact, city: e.target.value })
                    }
                    placeholder="Austin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newContact.state}
                    onChange={(e) =>
                      setNewContact({ ...newContact, state: e.target.value })
                    }
                    placeholder="TX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={newContact.source}
                  onValueChange={(value) =>
                    setNewContact({ ...newContact, source: value })
                  }
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContact.isPending || (!newContact.email && !newContact.phone)}
                className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
              >
                {createContact.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Add Contact
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* View Contact Dialog */}
      <Dialog open={!!viewContact} onOpenChange={(open) => !open && setViewContact(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {viewContact && (
            <DialogBody className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium"
                  style={{ background: 'linear-gradient(to bottom right, var(--ops-accent-documents), color-mix(in srgb, var(--ops-accent-documents) 80%, black))' }}
                >
                  {getContactName(viewContact).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{getContactName(viewContact)}</h3>
                  {viewContact.source && (
                    <p className="text-xs text-muted-foreground capitalize">via {viewContact.source}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {viewContact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <a href={`mailto:${viewContact.email}`} className="hover:underline">{viewContact.email}</a>
                  </div>
                )}
                {viewContact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <a href={`tel:${viewContact.phone}`} className="hover:underline font-mono tabular-nums">{viewContact.phone}</a>
                  </div>
                )}
                {(viewContact.city || viewContact.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>{[viewContact.city, viewContact.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {viewContact.tags && viewContact.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {viewContact.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-muted">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {viewContact.dateAdded && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span>Added {formatDate(viewContact.dateAdded)}</span>
                  </div>
                )}
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewContact(null)}>Close</Button>
            {viewContact && (
              <Button onClick={() => { handleEditContact(viewContact); setViewContact(null); }}>
                Edit Contact
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editContact} onOpenChange={(open) => !open && setEditContact(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input
                  value={editForm.firstName}
                  onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input
                  value={editForm.lastName}
                  onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="Smith"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                type="tel"
                value={editForm.phone}
                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={editForm.city}
                  onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Austin"
                />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input
                  value={editForm.state}
                  onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
                  placeholder="TX"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContact(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateContact.isPending}>
              {updateContact.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
