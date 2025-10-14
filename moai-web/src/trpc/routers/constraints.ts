import { protectedProcedure, router } from "../init";
import { z } from "zod";
import { db } from "@/db/client";
import {
  createConstraint,
  updateConstraint,
  deleteConstraint,
} from "@/db/mutations";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { constraintDefinitionSchema } from "@/lib/editor/constraint/constraint-schema";

const baseConstraintShape = constraintDefinitionSchema
  .pick({
    name: true,
    description: true,
    enabled: true,
    type: true,
    leftSide: true,
    rightSide: true,
    quantifiers: true,
  })
  .extend({ isDraft: z.boolean().optional() });

export const constraintsRouter = router({
  clone: protectedProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const c = await db.query.constraint.findFirst({
        where: (cc, { eq }) => eq(cc.id, input.id),
      });
      if (!c)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Constraint not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, c.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const now = new Date();
      const newName = input.name ?? `${c.name} (copy)`;
      const cloned = await createConstraint({
        id: randomUUID(),
        modelId: c.modelId,
        name: newName,
        description: c.description ?? null,
        enabled: c.enabled,
        type: c.type,
        leftSide: c.leftSide,
        rightSide: c.rightSide,
        quantifiers: c.quantifiers ?? null,
        isDraft: c.isDraft ?? false,
        createdAt: now,
        updatedAt: now,
      });
      return cloned;
    }),

  create: protectedProcedure
    .input(
      z.object({
        modelId: z.string().min(1),
        ...baseConstraintShape.shape,
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
      const created = await createConstraint({
        id: randomUUID(),
        modelId: input.modelId,
        name: input.name,
        description: input.description ?? null,
        enabled: input.enabled,
        type: input.type,
        leftSide: input.leftSide,
        rightSide: input.rightSide,
        quantifiers: input.quantifiers ?? null,
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
        ...baseConstraintShape.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const current = await db.query.constraint.findFirst({
        where: (c, { eq }) => eq(c.id, input.id),
      });
      if (!current)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Constraint not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, current.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const updated = await updateConstraint(input.id, {
        name: input.name,
        description: input.description ?? null,
        enabled: input.enabled,
        type: input.type,
        leftSide: input.leftSide,
        rightSide: input.rightSide,
        quantifiers: input.quantifiers ?? null,
        isDraft: input.isDraft ?? current.isDraft,
      });
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = ctx;
      const current = await db.query.constraint.findFirst({
        where: (c, { eq }) => eq(c.id, input.id),
      });
      if (!current)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Constraint not found",
        });
      const model = await db.query.model.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, current.modelId), eq(m.organizationId, organizationId)),
      });
      if (!model)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      await deleteConstraint(input.id);
      return { id: input.id };
    }),
});
