import {
  // Model component schemas
  setSchema,
  parameterSchema,
  parameterValueSchema,
  variableSchema,
  quantifierSchema,
  constraintSchema,
  objectiveSchema,

  // Helper functions
  createNumberExpr,
  createVariableExpr,
  createIndexVariableExpr,
  createComparisonExpr,
  createQuantifier,
  createConstraint,
  createObjective,
  type VariableDomain,
} from "../schemas";

describe("Model Component Schemas", () => {
  describe("Set", () => {
    it("should validate sets with string elements", () => {
      const stringSet = {
        name: "I",
        elements: ["a", "b", "c"],
      };

      expect(() => setSchema.parse(stringSet)).not.toThrow();
      const result = setSchema.parse(stringSet);
      expect(result.name).toBe("I");
      expect(result.elements).toEqual(["a", "b", "c"]);
    });

    it("should validate sets with number elements", () => {
      const numberSet = {
        name: "J",
        elements: [1, 2, 3, 4, 5],
      };

      expect(() => setSchema.parse(numberSet)).not.toThrow();
      const result = setSchema.parse(numberSet);
      expect(result.name).toBe("J");
      expect(result.elements).toEqual([1, 2, 3, 4, 5]);
    });

    it("should reject sets with mixed element types", () => {
      const mixedSet = {
        name: "K",
        elements: ["a", 1, "b", 2], // This should fail
      };

      expect(() => setSchema.parse(mixedSet)).toThrow();
    });

    it("should reject sets without name", () => {
      const invalidSet = {
        elements: ["a", "b", "c"],
      };

      expect(() => setSchema.parse(invalidSet)).toThrow();
    });
  });

  describe("Parameter", () => {
    it("should validate parameter with scalar value", () => {
      const scalarParam = {
        name: "capacity",
        indices: [],
        values: 100,
      };

      expect(() => parameterSchema.parse(scalarParam)).not.toThrow();
      const result = parameterSchema.parse(scalarParam);
      expect(result.name).toBe("capacity");
      expect(result.indices).toEqual([]);
      expect(result.values).toBe(100);
    });

    it("should validate parameter with indexed values", () => {
      const indexedParam = {
        name: "cost",
        indices: ["i", "j"],
        values: [
          { index: ["a", 1], value: 10.5 },
          { index: ["b", 2], value: 15.2 },
          { index: ["c", 3], value: 8.7 },
        ],
      };

      expect(() => parameterSchema.parse(indexedParam)).not.toThrow();
      const result = parameterSchema.parse(indexedParam);
      expect(result.name).toBe("cost");
      expect(result.indices).toEqual(["i", "j"]);
      expect(Array.isArray(result.values)).toBe(true);
      if (Array.isArray(result.values)) {
        expect(result.values).toHaveLength(3);
        expect(result.values[0].index).toEqual(["a", 1]);
        expect(result.values[0].value).toBe(10.5);
      }
    });

    it("should reject invalid parameter values", () => {
      const invalidParam = {
        name: "cost",
        indices: ["i"],
        values: [
          { index: ["a"], value: "not-a-number" }, // Invalid value type
        ],
      };

      expect(() => parameterSchema.parse(invalidParam)).toThrow();
    });
  });

  describe("ParameterValue", () => {
    it("should validate parameter values", () => {
      const paramValue = {
        index: ["i", 1, "j"],
        value: 42.5,
      };

      expect(() => parameterValueSchema.parse(paramValue)).not.toThrow();
      const result = parameterValueSchema.parse(paramValue);
      expect(result.index).toEqual(["i", 1, "j"]);
      expect(result.value).toBe(42.5);
    });

    it("should reject parameter values with invalid types", () => {
      expect(() =>
        parameterValueSchema.parse({
          index: ["i"],
          value: "not-a-number",
        })
      ).toThrow();

      expect(() =>
        parameterValueSchema.parse({
          index: "not-an-array",
          value: 42,
        })
      ).toThrow();
    });
  });

  describe("Variable", () => {
    it("should validate variables with all properties", () => {
      const variable = {
        name: "x",
        domain: "NonNegativeReals" as const,
        lowerBound: 0,
        upperBound: 100,
        indices: ["i", "j"],
      };

      expect(() => variableSchema.parse(variable)).not.toThrow();
      const result = variableSchema.parse(variable);
      expect(result.name).toBe("x");
      expect(result.domain).toBe("NonNegativeReals");
      expect(result.lowerBound).toBe(0);
      expect(result.upperBound).toBe(100);
      expect(result.indices).toEqual(["i", "j"]);
    });

    it("should validate variables with minimal properties", () => {
      const minimalVariable = {
        name: "y",
        domain: "Binary" as const,
        indices: [],
      };

      expect(() => variableSchema.parse(minimalVariable)).not.toThrow();
      const result = variableSchema.parse(minimalVariable);
      expect(result.name).toBe("y");
      expect(result.domain).toBe("Binary");
      expect(result.lowerBound).toBeUndefined();
      expect(result.upperBound).toBeUndefined();
    });

    it("should validate all variable domains", () => {
      const domains: VariableDomain[] = [
        "Binary",
        "NonNegativeIntegers",
        "NonNegativeReals",
        "Reals",
        "Integers",
      ];

      domains.forEach((domain) => {
        const variable = {
          name: "test",
          domain,
          indices: [],
        };

        expect(() => variableSchema.parse(variable)).not.toThrow();
      });
    });

    it("should reject invalid variable domains", () => {
      const invalidVariable = {
        name: "z",
        domain: "InvalidDomain",
        indices: [],
      };

      expect(() => variableSchema.parse(invalidVariable)).toThrow();
    });
  });

  describe("Quantifier", () => {
    it("should validate quantifier without condition", () => {
      const quantifier = {
        index: "i",
        over: "I",
      };

      expect(() => quantifierSchema.parse(quantifier)).not.toThrow();
      const result = quantifierSchema.parse(quantifier);
      expect(result.index).toBe("i");
      expect(result.over).toBe("I");
      expect(result.condition).toBeUndefined();
    });

    it("should validate quantifier with condition", () => {
      const condition = createComparisonExpr(
        "gt",
        createIndexVariableExpr("i"),
        createNumberExpr(0)
      );

      const quantifier = {
        index: "i",
        over: "I",
        condition,
      };

      expect(() => quantifierSchema.parse(quantifier)).not.toThrow();
      const result = quantifierSchema.parse(quantifier);
      expect(result.condition).toEqual(condition);
    });
  });

  describe("Constraint", () => {
    it("should validate constraint without quantifiers", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x"),
        createNumberExpr(10)
      );

      const constraint = {
        type: "constraint" as const,
        name: "capacity_limit",
        expr,
      };

      expect(() => constraintSchema.parse(constraint)).not.toThrow();
      const result = constraintSchema.parse(constraint);
      expect(result.type).toBe("constraint");
      expect(result.name).toBe("capacity_limit");
      expect(result.expr).toEqual(expr);
      expect(result.quantifiers).toBeUndefined();
    });

    it("should validate constraint with quantifiers", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x", [createIndexVariableExpr("i")]),
        createNumberExpr(10)
      );

      const quantifier = {
        index: "i",
        over: "I",
      };

      const constraint = {
        type: "constraint" as const,
        name: "individual_limits",
        expr,
        quantifiers: [quantifier],
      };

      expect(() => constraintSchema.parse(constraint)).not.toThrow();
      const result = constraintSchema.parse(constraint);
      expect(result.type).toBe("constraint");
      expect(result.quantifiers).toHaveLength(1);
      expect(result.quantifiers![0]).toEqual(quantifier);
    });

    it("should validate constraint with conditional quantifiers", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x", [createIndexVariableExpr("i")]),
        createNumberExpr(10)
      );

      const condition = createComparisonExpr(
        "gt",
        createVariableExpr("demand", [createIndexVariableExpr("i")]),
        createNumberExpr(0)
      );

      const quantifier = createQuantifier("i", "I", condition);

      const constraint = createConstraint("conditional_limits", expr, [
        quantifier,
      ]);

      expect(() => constraintSchema.parse(constraint)).not.toThrow();
      const result = constraintSchema.parse(constraint);
      expect(result.quantifiers).toHaveLength(1);
      expect(result.quantifiers![0].condition).toEqual(condition);
    });

    it("should reject constraint without required type field", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x"),
        createNumberExpr(10)
      );

      const invalidConstraint = {
        // Missing type field
        name: "invalid_constraint",
        expr,
      };

      expect(() => constraintSchema.parse(invalidConstraint)).toThrow();
    });
  });

  describe("Objective", () => {
    it("should validate minimization objective", () => {
      const expr = createVariableExpr("total_cost");

      const objective = {
        name: "minimize_cost",
        sense: "min" as const,
        expr,
      };

      expect(() => objectiveSchema.parse(objective)).not.toThrow();
      const result = objectiveSchema.parse(objective);
      expect(result.name).toBe("minimize_cost");
      expect(result.sense).toBe("min");
      expect(result.expr).toEqual(expr);
    });

    it("should validate maximization objective", () => {
      const expr = createVariableExpr("profit");

      const objective = {
        name: "maximize_profit",
        sense: "max" as const,
        expr,
      };

      expect(() => objectiveSchema.parse(objective)).not.toThrow();
      const result = objectiveSchema.parse(objective);
      expect(result.sense).toBe("max");
    });

    it("should default to minimization when sense is not provided", () => {
      const expr = createVariableExpr("total_cost");

      const objective = {
        name: "default_objective",
        expr,
      };

      expect(() => objectiveSchema.parse(objective)).not.toThrow();
      const result = objectiveSchema.parse(objective);
      expect(result.sense).toBe("min"); // Should default to "min"
    });

    it("should validate objective created with helper function", () => {
      const expr = createVariableExpr("profit");
      const objective = createObjective("maximize_profit", expr, "max");

      expect(() => objectiveSchema.parse(objective)).not.toThrow();
      const result = objectiveSchema.parse(objective);
      expect(result.name).toBe("maximize_profit");
      expect(result.sense).toBe("max");
      expect(result.expr).toEqual(expr);
    });

    it("should validate objective with default sense using helper", () => {
      const expr = createVariableExpr("cost");
      const objective = createObjective("minimize_cost", expr);

      expect(() => objectiveSchema.parse(objective)).not.toThrow();
      const result = objectiveSchema.parse(objective);
      expect(result.sense).toBe("min"); // Should use default
    });

    it("should reject invalid objective sense", () => {
      const expr = createVariableExpr("value");

      const invalidObjective = {
        name: "invalid_objective",
        sense: "maximize", // Should be 'max'
        expr,
      };

      expect(() => objectiveSchema.parse(invalidObjective)).toThrow();
    });
  });
});

