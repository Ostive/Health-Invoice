import { SaveInvoiceSchema } from '@/lib/schemas';
import { mapDbRowToInvoice, mapInvoiceToPayload } from '@/services/invoiceMapper';
import { InvoiceStatus } from '@/types';

// An invoices row as read by the Data Access Layer: snake_case columns (patientId as older API responses sent it)
const row = {
    id: '6f1c2b8e-3c1e-4a51-9a3b-1d2e3f4a5b6c',
    number: 'FAC-2026-00005',
    date: '2026-09-11',
    due_date: '2026-10-11',
    status: InvoiceStatus.DRAFT,
    template: 'modern',
    client: { name: 'Jeanne Lefèvre', address: '4 place Sathonay', email: '', ssn: '' },
    items: [
        // Invoices created before this fix used timestamp line ids
        { id: '1757000000000', description: 'AMI 4 — Pansement complexe', quantity: 1, unitPrice: 12.6 },
        { id: 'b3f9e2a4-7c1d-4e8f-9a2b-3c4d5e6f7a8b', description: 'IFD — Indemnité de déplacement', quantity: 1, unitPrice: 2.75 },
    ],
    notes: '',
    folder_id: '0d9e8f7a-6b5c-4d3e-8f2a-1b0c9d8e7f6a',
    patientId: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
};

describe('Contrat de sauvegarde des factures', () => {
    it('le payload envoyé par le client passe la validation du serveur', () => {
        const payload = mapInvoiceToPayload(mapDbRowToInvoice(row));
        const result = SaveInvoiceSchema.safeParse({ invoice: payload });
        expect(result.success).toBe(true);
    });

    it('conserve l’échéance, le dossier et le patient', () => {
        const payload = mapInvoiceToPayload(mapDbRowToInvoice(row));
        expect(payload).toMatchObject({ dueDate: '2026-10-11', folderId: row.folder_id, patientId: row.patientId });
    });

    it('lit aussi la colonne patient_id brute', () => {
        const { patientId, ...rawRow } = row;
        expect(mapDbRowToInvoice({ ...rawRow, patient_id: patientId }).patientId).toBe(patientId);
    });
});
