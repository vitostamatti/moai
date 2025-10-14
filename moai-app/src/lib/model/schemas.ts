import { z } from "zod";

// Basic expression schemas
export const numberExprSchema = z.object({
  type: z.literal("number"),
  value: z.number(),
});

export const stringExprSchema = z.object({
  type: z.literal("string"),
  value: z.string(),
});

export const indexVariableExprSchema = z.object({
  type: z.literal("index_variable"),
  name: z.string(),
});

// Operator type schemas
export const unaryOpTypeSchema = z.enum([
  "sub",
  "sin",
  "cos",
  "tan",
  "exp",
  "log",
]);
export const binaryOpTypeSchema = z.enum(["add", "sub", "mul", "div"]);
export const aggOpTypeSchema = z.enum(["sum", "prod", "min", "max"]);
export const comparisonOpTypeSchema = z.enum([
  "le",
  "lt",
  "eq",
  "gt",
  "ge",
  "ne",
]);

// Index binding schema
export const indexBindingSchema = z.object({
  type: z.literal("index_binding"),
  index_var: z.string(),
  set_name: z.string(),
});

// Declare recursive schemas using z.lazy
export const indexExprTypeSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([
    numberExprSchema,
    stringExprSchema,
    indexVariableExprSchema,
    binaryOpExprSchema,
    unaryOpExprSchema,
  ])
);

// Variable and Parameter schemas
export const variableExprSchema = z.object({
  type: z.literal("variable"),
  name: z.string(),
  index_expr: z.array(indexExprTypeSchema).nullable().optional(),
});

export const parameterExprSchema = z.object({
  type: z.literal("parameter"),
  name: z.string(),
  index_expr: z.array(indexExprTypeSchema).nullable().optional(),
});

// Comparison schemas
export const indexComparisonExprSchema = z.object({
  type: z.literal("index_comparison"),
  op: comparisonOpTypeSchema,
  left: indexExprTypeSchema,
  right: indexExprTypeSchema,
});

// Expression schema (needs to be declared before operation schemas)
export const expressionSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([
    numberExprSchema,
    stringExprSchema,
    indexVariableExprSchema,
    variableExprSchema,
    parameterExprSchema,
    binaryOpExprSchema,
    unaryOpExprSchema,
    aggregationExprSchema,
  ])
);

// Operation schemas
export const unaryOpExprSchema = z.object({
  type: z.literal("unary_op"),
  op: unaryOpTypeSchema,
  expr: expressionSchema,
});

export const binaryOpExprSchema = z.object({
  type: z.literal("binary_op"),
  op: binaryOpTypeSchema,
  left: expressionSchema,
  right: expressionSchema,
});

// Aggregation schema
export const aggregationExprSchema = z.object({
  type: z.literal("aggregation"),
  op: aggOpTypeSchema,
  expr: expressionSchema,
  bindings: z.array(indexBindingSchema),
  condition: indexComparisonExprSchema.nullable().optional(),
});

// Comparison expression schema
export const comparisonExprSchema = z.object({
  type: z.literal("comparison"),
  op: comparisonOpTypeSchema,
  left: expressionSchema,
  right: expressionSchema,
});

// Main model component schemas
export const setSchema = z.object({
  name: z
    .string()
    .describe(
      "The unique identifier (symbol) name for this set (e.g., 'I', 'J', 'Cities', 'Products')"
    ),
  elements: z
    .union([z.array(z.string()), z.array(z.number())])
    .describe(
      "The elements contained in this set - either strings (e.g., ['New York', 'Boston']) or numbers (e.g., [1, 2, 3, 4, 5])"
    ),
});

export const parameterValueSchema = z.object({
  index: z
    .array(z.union([z.string(), z.number()]))
    .describe(
      "The index tuple that identifies this parameter value (e.g., ['plant1', 'market2'] for parameter cost[i,j])"
    ),
  value: z
    .number()
    .describe("The numerical value of the parameter at this index"),
});

