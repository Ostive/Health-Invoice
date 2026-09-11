import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Merriweather, Playfair_Display, Lato } from 'next/font/google'
import { getSession } from '@/lib/dal/session'
import { loadDashboardData } from '@/lib/dal/dashboard'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

// Typefaces used by the invoice templates in the live preview only
const merriweather = Merriweather({
    weight: ['300', '400', '700'],
    subsets: ['latin'],
    variable: '--font-merriweather',
    display: 'swap',
})

const playfair = Playfair_Display({
    weight: ['400', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
})

const lato = Lato({
    weight: ['300', '400', '700'],
    subsets: ['latin'],
    variable: '--font-lato',
    display: 'swap',
})

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // proxy.ts already sends anonymous visitors to /connexion; the layout doesn't rely on it
    const session = await getSession()
    if (!session) redirect('/connexion')

    // Not awaited: the shell streams right away and the client provider waits for the data
    const data = loadDashboardData(session)

    return (
        <div className={`${merriweather.variable} ${playfair.variable} ${lato.variable} contents`}>
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardLayoutClient user={{ id: session.user.id, email: session.user.email ?? '' }} data={data}>
                    {children}
                </DashboardLayoutClient>
            </Suspense>
        </div>
    )
}
