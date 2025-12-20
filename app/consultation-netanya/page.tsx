import Link from "next/link";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous%20%C3%A0%20Netanya%20(en%20pr%C3%A9sentiel).%20Voici%20ma%20situation%20en%202-3%20phrases%20%3A%20";

const PHONE_TEL = "tel:+972585360510";

export const metadata = {
  title: "Consultation de couple à Netanya – Présentiel | Conseiller Conjugal",
  description:
    "Consultations de couple en présentiel à Netanya (discrétion, neutralité, cadre clair) et possibilité de visio en français.",
};

const CONTAINER = "max-w-4xl mx-auto px-6";
const SECTION_Y = "py-16";
const CARD = "rounded-3xl border border-gray-200 bg-white p-8";
const SOFT = "rounded-3xl border border-gray-200 bg-gray-50 p-8";

const CTA_PRIMARY =
  "inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-green-600 text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/30";
const CTA_SECONDARY =
  "inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10";

export default function ConsultationNetanyaPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HERO */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <div className="flex flex-wrap gap-2">
            {["Présentiel à Netanya", "Confidentialité totale", "Neutralité"].map((b) => (
              <span
                key={b}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
              >
                {b}
              </span>
            ))}
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-balance">
            Consultation de couple à Netanya (présentiel)
          </h1>

          <p className="mt-4 text-lg text-gray-700 leading-relaxed max-w-3xl">
            Un cadre clair, discret et respectueux pour faire le point sur votre situation,
            apaiser les tensions et avancer avec des outils concrets.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a href={WHATSAPP_LINK} className={CTA_PRIMARY}>
              Écrire sur WhatsApp (Netanya)
            </a>
            <a href={PHONE_TEL} className={CTA_SECONDARY}>
              Appeler
            </a>
            <Link href="/" className={CTA_SECONDARY}>
              Retour à l’accueil
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-700">
            <span className="font-semibold">Alternative :</span> si vous êtes hors de Netanya,{" "}
            <span className="font-semibold">visio possible</span> partout dans le monde (en français).
          </p>
        </div>
      </section>

      {/* CE QUE VOUS OBTENEZ */}
      <section className="bg-white">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <div className={CARD}>
            <h2 className="text-2xl font-semibold">Ce que vous obtenez</h2>

            <ul className="mt-5 space-y-3 text-gray-800 leading-relaxed">
              <li>• Une lecture claire de la situation (ce qui bloque réellement)</li>
              <li>• Un cadre sécurisé : respect, neutralité, sans jugement</li>
              <li>• Des outils simples pour apaiser et mieux communiquer</li>
              <li>• Un objectif précis + un plan concret entre les séances</li>
            </ul>

            <div className="mt-7 rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="font-semibold">Lieu</div>
              <p className="mt-2 text-gray-700 leading-relaxed">
                Consultation en <span className="font-semibold">présentiel à Netanya</span>.
                (Les détails précis sont transmis lors de la prise de rendez-vous.)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POUR QUI */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <h2 className="text-2xl font-semibold">Pour qui ?</h2>
          <p className="mt-3 text-gray-700 leading-relaxed max-w-3xl">
            Si vous vous reconnaissez, vous êtes au bon endroit.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Disputes répétées, tension au quotidien",
              "Distance émotionnelle, fatigue, perte de complicité",
              "Blessures, incompréhensions, confiance fragilisée",
              "Période de crise : décision importante, séparation envisagée",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-gray-200 bg-white p-5">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA SE PASSE */}
      <section className="bg-white">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <h2 className="text-2xl font-semibold">Comment ça se passe</h2>

          <div className="mt-8 grid gap-4">
            {[
              ["1) Clarifier", "On identifie précisément ce qui se joue et ce qui bloque."],
              ["2) Objectif", "On fixe un objectif concret et réaliste."],
              ["3) Outils", "Vous repartez avec des outils applicables dès la maison."],
              ["4) Suivi", "On avance étape par étape pour stabiliser les progrès."],
            ].map(([t, d]) => (
              <div key={t} className={SOFT}>
                <div className="font-semibold">{t}</div>
                <div className="mt-2 text-gray-700 leading-relaxed">{d}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a href={WHATSAPP_LINK} className={CTA_PRIMARY}>
              Prendre rendez-vous à Netanya
            </a>
            <Link href="/tarifs" className={CTA_SECONDARY}>
              Voir les tarifs
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-600">
            Réponse rapide • Échanges confidentiels • Sans engagement
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold">Commencer simplement</h2>
            <p className="mt-3 text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Envoyez 2–3 phrases sur votre situation. Je vous réponds rapidement pour fixer un rendez-vous à Netanya.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <a href={WHATSAPP_LINK} className={CTA_PRIMARY}>
                Écrire sur WhatsApp
              </a>
              <a href={PHONE_TEL} className={CTA_SECONDARY}>
                Appeler
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
