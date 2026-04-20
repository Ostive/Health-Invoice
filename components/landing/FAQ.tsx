'use client'

import React, { useState } from 'react'
import { Reveal } from './Reveal'

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
                Oui. Nous utilisons un chiffrement <strong>AES-256-GCM</strong> (standard militaire) pour les numéros de sécurité sociale, les notes cliniques et les descriptions de prestations. Les données sont hébergées en France chez un <strong>Hébergeur de Données de Santé (HDS)</strong> certifié ISO 27001. Aucune donnée ne quitte le territoire européen, et seul vous avez accès à vos factures.
            </>
        ),
    },
    {
        category: 'Conformité',
        question: 'L\'outil est-il conforme à la facturation électronique 2026 ?',
        answer: (
            <>
                Absolument. Nos factures suivent le format <strong>Factur-X</strong> (PDF/A-3 avec XML CII) requis pour la réforme de facturation électronique entre professionnels en France. Les mentions légales obligatoires (SIRET, numéro ADELI, TVA, etc.) sont automatiquement incluses.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'Suis-je concerné ? Quelles professions supportez-vous ?',
        answer: (
            <>
                Tous les professionnels de santé libéraux : <strong>infirmier·ères (IDEL), kinésithérapeutes, médecins généralistes et spécialistes, sages-femmes, orthophonistes, ostéopathes, podologues, psychologues…</strong> Les nomenclatures NGAP et CCAM sont pré-paramétrées et mises à jour avec la Sécurité sociale.
            </>
        ),
    },
    {
        category: 'Tarifs',
        question: 'Puis-je annuler mon abonnement à tout moment ?',
        answer: (
            <>
                Oui, l'offre est <strong>sans engagement</strong>. Vous pouvez résilier en un clic depuis votre espace personnel. Vous conservez l'accès jusqu'à la fin de la période payée, et vous pouvez exporter toutes vos factures en PDF avant le départ. Aucun frais caché, aucune pénalité.
            </>
        ),
    },
    {
        category: 'Tarifs',
        question: 'Y a-t-il une période d\'essai gratuite ?',
        answer: (
            <>
                Oui, <strong>14 jours d'essai gratuit</strong>, sans carte bancaire requise. Vous accédez à toutes les fonctionnalités (dictée vocale, IA, facturation, paiement Stripe). Si vous ne voulez pas continuer, votre compte est archivé sans aucune facturation.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'Puis-je importer mes patients et factures existants ?',
        answer: (
            <>
                Oui. Vous pouvez importer vos patients par fichier CSV. Pour vos anciennes factures, l'IA peut extraire les informations à partir de photos ou PDF (via Google Gemini) — utile pour récupérer un historique. Notre équipe peut aussi vous assister lors de la migration.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'L\'application fonctionne-t-elle sur mobile et tablette ?',
        answer: (
            <>
                Oui. L'interface est <strong>responsive</strong> et la dictée vocale est optimisée pour smartphone — idéale entre deux patients ou en voiture après une tournée. Les factures se consultent et s'envoient depuis n'importe quel appareil.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'Comment sont gérés les paiements de mes patients ?',
        answer: (
            <>
                Nous intégrons <strong>Stripe</strong>, le leader mondial du paiement en ligne. Vos patients reçoivent un lien sécurisé et règlent en 2 clics par CB, Apple Pay ou Google Pay. Vous êtes notifié instantanément, la facture bascule automatiquement en "Payée", et l'argent arrive sur votre compte sous 2 à 7 jours ouvrés.
            </>
        ),
    },
    {
        category: 'Conformité',
        question: 'Et le RGPD ? Mes patients peuvent-ils demander la suppression de leurs données ?',
        answer: (
            <>
                Oui. Le RGPD prévoit le droit à l'effacement ("droit à l'oubli"). Vous pouvez supprimer un patient depuis votre tableau de bord — ses données personnelles sont anonymisées, mais les factures émises sont conservées <strong>10 ans</strong> comme l'exige la loi fiscale. Vous pouvez aussi exporter l'intégralité des données d'un patient en un clic.
            </>
        ),
    },
    {
        category: 'Utilisation',
        question: 'Puis-je personnaliser le design de mes factures ?',
        answer: (
            <>
                Oui. Nous proposons <strong>5 modèles professionnels</strong> (Moderne, Classique, Minimaliste, Élégant, Corporate). Vous pouvez ajouter votre logo, votre tampon, vos coordonnées, votre numéro ADELI et SIRET. Chaque modèle est pensé pour inspirer confiance à votre patientèle.
            </>
        ),
    },
    {
        category: 'Support',
        question: 'Quel est le délai de réponse du support ?',
        answer: (
            <>
                Notre équipe basée à Paris vous répond <strong>en moins de 2 heures</strong> en journée (9h-19h du lundi au vendredi). Par email à hello@facturier-soignant.fr, ou via le chat intégré. Nous accompagnons personnellement chaque soignant dans sa prise en main.
            </>
        ),
    },
    {
        category: 'Sécurité',
        question: 'Que se passe-t-il si je perds mon téléphone ou mon ordinateur ?',
        answer: (
            <>
                Vos données ne sont jamais stockées sur votre appareil — uniquement sur nos serveurs chiffrés. En cas de perte, vous pouvez vous reconnecter depuis n'importe où. Nous recommandons d'activer un mot de passe fort et la double authentification (à venir). Nous pouvons aussi invalider à distance toute session suspecte.
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
        <section id="faq" className="py-16 md:py-28 bg-gradient-to-b from-slate-50 to-white relative">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal className="text-center mb-10 md:mb-14">
                    <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest mb-4">Questions fréquentes</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4 leading-tight">
                        Tout ce que vous <span className="italic text-primary-600/80">vous demandez.</span>
                    </h2>
                    <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
                        Pas de réponse à votre question ? Écrivez-nous à{' '}
                        <a href="mailto:hello@facturier-soignant.fr" className="text-primary-600 font-medium hover:underline">
                            hello@facturier-soignant.fr
                        </a>
                    </p>
                </Reveal>

                <Reveal delay={100} className="flex flex-wrap justify-center gap-2 mb-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeCategory === cat
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </Reveal>

                <div className="space-y-3">
                    {filtered.map((item, i) => {
                        const isOpen = openIndex === i
                        return (
                            <Reveal key={`${activeCategory}-${i}`} delay={i * 50}>
                                <div
                                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                        isOpen ? 'bg-white border-primary-200 shadow-lg shadow-primary-500/5' : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left"
                                        aria-expanded={isOpen}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                                                {item.category}
                                            </span>
                                            <h3 className="font-bold text-slate-900 text-sm md:text-base">{item.question}</h3>
                                        </div>
                                        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-primary-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div
                                        className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="text-slate-600 leading-relaxed text-sm md:text-base px-5 md:px-6 pb-5 md:pb-6">
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
