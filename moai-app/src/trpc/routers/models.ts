import { publicProcedure, protectedProcedure, router } from "../init";
import {
  getSetsByModelId,
  getParametersByModelId,
  getVariablesByModelId,
  getConstraintsByModelId,
  getObjectivesByModelId,
  getModelsByUserId,
  getUserModelWithComponents,
} from "@/db/queries";
import { deleteModel, duplicateModel, updateModel } from "@/db/mutations";
import { db } from "@/db";
import * as s from "@/db/schema";
import { randomUUID } from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const modelsRouter = router({
  // Query: list available templates (global templates marked isTemplate)
  templates: publicProcedure.query(async () => {
    const rows = await db.query.model.findMany({
      where: (m, { eq }) => eq(m.isTemplate, true),
      orderBy: (m, { asc }) => [asc(m.name)],
    });

    return rows.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description ?? null,
    }));
  }),
  // Query: list models for current user or org
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // We assume we're always inside an organization context.
    const base = await getModelsByUserId(userId);

    const enriched = await Promise.all(
      base.map(async (m) => {
        const [sets, parameters, variables, constraints, objectives] =
          await Promise.all([
            getSetsByModelId(m.id),
            getParametersByModelId(m.id),
            getVariablesByModelId(m.id),
            getConstraintsByModelId(m.id),
            getObjectivesByModelId(m.id),
          ]);

        return {
          id: m.id,
          name: m.name,
          description: m.description,
          ownerName: m.user?.name ?? null,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          componentsCount: {
            sets: sets.length,
            parameters: parameters.length,
            variables: variables.length,
            constraints: constraints.length,
            objectives: objectives.length,
          },
        };
      })
    );

    return enriched;
  }),

  // Mutation: create empty model
  create: protectedProcedure
    .input(
      z.object({ name: z.string().min(1), description: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const now = new Date();
      const [model] = await db
        .insert(s.model)
        .values({
          id: randomUUID(),
          name: input.name,
          description: input.description ?? null,
          createdAt: now,
          updatedAt: now,
          userId: userId,
          isTemplate: false,
        })
        .returning();
      return model;
    }),

  // Mutation: create from template
  createFromTemplate: protectedProcedure
    .input(
      z.object({ templateId: z.string().min(1), name: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const now = new Date();

      const result = await duplicateModel(input.templateId, userId, {
        id: randomUUID(),
        name: input.name ?? "",
        description: null,

        createdAt: now,
        updatedAt: now,
        userId: userId,

        isTemplate: false,
        templateKey: null,
      });

      return result.model;
    }),

  // Mutation: update model (name/description only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(120),
        description: z.string().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const updated = await updateModel(input.id, userId, {
        name: input.name,
        description: input.description ?? null,
      });
      return updated;
    }),

  // Mutation: delete model
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      await deleteModel(input.id, userId);
      return { id: input.id };
    }),

  // Mutation: clone model
  clone: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const now = new Date();
      const result = await duplicateModel(input.id, userId, {
        id: randomUUID(),
        name: input.name ?? "",
        userId: userId,
        templateKey: null,
        isTemplate: false,
        description: null,
        isDraft: true,
        createdAt: now,
        updatedAt: now,
      });

      return result.model;
    }),

  // Query: model details with components (org-scoped)
  detail: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        console.error("Missing userId in context", { input });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing userId",
        });
      }
      const model = await getUserModelWithComponents(input.id, userId);
      if (!model) {
        console.error("Model not found", {
          modelId: input.id,
          userId,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Model not found",
        });
      }
      return model;
    }),
});
