import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { apiRoute } from '@/lib/api-route'
import { getInvoiceDocument } from '@/lib/dal/invoices'
import { logAuditAction } from '@/lib/audit'
import { getInvoicePDFTemplate } from '@/lib/pdf-templates'
import { checkRateLimit } from '@/lib/rate-limit'
import { PdfRequestSchema } from '@/lib/schemas'
import { tooManyRequests, ApiError } from '@/lib/api-errors'

const ROUTE = 'api/generate-pdf'

export const POST = apiRoute(ROUTE, async (session, request) => {
    const { success, message } = await checkRateLimit(session.user.id, 'GENERATE_PDF')
    if (!success) throw tooManyRequests(message ?? 'Rate limit exceeded')

    const { invoiceId } = PdfRequestSchema.parse(await request.json())

    // Rendered from the stored invoice: the browser cannot tamper with amounts, number or patient
    const { invoice, seller } = await getInvoiceDocument(session, invoiceId)
    const stream = await renderToStream(getInvoicePDFTemplate(invoice, seller))

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)
    if (pdfBuffer.length === 0) throw new ApiError(500, 'Generated PDF buffer is empty', 'PDF_EMPTY')

    logAuditAction({ action: 'GENERATE_PDF', resourceType: 'invoice', resourceId: invoiceId, userId: session.user.id })

    const safeNumber = (invoice.number ?? 'draft').replace(/[^a-zA-Z0-9-]/g, '_')
    const safeClientName = (invoice.client.name || 'Client').replace(/[^a-zA-Z0-9-]/g, '_')

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Facture-${safeNumber}-${safeClientName}.pdf"`,
            'Content-Length': pdfBuffer.length.toString(),
        },
    })
})
