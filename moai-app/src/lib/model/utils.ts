import type {
  Expression,
  IndexExprType,
  ComparisonExpr,
  IndexComparisonExpr,
  IndexBinding,
  Constraint,
  Objective,
  Set,
  Parameter,
  Variable,
  Quantifier,
  UnaryOpType,
  BinaryOpType,
  ComparisonOpType,
} from "./schemas";
import { Model } from "./types";

// Operator symbol mappings
const binaryOpToSymbol: Record<BinaryOpType, string> = {
  add: "+",
  sub: "-",
  mul: "*",
  div: "/",
};

const unaryOpToSymbol: Record<UnaryOpType, string> = {
  sub: "-",
  sin: "sin",
  cos: "cos",
  tan: "tan",
  exp: "exp",
  log: "log",
};

const comparisonOpToSymbol: Record<ComparisonOpType, string> = {
  le: "<=",
  lt: "<",
  eq: "=",
  gt: ">",
  ge: ">=",
  ne: "!=",
};

/**
 * Convert an index expression to a string representation
 */
export function indexExprToString(expr: IndexExprType): string {
  switch (expr.type) {
    case "number":
      return String(expr.value);

    case "string":
      return expr.value;

    case "index_variable":
      return expr.name;

    case "unary_op":
      const innerExpr = exprToString(expr.expr as Expression);
      return `(${unaryOpToSymbol[expr.op]}${innerExpr})`;

    case "binary_op":
      const leftStr = exprToString(expr.left as Expression);
      const rightStr = exprToString(expr.right as Expression);
      return `(${leftStr} ${binaryOpToSymbol[expr.op]} ${rightStr})`;

    default:
      // @ts-expect-error - exhaustive check
      throw new Error(`Unsupported index expression type: ${expr.type}`);
  }
}

/**
 * Convert any expression to a string representation
 */
export function exprToString(expr: Expression): string {
  switch (expr.type) {
    case "number":
      return String(expr.value);

    case "string":
      return expr.value;

    case "index_variable":
      return expr.name;

    case "variable":
      if (expr.index_expr && expr.index_expr.length > 0) {
        const indexStr = (expr.index_expr as IndexExprType[])
          .map(indexExprToString)
          .join(", ");
        return `${expr.name}[${indexStr}]`;
      }
      return expr.name;

    case "parameter":
      if (expr.index_expr && expr.index_expr.length > 0) {
        const indexStr = (expr.index_expr as IndexExprType[])
          .map(indexExprToString)
          .join(", ");
        return `${expr.name}[${indexStr}]`;
      }
      return expr.name;

    case "unary_op":
      const innerExpr = exprToString(expr.expr as Expression);
      return `(${unaryOpToSymbol[expr.op]}${innerExpr})`;

    case "binary_op":
      const leftStr = exprToString(expr.left as Expression);
      const rightStr = exprToString(expr.right as Expression);
      return `(${leftStr} ${binaryOpToSymbol[expr.op]} ${rightStr})`;

    case "aggregation":
      const exprStr = exprToString(expr.expr as Expression);
      const bindingsStr = (expr.bindings as IndexBinding[])
        .map((b) => `${b.index_var} in ${b.set_name}`)
        .join(", ");

      if (expr.condition) {
        const conditionStr = indexComparisonToString(
          expr.condition as IndexComparisonExpr
        );
        return `${expr.op}(${exprStr} for ${bindingsStr} if ${conditionStr})`;
      }
      return `${expr.op}(${exprStr} for ${bindingsStr})`;

    default:
      // @ts-expect-error - exhaustive check
      throw new Error(`Unsupported expression type: ${expr.type}`);
  }
}

/**
 * Convert a comparison expression to a string representation
 */
export function comparisonExprToString(expr: ComparisonExpr): string {
  const leftStr = exprToString(expr.left as Expression);
  const rightStr = exprToString(expr.right as Expression);
  return `${leftStr} ${comparisonOpToSymbol[expr.op]} ${rightStr}`;
}

/**
 * Convert an index comparison expression to a string representation
 */
export function indexComparisonToString(expr: IndexComparisonExpr): string {
  const leftStr = indexExprToString(expr.left as IndexExprType);
  const rightStr = indexExprToString(expr.right as IndexExprType);
  return `${leftStr} ${comparisonOpToSymbol[expr.op]} ${rightStr}`;
}

/**
 * Convert a quantifier to a string representation
 */
