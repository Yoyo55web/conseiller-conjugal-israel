# Conseiller conjugal Israël

Site Next.js du cabinet, avec pages publiques, formulaires privés de préparation et d’avis,
et espace d’administration protégé.

## Configuration privée

Les fonctionnalités de dossier nécessitent une base PostgreSQL dédiée et quatre variables
d’environnement. Elles doivent être enregistrées dans Vercel (Production et Preview) et ne
jamais être ajoutées au dépôt GitHub.

```bash
DATABASE_URL=postgresql://...
DATA_ENCRYPTION_KEY=une-cle-aleatoire-longue-et-unique
ADMIN_PASSWORD=un-mot-de-passe-administrateur-long-et-unique
ADMIN_SESSION_SECRET=une-seconde-cle-aleatoire-longue-et-unique
NEXT_PUBLIC_SITE_URL=https://www.conseiller-conjugal-israel.com
```

La base recommandée est une base Neon PostgreSQL créée spécialement pour ce site depuis
Vercel Marketplace. Le schéma est créé automatiquement lors du premier accès. Les réponses,
les avis et les jetons de liens privés sont chiffrés côté application avant enregistrement.

L’espace du conseiller est accessible sur `/admin`. Il permet de créer un dossier, de copier
le lien de préparation et le lien d’avis, de consulter les réponses et de valider explicitement
un témoignage avant son éventuelle publication.

Stripe et le paiement en ligne ne font pas partie de cette version.

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
