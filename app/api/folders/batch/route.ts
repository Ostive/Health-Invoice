import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

        // Note: In Supabase/Postgres, if foreign keys are set to SET NULL or CASCADE,
        // deleting the folder will handle the invoices automatically.
        // Assuming standard behavior where invoices just lose their folder association (SET NULL)
        // or we might want to keep them. The user just asked to remove folders.

        const { error } = await supabase
            .from('folders')
            .delete()
            .in('id', ids)
            .eq('user_id', user.id) // Security: Ensure user owns the folders

        if (error) throw error

        return NextResponse.json({ success: true, count: ids.length })

    } catch (error: any) {
        console.error('Error batch deleting folders:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
