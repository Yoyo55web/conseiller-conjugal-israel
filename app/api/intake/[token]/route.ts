import { createHash } from "node:crypto";
import {
  findDossierByIntakeToken,
  saveIntake,
  type IntakeData,
} from "@/lib/db";
import {
  acceptedTextSnapshot,
  consultationFrameworks,
  frameworkSnapshot,
  type ConsultationType,
} from "@/lib/consultation-framework";

const commonRequiredText = ["country"] as const;
const coupleRequiredText = [
  "husbandFirstName", "husbandLastName", "husbandAge", "husbandEmail", "husbandPhone",
  "wifeFirstName", "wifeLastName", "wifeAge", "wifeEmail", "wifePhone",
  "husbandSignature", "wifeSignature",
] as const;
const individualRequiredText = [
  "individualFirstName", "individualLastName", "individualAge", "individualEmail",
  "individualPhone", "individualSignature",
] as const;

function text(value: unknown, max = 1500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validAge(value: string) {
  const age = Number(value);
  return Number.isInteger(age) && age >= 18 && age <= 120 ? String(age) : null;
}

function isAccepted(body: Record<string, unknown>, key: string) {
  return body[key] === "true";
}

function proofFor(type: ConsultationType) {
  const snapshot = frameworkSnapshot(type);
  const fullAcceptedText = acceptedTextSnapshot(type);
  return {
    acceptedAt: new Date().toISOString(),
    frameworkVersion: consultationFrameworks[type].version,
    frameworkDigest: createHash("sha256").update(snapshot, "utf8").digest("hex"),
    frameworkSnapshot: snapshot,
    acceptedTextDigest: createHash("sha256").update(fullAcceptedText, "utf8").digest("hex"),
    acceptedTextSnapshot: fullAcceptedText,
  };
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

    const dossier = await findDossierByIntakeToken(token);
    if (!dossier) {
      return Response.json({ error: "Ce lien n’est plus valide." }, { status: 404 });
    }
    if (dossier.intakeCompletedAt) {
      return Response.json({ error: "Ce formulaire a déjà été enregistré." }, { status: 409 });
    }

    const body = await request.json() as Record<string, unknown>;
    const type = dossier.consultationType;
    const requiredText = type === "individual" ? individualRequiredText : coupleRequiredText;
    for (const key of [...commonRequiredText, ...requiredText]) {
      if (!text(body[key])) {
        return Response.json({ error: "Veuillez compléter tous les champs obligatoires." }, { status: 400 });
      }
    }
    if (!isAccepted(body, "privacyAccepted")) {
      return Response.json({ error: "La prise de connaissance de la politique de confidentialité est nécessaire." }, { status: 400 });
    }

    let data: IntakeData;
    if (type === "individual") {
      const email = text(body.individualEmail, 200);
      const age = validAge(text(body.individualAge, 3));
      if (!validEmail(email)) {
        return Response.json({ error: "Veuillez vérifier l’adresse email." }, { status: 400 });
      }
      if (!age) {
        return Response.json({ error: "Veuillez vérifier l’âge indiqué." }, { status: 400 });
      }
      if (!isAccepted(body, "individualAccepted") || !isAccepted(body, "individualKeyRulesAccepted")) {
        return Response.json({ error: "Les deux validations personnelles sont nécessaires." }, { status: 400 });
      }
      data = {
        consultationType: "individual",
        individualFirstName: text(body.individualFirstName, 100),
        individualLastName: text(body.individualLastName, 100),
        individualAge: age,
        individualEmail: email,
        individualPhone: text(body.individualPhone, 50),
        individualSignature: text(body.individualSignature, 200),
        individualAccepted: true,
        individualKeyRulesAccepted: true,
        marriageDate: "",
        country: text(body.country, 100),
        children: text(body.children, 300),
        privacyAccepted: true,
        ...proofFor("individual"),
      };
    } else {
      const husbandEmail = text(body.husbandEmail, 200);
      const wifeEmail = text(body.wifeEmail, 200);
      const husbandAge = validAge(text(body.husbandAge, 3));
      const wifeAge = validAge(text(body.wifeAge, 3));
      if (!validEmail(husbandEmail) || !validEmail(wifeEmail)) {
        return Response.json({ error: "Veuillez vérifier les deux adresses email." }, { status: 400 });
      }
      if (!husbandAge || !wifeAge) {
        return Response.json({ error: "Veuillez vérifier l’âge indiqué pour chacun." }, { status: 400 });
      }
      if (
        !isAccepted(body, "husbandAccepted") ||
        !isAccepted(body, "wifeAccepted") ||
        !isAccepted(body, "husbandKeyRulesAccepted") ||
        !isAccepted(body, "wifeKeyRulesAccepted")
      ) {
        return Response.json({ error: "Les validations personnelles des deux conjoints sont nécessaires." }, { status: 400 });
      }
      data = {
        consultationType: "couple",
        husbandFirstName: text(body.husbandFirstName, 100),
        husbandLastName: text(body.husbandLastName, 100),
        husbandAge,
        husbandEmail,
        husbandPhone: text(body.husbandPhone, 50),
        wifeFirstName: text(body.wifeFirstName, 100),
        wifeLastName: text(body.wifeLastName, 100),
        wifeAge,
        wifeEmail,
        wifePhone: text(body.wifePhone, 50),
        husbandSignature: text(body.husbandSignature, 200),
        wifeSignature: text(body.wifeSignature, 200),
        husbandAccepted: true,
        wifeAccepted: true,
        husbandKeyRulesAccepted: true,
        wifeKeyRulesAccepted: true,
        marriageDate: text(body.marriageDate, 20),
        country: text(body.country, 100),
        children: text(body.children, 300),
        privacyAccepted: true,
        ...proofFor("couple"),
      };
    }

    const saved = await saveIntake(token, data);
    if (!saved) {
      return Response.json({ error: "Ce formulaire a déjà été enregistré ou le lien n’est plus valide." }, { status: 409 });
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Le service d’enregistrement est momentanément indisponible." }, { status: 503 });
  }
}
