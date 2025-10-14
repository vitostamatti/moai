"""
Transportation Problem Example

A company needs to ship goods from warehouses to customers.
This example showcases MOAI's indexed variables and parameters feature!

Sets:
    - WAREHOUSES: Set of warehouse locations (W1, W2, W3)
    - CUSTOMERS: Set of customer locations (C1, C2, C3, C4)

Parameters (indexed):
    - supply[w]: Supply capacity at warehouse w
    - demand[c]: Demand at customer c
    - cost[w,c]: Cost of shipping one unit from warehouse w to customer c

Decision Variables (indexed):
    - ship[w, c]: Amount to ship from warehouse w to customer c (>= 0)

Objective:
    Minimize sum of (cost[w,c] * ship[w,c]) for all w, c

Constraints:
    - Supply constraints: sum over c of ship[w,c] <= supply[w] for each w
    - Demand constraints: sum over w of ship[w,c] >= demand[c] for each c
"""

import pyomo.environ as pyo

from moai.builders import binop, ge, index_var, le, param, var
from moai.constraints import Constraint, Quantifier
from moai.expressions import AggregationExpression, IndexBinding
from moai.model import Model
from moai.objectives import Objective
from moai.parameters import IndexElement, Parameter
from moai.sets import Set
from moai.variables import Variable

# Define the sets
warehouses = ["W1", "W2", "W3"]
customers = ["C1", "C2", "C3", "C4"]

# Define supply capacities at each warehouse (indexed parameter)
supply_values = [
    IndexElement(index=["W1"], value=100.0),
    IndexElement(index=["W2"], value=150.0),
    IndexElement(index=["W3"], value=120.0),
]

# Define demand at each customer (indexed parameter)
demand_values = [
    IndexElement(index=["C1"], value=80.0),
    IndexElement(index=["C2"], value=70.0),
    IndexElement(index=["C3"], value=60.0),
    IndexElement(index=["C4"], value=50.0),
]

# Define transportation costs (2D indexed parameter: warehouse x customer)
cost_values = [
    # From W1
    IndexElement(index=["W1", "C1"], value=4.0),
    IndexElement(index=["W1", "C2"], value=6.0),
    IndexElement(index=["W1", "C3"], value=8.0),
    IndexElement(index=["W1", "C4"], value=5.0),
    # From W2
    IndexElement(index=["W2", "C1"], value=5.0),
    IndexElement(index=["W2", "C2"], value=4.0),
    IndexElement(index=["W2", "C3"], value=7.0),
    IndexElement(index=["W2", "C4"], value=6.0),
    # From W3
    IndexElement(index=["W3", "C1"], value=6.0),
    IndexElement(index=["W3", "C2"], value=5.0),
    IndexElement(index=["W3", "C3"], value=4.0),
    IndexElement(index=["W3", "C4"], value=3.0),
]

# Build the model
model = Model(name="TransportationProblem")

# Add sets
model.add_set(Set.create(name="WAREHOUSES", elements=warehouses))
model.add_set(Set.create(name="CUSTOMERS", elements=customers))

# Add indexed parameters
model.add_parameter(
    Parameter.create(name="supply", values=supply_values, indices=["WAREHOUSES"])
)
model.add_parameter(
    Parameter.create(name="demand", values=demand_values, indices=["CUSTOMERS"])
)
model.add_parameter(
    Parameter.create(
        name="cost", values=cost_values, indices=["WAREHOUSES", "CUSTOMERS"]
    )
)

# Add indexed variable: ship[w, c] - THIS IS THE KEY FEATURE!
# One variable declaration creates variables for all (warehouse, customer) pairs
model.add_variable(
    Variable.create(
        name="ship",
        domain="NonNegativeReals",
        indices=["WAREHOUSES", "CUSTOMERS"],  # Indexed over both sets!
    )
)

# Define index variables for use in expressions
w = index_var("w")
c = index_var("c")

# Add supply constraints using quantifiers
# For each warehouse w: sum(ship[w,c] for c in CUSTOMERS) <= supply[w]
model.add_constraint(
    Constraint.create(
        name="supply_limit",
        expr=le(
            left=AggregationExpression.create(
                op="sum",
                expr=var("ship", [w, c]),  # ship[w, c]
                indices=[IndexBinding.create(index="c", over="CUSTOMERS")],
            ),
            right=param("supply", [w]),  # supply[w]
        ),
        quantifiers=[Quantifier.create(index="w", over="WAREHOUSES")],
    )
)

