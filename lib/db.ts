import postgres from "postgres";
import { decryptValue, encryptValue, hashToken, newPrivateToken } from "./secure-data";
import type { ConsultationType } from "./consultation-framework";
import type { PaymentCurrency, PaymentPlan } from "./payment-config";

let client: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

function databaseSchema() {
  const schema = process.env.DATABASE_SCHEMA?.trim();
  if (!schema) return null;
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) {
    throw new Error("DATABASE_SCHEMA doit être un identifiant PostgreSQL simple.");
  }
  return schema;
}

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL n’est pas configurée.");
  if (!client) {
    const schema = databaseSchema();
    client = postgres(url, {
      max: 1,
      prepare: false,
      ssl: url.includes("localhost") ? false : "require",
      ...(schema ? { connection: { search_path: schema } } : {}),
    });
  }
  return client;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = sqlClient();
      const schema = databaseSchema();
      if (schema) await sql`create schema if not exists ${sql(schema)}`;
      await sql`
        create table if not exists consultation_dossiers (
          id text primary key,
          label text not null,
          consultation_type text not null default 'couple',
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
        alter table consultation_dossiers
        add column if not exists consultation_type text not null default 'couple'
      `;
      await sql`
        alter table consultation_dossiers
          add column if not exists stripe_customer_id text,
          add column if not exists stripe_setup_intent_id text,
          add column if not exists stripe_payment_method_id text,
          add column if not exists stripe_payment_intent_id text,
          add column if not exists payment_plan text,
          add column if not exists payment_currency text,
          add column if not exists payment_amount integer,
          add column if not exists payment_status text not null default 'not_started',
          add column if not exists payment_card_brand text,
          add column if not exists payment_card_last4 text,
          add column if not exists payment_card_exp_month integer,
          add column if not exists payment_card_exp_year integer,
          add column if not exists payment_authorization_cipher text,
          add column if not exists payment_method_ready_at timestamptz,
          add column if not exists payment_charge_requested_at timestamptz,
          add column if not exists payment_paid_at timestamptz,
          add column if not exists payment_attempt_count integer not null default 0,
          add column if not exists payment_last_error text
      `;
      await sql`create index if not exists consultation_dossiers_setup_intent_idx on consultation_dossiers(stripe_setup_intent_id)`;
      await sql`create index if not exists consultation_dossiers_payment_intent_idx on consultation_dossiers(stripe_payment_intent_id)`;
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
      await sql`
        create table if not exists stripe_webhook_events (
          event_id text primary key,
          event_type text not null,
          processed_at timestamptz not null default now()
        )
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export type IntakeData = {
  consultationType?: ConsultationType;
  husbandFirstName?: string;
  husbandLastName?: string;
  husbandAge?: string;
  husbandEmail?: string;
  husbandPhone?: string;
  wifeFirstName?: string;
  wifeLastName?: string;
  wifeAge?: string;
  wifeEmail?: string;
  wifePhone?: string;
  individualFirstName?: string;
  individualLastName?: string;
  individualAge?: string;
  individualEmail?: string;
  individualPhone?: string;
  marriageDate: string;
  country: string;
  children: string;
  previousSupport?: string;
  mainReason?: string;
  difficultySince?: string;
  priority?: string;
  husbandSafe?: string;
  wifeSafe?: string;
  husbandAccepted?: boolean;
  wifeAccepted?: boolean;
  individualAccepted?: boolean;
  husbandKeyRulesAccepted?: boolean;
  wifeKeyRulesAccepted?: boolean;
  individualKeyRulesAccepted?: boolean;
  husbandSignature?: string;
  wifeSignature?: string;
  individualSignature?: string;
  privacyAccepted: boolean;
  acceptedAt: string;
  frameworkVersion: string;
  frameworkDigest?: string;
  frameworkSnapshot?: string;
  acceptedTextDigest?: string;
  acceptedTextSnapshot?: string;
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

export type PaymentStatus =
  | "not_started"
  | "setup_pending"
  | "ready"
  | "charge_pending"
  | "requires_action"
  | "paid"
  | "failed";

export type PaymentAuthorizationData = {
  plan: PaymentPlan;
  currency: PaymentCurrency;
  amount: number;
  cardholderName: string;
  receiptEmail: string;
  consentAt: string;
  termsVersion: string;
  termsDigest: string;
  termsSnapshot: string;
};

export type DossierPayment = {
  status: PaymentStatus;
  plan: PaymentPlan | null;
  currency: PaymentCurrency | null;
  amount: number | null;
  stripeCustomerId: string | null;
  stripeSetupIntentId: string | null;
  stripePaymentMethodId: string | null;
  stripePaymentIntentId: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: number | null;
  cardExpYear: number | null;
  authorization: PaymentAuthorizationData | null;
  methodReadyAt: string | null;
  chargeRequestedAt: string | null;
  paidAt: string | null;
  attemptCount: number;
  lastError: string | null;
};

function dateIso(value: unknown) {
  return value ? new Date(value as string | number | Date).toISOString() : null;
}

function paymentFromRow(row: Record<string, unknown>): DossierPayment {
  const rawStatus = String(row.payment_status || "not_started");
  const validStatuses = new Set<PaymentStatus>([
    "not_started", "setup_pending", "ready", "charge_pending",
    "requires_action", "paid", "failed",
  ]);
  return {
    status: validStatuses.has(rawStatus as PaymentStatus)
      ? rawStatus as PaymentStatus
      : "not_started",
    plan: row.payment_plan === "single" || row.payment_plan === "pack6"
      ? row.payment_plan
      : null,
    currency: row.payment_currency === "ils" || row.payment_currency === "eur"
      ? row.payment_currency
      : null,
    amount: row.payment_amount === null || row.payment_amount === undefined
      ? null
      : Number(row.payment_amount),
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : null,
    stripeSetupIntentId: row.stripe_setup_intent_id ? String(row.stripe_setup_intent_id) : null,
    stripePaymentMethodId: row.stripe_payment_method_id ? String(row.stripe_payment_method_id) : null,
    stripePaymentIntentId: row.stripe_payment_intent_id ? String(row.stripe_payment_intent_id) : null,
    cardBrand: row.payment_card_brand ? String(row.payment_card_brand) : null,
    cardLast4: row.payment_card_last4 ? String(row.payment_card_last4) : null,
    cardExpMonth: row.payment_card_exp_month ? Number(row.payment_card_exp_month) : null,
    cardExpYear: row.payment_card_exp_year ? Number(row.payment_card_exp_year) : null,
    authorization: decryptValue<PaymentAuthorizationData>(
      row.payment_authorization_cipher ? String(row.payment_authorization_cipher) : null,
    ),
    methodReadyAt: dateIso(row.payment_method_ready_at),
    chargeRequestedAt: dateIso(row.payment_charge_requested_at),
    paidAt: dateIso(row.payment_paid_at),
    attemptCount: Number(row.payment_attempt_count || 0),
    lastError: row.payment_last_error ? String(row.payment_last_error) : null,
  };
}

export async function createDossier(input: {
  label: string;
  appointmentAt?: string;
  appointmentMode: string;
  consultationType: ConsultationType;
}) {
  await ensureSchema();
  const sql = sqlClient();
  const id = crypto.randomUUID();
  const intakeToken = newPrivateToken();
  const feedbackToken = newPrivateToken();
  await sql`
    insert into consultation_dossiers (
      id, label, consultation_type, appointment_at, appointment_mode,
      intake_token_hash, intake_token_cipher,
      feedback_token_hash, feedback_token_cipher
    ) values (
      ${id}, ${input.label}, ${input.consultationType}, ${input.appointmentAt || null}, ${input.appointmentMode},
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
    consultationType: (row.consultation_type === "individual" ? "individual" : "couple") as ConsultationType,
    appointmentAt: row.appointment_at ? new Date(row.appointment_at).toISOString() : null,
    appointmentMode: String(row.appointment_mode),
    intakeCompletedAt: row.intake_completed_at
      ? new Date(row.intake_completed_at).toISOString()
      : null,
    createdAt: new Date(row.created_at).toISOString(),
    intakeToken: decryptValue<string>(String(row.intake_token_cipher))!,
    feedbackToken: decryptValue<string>(String(row.feedback_token_cipher))!,
    intake: decryptValue<IntakeData>(row.intake_cipher ? String(row.intake_cipher) : null),
    payment: paymentFromRow(row),
    feedbackCount: Number(row.feedback_count || 0),
  }));
}

