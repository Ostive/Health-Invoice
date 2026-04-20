import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAuditAction } from '@/lib/audit'
import { handleApiError, unauthorized } from '@/lib/api-errors'

const ROUTE = 'api/invoices/[id]'

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const { error } = await supabase
            .from('invoices')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        logAuditAction({
            action: 'DELETE_INVOICE',
            resourceType: 'invoice',
            resourceId: id,
            userId: user.id
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
