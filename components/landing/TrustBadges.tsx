'use client'

import React from 'react'
import { Reveal } from './Reveal'

const badges = [
    {
        title: 'HDS',
        subtitle: 'Hébergeur de Données de Santé',
        description: 'Serveurs certifiés ISO 27001 et HDS en France. Vos données de santé ne quittent jamais le territoire.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
    },
    {
        title: 'RGPD',
        subtitle: 'Conforme Règlement Européen',
        description: 'Consentement explicite, droit à l\'oubli, portabilité, export complet. Vous gardez la main sur vos données.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
    },
    {
        title: 'AES-256',
        subtitle: 'Chiffrement bout-en-bout',
        description: 'Numéros de sécurité sociale, notes cliniques et prestations chiffrés avec le standard militaire AES-256-GCM.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
        ),
    },
    {
        title: 'France',
        subtitle: 'Support & équipe basés à Paris',
        description: 'Une équipe française à votre écoute, une facturation en euros, une assistance en moins de 2 heures.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
]

export const TrustBadges: React.FC = () => {
    return (
        <section id="trust" className="py-16 md:py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                    <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest mb-4">Sécurité & conformité</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4 leading-tight">
                        Vos données, <span className="italic text-primary-600/80">notre priorité absolue.</span>
                    </h2>
                    <p className="text-slate-600 text-base md:text-lg">
                        Les données de santé sont parmi les plus sensibles. Nous appliquons les standards les plus stricts, imposés par la loi et par notre conscience professionnelle.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {badges.map((badge, i) => (
                        <Reveal key={badge.title} delay={i * 100}>
                            <div className="h-full bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 border border-slate-200/70 hover:border-primary-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                                <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                    {badge.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{badge.title}</h3>
                                <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-3">{badge.subtitle}</p>
                                <p className="text-sm text-slate-600 leading-relaxed">{badge.description}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
