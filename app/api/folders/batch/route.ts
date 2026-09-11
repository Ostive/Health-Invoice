import { NextResponse } from 'next/server'
import { apiRoute } from '@/lib/api-route'
import { deleteFolders } from '@/lib/dal/folders'
import { BatchIdsSchema } from '@/lib/schemas'

const ROUTE = 'api/folders/batch'

export const POST = apiRoute(ROUTE, async (session, request) => {
    const { ids } = BatchIdsSchema.parse(await request.json())
    await deleteFolders(session, ids)
    return NextResponse.json({ success: true, count: ids.length })
})
