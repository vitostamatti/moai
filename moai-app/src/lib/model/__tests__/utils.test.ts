import {
  display,
  exprToString,
  comparisonExprToString,
  constraintToString,
  objectiveToString,
  setToString,
  parameterToString,
  variableToString,
  modelToString,
} from "../utils";

import {
  createNumberExpr,
  createStringExpr,
  createIndexVariableExpr,
  createVariableExpr,
  createParameterExpr,
  createBinaryOpExpr,
  createUnaryOpExpr,
  createAggregationExpr,
  createIndexBinding,
  createComparisonExpr,
  createIndexComparisonExpr,
  createConstraint,
  createObjective,
  createQuantifier,
} from "../schemas";

describe("Display Utilities", () => {
  describe("Expression Display", () => {
    it("should display number expressions", () => {
      const expr = createNumberExpr(42);
      expect(exprToString(expr)).toBe("42");
    });

    it("should display string expressions", () => {
      const expr = createStringExpr("hello");
      expect(exprToString(expr)).toBe("hello");
    });

    it("should display index variable expressions", () => {
      const expr = createIndexVariableExpr("i");
      expect(exprToString(expr)).toBe("i");
    });

    it("should display simple variable expressions", () => {
      const expr = createVariableExpr("x");
      expect(exprToString(expr)).toBe("x");
    });

    it("should display indexed variable expressions", () => {
      const expr = createVariableExpr("x", [
        createIndexVariableExpr("i"),
        createIndexVariableExpr("j"),
      ]);
      expect(exprToString(expr)).toBe("x[i, j]");
    });

    it("should display simple parameter expressions", () => {
      const expr = createParameterExpr("cost");
      expect(exprToString(expr)).toBe("cost");
    });

    it("should display indexed parameter expressions", () => {
      const expr = createParameterExpr("cost", [
        createIndexVariableExpr("i"),
        createIndexVariableExpr("j"),
      ]);
      expect(exprToString(expr)).toBe("cost[i, j]");
    });

    it("should display unary operations", () => {
      const expr = createUnaryOpExpr("sub", createNumberExpr(5));
      expect(exprToString(expr)).toBe("(-5)");
    });

    it("should display binary operations", () => {
      const expr = createBinaryOpExpr(
        "add",
        createVariableExpr("x"),
        createNumberExpr(10)
      );
      expect(exprToString(expr)).toBe("(x + 10)");
    });

    it("should display complex nested expressions", () => {
      // (x[i] * 2) + (-5)
      const multiplication = createBinaryOpExpr(
        "mul",
        createVariableExpr("x", [createIndexVariableExpr("i")]),
        createNumberExpr(2)
      );
      const negation = createUnaryOpExpr("sub", createNumberExpr(5));
      const addition = createBinaryOpExpr("add", multiplication, negation);

      expect(exprToString(addition)).toBe("((x[i] * 2) + (-5))");
    });

    it("should display aggregation expressions without conditions", () => {
      const binding = createIndexBinding("i", "I");
      const expr = createAggregationExpr(
        "sum",
        createVariableExpr("x", [createIndexVariableExpr("i")]),
        [binding]
      );
      expect(exprToString(expr)).toBe("sum(x[i] for i in I)");
    });

    it("should display aggregation expressions with conditions", () => {
      const binding = createIndexBinding("i", "I");
      const condition = createIndexComparisonExpr(
        "gt",
        createIndexVariableExpr("i"),
        createNumberExpr(0)
      );
      const expr = createAggregationExpr(
        "sum",
        createVariableExpr("x", [createIndexVariableExpr("i")]),
        [binding],
        condition
      );
      expect(exprToString(expr)).toBe("sum(x[i] for i in I if i > 0)");
    });

    it("should display aggregation with multiple bindings", () => {
      const bindings = [
        createIndexBinding("i", "I"),
        createIndexBinding("j", "J"),
      ];
      const expr = createAggregationExpr(
        "sum",
        createVariableExpr("x", [
          createIndexVariableExpr("i"),
          createIndexVariableExpr("j"),
        ]),
        bindings
      );
      expect(exprToString(expr)).toBe("sum(x[i, j] for i in I, j in J)");
    });
  });

  describe("Comparison Expression Display", () => {
    it("should display simple comparisons", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x"),
        createNumberExpr(100)
      );
      expect(comparisonExprToString(expr)).toBe("x <= 100");
    });

    it("should display complex comparisons", () => {
      const left = createBinaryOpExpr(
        "add",
        createVariableExpr("x"),
        createVariableExpr("y")
      );
      const right = createParameterExpr("capacity");
      const expr = createComparisonExpr("le", left, right);
      expect(comparisonExprToString(expr)).toBe("(x + y) <= capacity");
    });

    it("should display all comparison operators", () => {
      const x = createVariableExpr("x");
      const num = createNumberExpr(10);

      expect(comparisonExprToString(createComparisonExpr("le", x, num))).toBe(
        "x <= 10"
      );
      expect(comparisonExprToString(createComparisonExpr("lt", x, num))).toBe(
        "x < 10"
      );
      expect(comparisonExprToString(createComparisonExpr("eq", x, num))).toBe(
        "x = 10"
      );
      expect(comparisonExprToString(createComparisonExpr("gt", x, num))).toBe(
        "x > 10"
      );
      expect(comparisonExprToString(createComparisonExpr("ge", x, num))).toBe(
        "x >= 10"
      );
      expect(comparisonExprToString(createComparisonExpr("ne", x, num))).toBe(
        "x != 10"
      );
    });
  });

  describe("Constraint Display", () => {
    it("should display constraint without quantifiers", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x"),
        createNumberExpr(100)
      );
      const constraint = createConstraint("capacity_limit", expr);
      expect(constraintToString(constraint)).toBe("x <= 100");
    });

    it("should display constraint with quantifiers", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x", [createIndexVariableExpr("i")]),
        createParameterExpr("capacity", [createIndexVariableExpr("i")])
      );
      const quantifier = createQuantifier("i", "I");
      const constraint = createConstraint("individual_limits", expr, [
        quantifier,
      ]);
      expect(constraintToString(constraint)).toBe(
        "x[i] <= capacity[i], for i in I"
      );
    });

    it("should display constraint with conditional quantifiers", () => {
      const expr = createComparisonExpr(
        "ge",
        createVariableExpr("flow", [createIndexVariableExpr("i")]),
        createNumberExpr(0)
      );
      const condition = createComparisonExpr(
        "gt",
        createParameterExpr("demand", [createIndexVariableExpr("i")]),
        createNumberExpr(0)
      );
      const quantifier = createQuantifier("i", "I", condition);
      const constraint = createConstraint("positive_flow", expr, [quantifier]);
      expect(constraintToString(constraint)).toBe(
        "flow[i] >= 0, for i in I if demand[i] > 0"
      );
    });

    it("should display constraint with multiple quantifiers", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x", [
          createIndexVariableExpr("i"),
          createIndexVariableExpr("j"),
        ]),
        createNumberExpr(1)
      );
      const quantifiers = [
        createQuantifier("i", "I"),
        createQuantifier("j", "J"),
      ];
      const constraint = createConstraint("flow_capacity", expr, quantifiers);
      expect(constraintToString(constraint)).toBe(
        "x[i, j] <= 1, for i in I, for j in J"
      );
    });
  });

  describe("Objective Display", () => {
    it("should display minimization objective", () => {
      const expr = createVariableExpr("total_cost");
      const objective = createObjective("minimize_cost", expr, "min");
      expect(objectiveToString(objective)).toBe("min total_cost");
    });

    it("should display maximization objective", () => {
      const expr = createVariableExpr("profit");
      const objective = createObjective("maximize_profit", expr, "max");
      expect(objectiveToString(objective)).toBe("max profit");
    });

    it("should default to minimization", () => {
      const expr = createVariableExpr("cost");
      const objective = createObjective("default_objective", expr);
      expect(objectiveToString(objective)).toBe("min cost");
    });

    it("should display complex objective expressions", () => {
      // min sum(cost[i,j] * x[i,j] for i in I, j in J)
      const costTimesX = createBinaryOpExpr(
        "mul",
        createParameterExpr("cost", [
          createIndexVariableExpr("i"),
          createIndexVariableExpr("j"),
        ]),
        createVariableExpr("x", [
          createIndexVariableExpr("i"),
          createIndexVariableExpr("j"),
        ])
      );
      const bindings = [
        createIndexBinding("i", "I"),
        createIndexBinding("j", "J"),
      ];
      const sumExpr = createAggregationExpr("sum", costTimesX, bindings);
      const objective = createObjective("minimize_total_cost", sumExpr);

      expect(objectiveToString(objective)).toBe(
        "min sum((cost[i, j] * x[i, j]) for i in I, j in J)"
      );
    });
  });

  describe("Model Component Display", () => {
    it("should display small sets", () => {
      const set = { name: "I", elements: ["a", "b", "c"] };
      expect(setToString(set)).toBe("I = {a, b, c}");
    });

    it("should display large sets with truncation", () => {
      const set = {
        name: "J",
        elements: [
          "item1",
          "item2",
          "item3",
          "item4",
          "item5",
          "item6",
          "item7",
        ],
      };
      expect(setToString(set)).toBe(
        "J = {item1, item2, item3, ..., item7} (7 elements)"
      );
    });

    it("should display numeric sets", () => {
      const set = { name: "T", elements: [1, 2, 3, 4, 5] };
      expect(setToString(set)).toBe("T = {1, 2, 3, 4, 5}");
    });

    it("should display scalar parameters", () => {
      const param = {
        name: "max_capacity",
        indices: [],
        values: 1000,
      };
      expect(parameterToString(param)).toBe("max_capacity = 1000");
    });

    it("should display indexed parameters with few values", () => {
      const param = {
        name: "cost",
        indices: ["i", "j"],
        values: [
          { index: ["a", "x"], value: 10 },
          { index: ["a", "y"], value: 15 },
          { index: ["b", "x"], value: 20 },
        ],
      };
      expect(parameterToString(param)).toBe(
        "cost[a, x] = 10, cost[a, y] = 15, cost[b, x] = 20"
      );
    });

    it("should display indexed parameters with many values", () => {
      const param = {
        name: "distance",
        indices: ["i", "j"],
        values: [
          { index: ["a", "x"], value: 100 },
          { index: ["a", "y"], value: 150 },
          { index: ["b", "x"], value: 200 },
          { index: ["b", "y"], value: 250 },
          { index: ["c", "x"], value: 300 },
        ],
      };
      expect(parameterToString(param)).toBe(
        "distance[a, x] = 100, distance[a, y] = 150, ... (5 values total)"
      );
    });

    it("should display simple variables", () => {
      const variable = {
        name: "x",
        domain: "NonNegativeReals" as const,
        indices: [],
      };
      expect(variableToString(variable)).toBe("x ∈ NonNegativeReals");
    });

    it("should display indexed variables", () => {
      const variable = {
        name: "flow",
        domain: "NonNegativeReals" as const,
        indices: ["i", "j"],
      };
      expect(variableToString(variable)).toBe("flow[i, j] ∈ NonNegativeReals");
    });

    it("should display variables with bounds", () => {
      const variable = {
        name: "production",
        domain: "Reals" as const,
        lowerBound: 10,
        upperBound: 100,
        indices: ["i"],
      };
      expect(variableToString(variable)).toBe(
        "production[i] ∈ Reals ∈ [10, 100]"
      );
    });

    it("should display variables with partial bounds", () => {
      const variableWithLower = {
        name: "x",
        domain: "Reals" as const,
        lowerBound: 0,
        indices: [],
      };
      expect(variableToString(variableWithLower)).toBe("x ∈ Reals ∈ [0, ∞]");

      const variableWithUpper = {
        name: "y",
        domain: "Reals" as const,
        upperBound: 100,
        indices: [],
      };
      expect(variableToString(variableWithUpper)).toBe("y ∈ Reals ∈ [-∞, 100]");
    });
  });

  describe("Complete Model Display", () => {
    it("should display a complete transportation model", () => {
      const model = {
        sets: [
          { name: "I", elements: ["plant1", "plant2"] },
          { name: "J", elements: ["market1", "market2"] },
        ],
        parameters: [
          {
            name: "cost",
            indices: ["i", "j"],
            values: [
              { index: ["plant1", "market1"], value: 10 },
              { index: ["plant1", "market2"], value: 15 },
            ],
          },
        ],
        variables: [
          {
            name: "x",
            domain: "NonNegativeReals" as const,
            indices: ["i", "j"],
          },
        ],
        constraints: [
          createConstraint(
            "supply_limit",
            createComparisonExpr(
              "le",
              createVariableExpr("total_shipped", [
                createIndexVariableExpr("i"),
              ]),
              createParameterExpr("supply", [createIndexVariableExpr("i")])
            ),
            [createQuantifier("i", "I")]
          ),
        ],
        objectives: [
          createObjective(
            "minimize_cost",
            createVariableExpr("total_cost"),
            "min"
          ),
        ],
      };

      const result = modelToString(model);
      expect(result).toContain("Sets:");
      expect(result).toContain("I = {plant1, plant2}");
      expect(result).toContain("Parameters:");
      expect(result).toContain("cost[plant1, market1] = 10");
      expect(result).toContain("Variables:");
      expect(result).toContain("x[i, j] ∈ NonNegativeReals");
      expect(result).toContain("Constraints:");
      expect(result).toContain(
        "supply_limit: total_shipped[i] <= supply[i], for i in I"
      );
      expect(result).toContain("Objectives:");
      expect(result).toContain("minimize_cost: min total_cost");
    });
  });

  describe("Display Object", () => {
    it("should provide all display functions", () => {
      expect(typeof display.expr).toBe("function");
      expect(typeof display.indexExpr).toBe("function");
      expect(typeof display.comparison).toBe("function");
      expect(typeof display.indexComparison).toBe("function");
      expect(typeof display.quantifier).toBe("function");
      expect(typeof display.constraint).toBe("function");
      expect(typeof display.objective).toBe("function");
      expect(typeof display.set).toBe("function");
      expect(typeof display.parameter).toBe("function");
      expect(typeof display.variable).toBe("function");
    });

    it("should work through the display object", () => {
      const expr = createVariableExpr("x");
      expect(display.expr(expr)).toBe("x");

      const set = { name: "I", elements: ["a", "b"] };
      expect(display.set(set)).toBe("I = {a, b}");
    });
  });
});
