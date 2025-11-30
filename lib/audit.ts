import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export type AuditAction =
    | 'VIEW_INVOICES'
    | 'CREATE_INVOICE'
    | 'UPDATE_INVOICE'
    | 'DELETE_INVOICE'
    | 'BATCH_DELETE_INVOICES'
    | 'GENERATE_PDF'
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
        const supabase = await createClient();
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        const { error } = await supabase.from('audit_logs').insert({
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
