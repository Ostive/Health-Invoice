import { NextResponse } from 'next/server'
import { apiRoute } from '@/lib/api-route'
import { getProfile, updateProfile } from '@/lib/dal/profile'
import { UserProfileSchema } from '@/lib/schemas'

const ROUTE = 'api/profile'

export const GET = apiRoute(ROUTE, async session => NextResponse.json(await getProfile(session)))

export const POST = apiRoute(ROUTE, async (session, request) => {
    const input = UserProfileSchema.parse(await request.json())
    return NextResponse.json(await updateProfile(session, input))
})
