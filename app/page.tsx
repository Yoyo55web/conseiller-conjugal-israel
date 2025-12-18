import Image from "next/image";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20faire%20le%20point%20sur%20ma%20situation.%20Voici%20en%202-3%20phrases%20ce%20que%20je%20vis%20%3A%20";

const PHONE_TEL = "tel:+972585360510";

// CTA unifiés
const CTA_PRIMARY =
  "inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-green-600 text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/30";

const CTA_SECONDARY =
  "inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10";

const CTA_NOTE = "mt-3 text-xs text-gray-600";

// Spacing cohérent “premium”
const SECTION_Y = "py-16";
const CONTAINER = "max-w-6xl mx-auto px-6";
const CARD = "rounded-2xl border border-gray-200 bg-white p-6";
const CARD_SOFT = "rounded-3xl border border-gray-200 bg-gray-50 p-8";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-abstract.png"
            alt="Fond apaisant"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/70" />
        </div>

        <div className={`relative ${CONTAINER} ${SECTION_Y}`}>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Colonne GAUCHE = message / confiance */}
            <div className="space-y-7">
              <div className="flex flex-wrap gap-2">
                {[
                  "Confidentialité totale",
                  "Neutralité",
                  "Visio / Présentiel",
                  "Public francophone • Visio partout",
                ].map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center rounded-full border border-gray-200 bg-white/75 px-3 py-1 text-sm text-gray-700"
                  >
                    {b}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                Clarifier votre situation de couple et avancer avec plus de sérénité
              </h1>

              <p className="text-lg leading-relaxed text-gray-700 max-w-2xl">
                Tensions, incompréhensions, décisions difficiles :{" "}
                <strong>on fait le point clairement</strong> et on avance avec un{" "}
                <strong>accompagnement structuré, neutre et confidentiel</strong>.
              </p>

              <div className="text-sm text-gray-700">
                <a
                  href="/qui-sommes-nous"
                  className="underline underline-offset-4 hover:no-underline"
                >
                  En savoir plus sur l’accompagnement
                </a>
              </div>
            </div>

            {/* Colonne DROITE = actions (CTA) */}
            <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur p-10">
              <h2 className="text-xl font-semibold">
                Ce que vous obtenez dès la première séance
              </h2>

              <ul className="mt-5 space-y-3 text-gray-800">
                <li>• Une lecture claire de la situation (ce qui bloque réellement)</li>
                <li>• Des outils simples pour apaiser et mieux communiquer</li>
                <li>• Un objectif précis + un plan concret entre les séances</li>
                <li>• Un cadre sécurisant, sans jugement et sans prise de parti</li>
              </ul>

              {/* CTA */}
              <div className="mt-7 flex flex-col gap-3">
                <a href={WHATSAPP_LINK} className={CTA_PRIMARY}>
                  Écrire sur WhatsApp
                </a>

                <a href="#method" className={CTA_SECONDARY}>
                  Voir la méthode
                </a>

                <a href={PHONE_TEL} className={CTA_SECONDARY}>
                  Appeler
                </a>
              </div>

              {/* ✅ Micro-réassurance unique (à droite, sous les boutons) */}
              <p className={CTA_NOTE}>
                Réponse rapide • Échanges confidentiels • Sans engagement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= POUR QUI ================= */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <h2 className="text-2xl font-semibold">
            À qui s’adresse cet accompagnement ?
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Couples en conflit : disputes récurrentes, tension au quotidien",
              "Distance émotionnelle : froideur, fatigue, perte de complicité",
              "Problèmes de confiance : jalousie, blessures, incompréhensions",
              "Période de crise : séparation envisagée, décision importante, reconstruction",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-white p-5 leading-relaxed"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-7">
            <div className="font-semibold">Objectif</div>
            <p className="mt-2 text-gray-700 leading-relaxed max-w-3xl">
              Vous aider à retrouver une relation plus stable et plus saine — avec
              des outils concrets et une progression étape par étape.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MÉTHODE ================= */}
      <section id="method" className="bg-white">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <h2 className="text-2xl font-semibold">Comment ça se passe</h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="grid gap-4">
              {[
                ["1. Diagnostic", "Comprendre ce qui se joue et clarifier les blocages."],
                ["2. Besoins & objectifs", "Définir un objectif clair et réaliste, adapté à votre situation."],
                ["3. Outils", "Mettre en place des outils applicables dès la maison."],
                ["4. Plan & suivi", "Avancer étape par étape pour stabiliser les progrès."],
              ].map(([title, desc]) => (
                <div key={title} className={CARD}>
                  <div className="font-semibold">{title}</div>
                  <div className="mt-2 text-gray-700 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 overflow-hidden">
              <div className="relative h-64 md:h-80">
                <Image
                  src="/images/chemin.png"
                  alt="Un chemin symbolisant un accompagnement étape par étape"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              <div className="p-8">
                <div className="text-lg font-semibold">
                  Vous voulez commencer simplement ?
                </div>
                <p className="mt-2 text-gray-700 leading-relaxed max-w-xl">
                  Envoyez 2–3 phrases sur votre situation. Je vous réponds rapidement
                  pour fixer un rendez-vous.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href={WHATSAPP_LINK} className={CTA_PRIMARY}>
                    Écrire sur WhatsApp
                  </a>
                  <a href="/tarifs" className={CTA_SECONDARY}>
                    Voir la page Tarifs
                  </a>
                </div>

                <p className={CTA_NOTE}>
                  Message court • Réponse rapide • Échanges confidentiels
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CADRE & VALEURS ================= */}
      <section className="bg-white">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <h2 className="text-2xl font-semibold">Cadre & valeurs</h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ["Confidentialité totale", "Un espace sûr pour parler librement, sans jugement."],
              ["Neutralité", "Aucune prise de parti : on travaille la relation et les solutions."],
              ["Structure claire", "Un objectif + des étapes concrètes, pas du flou."],
              ["Approche adaptée", "Respect de votre rythme, de vos valeurs et de votre cadre de vie."],
            ].map(([title, desc]) => (
              <div key={title} className={CARD}>
                <div className="font-semibold">{title}</div>
                <div className="mt-2 text-gray-700 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PREPARATION AU MARIAGE ================= */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold">Préparation au mariage</h2>
              <p className="mt-2 text-gray-700 leading-relaxed">
                Une préparation structurée pour clarifier les attentes, poser un cadre clair
                et partir sur des bases solides dès le départ.
              </p>
            </div>

            <a href="/preparation-au-mariage" className={CTA_SECONDARY}>
              Découvrir la préparation
            </a>
          </div>
        </div>
      </section>

      {/* ================= “SOCIAL PROOF” ================= */}
      <section className="bg-white">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <h2 className="text-2xl font-semibold">Ce que les couples recherchent le plus</h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Apaiser les disputes", "Parler sans exploser, sortir du cercle des reproches."],
              ["Retrouver un cap", "Clarifier la situation et avancer plus sereinement."],
              ["Recréer du lien", "Comprendre l’autre et reconstruire une complicité durable."],
            ].map(([title, desc]) => (
              <div key={title} className={CARD}>
                <div className="font-semibold">{title}</div>
                <p className="mt-2 text-gray-700 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <h2 className="text-2xl font-semibold">Questions fréquentes</h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ["Est-ce confidentiel ?", "Oui, totalement. Les échanges restent privés."],
              ["Combien de séances ?", "Souvent 4 à 8 selon la situation, parfois moins."],
              ["Visio ou présentiel ?", "Les deux sont possibles. On choisit ce qui vous convient."],
              ["Peut-on commencer seul ?", "Oui, c’est possible si l’autre ne souhaite pas encore venir."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="font-semibold">{q}</div>
                <div className="mt-2 text-gray-700 leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="bg-white">
        <div className={`${CONTAINER} ${SECTION_Y}`}>
          <div className={CARD_SOFT + " text-center"}>
            <h2 className="text-2xl font-semibold">Prendre rendez-vous</h2>

            <p className="mt-3 text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Envoyez 2–3 phrases sur votre situation. Je vous réponds rapidement pour fixer un rendez-vous.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <a href={WHATSAPP_LINK} className={CTA_PRIMARY}>
                Écrire sur WhatsApp (le plus rapide)
              </a>

              <a href={PHONE_TEL} className={CTA_SECONDARY}>
                Appeler
              </a>

              <a href="/contact" className={CTA_SECONDARY}>
                Page contact
              </a>
            </div>

            <p className="mt-5 text-xs text-gray-600">
              Téléphone : <span className="font-semibold">+972 58 536 05 10</span> • Sans engagement • Confidentialité totale
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
