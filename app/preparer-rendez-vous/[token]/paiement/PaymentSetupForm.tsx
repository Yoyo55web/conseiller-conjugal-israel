"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  formatPaymentAmount,
  PAYMENT_OPTIONS,
  paymentAmount,
  paymentAuthorizationText,
  type PaymentCurrency,
  type PaymentPlan,
} from "@/lib/payment-config";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20";

type StripeSetup = {
  clientSecret: string;
  setupIntentId: string;
  stripePromise: Promise<Stripe | null>;
  cardholderName: string;
  receiptEmail: string;
};

function SecurePaymentElement({
  token,
  setupIntentId,
  cardholderName,
  receiptEmail,
}: {
  token: string;
  setupIntentId: string;
  cardholderName: string;
  receiptEmail: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setStatus("sending");
    setMessage("");

    const returnUrl = `${window.location.origin}/preparer-rendez-vous/${encodeURIComponent(token)}/paiement/confirmation`;
    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: returnUrl,
        payment_method_data: {
          billing_details: { name: cardholderName, email: receiptEmail },
        },
      },
      redirect: "if_required",
    });

    if (result.error) {
      setStatus("error");
      setMessage(result.error.message || "Le moyen de paiement n’a pas pu être enregistré.");
      return;
    }
    if (result.setupIntent?.status !== "succeeded") {
      setStatus("error");
      setMessage("La vérification du moyen de paiement n’est pas terminée.");
      return;
    }

    const response = await fetch(`/api/payment-setup/${encodeURIComponent(token)}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupIntentId }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(body.error || "La confirmation n’a pas pu être enregistrée.");
      return;
    }
    router.push(`/preparer-rendez-vous/${encodeURIComponent(token)}/paiement?enregistrement=ok`);
    router.refresh();
  }

  return (
    <form onSubmit={confirm} className="space-y-6">
      <div className="rounded-2xl border bg-white p-5">
        <PaymentElement
          options={{
            layout: "tabs",
            fields: { billingDetails: { name: "never", email: "never" } },
          }}
        />
      </div>
      {status === "error" ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-900">{message}</p>
      ) : null}
      <button
        disabled={!stripe || !elements || status === "sending"}
        className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-green-900 disabled:opacity-60"
      >
        {status === "sending" ? "Enregistrement sécurisé…" : "Enregistrer ce moyen de paiement"}
      </button>
      <p className="text-center text-xs leading-relaxed text-gray-500">
        La saisie est sécurisée et traitée directement par Stripe. Le site ne reçoit jamais
        le numéro complet de votre carte ni son cryptogramme.
      </p>
    </form>
  );
}

export default function PaymentSetupForm({
  token,
  defaultEmail,
}: {
  token: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PaymentPlan>("single");
  const [currency, setCurrency] = useState<PaymentCurrency>("ils");
  const [setup, setSetup] = useState<StripeSetup | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function initialize(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const cardholderName = String(form.get("cardholderName") || "").trim();
    const receiptEmail = String(form.get("receiptEmail") || "").trim();
    const response = await fetch(`/api/payment-setup/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        currency,
        cardholderName,
        receiptEmail,
        consent: form.get("consent") === "on",
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      const next = body.nextAllowedAt
        ? ` Réouverture prévue : ${new Date(body.nextAllowedAt).toLocaleString("fr-FR", { timeZone: "Asia/Jerusalem", dateStyle: "full", timeStyle: "short" })}.`
        : "";
      setMessage((body.error || "Le service Stripe n’est pas disponible.") + next);
      return;
    }
    if (body.alreadyReady) {
      router.refresh();
      return;
    }
    if (!body.clientSecret || !body.publishableKey || !body.setupIntentId) {
      setStatus("error");
      setMessage("La réponse de Stripe est incomplète.");
      return;
    }
    setSetup({
      clientSecret: body.clientSecret,
      setupIntentId: body.setupIntentId,
      stripePromise: loadStripe(body.publishableKey),
      cardholderName,
      receiptEmail,
    });
    setStatus("idle");
  }

  if (setup) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm leading-relaxed text-green-950">
          <strong>Aucun débit maintenant.</strong> Vous enregistrez uniquement un moyen de
          paiement pour {PAYMENT_OPTIONS[plan].label.toLowerCase()} de {formatPaymentAmount(paymentAmount(plan, currency), currency)}.
        </div>
        <Elements
          stripe={setup.stripePromise}
          options={{
            clientSecret: setup.clientSecret,
            appearance: {
              theme: "stripe",
              variables: { colorPrimary: "#166534", borderRadius: "12px" },
            },
          }}
        >
          <SecurePaymentElement
            token={token}
            setupIntentId={setup.setupIntentId}
            cardholderName={setup.cardholderName}
            receiptEmail={setup.receiptEmail}
          />
        </Elements>
      </div>
    );
  }

  const authorizationText = paymentAuthorizationText(plan, currency);

  return (
    <form onSubmit={initialize} className="space-y-7">
      <fieldset>
        <legend className="text-lg font-semibold">Choisissez votre formule</legend>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(["single", "pack6"] as const).map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded-2xl border p-5 ${plan === value ? "border-green-700 bg-green-50 ring-1 ring-green-700" : "bg-white"}`}
            >
              <span className="flex items-start gap-3">
                <input
                  className="mt-1 h-4 w-4"
                  type="radio"
                  name="plan"
                  value={value}
                  checked={plan === value}
                  onChange={() => setPlan(value)}
                />
                <span>
                  <strong className="block">{PAYMENT_OPTIONS[value].label}</strong>
                  <span className="mt-1 block text-sm text-gray-600">
                    {value === "single"
                      ? "250 ₪ ou 75 €"
                      : "1 400 ₪ au lieu de 1 500 ₪, ou 420 € au lieu de 450 €"}
                  </span>
                  {value === "pack6" ? (
                    <span className="mt-2 block text-sm leading-relaxed text-gray-700">
                      Un minimum de six séances permet généralement d’effectuer un travail plus approfondi.
                    </span>
                  ) : null}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-semibold">Devise</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {(["ils", "eur"] as const).map((value) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-3">
              <input
                type="radio"
                name="currency"
                value={value}
                checked={currency === value}
                onChange={() => setCurrency(value)}
              />
              <span>{value === "ils" ? "Shekels (₪)" : "Euros (€)"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Nom complet du titulaire
          <input className={inputClass} name="cardholderName" autoComplete="cc-name" required />
        </label>
        <label className="text-sm font-medium">
          Email pour le reçu
          <input className={inputClass} name="receiptEmail" type="email" defaultValue={defaultEmail} autoComplete="email" required />
        </label>
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm leading-relaxed text-green-950">
        <p className="font-semibold">Ce que vous autorisez</p>
        <p className="mt-2 whitespace-pre-line">{authorizationText}</p>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border bg-white p-5 text-sm leading-relaxed">
        <input className="mt-1 h-4 w-4 shrink-0" type="checkbox" name="consent" required />
        <span>
          Je confirme avoir lu et accepté l’autorisation ci-dessus. Je comprends que
          <strong> rien ne sera débité avant la séance</strong>.
        </span>
      </label>

      {status === "error" ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-900">{message}</p>
      ) : null}
      <button
        disabled={status === "sending"}
        className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-green-900 disabled:opacity-60"
      >
        {status === "sending" ? "Ouverture de l’espace sécurisé…" : "Continuer vers la saisie sécurisée"}
      </button>
    </form>
  );
}
