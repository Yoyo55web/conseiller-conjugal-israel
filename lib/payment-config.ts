export type PaymentPlan = "single" | "pack6";
export type PaymentCurrency = "ils" | "eur";

export const PAYMENT_TERMS_VERSION = "2026-09-16";

export const PAYMENT_OPTIONS = {
  single: {
    label: "Une séance",
    shortLabel: "Séance",
    amounts: { ils: 25_000, eur: 7_500 },
  },
  pack6: {
    label: "Pack de 6 séances",
    shortLabel: "Pack 6 séances",
    amounts: { ils: 140_000, eur: 42_000 },
  },
} as const;

export function isPaymentPlan(value: unknown): value is PaymentPlan {
  return value === "single" || value === "pack6";
}

export function isPaymentCurrency(value: unknown): value is PaymentCurrency {
  return value === "ils" || value === "eur";
}

export function paymentAmount(plan: PaymentPlan, currency: PaymentCurrency) {
  return PAYMENT_OPTIONS[plan].amounts[currency];
}

export function formatPaymentAmount(amount: number, currency: PaymentCurrency) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function paymentAuthorizationText(
  plan: PaymentPlan,
  currency: PaymentCurrency,
) {
  const amount = paymentAmount(plan, currency);
  const formatted = formatPaymentAmount(amount, currency);
  const timing = plan === "pack6" ? "après la première séance" : "après la séance";

  return [
    `Je choisis : ${PAYMENT_OPTIONS[plan].label}, au montant de ${formatted}.`,
    `J’autorise Conseiller conjugal Israël à débiter ce montant uniquement ${timing}.`,
    "Aucun montant n’est débité lors de l’enregistrement du moyen de paiement.",
    "Il ne s’agit pas d’un abonnement et aucun renouvellement automatique ne sera effectué.",
  ].join("\n");
}
