const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20la%20pr%C3%A9paration%20au%20mariage%20et%20prendre%20rendez-vous.%20Voici%20notre%20situation%20en%202-3%20phrases%20%3A%20";

export default function PreparationAuMariagePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-bold tracking-tight">
          Préparation au mariage
        </h1>

        {/* IMAGE SYMBOLIQUE */}
        <div className="mt-8 mb-12 flex justify-center">
          <img
            src="/images/preparation-mariage.png"
            alt="Préparation au mariage – réflexion et construction des bases du couple"
            className="w-full max-w-3xl rounded-2xl object-cover"
          />
        </div>

        <p className="mt-4 text-lg text-gray-600 max-w-3xl">
          Un accompagnement <strong>structuré</strong> pour partir sur des
          <strong> bases solides</strong>, clarifier les attentes et construire
          une <strong>vie conjugale saine et équilibrée</strong>.
          <br />
          <span className="text-sm text-gray-500">
            Approche basée sur les <strong>fondements du mariage selon la Torah</strong>,
            incluant les <strong>lois de la vie conjugale</strong> et de la
            <strong> pureté familiale</strong>.
          </span>
        </p>

        {/* CARTES OBJECTIF / MÉTHODE / CADRE */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            [
              "Objectif",
              "Mettre de la clarté",
              "Comprendre le cadre du mariage et poser des bases stables dès le départ.",
            ],
            [
              "Méthode",
              "Transmission claire et structurée",
              "Contenus adaptés à chaque couple, sans pression ni jugement.",
            ],
            [
              "Cadre",
              "Respectueux & confidentiel",
              "En visio ou en présentiel selon les disponibilités.",
            ],
          ].map(([title, line1, line2]) => (
            <div key={title} className="rounded-2xl border p-6">
              <div className="font-semibold">{title}</div>
              <div className="mt-2 text-gray-600">{line1}</div>
              <div className="text-gray-600">{line2}</div>
            </div>
          ))}
        </div>

        {/* THÈMES TRANSMIS */}
        <div className="mt-10 rounded-2xl border bg-gray-50 p-6">
          <h2 className="text-xl font-semibold">Thèmes abordés</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-gray-700">
            {[
              "Fondements du mariage selon la Torah",
              "Comprendre le lien conjugal et ses enjeux",
              "Lois liées à la vie conjugale",
              "Pureté familiale (Taharat Hamichpaha)",
              "Respect, communication et équilibre dans le couple",
              "Rôles, attentes et responsabilité de chacun",
              "Construire un foyer sain et durable",
              "Accompagnement progressif avant et après le mariage",
            ].map((item) => (
              <div key={item} className="rounded-xl border bg-white px-4 py-3">
                {item}
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={WHATSAPP_LINK}
            className="inline-block mt-8 rounded-md bg-green-600 text-white px-6 py-3 text-sm font-medium"
          >
            Écrire sur WhatsApp – préparation au mariage
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
