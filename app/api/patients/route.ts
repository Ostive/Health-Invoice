import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { encrypt, decrypt } from '@/lib/encryption'
import { PatientSchema } from '@/lib/schemas'
import { handleApiError, unauthorized } from '@/lib/api-errors'

const ROUTE = 'api/patients'

function decryptPatient(patient: any) {
    const decrypted = { ...patient }
    if (patient.ssn) decrypted.ssn = decrypt(patient.ssn) || patient.ssn
    if (patient.notes) decrypted.notes = decrypt(patient.notes) || patient.notes
    return decrypted
}

export async function GET() {
    const supabase = await createClient()
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true })

        if (error) throw error

        return NextResponse.json((data ?? []).map(decryptPatient))
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const body = await request.json()
        const validation = PatientSchema.safeParse(body)
        if (!validation.success) throw validation.error

        const patientData: any = { ...validation.data }
        if (patientData.ssn) patientData.ssn = encrypt(patientData.ssn)
        if (patientData.notes) patientData.notes = encrypt(patientData.notes)

        const { data, error } = await supabase
            .from('patients')
            .insert({ ...patientData, user_id: user.id })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(decryptPatient(data))
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