export async function findDossierByIntakeToken(token: string) {
  await ensureSchema();
  const rows = await sqlClient()`
    select *
    from consultation_dossiers where intake_token_hash = ${hashToken(token)} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    label: String(row.label),
    consultationType: (row.consultation_type === "individual" ? "individual" : "couple") as ConsultationType,
    appointmentAt: row.appointment_at ? new Date(row.appointment_at).toISOString() : null,
    appointmentMode: String(row.appointment_mode),
    intake: decryptValue<IntakeData>(row.intake_cipher ? String(row.intake_cipher) : null),
    intakeCompletedAt: row.intake_completed_at
      ? new Date(row.intake_completed_at).toISOString()
      : null,
    payment: paymentFromRow(row),
  };
}

export async function saveIntake(token: string, data: IntakeData) {
  await ensureSchema();
  const rows = await sqlClient()`
    update consultation_dossiers
    set intake_cipher = ${encryptValue(data)}, intake_completed_at = now(), updated_at = now()
    where intake_token_hash = ${hashToken(token)} and intake_completed_at is null
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

export async function clearDossierIntake(id: string) {
  await ensureSchema();
  await sqlClient()`
    update consultation_dossiers
    set intake_cipher = null,
        intake_completed_at = null,
        stripe_customer_id = null,
        stripe_setup_intent_id = null,
        stripe_payment_method_id = null,
        stripe_payment_intent_id = null,
        payment_plan = null,
        payment_currency = null,
        payment_amount = null,
        payment_status = 'not_started',
        payment_card_brand = null,
        payment_card_last4 = null,
        payment_card_exp_month = null,
        payment_card_exp_year = null,
        payment_authorization_cipher = null,
        payment_method_ready_at = null,
        payment_charge_requested_at = null,
        payment_paid_at = null,
        payment_attempt_count = 0,
        payment_last_error = null,
        updated_at = now()
    where id = ${id}
  `;
}

export async function savePendingPaymentSetup(input: {
  token: string;
  customerId: string;
  setupIntentId: string;
  authorization: PaymentAuthorizationData;
}) {
  await ensureSchema();
  const rows = await sqlClient()`
    update consultation_dossiers
    set stripe_customer_id = ${input.customerId},
        stripe_setup_intent_id = ${input.setupIntentId},
        stripe_payment_method_id = null,
        payment_plan = ${input.authorization.plan},
        payment_currency = ${input.authorization.currency},
        payment_amount = ${input.authorization.amount},
        payment_status = 'setup_pending',
        payment_authorization_cipher = ${encryptValue(input.authorization)},
        payment_method_ready_at = null,
        payment_card_brand = null,
        payment_card_last4 = null,
        payment_card_exp_month = null,
        payment_card_exp_year = null,
        payment_last_error = null,
        updated_at = now()
    where intake_token_hash = ${hashToken(input.token)}
      and intake_completed_at is not null
      and payment_status <> 'paid'
    returning id
  `;
  return rows[0] ? String(rows[0].id) : null;
}

export async function markPaymentMethodReady(input: {
  dossierId: string;
  setupIntentId: string;
  paymentMethodId: string;
  cardBrand?: string | null;
  cardLast4?: string | null;
  cardExpMonth?: number | null;
  cardExpYear?: number | null;
}) {
  await ensureSchema();
  const rows = await sqlClient()`
    update consultation_dossiers
    set stripe_payment_method_id = ${input.paymentMethodId},
        payment_status = 'ready',
        payment_method_ready_at = coalesce(payment_method_ready_at, now()),
        payment_card_brand = ${input.cardBrand || null},
        payment_card_last4 = ${input.cardLast4 || null},
        payment_card_exp_month = ${input.cardExpMonth || null},
        payment_card_exp_year = ${input.cardExpYear || null},
        payment_last_error = null,
        updated_at = now()
    where id = ${input.dossierId}
      and stripe_setup_intent_id = ${input.setupIntentId}
      and payment_status <> 'paid'
    returning id
  `;
  return rows.length > 0;
}

export async function markPaymentSetupFailed(
  dossierId: string,
  setupIntentId: string,
  message: string,
) {
  await ensureSchema();
  await sqlClient()`
    update consultation_dossiers
    set payment_status = 'failed', payment_last_error = ${message}, updated_at = now()
    where id = ${dossierId} and stripe_setup_intent_id = ${setupIntentId}
      and payment_status <> 'paid'
  `;
}

export async function findDossierPaymentById(id: string) {
  await ensureSchema();
  const rows = await sqlClient()`
    select * from consultation_dossiers where id = ${id} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    label: String(row.label),
    appointmentAt: dateIso(row.appointment_at),
    intakeToken: decryptValue<string>(String(row.intake_token_cipher))!,
    payment: paymentFromRow(row),
  };
}

export async function reservePaymentCharge(id: string) {
  await ensureSchema();
  const rows = await sqlClient()`
    update consultation_dossiers
    set payment_status = 'charge_pending',
        payment_attempt_count = payment_attempt_count + 1,
        payment_charge_requested_at = now(),
        payment_last_error = null,
        updated_at = now()
    where id = ${id}
      and stripe_payment_method_id is not null
      and payment_status in ('ready', 'failed')
    returning *
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    label: String(row.label),
    appointmentAt: dateIso(row.appointment_at),
    payment: paymentFromRow(row),
  };
}

