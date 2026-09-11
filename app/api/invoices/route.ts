import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { encrypt, decrypt } from '@/lib/encryption'
import { logAuditAction } from '@/lib/audit'
import { SaveInvoiceSchema } from '@/lib/schemas'
import { InvoiceStatus } from '@/types'
import { handleApiError, unauthorized, forbidden, conflict } from '@/lib/api-errors'

const ROUTE = 'api/invoices'

function decryptInvoiceRow(invoice: any) {
    const decrypted = { ...invoice }

    if (decrypted.client?.ssn) {
        const decryptedSSN = decrypt(decrypted.client.ssn)
        decrypted.client = { ...decrypted.client, ssn: decryptedSSN || decrypted.client.ssn }
    }

    if (decrypted.notes) {
        decrypted.notes = decrypt(decrypted.notes) || decrypted.notes
    }

    if (Array.isArray(decrypted.items)) {
        decrypted.items = decrypted.items.map((item: any) => {
            if (!item?.description) return item
            const decryptedDesc = decrypt(item.description)
            return { ...item, description: decryptedDesc || item.description }
        })
    }

    if (decrypted.patient_id) {
        decrypted.patientId = decrypted.patient_id
        delete decrypted.patient_id
    }

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
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

        if (error) {
            if (error.code === '42P01') return NextResponse.json([])
            throw error
        }

        const decryptedData = (data ?? []).map(decryptInvoiceRow)

        logAuditAction({
            action: 'VIEW_INVOICES',
            resourceType: 'invoice',
            userId: user.id,
            details: { count: decryptedData.length }
        })

        return NextResponse.json(decryptedData)
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
        const validation = SaveInvoiceSchema.safeParse(body)
        if (!validation.success) throw validation.error

        const invoice = validation.data.invoice
        const invoiceToSave: any = { ...invoice }

        if (invoiceToSave.client?.ssn) {
            invoiceToSave.client = { ...invoiceToSave.client, ssn: encrypt(invoiceToSave.client.ssn) }
        }
        if (invoiceToSave.notes) {
            invoiceToSave.notes = encrypt(invoiceToSave.notes)
        }
        if (Array.isArray(invoiceToSave.items)) {
            invoiceToSave.items = invoiceToSave.items.map((item: any) => ({
                ...item,
                description: item.description ? encrypt(item.description) : item.description
            }))
        }

        let existingInvoice: any = null
        let sellerSnapshot = invoice.seller_snapshot

        if (invoice.id) {
            const { data: existing, error: fetchError } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', invoice.id)
                .eq('user_id', user.id)
                .single()

            if (!fetchError && existing) {
                existingInvoice = existing
                if (existing.seller_snapshot) sellerSnapshot = existing.seller_snapshot

                // Once an invoice is PAID, it is fully immutable.
                if (existing.status === InvoiceStatus.PAID) {
                    throw forbidden('Cette facture est payée et ne peut plus être modifiée.')
                }

                // Once SENT, only the status transition SENT → PAID is allowed. All other fields frozen.
                if (existing.status === InvoiceStatus.SENT) {
                    const statusChangedToPaid = invoice.status === InvoiceStatus.PAID
                    const onlyStatusMayChange = statusChangedToPaid

                    if (!onlyStatusMayChange) {
                        throw forbidden('Une facture envoyée ne peut être modifiée que pour être marquée comme payée.')
                    }

                    // Ensure client/items/amounts were not tampered with on the way to PAID
                    const frozen = ['number', 'date', 'dueDate', 'template']
                    for (const field of frozen) {
                        if (JSON.stringify((invoice as any)[field]) !== JSON.stringify(existing[field === 'dueDate' ? 'due_date' : field])) {
                            throw forbidden(`Le champ ${field} ne peut pas être modifié après envoi.`)
                        }
                    }
                    if (JSON.stringify(invoice.client) !== JSON.stringify(existing.client)) {
                        throw forbidden('Le client ne peut pas être modifié après envoi.')
                    }
                    if (JSON.stringify(invoice.items?.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice }))) !==
                        JSON.stringify(existing.items?.map((i: any) => ({ description: decrypt(i.description) || i.description, quantity: i.quantity, unitPrice: i.unitPrice })))) {
                        throw forbidden('Les prestations ne peuvent pas être modifiées après envoi.')
                    }
                }
            }
        }

        if (invoice.status === InvoiceStatus.SENT && !sellerSnapshot) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            if (profile) sellerSnapshot = profile
        }

        // The API speaks camelCase (InvoiceSchema); the table uses snake_case columns
        const { dueDate, folderId, patientId, ...columns } = invoiceToSave
        const payload = {
            ...columns,
            due_date: dueDate,
            folder_id: folderId || null,
            user_id: user.id,
            updated_at: new Date().toISOString(),
            ...(!invoice.id && {
                created_at: new Date().toISOString(),
                number: null
            }),
            patient_id: patientId || null,
            seller_snapshot: sellerSnapshot
        }

        const { data, error } = await supabase
            .from('invoices')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') throw conflict('Invoice number already exists')
            throw error
        }

        logAuditAction({
            action: invoice.id ? 'UPDATE_INVOICE' : 'CREATE_INVOICE',
            resourceType: 'invoice',
            resourceId: data.id,
            userId: user.id,
            details: { invoiceNumber: data.number }
        })

        return NextResponse.json({ data: decryptInvoiceRow(data), success: true })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
