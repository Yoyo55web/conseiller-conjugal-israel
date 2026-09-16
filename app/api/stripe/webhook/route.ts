import type Stripe from "stripe";
import {
  beginStripeWebhookEvent,
  markPaymentSetupFailed,
  releaseStripeWebhookEvent,
} from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { finalizeSetupIntent, synchronizePaymentIntent } from "@/lib/stripe-payment-state";

export const runtime = "nodejs";

function setupErrorMessage(setupIntent: Stripe.SetupIntent) {
  return setupIntent.last_setup_error?.message?.slice(0, 500) ||
    "Le moyen de paiement n’a pas pu être enregistré.";
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!webhookSecret || !signature) {
    return new Response("Configuration Stripe incomplète", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return new Response("Signature Stripe invalide", { status: 400 });
  }

  const shouldProcess = await beginStripeWebhookEvent(event.id, event.type);
  if (!shouldProcess) return Response.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "setup_intent.succeeded":
        await finalizeSetupIntent(event.data.object as Stripe.SetupIntent);
        break;
      case "setup_intent.setup_failed":
      case "setup_intent.canceled": {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        const dossierId = setupIntent.metadata?.dossier_id;
        if (dossierId) {
          await markPaymentSetupFailed(dossierId, setupIntent.id, setupErrorMessage(setupIntent));
        }
        break;
      }
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.processing":
      case "payment_intent.canceled":
      case "payment_intent.requires_action":
        await synchronizePaymentIntent(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break;
    }
    return Response.json({ received: true });
  } catch {
    await releaseStripeWebhookEvent(event.id);
    return new Response("Traitement temporairement impossible", { status: 500 });
  }
}
