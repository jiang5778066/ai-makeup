import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  pgSchema,
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  jsonb,
  date,
  timestamp,
  primaryKey,
  uniqueIndex,
  index
} from "drizzle-orm/pg-core";

// Supabase manages auth.users; we declare a stub here so we can reference it via FK.
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey()
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [index("projects_user_idx").on(t.userId)]
);

export const generations = pgTable(
  "generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    uploadKey: text("upload_key").notNull(),
    renderedUploadKey: text("rendered_upload_key"),
    resultKey: text("result_key"),
    styleId: text("style_id").notNull(),
    mode: text("mode").notNull().default("full_face"),
    sourceMode: text("source_mode").notNull().default("upload"),
    makeupConfig: jsonb("makeup_config").$type<Record<string, unknown>>(),
    intensity: integer("intensity").notNull().default(62),
    locale: text("locale").notNull().default("en"),
    status: text("status").notNull().default("queued"),
    error: text("error"),
    creditsRefundedAt: timestamp("credits_refunded_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    index("generations_user_idx").on(t.userId),
    index("generations_status_idx").on(t.status),
    index("generations_visible_user_created_idx").on(t.userId, t.createdAt.desc(), t.id.desc()).where(sql`${t.deletedAt} IS NULL`)
  ]
);

export const creditsLedger = pgTable(
  "credits_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    refType: text("ref_type"),
    refId: text("ref_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    index("credits_ledger_user_idx").on(t.userId),
    uniqueIndex("credits_ledger_reference_uq").on(t.userId, t.reason, t.refType, t.refId)
  ]
);

export const creditGrants = pgTable(
  "credit_grants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    initialAmount: integer("initial_amount").notNull(),
    remaining: integer("remaining").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    uniqueIndex("credit_grants_source_uq").on(t.sourceType, t.sourceId),
    index("credit_grants_user_idx").on(t.userId, t.createdAt)
  ]
);

export const creditConsumptions = pgTable(
  "credit_consumptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    grantId: uuid("grant_id")
      .notNull()
      .references(() => creditGrants.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    refType: text("ref_type").notNull(),
    refId: text("ref_id").notNull(),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    index("credit_consumptions_reference_idx").on(t.userId, t.refType, t.refId),
    index("credit_consumptions_grant_idx").on(t.grantId)
  ]
);

export const creditBalances = pgTable("credit_balances", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerOrderId: text("provider_order_id").notNull(),
    providerTransactionId: text("provider_transaction_id"),
    planId: text("plan_id").notNull(),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("USD"),
    creditsAwarded: integer("credits_awarded").notNull().default(0),
    status: text("status").notNull(),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    uniqueIndex("orders_provider_order_uq").on(t.provider, t.providerOrderId),
    uniqueIndex("orders_provider_transaction_uq").on(t.provider, t.providerTransactionId),
    index("orders_user_idx").on(t.userId)
  ]
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    payloadIdentity: text("payload_identity"),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [primaryKey({ columns: [t.provider, t.eventId] })]
);

export const billingCheckoutAttempts = pgTable("billing_checkout_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull(),
  provider: text("provider").notNull(),
  status: text("status").notNull(),
  requestId: text("request_id").notNull(),
  checkoutUrl: text("checkout_url"),
  providerOrderId: text("provider_order_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (t) => [
  check("billing_attempts_status_check", sql`${t.status} IN ('submitting','ready','unknown','failed','completed')`),
  check("billing_attempts_provider_check", sql`${t.provider} = 'creem'`),
  uniqueIndex("billing_attempts_request_uq").on(t.requestId),
  uniqueIndex("billing_attempts_active_uq").on(t.userId, t.provider).where(sql`${t.status} IN ('submitting','ready','unknown')`),
  uniqueIndex("billing_attempts_order_uq").on(t.provider, t.providerOrderId).where(sql`${t.providerOrderId} IS NOT NULL`)
]).enableRLS();

