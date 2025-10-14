"""
Production Planning Problem

A manufacturing company produces multiple products over several time periods.
This example showcases MOAI's advanced indexing with multi-dimensional variables!

Sets:
    - PRODUCTS: Set of products to manufacture (ProductA, ProductB)
    - PERIODS: Set of time periods (1, 2, 3)

Parameters (indexed):
    - demand[p, t]: Demand for product p in period t
    - prod_cost[p]: Production cost per unit of product p
    - hold_cost[p]: Inventory holding cost per unit per period for product p
    - capacity[p]: Production capacity per period for product p
    - initial_inv[p]: Initial inventory for product p

Decision Variables (indexed):
    - produce[p, t]: Amount of product p to produce in period t (>= 0)
    - inventory[p, t]: Inventory of product p at end of period t (>= 0)

Objective:
    Minimize total production costs + inventory holding costs

Constraints:
    - Capacity: produce[p,t] <= capacity[p] for all p, t
    - Balance Period 1: inventory[p,1] = initial_inv[p] + produce[p,1] - demand[p,1]
    - Balance Period t>1: inventory[p,t] = inventory[p,t-1] + produce[p,t] - demand[p,t]
"""

import pyomo.environ as pyo

from moai.builders import binop, eq, index_var, le, num, param, var
from moai.constraints import Constraint, Quantifier
from moai.expressions import AggregationExpression, IndexBinding
from moai.model import Model
from moai.objectives import Objective
from moai.parameters import IndexElement, Parameter
from moai.sets import Set
from moai.variables import Variable

# Define the sets
products = ["ProductA", "ProductB"]
periods = [1, 2, 3]

# Define demand (2D indexed: product x period)
demand_values = [
    # Product A
    IndexElement(index=["ProductA", 1], value=100.0),
    IndexElement(index=["ProductA", 2], value=150.0),
    IndexElement(index=["ProductA", 3], value=120.0),
    # Product B
    IndexElement(index=["ProductB", 1], value=80.0),
    IndexElement(index=["ProductB", 2], value=90.0),
    IndexElement(index=["ProductB", 3], value=110.0),
]

# Define production costs (1D indexed: by product)
prod_cost_values = [
    IndexElement(index=["ProductA"], value=10.0),
    IndexElement(index=["ProductB"], value=15.0),
]

# Define holding costs (1D indexed: by product)
hold_cost_values = [
    IndexElement(index=["ProductA"], value=1.0),
    IndexElement(index=["ProductB"], value=2.0),
]

# Define production capacities (1D indexed: by product)
capacity_values = [
    IndexElement(index=["ProductA"], value=200.0),
    IndexElement(index=["ProductB"], value=150.0),
]

# Define initial inventory (1D indexed: by product)
initial_inv_values = [
    IndexElement(index=["ProductA"], value=50.0),
    IndexElement(index=["ProductB"], value=30.0),
]

# Build the model
model = Model(name="ProductionPlanning")

# Add sets
model.add_set(Set.create(name="PRODUCTS", elements=products))
model.add_set(Set.create(name="PERIODS", elements=periods))

# Add indexed parameters
model.add_parameter(
    Parameter.create(
        name="demand", values=demand_values, indices=["PRODUCTS", "PERIODS"]
    )
)
model.add_parameter(
    Parameter.create(name="prod_cost", values=prod_cost_values, indices=["PRODUCTS"])
)
model.add_parameter(
    Parameter.create(name="hold_cost", values=hold_cost_values, indices=["PRODUCTS"])
)
model.add_parameter(
    Parameter.create(name="capacity", values=capacity_values, indices=["PRODUCTS"])
)
model.add_parameter(
    Parameter.create(
        name="initial_inv", values=initial_inv_values, indices=["PRODUCTS"]
    )
)

# Add indexed variables - THIS IS THE KEY FEATURE!
# Instead of creating 6 variables manually, we create indexed arrays
model.add_variable(
    Variable.create(
        name="produce",
        domain="NonNegativeReals",
        indices=[
            "PRODUCTS",
            "PERIODS",
        ],  # 2D indexed: 2 products × 3 periods = 6 variables
    )
)

model.add_variable(
    Variable.create(
        name="inventory",
        domain="NonNegativeReals",
        indices=[
            "PRODUCTS",
            "PERIODS",
        ],  # 2D indexed: 2 products × 3 periods = 6 variables
    )
)

# Define index variables
p = index_var("p")
t = index_var("t")

# Add production capacity constraints using quantifiers
# For all products p and periods t: produce[p,t] <= capacity[p]
model.add_constraint(
    Constraint.create(
        name="capacity_limit",
        expr=le(
            left=var("produce", [p, t]),  # produce[p, t]
            right=param("capacity", [p]),  # capacity[p]
        ),
        quantifiers=[
            Quantifier.create(index="p", over="PRODUCTS"),
            Quantifier.create(index="t", over="PERIODS"),
        ],
    )
)

# Add inventory balance constraints
# For period 1: inventory[p,1] = initial_inv[p] + produce[p,1] - demand[p,1]
# For later periods: inventory[p,t] = inventory[p,t-1] + produce[p,t] - demand[p,t]

