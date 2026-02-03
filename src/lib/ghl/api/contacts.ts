/**
 * GoHighLevel Contacts API
 * Endpoints for managing contacts
 */

import { getGHLClient } from '../client';

export interface GHLContact {
  id: string;
  locationId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  dnd?: boolean;
  dndSettings?: {
    email?: { status: 'active' | 'inactive' };
    sms?: { status: 'active' | 'inactive' };
    call?: { status: 'active' | 'inactive' };
  };
  tags?: string[];
  source?: string;
  dateOfBirth?: string;
  website?: string;
  customFields?: Array<{
    id: string;
    key?: string;
    fieldValue?: string | string[] | number | boolean;
  }>;
  dateAdded?: string;
  dateUpdated?: string;
  assignedTo?: string;
  followers?: string[];
}

export interface CreateContactInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  dnd?: boolean;
  tags?: string[];
  source?: string;
  customFields?: Array<{
    id: string;
    fieldValue: string | string[] | number | boolean;
  }>;
  assignedTo?: string;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
}

export interface ContactSearchParams {
  query?: string;
  limit?: number;
  skip?: number;
  startAfter?: string;
  startAfterId?: string;
}

export interface ContactsListResponse {
  contacts: GHLContact[];
  meta?: {
    total?: number;
    startAfterId?: string;
    startAfter?: number;
  };
}

/**
 * List all contacts with optional filtering
 */
export async function listContacts(params: ContactSearchParams = {}): Promise<ContactsListResponse> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  const response = await client.get<ContactsListResponse>(`/contacts/`, {
    locationId,
    query: params.query,
    limit: params.limit ?? 20,
    skip: params.skip,
    startAfter: params.startAfter,
    startAfterId: params.startAfterId,
  });

  return response.data;
}

/**
 * Get a single contact by ID
 */
export async function getContact(contactId: string): Promise<GHLContact> {
  const client = getGHLClient();

  const response = await client.get<{ contact: GHLContact }>(`/contacts/${contactId}`);
  return response.data.contact;
}

/**
 * Search contacts
 */
export async function searchContacts(
  query: string,
  params: Omit<ContactSearchParams, 'query'> = {}
): Promise<ContactsListResponse> {
  return listContacts({ ...params, query });
}

/**
 * Create a new contact
 */
export async function createContact(input: CreateContactInput): Promise<GHLContact> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  const response = await client.post<{ contact: GHLContact }>('/contacts/', {
    ...input,
    locationId,
  });

  return response.data.contact;
}

/**
 * Update an existing contact
 */
export async function updateContact(input: UpdateContactInput): Promise<GHLContact> {
  const client = getGHLClient();
  const { id, ...data } = input;

  const response = await client.put<{ contact: GHLContact }>(`/contacts/${id}`, data);
  return response.data.contact;
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: string): Promise<{ succeded: boolean }> {
  const client = getGHLClient();

  const response = await client.delete<{ succeded: boolean }>(`/contacts/${contactId}`);
  return response.data;
}

/**
 * Add tags to a contact
 */
export async function addContactTags(contactId: string, tags: string[]): Promise<GHLContact> {
  const client = getGHLClient();

  const response = await client.post<{ contact: GHLContact }>(`/contacts/${contactId}/tags`, {
    tags,
  });

  return response.data.contact;
}

/**
 * Remove a tag from a contact
 */
export async function removeContactTag(contactId: string, tag: string): Promise<GHLContact> {
  const client = getGHLClient();

  // DELETE with body requires using the raw request method
  const response = await client.request<{ contact: GHLContact }>(`/contacts/${contactId}/tags`, {
    method: 'DELETE',
    body: { tags: [tag] },
  });

  return response.data.contact;
}

/**
 * Get contact by email or phone (upsert lookup)
 */
export async function lookupContact(params: {
  email?: string;
  phone?: string;
}): Promise<GHLContact | null> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  try {
    const response = await client.get<{ contacts: GHLContact[] }>('/contacts/lookup', {
      locationId,
      email: params.email,
      phone: params.phone,
    });

    return response.data.contacts[0] || null;
  } catch {
    // Return null if not found
    return null;
  }
}

/**
 * Upsert contact - create if not exists, update if found
 */
export async function upsertContact(input: CreateContactInput): Promise<GHLContact> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  const response = await client.post<{ contact: GHLContact }>('/contacts/upsert', {
    ...input,
    locationId,
  });

  return response.data.contact;
}
