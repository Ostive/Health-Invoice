import { NextResponse } from 'next/server'
import { apiRoute, type IdRouteContext } from '@/lib/api-route'
import { deleteInvoices } from '@/lib/dal/invoices'
import { IdSchema } from '@/lib/schemas'

const ROUTE = 'api/invoices/[id]'

export const DELETE = apiRoute<IdRouteContext>(ROUTE, async (session, _request, { params }) => {
    const id = IdSchema.parse((await params).id)
    await deleteInvoices(session, [id])
    return NextResponse.json({ success: true })
})
