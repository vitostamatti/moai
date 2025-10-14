import type { Expression } from "../core/types";

/**
 * Get constraint type display text
 */
export const getConstraintTypeDisplay = (type: string): string => {
  switch (type) {
    case "eq":
      return "Equals (=)";
    case "leq":
      return "Less than or equal (≤)";
    case "geq":
      return "Greater than or equal (≥)";
    case "lt":
      return "Less than (<)";
    case "gt":
      return "Greater than (>)";
    default:
      return type;
  }
};

/**
 * Get constraint operator symbol
 */
export const getConstraintOperator = (type: string): string => {
  switch (type) {
    case "eq":
      return "=";
    case "leq":
      return "<=";
    case "geq":
      return ">=";
    case "lt":
      return "<";
    case "gt":
      return ">";
    default:
      return type;
  }
};

// ====== EXPRESSION VALIDATION UTILITIES ======

/**
 * Validate expression structure before form submission.
 * Provides additional validation beyond Zod schema validation.
 *
 * @param expression - The expression to validate
 * @returns Validation result with any structural issues
 *
 * @example
 * const validation = validateExpressionStructure(formData.expression);
 * if (!validation.isValid) {
 *   console.error("Validation errors:", validation.errors);
 * }
 */
export const validateExpressionStructure = (
  expression: Expression
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Recursive validation for binary/comparison operations
  if (expression.type === "binary" || expression.type === "comparison") {
    if (!expression.left) {
      errors.push("Left operand is required");
    }
    if (!expression.right) {
      errors.push("Right operand is required");
    }
  }

  // Validate unary operations
  if (expression.type === "unary" && !expression.expr) {
    errors.push("Expression is required for unary operation");
  }

  // Validate aggregate operations
  if (expression.type === "aggregate") {
    if (!expression.body) {
      errors.push("Body expression is required for aggregation");
    }
    if (!expression.indexBinding || expression.indexBinding.length === 0) {
      errors.push("At least one index binding is required for aggregation");
    }
  }

  // Validate named expressions
  if (
    (expression.type === "var" ||
      expression.type === "param" ||
      expression.type === "index") &&
    (!expression.name || expression.name.trim() === "")
  ) {
    errors.push("Name is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
