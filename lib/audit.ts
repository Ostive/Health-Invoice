import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export type AuditAction =
    | 'VIEW_INVOICES'
    | 'CREATE_INVOICE'
    | 'UPDATE_INVOICE'
    | 'DELETE_INVOICE'
    | 'BATCH_DELETE_INVOICES'
    | 'GENERATE_PDF'
    | 'GENERATE_INVOICE_AI'
    | 'EXPORT_DATA';

export type ResourceType = 'invoice' | 'folder' | 'user' | 'subscription';

interface LogAuditParams {
    action: AuditAction;
    resourceType: ResourceType;
    resourceId?: string;
    details?: any;
    userId: string;
}

export async function logAuditAction({
    action,
    resourceType,
    resourceId,
    details,
    userId,
}: LogAuditParams) {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        // Use service role key to bypass RLS and ensure integrity
        // This prevents users from spoofing logs via client-side calls
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabaseAdmin.from('audit_logs').insert({
            user_id: userId,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            details,
            ip_address: ip,
            user_agent: userAgent,
        });

        if (error) {
            console.error('Failed to log audit action:', error);
        }
    } catch (error) {
        console.error('Error in logAuditAction:', error);
    }
}
