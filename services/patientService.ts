import { PatientInput } from '@/lib/schemas';

export const PatientService = {
    async fetchAll(): Promise<PatientInput[]> {
        const res = await fetch('/api/patients');
        if (!res.ok) throw new Error('Failed to fetch patients');
        return res.json();
    },

    async create(patient: PatientInput): Promise<PatientInput> {
        const res = await fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create patient');
        }
        return res.json();
    },

    async update(id: string, patient: PatientInput): Promise<PatientInput> {
        const res = await fetch(`/api/patients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update patient');
        }
        return res.json();
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`/api/patients/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete patient');
    }
};
