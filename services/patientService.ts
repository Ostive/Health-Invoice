import type { PatientInput } from '@/lib/schemas';
import { api } from './api';

// Browser side of /api/patients (the first load comes from the server render)
export const PatientService = {
    fetchAll: () => api<PatientInput[]>('/api/patients'),

    create: (patient: PatientInput) => api<PatientInput>('/api/patients', { method: 'POST', json: patient }),

    update: (id: string, patient: PatientInput) => api<PatientInput>(`/api/patients/${id}`, { method: 'PUT', json: patient }),

    delete: (id: string) => api<unknown>(`/api/patients/${id}`, { method: 'DELETE' }),
};
