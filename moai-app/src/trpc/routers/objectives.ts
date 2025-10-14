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

const baseObjectiveShape = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  isDraft: z.boolean().optional(),
  enabled: z.boolean().optional().default(true),
});

export const objectivesRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        modelId: z.string().min(1),
        ...baseObjectiveShape.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, input.modelId), eq(m.userId, userId)),
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
        data: {
          name: "",
          expr: {
            type: "number",
            value: 0,
          },
        },
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
      const { userId } = ctx;
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
          and(eq(m.id, current.modelId), eq(m.userId, userId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const updated = await updateObjective(input.id, {
        name: input.name,
        description: input.description ?? null,
        enabled: input.enabled,
        // type: input.type,
        // expression: input.expression,
        isDraft: input.isDraft ?? current.isDraft,
      });
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
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
          and(eq(m.id, current.modelId), eq(m.userId, userId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      await deleteObjective(input.id);
      return { id: input.id };
    }),
});
