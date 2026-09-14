"use client";

import { useState } from "react";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20";

export default function IntakeForm({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.husbandAccepted = form.get("husbandAccepted") === "on" ? "true" : "false";
    payload.wifeAccepted = form.get("wifeAccepted") === "on" ? "true" : "false";
    payload.privacyAccepted = form.get("privacyAccepted") === "on" ? "true" : "false";

    const response = await fetch(`/api/intake/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(result.error || "Le formulaire n’a pas pu être enregistré.");
      return;
    }
    setStatus("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-green-950">Préparation enregistrée</h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-green-900">
          Vos informations et vos deux validations ont bien été enregistrées. Vous recevrez
          séparément les dernières indications utiles avant le rendez-vous.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="rounded-3xl border bg-white p-6 md:p-8">
        <h2 className="text-2xl font-semibold">1. Vos coordonnées</h2>
        <p className="mt-2 text-sm text-gray-600">Chaque conjoint indique ses propres coordonnées.</p>
        <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          Chacun doit pouvoir répondre librement. Si l’un de vous ne peut pas répondre à la
          question sur la sécurité en présence de l’autre, complétez cette partie séparément
          ou contactez directement le conseiller avant la séance commune.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <fieldset className="space-y-4 rounded-2xl bg-gray-50 p-5">
            <legend className="px-2 font-semibold">Époux</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Prénom<input className={inputClass} name="husbandFirstName" required /></label>
              <label className="text-sm font-medium">Nom<input className={inputClass} name="husbandLastName" required /></label>
              <label className="text-sm font-medium">Âge<input className={inputClass} name="husbandAge" inputMode="numeric" required /></label>
              <label className="text-sm font-medium">Téléphone<input className={inputClass} name="husbandPhone" type="tel" required /></label>
            </div>
            <label className="block text-sm font-medium">Email personnel<input className={inputClass} name="husbandEmail" type="email" autoComplete="email" required /></label>
          </fieldset>
          <fieldset className="space-y-4 rounded-2xl bg-gray-50 p-5">
            <legend className="px-2 font-semibold">Épouse</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Prénom<input className={inputClass} name="wifeFirstName" required /></label>
              <label className="text-sm font-medium">Nom<input className={inputClass} name="wifeLastName" required /></label>
              <label className="text-sm font-medium">Âge<input className={inputClass} name="wifeAge" inputMode="numeric" required /></label>
              <label className="text-sm font-medium">Téléphone<input className={inputClass} name="wifePhone" type="tel" required /></label>
            </div>
            <label className="block text-sm font-medium">Email personnel<input className={inputClass} name="wifeEmail" type="email" autoComplete="email" required /></label>
          </fieldset>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium">Date du mariage<input className={inputClass} name="marriageDate" type="date" /></label>
          <label className="text-sm font-medium">Pays de résidence<input className={inputClass} name="country" required /></label>
          <label className="text-sm font-medium md:col-span-1">Enfants : nombre et âges<input className={inputClass} name="children" placeholder="Ex. 3 enfants : 8, 5 et 2 ans" /></label>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 md:p-8">
        <h2 className="text-2xl font-semibold">2. Préparer la première séance</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Quelques indications suffisent. Les éléments les plus intimes pourront être abordés oralement.
        </p>
        <div className="mt-6 space-y-5">
          <label className="block text-sm font-medium">Quelle est la principale raison de votre démarche ?<textarea className={`${inputClass} min-h-28`} name="mainReason" required maxLength={1500} /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">Depuis quand la difficulté existe-t-elle ?<input className={inputClass} name="difficultySince" required /></label>
            <label className="text-sm font-medium">Votre priorité pour cet accompagnement<input className={inputClass} name="priority" required /></label>
          </div>
          <label className="block text-sm font-medium">Avez-vous déjà bénéficié d’un accompagnement conjugal ou individuel ? <span className="font-normal text-gray-500">(facultatif)</span><textarea className={`${inputClass} min-h-20`} name="previousSupport" maxLength={800} /></label>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 md:p-8">
        <h2 className="text-2xl font-semibold">3. Cadre de l’accompagnement</h2>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-950">Première séance et progression</h3>
            <p>La première séance sert principalement à comprendre l’histoire du couple, la situation actuelle et les attentes de chacun. De premières orientations peuvent être proposées, mais un changement durable demande généralement un travail progressif. Un cycle initial de six séances est recommandé, sans obligation de poursuivre et sans garantie de résultat.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-950">Pendant les séances</h3>
            <p>Chacun parle à son tour sans être interrompu. Les insultes, menaces, humiliations et propos violents ne sont pas acceptés. Les téléphones restent silencieux et les enfants ne participent pas. La séance peut être interrompue si le cadre n’est plus respecté.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-950">Entre les séances</h3>
            <p>Les paroles exprimées en consultation ne doivent pas être utilisées comme une arme ou un reproche. Il est recommandé d’éviter de multiplier les conseils extérieurs, souvent partiels ou contradictoires, et d’en parler en séance avant de les appliquer.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-950">Cohérence du suivi</h3>
            <p>Pour préserver une direction claire, il est demandé de ne pas entreprendre simultanément un second suivi conjugal sans en parler préalablement. Cela ne concerne pas les accompagnements médicaux, psychologiques, rabbiniques, juridiques ou tout autre suivi spécialisé.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-950">Visioconférence et confidentialité</h3>
            <p>Chaque participant s’installe dans un endroit calme et privé. Aucun enregistrement ni capture ne peut être effectué sans l’accord de tous. Les échanges sont traités avec discrétion, dans les limites prévues par la loi et la sécurité des personnes. Ce service n’est pas un service d’urgence.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 md:p-8">
        <h2 className="text-2xl font-semibold">4. Validation personnelle de chacun</h2>
        <p className="mt-2 text-sm text-gray-600">Chaque conjoint doit lire et valider personnellement le cadre.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <fieldset className="space-y-4 rounded-2xl border p-5">
            <legend className="px-2 font-semibold">Validation de l’époux</legend>
            <label className="block text-sm font-medium">Vous sentez-vous libre et en sécurité pour parler pendant une séance commune ?
              <select className={inputClass} name="husbandSafe" required><option value="">Choisir</option><option value="oui">Oui</option><option value="non">Non</option><option value="à_aborder_en_privé">Je souhaite l’aborder en privé</option></select>
            </label>
            <label className="block text-sm font-medium">Nom complet servant de validation<input className={inputClass} name="husbandSignature" required /></label>
            <label className="flex items-start gap-3 text-sm"><input className="mt-1 h-4 w-4" type="checkbox" name="husbandAccepted" required /><span>J’ai personnellement lu et j’accepte le cadre de l’accompagnement.</span></label>
          </fieldset>
          <fieldset className="space-y-4 rounded-2xl border p-5">
            <legend className="px-2 font-semibold">Validation de l’épouse</legend>
            <label className="block text-sm font-medium">Vous sentez-vous libre et en sécurité pour parler pendant une séance commune ?
              <select className={inputClass} name="wifeSafe" required><option value="">Choisir</option><option value="oui">Oui</option><option value="non">Non</option><option value="à_aborder_en_privé">Je souhaite l’aborder en privé</option></select>
            </label>
            <label className="block text-sm font-medium">Nom complet servant de validation<input className={inputClass} name="wifeSignature" required /></label>
            <label className="flex items-start gap-3 text-sm"><input className="mt-1 h-4 w-4" type="checkbox" name="wifeAccepted" required /><span>J’ai personnellement lu et j’accepte le cadre de l’accompagnement.</span></label>
          </fieldset>
        </div>
        <label className="mt-6 flex items-start gap-3 rounded-2xl bg-gray-50 p-4 text-sm">
          <input className="mt-1 h-4 w-4" type="checkbox" name="privacyAccepted" required />
          <span>Nous avons pris connaissance de l’utilisation de ces informations pour préparer et assurer le suivi de l’accompagnement, ainsi que de la politique de confidentialité.</span>
        </label>
      </section>

      {status === "error" ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-900">{message}</p> : null}
      <button disabled={status === "sending"} className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-green-900 disabled:opacity-60">
        {status === "sending" ? "Enregistrement…" : "Enregistrer notre préparation"}
      </button>
      <p className="text-center text-xs text-gray-500">Aucune donnée bancaire n’est demandée dans ce formulaire.</p>
    </form>
  );
}
