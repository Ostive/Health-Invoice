import 'server-only'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types'
import type { UserProfileInput } from '@/lib/schemas'
import type { Session } from './session'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

const OPTIONAL_FIELDS = [
    'specialty', 'address', 'phone', 'siret', 'adeli', 'is_vat_applicable',
    'stripe_customer_id', 'cancel_at_period_end', 'current_period_end', 'invoice_counter', 'last_invoice_year',
] as const

/** The profile sent to the browser: display and subscription fields, with the sign-up name as a fallback */
function toProfile(user: User, row: Row | null): UserProfile {
    const optional = Object.fromEntries(OPTIONAL_FIELDS.filter(field => row?.[field] != null).map(field => [field, row![field]]))
    return {
        ...optional,
        id: user.id,
        email: row?.email || user.email || '',
        full_name: row?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
        is_pro: row?.is_pro === true,
    }
}

/** Used when the profile row can't be read: the dashboard still opens */
export const fallbackProfile = (user: User) => toProfile(user, null)

/** The raw row, as frozen into sent invoices (seller snapshot) and read by the PDF templates */
export async function getProfileRow({ supabase, user }: Session): Promise<Row | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (error) throw error
    return data
}

export async function getProfile(session: Session): Promise<UserProfile> {
    return toProfile(session.user, await getProfileRow(session))
}

export async function updateProfile({ supabase, user }: Session, input: UserProfileInput): Promise<UserProfile> {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email, ...input, updated_at: new Date().toISOString() })
        .select()
        .single()
    if (error) throw error
    return toProfile(user, data)
}
