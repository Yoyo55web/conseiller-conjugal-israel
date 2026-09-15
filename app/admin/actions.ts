"use server";

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
  setFeedbackApproval,
} from "@/lib/db";
import type { ConsultationType } from "@/lib/consultation-framework";

const APPOINTMENT_MODES = new Set(["visio", "domicile", "presentiel"]);
const CONSULTATION_TYPES = new Set<ConsultationType>(["couple", "individual"]);

function validId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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
  await clearDossierIntake(id);
  revalidatePath("/admin");
  redirect("/admin?suppression=reponses");
}

export async function deleteDossierAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  if (!validId(id)) redirect("/admin?erreur=suppression");
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
