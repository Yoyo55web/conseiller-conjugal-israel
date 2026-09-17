export type PaymentPlan = "single" | "pack6";
export type PaymentCurrency = "ils" | "eur";

export const PAYMENT_TERMS_VERSION = "2026-09-17";

export const PAYMENT_OPTIONS = {
  single: {
    label: "Une séance",
    shortLabel: "Séance",
    amounts: { ils: 25_000, eur: 7_500 },
  },
  pack6: {
    label: "Cycle initial de 6 séances",
    shortLabel: "Cycle de 6 séances",
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
  purpose: "initial" | "continuation" = "initial",
) {
  const amount = paymentAmount(plan, currency);
  const formatted = formatPaymentAmount(amount, currency);
  const label = plan === "pack6" && purpose === "continuation"
    ? "Nouveau cycle de 6 séances"
    : PAYMENT_OPTIONS[plan].label;
  const timing = plan === "pack6"
    ? "après la première séance de ce cycle"
    : "après la séance concernée";

  return [
    `Je choisis : ${label}, au montant de ${formatted}.`,
    `J’autorise Conseiller conjugal Israël à débiter ce montant uniquement ${timing}.`,
    "Cette autorisation concerne uniquement la formule et le montant indiqués ci-dessus.",
    "Il ne s’agit pas d’un abonnement : aucun renouvellement ni débit supplémentaire ne sera effectué automatiquement.",
  ].join("\n");
}
