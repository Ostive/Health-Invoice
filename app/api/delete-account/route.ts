import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { handleApiError, unauthorized, ApiError } from '@/lib/api-errors'

const ROUTE = 'api/delete-account'

export async function DELETE() {
    let userId: string | undefined

    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const adminSupabase = createAdminClient()
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id)

        if (deleteError) {
            throw new ApiError(500, 'Failed to delete user', 'DELETE_USER_FAILED', deleteError.message)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
