import { saveIntake, type IntakeData } from "@/lib/db";

const requiredText = [
  "husbandFirstName", "husbandLastName", "husbandAge", "husbandEmail", "husbandPhone",
  "wifeFirstName", "wifeLastName", "wifeAge", "wifeEmail", "wifePhone", "country",
  "mainReason", "difficultySince", "priority", "husbandSafe", "wifeSafe",
  "husbandSignature", "wifeSignature",
] as const;

function text(value: unknown, max = 1500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return Response.json({ error: "Ce lien n’est pas valide." }, { status: 404 });
    }
    if (Number(request.headers.get("content-length") || 0) > 30_000) {
      return Response.json({ error: "Le formulaire est trop volumineux." }, { status: 413 });
    }
    const body = await request.json() as Record<string, unknown>;
    for (const key of requiredText) {
      if (!text(body[key])) return Response.json({ error: "Veuillez compléter tous les champs obligatoires." }, { status: 400 });
    }
    const husbandEmail = text(body.husbandEmail, 200);
    const wifeEmail = text(body.wifeEmail, 200);
    const husbandAge = Number(text(body.husbandAge, 3));
    const wifeAge = Number(text(body.wifeAge, 3));
    if (!validEmail(husbandEmail) || !validEmail(wifeEmail)) {
      return Response.json({ error: "Veuillez vérifier les deux adresses email." }, { status: 400 });
    }
    if (!Number.isInteger(husbandAge) || !Number.isInteger(wifeAge) || husbandAge < 18 || wifeAge < 18 || husbandAge > 120 || wifeAge > 120) {
      return Response.json({ error: "Veuillez vérifier l’âge indiqué pour chacun." }, { status: 400 });
    }
    if (body.husbandAccepted !== "true" || body.wifeAccepted !== "true" || body.privacyAccepted !== "true") {
      return Response.json({ error: "Les deux validations et l’information sur la confidentialité sont nécessaires." }, { status: 400 });
    }
    const data: IntakeData = {
      husbandFirstName: text(body.husbandFirstName, 100), husbandLastName: text(body.husbandLastName, 100),
      husbandAge: String(husbandAge), husbandEmail, husbandPhone: text(body.husbandPhone, 50),
      wifeFirstName: text(body.wifeFirstName, 100), wifeLastName: text(body.wifeLastName, 100),
      wifeAge: String(wifeAge), wifeEmail, wifePhone: text(body.wifePhone, 50),
      marriageDate: text(body.marriageDate, 20), country: text(body.country, 100), children: text(body.children, 300),
      previousSupport: text(body.previousSupport, 800), mainReason: text(body.mainReason), difficultySince: text(body.difficultySince, 300),
      priority: text(body.priority, 500), husbandSafe: text(body.husbandSafe, 30), wifeSafe: text(body.wifeSafe, 30),
      husbandAccepted: true, wifeAccepted: true, husbandSignature: text(body.husbandSignature, 200), wifeSignature: text(body.wifeSignature, 200),
      privacyAccepted: true, acceptedAt: new Date().toISOString(), frameworkVersion: "2026-09-14-v1",
    };
    const saved = await saveIntake(token, data);
    if (!saved) return Response.json({ error: "Ce lien n’est plus valide." }, { status: 404 });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Le service d’enregistrement est momentanément indisponible." }, { status: 503 });
  }
}
