'use client'

import React from 'react';
import { Button } from './ui/button';

interface PricingProps {
  onSubscribe: () => void;
  isLoggedIn?: boolean;
}

export const Pricing: React.FC<PricingProps> = ({ onSubscribe, isLoggedIn }) => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Tarification Simple</h2>
          <p className="text-slate-600 mt-4">Choisissez l'offre adaptée à votre activité.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Découverte</h3>
            <div className="mt-4 flex items-baseline text-slate-900">
              <span className="text-4xl font-bold tracking-tight">0€</span>
              <span className="ml-1 text-xl font-semibold text-slate-500">/mois</span>
            </div>
            <p className="mt-4 text-slate-500">Idéal pour tester l'application.</p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="ml-3 text-slate-600">3 factures / mois</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="ml-3 text-slate-600">Modèles de base</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="ml-3 text-slate-600">IA Générative (Limitée)</span>
              </li>
            </ul>

            <div className="mt-8">
              {isLoggedIn ? (
                <Button variant="outline" className="w-full" disabled>Offre Actuelle</Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={onSubscribe}>Commencer Gratuitement</Button>
              )}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-primary-500 rounded-2xl p-8 shadow-xl bg-white relative">
            <div className="absolute top-0 right-0 -translate-y-1/2 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-4">
              Populaire
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Professionnel</h3>
            <div className="mt-4 flex items-baseline text-slate-900">
              <span className="text-4xl font-bold tracking-tight">29€</span>
              <span className="ml-1 text-xl font-semibold text-slate-500">/mois</span>
            </div>
            <p className="mt-4 text-slate-500">Pour les soignants libéraux actifs.</p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="ml-3 text-slate-900 font-medium">Factures illimitées</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="ml-3 text-slate-900 font-medium">Tous les modèles Premium</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="ml-3 text-slate-900 font-medium">IA Illimitée</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="ml-3 text-slate-900 font-medium">Support Prioritaire</span>
              </li>
            </ul>

            <div className="mt-8">
              <Button className="w-full py-3" onClick={onSubscribe}>Passer en PRO</Button>
              <p className="text-center text-xs text-slate-400 mt-3">Paiement sécurisé via Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};