import { getNodeDisplayText } from "../expression";
import { ConstraintDefinition } from "./constraint-schema";

// Get constraint type display text
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

// Get constraint operator symbol
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

// Constraint preview
export const getConstraintPreview = (
  constraint: ConstraintDefinition
): string => {
  try {
    const leftSide = getNodeDisplayText(constraint.leftSide);
    const rightSide = getNodeDisplayText(constraint.rightSide);
    const operator = getConstraintOperator(constraint.type);

    let constraintStr = `${leftSide} ${operator} ${rightSide}`;

    // New quantifier format: single block with multiple bindings + optional condition
    const q = constraint.quantifiers;
    if (q && q.bindings.length > 0) {
      const bindingsStr = q.bindings
        .map((b) => `${b.index} in ${b.over}`)
        .join(", ");
      const conditionStr = q.condition
        ? ` | ${getNodeDisplayText(q.condition)}`
        : "";
      constraintStr += ` for ${bindingsStr}${conditionStr}`;
    }

    return constraintStr;
  } catch (e) {
    console.error("Error generating constraint preview:", e);
    return "Invalid constraint structure";
  }
};