export const aiDailyUsage = pgTable("ai_daily_usage", {
  usageDate: date("usage_date").primaryKey(),
  reservedCents: integer("reserved_cents").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
export type CreditsLedgerEntry = typeof creditsLedger.$inferSelect;
export type CreditBalance = typeof creditBalances.$inferSelect;
export type Order = typeof orders.$inferSelect;

// 通用媒体独立保存，不放宽旧自拍与美妆风格约束。
export const mediaInputs = pgTable('media_inputs', {
 id:uuid('id').primaryKey().defaultRandom(), userId:uuid('user_id').notNull().references(()=>authUsers.id,{onDelete:'cascade'}),
 stagingKey:text('staging_key').notNull(), sealedKey:text('sealed_key'), status:text('status').notNull().default('uploading'),
 expectedMime:text('expected_mime').notNull(), expectedBytes:integer('expected_bytes').notNull(), expectedSha256:text('expected_sha256').notNull(),
 verifiedMime:text('verified_mime'), verifiedBytes:integer('verified_bytes'), verifiedSha256:text('verified_sha256'),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(), expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(), sealedAt:timestamp('sealed_at',{withTimezone:true})
},t=>[
 uniqueIndex('media_inputs_owner_uq').on(t.userId,t.id), uniqueIndex('media_inputs_staging_uq').on(t.stagingKey),uniqueIndex('media_inputs_sealed_uq').on(t.sealedKey),
 index('media_inputs_expiry_idx').on(t.expiresAt).where(sql`${t.status} = 'uploading'`),
 check('media_inputs_status_check',sql`${t.status} IN ('uploading','ready','rejected','expired')`),
 check('media_inputs_content_check',sql`${t.expectedMime} IN ('image/png','image/jpeg','image/webp') AND ${t.expectedBytes} BETWEEN 1 AND 8388608 AND ${t.expectedSha256} ~ '^[0-9a-f]{64}$'`),
 check('media_inputs_sealed_check',sql`${t.status} <> 'ready' OR (${t.sealedKey} IS NOT NULL AND ${t.verifiedMime} IS NOT NULL AND ${t.verifiedBytes} IS NOT NULL AND ${t.verifiedSha256} IS NOT NULL AND ${t.verifiedMime} = ${t.expectedMime} AND ${t.verifiedBytes} = ${t.expectedBytes} AND ${t.verifiedSha256} = ${t.expectedSha256} AND ${t.sealedAt} IS NOT NULL)`)
]).enableRLS();
export const mediaTasks = pgTable('media_tasks', {
 id:uuid('id').primaryKey().defaultRandom(),userId:uuid('user_id').notNull().references(()=>authUsers.id,{onDelete:'cascade'}),
 mediaType:text('media_type').notNull(),provider:text('provider').notNull().default('router_creative'),providerAccountRef:text('provider_account_ref').notNull(),model:text('model').notNull(),mode:text('mode').notNull(),capabilityVersion:text('capability_version').notNull().default('media-v1'),
 request:jsonb('request').notNull(),requestHash:text('request_hash').notNull(),clientIntentId:uuid('client_intent_id').notNull(),clientIdempotencyKey:text('client_idempotency_key').notNull(),inputId:uuid('input_id'),
 quote:jsonb('quote').notNull(),creditsQuoted:integer('credits_quoted').notNull(),providerUpperCents:integer('provider_upper_cents').notNull(),budgetUsageDate:date('budget_usage_date'),budgetReservedAt:timestamp('budget_reserved_at',{withTimezone:true}),
 status:text('status').notNull().default('preparing'),creditState:text('credit_state').notNull().default('none'),stateVersion:integer('state_version').notNull().default(0),errorCode:text('error_code'),reconcileStage:text('reconcile_stage'),
 submissionId:uuid('submission_id'),submission:jsonb('submission'),submissionIntentAt:timestamp('submission_intent_at',{withTimezone:true}),providerTaskId:text('provider_task_id'),resultLocator:text('result_locator'),providerCompletedAt:timestamp('provider_completed_at',{withTimezone:true}),
 resultKey:text('result_key'),resultMime:text('result_mime'),resultBytes:bigint('result_bytes',{mode:'number'}),resultSha256:text('result_sha256'),
 creditsReservedAt:timestamp('credits_reserved_at',{withTimezone:true}),creditsSettledAt:timestamp('credits_settled_at',{withTimezone:true}),creditsRefundedAt:timestamp('credits_refunded_at',{withTimezone:true}),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),nextActionAt:timestamp('next_action_at',{withTimezone:true}).defaultNow(),queryRound:integer('query_round').notNull().default(0),
 leaseToken:uuid('lease_token'),leaseExpiresAt:timestamp('lease_expires_at',{withTimezone:true}),deletedAt:timestamp('deleted_at',{withTimezone:true})
},t=>[
 uniqueIndex('media_tasks_owner_uq').on(t.userId,t.id),uniqueIndex('media_tasks_key_uq').on(t.userId,t.clientIdempotencyKey),uniqueIndex('media_tasks_intent_uq').on(t.userId,t.clientIntentId),uniqueIndex('media_tasks_submission_uq').on(t.submissionId),
 uniqueIndex('media_tasks_provider_task_uq').on(t.provider,t.providerAccountRef,t.providerTaskId).where(sql`${t.providerTaskId} IS NOT NULL`),
 index('media_tasks_visible_idx').on(t.userId,t.createdAt.desc(),t.id.desc()).where(sql`${t.deletedAt} IS NULL`),index('media_tasks_recovery_idx').on(t.nextActionAt,t.id).where(sql`${t.status} IN ('reserved','submitting','waiting','storing','reconciling')`),
 foreignKey({columns:[t.userId,t.inputId],foreignColumns:[mediaInputs.userId,mediaInputs.id]}),
 check('media_tasks_mode_check',sql`${t.provider} = 'router_creative' AND ((${t.mediaType}='image' AND ${t.model}='gpt-image-2' AND ${t.mode} IN ('text_to_image','image_to_image')) OR (${t.mediaType}='video' AND ${t.model}='grok-imagine-video-1.5' AND ${t.mode} IN ('text_to_video','image_to_video')))`),
 check('media_tasks_input_check',sql`(${t.mode} LIKE 'image_to_%') = (${t.inputId} IS NOT NULL)`),
 check('media_tasks_value_check',sql`${t.creditsQuoted}>0 AND ${t.providerUpperCents}>0 AND ${t.stateVersion}>=0 AND ${t.requestHash} ~ '^[0-9a-f]{64}$'`),
 check('media_tasks_status_check',sql`${t.status} IN ('preparing','reserved','submitting','waiting','storing','reconciling','done','failed','refunded') AND ${t.creditState} IN ('none','reserved','settled','refunded') AND (${t.reconcileStage} IS NULL OR ${t.reconcileStage} IN ('submission','query','storage','accounting'))`),
 check('media_tasks_settlement_check',sql`(${t.status} <> 'done' OR (${t.creditState}='settled' AND ${t.resultKey} IS NOT NULL AND ${t.resultMime} IS NOT NULL AND ${t.resultBytes} IS NOT NULL AND ${t.resultSha256} IS NOT NULL AND ${t.resultBytes}>0 AND ${t.resultSha256} ~ '^[0-9a-f]{64}$')) AND (${t.status}<>'refunded' OR ${t.creditState}='refunded') AND (${t.status}<>'failed' OR ${t.creditState}='none') AND (${t.status} NOT IN ('reserved','submitting','waiting','storing','reconciling') OR ${t.creditState}='reserved')`),
 check('media_tasks_mime_check',sql`${t.resultMime} IS NULL OR (${t.mediaType}='image' AND ${t.resultMime} IN ('image/png','image/jpeg','image/webp')) OR (${t.mediaType}='video' AND ${t.resultMime} IN ('video/mp4','video/webm'))`)
]).enableRLS();
export const mediaTaskEvents = pgTable('media_task_events',{
 id:uuid('id').primaryKey().defaultRandom(),taskId:uuid('task_id').notNull(),userId:uuid('user_id').notNull(),operationId:uuid('operation_id').notNull(),eventType:text('event_type').notNull(),stateVersion:integer('state_version').notNull(),actorKind:text('actor_kind').notNull().default('system'),actorId:text('actor_id'),evidenceRef:text('evidence_ref'),payloadIdentity:text('payload_identity').notNull(),details:jsonb('details').notNull().default({}),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()
},t=>[foreignKey({columns:[t.userId,t.taskId],foreignColumns:[mediaTasks.userId,mediaTasks.id]}),uniqueIndex('media_events_operation_uq').on(t.taskId,t.operationId),index('media_events_task_idx').on(t.taskId,t.createdAt,t.id),check('media_events_actor_check',sql`${t.actorKind} IN ('system','operator')`)]).enableRLS();
