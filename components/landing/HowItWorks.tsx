'use client'

import React from 'react'
import { Reveal } from './Reveal'

const steps = [
    {
        number: '01',
        title: 'Dictez vos actes',
        description: 'Après une tournée ou entre deux patients, dictez vos actes à voix haute. L\'IA transcrit, structure et associe les codes NGAP ou CCAM.',
        accent: 'from-blue-500 to-indigo-500',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        ),
    },
    {
        number: '02',
        title: 'Vérifiez en un coup d\'œil',
        description: 'La facture est générée avec vos coordonnées, celles du patient et les bons tarifs. Un clic pour ajuster une ligne si besoin.',
        accent: 'from-primary-500 to-cyan-500',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        number: '03',
        title: 'Envoyez & encaissez',
        description: 'Une facture PDF conforme, un lien de paiement sécurisé Stripe, un rappel automatique. Vous suivez tout depuis votre tableau de bord.',
        accent: 'from-emerald-500 to-teal-500',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
]

export const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="py-16 md:py-28 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl opacity-60 -z-0" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <Reveal className="text-center max-w-2xl mx-auto mb-12 md:mb-20">
                    <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest mb-4">Comment ça marche</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4 leading-tight">
                        Trois gestes. <span className="italic text-primary-600/80">Zéro paperasse.</span>
                    </h2>
                    <p className="text-slate-600 text-base md:text-lg">
                        De la tournée au règlement, chaque étape prend quelques secondes. Vous restez concentré sur vos patients.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
                    <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-px bg-gradient-to-r from-blue-300 via-primary-400 to-emerald-400 opacity-40" />

                    {steps.map((step, i) => (
                        <Reveal key={step.number} delay={i * 120}>
                            <div className="relative h-full">
                                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative h-full bg-white rounded-3xl p-8 border border-slate-200/70 shadow-[0_2px_20px_-6px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.15)] hover:-translate-y-1 transition-all duration-500 flex flex-col">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center text-white shadow-lg`}>
                                            {step.icon}
                                        </div>
                                        <span className="text-4xl font-serif text-slate-200 font-bold leading-none">{step.number}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">{step.description}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
