import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { findDossierByIntakeToken } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { finalizeSetupIntent } from "@/lib/stripe-payment-state";

export const metadata: Metadata = {
  title: "Confirmation du moyen de paiement",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function PaymentConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ setup_intent?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const dossier = await findDossierByIntakeToken(token).catch(() => null);
  const setupIntentId = query.setup_intent || "";
  if (dossier && setupIntentId && setupIntentId === dossier.payment.stripeSetupIntentId) {
    try {
      const setupIntent = await getStripe().setupIntents.retrieve(setupIntentId);
      if (setupIntent.status === "succeeded" && await finalizeSetupIntent(setupIntent)) {
        redirect(`/preparer-rendez-vous/${token}/paiement?enregistrement=ok`);
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) throw error;
    }
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Vérification non terminée</h1>
        <p className="mt-3 text-gray-700">Le moyen de paiement n’a pas encore pu être confirmé. Aucun montant n’a été débité.</p>
        <Link className="mt-5 inline-block rounded-xl bg-green-800 px-5 py-3 font-semibold text-white" href={`/preparer-rendez-vous/${token}/paiement`}>
          Réessayer
        </Link>
      </div>
    </main>
  );
}
