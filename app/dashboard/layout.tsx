import { redirect } from 'next/navigation'
import { getUser, getSession } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Use getUser() for security - it validates the session with Supabase
    const { user } = await getUser()

    if (!user) {
        redirect('/')
    }

    return (
        <DashboardClient initialUser={user}>
            {children}
        </DashboardClient>
    )
}