describe("Helper Function Tests", () => {
  describe("createQuantifier", () => {
    it("should create quantifier without condition", () => {
      const quantifier = createQuantifier("i", "I");

      expect(quantifier.index).toBe("i");
      expect(quantifier.over).toBe("I");
      expect(quantifier.condition).toBeUndefined();
    });

    it("should create quantifier with condition", () => {
      const condition = createComparisonExpr(
        "gt",
        createVariableExpr("demand", [createIndexVariableExpr("i")]),
        createNumberExpr(0)
      );
      const quantifier = createQuantifier("i", "I", condition);

      expect(quantifier.condition).toEqual(condition);
    });

    it("should create quantifier with null condition", () => {
      const quantifier = createQuantifier("i", "I", null);

      expect(quantifier.condition).toBeNull();
    });
  });

  describe("createConstraint", () => {
    it("should create constraint matching Python Constraint.create", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("x"),
        createNumberExpr(100)
      );

      const constraint = createConstraint("capacity", expr);

      expect(constraint.type).toBe("constraint");
      expect(constraint.name).toBe("capacity");
      expect(constraint.expr).toEqual(expr);
      expect(constraint.quantifiers).toBeUndefined();
    });

    it("should create constraint with quantifiers", () => {
      const expr = createComparisonExpr(
        "eq",
        createVariableExpr("sum_x", [createIndexVariableExpr("j")]),
        createVariableExpr("supply", [createIndexVariableExpr("i")])
      );

      const quantifiers = [createQuantifier("i", "I")];
      const constraint = createConstraint("supply_balance", expr, quantifiers);

      expect(constraint.quantifiers).toEqual(quantifiers);
    });

    it("should create constraint with null quantifiers", () => {
      const expr = createComparisonExpr(
        "le",
        createVariableExpr("total"),
        createNumberExpr(1000)
      );

      const constraint = createConstraint("total_limit", expr, null);

      expect(constraint.quantifiers).toBeNull();
    });
  });

  describe("createObjective", () => {
    it("should create objective matching Python factory method", () => {
      const expr = createVariableExpr("total_cost");
      const objective = createObjective("min_cost", expr);

      expect(objective.name).toBe("min_cost");
      expect(objective.expr).toEqual(expr);
      expect(objective.sense).toBe("min"); // Should default to min
    });

    it("should create maximization objective", () => {
      const expr = createVariableExpr("profit");
      const objective = createObjective("max_profit", expr, "max");

      expect(objective.sense).toBe("max");
    });

    it("should create minimization objective explicitly", () => {
      const expr = createVariableExpr("cost");
      const objective = createObjective("min_cost", expr, "min");

      expect(objective.sense).toBe("min");
    });
  });
});

