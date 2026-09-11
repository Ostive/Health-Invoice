'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Stamp } from '@/components/ui/stamp'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { manageSubscription, subscribeToPro, reactivateSubscription } from '@/services/stripeService'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { SettingsCard, SettingsHeading } from './SettingsCard'

const FREE_FEATURES = ['3 factures par mois', 'Modèles standards', 'Export PDF', 'Support par email']
const PRO_FEATURES = [
    { text: 'Factures illimitées', bold: true },
    { text: 'Dictée et assistant illimités', bold: true },
    { text: 'Tous les modèles de facture', bold: false },
    { text: 'Support prioritaire', bold: false },
    { text: 'Dossiers illimités', bold: false },
    { text: 'Export comptable', bold: false },
]

const SUBSCRIPTION_FAQ = [
    { q: 'Puis-je annuler à tout moment ?', a: 'Oui. Vous annulez depuis cette page ; l’accès Professionnel reste actif jusqu’à la fin de la période payée.' },
    { q: 'Comment fonctionne le paiement ?', a: 'Le paiement est traité par Stripe. Nous ne stockons aucune donnée bancaire.' },
    { q: 'Où trouver mes factures d’abonnement ?', a: 'Chaque paiement génère une facture envoyée par email. Vous les retrouvez aussi dans « Gérer l’abonnement ».' },
    { q: 'Que comprend la dictée illimitée ?', a: 'Vous dictez et remplissez autant de factures que nécessaire, sans quota journalier.' },
]

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export function SubscriptionSettings() {
    const { profile, refreshProfile, setToast } = useDashboard()
    const [isBusy, setIsBusy] = useState(false)

    const handleSubscriptionAction = async () => {
        if (!profile?.id) return
        if (profile.cancel_at_period_end) {
            setIsBusy(true)
            try {
                await reactivateSubscription(profile.id)
                await refreshProfile()
                setToast({ message: 'Abonnement réactivé', type: 'success' })
            } catch (err) {
                setToast({ message: "L'abonnement n'a pas pu être réactivé : " + errorMessage(err), type: 'error' })
            } finally {
                setIsBusy(false)
            }
        } else {
            manageSubscription(profile.id)
        }
    }

    return (
        <div className="space-y-6">
            <SettingsHeading title="Abonnement" description="Votre offre actuelle et vos options." />

            {!profile?.is_pro && profile?.stripe_customer_id && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <Icon name="alert" className="mt-0.5 size-5 text-amber-600" />
                    <div>
                        <h3 className="text-sm font-semibold text-amber-900">Votre abonnement Professionnel est terminé</h3>
                        <p className="mt-1 text-sm text-amber-800">Réabonnez-vous pour retrouver les factures illimitées. Votre historique est conservé.</p>
                    </div>
                </div>
            )}

            {profile?.is_pro && (
                <SettingsCard>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-display text-lg font-semibold text-ink">Offre Professionnel</h3>
                                {profile.cancel_at_period_end
                                    ? <Stamp tone="late" rotate={-2}>Se termine</Stamp>
                                    : <Stamp tone="paid" rotate={-2}>Active</Stamp>}
                            </div>
                            <p className="mt-2 text-sm text-ink-soft">
                                {profile.current_period_end
                                    ? <>{profile.cancel_at_period_end ? 'Accès jusqu’au ' : 'Prochain renouvellement le '}<strong className="font-medium text-ink">{formatDate(profile.current_period_end)}</strong></>
                                    : profile.cancel_at_period_end ? 'Annulation programmée à la fin de la période en cours.' : 'Renouvellement mensuel.'}
                            </p>
                            <p className="mt-1 font-mono text-[13px] text-ink-soft">29,00 € / mois</p>
                        </div>
                        <Button onClick={handleSubscriptionAction} variant="outline" isLoading={isBusy} className="md:w-auto">
                            {profile.cancel_at_period_end ? 'Réactiver l’abonnement' : 'Gérer l’abonnement'}
                        </Button>
                    </div>
                </SettingsCard>
            )}

            <div className="grid items-stretch gap-4 md:grid-cols-2">
                <article className="flex flex-col rounded-2xl border border-rule bg-paper p-6">
                    <h3 className="font-display text-lg font-semibold text-ink">Découverte</h3>
                    <p className="mt-1 text-sm text-ink-soft">Pour prendre l’outil en main.</p>
                    <p className="mt-5 flex items-baseline gap-1"><span className="font-display text-4xl font-semibold tabular text-ink">0 €</span><span className="text-sm text-ink-soft">/ mois</span></p>
                    <ul className="mt-6 space-y-2.5 border-t border-rule pt-5 text-sm text-ink">
                        {FREE_FEATURES.map(feature => (
                            <li key={feature} className="flex gap-2.5"><Icon name="check" className="mt-0.5 text-ink-faint" strokeWidth={2.5} />{feature}</li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-6">
                        <Button variant="outline" className="w-full" disabled>{profile?.is_pro ? 'Incluse' : 'Votre offre actuelle'}</Button>
                    </div>
                </article>

                <article className={cn('relative flex flex-col rounded-2xl border-2 bg-white p-6', profile?.is_pro ? 'border-vitale-600' : 'border-primary-600 shadow-sheet')}>
                    {!profile?.is_pro && <Stamp tone="ink" size="md" rotate={5} className="absolute -top-3.5 right-5 bg-white">Recommandé</Stamp>}
                    <h3 className="font-display text-lg font-semibold text-ink">Professionnel</h3>
                    <p className="mt-1 text-sm text-ink-soft">Pour les soignants en activité.</p>
                    <p className="mt-5 flex items-baseline gap-1"><span className="font-display text-4xl font-semibold tabular text-ink">29 €</span><span className="text-sm text-ink-soft">/ mois</span></p>
                    <ul className="mt-6 space-y-2.5 border-t border-rule pt-5 text-sm text-ink">
                        {PRO_FEATURES.map(feature => (
                            <li key={feature.text} className="flex gap-2.5">
                                <Icon name="check" className={cn('mt-0.5', profile?.is_pro ? 'text-vitale-600' : 'text-primary-600')} strokeWidth={2.5} />
                                <span className={feature.bold ? 'font-semibold' : undefined}>{feature.text}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-6">
                        {profile?.is_pro ? (
                            <p className="flex items-center justify-center gap-2 rounded-lg bg-vitale-50 py-2.5 text-sm font-medium text-vitale-700">
                                <Icon name="check" strokeWidth={2.5} />Votre offre actuelle
                            </p>
                        ) : (
                            <>
                                <Button onClick={() => profile?.id && subscribeToPro(profile.id, profile?.email)} className="w-full" size="lg" disabled={isBusy}>
                                    Passer à l’offre Professionnel
                                </Button>
                                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
                                    <Icon name="lock" className="size-3" />Paiement sécurisé par Stripe
                                </p>
                            </>
                        )}
                    </div>
                </article>
            </div>

            <section className="pt-6">
                <h3 className="mb-5 font-display text-[15px] font-semibold text-ink">Questions fréquentes</h3>
                <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                    {SUBSCRIPTION_FAQ.map(item => (
                        <div key={item.q}>
                            <dt className="text-sm font-medium text-ink">{item.q}</dt>
                            <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.a}</dd>
                        </div>
                    ))}
                </dl>
            </section>
        </div>
    )
}
