import { redirect } from 'next/navigation'
import { Merriweather, Playfair_Display, Lato } from 'next/font/google'
import { getUser } from '@/lib/supabase/server'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'

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
    // Use getUser() for security - it validates the session with Supabase
    const { user } = await getUser()

    if (!user) {
        redirect('/connexion')
    }

    return (
        <div className={`${merriweather.variable} ${playfair.variable} ${lato.variable} contents`}>
            <DashboardLayoutClient initialUser={user}>
                {children}
            </DashboardLayoutClient>
        </div>
    )
}
