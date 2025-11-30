import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAuditAction } from '@/lib/audit'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase
            .from('invoices')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id) // Security: Ensure user owns the invoice

        if (error) {
            throw error
        }

        // Log Audit Action
        logAuditAction({
            action: 'DELETE_INVOICE',
            resourceType: 'invoice',
            resourceId: id,
            userId: user.id
        });

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting invoice:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
