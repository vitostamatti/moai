import pyomo.environ as pyo

from moai.builders import binop, le, num, var
from moai.constraints import Constraint
from moai.model import Model
from moai.objectives import Objective
from moai.variables import Variable

m = (
    Model(name="BasicExample")
    .add_variable(
        Variable.create(
            name="x",
            domain="NonNegativeReals",
        )
    )
    .add_variable(
        Variable.create(
            name="y",
            domain="NonNegativeReals",
        )
    )
    .add_constraint(
        Constraint.create(
            name="c1",
            expr=le(
                left=binop(
                    left=binop(
                        left=num(2),
                        op="mul",
                        right=var("x"),
                    ),
                    op="add",
                    right=binop(
                        left=num(3),
                        op="mul",
                        right=var("y"),
                    ),
                ),
                right=num(10),
            ),
        )
    )
    .set_objective(
        Objective(
            name="o",
            expr=binop(
                left=binop(
                    left=num(2),
                    op="mul",
                    right=var("x"),
                ),
                op="add",
                right=binop(
                    left=num(3),
                    op="mul",
                    right=var("y"),
                ),
            ),
            sense="min",
        )
    )
)


opt = pyo.SolverFactory("cbc")
result = opt.solve(m.pyomo_model)
print(result)
