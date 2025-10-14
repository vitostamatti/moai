import { protectedProcedure, router } from "../init";
import { z } from "zod";
import { db } from "@/db/client";
import { createVariable, updateVariable, deleteVariable } from "@/db/mutations";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
// import { toPythonIdentifier } from "@/lib/identifiers";

// moved to shared identifiers util

const baseVariableShape = {
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  isDraft: z.boolean().optional(),
};

export const variablesRouter = router({
  clone: protectedProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const v = await db.query.variable.findFirst({
        where: (vv, { eq }) => eq(vv.id, input.id),
      });
      if (!v)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, v.modelId), eq(m.userId, userId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const now = new Date();
      const newName = input.name ?? `${v.name} (copy)`;
      const cloned = await createVariable({
        id: randomUUID(),
        modelId: v.modelId,
        name: newName,
        description: v.description ?? null,
        isDraft: v.isDraft ?? false,
        createdAt: now,
        updatedAt: now,
      });
      return cloned;
    }),
  create: protectedProcedure
    .input(
      z.object({
        modelId: z.string().min(1),
        ...baseVariableShape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      // Ensure model belongs to org
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
      const created = await createVariable({
        id: randomUUID(),
        modelId: input.modelId,
        name: input.name,
        description: input.description ?? null,
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
        ...baseVariableShape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      // Load variable and check org via model
      const variable = await db.query.variable.findFirst({
        where: (v, { eq }) => eq(v.id, input.id),
      });
      if (!variable)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, variable.modelId), eq(m.userId, userId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const updated = await updateVariable(input.id, {
        name: input.name,
        description: input.description ?? null,
        isDraft: input.isDraft ?? variable.isDraft,
      });
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const variable = await db.query.variable.findFirst({
        where: (v, { eq }) => eq(v.id, input.id),
      });
      if (!variable)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, variable.modelId), eq(m.userId, userId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      await deleteVariable(input.id);
      return { id: input.id };
    }),
});
