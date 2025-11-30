'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center font-sans">
                    <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/10">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Erreur Critique</h2>

                    <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
                        Une erreur inattendue s'est produite et l'application ne peut pas continuer. Veuillez rafraîchir la page.
                    </p>

                    <button
                        onClick={() => reset()}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                    >
                        Rafraîchir la page
                    </button>
                </div>
            </body>
        </html>
    )
}
