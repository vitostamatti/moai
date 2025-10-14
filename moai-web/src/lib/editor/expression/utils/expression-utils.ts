import type { Expression } from "../core/types";

export const createNode = (type: Expression["type"]): Expression => {
  switch (type) {
    case "number":
      return { type: "number", value: 0 };
    case "string":
      return { type: "string", value: "" };
    case "index":
      return { type: "index", name: "" };
    case "var":
      return { type: "var", name: "", indices: [] };
    case "param":
      return { type: "param", name: "", indices: [] };
    case "binary":
      return {
        type: "binary",
        op: "+",
        left: createNode("number"),
        right: createNode("number"),
      };
    case "comparison":
      return {
        type: "comparison",
        op: "=",
        left: createNode("index"),
        right: createNode("number"),
      };
    case "unary":
      return {
        type: "unary",
        op: "-",
        expr: createNode("number"),
      };
    // case "index_binary":
    //   return {
    //     type: "index_binary",
    //     op: "+",
    //     left: createNode("number"),
    //     right: createNode("number"),
    //   };
    // case "index_unary":
    //   return {
    //     type: "index_unary",
    //     op: "-",
    //     expr: createNode("number"),
    //   };
    case "aggregate":
      return {
        type: "aggregate",
        op: "sum",
        indexBinding: [{ index: "i", over: "Set" }],
        body: createNode("var"),
      };
    default:
      return { type: "number", value: 0 };
  }
};

/**
 * Create default values for expression forms based on expression type.
 * Ensures forms always have valid initial values without type casting.
 *
 * @param expressionType - The type of expression to create defaults for
 * @returns Default expression object of the specified type
 *
 * @example
 * const defaults = createExpressionDefaults("binary");
 * // Returns: { type: "binary", op: "+", left: { type: "number", value: 0 }, right: { type: "number", value: 0 } }
 */
export const createExpressionDefaults = (
  expressionType: Expression["type"]
): Expression => {
  return createNode(expressionType);
};

const indexTermToString = (node: Expression): string => {
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
      return "Unknown Term Expression";
  }
};

/**
 * Get display text for a node
 */
export const getNodeDisplayText = (node: Expression): string => {
  switch (node.type) {
    case "number":
      return node.value.toString();
    case "string":
      return `"${node.value}"`;
    case "index":
      return node.name || "<idx>";
    case "var":
      const varIndices =
        node.indices && node.indices.length > 0
          ? `[${node.indices.map(indexTermToString).join(", ")}]`
          : "";
      return `${node.name || "<var>"}${varIndices}`;
    case "param":
      const paramIndices =
        node.indices && node.indices.length > 0
          ? `[${node.indices.map(indexTermToString).join(", ")}]`
          : "";
      return `${node.name || "<param>"}${paramIndices}`;
    case "index_binary":
    case "binary":
      return `(${getNodeDisplayText(node.left)} ${node.op} ${getNodeDisplayText(
        node.right
      )})`;
    case "comparison":
      return `${getNodeDisplayText(node.left)} ${node.op} ${getNodeDisplayText(
        node.right
      )}`;
    case "index_unary":
    case "unary":
      return `${node.op}(${getNodeDisplayText(node.expr)})`;
    case "aggregate":
      const indexBindingStr = node.indexBinding
        .map((q) => `${q.index} in ${q.over}`)
        .join(", ");
      const conditionStr = node.condition
        ? ` | ${getNodeDisplayText(node.condition)}`
        : "";
      return `${node.op}(${getNodeDisplayText(
        node.body
      )} for ${indexBindingStr}${conditionStr})`;
    default:
      return "?";
  }
};

export const getChildNodes = (
  node: Expression
): Array<{ key: string; node: Expression; label: string }> => {
  switch (node.type) {
    case "binary":
      return [
        { key: "left", node: node.left, label: "Left" },
        { key: "right", node: node.right, label: "Right" },
      ];
    case "comparison":
      return [
        { key: "left", node: node.left, label: "Left" },
        { key: "right", node: node.right, label: "Right" },
      ];
    case "unary":
      return [{ key: "expr", node: node.expr, label: "Expression" }];
    case "aggregate":
      const children = [{ key: "body", node: node.body, label: "Body" }];
      if (node.condition) {
        children.push({
          key: "condition",
          node: node.condition,
          label: "Condition",
        });
      }
      return children;
    default:
      return [];
  }
};
