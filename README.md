# Health Invoice App (Facturier Soignant AI)

Application de facturation assistée par IA conçue pour les professionnels de santé. Génération d'un devis/facture par commande vocale ou texte libre, gestion des patients, templates PDF professionnels et suivi des paiements.

## Fonctionnalités

- **Génération de facture assistée par IA** : dictée vocale ou texte libre transformé automatiquement en ligne de facturation (reconnaissance vocale + IA)
- **Templates PDF** : plusieurs designs (Modern, Classic, Minimalist, Elegant, Corporate)
- **Gestion des patients/clients**
- **Dashboard** : suivi des revenus et statut des factures (payée, en attente, en retard)
- **Paiements et abonnements** via Stripe

## Sécurité & qualité

- **Chiffrement AES-256-GCM** des données sensibles (notes, informations patients)
- **Journal d'audit** : traçabilité des actions sensibles (création/suppression de facture, export de données, génération PDF...)
- **Rate limiting** sur les routes API
- **Tests unitaires** (Jest) et **tests end-to-end** (Playwright)

## Stack technique

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (base de données & auth) · Stripe · @react-pdf/renderer · Jest · Playwright

## Lancer le projet

### Prérequis

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Ostive/Health-Invoice.git
cd Health-Invoice
npm install
```

Créer un fichier `.env.local` à partir de [`.env.example`](.env.example) et renseigner tes propres clés Supabase, Stripe et Gemini.

```bash
npm run dev
```

Application disponible sur [http://localhost:3000](http://localhost:3000).

### Tests

```bash
npm test           # tests unitaires
npx playwright test  # tests end-to-end
```

## Déploiement

Optimisé pour [Vercel](https://vercel.com/) : push sur GitHub → import du projet dans Vercel → configuration des variables d'environnement → déploiement.

## Licence

[MIT](LICENSE)
