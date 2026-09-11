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

Next.js 16 (App Router) · React 19 · TypeScript 6 · Tailwind CSS 4 · Supabase (base de données & auth) · Stripe · @react-pdf/renderer · Jest · Playwright

## Lancer le projet

### Prérequis

- Node.js 22+ (Next.js 16 exige au minimum Node 20.9, les outils de test Node 22)
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
npm run test:e2e   # tests end-to-end Playwright (site public, factures, PDF, IA)
```

Les tests end-to-end utilisent un compte dédié, distinct du compte de démonstration. Pour le créer :

```bash
SEED_EMAIL=e2e.soignant@example.com SEED_PASSWORD='un-mot-de-passe-Fort!1' npm run db:seed -- --remote
```

puis renseigner `E2E_EMAIL` et `E2E_PASSWORD` dans `.env.test.local` (ignoré par git), lu automatiquement par Playwright. Les tests IA appellent réellement Gemini.

### Données de démonstration

```bash
npm run db:seed -- --remote
```

Crée (ou réinitialise) le compte `demo.soignant@example.com` avec des patients, dossiers et factures fictifs, puis affiche son mot de passe (`SEED_EMAIL` / `SEED_PASSWORD` pour les choisir). Sans `--remote`, le script refuse de tourner ailleurs que sur un Supabase local ; `-- --remote --delete` supprime le compte et ses données.

### Mot de passe oublié

Dans Supabase > Authentication > URL Configuration, ajoutez `http://localhost:3000/**` (et l’URL de production) aux *Redirect URLs* : le lien de réinitialisation passe par `/auth/callback?next=/nouveau-mot-de-passe`.

### Icônes

`public/icon.svg` est la source de toutes les icônes ; après modification, `npm run icons` régénère favicon, icônes Apple, Android et Windows.

## Déploiement

Optimisé pour [Vercel](https://vercel.com/) : push sur GitHub → import du projet dans Vercel → configuration des variables d'environnement → déploiement.

## Licence

[MIT](LICENSE)
