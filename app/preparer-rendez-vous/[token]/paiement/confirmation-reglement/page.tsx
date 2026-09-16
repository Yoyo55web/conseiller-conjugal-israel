import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { findDossierByIntakeToken } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { synchronizePaymentIntent } from "@/lib/stripe-payment-state";

export const metadata: Metadata = {
  title: "Confirmation du règlement",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function ChargeConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment_intent?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const dossier = await findDossierByIntakeToken(token).catch(() => null);
  const paymentIntentId = query.payment_intent || "";
  if (dossier && paymentIntentId && paymentIntentId === dossier.payment.stripePaymentIntentId) {
    try {
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.metadata?.dossier_id === dossier.id) {
        await synchronizePaymentIntent(paymentIntent);
        if (paymentIntent.status === "succeeded") {
          redirect(`/preparer-rendez-vous/${token}/paiement`);
        }
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) throw error;
    }
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Paiement en cours de vérification</h1>
        <p className="mt-3 text-gray-700">Stripe n’a pas encore confirmé définitivement le règlement.</p>
        <Link className="mt-5 inline-block rounded-xl bg-green-800 px-5 py-3 font-semibold text-white" href={`/preparer-rendez-vous/${token}/paiement`}>
          Voir le statut
        </Link>
      </div>
    </main>
  );
}
