import {
  Expression,
  NumberExpr,
  StringExpr,
  IndexExpr,
  VarExpr,
  ParamExpr,
  BinaryOperator,
  ComparisonOperator,
  UnaryOperator,
  AggregateOperator,
  IndexBinding,
} from "@/lib/editor/expression/core";

/**
 * Expression Builder Utilities for MILP Mathematical Expressions
 *
 * This module provides a comprehensive set of builder functions for creating
 * mathematical expressions used in Mixed Integer Linear Programming (MILP) models.
 * These builders ensure type safety and provide a fluent API for expression construction.
 *
 * Key Features:
 * - Type-safe expression construction
 * - Fluent API design
 * - Validation of expression structure
 * - Support for all expression types
 * - Optimized for AI-driven generation
 */

// ====== BASIC EXPRESSION BUILDERS ======

/**
 * Creates a numeric literal expression.
 * @param value - The numeric value
 * @returns NumberExpr
 * @example num(5) -> { type: "number", value: 5 }
 * @example num(3.14) -> { type: "number", value: 3.14 }
 */
export const num = (value: number): NumberExpr => ({
  type: "number",
  value,
});

/**
 * Creates a string literal expression.
 * @param value - The string value
 * @returns StringExpr
 * @example str("Product_A") -> { type: "string", value: "Product_A" }
 */
export const str = (value: string): StringExpr => ({
  type: "string",
  value,
});

/**
 * Creates an index variable expression.
 * @param name - The index variable name
 * @returns IndexExpr
 * @example idx("i") -> { type: "index", name: "i" }
 * @example idx("j") -> { type: "index", name: "j" }
 */
export const idx = (name: string): IndexExpr => ({
  type: "index",
  name,
});

/**
 * Creates a decision variable expression.
 * @param name - The variable name
 * @param indices - Optional array of index names
 * @returns VarExpr
 * @example variable("x") -> { type: "var", name: "x" }
 * @example variable("production", ["i", "j"]) -> { type: "var", name: "production", indices: [{ type: "index", name: "i" }, { type: "index", name: "j" }] }
 */
export const variable = (name: string, indices?: string[]): VarExpr => ({
  type: "var",
  name,
  indices: indices?.map(idx),
});

/**
 * Creates a parameter expression.
 * @param name - The parameter name
 * @param indices - Optional array of index names
 * @returns ParamExpr
 * @example param("capacity") -> { type: "param", name: "capacity" }
 * @example param("cost", ["i", "j"]) -> { type: "param", name: "cost", indices: [{ type: "index", name: "i" }, { type: "index", name: "j" }] }
 */
export const param = (name: string, indices?: string[]): ParamExpr => ({
  type: "param",
  name,
  indices: indices?.map(idx),
});

// ====== ARITHMETIC OPERATION BUILDERS ======

/**
 * Creates an addition expression.
 * @param left - Left operand
 * @param right - Right operand
 * @returns BinaryOp
 * @example add(variable("x"), num(5)) -> x + 5
 */
export const add = (left: Expression, right: Expression): BinaryOperator => ({
  type: "binary",
  op: "+",
  left,
  right,
});

/**
 * Creates a subtraction expression.
 * @param left - Left operand (minuend)
 * @param right - Right operand (subtrahend)
 * @returns BinaryOp
 * @example sub(param("capacity"), variable("used")) -> capacity - used
 */
export const sub = (left: Expression, right: Expression): BinaryOperator => ({
  type: "binary",
  op: "-",
  left,
  right,
});

/**
 * Creates a multiplication expression.
 * @param left - Left operand
 * @param right - Right operand
 * @returns BinaryOp
 * @example mul(param("cost", ["i"]), variable("x", ["i"])) -> cost[i] * x[i]
 */
export const mul = (left: Expression, right: Expression): BinaryOperator => ({
  type: "binary",
  op: "*",
  left,
  right,
});

/**
 * Creates a division expression.
 * @param left - Left operand (dividend)
 * @param right - Right operand (divisor)
 * @returns BinaryOp
 * @example div(variable("revenue"), param("price")) -> revenue / price
 */
export const div = (left: Expression, right: Expression): BinaryOperator => ({
  type: "binary",
  op: "/",
  left,
  right,
});

/**
 * Creates an exponentiation expression.
 * @param base - Base expression
 * @param exponent - Exponent expression
 * @returns BinaryOp
 * @example pow(variable("x"), num(2)) -> x^2
 */
