const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous.%20Voici%2C%20en%202-3%20phrases%2C%20ma%20situation%20%3A%20";

export default function QuiSuisJePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Qui suis-je</h1>

        <p className="mt-6 text-lg text-gray-700">
          Je suis <strong>conseiller conjugal francophone en Israël</strong>. J’accompagne
          les couples et les personnes qui traversent des difficultés relationnelles,
          des conflits, des périodes de crise ou des décisions importantes.
        </p>

        <p className="mt-4 text-gray-700">
          Mon approche est <strong>structurée, bienveillante et orientée solutions</strong>.
          L’objectif n’est pas de juger ni de prendre parti, mais de vous aider à clarifier
          la situation, apaiser les tensions et avancer de manière concrète.
        </p>

        <p className="mt-4 text-gray-700">
          Cet accompagnement s’appuie sur une formation approfondie et une expérience de
          terrain auprès de couples aux situations variées.
        </p>

        <p className="mt-4 text-gray-700">
          Chaque accompagnement se fait dans un cadre <strong>strictement confidentiel</strong>,
          respectueux de votre rythme, de votre histoire et de vos valeurs.
        </p>

        {/* CARTES VALEURS */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            ["Confidentialité totale", "Un espace sûr pour parler librement, sans crainte d’être jugé."],
            ["Neutralité", "Aucune prise de parti : chacun peut s’exprimer librement."],
            ["Méthode claire", "Un cadre structuré avec des objectifs concrets et réalistes."],
            ["Visio / présentiel", "Selon votre situation et vos préférences."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border p-5">
              <div className="font-semibold">{title}</div>
              <div className="mt-1 text-gray-600 text-sm">{desc}</div>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="mt-12 rounded-3xl border bg-gray-50 p-8 text-center">
          <h2 className="text-xl font-semibold">
            Vous souhaitez faire le point sur votre situation ?
          </h2>

          <p className="mt-3 text-gray-600">
            Envoyez-moi 2–3 phrases sur votre situation. Je vous répondrai rapidement
            pour fixer un rendez-vous.
          </p>

          <a
            href={WHATSAPP_LINK}
            className="inline-block mt-6 rounded-md bg-green-600 text-white px-6 py-3 text-sm font-medium"
          >
            Prendre rendez-vous sur WhatsApp
          </a>

          <p className="mt-3 text-xs text-gray-500">
            Réponse rapide • Échanges confidentiels • Sans engagement
          </p>
        </div>

        <a href="/" className="inline-block mt-10 text-sm text-gray-600 underline">
          ← Retour à l’accueil
        </a>
      </section>
    </main>
  );
}