# Add demand constraints using quantifiers
# For each customer c: sum(ship[w,c] for w in WAREHOUSES) >= demand[c]
model.add_constraint(
    Constraint.create(
        name="demand_satisfaction",
        expr=ge(
            left=AggregationExpression.create(
                op="sum",
                expr=var("ship", [w, c]),  # ship[w, c]
                indices=[IndexBinding.create(index="w", over="WAREHOUSES")],
            ),
            right=param("demand", [c]),  # demand[c]
        ),
        quantifiers=[Quantifier.create(index="c", over="CUSTOMERS")],
    )
)

# Set objective: minimize total transportation cost
# sum(cost[w,c] * ship[w,c] for all w in WAREHOUSES, c in CUSTOMERS)
model.set_objective(
    Objective(
        name="total_cost",
        expr=AggregationExpression.create(
            op="sum",
            expr=binop(
                left=param("cost", [w, c]),  # cost[w, c]
                op="mul",
                right=var("ship", [w, c]),  # ship[w, c]
            ),
            indices=[
                IndexBinding.create(index="w", over="WAREHOUSES"),
                IndexBinding.create(index="c", over="CUSTOMERS"),
            ],
        ),
        sense="min",
    )
)

# Solve the model
print("=" * 80)
print("TRANSPORTATION PROBLEM - Showcasing Indexed Variables & Parameters")
print("=" * 80)
print("\nModel Features:")
print("  ✓ Indexed Sets: WAREHOUSES, CUSTOMERS")
print("  ✓ Indexed Parameters: supply[w], demand[c], cost[w,c]")
print("  ✓ Indexed Variables: ship[w,c]")
print("  ✓ Constraints with Quantifiers and Aggregations")
print("\nProblem Definition:")
print(f"  Warehouses: {', '.join(warehouses)}")
print(f"  Customers: {', '.join(customers)}")
print(f"  Total decision variables: {len(warehouses) * len(customers)}")

print("\nSupply Capacities:")
for elem in supply_values:
    print(f"  {elem.index[0]}: {elem.value} units")

print("\nCustomer Demands:")
for elem in demand_values:
    print(f"  {elem.index[0]}: {elem.value} units")

print("\nTransportation Costs ($/unit):")
for elem in cost_values:
    print(f"  {elem.index[0]} -> {elem.index[1]}: ${elem.value}")

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

    print("\nShipment Plan:")
    ship_var = model.pyomo_model.ship
    for w_idx in warehouses:
        for c_idx in customers:
            amount = pyo.value(ship_var[w_idx, c_idx])
            if amount > 0.01:  # Only show non-zero shipments
                cost_elem = next(e for e in cost_values if e.index == [w_idx, c_idx])
                print(
                    f"  {w_idx} -> {c_idx}: {amount:.2f} units "
                    f"(cost: ${cost_elem.value * amount:.2f})"
                )

    # Verify constraints
    print("\nWarehouse Utilization:")
    for w_idx in warehouses:
        total_shipped = sum(pyo.value(ship_var[w_idx, c_idx]) for c_idx in customers)
        supply_elem = next(e for e in supply_values if e.index == [w_idx])
        print(
            f"  {w_idx}: {total_shipped:.2f}/{supply_elem.value:.2f} units "
            f"({100 * total_shipped / supply_elem.value:.1f}% utilized)"
        )

    print("\nCustomer Satisfaction:")
    for c_idx in customers:
        total_received = sum(pyo.value(ship_var[w_idx, c_idx]) for w_idx in warehouses)
        demand_elem = next(e for e in demand_values if e.index == [c_idx])
        print(
            f"  {c_idx}: {total_received:.2f}/{demand_elem.value:.2f} units needed "
            f"({100 * total_received / demand_elem.value:.1f}% satisfied)"
        )
else:
    print(f"\nSolver status: {result.solver.termination_condition}")
    print("No optimal solution found!")

print("\n" + "=" * 80)
