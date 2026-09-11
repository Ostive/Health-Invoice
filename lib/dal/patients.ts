import 'server-only'
import { encrypt, decrypt } from '@/lib/encryption'
import { notFound } from '@/lib/api-errors'
import type { PatientInput } from '@/lib/schemas'
import type { Session } from './session'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

// SSN and notes are stored encrypted
const toPatient = (row: Row): PatientInput => ({
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    address: row.address ?? '',
    ssn: row.ssn ? decrypt(row.ssn) || row.ssn : '',
    notes: row.notes ? decrypt(row.notes) || row.notes : '',
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toColumns = ({ id: _id, ...patient }: PatientInput) => ({
    ...patient,
    ssn: patient.ssn ? encrypt(patient.ssn) : patient.ssn,
    notes: patient.notes ? encrypt(patient.notes) : patient.notes,
})

export async function listPatients({ supabase, user }: Session): Promise<PatientInput[]> {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })
    if (error) throw error
    return data.map(toPatient)
}

export async function createPatient({ supabase, user }: Session, patient: PatientInput): Promise<PatientInput> {
    const { data, error } = await supabase
        .from('patients')
        .insert({ ...toColumns(patient), user_id: user.id })
        .select()
        .single()
    if (error) throw error
    return toPatient(data)
}

export async function updatePatient({ supabase, user }: Session, id: string, patient: PatientInput): Promise<PatientInput> {
    const { data, error } = await supabase
        .from('patients')
        .update({ ...toColumns(patient), updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .maybeSingle()
    if (error) throw error
    if (!data) throw notFound('Patient introuvable')
    return toPatient(data)
}

export async function deletePatient({ supabase, user }: Session, id: string): Promise<void> {
    const { error } = await supabase.from('patients').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
}
