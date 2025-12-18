export default function ConfidentialitePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-10">
      <h1 className="text-4xl font-bold tracking-tight">
        Politique de confidentialité
      </h1>

      <p className="text-gray-600">
        La confidentialité et le respect de votre vie privée sont essentiels dans le cadre
        de l’accompagnement proposé. Les échanges restent strictement confidentiels.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Données collectées</h2>
        <p className="text-gray-700">
          Lorsque vous me contactez (WhatsApp, téléphone ou email), je peux recevoir certaines
          informations telles que votre nom, votre numéro de téléphone, votre adresse email
          et le contenu de votre message. Ces informations sont utilisées uniquement pour
          répondre à votre demande et organiser un rendez-vous.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Utilisation et conservation</h2>
        <p className="text-gray-700">
          Les informations échangées sont utilisées exclusivement dans le cadre de l’accompagnement.
          Elles ne sont jamais partagées avec des tiers. Les échanges sont conservés uniquement
          le temps nécessaire au suivi de la demande, puis supprimés lorsqu’ils ne sont plus utiles.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Vos droits</h2>
        <p className="text-gray-700">
          Vous pouvez, à tout moment, demander la suppression de vos données ou poser
          toute question relative à la confidentialité en me contactant directement.
        </p>
      </section>

      <a href="/" className="text-sm text-gray-600 underline">
        ← Retour à l’accueil
      </a>
    </main>
  );
}
