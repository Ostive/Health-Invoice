import { NextResponse } from 'next/server'
import { apiRoute } from '@/lib/api-route'
import { createPatient, listPatients } from '@/lib/dal/patients'
import { PatientSchema } from '@/lib/schemas'

const ROUTE = 'api/patients'

export const GET = apiRoute(ROUTE, async session => NextResponse.json(await listPatients(session)))

export const POST = apiRoute(ROUTE, async (session, request) => {
    const patient = PatientSchema.parse(await request.json())
    return NextResponse.json(await createPatient(session, patient))
})
