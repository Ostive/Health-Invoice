
import { Invoice, Folder } from '../types/index';
import { mapDbRowToInvoice, mapInvoiceToPayload } from './invoiceMapper';

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
    const payload = mapInvoiceToPayload(invoice);
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
