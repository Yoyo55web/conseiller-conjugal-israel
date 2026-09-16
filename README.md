# Conseiller conjugal Israël

Site Next.js du cabinet, avec pages publiques, formulaires privés de préparation et d’avis,
et espace d’administration protégé.

## Configuration privée

Les fonctionnalités de dossier nécessitent une base PostgreSQL dédiée. Les variables
d’environnement doivent être enregistrées dans Vercel et ne jamais être ajoutées au dépôt
GitHub.

```bash
DATABASE_URL=postgresql://...
DATA_ENCRYPTION_KEY=une-cle-aleatoire-longue-et-unique
ADMIN_PASSWORD=un-mot-de-passe-administrateur-long-et-unique
ADMIN_SESSION_SECRET=une-seconde-cle-aleatoire-longue-et-unique
NEXT_PUBLIC_SITE_URL=https://www.conseiller-conjugal-israel.com
STRIPE_SECRET_KEY=rk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

La base recommandée est une base Neon PostgreSQL créée spécialement pour ce site depuis
Vercel Marketplace. Le schéma est créé automatiquement lors du premier accès. Les réponses,
les avis et les jetons de liens privés sont chiffrés côté application avant enregistrement.

L’espace du conseiller est accessible sur `/admin`. Il permet de créer un dossier, de copier
le lien de préparation et le lien d’avis, de consulter les réponses et de valider explicitement
un témoignage avant son éventuelle publication.

## Paiement Stripe

Le parcours privé enregistre le moyen de paiement au moyen d’un SetupIntent, sans débit.
Après la séance uniquement, l’administrateur peut déclencher le montant expressément accepté ;
le règlement est alors créé comme PaymentIntent hors session. Les événements Stripe sont reçus
sur `/api/stripe/webhook`, vérifiés par leur signature et dédupliqués en base.

Pour les déploiements Preview, utiliser exclusivement le compte Stripe test et limiter les
variables à la branche concernée. L’application refuse automatiquement une clé Stripe réelle
quand `VERCEL_ENV=preview`. La clé serveur recommandée est une clé restreinte donnant seulement
les droits nécessaires sur Customers, SetupIntents, PaymentMethods et PaymentIntents.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically load Geist, a font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - learn Next.js with an interactive tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js).

## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the Vercel Git integration.

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.
