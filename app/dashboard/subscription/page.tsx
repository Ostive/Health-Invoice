import { redirect } from 'next/navigation'
import { getUser, getSession } from '@/lib/supabase/server'
import { DashboardClient } from '../DashboardClient'

export default async function SubscriptionPage() {
    const { user } = await getUser()

    if (!user) {
        redirect('/')
    }

    return <DashboardClient initialUser={user} initialView="subscription" />
}
