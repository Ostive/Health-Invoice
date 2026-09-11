'use client';

import { useEffect } from 'react';
import './globals.css';

// Replaces the root layout when it crashes, so it must render its own <html> and <body>
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html lang="fr">
            <body className="bg-paper font-sans text-ink antialiased">
                <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-2xl font-semibold">L’application n’a pas pu démarrer</h1>
                    <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
                        Rechargez la page. Si le problème persiste, écrivez-nous à hello@facturier-soignant.fr.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="mt-8 rounded-lg bg-primary-600 px-6 py-3 text-[15px] font-medium text-white hover:bg-primary-700"
                    >
                        Réessayer
                    </button>
                </div>
            </body>
        </html>
    );
}
