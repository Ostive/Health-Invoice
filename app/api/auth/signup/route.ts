import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SignUpSchema } from '@/lib/schemas'
import { handleApiError } from '@/lib/api-errors'

const ROUTE = 'api/auth/signup'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validation = SignUpSchema.safeParse(body)

        if (!validation.success) {
            const missing = Array.from(new Set(validation.error.issues.map(i => i.message)))
            return NextResponse.json(
                { error: `Le mot de passe doit contenir : ${missing.join(', ')}.` },
                { status: 400 }
            )
        }

        const { email, password } = validation.data

        const supabase = await createClient()
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
            },
        })

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
