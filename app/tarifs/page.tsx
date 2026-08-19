import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "../_seo/metadata";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20conna%C3%AEtre%20les%20tarifs%20et%20les%20prochaines%20disponibilit%C3%A9s%20pour%20un%20rendez-vous.";

const PHONE_TEL = "tel:+972585360510";

export const metadata: Metadata = buildMetadata({
  title: "Tarifs des consultations de couple",
  description:
    "Tarifs des séances de couple et individuelles, à Netanya ou en visioconférence, ainsi que de la préparation au mariage personnalisée.",
  pathname: "/tarifs",
});

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-bold tracking-tight">Tarifs</h1>

        <p className="mt-4 text-lg text-gray-600 max-w-3xl">
          Des tarifs clairs pour les séances de couple et individuelles. La préparation au
          mariage est personnalisée selon vos connaissances, vos besoins et votre rythme.
        </p>

        {/* Cartes offres */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            [
              "Séance de couple",
              "250 ₪ ou 75 €",
              "50–60 minutes • Netanya ou visioconférence",
            ],
            [
              "Séance individuelle",
              "250 ₪ ou 75 €",
              "50–60 minutes • En visioconférence",
            ],
            [
              "Préparation au mariage",
              "À partir de 2 000 ₪",
              "Programme personnalisé • Tarif défini avant de commencer",
            ],
          ].map(([title, line1, line2]) => (
            <div key={title} className="rounded-2xl border p-6">
              <div className="font-semibold">{title}</div>
              <div className="mt-3 text-2xl font-bold text-gray-900">{line1}</div>
              <div className="mt-2 text-sm text-gray-600">{line2}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Une préparation adaptée à chaque futur marié</h2>
          <p className="mt-2 text-gray-600 leading-relaxed max-w-4xl">
            Le parcours complet comprend généralement <strong>15 à 20 séances</strong>.
            Selon les connaissances déjà acquises, les besoins et le temps disponible, un
            format accéléré d’environ <strong>10 séances</strong>, ou parfois moins, peut
            être proposé. Le nombre de séances et le tarif total sont convenus avant le
            début du programme.
          </p>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Les séances peuvent être réglées en shekels ou en euros. Pour la préparation au
          mariage, l’équivalent en euros est précisé avec la proposition personnalisée.
        </p>

        {/* Bloc rendez-vous */}
        <div className="mt-10 rounded-3xl border bg-gray-50 p-8">
          <h2 className="text-xl font-semibold">Prendre rendez-vous</h2>

          <p className="mt-2 text-gray-600 max-w-3xl">
            Envoyez un message sur <strong>WhatsApp</strong> en précisant simplement :
            <strong> 1)</strong> couple, individuel ou préparation au mariage et
            <strong> 2)</strong> visio ou présentiel.
            <br />
            Je vous réponds avec les <strong>prochaines disponibilités</strong>. Pour la
            préparation au mariage, le format et le tarif total sont précisés avant de
            commencer.
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
              "La visioconférence est-elle moins chère ?",
              "Non. Une séance en visioconférence demande le même temps, la même attention et la même préparation. Le tarif reste donc identique.",
            ],
            [
              "Une séance individuelle a-t-elle le même tarif ?",
              "Oui. Une séance individuelle dure également 50 à 60 minutes et bénéficie du même cadre d’accompagnement.",
            ],
            [
              "Combien de séances comprend la préparation au mariage ?",
              "Le parcours complet comprend généralement 15 à 20 séances. Un format accéléré d’environ 10 séances, ou parfois moins, peut être proposé selon les besoins.",
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
