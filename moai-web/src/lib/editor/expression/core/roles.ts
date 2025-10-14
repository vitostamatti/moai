// Central role & metadata configuration for expression editing.
// Roles constrain which expression node types are valid at a given tree position.

import type { Expression } from "./types";

export type ExprType = Expression["type"];
export type ExprRole = "scalar" | "boolean" | "index_term";

export const ROLE_ALLOWED: Record<ExprRole, ExprType[]> = {
  scalar: [
    "index",
    "number",
    "string",
    "var",
    "param",
    "binary",
    "unary",
    "aggregate",
  ],
  boolean: ["comparison"],
  index_term: ["number", "string", "index", "index_binary", "index_unary"],
};

export interface ChildRoleSpec {
  [childField: string]: ExprRole | `${ExprRole}[]` | undefined;
}

export const CHILD_ROLES: Record<ExprType, ChildRoleSpec> = {
  number: {},
  string: {},
  index: {},
  var: { indices: "index_term[]" },
  param: { indices: "index_term[]" },
  binary: { left: "scalar", right: "scalar" },
  comparison: { left: "index_term", right: "index_term" },
  unary: { expr: "scalar" },
  aggregate: { body: "scalar", condition: "boolean" },
  index_binary: { left: "index_term", right: "index_term" },
  index_unary: { expr: "index_term" },
};

export function parseChildRole(
  parentType: ExprType,
  field: string
): { role: ExprRole; isArray: boolean } | null {
  const spec = CHILD_ROLES[parentType]?.[field];
  if (!spec) return null;
  const isArray = spec.endsWith("[]");
  return { role: (spec.replace("[]", "") as ExprRole) ?? "scalar", isArray };
}

export const DEFAULT_NODE: Record<ExprType, Expression> = {
  number: { type: "number", value: 0 },
  string: { type: "string", value: "" },
  index: { type: "index", name: "i" },
  var: { type: "var", name: "x", indices: [] },
  param: { type: "param", name: "p", indices: [] },
  binary: {
    type: "binary",
    op: "+",
    left: { type: "number", value: 0 },
    right: { type: "number", value: 0 },
  },
  comparison: {
    type: "comparison",
    op: "=",
    left: { type: "number", value: 0 },
    right: { type: "number", value: 0 },
  },
  unary: { type: "unary", op: "-", expr: { type: "number", value: 0 } },
  aggregate: {
    type: "aggregate",
    op: "sum",
    indexBinding: [{ index: "i", over: "Set" }],
    body: { type: "number", value: 0 },
  },
  index_binary: {
    type: "index_binary",
    op: "+",
    left: { type: "index", name: "i" },
    right: { type: "number", value: 0 },
  },
  index_unary: {
    type: "index_unary",
    op: "-",
    expr: { type: "index", name: "i" },
  },
};

export function defaultNodeForRole(role: ExprRole): Expression {
  const first = ROLE_ALLOWED[role][0];
  return structuredClone(DEFAULT_NODE[first]);
}

export function isTypeAllowedForRole(type: ExprType, role: ExprRole): boolean {
  return ROLE_ALLOWED[role].includes(type);
}
