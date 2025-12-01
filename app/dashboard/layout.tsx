import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'

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
        <DashboardLayoutClient initialUser={user}>
            {children}
        </DashboardLayoutClient>
    )
}
