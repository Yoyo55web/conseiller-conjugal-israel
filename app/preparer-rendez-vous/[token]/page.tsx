import type { Metadata } from "next";
import Link from "next/link";
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
  const isIndividual = dossier.consultationType === "individual";

  return (
    <main className="bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-green-800">Lien personnel et confidentiel</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          {isIndividual ? "Préparer votre premier rendez-vous individuel" : "Préparer votre premier rendez-vous"}
        </h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-gray-700">
          Ce formulaire permet de consacrer davantage de temps à votre situation pendant la séance.
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
              <p className="mt-3 text-green-900">
                {isIndividual
                  ? "Votre préparation et vos validations ont bien été reçues."
                  : "Votre préparation et les validations de chacun ont bien été reçues."}
              </p>
              <Link
                href={`/preparer-rendez-vous/${token}/paiement`}
                className="mt-6 inline-block rounded-xl bg-green-800 px-5 py-3 font-semibold text-white"
              >
                {dossier.payment.stripePaymentMethodId ? "Voir la confirmation" : "Continuer vers le moyen de paiement"}
              </Link>
            </div>
          ) : <IntakeForm token={token} consultationType={dossier.consultationType} />}
        </div>
      </div>
    </main>
  );
}
