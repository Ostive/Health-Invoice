import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAuditAction } from '@/lib/audit'

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { ids } = body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
        }

        const { error } = await supabase
            .from('invoices')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', ids)
            .eq('user_id', user.id) // Security: Ensure user owns the invoices

        if (error) throw error

        // Log Audit Action
        logAuditAction({
            action: 'BATCH_DELETE_INVOICES',
            resourceType: 'invoice',
            userId: user.id,
            details: { count: ids.length, ids }
        });

        return NextResponse.json({ success: true, count: ids.length })

    } catch (error: any) {
        console.error('Error batch deleting invoices:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
