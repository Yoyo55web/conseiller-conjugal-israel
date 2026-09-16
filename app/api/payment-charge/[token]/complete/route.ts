import { findDossierByIntakeToken } from "@/lib/db";
import { requestHasExpectedOrigin } from "@/lib/request-security";
import { getStripe } from "@/lib/stripe";
import { synchronizePaymentIntent } from "@/lib/stripe-payment-state";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    if (!requestHasExpectedOrigin(request)) {
      return Response.json({ error: "Origine de la demande invalide." }, { status: 403 });
    }
    const { token } = await params;
    if (!TOKEN_PATTERN.test(token)) {
      return Response.json({ error: "Ce lien n’est pas valide." }, { status: 404 });
    }
    const dossier = await findDossierByIntakeToken(token);
    if (!dossier) return Response.json({ error: "Dossier introuvable." }, { status: 404 });

    const body = await request.json() as Record<string, unknown>;
    const paymentIntentId = typeof body.paymentIntentId === "string" ? body.paymentIntentId : "";
    if (!paymentIntentId || paymentIntentId !== dossier.payment.stripePaymentIntentId) {
      return Response.json({ error: "Le paiement ne correspond pas à ce dossier." }, { status: 400 });
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.metadata?.dossier_id !== dossier.id) {
      return Response.json({ error: "Le paiement ne correspond pas à ce dossier." }, { status: 400 });
    }
    await synchronizePaymentIntent(paymentIntent);
    return Response.json({ ok: paymentIntent.status === "succeeded", status: paymentIntent.status });
  } catch {
    return Response.json({ error: "La vérification Stripe est momentanément indisponible." }, { status: 503 });
  }
}
