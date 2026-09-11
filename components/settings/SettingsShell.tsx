'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { buttonClass } from '@/components/ui/button-styles'
import { Icon, IconName } from '@/components/ui/icon'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { cn } from '@/lib/cn'

const SECTIONS: { href: string; label: string; icon: IconName }[] = [
    { href: '/dashboard/parametres', label: 'Profil et coordonnées', icon: 'user' },
    { href: '/dashboard/parametres/abonnement', label: 'Abonnement', icon: 'card' },
    { href: '/dashboard/parametres/securite', label: 'Sécurité et données', icon: 'lock' },
]

/** Header + section navigation shared by every /dashboard/parametres/* page */
export function SettingsShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { refreshProfile } = useDashboard()

    return (
        <div className="flex h-full w-full flex-col">
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-rule bg-white px-3 md:px-6">
                <div className="flex items-center gap-1">
                    <Link href="/dashboard" aria-label="Retour aux factures" className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-paper md:hidden">
                        <Icon name="chevronLeft" className="size-5" />
                    </Link>
                    <h1 className="font-display text-base font-semibold text-ink">Paramètres</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => refreshProfile()} aria-label="Actualiser les informations" title="Actualiser">
                        <Icon name="refresh" />
                    </Button>
                    <Link href="/dashboard" className={buttonClass({ variant: 'outline', size: 'sm', className: 'hidden md:inline-flex' })}>Fermer</Link>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden md:flex-row">
                <nav aria-label="Rubriques des paramètres" className="shrink-0 overflow-x-auto border-b border-rule bg-white scrollbar-none md:w-64 md:overflow-visible md:border-b-0 md:bg-transparent md:py-8">
                    <ul className="flex min-w-max gap-1 p-2 md:min-w-0 md:flex-col md:px-4">
                        {SECTIONS.map(section => {
                            const isActive = pathname === section.href
                            return (
                                <li key={section.href}>
                                    <Link
                                        href={section.href}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={cn(
                                            'flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
                                            isActive ? 'bg-white font-medium text-ink ring-1 ring-rule md:shadow-[0_1px_2px_rgb(25_27_38/0.06)]' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
                                        )}
                                    >
                                        <Icon name={section.icon} className={isActive ? 'text-primary-600' : 'text-ink-faint'} />
                                        {section.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 lg:px-12">
                    <div className="mx-auto max-w-3xl space-y-6 pb-20">{children}</div>
                </div>
            </div>
        </div>
    )
}
