import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { UserProfileSchema } from '@/lib/schemas'
import { handleApiError, unauthorized } from '@/lib/api-errors'

const ROUTE = 'api/profile'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    const supabase = await createClient()
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const body = await request.json()
        const validation = UserProfileSchema.safeParse(body)
        if (!validation.success) throw validation.error

        const payload = {
            id: user.id,
            email: user.email,
            ...validation.data,
            updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from('profiles')
            .upsert(payload)
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}

export async function GET() {
    const supabase = await createClient()
    let userId: string | undefined

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json(null)
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
