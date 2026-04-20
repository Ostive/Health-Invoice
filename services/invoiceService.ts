
import { supabase } from './supabase';
import { Invoice, InvoiceStatus, InvoiceTemplateId, Folder } from '../types/index';

// Mapper to convert DB rows to Invoice objects
const mapDbRowToInvoice = (row: any): Invoice => {
  const dbStatus = (row.status as InvoiceStatus) || InvoiceStatus.DRAFT;
  const dueDate = row.due_date || new Date().toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  let computedStatus = dbStatus;
  // Auto-calculate LATE status on fetch
  if (dbStatus !== InvoiceStatus.PAID && dueDate < today) {
    computedStatus = InvoiceStatus.LATE;
  }

  return {
    id: row.id,
    number: row.number,
    date: row.date,
    dueDate: dueDate,
    client: row.client || { name: '', address: '', email: '' },
    items: row.items || [],
    status: computedStatus,
    template: (row.template as InvoiceTemplateId) || 'modern',
    notes: row.notes || '',
    folderId: row.folder_id || null
  };
};

// Map Invoice object to DB Payload
const mapInvoiceToPayload = (invoice: Invoice, userId: string) => {
  return {
    id: invoice.id,
    user_id: userId,
    number: invoice.number,
    date: invoice.date,
    due_date: invoice.dueDate,
    status: invoice.status,
    template: invoice.template,
    notes: invoice.notes || '',
    client: invoice.client,
    items: invoice.items,
    folder_id: invoice.folderId || null,
    updated_at: new Date().toISOString()
  };
};

async function parseError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({} as any));
  let message = body.error || response.statusText || fallback;
  if (Array.isArray(body.errors) && body.errors.length) {
    message += `: ${body.errors.join(', ')}`;
  }
  return message;
}

export const InvoiceService = {

  /**
   * Fetch all invoices for the current user.
   * Returns [] on failure (non-blocking for dashboard load). Callers display their own error UI.
   */
  async fetchAll(userId: string): Promise<Invoice[]> {
    const response = await fetch('/api/invoices');
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []).map(mapDbRowToInvoice);
  },

  /**
   * Fetch all folders for the current user.
   */
  async fetchFolders(userId: string): Promise<Folder[]> {
    const response = await fetch('/api/folders');
    if (!response.ok) return [];
    const data = await response.json();
    return data || [];
  },

  async createFolder(userId: string, name: string, color: string = 'blue'): Promise<Folder> {
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    });
    if (!response.ok) throw new Error(await parseError(response, 'Failed to create folder'));
    return response.json();
  },

  async deleteMultipleFolders(folderIds: string[]): Promise<void> {
    const response = await fetch('/api/folders/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: folderIds })
    });
    if (!response.ok) throw new Error(await parseError(response, 'Failed to delete folders'));
  },

  async deleteFolder(folderId: string): Promise<void> {
    const response = await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(await parseError(response, 'Failed to delete folder'));
  },

  async updateFolder(folderId: string, name: string, color: string): Promise<Folder> {
    const response = await fetch(`/api/folders/${folderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    });
    if (!response.ok) throw new Error(await parseError(response, 'Failed to update folder'));
    return response.json();
  },

  async save(invoice: Invoice, userId: string): Promise<Invoice> {
    const payload = mapInvoiceToPayload(invoice, userId);
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice: payload })
    });

    if (!response.ok) throw new Error(await parseError(response, 'Failed to save invoice'));

    const data = await response.json();
    if (data.success && data.data) return mapDbRowToInvoice(data.data);
    throw new Error('No data returned from API');
  },

  async deleteMultiple(invoiceIds: string[]): Promise<void> {
    const response = await fetch('/api/invoices/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: invoiceIds })
    });
    if (!response.ok) throw new Error(await parseError(response, 'Failed to delete invoices'));
  },

  async delete(invoiceId: string): Promise<void> {
    const response = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(await parseError(response, 'Failed to delete invoice'));
  }
};