export function quantifierToString(quantifier: Quantifier): string {
  if (quantifier.condition) {
    const conditionStr = comparisonExprToString(
      quantifier.condition as ComparisonExpr
    );
    return `for ${quantifier.index} in ${quantifier.over} if ${conditionStr}`;
  }
  return `for ${quantifier.index} in ${quantifier.over}`;
}

/**
 * Convert a constraint to a string representation
 */
export function constraintToString(constraint: Constraint): string {
  const exprStr = comparisonExprToString(constraint.expr as ComparisonExpr);

  if (constraint.quantifiers && constraint.quantifiers.length > 0) {
    const quantifiersStr = (constraint.quantifiers as Quantifier[])
      .map(quantifierToString)
      .join(", ");
    return `${exprStr}, ${quantifiersStr}`;
  }

  return exprStr;
}

/**
 * Convert an objective to a string representation
 */
export function objectiveToString(objective: Objective): string {
  const exprStr = exprToString(objective.expr as Expression);
  const sense = objective.sense || "min";
  return `${sense} ${exprStr}`;
}

/**
 * Convert a set to a descriptive string representation
 */
export function setToString(set: Set): string {
  const elements = set.elements as (string | number)[];
  const elementsStr =
    elements.length <= 5
      ? `{${elements.join(", ")}}`
      : `{${elements.slice(0, 3).join(", ")}, ..., ${
          elements[elements.length - 1]
        }} (${elements.length} elements)`;

  return `${set.name} = ${elementsStr}`;
}

/**
 * Convert a parameter to a descriptive string representation
 */
export function parameterToString(parameter: Parameter): string {
  const indices = parameter.indices as string[];
  const indexStr = indices.length > 0 ? `[${indices.join(", ")}]` : "";

  if (typeof parameter.values === "number") {
    return `${parameter.name}${indexStr} = ${parameter.values}`;
  }

  const values = parameter.values as Array<{
    index: (string | number)[];
    value: number;
  }>;
  const valuesCount = values.length;
  if (valuesCount <= 3) {
    const valuesStr = values
      .map((v) => `${parameter.name}[${v.index.join(", ")}] = ${v.value}`)
      .join(", ");
    return valuesStr;
  }

  const firstValues = values
    .slice(0, 2)
    .map((v) => `${parameter.name}[${v.index.join(", ")}] = ${v.value}`)
    .join(", ");

  return `${firstValues}, ... (${valuesCount} values total)`;
}

/**
 * Convert a variable to a descriptive string representation
 */
export function variableToString(variable: Variable): string {
  const indices = variable.indices as string[];
  const indexStr = indices.length > 0 ? `[${indices.join(", ")}]` : "";

  let boundsStr = "";
  if (variable.lowerBound !== undefined || variable.upperBound !== undefined) {
    const lower = variable.lowerBound ?? "-∞";
    const upper = variable.upperBound ?? "∞";
    boundsStr = ` ∈ [${lower}, ${upper}]`;
  }

  return `${variable.name}${indexStr} ∈ ${variable.domain}${boundsStr}`;
}

/**
 * Display functions that can be attached to model objects
 */
export const display = {
  expr: exprToString,
  indexExpr: indexExprToString,
  comparison: comparisonExprToString,
  indexComparison: indexComparisonToString,
  quantifier: quantifierToString,
  constraint: constraintToString,
  objective: objectiveToString,
  set: setToString,
  parameter: parameterToString,
  variable: variableToString,
} as const;

/**
 * Helper function to pretty print a complete model
 */
export function modelToString(model: Model): string {
  const sections: string[] = [];

  if (model.sets && model.sets.length > 0) {
    sections.push("Sets:");
    sections.push(...model.sets.map((s) => `  ${setToString(s)}`));
    sections.push("");
  }

  if (model.parameters && model.parameters.length > 0) {
    sections.push("Parameters:");
    sections.push(...model.parameters.map((p) => `  ${parameterToString(p)}`));
    sections.push("");
  }

  if (model.variables && model.variables.length > 0) {
    sections.push("Variables:");
    sections.push(...model.variables.map((v) => `  ${variableToString(v)}`));
    sections.push("");
  }

  if (model.constraints && model.constraints.length > 0) {
    sections.push("Constraints:");
    sections.push(
      ...model.constraints.map((c) => `  ${c.name}: ${constraintToString(c)}`)
    );
    sections.push("");
  }

  if (model.objective) {
    sections.push("Objective:");
    sections.push(`  ${objectiveToString(model.objective)}`);
  }

  return sections.join("\n");
}
