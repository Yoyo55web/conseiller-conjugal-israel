import { findDossierByIntakeToken } from "@/lib/db";
import { requestHasExpectedOrigin } from "@/lib/request-security";
import { getStripe } from "@/lib/stripe";
import { finalizeSetupIntent } from "@/lib/stripe-payment-state";

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
    if (!dossier || !dossier.intakeCompletedAt) {
      return Response.json({ error: "Ce dossier n’est pas disponible." }, { status: 404 });
    }

    const body = await request.json() as Record<string, unknown>;
    const setupIntentId = typeof body.setupIntentId === "string" ? body.setupIntentId : "";
    if (!setupIntentId || setupIntentId !== dossier.payment.stripeSetupIntentId) {
      return Response.json({ error: "La confirmation Stripe ne correspond pas à ce dossier." }, { status: 400 });
    }

    const setupIntent = await getStripe().setupIntents.retrieve(setupIntentId);
    if (setupIntent.status !== "succeeded") {
      return Response.json({ error: "Le moyen de paiement n’est pas encore confirmé." }, { status: 409 });
    }
    const saved = await finalizeSetupIntent(setupIntent);
    if (!saved) {
      return Response.json({ error: "La confirmation n’a pas pu être enregistrée." }, { status: 409 });
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "La confirmation Stripe est momentanément indisponible." }, { status: 503 });
  }
}
