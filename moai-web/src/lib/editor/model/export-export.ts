import { Expression, IndexTerm } from "@/lib/editor/expression/core/types";

const indexTermToString = (node: IndexTerm): string => {
  switch (node.type) {
    case "index":
      return node.name;
    case "number":
      return String(node.value);
    case "string":
      return JSON.stringify(node.value);
    case "index_binary":
      return `(${indexTermToString(node.left)} ${node.op} ${indexTermToString(
        node.right
      )})`;
    case "index_unary":
      return `-${indexTermToString(node.expr)}`;

    default:
      return "Invalid Index Term";
  }
};

/**
 * Export utilities for MILP models
 */

// Convert expression to mathematical string notation
export const expressionToString = (expr: Expression): string => {
  switch (expr.type) {
    case "number":
      return expr.value.toString();

    case "string":
      return `"${expr.value}"`;

    case "index":
      return expr.name;

    case "var":
      if (expr.indices && expr.indices.length > 0) {
        const indices = expr.indices
          .map((t) => indexTermToString(t))
          .join(", ");
        return `${expr.name}[${indices}]`;
      }
      return expr.name;

    case "binary":
      const left = expressionToString(expr.left);
      const right = expressionToString(expr.right);
      return `(${left} ${expr.op} ${right})`;

    case "unary":
      const operand = expressionToString(expr.expr);
      return `${expr.op}(${operand})`;

    case "aggregate":
      const indexBindings = expr.indexBinding
        .map((q) => `${q.index} ∈ ${q.over}`)
        .join(", ");
      const body = expressionToString(expr.body);

      let result = `${expr.op}_{${indexBindings}} ${body}`;

      if (expr.condition) {
        const condition = expressionToString(expr.condition);
        result += ` | ${condition}`;
      }

      return result;

    default:
      return "unknown";
  }
};
