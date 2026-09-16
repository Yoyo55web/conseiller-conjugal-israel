"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export default function PaymentAuthentication({
  token,
  clientSecret,
  publishableKey,
  paymentIntentId,
}: {
  token: string;
  clientSecret: string;
  publishableKey: string;
  paymentIntentId: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function authenticate() {
    setStatus("sending");
    setMessage("");
    const stripe = await loadStripe(publishableKey);
    if (!stripe) {
      setStatus("error");
      setMessage("Stripe n’a pas pu être chargé.");
      return;
    }

    const returnUrl = `${window.location.origin}/preparer-rendez-vous/${encodeURIComponent(token)}/paiement/confirmation-reglement`;
    const result = await stripe.confirmPayment({
      clientSecret,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });
    if (result.error) {
      setStatus("error");
      setMessage(result.error.message || "La vérification bancaire n’a pas abouti.");
      return;
    }
    if (result.paymentIntent?.status !== "succeeded") {
      setStatus("error");
      setMessage("Le paiement n’est pas encore confirmé.");
      return;
    }

    const response = await fetch(`/api/payment-charge/${encodeURIComponent(token)}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId }),
    });
    if (!response.ok) {
      setStatus("error");
      setMessage("Le paiement est en cours de confirmation. Revenez sur ce lien dans quelques instants.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-950">
      <h1 className="text-2xl font-bold">Vérification bancaire nécessaire</h1>
      <p className="mt-3 leading-relaxed">
        Votre banque demande une confirmation de sécurité pour finaliser le règlement.
        Aucun second paiement ne sera créé.
      </p>
      {status === "error" ? <p role="alert" className="mt-4 rounded-xl bg-white p-4 text-sm text-red-800">{message}</p> : null}
      <button
        type="button"
        onClick={authenticate}
        disabled={status === "sending"}
        className="mt-6 rounded-xl bg-green-800 px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {status === "sending" ? "Ouverture de la banque…" : "Confirmer auprès de ma banque"}
      </button>
    </div>
  );
}
