import { createHash } from "node:crypto";
import { findDossierByIntakeToken, savePendingPaymentSetup } from "@/lib/db";
import {
  isPaymentCurrency,
  isPaymentPlan,
  PAYMENT_TERMS_VERSION,
  paymentAmount,
  paymentAuthorizationText,
} from "@/lib/payment-config";
import { paymentWindowStatus } from "@/lib/payment-window";
import { requestHasExpectedOrigin } from "@/lib/request-security";
import { getStripe, stripeConfigured, stripePublishableKey } from "@/lib/stripe";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    if (!requestHasExpectedOrigin(request)) {
      return Response.json({ error: "Origine de la demande invalide." }, { status: 403 });
    }
    const { token } = await params;
    if (!TOKEN_PATTERN.test(token)) {
      return Response.json({ error: "Ce lien n’est pas valide." }, { status: 404 });
    }
    if (!stripeConfigured()) {
      return Response.json({ error: "Le service de paiement est en cours de configuration." }, { status: 503 });
    }

    const paymentWindow = paymentWindowStatus();
    if (paymentWindow.blocked) {
      return Response.json({
        error: "L’enregistrement du moyen de paiement est momentanément suspendu pour Chabbat ou Yom Tov.",
        nextAllowedAt: paymentWindow.nextAllowedAt,
      }, { status: 423 });
    }

    if (Number(request.headers.get("content-length") || 0) > 12_000) {
      return Response.json({ error: "La demande est trop volumineuse." }, { status: 413 });
    }

    const dossier = await findDossierByIntakeToken(token);
    if (!dossier || !dossier.intakeCompletedAt) {
      return Response.json({ error: "Le formulaire doit d’abord être complété." }, { status: 409 });
    }
    if (dossier.payment.status === "paid") {
      return Response.json({ error: "Ce règlement a déjà été effectué." }, { status: 409 });
    }
    if (dossier.payment.status === "ready") {
      return Response.json({ alreadyReady: true });
    }

    const body = await request.json() as Record<string, unknown>;
    const plan = body.plan;
    const currency = body.currency;
    const cardholderName = cleanText(body.cardholderName, 200);
    const receiptEmail = cleanText(body.receiptEmail, 200).toLowerCase();
    if (!isPaymentPlan(plan) || !isPaymentCurrency(currency)) {
      return Response.json({ error: "Veuillez choisir une formule et une devise." }, { status: 400 });
    }
    if (cardholderName.length < 2 || !validEmail(receiptEmail)) {
      return Response.json({ error: "Veuillez vérifier le nom et l’adresse email du titulaire." }, { status: 400 });
    }
    if (body.consent !== true) {
      return Response.json({ error: "Votre autorisation est nécessaire pour enregistrer le moyen de paiement." }, { status: 400 });
    }

    const amount = paymentAmount(plan, currency);
    const termsSnapshot = paymentAuthorizationText(plan, currency);
    const consentAt = new Date().toISOString();
    const cycleId = crypto.randomUUID();
    const stripe = getStripe();

    let customerId = dossier.payment.stripeCustomerId;
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) customerId = null;
      } catch {
        customerId = null;
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: cardholderName,
        email: receiptEmail,
        preferred_locales: ["fr"],
        metadata: {
          dossier_id: dossier.id,
          source: "private_intake",
        },
      }, { idempotencyKey: `dossier-customer-${dossier.id}` });
      customerId = customer.id;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: "off_session",
      automatic_payment_methods: { enabled: true },
      allowed_payment_method_types: ["card"],
      description: `${dossier.label} — enregistrement sécurisé du moyen de paiement`,
      metadata: {
        dossier_id: dossier.id,
        plan,
        currency,
        amount: String(amount),
        payment_cycle_id: cycleId,
        terms_version: PAYMENT_TERMS_VERSION,
        consent_at: consentAt,
      },
    }, { idempotencyKey: `setup-${dossier.id}-${plan}-${currency}-${Date.now()}` });

    if (!setupIntent.client_secret) {
      return Response.json({ error: "Stripe n’a pas pu initialiser l’enregistrement." }, { status: 502 });
    }

    const savedDossierId = await savePendingPaymentSetup({
      token,
      customerId,
      setupIntentId: setupIntent.id,
      cycleId,
      authorization: {
        plan,
        currency,
        amount,
        purpose: "initial",
        cardholderName,
        receiptEmail,
        consentAt,
        termsVersion: PAYMENT_TERMS_VERSION,
        termsDigest: createHash("sha256").update(termsSnapshot, "utf8").digest("hex"),
        termsSnapshot,
      },
    });
    if (!savedDossierId) {
      await stripe.setupIntents.cancel(setupIntent.id).catch(() => undefined);
      return Response.json({ error: "Cette demande ne peut plus être modifiée." }, { status: 409 });
    }

    return Response.json({
      clientSecret: setupIntent.client_secret,
      publishableKey: stripePublishableKey(),
      setupIntentId: setupIntent.id,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Le service Stripe est momentanément indisponible." }, { status: 503 });
  }
}
