import postgres from "postgres";
import { decryptValue, encryptValue, hashToken, newPrivateToken } from "./secure-data";

let client: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL n’est pas configurée.");
  if (!client) {
    client = postgres(url, {
      max: 1,
      prepare: false,
      ssl: url.includes("localhost") ? false : "require",
    });
  }
  return client;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = sqlClient();
      await sql`
        create table if not exists consultation_dossiers (
          id text primary key,
          label text not null,
          appointment_at timestamptz,
          appointment_mode text not null default 'visio',
          intake_token_hash text not null unique,
          intake_token_cipher text not null,
          feedback_token_hash text not null unique,
          feedback_token_cipher text not null,
          intake_cipher text,
          intake_completed_at timestamptz,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `;
      await sql`
        create table if not exists consultation_feedback (
          id text primary key,
          dossier_id text not null references consultation_dossiers(id) on delete cascade,
          feedback_cipher text not null,
          publication_choice text not null default 'private',
          publication_approved boolean not null default false,
          submitted_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `;
      await sql`create index if not exists consultation_feedback_dossier_idx on consultation_feedback(dossier_id)`;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export type IntakeData = {
  husbandFirstName: string;
  husbandLastName: string;
  husbandAge: string;
  husbandEmail: string;
  husbandPhone: string;
  wifeFirstName: string;
  wifeLastName: string;
  wifeAge: string;
  wifeEmail: string;
  wifePhone: string;
  marriageDate: string;
  country: string;
  children: string;
  previousSupport: string;
  mainReason: string;
  difficultySince: string;
  priority: string;
  husbandSafe: string;
  wifeSafe: string;
  husbandAccepted: boolean;
  wifeAccepted: boolean;
  husbandSignature: string;
  wifeSignature: string;
  privacyAccepted: boolean;
  acceptedAt: string;
  frameworkVersion: string;
};

export type FeedbackData = {
  rating: number;
  benefit: string;
  appreciated: string;
  suggestion: string;
  publicationChoice: "private" | "anonymous" | "first_names";
  displayName: string;
  consent: boolean;
};

export async function createDossier(input: {
  label: string;
  appointmentAt?: string;
  appointmentMode: string;
}) {
  await ensureSchema();
  const sql = sqlClient();
  const id = crypto.randomUUID();
  const intakeToken = newPrivateToken();
  const feedbackToken = newPrivateToken();
  await sql`
    insert into consultation_dossiers (
      id, label, appointment_at, appointment_mode,
      intake_token_hash, intake_token_cipher,
      feedback_token_hash, feedback_token_cipher
    ) values (
      ${id}, ${input.label}, ${input.appointmentAt || null}, ${input.appointmentMode},
      ${hashToken(intakeToken)}, ${encryptValue(intakeToken)},
      ${hashToken(feedbackToken)}, ${encryptValue(feedbackToken)}
    )
  `;
  return { id, intakeToken, feedbackToken };
}

export async function listDossiers() {
  await ensureSchema();
  const rows = await sqlClient()`
    select d.*,
      (select count(*)::int from consultation_feedback f where f.dossier_id = d.id) as feedback_count
    from consultation_dossiers d
    order by d.created_at desc
  `;
  return rows.map((row) => ({
    id: String(row.id),
    label: String(row.label),
    appointmentAt: row.appointment_at ? new Date(row.appointment_at).toISOString() : null,
    appointmentMode: String(row.appointment_mode),
    intakeCompletedAt: row.intake_completed_at
      ? new Date(row.intake_completed_at).toISOString()
      : null,
    createdAt: new Date(row.created_at).toISOString(),
    intakeToken: decryptValue<string>(String(row.intake_token_cipher))!,
    feedbackToken: decryptValue<string>(String(row.feedback_token_cipher))!,
    intake: decryptValue<IntakeData>(row.intake_cipher ? String(row.intake_cipher) : null),
    feedbackCount: Number(row.feedback_count || 0),
  }));
}

export async function findDossierByIntakeToken(token: string) {
  await ensureSchema();
  const rows = await sqlClient()`
    select id, label, appointment_at, appointment_mode, intake_cipher, intake_completed_at
    from consultation_dossiers where intake_token_hash = ${hashToken(token)} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    label: String(row.label),
    appointmentAt: row.appointment_at ? new Date(row.appointment_at).toISOString() : null,
    appointmentMode: String(row.appointment_mode),
    intake: decryptValue<IntakeData>(row.intake_cipher ? String(row.intake_cipher) : null),
    intakeCompletedAt: row.intake_completed_at
      ? new Date(row.intake_completed_at).toISOString()
      : null,
  };
}

export async function saveIntake(token: string, data: IntakeData) {
  await ensureSchema();
  const rows = await sqlClient()`
    update consultation_dossiers
    set intake_cipher = ${encryptValue(data)}, intake_completed_at = now(), updated_at = now()
    where intake_token_hash = ${hashToken(token)}
    returning id
  `;
  return rows.length > 0;
}

export async function findDossierByFeedbackToken(token: string) {
  await ensureSchema();
  const rows = await sqlClient()`
    select id, label from consultation_dossiers
    where feedback_token_hash = ${hashToken(token)} limit 1
  `;
  return rows[0] ? { id: String(rows[0].id), label: String(rows[0].label) } : null;
}

export async function saveFeedback(token: string, data: FeedbackData) {
  await ensureSchema();
  const dossier = await findDossierByFeedbackToken(token);
  if (!dossier) return false;
  await sqlClient()`
    insert into consultation_feedback (
      id, dossier_id, feedback_cipher, publication_choice
    ) values (
      ${crypto.randomUUID()}, ${dossier.id}, ${encryptValue(data)}, ${data.publicationChoice}
    )
  `;
  return true;
}

export async function listFeedback() {
  await ensureSchema();
  const rows = await sqlClient()`
    select f.*, d.label from consultation_feedback f
    join consultation_dossiers d on d.id = f.dossier_id
    order by f.submitted_at desc
  `;
  return rows.map((row) => ({
    id: String(row.id),
    dossierLabel: String(row.label),
    data: decryptValue<FeedbackData>(String(row.feedback_cipher))!,
    publicationChoice: String(row.publication_choice),
    publicationApproved: Boolean(row.publication_approved),
    submittedAt: new Date(row.submitted_at).toISOString(),
  }));
}

export async function setFeedbackApproval(id: string, approved: boolean) {
  await ensureSchema();
  await sqlClient()`
    update consultation_feedback set publication_approved = ${approved}, updated_at = now()
    where id = ${id}
  `;
}

export async function listPublicFeedback() {
  if (!process.env.DATABASE_URL || !process.env.DATA_ENCRYPTION_KEY) return [];
  try {
    await ensureSchema();
    const rows = await sqlClient()`
      select feedback_cipher, publication_choice
      from consultation_feedback
      where publication_approved = true and publication_choice <> 'private'
      order by submitted_at desc
      limit 6
    `;
    return rows.flatMap((row) => {
      const data = decryptValue<FeedbackData>(String(row.feedback_cipher));
      if (!data?.consent || !data.benefit) return [];
      return [{
        rating: data.rating,
        text: data.benefit,
        author: row.publication_choice === "first_names" && data.displayName
          ? data.displayName
          : "Témoignage anonyme",
      }];
    });
  } catch {
    return [];
  }
}