export const parameterSchema = z.object({
  name: z
    .string()
    .describe("The name of the parameter (e.g., 'cost', 'demand', 'capacity')"),
  indices: z
    .array(z.string())
    .describe(
      "The index sets that define the parameter dimensions (e.g., ['i'] for cost[i], or ['i', 'j'] for cost[i,j])"
    ),
  values: z
    .union([z.array(parameterValueSchema), z.number()])
    .describe(
      "Either a scalar value for unindexed parameters, or an array of indexed values"
    ),
});

export const variableDomainSchema = z
  .enum([
    "Binary",
    "NonNegativeIntegers",
    "NonNegativeReals",
    "Reals",
    "Integers",
  ])
  .describe("The mathematical domain that constrains the variable values");

export const variableSchema = z.object({
  name: z
    .string()
    .describe(
      "The name (symbol) of the decision variable (e.g., 'x', 'y', 'flow', 'production')"
    ),
  domain: variableDomainSchema.describe(
    "The mathematical domain: Binary (0/1), NonNegativeIntegers (0,1,2,...), NonNegativeReals (x≥0), Reals (any real number), or Integers (...,-1,0,1,...)"
  ),
  lowerBound: z
    .number()
    .optional()
    .describe(
      "Optional lower bound constraint for the variable (e.g., x ≥ 10)"
    ),
  upperBound: z
    .number()
    .optional()
    .describe(
      "Optional upper bound constraint for the variable (e.g., x ≤ 100)"
    ),
  indices: z
    .array(z.string())
    .describe(
      "The index sets that define the variable dimensions (e.g., ['i'] for x[i], or ['i', 'j'] for x[i,j])"
    ),
});

export const quantifierSchema = z.object({
  index: z
    .string()
    .describe(
      "The index variable name (e.g., 'i', 'j') that is being quantified over"
    ),
  over: z
    .string()
    .describe(
      "The set name that the index variable ranges over (e.g., 'I', 'J')"
    ),
  condition: comparisonExprSchema
    .nullable()
    .optional()
    .describe(
      "Optional condition that filters which index values to include (e.g., 'demand[j] > 0')"
    ),
});

// type: "constraint";
// name: string;
// expr: ComparisonExpr;
// quantifiers?: Quantifier[] | null;
export const constraintSchema = z.object({
  type: z.literal("constraint"),
  name: z
    .string()
    .describe(
      "the name for the constraint (symbol) (e.g., 'capacity_limit', 'demand_satisfaction', 'flow_balance')"
    ),
  expr: comparisonExprSchema.describe(
    "The mathematical constraint expression (e.g., 'sum(x[i,j] for j in J) <= capacity[i]')"
  ),
  quantifiers: z
    .array(quantifierSchema)
    .nullable()
    .optional()
    .describe(
      "Optional quantifiers that specify which indices this constraint applies to (e.g., 'for i in I', 'for j in J if demand[j] > 0')"
    ),
});

export const objectiveSchema = z.object({
  name: z
    .string()
    .describe(
      "A descriptive name for the objective (e.g., 'minimize_cost', 'maximize_profit')"
    ),
  expr: expressionSchema.describe(
    "The mathematical expression to optimize (e.g., 'sum(cost[i,j] * x[i,j] for i in I, j in J)')"
  ),
  sense: z
    .enum(["min", "max"])
    .default("min")
    .optional()
    .describe(
      "Optimization direction: 'min' for minimization (default) or 'max' for maximization"
    ),
});

// Type inference helpers
export type NumberExpr = z.infer<typeof numberExprSchema>;
export type StringExpr = z.infer<typeof stringExprSchema>;
export type IndexVariableExpr = z.infer<typeof indexVariableExprSchema>;
export type VariableExpr = z.infer<typeof variableExprSchema>;
export type ParameterExpr = z.infer<typeof parameterExprSchema>;
export type UnaryOpExpr = z.infer<typeof unaryOpExprSchema>;
export type BinaryOpExpr = z.infer<typeof binaryOpExprSchema>;
export type AggregationExpr = z.infer<typeof aggregationExprSchema>;
export type IndexBinding = z.infer<typeof indexBindingSchema>;
export type ComparisonExpr = z.infer<typeof comparisonExprSchema>;
export type IndexComparisonExpr = z.infer<typeof indexComparisonExprSchema>;
export type Set = z.infer<typeof setSchema>;
export type Parameter = z.infer<typeof parameterSchema>;
export type ParameterValue = z.infer<typeof parameterValueSchema>;
export type Variable = z.infer<typeof variableSchema>;
export type Quantifier = z.infer<typeof quantifierSchema>;
export type Constraint = z.infer<typeof constraintSchema>;
export type Objective = z.infer<typeof objectiveSchema>;

