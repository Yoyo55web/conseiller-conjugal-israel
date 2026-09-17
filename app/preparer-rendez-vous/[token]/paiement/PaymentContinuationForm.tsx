"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  paymentAuthorizationText,
  type PaymentCurrency,
  type PaymentPlan,
} from "@/lib/payment-config";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20";

export default function PaymentContinuationForm({
  token,
  defaultName,
  defaultEmail,
  defaultCurrency,
}: {
  token: string;
  defaultName: string;
  defaultEmail: string;
  defaultCurrency: PaymentCurrency;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PaymentPlan>("single");
  const [currency, setCurrency] = useState<PaymentCurrency>(defaultCurrency);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");
  const authorizationText = paymentAuthorizationText(plan, currency, "continuation");

  async function authorize(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/payment-continuation/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        currency,
        cardholderName: String(form.get("cardholderName") || "").trim(),
        receiptEmail: String(form.get("receiptEmail") || "").trim(),
        consent: form.get("consent") === "on",
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(body.error || "La nouvelle autorisation n’a pas pu être enregistrée.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={authorize} className="mt-8 space-y-6 rounded-3xl border bg-white p-6 text-left md:p-8">
      <div>
        <h2 className="text-xl font-bold">Poursuivre l’accompagnement, si nécessaire</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          La fin du cycle ne met pas fin à l’accompagnement. Si vous décidez ensemble de
          poursuivre, ce même lien permet une nouvelle autorisation explicite, sans ressaisir
          les coordonnées de la carte.
        </p>
      </div>

      <fieldset>
        <legend className="font-semibold">Nouvelle formule autorisée</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(["single", "pack6"] as const).map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded-2xl border p-4 ${plan === value ? "border-green-700 bg-green-50 ring-1 ring-green-700" : "bg-white"}`}
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
                  <strong className="block">
                    {value === "single" ? "Une séance supplémentaire" : "Nouveau cycle de 6 séances"}
                  </strong>
                  <span className="mt-1 block text-sm text-gray-600">
                    {value === "single"
                      ? "250 ₪ ou 75 €"
                      : "1 400 ₪ au lieu de 1 500 ₪, ou 420 € au lieu de 450 €"}
                  </span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">Devise</legend>
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
          <input className={inputClass} name="cardholderName" defaultValue={defaultName} autoComplete="cc-name" required />
        </label>
        <label className="text-sm font-medium">
          Email pour le reçu de paiement
          <input className={inputClass} name="receiptEmail" type="email" defaultValue={defaultEmail} autoComplete="email" required />
        </label>
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm leading-relaxed text-green-950">
        <p className="font-semibold">Nouvelle autorisation</p>
        <p className="mt-2 whitespace-pre-line">{authorizationText}</p>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border bg-white p-5 text-sm leading-relaxed">
        <input className="mt-1 h-4 w-4 shrink-0" type="checkbox" name="consent" required />
        <span>Je confirme avoir lu et accepté cette nouvelle autorisation.</span>
      </label>

      {status === "error" ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-900">{message}</p>
      ) : null}
      <button
        disabled={status === "sending"}
        className="w-full rounded-2xl bg-green-800 px-6 py-4 font-semibold text-white shadow-sm hover:bg-green-900 disabled:opacity-60"
      >
        {status === "sending" ? "Enregistrement…" : "Autoriser cette poursuite"}
      </button>
      <p className="text-center text-xs leading-relaxed text-gray-500">
        Aucun renouvellement automatique : chaque poursuite nécessite une nouvelle autorisation sur cette page.
      </p>
    </form>
  );
}
