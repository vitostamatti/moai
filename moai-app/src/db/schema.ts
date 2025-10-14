import {
  pgTable,
  varchar,
  uuid,
  text,
  timestamp,
  jsonb,
  json,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  Constraint,
  Objective,
  Parameter,
  Set,
  Variable,
} from "@/lib/model/types";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
});

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
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

// ai chats
export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("created_at").notNull(),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  modelId: text("model_id")
    .notNull()
    .references(() => model.id),
});

export const message = pgTable("message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const stream = pgTable("stream", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
});

// Model Components Tables

// Core Models Table
export const model = pgTable("model", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  templateKey: text("template_key").unique(),
  isTemplate: boolean("is_template").notNull().default(false),
  description: text("description"),
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const set = pgTable("set", {
  id: text("id").primaryKey(),
  modelId: text("model_id")
    .notNull()
    .references(() => model.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").$type<Set>().notNull(),
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Parameters Table

export const parameter = pgTable("parameter", {
  id: text("id").primaryKey(),
  modelId: text("model_id")
    .notNull()
    .references(() => model.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").$type<Parameter>().notNull(),
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Variables Table

export const variable = pgTable("variable", {
  id: text("id").primaryKey(),
  modelId: text("model_id")
    .notNull()
    .references(() => model.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").$type<Variable>().notNull(),
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Constraints Table

export const constraint = pgTable("constraint", {
  id: text("id").primaryKey(),
  modelId: text("model_id")
    .notNull()
    .references(() => model.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").$type<Constraint>().notNull(),
  enabled: boolean("enabled").notNull().default(true),
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Objectives Table
export const objective = pgTable("objective", {
  id: text("id").primaryKey(),
  modelId: text("model_id")
    .notNull()
    .references(() => model.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(true),
  data: jsonb("data").notNull().$type<Objective>().notNull(),
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const modelsRelations = relations(model, ({ one, many }) => ({
  user: one(user, {
    fields: [model.userId],
    references: [user.id],
  }),
  sets: many(set),
  parameters: many(parameter),
  variables: many(variable),
  constraints: many(constraint),
  objectives: many(objective),
}));

export const setsRelations = relations(set, ({ one }) => ({
  model: one(model, {
    fields: [set.modelId],
    references: [model.id],
  }),
}));

export const parametersRelations = relations(parameter, ({ one }) => ({
  model: one(model, {
    fields: [parameter.modelId],
    references: [model.id],
  }),
}));

export const variablesRelations = relations(variable, ({ one }) => ({
  model: one(model, {
    fields: [variable.modelId],
    references: [model.id],
  }),
}));

export const constraintsRelations = relations(constraint, ({ one }) => ({
  model: one(model, {
    fields: [constraint.modelId],
    references: [model.id],
  }),
}));

export const objectivesRelations = relations(objective, ({ one }) => ({
  model: one(model, {
    fields: [objective.modelId],
    references: [model.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  models: many(model),
  sessions: many(session),
  accounts: many(account),
  chats: many(chat),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const chatRelations = relations(chat, ({ one, many }) => ({
  user: one(user, {
    fields: [chat.userId],
    references: [user.id],
  }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
}));

// Export types for use in your application
export type ModelSelect = typeof model.$inferSelect;
export type ModelInserts = typeof model.$inferInsert;
export type SetSelect = typeof set.$inferSelect;
export type SetInserts = typeof set.$inferInsert;
export type ParameterSelect = typeof parameter.$inferSelect;
export type ParameterInserts = typeof parameter.$inferInsert;
export type VariableSelect = typeof variable.$inferSelect;
export type VariableInserts = typeof variable.$inferInsert;
export type ConstraintSelect = typeof constraint.$inferSelect;
export type ConstraintInserts = typeof constraint.$inferInsert;
export type ObjectiveSelect = typeof objective.$inferSelect;
export type ObjectiveInserts = typeof objective.$inferInsert;
export type ChatSelect = typeof chat.$inferSelect;
export type ChatInserts = typeof chat.$inferInsert;
export type MessageSelect = typeof message.$inferSelect;
export type MessageInserts = typeof message.$inferInsert;

// Auth types
export type UserSelect = typeof user.$inferSelect;
export type UserInserts = typeof user.$inferInsert;
export type SessionSelect = typeof session.$inferSelect;
export type SessionInserts = typeof session.$inferInsert;
export type AccountSelect = typeof account.$inferSelect;
export type AccountInserts = typeof account.$inferInsert;
