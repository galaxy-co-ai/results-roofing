'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  RefreshCw,
  AlertCircle,
  X,
  Loader2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    source: 'manual',
  });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ops/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch {
      setError('Could not load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.email && !newContact.phone) return;

    setIsAdding(true);

    try {
      const response = await fetch('/api/ops/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });

      if (response.ok) {
        const { contact } = await response.json();
        setContacts((prev) => [contact, ...prev]);
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
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create contact');
      }
    } catch {
      setError('Failed to create contact');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/ops/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
      }
    } catch {
      fetchContacts();
    }
  };

  const handleViewContact = (_contact: Contact) => {
    // TODO: Open contact detail modal/drawer
  };

  const handleEditContact = (_contact: Contact) => {
    // TODO: Open edit modal
  };

  const handleMessageContact = (_contact: Contact) => {
    // TODO: Navigate to messaging with contact pre-selected
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-500/10 p-2">
            <Users className="size-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your leads and customers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContacts}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="bg-cyan-600 hover:bg-cyan-700"
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
            <button onClick={() => setError(null)} className="ml-4">
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

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new lead or customer to your CRM.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddContact} className="space-y-4">
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

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding || (!newContact.email && !newContact.phone)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isAdding && <Loader2 className="mr-2 size-4 animate-spin" />}
                Add Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
