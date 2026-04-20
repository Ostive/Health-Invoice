import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { encrypt, decrypt } from '@/lib/encryption'
import { PatientSchema } from '@/lib/schemas'
import { handleApiError, unauthorized } from '@/lib/api-errors'

const ROUTE = 'api/patients/[id]'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params
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
            .update({ ...patientData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        const responseData: any = { ...data }
        if (responseData.ssn) responseData.ssn = decrypt(responseData.ssn) || responseData.ssn
        if (responseData.notes) responseData.notes = decrypt(responseData.notes) || responseData.notes

        return NextResponse.json(responseData)
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