export type UnaryOpType = z.infer<typeof unaryOpTypeSchema>;
export type BinaryOpType = z.infer<typeof binaryOpTypeSchema>;
export type AggOpType = z.infer<typeof aggOpTypeSchema>;
export type ComparisonOpType = z.infer<typeof comparisonOpTypeSchema>;
export type VariableDomain = z.infer<typeof variableDomainSchema>;

// Expression union types
export type IndexExprType =
  | NumberExpr
  | StringExpr
  | IndexVariableExpr
  | BinaryOpExpr
  | UnaryOpExpr;

export type Expression =
  | NumberExpr
  | StringExpr
  | IndexVariableExpr
  | VariableExpr
  | ParameterExpr
  | BinaryOpExpr
  | UnaryOpExpr
  | AggregationExpr;

// Helper functions to create expressions (matching Python factory methods)
export const createNumberExpr = (value: number) =>
  numberExprSchema.parse({ type: "number", value }) as NumberExpr;

export const createStringExpr = (value: string) =>
  stringExprSchema.parse({ type: "string", value }) as StringExpr;

export const createIndexVariableExpr = (name: string) =>
  indexVariableExprSchema.parse({
    type: "index_variable",
    name,
  }) as IndexVariableExpr;

export const createVariableExpr = (
  name: string,
  index_expr?: IndexExprType[] | null
) =>
  variableExprSchema.parse({
    type: "variable",
    name,
    index_expr,
  }) as VariableExpr;

export const createParameterExpr = (
  name: string,
  index_expr?: IndexExprType[] | null
) =>
  parameterExprSchema.parse({
    type: "parameter",
    name,
    index_expr,
  }) as ParameterExpr;

export const createUnaryOpExpr = (op: UnaryOpType, expr: Expression) =>
  unaryOpExprSchema.parse({ type: "unary_op", op, expr }) as UnaryOpExpr;

export const createBinaryOpExpr = (
  op: BinaryOpType,
  left: Expression,
  right: Expression
) =>
  binaryOpExprSchema.parse({
    type: "binary_op",
    op,
    left,
    right,
  }) as BinaryOpExpr;

export const createAggregationExpr = (
  op: AggOpType,
  expr: Expression,
  bindings: IndexBinding[],
  condition?: IndexComparisonExpr | null
) =>
  aggregationExprSchema.parse({
    type: "aggregation",
    op,
    expr,
    bindings,
    condition,
  }) as AggregationExpr;

export const createIndexBinding = (index_var: string, set_name: string) =>
  indexBindingSchema.parse({
    type: "index_binding",
    index_var,
    set_name,
  }) as IndexBinding;

export const createComparisonExpr = (
  op: ComparisonOpType,
  left: Expression,
  right: Expression
) =>
  comparisonExprSchema.parse({
    type: "comparison",
    op,
    left,
    right,
  }) as ComparisonExpr;

export const createIndexComparisonExpr = (
  op: ComparisonOpType,
  left: IndexExprType,
  right: IndexExprType
) =>
  indexComparisonExprSchema.parse({
    type: "index_comparison",
    op,
    left,
    right,
  }) as IndexComparisonExpr;

export const createQuantifier = (
  index: string,
  over: string,
  condition?: ComparisonExpr | null
) =>
  quantifierSchema.parse({
    index,
    over,
    condition,
  }) as Quantifier;

export const createConstraint = (
  name: string,
  expr: ComparisonExpr,
  quantifiers?: Quantifier[] | null
) =>
  constraintSchema.parse({
    type: "constraint",
    name,
    expr,
    quantifiers,
  }) as Constraint;

export const createObjective = (
  name: string,
  expr: Expression,
  sense?: "min" | "max"
) =>
  objectiveSchema.parse({
    name,
    expr,
    sense,
  }) as Objective;
