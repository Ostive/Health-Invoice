import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApiError } from '@/lib/api-errors'
import type { Session } from './session'

/** Deletes the signed-in user's account (Supabase Auth admin API, service role) */
export async function deleteAccount({ user }: Session): Promise<void> {
    const { error } = await createAdminClient().auth.admin.deleteUser(user.id)
    if (error) throw new ApiError(500, 'La suppression du compte a échoué. Réessayez, ou écrivez-nous.', 'DELETE_USER_FAILED', error.message)
}
