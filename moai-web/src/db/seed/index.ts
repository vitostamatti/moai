import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "../schema";
import { randomUUID } from "crypto";
import { seedTransportation } from "./templates/transportation";
import { seedProductionPlanning } from "./templates/production-planning";
import { seedKnapsack } from "./templates/knapsack";
import { seedAssignment } from "./templates/assignment";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const db = drizzle(pool, { schema });

async function getOrCreateSystemUser() {
  const systemEmail = "templates@moai-system.local";
  const existing = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, systemEmail),
  });
  if (existing) return existing;

  const [sys] = await db
    .insert(schema.user)
    .values({
      id: randomUUID(),
      name: "Moai Templates",
      email: systemEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      emailVerified: false,
    })
    .returning();
  return sys;
}

export type UpsertTemplate = (args: {
  key: string;
  name: string;
  description?: string;
  tags?: string[];
  userId: string;
}) => Promise<schema.ModelSelect>;

async function upsertTemplate({
  key,
  name,
  description,
  tags,
  userId,
}: {
  key: string;
  name: string;
  description?: string;
  tags?: string[];
  userId: string;
}) {
  const existing = await db.query.model.findFirst({
    where: (m, { eq }) => eq(m.templateKey, key),
  });
  const now = new Date();
  if (existing) {
    await db
      .update(schema.model)
      .set({ name, description, tags: tags ?? [], updatedAt: now })
      .where(eq(schema.model.id, existing.id));
    return existing;
  }
  const [model] = await db
    .insert(schema.model)
    .values({
      id: randomUUID(),
      templateKey: key,
      name,
      description,
      version: 1,
      createdAt: now,
      updatedAt: now,
      userId,
      isTemplate: true,
      tags: tags ?? [],
    })
    .returning();
  return model;
}

async function seed() {
  const systemUser = await getOrCreateSystemUser();

  // Seed templates using per-template files
  await seedTransportation(db, upsertTemplate, systemUser.id);
  await seedProductionPlanning(db, upsertTemplate, systemUser.id);
  await seedKnapsack(db, upsertTemplate, systemUser.id);
  await seedAssignment(db, upsertTemplate, systemUser.id);

  await pool.end();
  console.log("Seed completed ✅");
}

seed().catch(async (err) => {
  console.error("Template seed failed:", err);
  await pool.end();
  process.exit(1);
});
