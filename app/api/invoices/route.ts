import { NextResponse } from 'next/server'
import { apiRoute } from '@/lib/api-route'
import { listInvoices, saveInvoice } from '@/lib/dal/invoices'
import { SaveInvoiceSchema } from '@/lib/schemas'

const ROUTE = 'api/invoices'

export const GET = apiRoute(ROUTE, async session => NextResponse.json(await listInvoices(session)))

export const POST = apiRoute(ROUTE, async (session, request) => {
    const { invoice } = SaveInvoiceSchema.parse(await request.json())
    return NextResponse.json(await saveInvoice(session, invoice))
})
