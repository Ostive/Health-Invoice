import type { Invoice, Folder } from '@/types';
import { api } from './api';
import { mapInvoiceToPayload } from './invoiceMapper';

// Browser side of /api/invoices and /api/folders (the first load comes from the server render)
export const InvoiceService = {
  fetchAll: () => api<Invoice[]>('/api/invoices'),

  save: (invoice: Invoice) =>
    api<Invoice>('/api/invoices', { method: 'POST', json: { invoice: mapInvoiceToPayload(invoice) } }),

  delete: (invoiceId: string) => api<unknown>(`/api/invoices/${invoiceId}`, { method: 'DELETE' }),

  deleteMultiple: (ids: string[]) => api<unknown>('/api/invoices/batch', { method: 'POST', json: { ids } }),

  fetchFolders: () => api<Folder[]>('/api/folders'),

  createFolder: (name: string, color = 'blue') => api<Folder>('/api/folders', { method: 'POST', json: { name, color } }),

  updateFolder: (folderId: string, name: string, color: string) =>
    api<Folder>(`/api/folders/${folderId}`, { method: 'PUT', json: { name, color } }),

  deleteFolder: (folderId: string) => api<unknown>(`/api/folders/${folderId}`, { method: 'DELETE' }),

  deleteMultipleFolders: (ids: string[]) => api<unknown>('/api/folders/batch', { method: 'POST', json: { ids } }),
};
