import { z } from "zod";
import { expressionSchema } from "@/lib/editor/expression/core/schemas";

/**
 * Objective type enumeration for MILP models.
 * Defines whether we want to minimize or maximize the objective function.
 */
export const objectiveTypeSchema = z
  .enum(["minimize", "maximize"])
  .describe(
    "Objective sense: minimize (find the smallest value) or maximize (find the largest value)"
  );

/**
 * Objective function definition schema for MILP models.
 * Represents the goal function that the optimization solver tries to optimize.
 *
 * Examples:
 * - Cost minimization: minimize sum(cost[i,j] * x[i,j] for i in Plants, j in Markets)
 * - Profit maximization: maximize sum(profit[i] * production[i] for i in Products)
 * - Multi-objective: minimize sum(cost[i] * x[i] for i in Items) + penalty * sum(lateness[j] for j in Jobs)
 */
export const objectiveDefinitionSchema = z.object({
  id: z.string().describe("Unique identifier for the objective function"),
  name: z
    .string()
    .describe(
      "Human-readable name for the objective (e.g., 'Total Cost', 'Maximum Profit')"
    ),
  description: z
    .string()
    .optional()
    .describe("Optional detailed description of what the objective represents"),
  enabled: z
    .boolean()
    // .default(true)
    .describe(
      "Whether this objective is currently active; only one objective should be enabled per model"
    ),
  type: objectiveTypeSchema.describe(
    "Whether to minimize or maximize the objective function"
  ),
  expression: expressionSchema.describe(
    "Mathematical expression defining what to optimize"
  ),
});

export type ObjectiveType = z.infer<typeof objectiveTypeSchema>;
export type ObjectiveDefinition = z.infer<typeof objectiveDefinitionSchema>;
