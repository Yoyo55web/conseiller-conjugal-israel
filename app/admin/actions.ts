"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  passwordIsValid,
} from "@/lib/admin-auth";
import { createDossier, setFeedbackApproval } from "@/lib/db";

const APPOINTMENT_MODES = new Set(["visio", "domicile", "presentiel"]);

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
  if (label.length < 2) redirect("/admin?erreur=dossier");
  if (appointmentValue && !appointmentAt) redirect("/admin?erreur=dossier");
  await createDossier({ label, appointmentAt, appointmentMode });
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
