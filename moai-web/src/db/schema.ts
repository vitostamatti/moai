import {
  pgTable,
  varchar,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  json,
  real,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { Expression } from "@/lib/editor/expression/core/types";
import { Quantifier } from "@/lib/editor/constraint/constraint-schema";
import { ParamValues } from "@/lib/editor/param/param-schema";

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

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Enums
export const variableDomainEnum = pgEnum("variable_domain", [
  "Binary",
  "NonNegativeIntegers",
  "NonNegativeReals",
  "Reals",
  "Integers",
]);

export const constraintTypeEnum = pgEnum("constraint_type", [
  "eq",
  "leq",
  "geq",
  "lt",
  "gt",
]);

export const objectiveTypeEnum = pgEnum("objective_type", [
  "minimize",
  "maximize",
]);

// Chat visibility: user = private to owner, organization = visible to org members
export const chatVisibilityEnum = pgEnum("chat_visibility", [
  "user",
  "organization",
]);

// Core Models Table
export const model = pgTable("model", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  templateKey: text("template_key").unique(),
  description: text("description"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  isTemplate: boolean("is_template").notNull().default(false),
  tags: jsonb("tags").$type<string[]>(),
});

// Sets Table
export const set = pgTable("set", {
  id: text("id").primaryKey(),
  modelId: text("model_id")
    .notNull()
    .references(() => model.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Canonical Python-compatible identifier auto-generated from name
  symbol: text("symbol").notNull().default(""),
  description: text("description"),
  elements: jsonb("elements").notNull().$type<string[] | number[]>(),
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
  // Canonical Python-compatible identifier auto-generated from name
  symbol: text("symbol").notNull().default(""),
  description: text("description"),
  indices: jsonb("indices").$type<string[]>(),
  values: jsonb("values").notNull().$type<ParamValues>(),
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
  // Canonical Python-compatible identifier auto-generated from name
  symbol: text("symbol").notNull().default(""),
  description: text("description"),
  domain: variableDomainEnum("domain").notNull(),
  lowerBound: real("lower_bound"),
  upperBound: real("upper_bound"),
  indices: jsonb("indices").$type<string[]>(),
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
  enabled: boolean("enabled").notNull().default(true),
  type: constraintTypeEnum("type").notNull(),
  leftSide: jsonb("left_side").notNull().$type<Expression>(), // Expression JSON
  rightSide: jsonb("right_side").notNull().$type<Expression>(), // Expression JSON
  quantifiers: jsonb("quantifiers").$type<Quantifier>(),
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
  type: objectiveTypeEnum("type").notNull(),
  expression: jsonb("expression").notNull().$type<Expression>(), // Expression JSON
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ai chats
export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("created_at").notNull(),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  organizationId: text("organization_id").references(() => organization.id),
  visibility: chatVisibilityEnum("visibility").notNull().default("user"),
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

// Relations
export const modelsRelations = relations(model, ({ one, many }) => ({
  user: one(user, {
    fields: [model.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [model.organizationId],
    references: [organization.id],
    relationName: "organization_models",
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

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
    relationName: "organization_members",
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
    relationName: "organization_invitations",
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member, { relationName: "organization_members" }),
  invitations: many(invitation, { relationName: "organization_invitations" }),
  models: many(model, { relationName: "organization_models" }),
  chats: many(chat, { relationName: "organization_chats" }),
}));

export const chatRelations = relations(chat, ({ one, many }) => ({
  user: one(user, {
    fields: [chat.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [chat.organizationId],
    references: [organization.id],
    relationName: "organization_chats",
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
