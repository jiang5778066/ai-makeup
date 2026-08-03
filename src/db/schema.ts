import {
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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    index("generations_user_idx").on(t.userId),
    index("generations_status_idx").on(t.status)
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
    userId: uuid("user_id").references(() => authUsers.id, { onDelete: "set null" }),
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
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [primaryKey({ columns: [t.provider, t.eventId] })]
);

export const aiDailyUsage = pgTable("ai_daily_usage", {
  usageDate: date("usage_date").primaryKey(),
  reservedCents: integer("reserved_cents").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const rateLimitBuckets = pgTable("rate_limit_buckets", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
export type CreditsLedgerEntry = typeof creditsLedger.$inferSelect;
export type CreditBalance = typeof creditBalances.$inferSelect;
export type Order = typeof orders.$inferSelect;
