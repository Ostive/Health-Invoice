import 'server-only'
import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { unauthorized } from '@/lib/api-errors'

/**
 * An authenticated request. Every Data Access Layer function takes one, so none of them
 * can run for an anonymous caller, and every query is scoped to `user.id`.
 */
export interface Session {
    supabase: Awaited<ReturnType<typeof createClient>>
    user: User
}

/** Validates the auth cookie with Supabase (not only its signature). Memoised for the current request. */
export const getSession = cache(async (): Promise<Session | null> => {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return error || !user ? null : { supabase, user }
})

/** For Route Handlers: a missing or expired session becomes a 401 */
export async function requireSession(): Promise<Session> {
    const session = await getSession()
    if (!session) throw unauthorized()
    return session
}
