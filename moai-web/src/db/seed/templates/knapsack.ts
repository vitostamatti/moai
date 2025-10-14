import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../schema";
import type { UpsertTemplate } from "../index";
import { Expression } from "@/lib/editor/expression/core/types";
import { sql } from "drizzle-orm";
import { makeStableId } from "../template-utils";
import { toPythonIdentifier } from "@/lib/identifiers";

export async function seedKnapsack(
  db: NodePgDatabase<typeof schema>,
  upsertTemplate: UpsertTemplate,
  userId: string
) {
  const model = await upsertTemplate({
    key: "knapsack-problem",
    name: "0/1 Knapsack",
    description:
      "Select items to maximize value without exceeding capacity (binary variables).",
    tags: ["knapsack", "binary", "combinatorial"],
    userId,
  });

  const now = new Date();
  const sid = makeStableId(model.id);

  // Upsert Set: Items
  await db
    .insert(schema.set)
    .values({
      id: sid("Items"),
      modelId: model.id,
      name: "Items",
      symbol: toPythonIdentifier("Items"),
      description: "Items to choose from",
      elements: ["Item1", "Item2", "Item3", "Item4"],
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

  // Upsert Variable x
  await db
    .insert(schema.variable)
    .values({
      id: sid("Var:x"),
      modelId: model.id,
      name: "x",
      description: "Whether item i is chosen",
      domain: "Binary",
      indices: ["Items"],
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

  // Upsert Parameters w, v, C
  await db
    .insert(schema.parameter)
    .values({
      id: sid("Param:w"),
      modelId: model.id,
      name: "w",
      symbol: toPythonIdentifier("w"),
      description: "Weight of item i",
      indices: ["Items"],
      values: [
        { index: ["Item1"], value: 2 },
        { index: ["Item2"], value: 3 },
        { index: ["Item3"], value: 4 },
        { index: ["Item4"], value: 5 },
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
      id: sid("Param:v"),
      modelId: model.id,
      name: "v",
      symbol: toPythonIdentifier("v"),
      description: "Value of item i",
      indices: ["Items"],
      values: [
        { index: ["Item1"], value: 3 },
        { index: ["Item2"], value: 4 },
        { index: ["Item3"], value: 5 },
        { index: ["Item4"], value: 6 },
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
      id: sid("Param:C"),
      modelId: model.id,
      name: "C",
      symbol: toPythonIdentifier("C"),
      description: "Knapsack capacity",
      values: 7,
      indices: [],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.parameter.id,
      set: {
        symbol: sql`excluded.symbol`,
        description: sql`excluded.description`,
        values: sql`excluded.values`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  // Constraint expression
  const weightLhs: Expression = {
    type: "aggregate",
    op: "sum",
    indexBinding: [{ index: "i", over: "Items" }],
    body: {
      type: "binary",
      op: "*",
      left: {
        type: "param",
        name: "w",
        indices: [{ type: "index", name: "i" }],
      },
      right: {
        type: "var",
        name: "x",
        indices: [{ type: "index", name: "i" }],
      },
    },
  };

  await db
    .insert(schema.constraint)
    .values({
      id: sid("Con:WeightCapacity"),
      modelId: model.id,
      name: "WeightCapacity",
      description: "Total weight does not exceed capacity",
      type: "leq",
      leftSide: weightLhs,
      rightSide: { type: "param", name: "C" },
      quantifiers: {
        bindings: [{ index: "i", over: "Items" }],
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

  const objectiveExpression: Expression = {
    type: "aggregate",
    op: "sum",
    indexBinding: [{ index: "i", over: "Items" }],
    body: {
      type: "binary",
      op: "*",
      left: {
        type: "param",
        name: "v",
        indices: [{ type: "index", name: "i" }],
      },
      right: {
        type: "var",
        name: "x",
        indices: [{ type: "index", name: "i" }],
      },
    },
  };

  await db
    .insert(schema.objective)
    .values({
      id: sid("Obj:MaximizeValue"),
      modelId: model.id,
      name: "MaximizeValue",
      description: "Maximize total value of selected items",
      type: "maximize",
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
