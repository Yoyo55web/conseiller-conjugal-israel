import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "../_seo/metadata";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous%20pour%20un%20accompagnement%20conjugal.%20Pourriez-vous%20m%E2%80%99indiquer%20vos%20prochaines%20disponibilit%C3%A9s%20et%20le%20tarif%20%3F";

const EMAIL = "conseiller.conjugal.israel@gmail.com";
const TEL_IL_DISPLAY = "+972 58 536 05 10";
const TEL_IL = "+972585360510";
const TEL_FR_DISPLAY = "+33 1 77 47 32 45";
const TEL_FR = "+33177473245";

export const metadata: Metadata = buildMetadata({
  title: "Contact et prise de rendez-vous",
  description:
    "Contactez Yoni Berrebi pour une consultation conjugale en français, à Netanya ou en visioconférence. WhatsApp, téléphone et email.",
  pathname: "/contact",
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight">Contact</h1>

          <p className="mt-4 text-lg text-gray-600">
            Pour une demande ou une prise de rendez-vous, le plus simple est de
            m’écrire sur <strong>WhatsApp</strong>. Vous pouvez aussi appeler ou envoyer un email.
          </p>

          {/* Micro rassurance */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-gray-700">
              Cadre confidentiel
            </span>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-gray-700">
              Réponse rapide
            </span>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-gray-700">
              Visio / Présentiel
            </span>
          </div>
        </div>

        {/* CTA principaux */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {/* WHATSAPP */}
          <div className="rounded-2xl border p-6 md:col-span-2">
            <h2 className="text-xl font-semibold">WhatsApp (recommandé)</h2>
            <p className="mt-2 text-gray-600">
              Le message pré-rempli demande les prochaines disponibilités et le tarif. Vous
              n’avez pas besoin d’y détailler votre situation.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href={WHATSAPP_LINK}
                className="inline-flex items-center justify-center rounded-md bg-green-700 text-white px-6 py-3 text-sm font-medium w-full sm:w-auto hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/30"
              >
                Écrire sur WhatsApp
              </a>

              <a
                href={`tel:${TEL_IL}`}
                className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium"
              >
                Appeler (Israël)
              </a>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Échanges confidentiels • Sans engagement • Réponse rapide
            </p>
          </div>

          {/* INFO RAPIDE */}
          <div className="rounded-2xl border bg-gray-50 p-6">
            <h2 className="text-xl font-semibold">Coordonnées</h2>

            <div className="mt-4 space-y-4 text-gray-700">
              <div>
                <div className="text-sm text-gray-500">Téléphone Israël</div>
                <a href={`tel:${TEL_IL}`} className="hover:underline font-medium">
                  {TEL_IL_DISPLAY}
                </a>
              </div>

              <div>
                <div className="text-sm text-gray-500">Téléphone France</div>
                <a href={`tel:${TEL_FR}`} className="hover:underline">
                  {TEL_FR_DISPLAY}
                </a>
              </div>

              <div>
                <div className="text-sm text-gray-500">Email</div>
                <a href={`mailto:${EMAIL}`} className="hover:underline">
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* COMMENT DÉMARRER */}
        <div className="mt-10 rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">Comment démarrer (simple)</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ["1) Contactez", "Demandez les prochaines disponibilités et le tarif."],
              ["2) Précisez", "Indiquez visio ou présentiel, sans détail sensible."],
              ["3) Confirmez", "Le tarif et le rendez-vous sont confirmés avec vous."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border bg-gray-50 p-5">
                <div className="font-semibold">{t}</div>
                <div className="mt-2 text-gray-600">{d}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <span className="font-semibold">Durée :</span> 50–60 minutes •{" "}
            <span className="font-semibold">Format :</span> visio / présentiel •{" "}
            <span className="font-semibold">Confidentialité :</span> échanges traités
            avec discrétion
          </div>
        </div>

        <Link href="/" className="inline-block mt-10 text-sm text-gray-600 underline">
          ← Retour à l’accueil
        </Link>
      </section>
    </main>
  );
}
