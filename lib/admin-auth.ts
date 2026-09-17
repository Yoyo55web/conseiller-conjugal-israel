import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cc_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function temporaryPreviewAdminBypassEnabled() {
  return (
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_COMMIT_REF === "codex/stripe-payment-setup"
  );
}

export function privateFeaturesConfigured() {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.DATA_ENCRYPTION_KEY &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_SESSION_SECRET,
  );
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET n’est pas configurée.");
  return secret;
}

function signature(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function passwordIsValid(value: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD n’est pas configuré.");
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = String(expiresAt);
  const token = `${payload}.${signature(payload)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  // Contournement strictement temporaire pour les tests E2E de la Preview.
  // À supprimer et redéployer avant toute promotion en production.
  if (temporaryPreviewAdminBypassEnabled()) return true;

  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return false;
    const [expiresPart, signaturePart] = token.split(".");
    if (!expiresPart || !signaturePart || Number(expiresPart) < Date.now() / 1000) return false;
    const expected = Buffer.from(signature(expiresPart));
    const received = Buffer.from(signaturePart);
    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}