export const pow = (
  base: Expression,
  exponent: Expression
): BinaryOperator => ({
  type: "binary",
  op: "^",
  left: base,
  right: exponent,
});

// ====== COMPARISON OPERATION BUILDERS ======

/**
 * Creates an equality comparison.
 * @param left - Left side expression
 * @param right - Right side expression
 * @returns ComparisonOp
 * @example eq(variable("x"), num(10)) -> x = 10
 */
export const eq = (
  left: Expression,
  right: Expression
): ComparisonOperator => ({
  type: "comparison",
  op: "=",
  left,
  right,
});

/**
 * Creates a less than or equal comparison.
 * @param left - Left side expression
 * @param right - Right side expression
 * @returns ComparisonOp
 * @example leq(sum(...), param("capacity")) -> sum(...) <= capacity
 */
export const leq = (
  left: Expression,
  right: Expression
): ComparisonOperator => ({
  type: "comparison",
  op: "<=",
  left,
  right,
});

/**
 * Creates a greater than or equal comparison.
 * @param left - Left side expression
 * @param right - Right side expression
 * @returns ComparisonOp
 * @example geq(variable("production"), param("demand")) -> production >= demand
 */
export const geq = (
  left: Expression,
  right: Expression
): ComparisonOperator => ({
  type: "comparison",
  op: ">=",
  left,
  right,
});

/**
 * Creates a less than comparison.
 * @param left - Left side expression
 * @param right - Right side expression
 * @returns ComparisonOp
 * @example lt(variable("time"), param("deadline")) -> time < deadline
 */
export const lt = (
  left: Expression,
  right: Expression
): ComparisonOperator => ({
  type: "comparison",
  op: "<",
  left,
  right,
});

/**
 * Creates a greater than comparison.
 * @param left - Left side expression
 * @param right - Right side expression
 * @returns ComparisonOp
 * @example gt(param("revenue"), param("cost")) -> revenue > cost
 */
export const gt = (
  left: Expression,
  right: Expression
): ComparisonOperator => ({
  type: "comparison",
  op: ">",
  left,
  right,
});

/**
 * Creates a not equal comparison.
 * @param left - Left side expression
 * @param right - Right side expression
 * @returns ComparisonOp
 * @example neq(idx("i"), idx("j")) -> i != j
 */
export const neq = (
  left: Expression,
  right: Expression
): ComparisonOperator => ({
  type: "comparison",
  op: "!=",
  left,
  right,
});

// ====== UNARY OPERATION BUILDERS ======

/**
 * Creates a negation expression.
 * @param expr - Expression to negate
 * @returns UnaryOp
 * @example neg(variable("profit")) -> -profit
 */
export const neg = (expr: Expression): UnaryOperator => ({
  type: "unary",
  op: "-",
  expr,
});

/**
 * Creates an absolute value expression.
 * @param expr - Expression to take absolute value of
 * @returns UnaryOp
 * @example abs(sub(variable("actual"), param("target"))) -> abs(actual - target)
 */
export const abs = (expr: Expression): UnaryOperator => ({
  type: "unary",
  op: "abs",
  expr,
});

/**
 * Creates a square root expression.
 * @param expr - Expression to take square root of
 * @returns UnaryOp
 * @example sqrt(variable("area")) -> sqrt(area)
 */
export const sqrt = (expr: Expression): UnaryOperator => ({
  type: "unary",
  op: "sqrt",
  expr,
});

/**
 * Creates a sine expression.
 * @param expr - Expression to apply sine to
 * @returns UnaryOp
 * @example sin(variable("angle")) -> sin(angle)
 */
export const sin = (expr: Expression): UnaryOperator => ({
  type: "unary",
  op: "sin",
  expr,
});

/**
 * Creates a cosine expression.
 * @param expr - Expression to apply cosine to
 * @returns UnaryOp
 * @example cos(variable("angle")) -> cos(angle)
 */
export const cos = (expr: Expression): UnaryOperator => ({
  type: "unary",
  op: "cos",
  expr,
});

/**
 * Creates a natural logarithm expression.
 * @param expr - Expression to take log of
 * @returns UnaryOp
 * @example log(variable("value")) -> log(value)
 */
export const log = (expr: Expression): UnaryOperator => ({
  type: "unary",
  op: "log",
  expr,
});

