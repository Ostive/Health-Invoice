import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAuditAction } from '@/lib/audit'
import { BatchIdsSchema } from '@/lib/schemas'
import { handleApiError, unauthorized } from '@/lib/api-errors'

const ROUTE = 'api/invoices/batch'

export async function POST(request: Request) {
    const supabase = await createClient()
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const body = await request.json()
        const validation = BatchIdsSchema.safeParse(body)
        if (!validation.success) throw validation.error

        const { ids } = validation.data

        const { error } = await supabase
            .from('invoices')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', ids)
            .eq('user_id', user.id)

        if (error) throw error

        logAuditAction({
            action: 'BATCH_DELETE_INVOICES',
            resourceType: 'invoice',
            userId: user.id,
            details: { count: ids.length, ids }
        })

        return NextResponse.json({ success: true, count: ids.length })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
