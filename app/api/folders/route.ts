import { NextResponse } from 'next/server'
import { apiRoute } from '@/lib/api-route'
import { createFolder, listFolders } from '@/lib/dal/folders'
import { FolderSchema } from '@/lib/schemas'

const ROUTE = 'api/folders'

export const GET = apiRoute(ROUTE, async session => NextResponse.json(await listFolders(session)))

export const POST = apiRoute(ROUTE, async (session, request) => {
    const { name, color } = FolderSchema.parse(await request.json())
    return NextResponse.json(await createFolder(session, { name, color }))
})
