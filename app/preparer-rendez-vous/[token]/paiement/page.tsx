import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findDossierByIntakeToken } from "@/lib/db";
import { formatPaymentAmount, PAYMENT_OPTIONS } from "@/lib/payment-config";
import { paymentWindowStatus } from "@/lib/payment-window";
import { getStripe, stripeConfigured, stripePublishableKey } from "@/lib/stripe";
import { synchronizePaymentIntent } from "@/lib/stripe-payment-state";
import PaymentAuthentication from "./PaymentAuthentication";
import PaymentSetupForm from "./PaymentSetupForm";

export const metadata: Metadata = {
  title: "Moyen de paiement sécurisé",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function defaultEmail(dossier: Awaited<ReturnType<typeof findDossierByIntakeToken>>) {
  if (!dossier?.intake) return "";
  return dossier.consultationType === "individual"
    ? dossier.intake.individualEmail || ""
    : dossier.intake.husbandEmail || dossier.intake.wifeEmail || "";
}

export default async function PaymentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dossier = await findDossierByIntakeToken(token).catch(() => null);
  if (!dossier) notFound();

  if (!dossier.intakeCompletedAt) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold">Le formulaire doit d’abord être complété</h1>
          <Link className="mt-5 inline-block rounded-xl bg-green-800 px-5 py-3 font-semibold text-white" href={`/preparer-rendez-vous/${token}`}>
            Revenir au formulaire
          </Link>
        </div>
      </main>
    );
  }

  const payment = dossier.payment;
  let stripeAlreadyPaid = false;
  let authentication: { clientSecret: string; paymentIntentId: string } | null = null;
  if (payment.status === "requires_action" && payment.stripePaymentIntentId && stripeConfigured()) {
    try {
      const paymentIntent = await getStripe().paymentIntents.retrieve(payment.stripePaymentIntentId);
      if (paymentIntent.status === "succeeded") {
        await synchronizePaymentIntent(paymentIntent);
        stripeAlreadyPaid = true;
      }
      if (paymentIntent.status === "requires_action" && paymentIntent.client_secret) {
        authentication = {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      }
    } catch {
      // The regular status card below remains available if Stripe is temporarily unreachable.
    }
  }
  if (stripeAlreadyPaid) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-green-200 bg-green-50 p-8 text-center text-green-950">
          <h1 className="text-2xl font-bold">Paiement confirmé</h1>
          <p className="mt-3">Stripe a bien confirmé le règlement.</p>
        </div>
      </main>
    );
  }
  if (authentication) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <PaymentAuthentication
            token={token}
            clientSecret={authentication.clientSecret}
            publishableKey={stripePublishableKey()}
            paymentIntentId={authentication.paymentIntentId}
          />
        </div>
      </main>
    );
  }
  const hasSavedMethod = Boolean(payment.stripePaymentMethodId);
  if (hasSavedMethod || payment.status === "paid") {
    const label = payment.plan ? PAYMENT_OPTIONS[payment.plan].label : "Formule choisie";
    const amount = payment.amount !== null && payment.currency
      ? formatPaymentAmount(payment.amount, payment.currency)
      : null;
    return (
      <main className="min-h-[70vh] bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold text-green-800">Étape 3 sur 3</p>
          <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-8 text-center text-green-950">
            <h1 className="text-2xl font-bold">
              {payment.status === "paid"
                ? "Paiement effectué"
                : payment.status === "charge_pending"
                  ? "Paiement en cours de confirmation"
                  : "Moyen de paiement enregistré"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed">
              {payment.status === "paid"
                ? `Le règlement de ${amount || "la formule choisie"} a bien été confirmé.`
                : payment.status === "charge_pending"
                  ? "Stripe vérifie actuellement le règlement. Ne recommencez pas le paiement."
                  : payment.status === "failed"
                    ? "Votre moyen de paiement reste enregistré, mais le dernier règlement n’a pas été confirmé. Aucun nouveau débit ne sera tenté automatiquement."
                    : "Votre moyen de paiement est enregistré de façon sécurisée par Stripe. Aucun montant n’a été débité à cette étape."}
            </p>
            <div className="mx-auto mt-5 max-w-md rounded-2xl border border-green-200 bg-white p-4 text-sm">
              <p><strong>{label}</strong>{amount ? ` · ${amount}` : ""}</p>
              {payment.cardLast4 ? (
                <p className="mt-1 text-gray-600">
                  {payment.cardBrand || "Carte"} se terminant par {payment.cardLast4}
                  {payment.cardExpMonth && payment.cardExpYear ? ` · expiration ${String(payment.cardExpMonth).padStart(2, "0")}/${payment.cardExpYear}` : ""}
                </p>
              ) : null}
            </div>
            {payment.status === "ready" ? (
              <p className="mt-5 text-sm leading-relaxed">
                Le débit ne pourra être déclenché qu’après la séance. Il n’y a aucun abonnement
                ni renouvellement automatique.
              </p>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  const windowStatus = paymentWindowStatus();
  const configured = stripeConfigured();

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-green-800">Étape 3 sur 3 · page privée</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Enregistrer votre moyen de paiement</h1>
        <p className="mt-4 leading-relaxed text-gray-700">
          Cette étape sécurise le rendez-vous. <strong>Aucun montant n’est débité maintenant ni avant la séance.</strong>
        </p>
        <section className="mt-8 rounded-3xl border bg-white p-6 md:p-8">
          {!configured ? (
            <div className="rounded-2xl bg-amber-50 p-5 text-amber-950">
              Le service Stripe est en cours de configuration. Vous pourrez revenir sur ce même lien.
            </div>
          ) : windowStatus.blocked ? (
            <div className="rounded-2xl bg-amber-50 p-5 text-amber-950">
              <h2 className="font-semibold">Service momentanément suspendu</h2>
              <p className="mt-2 text-sm leading-relaxed">
                L’enregistrement du moyen de paiement est fermé pendant Chabbat et Yom Tov,
                avec une marge de sécurité de 30 minutes.
                {windowStatus.nextAllowedAt ? ` Vous pourrez reprendre à partir du ${new Date(windowStatus.nextAllowedAt).toLocaleString("fr-FR", { timeZone: "Asia/Jerusalem", dateStyle: "full", timeStyle: "short" })}.` : ""}
              </p>
            </div>
          ) : (
            <PaymentSetupForm token={token} defaultEmail={defaultEmail(dossier)} />
          )}
        </section>
      </div>
    </main>
  );
}
