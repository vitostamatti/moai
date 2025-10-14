export type NumberExpr = {
  type: "number";
  value: number;
};

export type StringExpr = {
  type: "string";
  value: string;
};

export type IndexVariableExpr = {
  type: "index_variable";
  name: string;
};

export type VariableExpr = {
  type: "variable";
  name: string;
  index_expr?: IndexExprType[] | null;
};

export type ParameterExpr = {
  type: "parameter";
  name: string;
  index_expr?: IndexExprType[] | null;
};

export type UnaryOpType = "sub" | "sin" | "cos" | "tan" | "exp" | "log";

export type UnaryOpExpr = {
  type: "unary_op";
  op: UnaryOpType;
  expr: Expression;
};

export type BinaryOpType = "add" | "sub" | "mul" | "div";

export type BinaryOpExpr = {
  type: "binary_op";
  op: BinaryOpType;
  left: Expression;
  right: Expression;
};

export type AggOpType = "sum" | "prod" | "min" | "max";

export type IndexBinding = {
  type: "index_binding";
  index_var: string;
  set_name: string;
};

export type AggregationExpr = {
  type: "aggregation";
  op: AggOpType;
  expr: Expression;
  bindings: IndexBinding[];
  condition?: IndexComparisonExpr | null;
};

// IndexExprType includes basic expressions but excludes VariableExpr and ParameterExpr
// to avoid circular dependencies in index expressions
export type IndexExprType =
  | StringExpr
  | NumberExpr
  | IndexVariableExpr
  | BinaryOpExpr
  | UnaryOpExpr;

export type Expression =
  | NumberExpr
  | StringExpr
  | IndexVariableExpr
  | VariableExpr
  | ParameterExpr
  | BinaryOpExpr
  | UnaryOpExpr
  | AggregationExpr;

export type ComparisonOpType = "le" | "lt" | "eq" | "gt" | "ge" | "ne";

export type ComparisonExpr = {
  type: "comparison";
  op: ComparisonOpType;
  left: Expression;
  right: Expression;
};

export type IndexComparisonExpr = {
  type: "index_comparison";
  op: ComparisonOpType;
  left: IndexExprType;
  right: IndexExprType;
};

// main model components
export type Set = {
  name: string;
  elements: string[] | number[];
};

export type ParameterValue = {
  index: (string | number)[];
  value: number;
};

export type Parameter = {
  name: string;
  indices: string[];
  values: ParameterValue[] | number;
};

export type VariableDomain =
  | "Binary"
  | "NonNegativeIntegers"
  | "NonNegativeReals"
  | "Reals"
  | "Integers";

export type Variable = {
  name: string;
  domain: VariableDomain;
  lowerBound?: number;
  upperBound?: number;
  indices: string[];
};

export type Quantifier = {
  index: string;
  over: string;
  condition?: ComparisonExpr | null;
};

export type Constraint = {
  type: "constraint";
  name: string;
  expr: ComparisonExpr;
  quantifiers?: Quantifier[] | null;
};

export type Objective = {
  name: string;
  expr: Expression;
  sense?: "min" | "max";
};

export type Model = {
  sets?: Set[];
  parameters?: Parameter[];
  variables?: Variable[];
  constraints?: Constraint[];
  objective?: Objective;
};
