'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Stamp } from '@/components/ui/stamp';

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
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
            <Stamp tone="late" size="md" rotate={-4}>Erreur</Stamp>
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">Le tableau de bord n’a pas pu se charger</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                Vos factures ne sont pas perdues. Réessayez, ou rechargez la page.
                {process.env.NODE_ENV === 'development' && <span className="mt-3 block rounded-lg bg-white p-2 font-mono text-xs ring-1 ring-rule">{error.message}</span>}
            </p>
            <div className="mt-6 flex gap-2">
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
