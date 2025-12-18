export default function MentionsLegalesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-10">
      <h1 className="text-4xl font-bold tracking-tight">
        Mentions légales
      </h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Éditeur du site</h2>
        <p className="text-gray-700">
          Activité : Conseiller conjugal<br />
          Responsable du site : Yoni Berrebi<br />
          Email : conseiller.conjugal.israel@gmail.com<br />
          Téléphone (Israël) : +972 58 536 05 10<br />
          Téléphone (France) : +33 1 77 47 32 45<br />
          Pays d’activité : Israël
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hébergement</h2>
        <p className="text-gray-700">
          Le site est hébergé par la société Vercel Inc.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Responsabilité</h2>
        <p className="text-gray-700">
          Les informations et contenus présentés sur ce site sont fournis à titre informatif.
Ils ne constituent pas un avis médical, psychologique ou juridique.
En cas de situation urgente, il est recommandé de contacter les services compétents de votre pays.

        </p>
      </section>

      <a href="/" className="text-sm text-gray-600 underline">
        ← Retour à l’accueil
      </a>
    </main>
  );
}
