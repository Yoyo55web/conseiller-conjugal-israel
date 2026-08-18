import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "../_seo/metadata";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20conna%C3%AEtre%20les%20tarifs%20et%20les%20prochaines%20disponibilit%C3%A9s%20pour%20un%20rendez-vous.";

const PHONE_TEL = "tel:+972585360510";

export const metadata: Metadata = buildMetadata({
  title: "Tarifs des consultations de couple",
  description:
    "Formats proposés pour les séances de couple, individuelles et la préparation au mariage, en visio ou à Netanya. Tarif communiqué avant confirmation.",
  pathname: "/tarifs",
});

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-bold tracking-tight">Tarifs</h1>

        <p className="mt-4 text-lg text-gray-600 max-w-3xl">
          Les tarifs dépendent du <strong>type d’accompagnement</strong> (couple,
          individuel ou préparation au mariage) et du <strong>format</strong> (visio ou
          présentiel).
          <br />
          Pour éviter toute mauvaise surprise, le montant adapté à votre demande vous est
          communiqué <strong>par écrit avant toute confirmation</strong>.
        </p>

        {/* Cartes offres */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            [
              "Séance couple",
              "50–60 minutes • Tarif avant confirmation",
              "Visio ou présentiel • Outils concrets • Cadre structuré",
            ],
            [
              "Séance individuelle",
              "50–60 minutes • Tarif avant confirmation",
              "Clarification • Outils concrets • Plan d’action",
            ],
            [
              "Préparation au mariage",
              "Programme • Tarif avant confirmation",
              "Bases solides • Transmission structurée • Suivi possible",
            ],
          ].map(([title, line1, line2]) => (
            <div key={title} className="rounded-2xl border p-6">
              <div className="font-semibold">{title}</div>
              <div className="mt-2 text-gray-600">{line1}</div>
              <div className="text-gray-600">{line2}</div>
            </div>
          ))}
        </div>

        {/* Bloc conversion */}
        <div className="mt-10 rounded-3xl border bg-gray-50 p-8">
          <h2 className="text-xl font-semibold">Demander les tarifs (réponse rapide)</h2>

          <p className="mt-2 text-gray-600 max-w-3xl">
            Envoyez un message sur <strong>WhatsApp</strong> en précisant simplement :
            <strong> 1)</strong> couple, individuel ou préparation au mariage et
            <strong> 2)</strong> visio ou présentiel.
            <br />
            Je vous réponds avec le <strong>tarif</strong> et les{" "}
            <strong>prochaines disponibilités</strong>.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <a
              href={WHATSAPP_LINK}
              className="inline-flex items-center justify-center rounded-md bg-green-700 text-white px-6 py-3 text-sm font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/30"
            >
              Contacter sur WhatsApp
            </a>

            <a
              href={PHONE_TEL}
              className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium bg-white"
            >
              Appeler
            </a>

            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium bg-white"
            >
              Page Contact
            </a>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Échanges traités avec discrétion • Sans engagement • Réponse rapide
          </p>
        </div>

        {/* FAQ courte tarifs */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            [
              "Pourquoi les tarifs sont “sur demande” ?",
              "Le format (visio ou présentiel) et le type d’accompagnement influencent le tarif. Le montant vous est communiqué par écrit avant toute confirmation.",
            ],
            [
              "Puis-je commencer seul(e) ?",
              "Oui, c’est possible. Cela permet souvent de clarifier la situation et de préparer une démarche à deux.",
            ],
            [
              "En combien de temps avez-vous une réponse ?",
              "Généralement rapidement, surtout sur WhatsApp.",
            ],
            [
              "Où ont lieu les séances ?",
              "En visio ou en présentiel (selon votre localisation et vos préférences).",
            ],
          ].map(([q, a]) => (
            <div key={q} className="rounded-2xl border bg-white p-6">
              <div className="font-semibold">{q}</div>
              <div className="mt-2 text-gray-600">{a}</div>
            </div>
          ))}
        </div>

        <Link href="/" className="inline-block mt-10 text-sm text-gray-600 underline">
          ← Retour à l’accueil
        </Link>
      </section>
    </main>
  );
}
