import { Expression, IndexTerm } from "@/lib/editor/expression/core/types";
import {
  parseChildRole,
  DEFAULT_NODE,
  ExprRole,
  ROLE_ALLOWED,
} from "@/lib/editor/expression/core/roles";
import { buildExpressionTree } from "./form-utils";

export function indexExpressions(
  root: Expression,
  basePath: string
): Record<string, Expression> {
  const map: Record<string, Expression> = {};
  for (const node of buildExpressionTree(root, basePath)) {
    map[node.path] = node.expression;
  }
  return map;
}

export function getRoleForPath(
  root: Expression,
  basePath: string,
  targetPath: string
): ExprRole {
  // Root path role: if we're editing a `.condition` root, that node is boolean-only
  if (targetPath === basePath) {
    return basePath.endsWith(".condition") ? "boolean" : "scalar";
  }
  const index = indexExpressions(root, basePath);
  if (!index[targetPath]) return "scalar";

  const parts = targetPath.split(".");
  let parentPath: string | null = null;
  for (let i = parts.length - 1; i > 0; i--) {
    const candidate = parts.slice(0, i).join(".");
    if (index[candidate]) {
      parentPath = candidate;
      break;
    }
  }
  if (!parentPath) return "scalar";
  const parentExpr = index[parentPath];
  const remainder = targetPath.slice(parentPath.length + 1);
  const remainderSegments = remainder.split(".");
  const fieldName = remainderSegments[0];
  const childRole = parseChildRole(
    parentExpr.type as Expression["type"],
    fieldName
  );
  if (!childRole) return "scalar";
  // Specialization: inside a condition subtree, comparison operands should be index terms only
  if (
    basePath.endsWith(".condition") &&
    parentExpr.type === "comparison" &&
    (fieldName === "left" || fieldName === "right")
  ) {
    return "index_term";
  }
  return childRole.role;
}

export function replaceExpressionAtPath(
  root: Expression,
  basePath: string,
  targetPath: string,
  newNode: Expression
): Expression {
  if (targetPath === basePath) return newNode;
  const parts = targetPath.split(".");
  const baseParts = basePath.split(".");
  if (!parts.slice(0, baseParts.length).every((p, i) => p === baseParts[i]))
    return root;

  const mutate = (node: Expression, currentParts: string[]): Expression => {
    const currentPath = currentParts.join(".");
    if (currentPath === targetPath) return newNode;
    const relParts = parts.slice(currentParts.length);
    if (relParts.length === 0) return node;
    const nextKey = relParts[0];
    switch (node.type) {
      case "binary":
      case "comparison": {
        const b = node as Extract<
          Expression,
          { type: "binary" | "comparison" }
        > & { left: Expression; right: Expression };
        if (nextKey === "left" && b.left) {
          return {
            ...b,
            left: mutate(b.left, [...currentParts, "left"]),
          } as Expression;
        }
        if (nextKey === "right" && b.right) {
          return {
            ...b,
            right: mutate(b.right, [...currentParts, "right"]),
          } as Expression;
        }
        return b;
      }
      case "unary": {
        const u = node as Extract<Expression, { type: "unary" }> & {
          expr: Expression;
        };
        if (nextKey === "expr" && u.expr) {
          return {
            ...u,
            expr: mutate(u.expr, [...currentParts, "expr"]),
          } as Expression;
        }
        return u;
      }
      case "aggregate": {
        const a = node as Extract<Expression, { type: "aggregate" }> & {
          condition?: Expression;
          body: Expression;
        };
        if (nextKey === "condition" && a.condition) {
          return {
            ...a,
            condition: mutate(a.condition, [...currentParts, "condition"]),
          } as Expression;
        }
        if (nextKey === "body" && a.body) {
          return {
            ...a,
            body: mutate(a.body, [...currentParts, "body"]),
          } as Expression;
        }
        return a;
      }
      case "var":
      case "param": {
        const vp = node as Extract<Expression, { type: "var" | "param" }> & {
          indices?: Expression[];
        };
        if (nextKey === "indices" && vp.indices) {
          const rel = relParts[1];
          if (rel !== undefined && /^\d+$/.test(rel)) {
            const i = Number(rel);
            if (!vp.indices[i]) return vp;
            const updated = vp.indices.slice();
            const replaced = mutate(vp.indices[i], [
              ...currentParts,
              "indices",
              String(i),
            ]);
            // Only assign if resulting node is still a valid index_term type
            if (ROLE_ALLOWED.index_term.includes(replaced.type)) {
              updated[i] = replaced as IndexTerm; // safe by role filter (IndexTerm subset)
            } else {
              // If invalid, keep original (or could coerce to default index)
              updated[i] = vp.indices[i];
            }
            return { ...vp, indices: updated } as Expression;
          }
        }
        return vp;
      }
      case "index_binary": {
        const ib = node as Extract<Expression, { type: "index_binary" }> & {
          left: Expression;
          right: Expression;
        };
        if (nextKey === "left" && ib.left) {
          return {
            ...ib,
            left: mutate(ib.left, [...currentParts, "left"]),
          } as Expression;
        }
        if (nextKey === "right" && ib.right) {
          return {
            ...ib,
            right: mutate(ib.right, [...currentParts, "right"]),
          } as Expression;
        }
        return ib;
      }
      case "index_unary": {
        const iu = node as Extract<Expression, { type: "index_unary" }> & {
          expr: Expression;
        };
        if (nextKey === "expr" && iu.expr) {
          return {
            ...iu,
            expr: mutate(iu.expr, [...currentParts, "expr"]),
          } as Expression;
        }
        return iu;
      }
      default:
        return node;
    }
  };
  return mutate(root, baseParts);
}

export function cloneDefaultExpression(type: Expression["type"]): Expression {
  return structuredClone(DEFAULT_NODE[type]);
}
