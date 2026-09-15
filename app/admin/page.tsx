import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listDossiers, listFeedback, type IntakeData } from "@/lib/db";
import type { ConsultationType } from "@/lib/consultation-framework";
import {
  approveFeedbackAction,
  clearDossierIntakeAction,
  createDossierAction,
  deleteDossierAction,
  deleteFeedbackAction,
  logoutAction,
} from "./actions";
import CopyLink from "./CopyLink";
import ConfirmActionButton from "./ConfirmActionButton";

export const metadata: Metadata = {
  title: "Dossiers privés",
  robots: { index: false, follow: false },
};

function privateUrl(path: string, token: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.conseiller-conjugal-israel.com";
  return `${origin}${path}/${token}`;
}

function formatDate(value?: string | null, dateOnly = false) {
  if (!value) return "Non renseigné";
  const date = dateOnly ? new Date(`${value}T12:00:00Z`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", {
    timeZone: "Asia/Jerusalem",
    dateStyle: dateOnly ? "long" : "medium",
    ...(dateOnly ? {} : { timeStyle: "short" as const }),
  });
}

function proofValue(value: boolean | undefined) {
  return value === undefined ? "Non enregistré séparément dans cette ancienne version" : value ? "Oui" : "Non";
}

function IntakeSummary({ intake, type }: { intake: IntakeData; type: ConsultationType }) {
  const actualType = intake.consultationType || type;
  const isIndividual = actualType === "individual";

  return (
    <div className="mt-4 space-y-5 text-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <p><strong>Type :</strong> {isIndividual ? "Consultation individuelle" : "Consultation de couple"}</p>
        {isIndividual ? (
          <p><strong>Personne :</strong> {intake.individualFirstName} {intake.individualLastName} · {intake.individualAge || "âge non renseigné"} ans</p>
        ) : (
          <>
            <p><strong>Époux :</strong> {intake.husbandFirstName} {intake.husbandLastName} · {intake.husbandAge || "âge non renseigné"} ans</p>
            <p><strong>Coordonnées de l’époux :</strong> {intake.husbandEmail} · {intake.husbandPhone}</p>
            <p><strong>Épouse :</strong> {intake.wifeFirstName} {intake.wifeLastName} · {intake.wifeAge || "âge non renseigné"} ans</p>
            <p><strong>Coordonnées de l’épouse :</strong> {intake.wifeEmail} · {intake.wifePhone}</p>
          </>
        )}
        {isIndividual ? <p><strong>Coordonnées :</strong> {intake.individualEmail} · {intake.individualPhone}</p> : null}
        {!isIndividual ? <p><strong>Date du mariage :</strong> {formatDate(intake.marriageDate, true)}</p> : null}
        <p><strong>Pays de résidence :</strong> {intake.country || "Non renseigné"}</p>
        <p><strong>Enfants :</strong> {intake.children || "Non renseigné"}</p>
        {intake.mainReason ? <p><strong>Motif :</strong> {intake.mainReason}</p> : null}
        {intake.difficultySince ? <p><strong>Difficulté depuis :</strong> {intake.difficultySince}</p> : null}
        {intake.priority ? <p><strong>Priorité :</strong> {intake.priority}</p> : null}
        {intake.previousSupport ? <p><strong>Accompagnement antérieur :</strong> {intake.previousSupport}</p> : null}
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-950">
        <h4 className="font-semibold">Preuve de validation enregistrée</h4>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {isIndividual ? (
            <>
              <p><strong>Nom de validation :</strong> {intake.individualSignature || "Non renseigné"}</p>
              <p><strong>Cadre complet accepté :</strong> {proofValue(intake.individualAccepted)}</p>
              <p className="md:col-span-2"><strong>Interdiction de captation et possibilité d’interrompre la séance acceptées :</strong> {proofValue(intake.individualKeyRulesAccepted)}</p>
            </>
          ) : (
            <>
              <p><strong>Nom de validation de l’époux :</strong> {intake.husbandSignature || "Non renseigné"}</p>
              <p><strong>Cadre accepté par l’époux :</strong> {proofValue(intake.husbandAccepted)}</p>
              <p><strong>Nom de validation de l’épouse :</strong> {intake.wifeSignature || "Non renseigné"}</p>
              <p><strong>Cadre accepté par l’épouse :</strong> {proofValue(intake.wifeAccepted)}</p>
              <p><strong>Règles essentielles acceptées par l’époux :</strong> {proofValue(intake.husbandKeyRulesAccepted)}</p>
              <p><strong>Règles essentielles acceptées par l’épouse :</strong> {proofValue(intake.wifeKeyRulesAccepted)}</p>
            </>
          )}
          <p><strong>Confidentialité reconnue :</strong> {intake.privacyAccepted ? "Oui" : "Non"}</p>
          <p><strong>Date et heure :</strong> {formatDate(intake.acceptedAt)}</p>
          <p><strong>Version du cadre :</strong> {intake.frameworkVersion || "Non renseignée"}</p>
          {intake.acceptedTextDigest || intake.frameworkDigest ? (
            <p className="md:col-span-2"><strong>Empreinte de l’ensemble accepté :</strong> <code className="break-all text-xs">{intake.acceptedTextDigest || intake.frameworkDigest}</code></p>
          ) : null}
        </div>
        {intake.acceptedTextSnapshot || intake.frameworkSnapshot ? (
          <details className="mt-4 rounded-lg border border-green-200 bg-white p-3">
            <summary className="cursor-pointer font-medium">Voir le texte exact accepté</summary>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">{intake.acceptedTextSnapshot || intake.frameworkSnapshot}</pre>
          </details>
        ) : (
          <p className="mt-3 text-xs text-green-800">Le texte intégral n’était pas encore archivé dans les anciennes versions du formulaire.</p>
        )}
      </div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ creation?: string; erreur?: string; suppression?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const [{ creation, erreur, suppression }, dossiers, feedback] = await Promise.all([
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
        {suppression ? (
          <p className="rounded-xl bg-green-50 p-4 text-sm text-green-900">
            {suppression === "reponses"
              ? "Les réponses du formulaire ont été supprimées. Le lien peut être rempli à nouveau."
              : suppression === "avis"
                ? "L’avis a été supprimé."
                : "Le dossier et toutes les données associées ont été supprimés."}
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
          <form action={createDossierAction} className="mt-6 grid gap-4 lg:grid-cols-5">
            <label className="text-sm font-medium lg:col-span-2">
              Nom du dossier
              <input
                name="label"
                required
                placeholder="Ex. Couple B. ou Mme D. – septembre 2026"
                className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"
              />
            </label>
            <label className="text-sm font-medium">
              Type de consultation
              <select name="consultationType" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">
                <option value="couple">Couple</option>
                <option value="individual">Une seule personne</option>
              </select>
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
            <button className="rounded-xl bg-green-800 px-5 py-3 font-semibold text-white lg:col-span-5 lg:justify-self-start">
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
                      {dossier.consultationType === "individual" ? "Consultation individuelle" : "Consultation de couple"} · {dossier.appointmentMode} · {dossier.appointmentAt ? new Date(dossier.appointmentAt).toLocaleString("fr-FR", { timeZone: "Asia/Jerusalem" }) : "date à préciser"}
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
                    <IntakeSummary intake={dossier.intake} type={dossier.consultationType} />
                  </details>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
                  {dossier.intake ? (
                    <form action={clearDossierIntakeAction}>
                      <input type="hidden" name="id" value={dossier.id} />
                      <ConfirmActionButton
                        tone="warning"
                        confirmation="Effacer définitivement les réponses et les preuves de validation de ce formulaire ? Le lien restera actif et pourra être rempli à nouveau."
                      >
                        Effacer les réponses
                      </ConfirmActionButton>
                    </form>
                  ) : null}
                  <form action={deleteDossierAction}>
                    <input type="hidden" name="id" value={dossier.id} />
                    <ConfirmActionButton confirmation={`Supprimer définitivement le dossier « ${dossier.label} », son formulaire et tous les avis associés ?`}>
                      Supprimer le dossier
                    </ConfirmActionButton>
                  </form>
                </div>
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
              <form action={deleteFeedbackAction} className="mt-4 border-t pt-4">
                <input type="hidden" name="id" value={item.id} />
                <ConfirmActionButton confirmation="Supprimer définitivement cet avis ?">
                  Supprimer cet avis
                </ConfirmActionButton>
              </form>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
