import { protectedProcedure, router } from "../init";
import { z } from "zod";
import { db } from "@/db/client";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { toPythonIdentifier } from "@/lib/identifiers";
import { createSet, updateSet, deleteSet } from "@/db/mutations";
import { getSetById, getSetsByModelId } from "@/db/queries";

const baseSetShape = {
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  elements: z.union([z.array(z.string()), z.array(z.number())]),
  isDraft: z.boolean().optional(),
};

export const setsRouter = router({
  // List sets for a model (org scoped)
  list: protectedProcedure
    .input(
      z.object({
        modelId: z.string().min(1),
        draftsOnly: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      // Ensure model belongs to org
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, input.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Model not found or access denied",
        });

      const sets = await getSetsByModelId(input.modelId);
      return input.draftsOnly ? sets.filter((s) => s.isDraft) : sets;
    }),

  // Get single set by id (org scoped)
  get: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const s = await getSetById(input.id);
      if (!s)
        throw new TRPCError({ code: "NOT_FOUND", message: "Set not found" });

      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, s.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      return s;
    }),

  // Create set in a model (org scoped)
  create: protectedProcedure
    .input(z.object({ modelId: z.string().min(1), ...baseSetShape }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      // Ensure model belongs to org
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, input.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Model not found or access denied",
        });

      const now = new Date();
      const created = await createSet({
        id: randomUUID(),
        modelId: input.modelId,
        name: input.name,
        symbol: toPythonIdentifier(input.name),
        description: input.description ?? null,
        elements: input.elements,
        isDraft: input.isDraft ?? false,
        createdAt: now,
        updatedAt: now,
      });
      return created;
    }),

  // Update set (org scoped via set->model)
  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), ...baseSetShape }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const current = await getSetById(input.id);
      if (!current)
        throw new TRPCError({ code: "NOT_FOUND", message: "Set not found" });

      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, current.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const updated = await updateSet(input.id, {
        name: input.name,
        symbol: toPythonIdentifier(input.name),
        description: input.description ?? null,
        elements: input.elements,
        isDraft: input.isDraft ?? current.isDraft,
      });
      return updated;
    }),

  // Delete set (org scoped via set->model)
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const current = await getSetById(input.id);
      if (!current)
        throw new TRPCError({ code: "NOT_FOUND", message: "Set not found" });

      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, current.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      await deleteSet(input.id);
      return { id: input.id };
    }),
});
