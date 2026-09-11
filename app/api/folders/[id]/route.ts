import { NextResponse } from 'next/server'
import { apiRoute, type IdRouteContext } from '@/lib/api-route'
import { deleteFolders, updateFolder } from '@/lib/dal/folders'
import { FolderUpdateSchema, IdSchema } from '@/lib/schemas'

const ROUTE = 'api/folders/[id]'

export const PUT = apiRoute<IdRouteContext>(ROUTE, async (session, request, { params }) => {
    const id = IdSchema.parse((await params).id)
    const { name, color } = FolderUpdateSchema.parse(await request.json())
    return NextResponse.json(await updateFolder(session, id, { name, color }))
})

export const DELETE = apiRoute<IdRouteContext>(ROUTE, async (session, _request, { params }) => {
    const id = IdSchema.parse((await params).id)
    await deleteFolders(session, [id])
    return NextResponse.json({ success: true })
})
