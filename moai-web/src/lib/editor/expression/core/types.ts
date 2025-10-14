/**
 * Core TypeScript types for mathematical expressions (manual source of truth).
 * Schemas import these types and use `satisfies` to ensure runtime validation
 * remains structurally in sync with these definitions.
 *
 * This file contains ONLY TypeScript type declarations (no schema inference, no React).
 */

// ====== BASIC EXPRESSION TYPES ======

export type NumberExpr = { type: "number"; value: number };
export type StringExpr = { type: "string"; value: string };
export type IndexExpr = { type: "index"; name: string };
export type VarExpr = {
  type: "var";
  name: string;
  indices?: IndexTerm[];
};
export type ParamExpr = {
  type: "param";
  name: string;
  indices?: IndexTerm[];
};

// Manual recursive index term union (cannot rely on z.infer due to recursive lazy limitations without generics)
export type IndexBinaryExpr = {
  type: "index_binary";
  op: "+" | "-";
  left: IndexTerm;
  right: IndexTerm;
};
export type IndexUnaryExpr = { type: "index_unary"; op: "-"; expr: IndexTerm };
export type IndexTerm =
  | NumberExpr
  | IndexExpr
  | StringExpr
  | IndexBinaryExpr
  | IndexUnaryExpr;

// ====== OPERATION TYPE DEFINITIONS ======

export type BinaryOpType = "+" | "-" | "*" | "/" | "^";
export type ComparisonOpType = "=" | "<=" | ">=" | "<" | ">" | "!=";
export type UnaryOpType =
  | "-"
  | "abs"
  | "sin"
  | "cos"
  | "tan"
  | "exp"
  | "log"
  | "sqrt";
export type AggregateOpType = "sum" | "prod" | "min" | "max";
export type IndexBinding = { index: string; over: string };

// ====== COMPLEX EXPRESSION TYPES ======

export type BinaryOperator = {
  type: "binary";
  op: BinaryOpType;
  left: Expression;
  right: Expression;
};

export type ComparisonOperator = {
  type: "comparison";
  op: ComparisonOpType;
  left: Expression;
  right: Expression;
};

export type UnaryOperator = {
  type: "unary";
  op: UnaryOpType;
  expr: Expression;
};

export type AggregateOperator = {
  type: "aggregate";
  op: AggregateOpType;
  indexBinding: IndexBinding[];
  condition?: ComparisonOperator;
  body: Expression;
};

// ====== MAIN EXPRESSION UNION TYPE ======

/**
 * Union type for all possible mathematical expressions in MILP models.
 * This represents the complete expression language for building constraints and objectives.
 */
// Manual recursive Expression union (safer for editor tooling performance than annotating schema with generic & avoids circular import)
export type Expression =
  | NumberExpr
  | StringExpr
  | ParamExpr
  | IndexExpr
  | VarExpr
  | BinaryOperator
  | ComparisonOperator
  | UnaryOperator
  | AggregateOperator
  | IndexBinaryExpr
  | IndexUnaryExpr;

// ====== VALIDATION AND ERROR TYPES ======

/**
 * Type definitions for validation errors and UI components.
 */
export interface ValidationError {
  message: string;
}

export interface NodeValidationErrors {
  value?: ValidationError;
  name?: ValidationError;
  op?: ValidationError;
  [key: string]: ValidationError | NodeValidationErrors | undefined;
}

/**
 * Nested validation errors for expression trees.
 * Allows for recursive error structures that match the expression tree structure.
 */
export type ExpressionTreeErrors = NodeValidationErrors;

// ====== NODE UPDATE TYPES ======

/**
 * Type definitions for node update operations.
 * These provide type-safe partial updates for specific node types.
 * Using schema-derived types to ensure consistency.
 */
export type NumberNodeUpdate = Partial<Pick<NumberExpr, "value">>;
export type StringNodeUpdate = Partial<Pick<StringExpr, "value">>;
export type NamedNodeUpdate = Partial<Pick<IndexExpr, "name">>;
export type IndexedNodeUpdate = Partial<Pick<VarExpr, "indices">>;
export type BinaryNodeUpdate = Partial<Pick<BinaryOperator, "op">>;
export type ComparisonNodeUpdate = Partial<Pick<ComparisonOperator, "op">>;
export type UnaryNodeUpdate = Partial<Pick<UnaryOperator, "op">>;
export type AggregateNodeUpdate = Partial<
  Pick<AggregateOperator, "op" | "indexBinding" | "condition">
>;
