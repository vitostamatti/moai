import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../schema";
import { sql } from "drizzle-orm";
import type { UpsertTemplate } from "../index";
import { Expression } from "@/lib/editor/expression/core/types";
import { toPythonIdentifier } from "@/lib/identifiers";

export async function seedAssignment(
  db: NodePgDatabase<typeof schema>,
  upsertTemplate: UpsertTemplate,
  userId: string
) {
  const model = await upsertTemplate({
    key: "assignment-problem",
    name: "Assignment Problem",
    description:
      "Assign tasks to agents minimizing total cost (one-to-one matching).",
    tags: ["assignment", "matching", "cost-minimization"],
    userId,
  });

  const now = new Date();

  // Stable ID helpers (deterministic IDs so ON CONFLICT matches by PK too)
  const sid = (suffix: string) => `${model.id}::${suffix}`;

  // Upsert Set: Agents
  await db
    .insert(schema.set)
    .values({
      id: sid("Agents"),
      modelId: model.id,
      name: "Agents",
      symbol: toPythonIdentifier("Agents"),
      description: "Available agents",
      elements: ["A1", "A2", "A3"],
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

  // Upsert Set: Tasks
  await db
    .insert(schema.set)
    .values({
      id: sid("Tasks"),
      modelId: model.id,
      name: "Tasks",
      symbol: toPythonIdentifier("Tasks"),
      description: "Tasks to assign",
      elements: ["T1", "T2", "T3"],
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
      description: "Whether agent a is assigned to task t",
      domain: "Binary",
      indices: ["Agents", "Tasks"],
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

  // Upsert Parameter c
  await db
    .insert(schema.parameter)
    .values({
      id: sid("Param:c"),
      modelId: model.id,
      name: "c",
      symbol: toPythonIdentifier("c"),
      description: "Cost of assigning agent a to task t",
      indices: ["Agents", "Tasks"],
      values: [
        { index: ["A1", "T1"], value: 8 },
        { index: ["A1", "T2"], value: 6 },
        { index: ["A1", "T3"], value: 10 },
        { index: ["A2", "T1"], value: 9 },
        { index: ["A2", "T2"], value: 12 },
        { index: ["A2", "T3"], value: 13 },
        { index: ["A3", "T1"], value: 14 },
        { index: ["A3", "T2"], value: 9 },
        { index: ["A3", "T3"], value: 16 },
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

  // Expressions reused in constraints
  const oneExpr: Expression = { type: "number", value: 1 };

  const agentCapacityLhs: Expression = {
    type: "aggregate",
    op: "sum",
    indexBinding: [{ index: "t", over: "Tasks" }],
    body: {
      type: "var",
      name: "x",
      indices: [
        { type: "index", name: "a" },
        { type: "index", name: "t" },
      ],
    },
  };

  const taskAssignmentLhs: Expression = {
    type: "aggregate",
    op: "sum",
    indexBinding: [{ index: "a", over: "Agents" }],
    body: {
      type: "var",
      name: "x",
      indices: [
        { type: "index", name: "a" },
        { type: "index", name: "t" },
      ],
    },
  };

  // Upsert Constraints
  await db
    .insert(schema.constraint)
    .values({
      id: sid("Con:AgentCapacity"),
      modelId: model.id,
      name: "AgentCapacity",
      description: "Each agent assigned to at most one task",
      type: "leq",
      leftSide: agentCapacityLhs,
      rightSide: oneExpr,
      quantifiers: {
        bindings: [{ index: "a", over: "Agents" }],
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
      id: sid("Con:TaskAssignment"),
      modelId: model.id,
      name: "TaskAssignment",
      description: "Each task assigned exactly once",
      type: "eq",
      leftSide: taskAssignmentLhs,
      rightSide: oneExpr,
      quantifiers: {
        bindings: [{ index: "t", over: "Tasks" }],
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

  // Objective expression
  const objectiveExpression: Expression = {
    type: "aggregate",
    op: "sum",
    indexBinding: [
      { index: "a", over: "Agents" },
      { index: "t", over: "Tasks" },
    ],
    body: {
      type: "binary",
      op: "*",
      left: {
        type: "param",
        name: "c",
        indices: [
          { type: "index", name: "a" },
          { type: "index", name: "t" },
        ],
      },
      right: {
        type: "var",
        name: "x",
        indices: [
          { type: "index", name: "a" },
          { type: "index", name: "t" },
        ],
      },
    },
  };

  // Upsert Objective
  await db
    .insert(schema.objective)
    .values({
      id: sid("Obj:MinimizeCost"),
      modelId: model.id,
      name: "MinimizeCost",
      description: "Minimize total assignment cost",
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