describe("Advanced Constraint and Objective Tests", () => {
  describe("Complex Constraint Scenarios", () => {
    it("should validate constraint with nested expressions", () => {
      // Create: sum(x[i,j] for j in J) <= supply[i] for i in I
      const sumExpr = createVariableExpr("sum_shipment", [
        createIndexVariableExpr("i"),
      ]);
      const supplyExpr = createVariableExpr("supply", [
        createIndexVariableExpr("i"),
      ]);
      const expr = createComparisonExpr("le", sumExpr, supplyExpr);

      const quantifier = createQuantifier("i", "I");
      const constraint = createConstraint("supply_constraint", expr, [
        quantifier,
      ]);

      expect(() => constraintSchema.parse(constraint)).not.toThrow();
      const result = constraintSchema.parse(constraint);
      expect(result.type).toBe("constraint");
      expect(result.quantifiers).toHaveLength(1);
    });

    it("should validate constraint with multiple quantifiers", () => {
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

      const constraint = createConstraint("flow_limit", expr, quantifiers);

      expect(() => constraintSchema.parse(constraint)).not.toThrow();
      const result = constraintSchema.parse(constraint);
      expect(result.quantifiers).toHaveLength(2);
    });

    it("should validate constraint with conditional quantifiers", () => {
      const condition = createComparisonExpr(
        "gt",
        createVariableExpr("demand", [createIndexVariableExpr("j")]),
        createNumberExpr(0)
      );

      const expr = createComparisonExpr(
        "ge",
        createVariableExpr("x", [
          createIndexVariableExpr("i"),
          createIndexVariableExpr("j"),
        ]),
        createNumberExpr(0)
      );

      const quantifier = createQuantifier("j", "J", condition);
      const constraint = createConstraint("positive_demand_constraint", expr, [
        quantifier,
      ]);

      expect(() => constraintSchema.parse(constraint)).not.toThrow();
      const result = constraintSchema.parse(constraint);
      expect(result.quantifiers![0].condition).toEqual(condition);
    });
  });

  describe("Complex Objective Scenarios", () => {
    it("should validate objective with complex expression", () => {
      // Create objective with binary operation: minimize cost + penalty
      const costExpr = createVariableExpr("total_cost");
      const penaltyExpr = createVariableExpr("penalty");
      const sumExpr = {
        type: "binary_op" as const,
        op: "add" as const,
        left: costExpr,
        right: penaltyExpr,
      };

      const objective = createObjective("minimize_total", sumExpr);

      expect(() => objectiveSchema.parse(objective)).not.toThrow();
      const result = objectiveSchema.parse(objective);
      expect(result.expr).toEqual(sumExpr);
    });

    it("should validate objective with aggregation expression", () => {
      // Create: minimize sum(cost[i] * x[i] for i in I)
      const costTimesX = {
        type: "binary_op" as const,
        op: "mul" as const,
        left: createVariableExpr("cost", [createIndexVariableExpr("i")]),
        right: createVariableExpr("x", [createIndexVariableExpr("i")]),
      };

      const binding = {
        type: "index_binding" as const,
        index_var: "i",
        set_name: "I",
      };

      const sumExpr = {
        type: "aggregation" as const,
        op: "sum" as const,
        expr: costTimesX,
        bindings: [binding],
      };

      const objective = createObjective("minimize_total_cost", sumExpr);

      expect(() => objectiveSchema.parse(objective)).not.toThrow();
      const result = objectiveSchema.parse(objective);
      expect(result.name).toBe("minimize_total_cost");
    });
  });
});

