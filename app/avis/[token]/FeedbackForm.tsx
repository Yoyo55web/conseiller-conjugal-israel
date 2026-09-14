"use client";

import { useState } from "react";

const fieldClass = "mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20";

export default function FeedbackForm({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [publication, setPublication] = useState("private");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.consent = form.get("consent") === "on" ? "true" : "false";
    const response = await fetch(`/api/feedback/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error || "Votre retour n’a pas pu être enregistré.");
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-green-950">Merci pour votre retour</h2>
        <p className="mt-3 text-green-900">Votre message a bien été transmis. Il ne sera jamais publié sans l’autorisation choisie dans ce formulaire et une vérification préalable.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
      <label className="block text-sm font-medium">Votre appréciation générale
        <select className={fieldClass} name="rating" required defaultValue=""><option value="" disabled>Choisir une note</option><option value="5">5 – Très satisfait</option><option value="4">4 – Satisfait</option><option value="3">3 – Mitigé</option><option value="2">2 – Peu satisfait</option><option value="1">1 – Insatisfait</option></select>
      </label>
      <label className="mt-6 block text-sm font-medium">Qu’est-ce que cet accompagnement vous a principalement apporté ?
        <textarea className={`${fieldClass} min-h-32`} name="benefit" required maxLength={1800} />
      </label>
      <label className="mt-6 block text-sm font-medium">Qu’avez-vous le plus apprécié ? <span className="font-normal text-gray-500">(facultatif)</span>
        <textarea className={`${fieldClass} min-h-24`} name="appreciated" maxLength={1000} />
      </label>
      <label className="mt-6 block text-sm font-medium">Une suggestion pour améliorer l’accompagnement ? <span className="font-normal text-gray-500">(facultatif)</span>
        <textarea className={`${fieldClass} min-h-24`} name="suggestion" maxLength={1000} />
      </label>

      <fieldset className="mt-8 rounded-2xl bg-gray-50 p-5">
        <legend className="px-2 font-semibold">Utilisation de votre commentaire</legend>
        <div className="space-y-3 text-sm">
          <label className="flex gap-3"><input type="radio" name="publicationChoice" value="private" checked={publication === "private"} onChange={(e) => setPublication(e.target.value)} /><span>Mon retour reste strictement privé.</span></label>
          <label className="flex gap-3"><input type="radio" name="publicationChoice" value="anonymous" checked={publication === "anonymous"} onChange={(e) => setPublication(e.target.value)} /><span>J’autorise sa publication de manière anonyme.</span></label>
          <label className="flex gap-3"><input type="radio" name="publicationChoice" value="first_names" checked={publication === "first_names"} onChange={(e) => setPublication(e.target.value)} /><span>J’autorise sa publication avec le ou les prénoms indiqués.</span></label>
        </div>
        {publication === "first_names" ? (
          <label className="mt-4 block text-sm font-medium">Prénom(s) à afficher<input className={fieldClass} name="displayName" required /></label>
        ) : null}
        {publication !== "private" ? (
          <label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" name="consent" required className="mt-1 h-4 w-4" /><span>Je confirme librement mon autorisation. Le texte pourra être raccourci ou corrigé sans en modifier le sens, et je pourrai demander son retrait.</span></label>
        ) : null}
      </fieldset>
      {status === "error" ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</p> : null}
      <button disabled={status === "sending"} className="mt-7 w-full rounded-xl bg-green-800 px-6 py-4 font-semibold text-white hover:bg-green-900 disabled:opacity-60">
        {status === "sending" ? "Envoi…" : "Envoyer mon retour"}
      </button>
    </form>
  );
}
