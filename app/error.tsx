'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/10 animate-in zoom-in duration-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-3">Oups ! Une erreur est survenue</h2>

            <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
                Ne vous inquiétez pas, c'est probablement temporaire. Nous avons été notifiés du problème.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => reset()} size="lg" className="shadow-lg shadow-primary-500/20">
                    Réessayer
                </Button>
                <Button onClick={() => window.location.href = '/dashboard'} variant="outline" size="lg">
                    Retour au tableau de bord
                </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 p-4 bg-red-50 border border-red-100 rounded-lg max-w-2xl w-full text-left overflow-auto max-h-64">
                    <p className="text-xs font-bold text-red-800 mb-2 uppercase tracking-wider">Détails de l'erreur (Dev only)</p>
                    <pre className="text-xs text-red-600 font-mono whitespace-pre-wrap">{error.message}</pre>
                    {error.digest && <p className="text-xs text-red-400 mt-2">Digest: {error.digest}</p>}
                </div>
            )}
        </div>
    )
}
