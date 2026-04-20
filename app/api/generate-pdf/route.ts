import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { getInvoicePDFTemplate } from '@/lib/pdf-templates'
import { UserProfile } from '@/types'
import { checkRateLimit } from '@/lib/rate-limit'
import { PdfRequestSchema } from '@/lib/schemas'
import { handleApiError, unauthorized, notFound, tooManyRequests, ApiError } from '@/lib/api-errors'

const ROUTE = 'api/generate-pdf'

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

        const invoice = validation.data.invoice

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) throw notFound('Profile not found')

        const pdfDocument = getInvoicePDFTemplate(invoice as any, profile as Partial<UserProfile>)
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
