import { createClient } from '@/lib/supabase/server';
import { AuditAction } from './audit';

interface RateLimitConfig {
    limit: number;
    windowSeconds: number;
}

const RATE_LIMITS: Partial<Record<AuditAction, RateLimitConfig>> = {
    'GENERATE_INVOICE_AI': { limit: 10, windowSeconds: 60 }, // 10 requests per minute
    'GENERATE_PDF': { limit: 20, windowSeconds: 60 },        // 20 requests per minute
};

export async function checkRateLimit(userId: string, action: AuditAction): Promise<{ success: boolean; message?: string }> {
    const config = RATE_LIMITS[action];
    if (!config) return { success: true };

    const supabase = await createClient();
    const windowStart = new Date(Date.now() - config.windowSeconds * 1000).toISOString();

    const { count, error } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', action)
        .gte('created_at', windowStart);

    if (error) {
        console.error('Rate limit check failed:', error);
        // Fail open (allow request) if DB check fails, to avoid blocking users due to system errors
        return { success: true };
    }

    if (count !== null && count >= config.limit) {
        return {
            success: false,
            message: `Rate limit exceeded. Maximum ${config.limit} requests per ${config.windowSeconds} seconds.`
        };
    }

    return { success: true };
}
