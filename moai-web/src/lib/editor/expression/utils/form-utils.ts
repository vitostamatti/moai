"use client";

import { FieldError, FieldPath, FieldValues } from "react-hook-form";

import type { Expression } from "@/lib/editor/expression/core/types";
import { getNodeDisplayText } from "@/lib/editor/expression/utils/expression-utils";

// Helper to safely create nested field paths with better type safety
export const getNestedFieldPath = <
  T extends FieldValues,
  K extends FieldPath<T>,
  P extends string
>(
  basePath: K,
  property: P
): `${K}.${P}` => {
  return `${basePath}.${property}` as `${K}.${P}`;
};

export type ExpressionPath = string;

export type TreeNodeData = {
  path: ExpressionPath;
  expression: Expression;
  label: string;
  level: number;
  hasChildren: boolean;
};

export const buildExpressionTree = (
  expression: Expression,
  basePath: ExpressionPath,
  level: number = 0
): TreeNodeData[] => {
  const nodes: TreeNodeData[] = [];

  const nodeType = expression.type;
  const hasChildren =
    nodeType === "binary" ||
    nodeType === "comparison" ||
    nodeType === "unary" ||
    nodeType === "aggregate" ||
    nodeType === "var" ||
    nodeType === "param" ||
    nodeType === "index_binary" ||
    nodeType === "index_unary";

  // Add current node first
  nodes.push({
    path: basePath,
    expression,
    label: getNodeDisplayText(expression),
    level,
    hasChildren,
  });

  // Recurse into children based on type
  switch (nodeType) {
    case "binary":
    case "comparison": {
      const b = expression as { left?: Expression; right?: Expression };
      if (b.left) {
        nodes.push(
          ...buildExpressionTree(b.left, `${basePath}.left`, level + 1)
        );
      }
      if (b.right) {
        nodes.push(
          ...buildExpressionTree(b.right, `${basePath}.right`, level + 1)
        );
      }
      break;
    }
    case "unary": {
      const u = expression as { expr?: Expression };
      if (u.expr) {
        nodes.push(
          ...buildExpressionTree(u.expr, `${basePath}.expr`, level + 1)
        );
      }
      break;
    }
    case "aggregate": {
      const a = expression as { condition?: Expression; body?: Expression };
      if (a.condition) {
        nodes.push(
          ...buildExpressionTree(
            a.condition,
            `${basePath}.condition`,
            level + 1
          )
        );
      }
      if (a.body) {
        nodes.push(
          ...buildExpressionTree(a.body, `${basePath}.body`, level + 1)
        );
      }
      break;
    }
    case "var":
    case "param": {
      const vp = expression as { indices?: Expression[] };
      if (vp.indices && vp.indices.length > 0) {
        vp.indices.forEach((child, i) => {
          nodes.push(
            ...buildExpressionTree(child, `${basePath}.indices.${i}`, level + 1)
          );
        });
      }
      break;
    }
    case "index_binary":
      const ib = expression as { left?: Expression; right?: Expression };
      if (ib.left) {
        nodes.push(
          ...buildExpressionTree(ib.left, `${basePath}.left`, level + 1)
        );
      }
      if (ib.right) {
        nodes.push(
          ...buildExpressionTree(ib.right, `${basePath}.right`, level + 1)
        );
      }
      break;
    case "index_unary":
      const iu = expression as { expr?: Expression };
      if (iu.expr) {
        nodes.push(
          ...buildExpressionTree(iu.expr, `${basePath}.expr`, level + 1)
        );
      }
      break;
    default:
      break;
  }

  return nodes;
};

// Helper function to check if any child has errors
export const hasNestedErrors = (error: FieldError | undefined): boolean => {
  if (!error) return false;
  if (error.message) return true;
  if (error.type === "invalid_type" || error.type === "custom") return true;

  // Check nested errors
  const errorObj = error as Record<string, unknown>;
  return Object.keys(errorObj).some((key) => {
    if (key === "message" || key === "type" || key === "ref") return false;
    return hasNestedErrors(errorObj[key] as FieldError);
  });
};
