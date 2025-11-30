'use client'

import React from 'react';
import { Button } from './ui/button';

export type LegalPageType = 'cgu' | 'privacy';

interface LegalProps {
  type: LegalPageType;
  onClose: () => void;
}

export const Legal: React.FC<LegalProps> = ({ type, onClose }) => {
  const isCGU = type === 'cgu';

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-4 flex justify-between items-center max-w-5xl mx-auto w-full">
        <h1 className="text-xl font-bold text-slate-900">
          {isCGU ? "Conditions Générales d'Utilisation" : "Politique de Confidentialité"}
        </h1>
        <Button variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 text-slate-700 space-y-8 leading-relaxed">
        {isCGU ? <CGUContent /> : <PrivacyContent />}
      </div>

      <div className="border-t border-slate-100 py-8 text-center bg-slate-50">
        <Button onClick={onClose}>Retour à l'application</Button>
      </div>
    </div>
  );
};

const CGUContent = () => (
  <>
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">1. Objet</h2>
      <p>
        Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir les modalités de mise à disposition des services du site "Facturier Soignant" (ci-après "le Service") et les conditions d'utilisation du Service par l'utilisateur.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">2. Description du Service</h2>
      <p>
        Facturier Soignant est une application de démonstration permettant la génération de factures pour les professionnels de santé. L'application utilise l'Intelligence Artificielle pour faciliter la saisie des données.
      </p>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
        <p className="font-bold text-yellow-800">Avertissement :</p>
        <p className="text-sm mt-1 text-yellow-800">
          Cette application est une démonstration technique. Elle ne doit pas être utilisée pour une facturation réelle sans vérification préalable de la conformité légale et fiscale en vigueur dans votre juridiction.
        </p>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">3. Responsabilité</h2>
      <p>
        L'éditeur du site ne saurait être tenu responsable des erreurs rencontrées sur le site, problèmes techniques, interprétation des informations publiée et conséquences de leur utilisation. L'utilisateur est seul responsable de l'exactitude des factures générées et de leur transmission aux organismes payeurs.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">4. Propriété Intellectuelle</h2>
      <p>
        Tous les éléments du site (textes, images, code informatique) sont protégés par le droit d'auteur. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">5. Modification des CGU</h2>
      <p>
        L'éditeur se réserve le droit de modifier, à tout moment et sans préavis, les présentes conditions d’utilisation afin de les adapter aux évolutions du site et/ou de son exploitation.
      </p>
    </section>
  </>
);

const PrivacyContent = () => (
  <>
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">1. Collecte des Données</h2>
      <p>
        Dans le cadre de l'utilisation de l'application, nous sommes amenés à collecter les données suivantes :
      </p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Adresse email (pour l'authentification)</li>
        <li>Données de facturation saisies (noms des patients, adresses, soins)</li>
        <li>Préférences d'affichage (modèles de facture)</li>
      </ul>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">2. Utilisation de l'Intelligence Artificielle</h2>
      <p>
        Ce service utilise l'API Google Gemini pour analyser les textes saisis et générer des factures.
        Bien que Google applique des politiques de confidentialité strictes, nous recommandons de <strong>ne pas saisir de données de santé sensibles ou identifiables directement</strong> (nom complet + pathologie précise) dans le champ de saisie libre IA dans cette version de démonstration.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">3. Stockage des Données</h2>
      <p>
        Les données sont hébergées via <strong>Supabase</strong>, une plateforme Backend-as-a-Service sécurisée. Les bases de données sont situées dans l'Union Européenne ou dans des juridictions respectant le RGPD.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">4. Vos Droits</h2>
      <p>
        Conformément à la réglementation RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.
        Vous pouvez exercer ces droits ou supprimer votre compte directement depuis l'interface de l'application ou en nous contactant.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">5. Cookies</h2>
      <p>
        Ce site utilise des cookies techniques nécessaires au fonctionnement de l'authentification (session utilisateur). Aucun cookie publicitaire tiers n'est utilisé.
      </p>
    </section>
  </>
);