# Period 1 balance
model.add_constraint(
    Constraint.create(
        name="balance_1",
        expr=eq(
            left=var("inventory", [p, num(1)]),
            right=binop(
                left=binop(
                    left=param("initial_inv", [p]),
                    op="add",
                    right=var("produce", [p, num(1)]),
                ),
                op="sub",
                right=param("demand", [p, num(1)]),
            ),
        ),
        quantifiers=[Quantifier.create(index="p", over="PRODUCTS")],
    )
)

# Period 2 balance
model.add_constraint(
    Constraint.create(
        name="balance_2",
        expr=eq(
            left=var("inventory", [p, num(2)]),
            right=binop(
                left=binop(
                    left=var("inventory", [p, num(1)]),
                    op="add",
                    right=var("produce", [p, num(2)]),
                ),
                op="sub",
                right=param("demand", [p, num(2)]),
            ),
        ),
        quantifiers=[Quantifier.create(index="p", over="PRODUCTS")],
    )
)

# Period 3 balance
model.add_constraint(
    Constraint.create(
        name="balance_3",
        expr=eq(
            left=var("inventory", [p, num(3)]),
            right=binop(
                left=binop(
                    left=var("inventory", [p, num(2)]),
                    op="add",
                    right=var("produce", [p, num(3)]),
                ),
                op="sub",
                right=param("demand", [p, num(3)]),
            ),
        ),
        quantifiers=[Quantifier.create(index="p", over="PRODUCTS")],
    )
)

# Set objective: minimize total costs (production + holding)
# sum(prod_cost[p] * produce[p,t] for p,t) + sum(hold_cost[p] * inventory[p,t] for p,t)
model.set_objective(
    Objective(
        name="total_cost",
        expr=binop(
            left=AggregationExpression.create(
                op="sum",
                expr=binop(
                    left=param("prod_cost", [p]),  # prod_cost[p]
                    op="mul",
                    right=var("produce", [p, t]),  # produce[p, t]
                ),
                indices=[
                    IndexBinding.create(index="p", over="PRODUCTS"),
                    IndexBinding.create(index="t", over="PERIODS"),
                ],
            ),
            op="add",
            right=AggregationExpression.create(
                op="sum",
                expr=binop(
                    left=param("hold_cost", [p]),  # hold_cost[p]
                    op="mul",
                    right=var("inventory", [p, t]),  # inventory[p, t]
                ),
                indices=[
                    IndexBinding.create(index="p", over="PRODUCTS"),
                    IndexBinding.create(index="t", over="PERIODS"),
                ],
            ),
        ),
        sense="min",
    )
)

# Solve the model
print("=" * 80)
print("PRODUCTION PLANNING - Showcasing Multi-Dimensional Indexed Variables")
print("=" * 80)
print("\nModel Features:")
print("  ✓ Indexed Sets: PRODUCTS, PERIODS")
print("  ✓ Multi-dimensional Indexed Parameters: demand[p,t]")
print("  ✓ Multi-dimensional Indexed Variables: produce[p,t], inventory[p,t]")
print("  ✓ Constraints with Multiple Quantifiers")
print("\nProblem Definition:")
print(f"  Products: {', '.join(products)}")
print(f"  Time Periods: {', '.join(str(p) for p in periods)}")
print(
    f"  Total decision variables: {len(products) * len(periods) * 2} (produce + inventory)"
)

print("\nInitial Inventory:")
for elem in initial_inv_values:
    print(f"  {elem.index[0]}: {elem.value} units")

print("\nProduction Parameters:")
for i, product in enumerate(products):
    print(
        f"  {product}: Prod Cost=${prod_cost_values[i].value}/unit, "
        f"Hold Cost=${hold_cost_values[i].value}/unit/period, "
        f"Capacity={capacity_values[i].value} units/period"
    )

print("\nDemand Forecast:")
for period in periods:
    print(f"  Period {period}:")
    for product in products:
        demand_elem = next(e for e in demand_values if e.index == [product, period])
        print(f"    {product}: {demand_elem.value} units")

print("\n" + "=" * 80)
print("SOLVING...")
print("=" * 80)

opt = pyo.SolverFactory("cbc")
result = opt.solve(model.pyomo_model, tee=True)

print("\n" + "=" * 80)
print("SOLUTION")
print("=" * 80)

if result.solver.termination_condition == pyo.TerminationCondition.optimal:
    print("\nOptimal solution found!")
    print(f"Total Cost: ${pyo.value(model.pyomo_model.total_cost):.2f}")

    produce_var = model.pyomo_model.produce
    inventory_var = model.pyomo_model.inventory

    print("\nProduction Schedule:")
    for product in products:
        print(f"\n  {product}:")
        for period in periods:
            prod_val = pyo.value(produce_var[product, period])
            inv_val = pyo.value(inventory_var[product, period])
            demand_elem = next(e for e in demand_values if e.index == [product, period])
            capacity_elem = next(e for e in capacity_values if e.index == [product])

            print(
                f"    Period {period}: Produce {prod_val:.2f} units "
                f"({100 * prod_val / capacity_elem.value:.1f}% capacity), "
                f"Demand {demand_elem.value:.2f}, "
                f"End Inventory {inv_val:.2f}"
            )

    print("\nInventory Summary:")
    for period in periods:
        print(f"\n  End of Period {period}:")
        for product in products:
            inv_val = pyo.value(inventory_var[product, period])
            print(f"    {product}: {inv_val:.2f} units")
else:
    print(f"\nSolver status: {result.solver.termination_condition}")
    print("No optimal solution found!")

print("\n" + "=" * 80)
