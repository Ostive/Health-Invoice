'use client'

import React from 'react'
import { Reveal } from './Reveal'
import { Stamp } from '../ui/stamp'

const audiences = [
    {
        title: 'Infirmier·ère libéral·e',
        tag: 'IDEL',
        description: 'Facturation à la tournée, AMI et AIS pré-paramétrés, télétransmission simplifiée.',
        benefits: [
            'Dictée pendant la route, sans toucher au téléphone',
            'Codes NGAP tenus à jour (majorations, dimanche, férié)',
            'Export mensuel pour votre comptable en un clic',
        ],
    },
    {
        title: 'Kinésithérapeute',
        tag: 'Kiné',
        description: 'Séances récurrentes, patients réguliers, carnet de soins numérique.',
        benefits: [
            'Duplication d’une facture en deux secondes',
            'Rappel automatique des séances impayées',
            'Historique complet par patient',
        ],
    },
    {
        title: 'Médecin généraliste',
        tag: 'Médecin',
        description: 'Consultations, actes CCAM et dépassements d’honoraires en toute conformité.',
        benefits: [
            'Codes CCAM proposés automatiquement',
            'Modèles de facture personnalisables (en-tête, tampon)',
            'Acomptes et paiements en plusieurs fois',
        ],
    },
]

export const TargetAudience: React.FC = () => {
    return (
        <section id="for-who" className="scroll-mt-16 py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mb-12 max-w-2xl">
                    <p className="mb-4 text-[13px] font-medium text-primary-600">Pour qui</p>
                    <h2 className="font-display text-3xl font-semibold leading-[1.08] text-ink md:text-[2.5rem]">
                        Réglé pour votre exercice.
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-ink-soft md:text-lg">
                        Chaque profession a ses codes, ses tarifs et son rythme. L’outil est paramétré pour coller à votre quotidien.
                    </p>
                </Reveal>

                <div className="grid gap-5 md:grid-cols-3">
                    {audiences.map((audience, i) => (
                        <Reveal key={audience.tag} delay={i * 110}>
                            <article className="flex h-full flex-col rounded-2xl border border-rule bg-white p-7">
                                <Stamp tone="ink" size="md" rotate={-2} className="self-start">{audience.tag}</Stamp>
                                <h3 className="mt-6 font-display text-xl font-semibold text-ink">{audience.title}</h3>
                                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{audience.description}</p>

                                <ul className="mt-6 space-y-3 border-t border-rule pt-6">
                                    {audience.benefits.map((benefit) => (
                                        <li key={benefit} className="flex items-start gap-3 text-sm text-ink">
                                            <svg className="mt-0.5 size-4 shrink-0 text-vitale-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="leading-relaxed">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
