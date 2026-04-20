import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { FolderSchema } from '@/lib/schemas'
import { handleApiError, unauthorized, badRequest } from '@/lib/api-errors'

const ROUTE = 'api/folders'

export async function GET() {
    const supabase = await createClient()
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true })

        if (error) {
            if (error.code === '42P01') return NextResponse.json([])
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const body = await request.json()
        const validation = FolderSchema.safeParse(body)
        if (!validation.success) throw validation.error

        const { name, color } = validation.data

        const { data: existing } = await supabase
            .from('folders')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', name)
            .single()

        if (existing) throw badRequest('Un dossier avec ce nom existe déjà')

        const { data, error } = await supabase
            .from('folders')
            .insert({ user_id: user.id, name, color: color || 'blue' })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
