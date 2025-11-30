import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true })

        if (error) {
            if (error.code === '42P01') {
                return NextResponse.json([])
            }
            throw error
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error fetching folders:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()

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

        // Check for existing folder with same name
        const { data: existing } = await supabase
            .from('folders')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', name)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Un dossier avec ce nom existe déjà' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('folders')
            .insert({ user_id: user.id, name, color: color || 'blue' })
            .select()
            .single()

        if (error) {
            if (error.code === '42P01') {
                return NextResponse.json({ error: "Table 'folders' missing" }, { status: 500 })
            }
            throw error
        }

        return NextResponse.json(data)

    } catch (error: any) {
        console.error('Error creating folder:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
