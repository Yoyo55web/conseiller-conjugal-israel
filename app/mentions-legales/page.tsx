import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "../_seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Mentions légales",
  description:
    "Mentions légales du site Conseiller conjugal Israël : éditeur, coordonnées, hébergeur et limites de responsabilité.",
  pathname: "/mentions-legales",
});

export default function MentionsLegalesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-10">
      <h1 className="text-4xl font-bold tracking-tight">Mentions légales</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Éditeur du site</h2>
        <p className="text-gray-700 leading-relaxed">
          Activité : conseiller conjugal<br />
          Responsable du site : Yoni Berrebi<br />
          Email :{" "}
          <a className="underline" href="mailto:conseiller.conjugal.israel@gmail.com">
            conseiller.conjugal.israel@gmail.com
          </a><br />
          Téléphone (Israël) :{" "}
          <a className="underline" href="tel:+972585360510">+972 58 536 05 10</a><br />
          Téléphone (France) :{" "}
          <a className="underline" href="tel:+33177473245">+33 1 77 47 32 45</a><br />
          Pays d’activité : Israël
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hébergement</h2>
        <p className="text-gray-700">Le site est hébergé par Vercel Inc.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
        <p className="text-gray-700 leading-relaxed">
          Les textes, la structure et les éléments graphiques de ce site ne peuvent pas être
          reproduits ou réutilisés sans autorisation préalable, hors exceptions prévues par
          la loi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Responsabilité</h2>
        <p className="text-gray-700 leading-relaxed">
          Les contenus de ce site présentent l’accompagnement proposé et ne constituent pas
          une promesse de résultat.
        </p>
      </section>

      <Link href="/" className="text-sm text-gray-600 underline">
        ← Retour à l’accueil
      </Link>
    </main>
  );
}
