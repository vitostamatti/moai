import { sql } from "drizzle-orm";
import { makeStableId } from "../template-utils";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../schema";
import type { UpsertTemplate } from "../index";
import { Expression } from "@/lib/editor/expression/core/types";
import { toPythonIdentifier } from "@/lib/identifiers";

export async function seedProductionPlanning(
  db: NodePgDatabase<typeof schema>,
  upsertTemplate: UpsertTemplate,
  userId: string
) {
  const model = await upsertTemplate({
    key: "production-planning",
    name: "Production Planning",
    description: "Multi-period production planning with inventory.",
    tags: ["production", "planning", "inventory"],
    userId,
  });

  const now = new Date();
  const sid = makeStableId(model.id);

  // Upsert Sets
  await db
    .insert(schema.set)
    .values({
      id: sid("Products"),
      modelId: model.id,
      name: "Products",
      symbol: toPythonIdentifier("Products"),
      description: "Product types",
      elements: ["ProductA", "ProductB", "ProductC"],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.set.id,
      set: {
        symbol: sql`excluded.symbol`,
        description: sql`excluded.description`,
        elements: sql`excluded.elements`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
  await db
    .insert(schema.set)
    .values({
      id: sid("Periods"),
      modelId: model.id,
      name: "Periods",
      symbol: toPythonIdentifier("Periods"),
      description: "Time periods",
      elements: [1, 2, 3, 4],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.set.id,
      set: {
        symbol: sql`excluded.symbol`,
        description: sql`excluded.description`,
        elements: sql`excluded.elements`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  // Upsert Variables
  await db
    .insert(schema.variable)
    .values({
      id: sid("Var:x"),
      modelId: model.id,
      name: "x",
      description: "Amount produced of product p in period t",
      domain: "NonNegativeReals",
      indices: ["Products", "Periods"],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.variable.id,
      set: {
        description: sql`excluded.description`,
        domain: sql`excluded.domain`,
        indices: sql`excluded.indices`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
  await db
    .insert(schema.variable)
    .values({
      id: sid("Var:I"),
      modelId: model.id,
      name: "I",
      description: "Inventory level of product p at end of period t",
      domain: "NonNegativeReals",
      indices: ["Products", "Periods"],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.variable.id,
      set: {
        description: sql`excluded.description`,
        domain: sql`excluded.domain`,
        indices: sql`excluded.indices`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  // Upsert Parameters c, h, d
  await db
    .insert(schema.parameter)
    .values({
      id: sid("Param:c"),
      modelId: model.id,
      name: "c",
      symbol: toPythonIdentifier("c"),
      description: "Production cost per unit of product p in period t",
      indices: ["Products", "Periods"],
      values: [
        { index: ["ProductA", "1"], value: 8 },
        { index: ["ProductA", "2"], value: 8 },
        { index: ["ProductA", "3"], value: 8 },
        { index: ["ProductA", "4"], value: 8 },
        { index: ["ProductB", "1"], value: 6 },
        { index: ["ProductB", "2"], value: 6 },
        { index: ["ProductB", "3"], value: 6 },
        { index: ["ProductB", "4"], value: 6 },
        { index: ["ProductC", "1"], value: 10 },
        { index: ["ProductC", "2"], value: 10 },
        { index: ["ProductC", "3"], value: 10 },
        { index: ["ProductC", "4"], value: 10 },
      ],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.parameter.id,
      set: {
        symbol: sql`excluded.symbol`,
        description: sql`excluded.description`,
        indices: sql`excluded.indices`,
        values: sql`excluded.values`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
  await db
    .insert(schema.parameter)
    .values({
      id: sid("Param:h"),
      modelId: model.id,
      name: "h",
      symbol: toPythonIdentifier("h"),
      description: "Holding cost per unit of product p",
      indices: ["Products"],
      values: [
        { index: ["ProductA"], value: 1.5 },
        { index: ["ProductB"], value: 1.0 },
        { index: ["ProductC"], value: 2.0 },
      ],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.parameter.id,
      set: {
        symbol: sql`excluded.symbol`,
        description: sql`excluded.description`,
        indices: sql`excluded.indices`,
        values: sql`excluded.values`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
  await db
    .insert(schema.parameter)
    .values({
      id: sid("Param:d"),
      modelId: model.id,
      name: "d",
      symbol: toPythonIdentifier("d"),
      description: "Demand for product p in period t",
      indices: ["Products", "Periods"],
      values: [
        { index: ["ProductA", "1"], value: 20 },
        { index: ["ProductB", "1"], value: 30 },
        { index: ["ProductC", "1"], value: 25 },
        { index: ["ProductA", "2"], value: 25 },
        { index: ["ProductB", "2"], value: 35 },
        { index: ["ProductC", "2"], value: 20 },
        { index: ["ProductA", "3"], value: 30 },
        { index: ["ProductB", "3"], value: 40 },
        { index: ["ProductC", "3"], value: 30 },
        { index: ["ProductA", "4"], value: 22 },
        { index: ["ProductB", "4"], value: 28 },
        { index: ["ProductC", "4"], value: 24 },
      ],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.parameter.id,
      set: {
        symbol: sql`excluded.symbol`,
        description: sql`excluded.description`,
        indices: sql`excluded.indices`,
        values: sql`excluded.values`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  // Constraint expressions
  const invInitLhs: Expression = {
    type: "var",
    name: "I",
    indices: [
      { type: "index", name: "p" },
      { type: "number", value: 1 },
    ],
  };
  const invInitRhs: Expression = {
    type: "binary",
    op: "+",
    left: {
      type: "binary",
      op: "-",
      left: {
        type: "var",
        name: "x",
        indices: [
          { type: "index", name: "p" },
          { type: "number", value: 1 },
        ],
      },
      right: {
        type: "param",
        name: "d",
        indices: [
          { type: "index", name: "p" },
          { type: "number", value: 1 },
        ],
      },
    },
    right: { type: "number", value: 0 },
  };
  const invBalLhs: Expression = {
    type: "var",
    name: "I",
    indices: [
      { type: "index", name: "p" },
      { type: "index", name: "t" },
    ],
  };
  const invBalRhs: Expression = {
    type: "binary",
    op: "-",
    left: {
      type: "binary",
      op: "+",
      left: {
        type: "var",
        name: "I",
        indices: [
          { type: "index", name: "p" },
          {
            type: "index_binary",
            op: "-",
            left: { type: "index", name: "t" },
            right: { type: "number", value: 1 },
          },
        ],
      },
      right: {
        type: "var",
        name: "x",
        indices: [
          { type: "index", name: "p" },
          { type: "index", name: "t" },
        ],
      },
    },
    right: {
      type: "param",
      name: "d",
      indices: [
        { type: "index", name: "p" },
        { type: "index", name: "t" },
      ],
    },
  };

  // Upsert Constraints
  await db
    .insert(schema.constraint)
    .values({
      id: sid("Con:InvBalanceInit"),
      modelId: model.id,
      name: "InvBalanceInit",
      description: "Inventory balance at period 1",
      type: "eq",
      leftSide: invInitLhs,
      rightSide: invInitRhs,
      quantifiers: { bindings: [{ index: "p", over: "Products" }] },
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.constraint.id,
      set: {
        description: sql`excluded.description`,
        type: sql`excluded.type`,
        leftSide: sql`excluded.left_side`,
        rightSide: sql`excluded.right_side`,
        quantifiers: sql`excluded.quantifiers`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
  await db
    .insert(schema.constraint)
    .values({
      id: sid("Con:InvBalance"),
      modelId: model.id,
      name: "InvBalance",
      description: "Inventory balance for t>1",
      type: "eq",
      leftSide: invBalLhs,
      rightSide: invBalRhs,
      quantifiers: {
        bindings: [
          { index: "p", over: "Products" },
          {
            index: "t",
            over: "Periods",
          },
        ],
        condition: {
          type: "comparison",
          op: ">",
          left: { type: "index", name: "t" },
          right: { type: "number", value: 1 },
        },
      },
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.constraint.id,
      set: {
        description: sql`excluded.description`,
        type: sql`excluded.type`,
        leftSide: sql`excluded.left_side`,
        rightSide: sql`excluded.right_side`,
        quantifiers: sql`excluded.quantifiers`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  // Objective
  const objectiveExpression: Expression = {
    type: "aggregate",
    op: "sum",
    indexBinding: [
      { index: "p", over: "Products" },
      { index: "t", over: "Periods" },
    ],
    body: {
      type: "binary",
      op: "+",
      left: {
        type: "binary",
        op: "*",
        left: {
          type: "param",
          name: "c",
          indices: [
            { type: "index", name: "p" },
            { type: "index", name: "t" },
          ],
        },
        right: {
          type: "var",
          name: "x",
          indices: [
            { type: "index", name: "p" },
            { type: "index", name: "t" },
          ],
        },
      },
      right: {
        type: "binary",
        op: "*",
        left: {
          type: "param",
          name: "h",
          indices: [{ type: "index", name: "p" }],
        },
        right: {
          type: "var",
          name: "I",
          indices: [
            { type: "index", name: "p" },
            { type: "index", name: "t" },
          ],
        },
      },
    },
  };

  await db
    .insert(schema.objective)
    .values({
      id: sid("Obj:MinimizeCost"),
      modelId: model.id,
      name: "MinimizeCost",
      description: "Minimize total production and holding costs",
      type: "minimize",
      expression: objectiveExpression,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.objective.id,
      set: {
        description: sql`excluded.description`,
        type: sql`excluded.type`,
        expression: sql`excluded.expression`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  return model;
}
