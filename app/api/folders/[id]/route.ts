import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { FolderUpdateSchema } from '@/lib/schemas'
import { handleApiError, unauthorized, badRequest } from '@/lib/api-errors'

const ROUTE = 'api/folders/[id]'

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
            .from('folders')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const body = await request.json()
        const validation = FolderUpdateSchema.safeParse(body)
        if (!validation.success) throw validation.error

        const { name, color } = validation.data

        const { data: existing } = await supabase
            .from('folders')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', name)
            .neq('id', id)
            .single()

        if (existing) throw badRequest('Un dossier avec ce nom existe déjà')

        const { data, error } = await supabase
            .from('folders')
            .update({ name, color })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
