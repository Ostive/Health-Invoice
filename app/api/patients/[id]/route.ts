import { NextResponse } from 'next/server'
import { apiRoute, type IdRouteContext } from '@/lib/api-route'
import { deletePatient, updatePatient } from '@/lib/dal/patients'
import { IdSchema, PatientSchema } from '@/lib/schemas'

const ROUTE = 'api/patients/[id]'

export const PUT = apiRoute<IdRouteContext>(ROUTE, async (session, request, { params }) => {
    const id = IdSchema.parse((await params).id)
    const patient = PatientSchema.parse(await request.json())
    return NextResponse.json(await updatePatient(session, id, patient))
})

export const DELETE = apiRoute<IdRouteContext>(ROUTE, async (session, _request, { params }) => {
    const id = IdSchema.parse((await params).id)
    await deletePatient(session, id)
    return NextResponse.json({ success: true })
})
