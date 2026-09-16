import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function stripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY n’est pas configurée.");

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-07-29.dahlia",
      maxNetworkRetries: 2,
      appInfo: {
        name: "Conseiller conjugal Israël",
        version: "1.0.0",
      },
    });
  }

  return stripeClient;
}

export function stripePublishableKey() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n’est pas configurée.");
  return key;
}
