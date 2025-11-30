
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

export const InvoiceService = {

  /**
   * Fetch all invoices for the current user
   */
  async fetchAll(userId: string): Promise<Invoice[]> {
    try {
      const response = await fetch('/api/invoices');

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      const mapped = (data || []).map(mapDbRowToInvoice);
      return mapped;
    } catch (err: any) {
      console.error('[InvoiceService.fetchAll] Caught error:', err);
      return [];
    }
  },

  /**
   * Fetch all folders for the current user
   */

  async fetchFolders(userId: string): Promise<Folder[]> {
    try {
      const response = await fetch('/api/folders');
      if (!response.ok) throw new Error('Failed to fetch folders');
      const data = await response.json();
      return data || [];
    } catch (err: any) {
      console.error('[InvoiceService.fetchFolders] Error:', err);
      return [];
    }
  },

  /**
   * Create a new folder
   */
  async createFolder(userId: string, name: string, color: string = 'blue'): Promise<Folder> {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create folder');
      }
      return data;
    } catch (err: any) {
      console.error('[InvoiceService.createFolder] Error:', err);
      throw err;
    }
  },

  /**
   * Delete multiple folders
   */
  async deleteMultipleFolders(folderIds: string[]): Promise<void> {
    try {
      const response = await fetch('/api/folders/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: folderIds })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete folders');
      }
    } catch (err: any) {
      console.error('[InvoiceService.deleteMultipleFolders] Error:', err);
      throw err;
    }
  },

  /**
   * Delete a folder
   */
  async deleteFolder(folderId: string): Promise<void> {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete folder');
      }
    } catch (err: any) {
      console.error('[InvoiceService.deleteFolder] Error:', err);
      throw err;
    }
  },

  /**
   * Update a folder
   */
  async updateFolder(folderId: string, name: string, color: string): Promise<Folder> {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update folder');
      }
      return data;
    } catch (err: any) {
      console.error('[InvoiceService.updateFolder] Error:', err);
      throw err;
    }
  },

  /**
   * Save an invoice using API
   */
  async save(invoice: Invoice, userId: string): Promise<Invoice> {
    const payload = mapInvoiceToPayload(invoice, userId);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice: payload })
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Failed to save invoice';
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage += `: ${data.errors.join(', ')}`;
        }
        throw new Error(errorMessage);
      }

      if (data.success && data.data) {
        return mapDbRowToInvoice(data.data);
      }

      throw new Error("No data returned from API");

    } catch (err: any) {
      console.error('[InvoiceService.save] Error:', err);
      throw err;
    }
  },

  /**
   * Delete multiple invoices
   */
  async deleteMultiple(invoiceIds: string[]): Promise<void> {
    try {
      const response = await fetch('/api/invoices/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: invoiceIds })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete invoices');
      }
    } catch (err: any) {
      console.error('[InvoiceService.deleteMultiple] Error:', err);
      throw err;
    }
  },

  /**
   * Delete an invoice
   */
  async delete(invoiceId: string): Promise<void> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete invoice');
      }
    } catch (err: any) {
      console.error('[InvoiceService.delete] Error:', err);
      throw err;
    }
  }
};