/**
 * Creates an exponential expression.
 * @param expr - Expression to exponentiate
 * @returns UnaryOp
 * @example exp(variable("rate")) -> exp(rate)
 */
export const exp = (expr: Expression): UnaryOperator => ({
  type: "unary",
  op: "exp",
  expr,
});

// ====== AGGREGATE OPERATION BUILDERS ======

/**
 * Creates a summation expression over specified quantifiers.
 * @param quantifiers - Array of index-set pairs to sum over
 * @param body - Expression to sum
 * @param condition - Optional condition to filter summation
 * @returns AggregateOp
 * @example
 * sum([{index: "i", over: "Products"}], variable("x", ["i"]))
 * -> sum(x[i] for i in Products)
 *
 * @example
 * sum([{index: "i", over: "Plants"}, {index: "j", over: "Markets"}],
 *     mul(param("cost", ["i", "j"]), variable("x", ["i", "j"])))
 * -> sum(cost[i,j] * x[i,j] for i in Plants, j in Markets)
 */
export const sum = (
  indexBinding: IndexBinding[],
  body: Expression,
  condition?: ComparisonOperator
): AggregateOperator => ({
  type: "aggregate",
  op: "sum",
  indexBinding,
  body,
  condition,
});

/**
 * Creates a product expression over specified quantifiers.
 * @param indexBinding - Array of index-set pairs to multiply over
 * @param body - Expression to multiply
 * @param condition - Optional condition to filter product
 * @returns AggregateOp
 * @example
 * prod([{index: "i", over: "Components"}], variable("reliability", ["i"]))
 * -> prod(reliability[i] for i in Components)
 */
export const prod = (
  indexBinding: IndexBinding[],
  body: Expression,
  condition?: ComparisonOperator
): AggregateOperator => ({
  type: "aggregate",
  op: "prod",
  indexBinding,
  body,
  condition,
});

/**
 * Creates a minimum expression over specified quantifiers.
 * @param quantifiers - Array of index-set pairs to find minimum over
 * @param body - Expression to find minimum of
 * @param condition - Optional condition to filter minimum
 * @returns AggregateOp
 * @example
 * min([{index: "i", over: "Suppliers"}], param("price", ["i"]))
 * -> min(price[i] for i in Suppliers)
 */
export const min = (
  indexBinding: IndexBinding[],
  body: Expression,
  condition?: ComparisonOperator
): AggregateOperator => ({
  type: "aggregate",
  op: "min",
  indexBinding,
  body,
  condition,
});

/**
 * Creates a maximum expression over specified quantifiers.
 * @param quantifiers - Array of index-set pairs to find maximum over
 * @param body - Expression to find maximum of
 * @param condition - Optional condition to filter maximum
 * @returns AggregateOp
 * @example
 * max([{index: "j", over: "TimeSlots"}], variable("utilization", ["j"]))
 * -> max(utilization[j] for j in TimeSlots)
 */
export const max = (
  indexBinding: IndexBinding[],
  body: Expression,
  condition?: ComparisonOperator
): AggregateOperator => ({
  type: "aggregate",
  op: "max",
  indexBinding,
  body,
  condition,
});

// ====== CONVENIENCE BUILDERS ======

/**
 * Creates a simple binary operation with operator inference.
 * @param left - Left operand
 * @param op - Operator
 * @param right - Right operand
 * @returns BinaryOp
 * @example binary(variable("x"), "+", num(5)) -> x + 5
 */
export const binary = (
  left: Expression,
  op: "+" | "-" | "*" | "/" | "^",
  right: Expression
): BinaryOperator => ({
  type: "binary",
  op,
  left,
  right,
});

/**
 * Creates a comparison operation with operator inference.
 * @param left - Left operand
 * @param op - Comparison operator
 * @param right - Right operand
 * @returns ComparisonOp
 * @example compare(variable("x"), "<=", param("capacity")) -> x <= capacity
 */
export const compare = (
  left: Expression,
  op: "=" | "<=" | ">=" | "<" | ">" | "!=",
  right: Expression
): ComparisonOperator => ({
  type: "comparison",
  op,
  left,
  right,
});

/**
 * Creates a unary operation with operator inference.
 * @param op - Unary operator
 * @param expr - Expression to apply operator to
 * @returns UnaryOp
 * @example unary("abs", sub(variable("x"), param("target"))) -> abs(x - target)
 */
