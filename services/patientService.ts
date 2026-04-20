import { PatientInput } from '@/lib/schemas';

async function parseError(response: Response, fallback: string): Promise<string> {
    const body = await response.json().catch(() => ({} as any));
    let message = body.error || response.statusText || fallback;
    if (Array.isArray(body.errors) && body.errors.length) {
        message += `: ${body.errors.join(', ')}`;
    }
    return message;
}

export const PatientService = {
    async fetchAll(): Promise<PatientInput[]> {
        const res = await fetch('/api/patients');
        if (!res.ok) return [];
        return res.json();
    },

    async create(patient: PatientInput): Promise<PatientInput> {
        const res = await fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        if (!res.ok) throw new Error(await parseError(res, 'Failed to create patient'));
        return res.json();
    },

    async update(id: string, patient: PatientInput): Promise<PatientInput> {
        const res = await fetch(`/api/patients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        if (!res.ok) throw new Error(await parseError(res, 'Failed to update patient'));
        return res.json();
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await parseError(res, 'Failed to delete patient'));
    }
};
