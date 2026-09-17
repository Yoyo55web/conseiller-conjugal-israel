import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findDossierByIntakeToken } from "@/lib/db";
import { formatPaymentAmount, PAYMENT_OPTIONS } from "@/lib/payment-config";
import { paymentWindowStatus } from "@/lib/payment-window";
import { getStripe, stripeConfigured, stripePublishableKey } from "@/lib/stripe";
import { synchronizePaymentIntent } from "@/lib/stripe-payment-state";
import PaymentAuthentication from "./PaymentAuthentication";
import PaymentContinuationForm from "./PaymentContinuationForm";
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

function paymentChoiceLabel(payment: NonNullable<Awaited<ReturnType<typeof findDossierByIntakeToken>>>["payment"]) {
  if (!payment.plan) return "Formule choisie";
  return payment.plan === "pack6" && payment.authorization?.purpose === "continuation"
    ? "Nouveau cycle de 6 séances"
    : PAYMENT_OPTIONS[payment.plan].label;
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
  let authentication: { clientSecret: string; paymentIntentId: string } | null = null;
  if (payment.status === "requires_action" && payment.stripePaymentIntentId && stripeConfigured()) {
    try {
      const paymentIntent = await getStripe().paymentIntents.retrieve(payment.stripePaymentIntentId);
      if (paymentIntent.status === "succeeded") {
        await synchronizePaymentIntent(paymentIntent);
        redirect(`/preparer-rendez-vous/${token}/paiement`);
      }
      if (paymentIntent.status === "requires_action" && paymentIntent.client_secret) {
        authentication = {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) throw error;
      // The regular status card below remains available if Stripe is temporarily unreachable.
    }
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
  if (payment.status === "paid") {
    const label = paymentChoiceLabel(payment);
    const amount = payment.amount !== null && payment.currency
      ? formatPaymentAmount(payment.amount, payment.currency)
      : null;
    return (
      <main className="min-h-[70vh] bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold text-green-800">Page privée de paiement</p>
          <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-8 text-center text-green-950">
            <h1 className="text-2xl font-bold">Paiement effectué</h1>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed">
              Le règlement de {amount || "la formule choisie"} a bien été confirmé. Un reçu de
              paiement Stripe est envoyé à l’adresse indiquée lors de l’autorisation.
            </p>
            <div className="mx-auto mt-5 max-w-md rounded-2xl border border-green-200 bg-white p-4 text-sm">
              <p><strong>{label}</strong>{amount ? ` · ${amount}` : ""}</p>
              {payment.paidAt ? <p className="mt-1 text-gray-600">Réglé le {new Date(payment.paidAt).toLocaleString("fr-FR", { timeZone: "Asia/Jerusalem", dateStyle: "long", timeStyle: "short" })}</p> : null}
              {payment.cardLast4 ? (
                <p className="mt-1 text-gray-600">
                  {payment.cardBrand || "Carte"} se terminant par {payment.cardLast4}
                </p>
              ) : null}
            </div>
          </div>
          <PaymentContinuationForm
            token={token}
            defaultName={payment.authorization?.cardholderName || ""}
            defaultEmail={payment.authorization?.receiptEmail || defaultEmail(dossier)}
            defaultCurrency={payment.currency || "ils"}
          />
        </div>
      </main>
    );
  }
  if (hasSavedMethod) {
    const label = paymentChoiceLabel(payment);
    const amount = payment.amount !== null && payment.currency
      ? formatPaymentAmount(payment.amount, payment.currency)
      : null;
    const isContinuationAuthorization = Boolean(payment.cycleId && !payment.stripeSetupIntentId);
    return (
      <main className="min-h-[70vh] bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold text-green-800">Étape 3 sur 3</p>
          <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-8 text-center text-green-950">
            <h1 className="text-2xl font-bold">
              {payment.status === "charge_pending"
                  ? "Paiement en cours de confirmation"
                  : isContinuationAuthorization
                    ? "Poursuite autorisée"
                    : "Moyen de paiement enregistré"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed">
              {payment.status === "charge_pending"
                  ? "Stripe vérifie actuellement le règlement. Ne recommencez pas le paiement."
                  : payment.status === "failed"
                    ? "Votre moyen de paiement reste enregistré, mais le dernier règlement n’a pas été confirmé. Aucun nouveau débit ne sera tenté automatiquement."
                    : isContinuationAuthorization
                      ? "Votre nouvelle autorisation est enregistrée sur ce même lien. La date de la prochaine séance doit maintenant être convenue."
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
                Le débit ne pourra être déclenché qu’{payment.plan === "pack6" ? "après la première séance de ce cycle" : "après la séance concernée"}.
                Il n’y a aucun abonnement ni renouvellement automatique.
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
          Cette étape permet d’enregistrer votre moyen de paiement en toute sécurité.
          <strong> Aucun montant ne sera débité avant la première séance.</strong>
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