export async function setPaymentIntentOutcome(input: {
  dossierId: string;
  paymentIntentId?: string | null;
  expectedAttemptCount?: number;
  status: "charge_pending" | "requires_action" | "paid" | "failed";
  error?: string | null;
}) {
  await ensureSchema();
  const rows = await sqlClient()`
    update consultation_dossiers
    set stripe_payment_intent_id = coalesce(${input.paymentIntentId || null}, stripe_payment_intent_id),
        payment_status = ${input.status},
        payment_paid_at = case when ${input.status} = 'paid' then coalesce(payment_paid_at, now()) else payment_paid_at end,
        payment_last_error = ${input.error || null},
        updated_at = now()
    where id = ${input.dossierId}
      and (${input.expectedAttemptCount ?? null}::integer is null or payment_attempt_count = ${input.expectedAttemptCount ?? null})
      and (payment_status <> 'paid' or ${input.status} = 'paid')
    returning id
  `;
  return rows.length > 0;
}

export async function beginStripeWebhookEvent(eventId: string, eventType: string) {
  await ensureSchema();
  const rows = await sqlClient()`
    insert into stripe_webhook_events (event_id, event_type)
    values (${eventId}, ${eventType})
    on conflict (event_id) do nothing
    returning event_id
  `;
  return rows.length > 0;
}

export async function releaseStripeWebhookEvent(eventId: string) {
  await ensureSchema();
  await sqlClient()`delete from stripe_webhook_events where event_id = ${eventId}`;
}

export async function deleteDossier(id: string) {
  await ensureSchema();
  await sqlClient()`delete from consultation_dossiers where id = ${id}`;
}

export async function deleteFeedback(id: string) {
  await ensureSchema();
  await sqlClient()`delete from consultation_feedback where id = ${id}`;
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
