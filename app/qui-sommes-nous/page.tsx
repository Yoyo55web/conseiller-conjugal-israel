import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "../_seo/metadata";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous%20pour%20un%20accompagnement%20conjugal.%20Pourriez-vous%20m%E2%80%99indiquer%20vos%20prochaines%20disponibilit%C3%A9s%20et%20le%20tarif%20%3F";

export const metadata: Metadata = buildMetadata({
  title: "Yoni Berrebi, conseiller conjugal",
  description:
    "Découvrez l’approche de Yoni Berrebi, conseiller conjugal francophone en Israël : écoute, neutralité, cadre structuré et accompagnement concret.",
  pathname: "/qui-sommes-nous",
});

export default function QuiSuisJePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Qui suis-je ?</h1>

        <div className="mt-8 space-y-4 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Je m’appelle <strong>Yoni Berrebi</strong>, conseiller conjugal francophone
            en Israël. J’accompagne les couples et les personnes qui traversent des
            difficultés relationnelles, des conflits, une période de crise ou une
            décision importante.
          </p>
          <p>
            Mon approche est <strong>structurée, bienveillante et orientée solutions</strong>.
            L’objectif n’est pas de juger ni de prendre parti, mais de clarifier la
            situation, d’apaiser les tensions et de définir des étapes concrètes.
          </p>
          <p>
            Chaque séance s’inscrit dans un cadre défini ensemble, respectueux de votre
            histoire, de votre rythme et de vos valeurs. Les consultations ont lieu en
            présentiel à Netanya ou en visioconférence, en français.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            [
              "Confidentialité et discrétion",
              "Les échanges sont traités avec discrétion, dans les limites prévues par la loi et la sécurité des personnes.",
            ],
            [
              "Neutralité",
              "Un espace où chacun peut s’exprimer, sans jugement ni prise de parti.",
            ],
            [
              "Cadre structuré",
              "Des repères clairs, des objectifs réalistes et un suivi cohérent.",
            ],
            [
              "Présentiel ou visio",
              "Consultations à Netanya ou en visioconférence, selon votre situation.",
            ],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="font-semibold">{title}</div>
              <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                {description}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-gray-200 bg-gray-50 p-8 sm:p-10 text-center">
          <h2 className="text-xl font-semibold">
            Vous souhaitez faire le point sur votre situation ?
          </h2>
          <p className="mt-3 text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Demandez simplement les prochaines disponibilités et le tarif. Il n’est pas
            nécessaire de détailler votre situation sur WhatsApp.
          </p>
          <a
            href={WHATSAPP_LINK}
            className="inline-flex items-center justify-center mt-6 rounded-md bg-green-700 text-white px-7 py-3.5 text-sm font-semibold shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition"
          >
            Prendre contact sur WhatsApp
          </a>
          <p className="mt-3 text-xs text-gray-600">
            Réponse rapide • Échanges traités avec discrétion • Sans engagement
          </p>
        </div>

        <Link href="/" className="inline-block mt-10 text-sm text-gray-600 underline">
          ← Retour à l’accueil
        </Link>
      </section>
    </main>
  );
}