export const unary = (
  op: "-" | "abs" | "sin" | "cos" | "tan" | "exp" | "log" | "sqrt",
  expr: Expression
): UnaryOperator => ({
  type: "unary",
  op,
  expr,
});

// ====== EXPRESSION VALIDATION AND UTILITIES ======

/**
 * Validates if an expression is structurally correct.
 * @param expr - Expression to validate
 * @returns boolean indicating if expression is valid
 */
export const isValidExpression = (expr: Expression): boolean => {
  try {
    switch (expr.type) {
      case "number":
        return typeof expr.value === "number" && !isNaN(expr.value);
      case "string":
        return typeof expr.value === "string";
      case "index":
        return typeof expr.name === "string" && expr.name.length > 0;
      case "var":
      case "param":
        return typeof expr.name === "string" && expr.name.length > 0;
      case "binary":
        return isValidExpression(expr.left) && isValidExpression(expr.right);
      case "comparison":
        return isValidExpression(expr.left) && isValidExpression(expr.right);
      case "unary":
        return isValidExpression(expr.expr);
      case "aggregate":
        return (
          expr.indexBinding.length > 0 &&
          expr.indexBinding.every((q) => q.index && q.over) &&
          isValidExpression(expr.body) &&
          (!expr.condition || isValidExpression(expr.condition))
        );
      default:
        return false;
    }
  } catch {
    return false;
  }
};

/**
 * Gets all variable names referenced in an expression.
 * @param expr - Expression to analyze
 * @returns Array of variable names
 */
export const getVariableNames = (expr: Expression): string[] => {
  const variables = new Set<string>();

  const traverse = (e: Expression) => {
    switch (e.type) {
      case "var":
        variables.add(e.name);
        break;
      case "binary":
        traverse(e.left);
        traverse(e.right);
        break;
      case "comparison":
        traverse(e.left);
        traverse(e.right);
        break;
      case "unary":
        traverse(e.expr);
        break;
      case "aggregate":
        traverse(e.body);
        if (e.condition) traverse(e.condition);
        break;
    }
  };

  traverse(expr);
  return Array.from(variables);
};

/**
 * Gets all parameter names referenced in an expression.
 * @param expr - Expression to analyze
 * @returns Array of parameter names
 */
export const getParameterNames = (expr: Expression): string[] => {
  const parameters = new Set<string>();

  const traverse = (e: Expression) => {
    switch (e.type) {
      case "param":
        parameters.add(e.name);
        break;
      case "binary":
        traverse(e.left);
        traverse(e.right);
        break;
      case "comparison":
        traverse(e.left);
        traverse(e.right);
        break;
      case "unary":
        traverse(e.expr);
        break;
      case "aggregate":
        traverse(e.body);
        if (e.condition) traverse(e.condition);
        break;
    }
  };

  traverse(expr);
  return Array.from(parameters);
};

/**
 * Gets all index names used in an expression.
 * @param expr - Expression to analyze
 * @returns Array of index names
 */
export const getIndexNames = (expr: Expression): string[] => {
  const indices = new Set<string>();

  const traverse = (e: Expression) => {
    switch (e.type) {
      case "index":
        indices.add(e.name);
        break;
      case "var":
      case "param":
        if (e.indices) {
          e.indices.forEach((idx) => traverse(idx as unknown as Expression));
        }
        break;
      case "binary":
        traverse(e.left);
        traverse(e.right);
        break;
      case "comparison":
        traverse(e.left);
        traverse(e.right);
        break;
      case "unary":
        traverse(e.expr);
        break;
      case "aggregate":
        e.indexBinding.forEach((q) => indices.add(q.index));
        traverse(e.body);
        if (e.condition) traverse(e.condition);
        break;
    }
  };

  traverse(expr);
  return Array.from(indices);
};

// ====== EXPORT ALL BUILDERS ======

export const ExpressionBuilder = {
  // Basic builders
  num,
  str,
  idx,
  variable,
  param,

  // Arithmetic
  add,
  sub,
  mul,
  div,
  pow,

  // Comparisons
  eq,
  leq,
  geq,
  lt,
  gt,
  neq,

  // Unary operations
  neg,
  abs,
  sqrt,
  sin,
  cos,
  log,
  exp,

  // Aggregates
  sum,
  prod,
  min,
  max,

  // Convenience
  binary,
  compare,
  unary,

  // Utilities
  isValidExpression,
  getVariableNames,
  getParameterNames,
  getIndexNames,
};
