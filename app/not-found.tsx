'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
            <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-2">Page introuvable</h1>
            <h2 className="text-xl font-medium text-slate-600 mb-6">Erreur 404</h2>

            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                Oups ! La page que vous recherchez semble avoir été déplacée, supprimée ou n'a jamais existé.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-500/20">
                        Retour au tableau de bord
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Retour à l'accueil
                    </Button>
                </Link>
            </div>
        </div>
    )
}
