'use client'

import React from 'react'
import { Reveal } from './Reveal'

const badges = [
    {
        title: 'HDS',
        subtitle: 'Hébergeur de données de santé',
        description: 'Serveurs certifiés ISO 27001 et HDS en France. Vos données de santé ne quittent pas le territoire.',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
        title: 'RGPD',
        subtitle: 'Règlement européen',
        description: 'Consentement explicite, droit à l’oubli, portabilité et export complet. Vous gardez la main sur vos données.',
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    {
        title: 'AES-256',
        subtitle: 'Chiffrement des données sensibles',
        description: 'Numéros de sécurité sociale, notes cliniques et prestations sont chiffrés en AES-256-GCM.',
        icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    },
    {
        title: 'France',
        subtitle: 'Équipe et support à Paris',
        description: 'Une équipe française à votre écoute et une facturation en euros.',
        icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
    },
]

export const TrustBadges: React.FC = () => {
    return (
        <section id="trust" className="scroll-mt-16 border-t border-rule bg-white py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mb-12 max-w-2xl">
                    <p className="mb-4 text-[13px] font-medium text-primary-600">Sécurité et conformité</p>
                    <h2 className="font-display text-3xl font-semibold leading-[1.08] text-ink md:text-[2.5rem]">
                        Des données de santé, traitées comme telles.
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-ink-soft md:text-lg">
                        Les données de vos patients sont parmi les plus sensibles qui soient. Nous appliquons les standards imposés par la loi, et un peu plus.
                    </p>
                </Reveal>

                <div className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
                    {badges.map((badge, i) => (
                        <Reveal key={badge.title} delay={i * 80} className="bg-white p-7">
                            <svg className="size-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={badge.icon} />
                            </svg>
                            <h3 className="mt-5 font-display text-lg font-semibold text-ink">{badge.title}</h3>
                            <p className="text-[13px] font-medium text-ink-soft">{badge.subtitle}</p>
                            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{badge.description}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
