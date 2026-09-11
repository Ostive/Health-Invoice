import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { NAV_LINKS } from './nav'

const LEGAL_LINKS = [
    { href: '/cgu', label: 'Conditions d’utilisation' },
    { href: '/confidentialite', label: 'Confidentialité' },
    { href: '/cgu', label: 'Mentions légales' },
]

export function SiteFooter() {
    return (
        <footer className="bg-ink py-14 text-white/60">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
                    <div>
                        <Logo tone="light" />
                        <p className="mt-5 max-w-xs text-sm leading-relaxed">
                            La facturation des soignants indépendants, sans paperasse. Moins d’écran, plus de temps pour vos patients.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-4 text-sm font-semibold text-white">Produit</h2>
                        <ul className="space-y-2.5 text-sm">
                            {NAV_LINKS.map(link => (
                                <li key={link.href}><Link href={link.href} className="transition-colors hover:text-white">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-4 text-sm font-semibold text-white">Légal</h2>
                        <ul className="space-y-2.5 text-sm">
                            {LEGAL_LINKS.map(link => (
                                <li key={link.label}><Link href={link.href} className="transition-colors hover:text-white">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-4 text-sm font-semibold text-white">Nous écrire</h2>
                        <p className="mb-3 text-sm">Une question sur l’outil ou votre compte ?</p>
                        <a href="mailto:hello@facturier-soignant.fr" className="inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white">
                            hello@facturier-soignant.fr
                        </a>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-6 text-[13px]">
                    <p>&copy; {new Date().getFullYear()} Facturier Soignant. Fait à Paris.</p>
                </div>
            </div>
        </footer>
    )
}
