import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, ApiError } from '@/lib/api-errors'

const ROUTE = 'api/auth/logout'

export async function POST() {
    try {
        const supabase = await createClient()
        const { error } = await supabase.auth.signOut()

        if (error) {
            throw new ApiError(error.status || 400, error.message, 'LOGOUT_FAILED')
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error, { route: ROUTE })
    }
}
