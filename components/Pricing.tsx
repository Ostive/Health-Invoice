'use client'

import React from 'react';
import Link from 'next/link';
import { Button, buttonClass } from './ui/button';
import { Stamp } from './ui/stamp';

interface PricingProps {
  isLoggedIn?: boolean;
}

const Check = ({ className = 'text-vitale-600' }: { className?: string }) => (
  <svg className={`mt-0.5 size-4 shrink-0 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

export const Pricing: React.FC<PricingProps> = ({ isLoggedIn }) => {
  return (
    <section id="pricing" className="scroll-mt-16 border-t border-rule bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 text-[13px] font-medium text-primary-600">Tarifs</p>
          <h2 className="font-display text-3xl font-semibold leading-[1.08] text-ink md:text-[2.5rem]">Un prix simple, sans engagement.</h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft md:text-lg">Commencez gratuitement, passez à l’offre Professionnel quand votre activité le demande.</p>
        </div>

        <div className="grid max-w-4xl gap-5 md:grid-cols-2">
          <article className="flex flex-col rounded-2xl border border-rule bg-paper p-8">
            <h3 className="font-display text-lg font-semibold text-ink">Découverte</h3>
            <p className="mt-1 text-sm text-ink-soft">Pour prendre l’outil en main.</p>
            <p className="mt-6 flex items-baseline gap-1 text-ink">
              <span className="font-display text-5xl font-semibold tabular">0 €</span>
              <span className="text-sm text-ink-soft">/ mois</span>
            </p>

            <ul className="mt-8 space-y-3 border-t border-rule pt-6 text-sm text-ink">
              <li className="flex gap-3"><Check />3 factures par mois</li>
              <li className="flex gap-3"><Check />Modèles de base</li>
              <li className="flex gap-3"><Check />Assistant de dictée (usage limité)</li>
            </ul>

            <div className="mt-auto pt-8">
              {isLoggedIn ? (
                <Button variant="outline" className="w-full" disabled>Votre offre actuelle</Button>
              ) : (
                <Link href="/inscription" className={buttonClass({ variant: 'outline', className: 'w-full' })}>Commencer gratuitement</Link>
              )}
            </div>
          </article>

          <article className="relative flex flex-col rounded-2xl border-2 border-primary-600 bg-white p-8 shadow-sheet">
            <Stamp tone="ink" size="md" rotate={5} className="absolute -top-3.5 right-6 bg-white">Recommandé</Stamp>
            <h3 className="font-display text-lg font-semibold text-ink">Professionnel</h3>
            <p className="mt-1 text-sm text-ink-soft">Pour les soignants libéraux en activité.</p>
            <p className="mt-6 flex items-baseline gap-1 text-ink">
              <span className="font-display text-5xl font-semibold tabular">29 €</span>
              <span className="text-sm text-ink-soft">/ mois</span>
            </p>

            <ul className="mt-8 space-y-3 border-t border-rule pt-6 text-sm text-ink">
              <li className="flex gap-3"><Check className="text-primary-600" /><strong className="font-semibold">Factures illimitées</strong></li>
              <li className="flex gap-3"><Check className="text-primary-600" /><strong className="font-semibold">Dictée et assistant illimités</strong></li>
              <li className="flex gap-3"><Check className="text-primary-600" />Tous les modèles de facture</li>
              <li className="flex gap-3"><Check className="text-primary-600" />Support prioritaire</li>
            </ul>

            <div className="mt-auto pt-8">
              <Link href="/inscription" className={buttonClass({ size: 'lg', className: 'w-full' })}>Passer à l’offre Professionnel</Link>
              <p className="mt-3 text-center text-xs text-ink-faint">Paiement sécurisé par Stripe</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
