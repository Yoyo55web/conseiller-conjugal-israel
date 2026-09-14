import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listDossiers, listFeedback } from "@/lib/db";
import {
  approveFeedbackAction,
  createDossierAction,
  logoutAction,
} from "./actions";
import CopyLink from "./CopyLink";

export const metadata: Metadata = {
  title: "Dossiers privés",
  robots: { index: false, follow: false },
};

function privateUrl(path: string, token: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.conseiller-conjugal-israel.com";
  return `${origin}${path}/${token}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ creation?: string; erreur?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const [{ creation, erreur }, dossiers, feedback] = await Promise.all([
    searchParams,
    listDossiers(),
    listFeedback(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-green-800">Espace privé</p>
            <h1 className="text-3xl font-bold tracking-tight">Dossiers de consultation</h1>
          </div>
          <form action={logoutAction}>
            <button className="rounded-xl border bg-white px-4 py-2 text-sm font-medium">
              Se déconnecter
            </button>
          </form>
        </div>

        {creation ? (
          <p className="rounded-xl bg-green-50 p-4 text-sm text-green-900">
            Dossier créé. Les deux liens privés sont disponibles ci-dessous.
          </p>
        ) : null}
        {erreur ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-900">
            Le dossier n’a pas pu être créé. Vérifiez le nom indiqué.
          </p>
        ) : null}

        <section className="rounded-3xl border bg-white p-6 md:p-8">
          <h2 className="text-xl font-semibold">Créer un dossier et ses liens privés</h2>
          <p className="mt-2 text-sm text-gray-600">
            Utilisez un repère court que vous seul comprenez. Les liens sont longs et non indexés.
          </p>
          <form action={createDossierAction} className="mt-6 grid gap-4 md:grid-cols-4">
            <label className="text-sm font-medium md:col-span-2">
              Nom du dossier
              <input
                name="label"
                required
                placeholder="Ex. Couple B. – septembre 2026"
                className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"
              />
            </label>
            <label className="text-sm font-medium">
              Rendez-vous
              <input name="appointmentAt" type="datetime-local" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
            </label>
            <label className="text-sm font-medium">
              Format
              <select name="appointmentMode" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">
                <option value="visio">Visioconférence</option>
                <option value="domicile">À domicile</option>
                <option value="presentiel">Présentiel</option>
              </select>
            </label>
            <button className="rounded-xl bg-green-800 px-5 py-3 font-semibold text-white md:col-span-4 md:justify-self-start">
              Créer les liens privés
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Dossiers</h2>
          {dossiers.length === 0 ? (
            <p className="rounded-2xl border bg-white p-6 text-gray-600">Aucun dossier pour le moment.</p>
          ) : dossiers.map((dossier) => {
            const intakeUrl = privateUrl("/preparer-rendez-vous", dossier.intakeToken);
            const feedbackUrl = privateUrl("/avis", dossier.feedbackToken);
            return (
              <article key={dossier.id} className="rounded-2xl border bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{dossier.label}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {dossier.appointmentMode} · {dossier.appointmentAt ? new Date(dossier.appointmentAt).toLocaleString("fr-FR", { timeZone: "Asia/Jerusalem" }) : "date à préciser"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${dossier.intakeCompletedAt ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-900"}`}>
                    {dossier.intakeCompletedAt ? "Formulaire complété" : "En attente"}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <CopyLink label="Lien de préparation" value={intakeUrl} />
                  <CopyLink label="Lien d’avis après l’accompagnement" value={feedbackUrl} />
                </div>
                {dossier.intake ? (
                  <details className="mt-5 rounded-xl border bg-gray-50 p-4">
                    <summary className="cursor-pointer font-medium">Consulter les réponses</summary>
                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      <p><strong>Époux :</strong> {dossier.intake.husbandFirstName} {dossier.intake.husbandLastName} · {dossier.intake.husbandEmail} · {dossier.intake.husbandPhone}</p>
                      <p><strong>Épouse :</strong> {dossier.intake.wifeFirstName} {dossier.intake.wifeLastName} · {dossier.intake.wifeEmail} · {dossier.intake.wifePhone}</p>
                      {dossier.intake.mainReason ? <p><strong>Motif :</strong> {dossier.intake.mainReason}</p> : null}
                      {dossier.intake.priority ? <p><strong>Priorité :</strong> {dossier.intake.priority}</p> : null}
                      <p><strong>Enfants :</strong> {dossier.intake.children || "Non renseigné"}</p>
                      <p><strong>Accompagnement antérieur :</strong> {dossier.intake.previousSupport || "Non renseigné"}</p>
                      <p><strong>Cadre accepté :</strong> {dossier.intake.husbandSignature} et {dossier.intake.wifeSignature}</p>
                      <p><strong>Sécurité de parole :</strong> époux {dossier.intake.husbandSafe}, épouse {dossier.intake.wifeSafe}</p>
                    </div>
                  </details>
                ) : null}
              </article>
            );
          })}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Avis reçus</h2>
          {feedback.length === 0 ? (
            <p className="rounded-2xl border bg-white p-6 text-gray-600">Aucun avis pour le moment.</p>
          ) : feedback.map((item) => (
            <article key={item.id} className="rounded-2xl border bg-white p-6">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.dossierLabel}</h3>
                  <p className="text-sm text-gray-600">Note : {item.data.rating}/5 · Choix : {item.publicationChoice}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.publicationApproved ? "bg-green-100 text-green-900" : "bg-gray-100 text-gray-700"}`}>
                  {item.publicationApproved ? "Publication validée" : "Privé / à examiner"}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm leading-relaxed">
                <p><strong>Apport :</strong> {item.data.benefit}</p>
                {item.data.appreciated ? <p><strong>Apprécié :</strong> {item.data.appreciated}</p> : null}
                {item.data.suggestion ? <p><strong>Suggestion :</strong> {item.data.suggestion}</p> : null}
              </div>
              {item.publicationChoice !== "private" && item.data.consent ? (
                <form action={approveFeedbackAction} className="mt-4">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="approved" value={String(!item.publicationApproved)} />
                  <button className="rounded-lg border px-4 py-2 text-sm font-medium">
                    {item.publicationApproved ? "Retirer de la publication" : "Valider pour publication"}
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
