import { createHash } from "node:crypto";
import { findDossierByIntakeToken, startPaymentContinuation } from "@/lib/db";
import {
  isPaymentCurrency,
  isPaymentPlan,
  PAYMENT_TERMS_VERSION,
  paymentAmount,
  paymentAuthorizationText,
} from "@/lib/payment-config";
import { paymentWindowStatus } from "@/lib/payment-window";
import { requestHasExpectedOrigin } from "@/lib/request-security";
import { getStripe, stripeConfigured } from "@/lib/stripe";

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
        error: "L’autorisation est momentanément suspendue pour Chabbat ou Yom Tov.",
        nextAllowedAt: paymentWindow.nextAllowedAt,
      }, { status: 423 });
    }
    if (Number(request.headers.get("content-length") || 0) > 12_000) {
      return Response.json({ error: "La demande est trop volumineuse." }, { status: 413 });
    }

    const dossier = await findDossierByIntakeToken(token);
    if (!dossier || !dossier.intakeCompletedAt) {
      return Response.json({ error: "Ce dossier n’est pas disponible." }, { status: 404 });
    }
    if (dossier.payment.status === "ready") {
      return Response.json({ alreadyReady: true }, { headers: { "Cache-Control": "no-store" } });
    }
    if (
      dossier.payment.status !== "paid" ||
      !dossier.payment.stripeCustomerId ||
      !dossier.payment.stripePaymentMethodId
    ) {
      return Response.json({ error: "La poursuite ne peut pas encore être autorisée." }, { status: 409 });
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
      return Response.json({ error: "Votre nouvelle autorisation est nécessaire." }, { status: 400 });
    }

    const amount = paymentAmount(plan, currency);
    const termsSnapshot = paymentAuthorizationText(plan, currency, "continuation");
    const consentAt = new Date().toISOString();
    const cycleId = crypto.randomUUID();
    await getStripe().customers.update(dossier.payment.stripeCustomerId, {
      name: cardholderName,
      email: receiptEmail,
      invoice_settings: { default_payment_method: dossier.payment.stripePaymentMethodId },
    });

    const savedDossierId = await startPaymentContinuation({
      token,
      cycleId,
      authorization: {
        plan,
        currency,
        amount,
        purpose: "continuation",
        cardholderName,
        receiptEmail,
        consentAt,
        termsVersion: PAYMENT_TERMS_VERSION,
        termsDigest: createHash("sha256").update(termsSnapshot, "utf8").digest("hex"),
        termsSnapshot,
      },
    });
    if (!savedDossierId) {
      return Response.json({ error: "Cette autorisation a déjà été remplacée ou n’est plus disponible." }, { status: 409 });
    }

    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Le service Stripe est momentanément indisponible." }, { status: 503 });
  }
}
