import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findDossierByIntakeToken } from "@/lib/db";
import IntakeForm from "./IntakeForm";

export const metadata: Metadata = {
  title: "Préparer votre rendez-vous",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dossier = await findDossierByIntakeToken(token).catch(() => null);
  if (!dossier) notFound();

  return (
    <main className="bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-green-800">Lien personnel et confidentiel</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Préparer votre premier rendez-vous</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-gray-700">
          Ce formulaire permet de consacrer davantage de temps à votre situation pendant la séance. Comptez environ 8 à 10 minutes et remplissez-le ensemble.
        </p>
        {dossier.appointmentAt ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-950">
            <strong>Rendez-vous prévu :</strong> {new Date(dossier.appointmentAt).toLocaleString("fr-FR", { timeZone: "Asia/Jerusalem", dateStyle: "full", timeStyle: "short" })} · {dossier.appointmentMode}
          </div>
        ) : null}
        <div className="mt-8">
          {dossier.intakeCompletedAt ? (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
              <h2 className="text-2xl font-bold text-green-950">Formulaire déjà enregistré</h2>
              <p className="mt-3 text-green-900">Votre préparation et les deux validations ont bien été reçues.</p>
            </div>
          ) : <IntakeForm token={token} />}
        </div>
      </div>
    </main>
  );
}
