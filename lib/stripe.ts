import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function keysMatchDeployment() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) return false;

  // A Preview deployment must never be able to use a live Stripe account.
  if (process.env.VERCEL_ENV === "preview") {
    return /^(rk|sk)_test_/.test(secretKey) && publishableKey.startsWith("pk_test_");
  }

  return true;
}

export function stripeConfigured() {
  return keysMatchDeployment();
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY n’est pas configurée.");
  if (!keysMatchDeployment()) {
    throw new Error("Une Preview Vercel ne peut utiliser que des clés Stripe de test.");
  }

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
