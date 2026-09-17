import "server-only";
import type Stripe from "stripe";
import {
  findDossierPaymentById,
  markPaymentMethodReady,
  setPaymentIntentOutcome,
} from "./db";
import { getStripe } from "./stripe";

function objectId(value: string | { id: string } | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function finalizeSetupIntent(setupIntent: Stripe.SetupIntent) {
  const dossierId = setupIntent.metadata?.dossier_id;
  const paymentMethodId = objectId(setupIntent.payment_method);
  const customerId = objectId(setupIntent.customer);
  const paymentCycleId = setupIntent.metadata?.payment_cycle_id || null;
  if (!dossierId || !paymentMethodId || !customerId || setupIntent.status !== "succeeded") {
    return false;
  }

  const dossier = await findDossierPaymentById(dossierId);
  if (
    !dossier ||
    dossier.payment.stripeSetupIntentId !== setupIntent.id ||
    dossier.payment.stripeCustomerId !== customerId ||
    (dossier.payment.cycleId !== null && dossier.payment.cycleId !== paymentCycleId)
  ) {
    return false;
  }

  const stripe = getStripe();
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (paymentMethod.customer && objectId(paymentMethod.customer) !== customerId) return false;

  const authorization = dossier.payment.authorization;
  if (authorization) {
    await stripe.customers.update(customerId, {
      name: authorization.cardholderName,
      email: authorization.receiptEmail,
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  return markPaymentMethodReady({
    dossierId,
    setupIntentId: setupIntent.id,
    paymentMethodId,
    cardBrand: paymentMethod.card?.brand || paymentMethod.type,
    cardLast4: paymentMethod.card?.last4 || null,
    cardExpMonth: paymentMethod.card?.exp_month || null,
    cardExpYear: paymentMethod.card?.exp_year || null,
  });
}

export async function synchronizePaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const dossierId = paymentIntent.metadata?.dossier_id;
  if (!dossierId) return false;

  const dossier = await findDossierPaymentById(dossierId);
  const attempt = Number(paymentIntent.metadata?.charge_attempt);
  const paymentCycleId = paymentIntent.metadata?.payment_cycle_id || null;
  const customerId = objectId(paymentIntent.customer);
  if (
    !dossier ||
    !Number.isInteger(attempt) ||
    attempt < 1 ||
    attempt !== dossier.payment.attemptCount ||
    (dossier.payment.cycleId
      ? paymentCycleId !== dossier.payment.cycleId
      : paymentCycleId !== null && paymentCycleId !== "legacy") ||
    !customerId ||
    customerId !== dossier.payment.stripeCustomerId ||
    paymentIntent.amount !== dossier.payment.amount ||
    paymentIntent.currency !== dossier.payment.currency
  ) {
    return false;
  }

  const status = paymentIntent.status === "succeeded"
    ? "paid"
    : paymentIntent.status === "requires_action"
      ? "requires_action"
      : paymentIntent.status === "processing"
        ? "charge_pending"
        : "failed";

  return setPaymentIntentOutcome({
    dossierId,
    paymentIntentId: paymentIntent.id,
    expectedAttemptCount: attempt,
    status,
    error: paymentIntent.last_payment_error?.message?.slice(0, 500) || null,
  });
}
