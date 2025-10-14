import { MILPModel } from "./model/model-schema";
import {
  Expression,
  ComparisonOperator,
  BinaryOpType,
} from "@/lib/editor/expression/core/types";

// Helper function to create expressions
export const createExpression = {
  number: (value: number): Expression => ({
    type: "number",
    value,
  }),

  variable: (name: string, indices?: string[]): Expression => ({
    type: "var",
    name,
    indices: indices?.map((idx) => ({ type: "index", name: idx })),
  }),

  parameter: (name: string, indices?: string[]): Expression => ({
    type: "param",
    name,
    indices: indices?.map((idx) => ({ type: "index", name: idx })),
  }),

  binary: (
    left: Expression,
    op: BinaryOpType,
    right: Expression
  ): Expression => ({
    type: "binary",
    op,
    left,
    right,
  }),

  sum: (
    indexBinding: Array<{ index: string; over: string }>,
    body: Expression,
    condition?: ComparisonOperator
  ): Expression => ({
    type: "aggregate",
    op: "sum",
    indexBinding,
    body,
    condition,
  }),
};

// Mock data for a Transportation Problem
export const mockTransportationModel: MILPModel = {
  metadata: {
    id: "transport-001",
    name: "Transportation Problem",
    description:
      "A classic transportation optimization problem minimizing shipping costs",
    version: 1,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    author: "Optimization Team",
    tags: ["transportation", "logistics", "cost-minimization"],
  },

  sets: [
    {
      id: "plants",
      name: "Plants",
      description: "Manufacturing plants",
      elements: ["Seattle", "San-Diego"],
    },
    {
      id: "markets",
      name: "Markets",
      description: "Distribution markets",
      elements: ["New-York", "Chicago", "Topeka"],
    },
  ],

  parameters: [
    {
      id: "capacity",
      name: "Capacity",
      description: "Plant production capacity",
      indices: ["Plants"],
      values: [
        { index: ["Seattle"], value: 350 },
        { index: ["San-Diego"], value: 600 },
      ],
    },
    {
      id: "demand",
      name: "Demand",
      description: "Market demand",
      indices: ["Markets"],
      values: [
        { index: ["New-York"], value: 325 },
        { index: ["Chicago"], value: 300 },
        { index: ["Topeka"], value: 275 },
      ],
    },
    {
      id: "cost",
      name: "Cost",
      description: "Transportation cost per unit",
      indices: ["Plants", "Markets"],
      values: [
        { index: ["Seattle", "New-York"], value: 2.5 },
        { index: ["Seattle", "Chicago"], value: 1.7 },
        { index: ["Seattle", "Topeka"], value: 1.8 },
        { index: ["San-Diego", "New-York"], value: 2.5 },
        { index: ["San-Diego", "Chicago"], value: 1.8 },
        { index: ["San-Diego", "Topeka"], value: 1.4 },
      ],
    },
  ],

  variables: [
    {
      id: "shipment",
      name: "x",
      description: "Amount shipped from plant i to market j",
      domain: "NonNegativeReals",
      indices: ["Plants", "Markets"],
    },
  ],

  constraints: [
    {
      id: "supply-constraint",
      name: "Supply Constraint",
      description: "Cannot ship more than plant capacity",
      enabled: true,
      type: "leq",
      quantifiers: {
        bindings: [{ index: "i", over: "Plants" }],
      },
      leftSide: createExpression.sum(
        [{ index: "j", over: "Markets" }],
        createExpression.variable("x", ["i", "j"])
      ),
      rightSide: createExpression.parameter("capacity", ["i"]),
    },
    {
      id: "demand-constraint",
      name: "Demand Constraint",
      description: "Must satisfy market demand",
      enabled: true,
      type: "geq",
      quantifiers: { bindings: [{ index: "j", over: "Markets" }] },
      leftSide: createExpression.sum(
        [{ index: "i", over: "Plants" }],
        createExpression.variable("x", ["i", "j"])
      ),
      rightSide: createExpression.parameter("demand", ["j"]),
    },
  ],

  objective: {
    id: "total-cost",
    name: "Total Transportation Cost",
    description: "Minimize total transportation cost",
    enabled: true,
    type: "minimize",
    expression: createExpression.sum(
      [
        { index: "i", over: "Plants" },
        { index: "j", over: "Markets" },
      ],
      createExpression.binary(
        createExpression.parameter("cost", ["i", "j"]),
        "*",
        createExpression.variable("x", ["i", "j"])
      )
    ),
  },
};

