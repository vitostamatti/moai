// import { z } from "zod";
// import type {
//   IndexExpr,
//   Expression,
//   ComparisonExpr,
//   Constraint,
//   Objective,
// } from "./types";

// // ========================
// // Primitive / Leaf Schemas
// // ========================

// /** Numeric literal (shared by both Expression and IndexTerm domains). */
// export const numberLiteralSchema = z.object({
//   type: z.literal("number"),
//   value: z.number().describe("Numeric constant value"),
// });

// /** Index variable reference: i, j, t, etc. */
// export const indexVarSchema = z.object({
//   type: z.literal("index"),
//   name: z
//     .string()
//     .min(1)
//     .describe("Index variable symbol (e.g. 'i', 'j', 't')"),
// });

// // ========================
// // Index Term (restricted)
// // ========================

// /** Unary op limited to negation for index arithmetic. */
// export const indexUnarySchema = z.object({
//   type: z.literal("index_unary"),
//   op: z.literal("-"),
//   expr: z.lazy(() => indexTermSchema),
// });

// /** Binary + / - for index arithmetic (offsets / shifts). */
// export const indexBinarySchema = z.object({
//   type: z.literal("index_binary"),
//   op: z.enum(["+", "-"] as const),
//   left: z.lazy(() => indexTermSchema),
//   right: z.lazy(() => indexTermSchema),
// });

// /** Main discriminated union for index grammar. */
// export const indexTermSchema: z.ZodType<IndexExpr, IndexExpr> = z.lazy(() =>
//   z.discriminatedUnion("type", [
//     numberLiteralSchema, // number
//     indexVarSchema, // index
//     indexUnarySchema, // index_unary
//     indexBinarySchema, // index_binary
//   ])
// );

// // ========================
// // Operator Enumerations
// // ========================

// export const binaryOpSchema = z
//   .enum(["+", "-", "*", "/", "^"] as const)
//   .describe("Arithmetic binary operator");

// export const unaryOpSchema = z
//   .enum(["-", "abs", "sin", "cos", "tan", "exp", "log", "sqrt"] as const)
//   .describe("Arithmetic unary operator");

// export const aggregateOpSchema = z
//   .enum(["sum", "min", "max"] as const)
//   .describe("Aggregation operator (non-product linear-safe set)");

// export const comparisonOpSchema = z
//   .enum(["=", "!=", "<", "<=", ">", ">="] as const)
//   .describe("Comparison operator for constraints and filters");

// export const objectiveSenseSchema = z
//   .enum(["min", "max"] as const)
//   .describe("Objective sense");

// // ========================
// // Reference Nodes
// // ========================

// export const varRefSchema = z.object({
//   type: z.literal("var"),
//   name: z
//     .string()
//     .min(1)
//     .describe("Decision variable name (e.g. 'x', 'production')"),
//   indices: z
//     .array(indexTermSchema)
//     .nonempty()
//     .optional()
//     .describe("Optional index tuple for multidimensional variables"),
// });

// export const paramRefSchema = z.object({
//   type: z.literal("param"),
//   name: z
//     .string()
//     .min(1)
//     .describe("Parameter name (e.g. 'capacity', 'demand')"),
//   indices: z
//     .array(indexTermSchema)
//     .nonempty()
//     .optional()
//     .describe("Optional index tuple for multidimensional parameters"),
// });

// // ========================
// // Expression Operator Nodes
// // ========================

// export const binaryExprSchema = z.object({
//   type: z.literal("binary"),
//   op: binaryOpSchema,
//   left: z.lazy(() => expressionSchema),
//   right: z.lazy(() => expressionSchema),
// });

// export const unaryExprSchema = z.object({
//   type: z.literal("unary"),
//   op: unaryOpSchema,
//   expr: z.lazy(() => expressionSchema),
// });

// export const indexBindingSchema = z.object({
//   index: z.string().min(1).describe("Index variable symbol"),
//   over: z.string().min(1).describe("Set name to iterate over"),
// });

// // Forward declare comparisonExprSchema (needs expressionSchema). We use z.lazy below.
// export const comparisonExprSchema: z.ZodType<ComparisonExpr, ComparisonExpr> =
//   z.lazy(() =>
//     z.object({
//       type: z.literal("comparison"),
//       op: comparisonOpSchema,
//       left: expressionSchema,
//       right: expressionSchema,
//     })
//   );

// export const aggregateExprSchema = z.object({
//   type: z.literal("aggregate"),
//   op: aggregateOpSchema,
//   indices: z.array(indexBindingSchema).min(1),
//   body: z.lazy(() => expressionSchema),
//   where: comparisonExprSchema.optional().describe("Optional comparison filter"),
// });

// // ========================
// // Main Expression Union
// // ========================

// export const expressionSchema: z.ZodType<Expression, Expression> = z.lazy(() =>
//   z.discriminatedUnion("type", [
//     numberLiteralSchema, // number
//     varRefSchema, // var
//     paramRefSchema, // param
//     binaryExprSchema, // binary
//     unaryExprSchema, // unary
//     aggregateExprSchema, // aggregate
//   ])
// );

// // ========================
// // Constraint & Objective Schemas
// // ========================

// export const constraintSchema: z.ZodType<Constraint, Constraint> = z.object({
//   type: z.literal("constraint"),
//   left: expressionSchema,
//   op: comparisonOpSchema,
//   right: expressionSchema,
// });

// export const objectiveSchema: z.ZodType<Objective, Objective> = z.object({
//   type: z.literal("objective"),
//   expr: expressionSchema,
//   sense: objectiveSenseSchema,
// });

// // ========================
// // Helper Collections
// // ========================

// export const indexSchemas = {
//   numberLiteralSchema,
//   indexVarSchema,
//   indexUnarySchema,
//   indexBinarySchema,
//   indexTermSchema,
// };

// export const expressionSchemas = {
//   numberLiteralSchema,
//   varRefSchema,
//   paramRefSchema,
//   binaryExprSchema,
//   unaryExprSchema,
//   aggregateExprSchema,
//   comparisonExprSchema,
//   expressionSchema,
//   constraintSchema,
//   objectiveSchema,
// };

// export type ExpressionParseResult = z.infer<typeof expressionSchema>;
// export type ConstraintParseResult = z.infer<typeof constraintSchema>;
// export type ObjectiveParseResult = z.infer<typeof objectiveSchema>;
