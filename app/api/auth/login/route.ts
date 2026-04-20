import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { LoginSchema } from '@/lib/schemas'
import { handleApiError, tooManyRequests } from '@/lib/api-errors'
import { enforceIpRateLimit } from '@/lib/ip-rate-limit'

const ROUTE = 'api/auth/login'

export async function POST(request: Request) {
    try {
        const { allowed, retryAfter } = await enforceIpRateLimit('login', { limit: 10, windowSeconds: 60 })
        if (!allowed) throw tooManyRequests(`Trop de tentatives. Réessayez dans ${retryAfter}s.`)

        const body = await request.json()
        const validation = LoginSchema.safeParse(body)
        if (!validation.success) throw validation.error

        const { email, password } = validation.data

        const supabase = await createClient()
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status || 400 }
            )
        }

        return NextResponse.json({
            success: true,
            user: data.user,
            session: data.session,
        })
    } catch (error) {
        return handleApiError(error, { route: ROUTE })
    }
}
