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

        const { full_name, specialty, address, phone, siret, adeli } = body

        // Prepare payload with allowed fields only
        const payload = {
            id: user.id,
            email: user.email,
            full_name,
            specialty,
            address,
            phone,
            siret,
            adeli,
            updated_at: new Date().toISOString()
        }


        const { data, error } = await supabase
            .from('profiles')
            .upsert(payload)
            .select()



        if (error) {
            throw error
        }

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error('Error saving profile:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            // Return null if not found, let client handle defaults
            if (error.code === 'PGRST116') {
                return NextResponse.json(null)
            }
            throw error
        }

        return NextResponse.json(data)

    } catch (error: any) {
        console.error('Error fetching profile:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
