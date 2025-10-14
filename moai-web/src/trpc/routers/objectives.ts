import { protectedProcedure, router } from "../init";
import { z } from "zod";
import { db } from "@/db/client";
import {
  createObjective,
  updateObjective,
  deleteObjective,
} from "@/db/mutations";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { objectiveDefinitionSchema } from "@/lib/editor/objective/objective-schema";

const baseObjectiveShape = objectiveDefinitionSchema
  .pick({
    name: true,
    description: true,
    enabled: true,
    type: true,
    expression: true,
  })
  .extend({ isDraft: z.boolean().optional() });

export const objectivesRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        modelId: z.string().min(1),
        ...baseObjectiveShape.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
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
      const created = await createObjective({
        id: randomUUID(),
        modelId: input.modelId,
        name: input.name,
        description: input.description ?? null,
        enabled: input.enabled,
        type: input.type,
        expression: input.expression,
        isDraft: input.isDraft ?? false,
        createdAt: now,
        updatedAt: now,
      });
      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        ...baseObjectiveShape.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const current = await db.query.objective.findFirst({
        where: (o, { eq }) => eq(o.id, input.id),
      });
      if (!current)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Objective not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, current.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const updated = await updateObjective(input.id, {
        name: input.name,
        description: input.description ?? null,
        enabled: input.enabled,
        type: input.type,
        expression: input.expression,
        isDraft: input.isDraft ?? current.isDraft,
      });
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const current = await db.query.objective.findFirst({
        where: (o, { eq }) => eq(o.id, input.id),
      });
      if (!current)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Objective not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, current.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      await deleteObjective(input.id);
      return { id: input.id };
    }),
});
