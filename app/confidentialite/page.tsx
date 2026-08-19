import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "../_seo/metadata";

const EMAIL = "conseiller.conjugal.israel@gmail.com";

export const metadata: Metadata = buildMetadata({
  title: "Politique de confidentialité",
  description:
    "Informations sur les données traitées lors d’une prise de contact, leur finalité, leur conservation, les prestataires techniques et vos droits.",
  pathname: "/confidentialite",
});

export default function ConfidentialitePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Politique de confidentialité
        </h1>
      </div>

      <p className="text-gray-700 leading-relaxed">
        Le responsable du traitement est <strong>Yoni Berrebi</strong>. Cette page décrit
        les données susceptibles d’être traitées lorsque vous consultez le site ou prenez
        contact, et la manière dont elles sont protégées.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Données et finalités</h2>
        <p className="text-gray-700 leading-relaxed">
          Lorsque vous contactez le cabinet par WhatsApp, téléphone ou email, les données
          peuvent inclure votre nom, vos coordonnées, vos disponibilités et le contenu que
          vous choisissez de transmettre. Elles servent à répondre à votre demande,
          communiquer le tarif, organiser les rendez-vous et assurer le suivi demandé.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Le traitement repose sur votre démarche de prise de contact et sur l’intérêt
          légitime à répondre aux demandes et à sécuriser le service. Ne transmettez pas
          de détail intime ou sensible dans votre premier message : une simple demande de
          disponibilités suffit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Prestataires techniques</h2>
        <p className="text-gray-700 leading-relaxed">
          Le site est hébergé par Vercel, qui peut traiter des données techniques et des
          journaux nécessaires à la sécurité et au fonctionnement. Si vous choisissez un
          bouton de contact, WhatsApp (Meta) ou Gmail (Google) traite alors les données
          selon ses propres conditions. Si vous acceptez la mesure d’audience, Google traite
          également les données nécessaires au fonctionnement de Google Analytics. Ces
          services peuvent impliquer un traitement hors de votre pays de résidence.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Aucune donnée n’est vendue. Elle n’est communiquée qu’aux prestataires nécessaires
          au service, sur demande légale, ou lorsque la sécurité d’une personne l’exige.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cookies et mesure d’audience</h2>
        <p className="text-gray-700 leading-relaxed">
          Google Analytics est utilisé uniquement si vous l’acceptez dans le bandeau de
          consentement. Il permet de mesurer les pages consultées, les interactions avec les
          moyens de contact et des informations techniques générales afin d’améliorer le
          contenu du site. Google peut alors déposer ou lire des cookies de mesure d’audience
          et traiter les données selon ses propres conditions.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Si vous refusez, Google Analytics n’est pas chargé. Vous pouvez modifier ou retirer
          votre consentement à tout moment depuis le lien « Gérer mes cookies » présent dans
          le pied de page. Les mécanismes strictement nécessaires à la sécurité, au
          fonctionnement du site et à la mémorisation de votre choix restent disponibles.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Durée de conservation</h2>
        <p className="text-gray-700 leading-relaxed">
          Les demandes sans suite sont supprimées lorsqu’elles ne sont plus nécessaires.
          Les informations liées à un accompagnement sont conservées pendant la durée utile
          au suivi, puis uniquement pendant les délais nécessaires aux obligations légales,
          comptables ou à la défense de droits.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Vos droits</h2>
        <p className="text-gray-700 leading-relaxed">
          Selon la réglementation applicable, vous pouvez demander l’accès, la rectification,
          l’effacement, la limitation ou l’opposition au traitement de vos données. Vous
          pouvez aussi poser toute question à l’adresse{" "}
          <a className="underline" href={"mailto:" + EMAIL}>{EMAIL}</a>.
          Une preuve d’identité peut être demandée si elle est nécessaire pour éviter de
          communiquer des données à la mauvaise personne.
        </p>
      </section>

      <Link href="/" className="text-sm text-gray-600 underline">
        ← Retour à l’accueil
      </Link>
    </main>
  );
}