// Mock data for a Production Planning Problem
export const mockProductionModel: MILPModel = {
  metadata: {
    id: "production-001",
    name: "Production Planning",
    description: "Multi-period production planning with inventory",
    version: 1,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25"),
    author: "Production Team",
    tags: ["production", "planning", "inventory"],
  },

  sets: [
    {
      id: "products",
      name: "Products",
      description: "Product types",
      elements: ["ProductA", "ProductB", "ProductC"],
    },
    {
      id: "periods",
      name: "Periods",
      description: "Time periods",
      elements: [1, 2, 3, 4],
    },
  ],

  parameters: [
    {
      id: "demand",
      name: "Demand",
      description: "Product demand per period",
      indices: ["p", "t"],
      values: [
        { index: ["ProductA", "1"], value: 100 },
        { index: ["ProductA", "2"], value: 120 },
        { index: ["ProductA", "3"], value: 150 },
        { index: ["ProductA", "4"], value: 90 },
        { index: ["ProductB", "1"], value: 80 },
        { index: ["ProductB", "2"], value: 100 },
        { index: ["ProductB", "3"], value: 110 },
        { index: ["ProductB", "4"], value: 70 },
        { index: ["ProductC", "1"], value: 60 },
        { index: ["ProductC", "2"], value: 80 },
        { index: ["ProductC", "3"], value: 90 },
        { index: ["ProductC", "4"], value: 50 },
      ],
    },
    {
      id: "production-cost",
      name: "ProductionCost",
      description: "Cost to produce one unit",
      indices: ["p"],
      values: [
        { index: ["ProductA"], value: 10 },
        { index: ["ProductB"], value: 12 },
        { index: ["ProductC"], value: 8 },
      ],
    },
    {
      id: "holding-cost",
      name: "HoldingCost",
      description: "Cost to hold one unit in inventory",
      indices: ["p"],
      values: [
        { index: ["ProductA"], value: 2 },
        { index: ["ProductB"], value: 1.5 },
        { index: ["ProductC"], value: 1 },
      ],
    },
  ],

  variables: [
    {
      id: "production",
      name: "x",
      description: "Amount produced of product p in period t",
      domain: "NonNegativeReals",
      indices: ["p", "t"],
    },
    {
      id: "inventory",
      name: "I",
      description: "Inventory level of product p at end of period t",
      domain: "NonNegativeReals",
      indices: ["p", "t"],
    },
  ],

  constraints: [
    {
      id: "inventory-balance",
      name: "Inventory Balance",
      description: "Inventory balance equation",
      enabled: true,
      type: "eq",
      quantifiers: {
        bindings: [
          { index: "p", over: "Products" },
          { index: "t", over: "Periods" },
        ],
      },
      leftSide: createExpression.variable("I", ["p", "t"]),
      rightSide: createExpression.binary(
        createExpression.binary(
          createExpression.variable("I", ["p", "t-1"]),
          "+",
          createExpression.variable("x", ["p", "t"])
        ),
        "-",
        createExpression.parameter("demand", ["p", "t"])
      ),
    },
  ],

  objective: {
    id: "total-cost",
    name: "Total Cost",
    description: "Minimize total production and holding costs",
    enabled: true,
    type: "minimize",
    expression: createExpression.binary(
      createExpression.sum(
        [
          { index: "p", over: "Products" },
          { index: "t", over: "Periods" },
        ],
        createExpression.binary(
          createExpression.parameter("production-cost", ["p"]),
          "*",
          createExpression.variable("x", ["p", "t"])
        )
      ),
      "+",
      createExpression.sum(
        [
          { index: "p", over: "Products" },
          { index: "t", over: "Periods" },
        ],
        createExpression.binary(
          createExpression.parameter("holding-cost", ["p"]),
          "*",
          createExpression.variable("I", ["p", "t"])
        )
      )
    ),
  },
};

export const mockModels = [mockTransportationModel, mockProductionModel];
