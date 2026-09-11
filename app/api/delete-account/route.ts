import { NextResponse } from 'next/server'
import { apiRoute } from '@/lib/api-route'
import { deleteAccount } from '@/lib/dal/account'

const ROUTE = 'api/delete-account'

export const DELETE = apiRoute(ROUTE, async session => {
    await deleteAccount(session)
    return NextResponse.json({ success: true })
})
