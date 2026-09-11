'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Stamp } from '@/components/ui/stamp'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4 text-center">
            <Stamp tone="late" size="lg" rotate={-6}>Erreur</Stamp>

            <h1 className="mt-10 font-display text-2xl font-semibold text-ink">Cette page n’a pas pu s’afficher</h1>
            <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
                Un problème technique a interrompu le chargement. Réessayez ; si le problème persiste, écrivez-nous à hello@facturier-soignant.fr.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => reset()} size="lg">Réessayer</Button>
                <Button onClick={() => { window.location.href = '/dashboard' }} variant="outline" size="lg">
                    Aller au tableau de bord
                </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 max-h-64 w-full max-w-2xl overflow-auto rounded-xl border border-red-200 bg-white p-4 text-left">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-800">Détails (développement)</p>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-red-700">{error.message}</pre>
                    {error.digest && <p className="mt-2 font-mono text-xs text-ink-faint">Digest : {error.digest}</p>}
                </div>
            )}
        </div>
    )
}
