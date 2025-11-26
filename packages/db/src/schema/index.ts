import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  uuid,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * User table for authentication
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Session table for auth
 */
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Account table for OAuth providers
 */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Verification table for email verification
 */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Council query - stores each query to the council
 */
export const councilQuery = pgTable("council_query", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  prompt: text("prompt").notNull(),
  systemPrompt: text("system_prompt"),
  finalResponse: text("final_response").notNull(),
  chairmanProvider: text("chairman_provider").notNull(),
  chairmanModel: text("chairman_model").notNull(),
  totalLatencyMs: integer("total_latency_ms").notNull(),
  config: jsonb("config"),
  debug: jsonb("debug"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Worker response - individual model responses
 */
export const workerResponse = pgTable("worker_response", {
  id: uuid("id").defaultRandom().primaryKey(),
  queryId: uuid("query_id")
    .notNull()
    .references(() => councilQuery.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull(),
  modelId: text("model_id").notNull(),
  content: text("content").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  totalTokens: integer("total_tokens"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Model critique - critique from one model about responses
 */
export const modelCritique = pgTable("model_critique", {
  id: uuid("id").defaultRandom().primaryKey(),
  queryId: uuid("query_id")
    .notNull()
    .references(() => councilQuery.id, { onDelete: "cascade" }),
  criticProviderId: text("critic_provider_id").notNull(),
  criticModelId: text("critic_model_id").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Individual critique entry
 */
export const critiqueEntry = pgTable("critique_entry", {
  id: uuid("id").defaultRandom().primaryKey(),
  critiqueId: uuid("critique_id")
    .notNull()
    .references(() => modelCritique.id, { onDelete: "cascade" }),
  responseId: text("response_id").notNull(), // "Response A", etc.
  rank: integer("rank").notNull(),
  overallScore: real("overall_score").notNull(),
  strengths: jsonb("strengths").$type<string[]>(),
  weaknesses: jsonb("weaknesses").$type<string[]>(),
  errors: jsonb("errors").$type<string[]>(),
  reasoning: text("reasoning"),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  queries: many(councilQuery),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const councilQueryRelations = relations(councilQuery, ({ one, many }) => ({
  user: one(user, { fields: [councilQuery.userId], references: [user.id] }),
  workerResponses: many(workerResponse),
  critiques: many(modelCritique),
}));

export const workerResponseRelations = relations(workerResponse, ({ one }) => ({
  query: one(councilQuery, {
    fields: [workerResponse.queryId],
    references: [councilQuery.id],
  }),
}));

export const modelCritiqueRelations = relations(modelCritique, ({ one, many }) => ({
  query: one(councilQuery, {
    fields: [modelCritique.queryId],
    references: [councilQuery.id],
  }),
  entries: many(critiqueEntry),
}));

export const critiqueEntryRelations = relations(critiqueEntry, ({ one }) => ({
  critique: one(modelCritique, {
    fields: [critiqueEntry.critiqueId],
    references: [modelCritique.id],
  }),
}));
