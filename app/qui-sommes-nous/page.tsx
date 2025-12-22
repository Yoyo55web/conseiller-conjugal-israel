"use client";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous.%20Voici%2C%20en%202-3%20phrases%2C%20ma%20situation%20%3A%20";

export default function QuiSuisJePage() { return ( <main className="min-h-screen bg-white"> <section className="max-w-4xl mx-auto px-6 py-16"> <h1 className="text-4xl font-bold tracking-tight">Qui suis-je</h1>

        {/* INTRO */}
        <p className="mt-8 text-lg text-gray-700 leading-relaxed">
  Je suis <strong>conseiller conjugal francophone en Israël</strong>.
  J’accompagne les couples et les personnes qui traversent des difficultés
  relationnelles, des conflits, des périodes de crise ou des décisions
  importantes.
</p>

<p className="mt-4 text-gray-700 leading-relaxed">
  Mon approche est <strong>structurée, bienveillante et orientée solutions</strong>.
  L’objectif n’est pas de juger ni de prendre parti, mais de vous aider à
  clarifier la situation, apaiser les tensions et avancer de manière concrète.
</p>

<p className="mt-4 text-gray-700 leading-relaxed">
  Chaque séance s’inscrit dans un cadre clair, avec des objectifs définis
  ensemble et un travail progressif entre les rendez-vous.
</p>

<p className="mt-4 text-gray-700 leading-relaxed">
  Cet accompagnement s’appuie sur une formation approfondie et une expérience
  de terrain auprès de situations variées, toujours dans le respect de
  l’histoire, du rythme et des valeurs de chacun.
</p>

<div className="mt-10 text-center">
<p className="mt-14 text-lg font-semibold text-gray-800 text-center">
  Quand le dialogue devient difficile,
</p>
<p className="mt-1 text-base font-medium text-gray-700 text-center">
  vous n’êtes pas obligés de rester seuls.
</p>


</div>

        {/* VALEURS */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            [
              "Confidentialité totale",
              "Les échanges se font dans un cadre strictement confidentiel.",
            ],
            [
              "Neutralité",
              "Un espace où chacun peut s’exprimer librement, sans jugement.",
            ],
            [
              "Cadre structuré",
              "Des repères clairs, des objectifs précis et un suivi cohérent.",
            ],
            [
              "Présentiel / Visio",
              "Consultations à Netanya ou en visio, selon votre situation.",
            ],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="font-semibold">{title}</div>
              <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                {desc}
              </div>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="mt-16 rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center">
          <h2 className="text-xl font-semibold">
            Vous souhaitez faire le point sur votre situation ?
          </h2>

          <p className="mt-3 text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Vous pouvez m’envoyer quelques phrases pour m’expliquer votre situation.
            Je vous répondrai rapidement afin de vous proposer un cadre adapté.
          </p>

          <a
            href={WHATSAPP_LINK}
            className="inline-flex items-center justify-center mt-6 rounded-md bg-[#16A34A] text-white px-7 py-3.5 text-sm font-semibold shadow-sm hover:bg-[#15803D] transition"
          >
            Prendre contact sur WhatsApp
          </a>

          <p className="mt-3 text-xs text-gray-600">
            Réponse rapide • Échanges confidentiels • Sans engagement
          </p>
        </div>

        {/* RETOUR */}
        <a
          href="/"
          className="inline-block mt-10 text-sm text-gray-600 underline"
        >
          ← Retour à l’accueil
        </a>
      </section>
    </main>
  );
}
