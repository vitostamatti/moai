import {
  // Schemas
  numberExprSchema,
  stringExprSchema,
  indexVariableExprSchema,
  variableExprSchema,
  expressionSchema,

  // Helper functions
  createNumberExpr,
  createStringExpr,
  createIndexVariableExpr,
  createVariableExpr,
  createParameterExpr,
  createUnaryOpExpr,
  createBinaryOpExpr,
  createAggregationExpr,
  createIndexBinding,
  createComparisonExpr,
  createIndexComparisonExpr,
} from "../schemas";

describe("Basic Expression Schemas", () => {
  describe("NumberExpr", () => {
    it("should validate a valid number expression", () => {
      const validNumberExpr = { type: "number" as const, value: 42 };
      expect(() => numberExprSchema.parse(validNumberExpr)).not.toThrow();

      const result = numberExprSchema.parse(validNumberExpr);
      expect(result).toEqual(validNumberExpr);
    });

    it("should reject invalid number expressions", () => {
      expect(() =>
        numberExprSchema.parse({ type: "number", value: "not-a-number" })
      ).toThrow();
      expect(() =>
        numberExprSchema.parse({ type: "string", value: 42 })
      ).toThrow();
      expect(() => numberExprSchema.parse({ value: 42 })).toThrow(); // missing type
    });

    it("should work with createNumberExpr helper", () => {
      const expr = createNumberExpr(3.14);
      expect(expr.type).toBe("number");
      expect(expr.value).toBe(3.14);
    });
  });

  describe("StringExpr", () => {
    it("should validate a valid string expression", () => {
      const validStringExpr = { type: "string" as const, value: "hello" };
      expect(() => stringExprSchema.parse(validStringExpr)).not.toThrow();

      const result = stringExprSchema.parse(validStringExpr);
      expect(result).toEqual(validStringExpr);
    });

    it("should reject invalid string expressions", () => {
      expect(() =>
        stringExprSchema.parse({ type: "string", value: 42 })
      ).toThrow();
      expect(() =>
        stringExprSchema.parse({ type: "number", value: "hello" })
      ).toThrow();
    });

    it("should work with createStringExpr helper", () => {
      const expr = createStringExpr("test");
      expect(expr.type).toBe("string");
      expect(expr.value).toBe("test");
    });
  });

  describe("IndexVariableExpr", () => {
    it("should validate a valid index variable expression", () => {
      const validIndexVarExpr = { type: "index_variable" as const, name: "i" };
      expect(() =>
        indexVariableExprSchema.parse(validIndexVarExpr)
      ).not.toThrow();

      const result = indexVariableExprSchema.parse(validIndexVarExpr);
      expect(result).toEqual(validIndexVarExpr);
    });

    it("should reject invalid index variable expressions", () => {
      expect(() =>
        indexVariableExprSchema.parse({ type: "index_variable", name: 123 })
      ).toThrow();
      expect(() =>
        indexVariableExprSchema.parse({ type: "variable", name: "i" })
      ).toThrow();
    });

    it("should work with createIndexVariableExpr helper", () => {
      const expr = createIndexVariableExpr("j");
      expect(expr.type).toBe("index_variable");
      expect(expr.name).toBe("j");
    });
  });
});

