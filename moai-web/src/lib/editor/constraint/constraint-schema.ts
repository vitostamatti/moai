import { z } from "zod";
import {
  indexBindingSchema,
  expressionSchema,
} from "@/lib/editor/expression/core/schemas";

/**
 * Constraint type enumeration for MILP models.
 * Defines the relationship types available for constraints.
 */
export const constraintTypeSchema = z
  .enum(["eq", "leq", "geq", "lt", "gt"])
  .describe(
    "Constraint types: eq (equals =), leq (less than or equal <=), geq (greater than or equal >=), lt (less than <), gt (greater than >)"
  );

/**
 * Quantifier schema (new format) for constraint iteration.
 * Represents a single quantifier block with multiple index bindings and an optional condition
 * that can reference all bound indices, mirroring the aggregate expression structure.
 *
 * Example (mathematical notation):
 *   forall (i in Plants, j in Markets | i != j): ...
 */
export const quantifierSchema = z.object({
  bindings: z
    .array(indexBindingSchema)
    .min(1)
    .describe(
      "Array of index bindings (e.g., [{ index: 'i', over: 'Plants' }, { index: 'j', over: 'Markets' }])"
    ),
  condition: expressionSchema
    .optional()
    .describe(
      "Optional condition applying to the full binding tuple (e.g., 'i != j'). If omitted, all combinations are included."
    ),
});

/**
 * Constraint definition schema for MILP models.
 * Represents mathematical constraints that restrict the feasible solution space.
 *
 * Examples:
 * - Supply constraint: sum(x[i,j] for j in Markets) <= capacity[i] for i in Plants
 * - Demand constraint: sum(x[i,j] for i in Plants) >= demand[j] for j in Markets
 * - Balance constraint: inventory[t] = inventory[t-1] + production[t] - demand[t] for t in TimePeriods
 */
export const constraintDefinitionSchema = z.object({
  id: z.string().describe("Unique identifier for the constraint"),
  name: z.string().describe("Human-readable name for the constraint"),
  description: z
    .string()
    .optional()
    .describe(
      "Optional detailed description of what the constraint represents"
    ),
  enabled: z
    .boolean()
    .describe("Whether this constraint is enabled (participates in the model)"),
  type: constraintTypeSchema.describe("The type of constraint relationship"),
  leftSide: expressionSchema.describe(
    "Left-hand side expression of the constraint"
  ),
  rightSide: expressionSchema.describe(
    "Right-hand side expression of the constraint"
  ),
  quantifiers: quantifierSchema
    .optional()
    .describe(
      "Quantifier block defining index bindings and optional condition (new format)."
    ),
});

export type ConstraintType = z.infer<typeof constraintTypeSchema>;
export type Quantifier = z.infer<typeof quantifierSchema>;
export type ConstraintDefinition = z.infer<typeof constraintDefinitionSchema>;
