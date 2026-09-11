import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Icon } from '@/components/ui/icon'
import { StampedInvoice } from '@/components/brand/StampedInvoice'

const REASSURANCE = ['Données de santé chiffrées', 'Hébergement en France', 'Sans engagement']

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary-950 px-12 py-10 text-white lg:flex">
                <Link href="/" className="self-start rounded-md" aria-label="Facturier Soignant, retour à l’accueil">
                    <Logo tone="light" />
                </Link>

                <div className="mx-auto w-full max-w-md py-12">
                    <h2 className="font-display text-[2rem] font-semibold leading-[1.1]">
                        Dictez la tournée.<br />
                        <span className="text-primary-300">La facture suit.</span>
                    </h2>
                    <p className="mt-4 max-w-sm leading-relaxed text-primary-200">
                        Les actes, leur cotation et vos coordonnées professionnelles sont reportés sur la facture. Il ne vous reste qu’à relire.
                    </p>
                    <StampedInvoice className="mt-12 rotate-[-1.5deg]" />
                </div>

                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-primary-200">
                    {REASSURANCE.map(item => (
                        <li key={item} className="inline-flex items-center gap-2">
                            <Icon name="check" className="text-vitale-500" strokeWidth={2.5} />
                            {item}
                        </li>
                    ))}
                </ul>
            </aside>

            <div className="flex min-h-dvh flex-col bg-paper px-5 py-5 sm:px-10">
                <header className="flex items-center justify-between gap-4">
                    <Link href="/" className="rounded-md lg:invisible" aria-label="Facturier Soignant, retour à l’accueil">
                        <Logo />
                    </Link>
                    <Link href="/" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink">
                        <Icon name="arrowLeft" />Retour au site
                    </Link>
                </header>

                <main className="flex flex-1 items-center justify-center py-10">
                    <div className="w-full max-w-[400px]">{children}</div>
                </main>

                <footer className="text-center text-xs text-ink-faint">
                    Une question ?{' '}
                    <a href="mailto:hello@facturier-soignant.fr" className="underline underline-offset-2 hover:text-ink">hello@facturier-soignant.fr</a>
                </footer>
            </div>
        </div>
    )
}
