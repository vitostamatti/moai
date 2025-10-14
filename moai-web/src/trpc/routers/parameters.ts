import { protectedProcedure, router } from "../init";
import { z } from "zod";
import { db } from "@/db/client";
import {
  createParameter,
  updateParameter,
  deleteParameter,
} from "@/db/mutations";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { toPythonIdentifier } from "@/lib/identifiers";

const baseParamShape = {
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  indices: z.array(z.string()).nullable().optional(),
  values: z.union([
    z.number(),
    z.string(),
    z.array(
      z.object({
        index: z.array(z.union([z.string(), z.number()])),
        value: z.number(),
      })
    ),
  ]),
  isDraft: z.boolean().optional(),
};

export const parametersRouter = router({
  clone: protectedProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const p = await db.query.parameter.findFirst({
        where: (pp, { eq }) => eq(pp.id, input.id),
      });
      if (!p)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Parameter not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, p.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const now = new Date();
      const newName = input.name ?? `${p.name} (copy)`;
      const cloned = await createParameter({
        id: randomUUID(),
        modelId: p.modelId,
        name: newName,
        symbol: toPythonIdentifier(newName),
        description: p.description ?? null,
        indices: p.indices ?? null,
        values: p.values,
        isDraft: p.isDraft ?? false,
        createdAt: now,
        updatedAt: now,
      });
      return cloned;
    }),

  create: protectedProcedure
    .input(z.object({ modelId: z.string().min(1), ...baseParamShape }))
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
      const created = await createParameter({
        id: randomUUID(),
        modelId: input.modelId,
        name: input.name,
        symbol: toPythonIdentifier(input.name),
        description: input.description ?? null,
        indices: input.indices ?? null,
        values: input.values,
        isDraft: input.isDraft ?? false,
        createdAt: now,
        updatedAt: now,
      });
      return created;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), ...baseParamShape }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const param = await db.query.parameter.findFirst({
        where: (p, { eq }) => eq(p.id, input.id),
      });
      if (!param)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Parameter not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, param.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const updated = await updateParameter(input.id, {
        name: input.name,
        symbol: toPythonIdentifier(input.name),
        description: input.description ?? null,
        indices: input.indices ?? null,
        values: input.values,
        isDraft: input.isDraft ?? param.isDraft,
      });
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const param = await db.query.parameter.findFirst({
        where: (p, { eq }) => eq(p.id, input.id),
      });
      if (!param)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Parameter not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, param.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      await deleteParameter(input.id);
      return { id: input.id };
    }),
});
