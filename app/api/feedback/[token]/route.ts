import { saveFeedback, type FeedbackData } from "@/lib/db";

function text(value: unknown, max = 1800) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return Response.json({ error: "Ce lien n’est pas valide." }, { status: 404 });
    }
    if (Number(request.headers.get("content-length") || 0) > 12_000) {
      return Response.json({ error: "Le formulaire est trop volumineux." }, { status: 413 });
    }
    const body = await request.json() as Record<string, unknown>;
    const rating = Number(body.rating);
    const benefit = text(body.benefit);
    const choice = text(body.publicationChoice) as FeedbackData["publicationChoice"];
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !benefit) {
      return Response.json({ error: "Veuillez indiquer une note et ce que l’accompagnement vous a apporté." }, { status: 400 });
    }
    if (!["private", "anonymous", "first_names"].includes(choice)) {
      return Response.json({ error: "Choix de confidentialité invalide." }, { status: 400 });
    }
    const consent = body.consent === "true";
    if (choice !== "private" && !consent) {
      return Response.json({ error: "Votre autorisation explicite est nécessaire pour une publication." }, { status: 400 });
    }
    const saved = await saveFeedback(token, {
      rating,
      benefit,
      appreciated: text(body.appreciated, 1000),
      suggestion: text(body.suggestion, 1000),
      publicationChoice: choice,
      displayName: text(body.displayName, 100),
      consent,
    });
    if (!saved) return Response.json({ error: "Ce lien n’est plus valide." }, { status: 404 });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Le service d’enregistrement est momentanément indisponible." }, { status: 503 });
  }
}
