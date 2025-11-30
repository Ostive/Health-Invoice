import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
            .from('folders')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id) // Security: Ensure user owns the folder

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting folder:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function PUT(
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

        const body = await request.json()
        const { name, color } = body

        if (!name) {
            return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
        }

        // Check for existing folder with same name (excluding current)
        const { data: existing } = await supabase
            .from('folders')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', name)
            .neq('id', id)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Un dossier avec ce nom existe déjà' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('folders')
            .update({ name, color })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error updating folder:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
