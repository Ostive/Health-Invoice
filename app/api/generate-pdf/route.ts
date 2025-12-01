import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';
import { getInvoicePDFTemplate } from '@/lib/pdf-templates';
import { Invoice, UserProfile } from '@/types';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check Rate Limit
        const { success, message } = await checkRateLimit(user.id, 'GENERATE_PDF');
        if (!success) {
            return NextResponse.json({ error: message }, { status: 429 });
        }

        const { invoice } = await req.json();

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice data is required' }, { status: 400 });
        }

        // Fetch profile directly from database to prevent impersonation
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Get the appropriate template document
        const pdfDocument = getInvoicePDFTemplate(
            invoice as Invoice,
            profile as Partial<UserProfile>
        );




        // Render to stream
        const stream = await renderToStream(pdfDocument);

        // Convert stream to buffer
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);



        // Log Audit Action
        logAuditAction({
            action: 'GENERATE_PDF',
            resourceType: 'invoice',
            userId: user.id
        });

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error("Generated PDF buffer is empty");
        }

        // Generate filename
        const safeNumber = invoice.number.replace(/[^a-zA-Z0-9-]/g, '_');
        const safeClientName = (invoice.client.name || 'Client').replace(/[^a-zA-Z0-9-]/g, '_');
        const filename = `Facture-${safeNumber}-${safeClientName}.pdf`;

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        console.error('Error stack:', error.stack);

        // Extract only the error message, not any objects
        const errorMessage = typeof error === 'string' ? error :
            error?.message ? String(error.message) :
                'Failed to generate PDF';

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