describe("Model Integration Tests", () => {
  it("should validate a complete optimization model", () => {
    // Create a simple transportation problem model components

    // Sets
    const plants = { name: "I", elements: ["plant1", "plant2"] };
    const markets = { name: "J", elements: ["market1", "market2", "market3"] };

    // Parameters
    const supply = {
      name: "supply",
      indices: ["i"],
      values: [
        { index: ["plant1"], value: 100 },
        { index: ["plant2"], value: 150 },
      ],
    };

    const demand = {
      name: "demand",
      indices: ["j"],
      values: [
        { index: ["market1"], value: 80 },
        { index: ["market2"], value: 70 },
        { index: ["market3"], value: 90 },
      ],
    };

    // Variables
    const shipment = {
      name: "x",
      domain: "NonNegativeReals" as const,
      indices: ["i", "j"],
    };

    // All components should validate successfully
    expect(() => setSchema.parse(plants)).not.toThrow();
    expect(() => setSchema.parse(markets)).not.toThrow();
    expect(() => parameterSchema.parse(supply)).not.toThrow();
    expect(() => parameterSchema.parse(demand)).not.toThrow();
    expect(() => variableSchema.parse(shipment)).not.toThrow();
  });

  it("should validate complete transportation problem with constraints and objective", () => {
    // Sets
    const plants = setSchema.parse({
      name: "I",
      elements: ["plant1", "plant2"],
    });
    const markets = setSchema.parse({
      name: "J",
      elements: ["market1", "market2"],
    });

    // Variables
    const shipment = variableSchema.parse({
      name: "x",
      domain: "NonNegativeReals",
      indices: ["i", "j"],
    });

    // Supply constraint: sum(x[i,j] for j in J) <= supply[i] for i in I
    const supplyExpr = createComparisonExpr(
      "le",
      createVariableExpr("total_shipped", [createIndexVariableExpr("i")]),
      createVariableExpr("supply", [createIndexVariableExpr("i")])
    );
    const supplyQuantifier = createQuantifier("i", "I");
    const supplyConstraint = createConstraint("supply_limit", supplyExpr, [
      supplyQuantifier,
    ]);

    // Demand constraint: sum(x[i,j] for i in I) >= demand[j] for j in J
    const demandExpr = createComparisonExpr(
      "ge",
      createVariableExpr("total_received", [createIndexVariableExpr("j")]),
      createVariableExpr("demand", [createIndexVariableExpr("j")])
    );
    const demandQuantifier = createQuantifier("j", "J");
    const demandConstraint = createConstraint(
      "demand_satisfaction",
      demandExpr,
      [demandQuantifier]
    );

    // Objective: minimize total transportation cost
    const costExpr = createVariableExpr("total_cost");
    const objective = createObjective("minimize_cost", costExpr, "min");

    // Validate all components
    expect(() => constraintSchema.parse(supplyConstraint)).not.toThrow();
    expect(() => constraintSchema.parse(demandConstraint)).not.toThrow();
    expect(() => objectiveSchema.parse(objective)).not.toThrow();

    // Verify structure
    const validatedSupplyConstraint = constraintSchema.parse(supplyConstraint);
    expect(validatedSupplyConstraint.type).toBe("constraint");
    expect(validatedSupplyConstraint.quantifiers).toHaveLength(1);

    const validatedObjective = objectiveSchema.parse(objective);
    expect(validatedObjective.sense).toBe("min");
    expect(validatedObjective.name).toBe("minimize_cost");
  });

  it("should validate complex multi-objective optimization model", () => {
    // Create multiple objectives (as you might have in practice)
    const costObjective = createObjective(
      "minimize_cost",
      createVariableExpr("total_cost"),
      "min"
    );

    const timeObjective = createObjective(
      "minimize_time",
      createVariableExpr("total_time"),
      "min"
    );

    const profitObjective = createObjective(
      "maximize_profit",
      createVariableExpr("total_profit"),
      "max"
    );

    // All should validate
    expect(() => objectiveSchema.parse(costObjective)).not.toThrow();
    expect(() => objectiveSchema.parse(timeObjective)).not.toThrow();
    expect(() => objectiveSchema.parse(profitObjective)).not.toThrow();

    // Verify they have correct senses
    expect(objectiveSchema.parse(costObjective).sense).toBe("min");
    expect(objectiveSchema.parse(timeObjective).sense).toBe("min");
    expect(objectiveSchema.parse(profitObjective).sense).toBe("max");
  });
});
