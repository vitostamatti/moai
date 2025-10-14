import { z } from "zod";

import type {
  NumberExpr,
  StringExpr,
  IndexExpr,
  VarExpr,
  ParamExpr,
  BinaryOpType,
  ComparisonOpType,
  UnaryOpType,
  AggregateOpType,
  IndexBinding,
  IndexBinaryExpr,
  IndexUnaryExpr,
  Expression,
  IndexTerm,
  AggregateOperator,
  UnaryOperator,
  ComparisonOperator,
  BinaryOperator,
} from "./types";

export const numExprSchema = z
  .object({
    type: z.literal("number"),
    value: z.number().describe("The numeric value of the constant"),
  })
  .describe("Numeric literal expression") satisfies z.ZodType<NumberExpr>;

export const stringExprSchema = z.object({
  type: z.literal("string"),
  value: z.string().describe("The string value"),
}) satisfies z.ZodType<StringExpr>;

export const indexExprSchema = z.object({
  type: z.literal("index"),
  name: z
    .string()
    .describe("Name of the index variable (e.g., 'i', 'j', 'k', 't', 'p')"),
}) satisfies z.ZodType<IndexExpr>;

export const indexBinaryExprSchema = z.object({
  type: z.literal("index_binary"),
  op: z.enum(["+", "-"]),
  get left() {
    return indexTermSchema;
  },
  get right() {
    return indexTermSchema;
  },
}) satisfies z.ZodType<IndexBinaryExpr>;

export const indexUnaryExprSchema = z.object({
  type: z.literal("index_unary"),
  op: z.enum(["-"]),
  get expr() {
    return indexTermSchema;
  }, // expr: z.lazy(() => indexTermSchema),
}) satisfies z.ZodType<IndexUnaryExpr>;

export const indexTermSchema: z.ZodType<IndexTerm, IndexTerm> =
  z.discriminatedUnion("type", [
    numExprSchema,
    stringExprSchema,
    indexExprSchema,
    indexBinaryExprSchema,
    indexUnaryExprSchema,
  ]) satisfies z.ZodType<IndexTerm, IndexTerm>;

export const varExprSchema = z.object({
  type: z.literal("var"),
  name: z
    .string()
    .describe(
      "Name of the decision variable (e.g., 'x', 'production', 'inventory')"
    ),
  indices: z
    .array(indexTermSchema)
    .optional()
    .describe(
      "Optional array of index expressions for multi-dimensional variables"
    ),
}) satisfies z.ZodType<VarExpr>;

export const paramExprSchema = z.object({
  type: z.literal("param"),
  name: z
    .string()
    .describe("Name of the parameter (e.g., 'capacity', 'demand', 'cost')"),
  indices: z
    .array(indexTermSchema)
    .optional()
    .describe(
      "Optional array of index expressions for multi-dimensional parameters"
    ),
}) satisfies z.ZodType<ParamExpr>;

export const binaryOpTypeSchema = z
  .enum(["+", "-", "*", "/", "^"])
  .describe(
    "Binary arithmetic operators: + (addition), - (subtraction), * (multiplication), / (division), ^ (exponentiation)"
  ) satisfies z.ZodType<BinaryOpType>;

export const comparisonOpTypeSchema = z
  .enum(["=", "<=", ">=", "<", ">", "!="])
  .describe(
    "Comparison operators: = (equals), <= (less than or equal), >= (greater than or equal), < (less than), > (greater than), != (not equal)"
  ) satisfies z.ZodType<ComparisonOpType>;

export const unaryOpTypeSchema = z
  .enum(["-", "abs", "sin", "cos", "tan", "exp", "log", "sqrt"])
  .describe(
    "Unary arithmetic operators: - (negation), abs (absolute value), sin/cos/tan (trigonometric), exp (exponential), log (logarithm), sqrt (square root)"
  ) satisfies z.ZodType<UnaryOpType>;

export const aggregateOpTypeSchema = z
  .enum(["sum", "prod", "min", "max"])
  .describe(
    "Aggregation operators: sum (summation), prod (product), min (minimum), max (maximum)"
  ) satisfies z.ZodType<AggregateOpType>;

export const indexBindingSchema = z.object({
  index: z.string().describe("Index variable name (e.g., 'i', 'j')"),
  over: z
    .string()
    .describe("Set name to iterate over (e.g., 'Products', 'Plants')"),
}) satisfies z.ZodType<IndexBinding>;

export const binaryExprSchema = z.object({
  type: z.literal("binary"),
  op: binaryOpTypeSchema.describe("The binary operator to apply"),
  get left() {
    return expressionSchema.describe("Left operand expression");
  },
  get right() {
    return expressionSchema.describe("Right operand expression");
  },
}) satisfies z.ZodType<BinaryOperator, BinaryOperator>;

export const comparisonExprSchema = z.object({
  type: z.literal("comparison"),
  op: comparisonOpTypeSchema.describe("The comparison operator"),
  get left() {
    return expressionSchema.describe("Left side of the comparison");
  },
  get right() {
    return expressionSchema.describe("Right side of the comparison");
  },
}) satisfies z.ZodType<ComparisonOperator, ComparisonOperator>;

export const unaryExprSchema = z.object({
  type: z.literal("unary"),
  op: unaryOpTypeSchema,
  get expr() {
    return expressionSchema.describe(
      "The expression to apply the unary operator to"
    );
  },
}) satisfies z.ZodType<UnaryOperator, UnaryOperator>;

export const aggregateExprSchema = z.object({
  type: z.literal("aggregate"),
  op: aggregateOpTypeSchema,
  indexBinding: z
    .array(indexBindingSchema)
    .describe(
      "Array of index bindings for quantification (e.g., 'i in Products', 'j in Markets')"
    ),
  get condition() {
    return comparisonExprSchema
      .optional()
      .describe(
        "Optional condition to filter the aggregation (e.g., 'i != j')"
      );
  },
  get body() {
    return expressionSchema.describe("The expression to aggregate");
  },
}) satisfies z.ZodType<AggregateOperator, AggregateOperator>;

export const expressionSchema: z.ZodType<Expression, Expression> =
  z.discriminatedUnion("type", [
    numExprSchema,
    stringExprSchema,
    indexExprSchema,
    varExprSchema,
    paramExprSchema,
    binaryExprSchema,
    comparisonExprSchema,
    unaryExprSchema,
    aggregateExprSchema,
    indexBinaryExprSchema,
    indexUnaryExprSchema,
  ]);
