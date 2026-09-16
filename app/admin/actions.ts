"use server";

import type Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  passwordIsValid,
} from "@/lib/admin-auth";
import {
  clearDossierIntake,
  createDossier,
  deleteDossier,
  deleteFeedback,
  findDossierPaymentById,
  reservePaymentCharge,
  setFeedbackApproval,
  setPaymentIntentOutcome,
} from "@/lib/db";
import type { ConsultationType } from "@/lib/consultation-framework";
import { paymentWindowStatus } from "@/lib/payment-window";
import { getStripe } from "@/lib/stripe";
import { synchronizePaymentIntent } from "@/lib/stripe-payment-state";

const APPOINTMENT_MODES = new Set(["visio", "domicile", "presentiel"]);
const CONSULTATION_TYPES = new Set<ConsultationType>(["couple", "individual"]);

function validId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function deleteStripeCustomerForDossier(id: string) {
  const dossier = await findDossierPaymentById(id);
  const customerId = dossier?.payment.stripeCustomerId;
  if (!customerId) return;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("La clé Stripe n’est pas configurée.");
  }
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if (!customer.deleted) await getStripe().customers.del(customerId);
  } catch (error) {
    const stripeError = error as { code?: string };
    if (stripeError.code !== "resource_missing") throw error;
  }
}

function israelLocalDateTimeToIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year, month, day, hour, minute] = match;
  const localAsUtc = Date.UTC(+year, +month - 1, +day, +hour, +minute);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(localAsUtc)).map(({ type, value: part }) => [type, part]),
  );
  const representedUtc = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour,
    +parts.minute,
    +parts.second,
  );
  return new Date(localAsUtc - (representedUtc - localAsUtc)).toISOString();
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!passwordIsValid(password)) redirect("/admin/login?erreur=1");
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createDossierAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const label = String(formData.get("label") || "").trim();
  const appointmentValue = String(formData.get("appointmentAt") || "").trim();
  const appointmentAt = appointmentValue ? israelLocalDateTimeToIso(appointmentValue) : undefined;
  const requestedMode = String(formData.get("appointmentMode") || "visio");
  const appointmentMode = APPOINTMENT_MODES.has(requestedMode) ? requestedMode : "visio";
  const requestedType = String(formData.get("consultationType") || "couple") as ConsultationType;
  const consultationType = CONSULTATION_TYPES.has(requestedType) ? requestedType : "couple";
  if (label.length < 2) redirect("/admin?erreur=dossier");
  if (appointmentValue && !appointmentAt) redirect("/admin?erreur=dossier");
  await createDossier({ label, appointmentAt, appointmentMode, consultationType });
  revalidatePath("/admin");
  redirect("/admin?creation=ok");
}

export async function approveFeedbackAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  const approved = String(formData.get("approved") || "") === "true";
  if (id) await setFeedbackApproval(id, approved);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function clearDossierIntakeAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  if (!validId(id)) redirect("/admin?erreur=suppression");
  try {
    await deleteStripeCustomerForDossier(id);
  } catch {
    redirect("/admin?erreur=stripe-suppression");
  }
  await clearDossierIntake(id);
  revalidatePath("/admin");
  redirect("/admin?suppression=reponses");
}

export async function deleteDossierAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  if (!validId(id)) redirect("/admin?erreur=suppression");
  try {
    await deleteStripeCustomerForDossier(id);
  } catch {
    redirect("/admin?erreur=stripe-suppression");
  }
  await deleteDossier(id);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?suppression=dossier");
}

export async function deleteFeedbackAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  if (!validId(id)) redirect("/admin?erreur=suppression");
  await deleteFeedback(id);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?suppression=avis");
}

export async function chargeDossierPaymentAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  if (!validId(id)) redirect("/admin?paiement=erreur");

  const dossier = await findDossierPaymentById(id);
  if (!dossier) redirect("/admin?paiement=introuvable");
  if (dossier.payment.status === "paid") redirect("/admin?paiement=deja-regle");
  if (!dossier.appointmentAt) redirect("/admin?paiement=date-manquante");

  const sessionEndsAt = new Date(dossier.appointmentAt).getTime() + 60 * 60_000;
  if (Date.now() < sessionEndsAt) redirect("/admin?paiement=avant-seance");

  const windowStatus = paymentWindowStatus();
  if (windowStatus.blocked) {
    const next = windowStatus.nextAllowedAt ? encodeURIComponent(windowStatus.nextAllowedAt) : "";
    redirect(`/admin?paiement=ferme&prochain=${next}`);
  }

  const reserved = await reservePaymentCharge(id);
  if (!reserved) redirect("/admin?paiement=indisponible");
  const payment = reserved.payment;
  const authorization = payment.authorization;
  if (
    !payment.amount ||
    !payment.currency ||
    !payment.plan ||
    !payment.stripeCustomerId ||
    !payment.stripePaymentMethodId ||
    !authorization ||
    authorization.plan !== payment.plan ||
    authorization.currency !== payment.currency ||
    authorization.amount !== payment.amount
  ) {
    await setPaymentIntentOutcome({
      dossierId: id,
      status: "failed",
      error: "Informations de paiement incomplètes.",
    });
    redirect("/admin?paiement=incomplet");
  }

  const stripe = getStripe();
  const attempt = payment.attemptCount;
  let destination = "/admin?paiement=echec";
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: payment.amount,
      currency: payment.currency,
      customer: payment.stripeCustomerId,
      payment_method: payment.stripePaymentMethodId,
      off_session: true,
      confirm: true,
      receipt_email: authorization.receiptEmail,
      description: `${reserved.label} — ${payment.plan === "pack6" ? "pack de 6 séances" : "séance"}`,
      metadata: {
        dossier_id: id,
        plan: payment.plan || "single",
        charge_attempt: String(attempt),
        charged_after_session: "true",
      },
    }, { idempotencyKey: `charge-${id}-${attempt}` });

    await synchronizePaymentIntent(paymentIntent);
    revalidatePath("/admin");
    destination = paymentIntent.status === "succeeded"
      ? "/admin?paiement=ok"
      : "/admin?paiement=verification";
  } catch (error) {
    const stripeError = error as { payment_intent?: { id?: string } };
    let recovered: Stripe.PaymentIntent | null = null;
    if (stripeError.payment_intent?.id) {
      recovered = await stripe.paymentIntents.retrieve(stripeError.payment_intent.id);
    }
    if (!recovered) {
      const recent = await stripe.paymentIntents.list({ customer: payment.stripeCustomerId, limit: 10 }).catch(() => null);
      recovered = recent?.data.find((item) =>
        item.metadata?.dossier_id === id && item.metadata?.charge_attempt === String(attempt),
      ) || null;
    }
    if (recovered) {
      await synchronizePaymentIntent(recovered);
      revalidatePath("/admin");
      destination = recovered.status === "requires_action"
        ? "/admin?paiement=action-client"
        : recovered.status === "succeeded"
          ? "/admin?paiement=ok"
          : "/admin?paiement=echec";
    } else {
      await setPaymentIntentOutcome({
        dossierId: id,
        expectedAttemptCount: attempt,
        status: "charge_pending",
        error: "Réponse Stripe incertaine : ne pas relancer le débit avant vérification dans Stripe.",
      });
      revalidatePath("/admin");
      destination = "/admin?paiement=verification";
    }
  }
  redirect(destination);
}
