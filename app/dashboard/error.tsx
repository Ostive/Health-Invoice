'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Une erreur est survenue</h2>
            <p className="text-slate-600 mb-6 max-w-md">
                Nous avons rencontré un problème lors du chargement de votre tableau de bord.
                {process.env.NODE_ENV === 'development' && <span className="block mt-2 text-xs font-mono bg-slate-100 p-2 rounded">{error.message}</span>}
            </p>
            <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Recharger la page
                </Button>
                <Button onClick={() => reset()}>
                    Réessayer
                </Button>
            </div>
        </div>
    );
}