describe("Complex Expression Schemas", () => {
  describe("VariableExpr", () => {
    it("should validate a variable without indices", () => {
      const simpleVar = { type: "variable" as const, name: "x" };
      expect(() => variableExprSchema.parse(simpleVar)).not.toThrow();
    });

    it("should validate a variable with indices", () => {
      const indexedVar = {
        type: "variable" as const,
        name: "x",
        index_expr: [
          { type: "index_variable" as const, name: "i" },
          { type: "number" as const, value: 5 },
        ],
      };
      expect(() => variableExprSchema.parse(indexedVar)).not.toThrow();
    });

    it("should work with createVariableExpr helper", () => {
      const indexVar = createIndexVariableExpr("i");
      const numExpr = createNumberExpr(5);

      const expr = createVariableExpr("x", [indexVar, numExpr]);
      expect(expr.type).toBe("variable");
      expect(expr.name).toBe("x");
      expect(expr.index_expr).toHaveLength(2);
    });
  });

  describe("BinaryOpExpr", () => {
    it("should validate binary operations", () => {
      const left = createNumberExpr(5);
      const right = createNumberExpr(3);

      const addExpr = createBinaryOpExpr("add", left, right);
      expect(addExpr.type).toBe("binary_op");
      expect(addExpr.op).toBe("add");
      expect(addExpr.left).toEqual(left);
      expect(addExpr.right).toEqual(right);
    });

    it("should validate all binary operators", () => {
      const left = createNumberExpr(10);
      const right = createNumberExpr(2);

      const operators = ["add", "sub", "mul", "div"] as const;

      operators.forEach((op) => {
        expect(() => createBinaryOpExpr(op, left, right)).not.toThrow();
      });
    });
  });

  describe("UnaryOpExpr", () => {
    it("should validate unary operations", () => {
      const expr = createNumberExpr(5);
      const negExpr = createUnaryOpExpr("sub", expr);

      expect(negExpr.type).toBe("unary_op");
      expect(negExpr.op).toBe("sub");
      expect(negExpr.expr).toEqual(expr);
    });

    it("should validate all unary operators", () => {
      const expr = createNumberExpr(1);
      const operators = ["sub", "sin", "cos", "tan", "exp", "log"] as const;

      operators.forEach((op) => {
        expect(() => createUnaryOpExpr(op, expr)).not.toThrow();
      });
    });
  });

  describe("AggregationExpr", () => {
    it("should validate aggregation expressions", () => {
      const expr = createVariableExpr("x", [createIndexVariableExpr("i")]);
      const binding = createIndexBinding("i", "I");

      const sumExpr = createAggregationExpr("sum", expr, [binding]);

      expect(sumExpr.type).toBe("aggregation");
      expect(sumExpr.op).toBe("sum");
      expect(sumExpr.expr).toEqual(expr);
      expect(sumExpr.bindings).toHaveLength(1);
      expect(sumExpr.bindings[0]).toEqual(binding);
    });

    it("should validate aggregation with condition", () => {
      const expr = createVariableExpr("x", [createIndexVariableExpr("i")]);
      const binding = createIndexBinding("i", "I");
      const condition = createIndexComparisonExpr(
        "le",
        createIndexVariableExpr("i"),
        createNumberExpr(10)
      );

      const sumExpr = createAggregationExpr("sum", expr, [binding], condition);

      expect(sumExpr.condition).toEqual(condition);
    });

    it("should validate all aggregation operators", () => {
      const expr = createNumberExpr(1);
      const binding = createIndexBinding("i", "I");
      const operators = ["sum", "prod", "min", "max"] as const;

      operators.forEach((op) => {
        expect(() => createAggregationExpr(op, expr, [binding])).not.toThrow();
      });
    });
  });
});

describe("Comparison Expressions", () => {
  describe("ComparisonExpr", () => {
    it("should validate comparison expressions", () => {
      const left = createNumberExpr(5);
      const right = createNumberExpr(10);

      const compExpr = createComparisonExpr("le", left, right);

      expect(compExpr.type).toBe("comparison");
      expect(compExpr.op).toBe("le");
      expect(compExpr.left).toEqual(left);
      expect(compExpr.right).toEqual(right);
    });

    it("should validate all comparison operators", () => {
      const left = createNumberExpr(5);
      const right = createNumberExpr(10);
      const operators = ["le", "lt", "eq", "gt", "ge", "ne"] as const;

      operators.forEach((op) => {
        expect(() => createComparisonExpr(op, left, right)).not.toThrow();
      });
    });
  });

  describe("IndexComparisonExpr", () => {
    it("should validate index comparison expressions", () => {
      const left = createIndexVariableExpr("i");
      const right = createNumberExpr(5);

      const compExpr = createIndexComparisonExpr("lt", left, right);

      expect(compExpr.type).toBe("index_comparison");
      expect(compExpr.op).toBe("lt");
      expect(compExpr.left).toEqual(left);
      expect(compExpr.right).toEqual(right);
    });
  });
});

describe("Helper Functions", () => {
  describe("IndexBinding", () => {
    it("should create valid index bindings", () => {
      const binding = createIndexBinding("i", "I");

      expect(binding.type).toBe("index_binding");
      expect(binding.index_var).toBe("i");
      expect(binding.set_name).toBe("I");
    });
  });
});

describe("Schema Integration", () => {
  it("should validate complex nested expressions", () => {
    // Create: sum(x[i] + cost[i] for i in I where i <= 10)
    const indexVar = createIndexVariableExpr("i");
    const variable = createVariableExpr("x", [indexVar]);
    const parameter = createParameterExpr("cost", [indexVar]);
    const addition = createBinaryOpExpr("add", variable, parameter);
    const binding = createIndexBinding("i", "I");
    const condition = createIndexComparisonExpr(
      "le",
      indexVar,
      createNumberExpr(10)
    );
    const aggregation = createAggregationExpr(
      "sum",
      addition,
      [binding],
      condition
    );

    expect(() => expressionSchema.parse(aggregation)).not.toThrow();
    expect(aggregation.type).toBe("aggregation");
    expect(aggregation.op).toBe("sum");
    expect(aggregation.condition).toBeDefined();
  });

  it("should handle deeply nested expressions", () => {
    // Create: -(x[i] * 2)
    const indexVar = createIndexVariableExpr("i");
    const variable = createVariableExpr("x", [indexVar]);
    const constant = createNumberExpr(2);
    const multiplication = createBinaryOpExpr("mul", variable, constant);
    const negation = createUnaryOpExpr("sub", multiplication);

    expect(() => expressionSchema.parse(negation)).not.toThrow();
    expect(negation.type).toBe("unary_op");
    expect(negation.op).toBe("sub");
  });
});
