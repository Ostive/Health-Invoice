import Link from 'next/link'
import { Stamp } from '@/components/ui/stamp'

export default function NotFound() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4 text-center">
            <Stamp tone="ink" size="lg" rotate={-5}>404</Stamp>

            <h1 className="mt-10 font-display text-2xl font-semibold text-ink">Page introuvable</h1>
            <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
                Le lien est peut-être incomplet, ou la page a été déplacée.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-primary-700">
                    Aller au tableau de bord
                </Link>
                <Link href="/" className="inline-flex items-center justify-center rounded-lg border border-rule-strong bg-white px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-paper">
                    Retour à l’accueil
                </Link>
            </div>
        </div>
    )
}
