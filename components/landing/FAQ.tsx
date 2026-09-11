'use client'

import React, { useState } from 'react'
import { Reveal } from './Reveal'
import { cn } from '@/lib/cn'

interface FaqItem {
    question: string
    answer: React.ReactNode
    category: 'Sécurité' | 'Tarifs' | 'Utilisation' | 'Conformité' | 'Support'
}

const faqItems: FaqItem[] = [
    {
        category: 'Sécurité',
        question: 'Mes données patients sont-elles vraiment sécurisées ?',
        answer: (
            <>
                Oui. Les numéros de sécurité sociale, les notes cliniques et les descriptions de prestations sont chiffrés en <strong>AES-256-GCM</strong>. Les données sont hébergées en France chez un <strong>hébergeur de données de santé (HDS)</strong> certifié ISO 27001. Vous seul avez accès à vos factures.
            </>
        ),
    },
    {
        category: 'Conformité',
        question: 'L’outil est-il prêt pour la facturation électronique 2026 ?',
        answer: (
            <>
                Oui. Les factures suivent le format <strong>Factur-X</strong> (PDF/A-3 avec XML CII) requis par la réforme de la facturation électronique. Les mentions obligatoires (SIRET, numéro ADELI, TVA…) sont ajoutées automatiquement.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'Quelles professions sont prises en charge ?',
        answer: (
            <>
                Tous les professionnels de santé libéraux : <strong>infirmiers (IDEL), kinésithérapeutes, médecins généralistes et spécialistes, sages-femmes, orthophonistes, ostéopathes, podologues, psychologues…</strong> Les nomenclatures NGAP et CCAM sont pré-paramétrées.
            </>
        ),
    },
    {
        category: 'Tarifs',
        question: 'Puis-je annuler mon abonnement à tout moment ?',
        answer: (
            <>
                Oui, l’offre est <strong>sans engagement</strong>. Vous résiliez en un clic depuis vos paramètres et gardez l’accès jusqu’à la fin de la période payée. Vous pouvez exporter toutes vos factures en PDF avant de partir.
            </>
        ),
    },
    {
        category: 'Tarifs',
        question: 'Puis-je essayer gratuitement ?',
        answer: (
            <>
                Oui. L’<strong>Offre Découverte</strong> est gratuite et ne demande pas de carte bancaire. Passez à l’offre Professionnel quand vous en avez besoin.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'Puis-je importer mes patients et mes factures existants ?',
        answer: (
            <>
                Oui. Importez vos patients par fichier CSV. Pour vos anciennes factures, l’assistant peut extraire les informations de photos ou de PDF afin de récupérer votre historique.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'L’application fonctionne-t-elle sur mobile et tablette ?',
        answer: (
            <>
                Oui. L’interface s’adapte à tous les écrans et la dictée vocale est pensée pour le téléphone : entre deux patients ou dans la voiture après une tournée.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'Comment mes patients me paient-ils ?',
        answer: (
            <>
                Via <strong>Stripe</strong>. Vos patients reçoivent un lien sécurisé et règlent par carte, Apple Pay ou Google Pay. La facture passe automatiquement en « Payée » et l’argent arrive sur votre compte sous 2 à 7 jours ouvrés.
            </>
        ),
    },
    {
        category: 'Conformité',
        question: 'Mes patients peuvent-ils demander la suppression de leurs données ?',
        answer: (
            <>
                Oui, c’est le droit à l’effacement prévu par le RGPD. Supprimez un patient depuis votre tableau de bord : ses données personnelles sont anonymisées, mais les factures émises sont conservées <strong>10 ans</strong> comme l’exige la loi.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'Puis-je personnaliser mes factures ?',
        answer: (
            <>
                Oui. Choisissez parmi <strong>5 modèles</strong> (Moderne, Classique, Minimaliste, Élégant, Corporatif) et ajoutez vos coordonnées, votre numéro ADELI et votre SIRET.
            </>
        ),
    },
    {
        category: 'Support',
        question: 'Comment contacter le support ?',
        answer: (
            <>
                Écrivez-nous à hello@facturier-soignant.fr, du lundi au vendredi de 9 h à 19 h. Nous accompagnons chaque soignant dans sa prise en main.
            </>
        ),
    },
    {
        category: 'Sécurité',
        question: 'Que se passe-t-il si je perds mon téléphone ou mon ordinateur ?',
        answer: (
            <>
                Vos données ne sont pas stockées sur votre appareil, uniquement sur nos serveurs chiffrés. Reconnectez-vous depuis un autre appareil et changez votre mot de passe.
            </>
        ),
    },
]

const categories = ['Toutes', 'Sécurité', 'Tarifs', 'Utilisation', 'Conformité', 'Support'] as const

export const FAQ: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('Toutes')
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const filtered = activeCategory === 'Toutes'
        ? faqItems
        : faqItems.filter(item => item.category === activeCategory)

    return (
        <section id="faq" className="scroll-mt-16 py-20 md:py-28">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <Reveal className="lg:sticky lg:top-28 lg:self-start">
                    <p className="mb-4 text-[13px] font-medium text-primary-600">Questions fréquentes</p>
                    <h2 className="font-display text-3xl font-semibold leading-[1.08] text-ink md:text-[2.5rem]">
                        Vos questions, nos réponses.
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-ink-soft">
                        Vous ne trouvez pas votre réponse ? Écrivez-nous à{' '}
                        <a href="mailto:hello@facturier-soignant.fr" className="font-medium text-primary-600 underline decoration-primary-200 underline-offset-4 hover:decoration-primary-600">
                            hello@facturier-soignant.fr
                        </a>
                    </p>

                    <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrer par thème">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                                aria-pressed={activeCategory === cat}
                                className={cn(
                                    'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                                    activeCategory === cat
                                        ? 'border-ink bg-ink text-white'
                                        : 'border-rule-strong bg-white text-ink-soft hover:border-ink-faint hover:text-ink',
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </Reveal>

                <div className="divide-y divide-rule border-y border-rule">
                    {filtered.map((item, i) => {
                        const isOpen = openIndex === i
                        const panelId = `faq-panel-${activeCategory}-${i}`
                        return (
                            <div key={`${activeCategory}-${i}`}>
                                <h3>
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : i)}
                                        className="flex w-full items-start justify-between gap-6 py-5 text-left"
                                        aria-expanded={isOpen}
                                        aria-controls={panelId}
                                    >
                                        <span className="font-medium text-ink md:text-[17px]">{item.question}</span>
                                        <span
                                            className={cn(
                                                'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-200',
                                                isOpen ? 'rotate-45 border-primary-600 bg-primary-600 text-white' : 'border-rule-strong text-ink-soft',
                                            )}
                                            aria-hidden="true"
                                        >
                                            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2.5" d="M12 5v14M5 12h14" /></svg>
                                        </span>
                                    </button>
                                </h3>
                                <div
                                    id={panelId}
                                    className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
                                >
                                    <div className="overflow-hidden">
                                        <p className="max-w-2xl pb-6 pr-10 leading-relaxed text-ink-soft [&_strong]:font-semibold [&_strong]:text-ink">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
