import 'server-only'
import { badRequest, notFound } from '@/lib/api-errors'
import type { Folder } from '@/types'
import type { Session } from './session'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

type FolderFields = { name: string; color: string }

const toFolder = (row: Row): Folder => ({ id: row.id, name: row.name, color: row.color ?? 'blue' })

export async function listFolders({ supabase, user }: Session): Promise<Folder[]> {
    const { data, error } = await supabase
        .from('folders')
        .select('id, name, color')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

    if (error) {
        if (error.code === '42P01') return [] // table not provisioned yet
        throw error
    }
    return data.map(toFolder)
}

/** Folder names are unique per user, ignoring case */
async function assertNameAvailable({ supabase, user }: Session, name: string, exceptId?: string) {
    // ilike is a pattern: escape its wildcards so "50%" only matches "50%"
    let query = supabase.from('folders').select('id').eq('user_id', user.id).ilike('name', name.replace(/[\\%_]/g, '\\$&'))
    if (exceptId) query = query.neq('id', exceptId)
    const { data, error } = await query.limit(1)
    if (error) throw error
    if (data.length) throw badRequest('Un dossier avec ce nom existe déjà')
}

export async function createFolder(session: Session, { name, color }: FolderFields): Promise<Folder> {
    await assertNameAvailable(session, name)
    const { data, error } = await session.supabase
        .from('folders')
        .insert({ user_id: session.user.id, name, color })
        .select()
        .single()
    if (error) throw error
    return toFolder(data)
}

export async function updateFolder(session: Session, id: string, { name, color }: FolderFields): Promise<Folder> {
    await assertNameAvailable(session, name, id)
    const { data, error } = await session.supabase
        .from('folders')
        .update({ name, color })
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select()
        .maybeSingle()
    if (error) throw error
    if (!data) throw notFound('Dossier introuvable')
    return toFolder(data)
}

export async function deleteFolders({ supabase, user }: Session, ids: string[]): Promise<void> {
    const { error } = await supabase.from('folders').delete().in('id', ids).eq('user_id', user.id)
    if (error) throw error
}
