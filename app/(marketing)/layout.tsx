import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-paper">
            <SiteHeader />
            <main className="grow">{children}</main>
            <SiteFooter />
        </div>
    )
}
