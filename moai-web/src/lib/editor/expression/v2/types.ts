// // ---------- Index Terms (restricted grammar) ----------

// export type IndexVar = { type: "index"; name: string };

// export type NumberLiteral = { type: "number"; value: number };

// export type IndexUnary = {
//   type: "index_unary";
//   op: "-";
//   expr: IndexExpr;
// };

// export type IndexBinary = {
//   type: "index_binary";
//   op: "+" | "-";
//   left: IndexExpr;
//   right: IndexExpr;
// };

// export type IndexExpr = NumberLiteral | IndexVar | IndexUnary | IndexBinary;

// // ---------- Core Expression Nodes ----------
// export type VarRef = {
//   type: "var";
//   name: string;
//   indices?: IndexExpr[];
// };
// export type ParamRef = {
//   type: "param";
//   name: string;
//   indices?: IndexExpr[];
// };

// export type BinaryExpr = {
//   type: "binary";
//   op: "+" | "-" | "*" | "/" | "^";
//   left: Expression;
//   right: Expression;
// };

// export type UnaryExpr = {
//   type: "unary";
//   op: "-" | "abs" | "sin" | "cos" | "tan" | "exp" | "log" | "sqrt";
//   expr: Expression;
// };

// export type IndexBinding = {
//   index: string; // index variable symbol
//   over: string; // set name
// };

// export type AggregateExpr = {
//   type: "aggregate";
//   op: "sum" | "min" | "max"; // (add "prod" later if you handle nonlinearity)
//   indices: IndexBinding[];
//   body: Expression;
//   where?: Expression; // optional filter
// };

// export type ComparisonExpr = {
//   type: "comparison";
//   op: "=" | "!=" | "<" | "<=" | ">" | ">=";
//   left: Expression;
//   right: Expression;
// };

// // Main arithmetic (non-boolean) expression union
// export type Expression =
//   | NumberLiteral
//   | VarRef
//   | IndexVar
//   | ParamRef
//   | BinaryExpr
//   | UnaryExpr
//   | AggregateExpr
//   | ComparisonExpr;

// // Constraint wrapper (preferred external structure)
// export type Constraint = {
//   type: "constraint";
//   left: Expression;
//   op: ComparisonExpr["op"];
//   right: Expression;
// };

// export type Objective = {
//   type: "objective";
//   expr: Expression;
//   sense: "min" | "max";
// };
