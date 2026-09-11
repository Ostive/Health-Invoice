import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { getInvoicePDFTemplate } from '@/lib/pdf-templates'
import { Invoice, UserProfile } from '@/types'
import { checkRateLimit } from '@/lib/rate-limit'
import { PdfRequestSchema } from '@/lib/schemas'
import { decrypt } from '@/lib/encryption'
import { handleApiError, unauthorized, notFound, tooManyRequests, ApiError } from '@/lib/api-errors'

const ROUTE = 'api/generate-pdf'

function decryptInvoice(row: any): Invoice {
    const decrypted = { ...row }
    if (decrypted.client?.ssn) {
        decrypted.client = { ...decrypted.client, ssn: decrypt(decrypted.client.ssn) || decrypted.client.ssn }
    }
    if (decrypted.notes) decrypted.notes = decrypt(decrypted.notes) || decrypted.notes
    if (Array.isArray(decrypted.items)) {
        decrypted.items = decrypted.items.map((item: any) => ({
            ...item,
            description: item.description ? (decrypt(item.description) || item.description) : item.description,
        }))
    }
    return decrypted as Invoice
}

export async function POST(req: NextRequest) {
    let userId: string | undefined

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw unauthorized()
        userId = user.id

        const { success, message } = await checkRateLimit(user.id, 'GENERATE_PDF')
        if (!success) throw tooManyRequests(message ?? 'Rate limit exceeded')

        const body = await req.json()
        const validation = PdfRequestSchema.safeParse(body)
        if (!validation.success) throw validation.error

        const { invoiceId } = validation.data

        // Server-side fetch — client cannot tamper with amounts, number, client name, etc.
        const { data: invoiceRow, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .single()

        if (invoiceError || !invoiceRow) throw notFound('Invoice not found')

        // Use seller_snapshot (frozen at SENT time) if present, else current profile
        let profile: Partial<UserProfile> | null = invoiceRow.seller_snapshot ?? null
        if (!profile) {
            const { data: currentProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            if (profileError || !currentProfile) throw notFound('Profile not found')
            profile = currentProfile
        }

        const invoice = { ...decryptInvoice(invoiceRow), dueDate: invoiceRow.due_date } // templates read dueDate, the row stores due_date

        const pdfDocument = getInvoicePDFTemplate(invoice, profile as Partial<UserProfile>)
        const stream = await renderToStream(pdfDocument)

        const chunks: Buffer[] = []
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk))
        }
        const pdfBuffer = Buffer.concat(chunks)

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new ApiError(500, 'Generated PDF buffer is empty', 'PDF_EMPTY')
        }

        logAuditAction({
            action: 'GENERATE_PDF',
            resourceType: 'invoice',
            resourceId: invoiceId,
            userId: user.id,
        })

        const safeNumber = (invoice.number ?? 'draft').replace(/[^a-zA-Z0-9-]/g, '_')
        const safeClientName = (invoice.client.name || 'Client').replace(/[^a-zA-Z0-9-]/g, '_')
        const filename = `Facture-${safeNumber}-${safeClientName}.pdf`

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
