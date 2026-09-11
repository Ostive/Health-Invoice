import { Invoice, InvoiceStatus, InvoiceTemplateId } from '../types/index';

/** Converts an invoices row (snake_case columns, decrypted by the Data Access Layer) to the app's Invoice */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapDbRowToInvoice = (row: any): Invoice => {
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
    folderId: row.folder_id || null,
    // The API renames patient_id to patientId; keep both so the link survives a save
    patientId: row.patientId ?? row.patient_id ?? null,
  };
};

/**
 * Builds the body expected by SaveInvoiceSchema (camelCase). The API route maps these
 * fields to the table's snake_case columns; user and timestamps are set server-side.
 */
export const mapInvoiceToPayload = (invoice: Invoice) => ({
  id: invoice.id,
  number: invoice.number,
  date: invoice.date,
  dueDate: invoice.dueDate,
  status: invoice.status,
  template: invoice.template,
  notes: invoice.notes || '',
  client: invoice.client,
  items: invoice.items,
  folderId: invoice.folderId || null,
  patientId: invoice.patientId || null,
});
