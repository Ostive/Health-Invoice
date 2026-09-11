'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { buttonClass } from '@/components/ui/button-styles'
import { cn } from '@/lib/cn'
import { NAV_LINKS } from './nav'

export function SiteHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isMenuOpen])

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const closeMenu = () => setIsMenuOpen(false)

    return (
        <>
            <header
                className={cn(
                    'sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200',
                    isScrolled || isMenuOpen ? 'border-rule bg-paper/90 backdrop-blur-md' : 'border-transparent bg-paper/0',
                )}
            >
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
                    <Link href="/" onClick={closeMenu} aria-label="Facturier Soignant, accueil" className="rounded-md">
                        <Logo />
                    </Link>

                    <nav aria-label="Navigation principale" className="hidden items-center gap-1 text-sm text-ink-soft lg:flex">
                        {NAV_LINKS.map(link => (
                            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 transition-colors hover:bg-ink/5 hover:text-ink">
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link href="/connexion" className="hidden rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/5 sm:inline-flex">
                            Connexion
                        </Link>
                        <Link href="/inscription" className={buttonClass({ size: 'sm', className: 'hidden sm:inline-flex' })}>
                            Essayer gratuitement
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(open => !open)}
                            className="-mr-2 rounded-md p-2 text-ink transition-colors hover:bg-ink/5 lg:hidden"
                            aria-label="Menu"
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-paper px-4 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-200 lg:hidden">
                    <nav aria-label="Navigation mobile" className="flex flex-col">
                        {NAV_LINKS.map(link => (
                            <Link key={link.href} href={link.href} onClick={closeMenu} className="flex items-center justify-between border-b border-rule py-4 font-display text-lg font-medium text-ink">
                                {link.label}
                                <svg className="size-5 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto flex flex-col gap-3 pt-8">
                        <Link href="/connexion" onClick={closeMenu} className={buttonClass({ variant: 'outline', size: 'lg' })}>Se connecter</Link>
                        <Link href="/inscription" onClick={closeMenu} className={buttonClass({ size: 'lg' })}>Essayer gratuitement</Link>
                    </div>
                </div>
            )}
        </>
    )
}
