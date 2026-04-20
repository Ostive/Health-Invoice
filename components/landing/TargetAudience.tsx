'use client'

import React from 'react'
import { Reveal } from './Reveal'

const audiences = [
    {
        title: 'Infirmier·ère libéral·e',
        tag: 'IDEL',
        description: 'Facturation à la tournée, AMI et AIS pré-paramétrés, télétransmission simplifiée.',
        benefits: [
            'Dictée pendant la route — sans main sur le téléphone',
            'Codes NGAP tenus à jour (majoration, dimanche, férié)',
            'Export mensuel pour votre comptable en un clic',
        ],
        color: 'bg-blue-50',
        iconBg: 'bg-blue-600',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
    {
        title: 'Kinésithérapeute',
        tag: 'Kiné',
        description: 'Séances récurrentes, patients réguliers, carnet de soin digital.',
        benefits: [
            'Duplication de factures en 2 secondes',
            'Rappel automatique des séances impayées',
            'Historique complet par patient',
        ],
        color: 'bg-emerald-50',
        iconBg: 'bg-emerald-600',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        title: 'Médecin généraliste',
        tag: 'Médecin',
        description: 'Consultations, actes CCAM, dépassements d\'honoraires en toute conformité.',
        benefits: [
            'Codes CCAM proposés automatiquement',
            'Modèles de facture personnalisables (en-tête, tampon)',
            'Gestion des acomptes et paiements en plusieurs fois',
        ],
        color: 'bg-purple-50',
        iconBg: 'bg-purple-600',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
    },
]

export const TargetAudience: React.FC = () => {
    return (
        <section id="for-who" className="py-16 md:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                    <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest mb-4">Pour qui ?</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4 leading-tight">
                        Pensé pour <span className="italic text-primary-600/80">votre réalité de terrain.</span>
                    </h2>
                    <p className="text-slate-600 text-base md:text-lg">
                        Chaque profession a ses codes, ses tarifs, ses cadences. Nous avons paramétré l'outil pour coller à votre quotidien.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {audiences.map((audience, i) => (
                        <Reveal key={audience.tag} delay={i * 120}>
                            <div className={`relative h-full rounded-3xl p-8 border border-slate-200/70 ${audience.color} overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.15)] transition-all duration-500`}>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform duration-700" />

                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-12 h-12 ${audience.iconBg} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                            {audience.icon}
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white">
                                            {audience.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{audience.title}</h3>
                                    <p className="text-slate-700 mb-6 text-sm md:text-base">{audience.description}</p>

                                    <ul className="space-y-3">
                                        {audience.benefits.map((benefit) => (
                                            <li key={benefit} className="flex items-start gap-3 text-sm text-slate-700">
                                                <span className="mt-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                                <span className="leading-relaxed">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
