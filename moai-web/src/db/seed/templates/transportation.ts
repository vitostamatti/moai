import { sql } from "drizzle-orm";
import { makeStableId } from "../template-utils";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../schema";
import type { UpsertTemplate } from "../index";
import { Expression } from "@/lib/editor/expression/core/types";
import { toPythonIdentifier } from "@/lib/identifiers";

export async function seedTransportation(
  db: NodePgDatabase<typeof schema>,
  upsertTemplate: UpsertTemplate,
  userId: string
) {
  const model = await upsertTemplate({
    key: "transportation-problem",
    name: "Transportation Problem",
    description:
      "A classic transportation optimization model minimizing shipping costs.",
    tags: ["transportation", "logistics", "cost-minimization"],
    userId,
  });

  // minimal components for example
  const now = new Date();
  const sid = makeStableId(model.id);

  // Upsert Sets
  await db
    .insert(schema.set)
    .values({
      id: sid("Plants"),
      modelId: model.id,
      name: "Plants",
      symbol: toPythonIdentifier("Plants"),
      description: "Manufacturing plants",
      elements: ["Seattle", "San-Diego"],
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
      id: sid("Markets"),
      modelId: model.id,
      name: "Markets",
      symbol: toPythonIdentifier("Markets"),
      description: "Distribution markets",
      elements: ["New-York", "Chicago", "Topeka"],
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

  // Upsert Parameters
  await db
    .insert(schema.parameter)
    .values({
      id: sid("Param:Cost"),
      modelId: model.id,
      name: "Cost",
      symbol: toPythonIdentifier("Cost"),
      description: "Transportation cost per unit",
      indices: ["Plants", "Markets"],
      values: [
        { index: ["Seattle", "New-York"], value: 2.5 },
        { index: ["Seattle", "Chicago"], value: 1.7 },
        { index: ["Seattle", "Topeka"], value: 1.8 },
        { index: ["San-Diego", "New-York"], value: 2.5 },
        { index: ["San-Diego", "Chicago"], value: 1.8 },
        { index: ["San-Diego", "Topeka"], value: 1.4 },
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
      id: sid("Param:Supply"),
      modelId: model.id,
      name: "Supply",
      symbol: toPythonIdentifier("Supply"),
      description: "Available supply at plant i",
      indices: ["Plants"],
      values: [
        { index: ["Seattle"], value: 350 },
        { index: ["San-Diego"], value: 600 },
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
      id: sid("Param:Demand"),
      modelId: model.id,
      name: "Demand",
      symbol: toPythonIdentifier("Demand"),
      description: "Market demand at j",
      indices: ["Markets"],
      values: [
        { index: ["New-York"], value: 325 },
        { index: ["Chicago"], value: 300 },
        { index: ["Topeka"], value: 275 },
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

  // Upsert Variable
  await db
    .insert(schema.variable)
    .values({
      id: sid("Var:x"),
      modelId: model.id,
      name: "x",
      description: "Amount shipped from plant i to market j",
      domain: "NonNegativeReals",
      indices: ["Plants", "Markets"],
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

  // Constraint expressions
  const plantCapacityLhs: Expression = {
    type: "aggregate",
    op: "sum",
    indexBinding: [{ index: "j", over: "Markets" }],
    body: {
      type: "var",
      name: "x",
      indices: [
        { type: "index", name: "i" },
        { type: "index", name: "j" },
      ],
    },
  };
  const marketDemandLhs: Expression = {
    type: "aggregate",
    op: "sum",
    indexBinding: [{ index: "i", over: "Plants" }],
    body: {
      type: "var",
      name: "x",
      indices: [
        { type: "index", name: "i" },
        { type: "index", name: "j" },
      ],
    },
  };

  await db
    .insert(schema.constraint)
    .values({
      id: sid("Con:PlantCapacity"),
      modelId: model.id,
      name: "PlantCapacity",
      description: "Total shipments from each plant ≤ supply",
      type: "leq",
      leftSide: plantCapacityLhs,
      rightSide: {
        type: "param",
        name: "Supply",
        indices: [{ type: "index", name: "i" }],
      },
      quantifiers: {
        bindings: [{ index: "i", over: "Plants" }],
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

  await db
    .insert(schema.constraint)
    .values({
      id: sid("Con:MarketDemand"),
      modelId: model.id,
      name: "MarketDemand",
      description: "Total shipments to each market ≥ demand",
      type: "geq",
      leftSide: marketDemandLhs,
      rightSide: {
        type: "param",
        name: "Demand",
        indices: [{ type: "index", name: "j" }],
      },
      quantifiers: {
        bindings: [{ index: "j", over: "Markets" }],
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
    indexBinding: [
      { index: "i", over: "Plants" },
      { index: "j", over: "Markets" },
    ],
    body: {
      type: "binary",
      op: "*",
      left: {
        type: "param",
        name: "Cost",
        indices: [
          { type: "index", name: "i" },
          { type: "index", name: "j" },
        ],
      },
      right: {
        type: "var",
        name: "x",
        indices: [
          { type: "index", name: "i" },
          { type: "index", name: "j" },
        ],
      },
    },
  };

  await db
    .insert(schema.objective)
    .values({
      id: sid("Obj:MinimizeCost"),
      modelId: model.id,
      name: "MinimizeCost",
      description: "Minimize total transportation cost",
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
