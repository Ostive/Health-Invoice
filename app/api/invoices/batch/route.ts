import { NextResponse } from 'next/server'
import { apiRoute } from '@/lib/api-route'
import { deleteInvoices } from '@/lib/dal/invoices'
import { BatchIdsSchema } from '@/lib/schemas'

const ROUTE = 'api/invoices/batch'

export const POST = apiRoute(ROUTE, async (session, request) => {
    const { ids } = BatchIdsSchema.parse(await request.json())
    await deleteInvoices(session, ids)
    return NextResponse.json({ success: true, count: ids.length })
})
