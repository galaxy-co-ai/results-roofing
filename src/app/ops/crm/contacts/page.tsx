'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
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
import { staggerContainer, fadeInUp } from '@/lib/animation-variants';
import styles from '../../ops.module.css';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
        setShowAddForm(false);
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
      // Refresh on error
      fetchContacts();
    }
  };

  const handleViewContact = (contact: Contact) => {
    // TODO: Open contact detail modal/drawer
    console.log('View contact:', contact);
  };

  const handleEditContact = (contact: Contact) => {
    // TODO: Open edit modal
    console.log('Edit contact:', contact);
  };

  const handleMessageContact = (contact: Contact) => {
    // TODO: Navigate to messaging with contact pre-selected
    console.log('Message contact:', contact);
  };

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer}>
      {/* Header */}
      <motion.header variants={fadeInUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(6, 182, 212, 0.1)' }}
          >
            <Users size={24} style={{ color: '#06B6D4' }} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Contacts</h1>
            <p className={styles.pageDescription}>
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
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            style={{ background: '#06B6D4' }}
          >
            <Plus size={14} />
            Add Contact
          </Button>
        </div>
      </motion.header>

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

      {/* Add Contact Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowAddForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Contact</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    First Name
                  </label>
                  <Input
                    value={newContact.firstName}
                    onChange={(e) =>
                      setNewContact({ ...newContact, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Last Name
                  </label>
                  <Input
                    value={newContact.lastName}
                    onChange={(e) =>
                      setNewContact({ ...newContact, lastName: e.target.value })
                    }
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    City
                  </label>
                  <Input
                    value={newContact.city}
                    onChange={(e) =>
                      setNewContact({ ...newContact, city: e.target.value })
                    }
                    placeholder="Austin"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    State
                  </label>
                  <Input
                    value={newContact.state}
                    onChange={(e) =>
                      setNewContact({ ...newContact, state: e.target.value })
                    }
                    placeholder="TX"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Source
                </label>
                <select
                  value={newContact.source}
                  onChange={(e) =>
                    setNewContact({ ...newContact, source: e.target.value })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAdding || (!newContact.email && !newContact.phone)}
                  style={{ background: '#06B6D4' }}
                >
                  {isAdding && <Loader2 size={14} className="animate-spin mr-1" />}
                  Add Contact
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Contacts Table */}
      <motion.div variants={fadeInUp}>
        <ContactsTable
          contacts={contacts}
          loading={loading}
          onView={handleViewContact}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
          onMessage={handleMessageContact}
        />
      </motion.div>
    </motion.div>
  );
}
