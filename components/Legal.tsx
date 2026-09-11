'use client'

import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { Logo } from './ui/logo';

export type LegalPageType = 'cgu' | 'privacy';

interface LegalProps {
  type: LegalPageType;
  onClose: () => void;
}

export const Legal: React.FC<LegalProps> = ({ type, onClose }) => {
  const isCGU = type === 'cgu';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="legal-title" className="fixed inset-0 z-50 overflow-y-auto bg-paper animate-in fade-in duration-200">
      <header className="sticky top-0 z-10 border-b border-rule bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <Button variant="outline" size="sm" onClick={onClose}>Fermer</Button>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <h1 id="legal-title" className="font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
          {isCGU ? "Conditions générales d'utilisation" : 'Politique de confidentialité'}
        </h1>
        <div className="mt-10 space-y-10 leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_strong]:font-semibold [&_strong]:text-ink">
          {isCGU ? <CGUContent /> : <PrivacyContent />}
        </div>
      </article>

      <div className="border-t border-rule py-8 text-center">
        <Button onClick={onClose}>Retour au site</Button>
      </div>
    </div>
  );
};

const CGUContent = () => (
  <>
    <section>
      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités de mise à disposition des services du site « Facturier Soignant » (ci-après « le Service ») et les conditions d'utilisation du Service par l'utilisateur.
      </p>
    </section>

    <section>
      <h2>2. Description du Service</h2>
      <p>
        Facturier Soignant est une application de démonstration permettant la génération de factures pour les professionnels de santé. L'application utilise l'intelligence artificielle pour faciliter la saisie des données.
      </p>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Avertissement</p>
        <p className="mt-1">
          Cette application est une démonstration technique. Elle ne doit pas être utilisée pour une facturation réelle sans vérification préalable de la conformité légale et fiscale en vigueur dans votre juridiction.
        </p>
      </div>
    </section>

    <section>
      <h2>3. Responsabilité</h2>
      <p>
        L'éditeur du site ne saurait être tenu responsable des erreurs rencontrées sur le site, problèmes techniques, interprétation des informations publiées et conséquences de leur utilisation. L'utilisateur est seul responsable de l'exactitude des factures générées et de leur transmission aux organismes payeurs.
      </p>
    </section>

    <section>
      <h2>4. Propriété intellectuelle</h2>
      <p>
        Tous les éléments du site (textes, images, code informatique) sont protégés par le droit d'auteur. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable.
      </p>
    </section>

    <section>
      <h2>5. Modification des CGU</h2>
      <p>
        L'éditeur se réserve le droit de modifier, à tout moment et sans préavis, les présentes conditions d’utilisation afin de les adapter aux évolutions du site et/ou de son exploitation.
      </p>
    </section>
  </>
);

const PrivacyContent = () => (
  <>
    <section>
      <h2>1. Collecte des données</h2>
      <p>
        Dans le cadre de l'utilisation de l'application, nous sommes amenés à collecter les données suivantes :
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>Adresse email (pour l'authentification)</li>
        <li>Données de facturation saisies (noms des patients, adresses, soins)</li>
        <li>Préférences d'affichage (modèles de facture)</li>
      </ul>
    </section>

    <section>
      <h2>2. Utilisation de l'intelligence artificielle</h2>
      <p>
        Ce service utilise l'API Google Gemini pour analyser les textes saisis et générer des factures.
        Bien que Google applique des politiques de confidentialité strictes, nous recommandons de <strong>ne pas saisir de données de santé sensibles ou identifiables directement</strong> (nom complet et pathologie précise) dans le champ de saisie libre de l'assistant dans cette version de démonstration.
      </p>
    </section>

    <section>
      <h2>3. Stockage des données</h2>
      <p>
        Les données sont hébergées via <strong>Supabase</strong>, une plateforme Backend-as-a-Service sécurisée. Les bases de données sont situées dans l'Union européenne ou dans des juridictions respectant le RGPD.
      </p>
    </section>

    <section>
      <h2>4. Vos droits</h2>
      <p>
        Conformément à la réglementation RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.
        Vous pouvez exercer ces droits ou supprimer votre compte directement depuis l'interface de l'application ou en nous contactant.
      </p>
    </section>

    <section>
      <h2>5. Cookies</h2>
      <p>
        Ce site utilise des cookies techniques nécessaires au fonctionnement de l'authentification (session utilisateur). Aucun cookie publicitaire tiers n'est utilisé.
      </p>
    </section>
  </>
);
