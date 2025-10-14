from typing import cast

import pyomo.environ as pyo

from moai.builders import binop, index_var, le, num, param, var
from moai.constraints import Constraint, Quantifier
from moai.parse import (
    IndexContext,
    _parse_expression,
    constraint_to_pyomo,
    set_to_pyomo,
    var_to_pyomo,
)
from moai.sets import Set
from moai.variables import Variable


class TestParseSet:
    def test_parse_set(self):
        moai_set = Set.create(
            name="Products",
            elements=["A", "B", "C"],
        )
        pyomo_set = set_to_pyomo(moai_set)

        assert isinstance(pyomo_set, pyo.Set)


class TestParseVariable:
    def test_parse_variable(self):
        moai_var = Variable.create(
            name="x",
            domain="NonNegativeReals",
        )
        pyomo_var = var_to_pyomo(moai_var)

        assert isinstance(pyomo_var, pyo.ScalarVar)

    def test_parse_variable_with_indices(self):
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
        model.I = pyo.Set(initialize=["A", "B", "C"])

        moai_var = Variable.create(
            name="x",
            domain="NonNegativeReals",
            indices=["I"],
        )
        pyomo_var = var_to_pyomo(moai_var, model=model)
        assert isinstance(pyomo_var, pyo.Var)
        assert pyomo_var.index_set() == model.I


class TestParseExpression:
    def test_parse_expression_with_scalar_variables(self):
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
        model.x = pyo.Var(name="x")
        model.y = pyo.Var(name="y")

        moai_expression = binop(
            left=binop(
                left=binop(left=num(2), op="mul", right=var("x")),
                op="add",
                right=binop(left=num(3), op="mul", right=var("y")),
            ),
            op="sub",
            right=num(10),
        )
        pyomo_expression = _parse_expression(model, moai_expression)
        assert isinstance(pyomo_expression, pyo.numeric_expr.NumericExpression)

    def test_parse_expression_witn_indexed_variables(self):
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
        model.I = pyo.Set(initialize=["A", "B", "C"])
        model.x = pyo.Var(model.I, name="x")
        model.y = pyo.Var(model.I, name="y")
        # index context
        index_context: IndexContext = {"i": "A"}
        moai_expression = binop(
            left=binop(
                left=binop(
                    left=num(2),
                    op="mul",
                    right=var("x", [index_var("i")]),
                ),
                op="add",
                right=binop(
                    left=num(3),
                    op="mul",
                    right=var("y", [index_var("i")]),
                ),
            ),
            op="sub",
            right=num(10),
        )
        pyomo_expression = _parse_expression(
            model, moai_expression, index_context=index_context
        )
        assert isinstance(pyomo_expression, pyo.numeric_expr.NumericExpression)


#     def test_parse_expression_with_numbers(self):
#         model = cast(pyo.ConcreteModel, pyo.ConcreteModel())

#         moai_expression = binop(
#             left=num(2),
#             op="+",
#             right=num(3),
#         )

#         pyomo_expression = _parse_expression(model, moai_expression)

#         assert isinstance(pyomo_expression, pyo.expr.SumExpression)

#         pyomo_expression = _parse_expression(model, moai_expression)

#         assert isinstance(pyomo_expression, pyo.expr.InequalityExpression)

#     def test_parse_expression_with_indexed_variables(self):
#         model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
#         model.I = pyo.Set(initialize=["A", "B", "C"])
#         model.x = pyo.Var(model.I, name="x")

#         moai_expression = binop(
#             left=binop(
#                 left=var("x", indices=["I"]),
#                 op="*",
#                 right=num(1),
#             ),
#             op="<=",
#             right=num(2),
#         )
#         pyomo_expression = _parse_expression(model, moai_expression)

#         assert isinstance(pyomo_expression, pyo.expr.InequalityExpression)

#     def test_parse_expression_with_sum(self):
#         model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
#         model.I = pyo.Set(initialize=["A", "B", "C"])
#         model.x = pyo.Var(model.I, name="x")

#         moai_expression = sum_over(
#             index_var="i",
#             set_name="I",
#             expression=var("x", indices=["i"]),
#         )

#         pyomo_expression = _parse_expression(model, moai_expression)

#         assert isinstance(pyomo_expression, pyo.expr.LinearExpression)

#     def test_parse_expresion_with_sum_and_condition(self):
#         model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
#         model.I = pyo.Set(initialize=["A", "B", "C"])
#         model.x = pyo.Var(model.I, name="x")

#         moai_expression = sum_over(
#             index_var="i",
#             set_name="I",
#             expression=var("x", indices=["i"]),
#             condition=binop(
#                 left=index_var("i"),
#                 op="!=",
#                 right=string("A"),
#             ),
#         )

#         pyomo_expression = _parse_expression(model, moai_expression)

#         assert isinstance(pyomo_expression, pyo.expr.LinearExpression)


class TestParseConstraint:
    def test_parse_scalar_constraint(self):
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
        model.x = pyo.Var(name="x")
        model.p = pyo.Param(initialize=5, name="p")
        moai_expression = le(
            left=binop(
                left=var("x"),
                op="mul",
                right=param("p"),
            ),
            right=num(1000),
        )
        moai_constraint = Constraint.create(
            name="test_constraint",
            expr=moai_expression,
        )

        pyomo_constraint = constraint_to_pyomo(
            moai_constraint,
            model,
        )

        assert isinstance(pyomo_constraint, pyo.Constraint)

    def test_parse_constraint_with_quantifier(self):
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
        model.I = pyo.Set(initialize=["i1", "i2", "i3"])
        model.J = pyo.Set(initialize=[1, 2, 3])
        model.x = pyo.Var(model.I, name="x")
        model.p = pyo.Param(model.I, name="p")

        moai_expression = le(
            left=binop(
                left=var("x", [index_var("i")]),
                op="mul",
                right=param("p", [index_var("j")]),
            ),
            right=num(100),
        )
        moai_constraint = Constraint.create(
            name="test_constraint",
            expr=moai_expression,
            quantifiers=[
                Quantifier.create(index="i", over="I"),
                Quantifier.create(index="j", over="J"),
            ],
        )

        pyomo_constraint = constraint_to_pyomo(
            moai_constraint,
            model,
        )
        assert isinstance(pyomo_constraint, pyo.Constraint)


#     def test_parse_constraint_with_param(self):
#         model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
#         model.I = pyo.Set(initialize=["A", "B", "C"])
#         model.p = pyo.Param(model.I, initialize={"A": 1, "B": 2, "C": 3})

#         moai_expression = binop(
#             left=var("p", indices=["i"]),
#             op="*",
#             right=num(1),
#         )
#         moai_constraint = ConstraintDefinition(
#             name="test_constraint",
#             expression=moai_expression,
#             quantifiers=[Quantifier.create(index="i", over="I")],
#         )

#         pyomo_constraint = constraint_to_pyomo(model, moai_constraint)

#         assert isinstance(pyomo_constraint, pyo.Constraint)

#     def test_parse_constraint_with_quantifier_and_condition(self):
#         model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
#         model.I = pyo.Set(initialize=["A", "B", "C"])
#         model.x = pyo.Var(model.I, name="x")

#         moai_expression = binop(
#             left=var("x", indices=["i"]),
#             op="*",
#             right=num(1),
#         )
#         quantifier = Quantifier.create(
#             index="i",
#             over="I",
#             condition=BinaryOp(
#                 type="binary_op",
#                 op=">",
#                 left=var("x", indices=["i"]),
#                 right=num(0),
#             ),
#         )
#         moai_constraint = ConstraintDefinition.create(
#             name="test_constraint",
#             expression=moai_expression,
#             quantifiers=[quantifier],
#         )

#         pyomo_constraint = constraint_to_pyomo(model, moai_constraint)

#         assert isinstance(pyomo_constraint, pyo.Constraint)


class TestIndexArithmetic:
    """Test arithmetic operations on index variables"""

    def test_index_subtraction(self):
        """Test that index - number works correctly"""
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())

        # Create index context where t=2
        index_context: IndexContext = {"t": 2}  # noqa: F821

        # Create expression: t - 1
        i = index_var("t")
        expr = binop(left=i, op="sub", right=num(1))

        # Parse the expression (pass expr directly, not expr.root)
        result = _parse_expression(model, expr, index_context)

        # Result should be 1 (Python int)
        assert result == 1
        assert isinstance(result, int)

    def test_index_addition(self):
        """Test that index + number works correctly"""
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())

        index_context: IndexContext = {"t": 2}

        # Create expression: t + 1
        i = index_var("t")
        expr = binop(left=i, op="add", right=num(1))

        result = _parse_expression(model, expr, index_context)

        assert result == 3
        assert isinstance(result, int)

    def test_index_multiplication(self):
        """Test that index * number works correctly"""
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())

        index_context: IndexContext = {"t": 3}

        # Create expression: t * 2
        i = index_var("t")
        expr = binop(left=i, op="mul", right=num(2))

        result = _parse_expression(model, expr, index_context)

        assert result == 6
        assert isinstance(result, int)

    def test_index_division(self):
        """Test that index / number works correctly"""
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())

        index_context: IndexContext = {"t": 6}

        # Create expression: t / 2
        i = index_var("t")
        expr = binop(left=i, op="div", right=num(2))

        result = _parse_expression(model, expr, index_context)

        assert result == 3.0
        assert isinstance(result, float)

    def test_variable_indexing_with_arithmetic(self):
        """Test that variables can be indexed with arithmetic expressions like x[t-1]"""
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())
        model.T = pyo.Set(initialize=[1, 2, 3])
        model.x = pyo.Var(model.T)

        # Create index context where t=2
        index_context: IndexContext = {"t": 2}

        # Create expression: var("x", [t - 1])
        i = index_var("t")
        idx_expr = binop(left=i, op="sub", right=num(1))
        expr = var("x", [idx_expr])

        # Parse the expression
        result = _parse_expression(model, expr, index_context)

        # Result should be model.x[1]
        assert result is model.x[1]

    def test_complex_index_arithmetic(self):
        """Test complex arithmetic on index variables like (t-1)*2"""
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())

        index_context: IndexContext = {"t": 3}

        # Create expression: (t - 1) * 2
        i = index_var("t")
        sub_expr = binop(left=i, op="sub", right=num(1))
        expr = binop(left=sub_expr, op="mul", right=num(2))

        result = _parse_expression(model, expr, index_context)

        assert result == 4  # (3 - 1) * 2 = 4
        assert isinstance(result, int)

    def test_multiple_index_variables(self):
        """Test arithmetic with multiple index variables"""
        model = cast(pyo.ConcreteModel, pyo.ConcreteModel())

        index_context: IndexContext = {"i": 5, "j": 3}

        # Create expression: i - j
        i_var = index_var("i")
        j_var = index_var("j")
        expr = binop(left=i_var, op="sub", right=j_var)

        result = _parse_expression(model, expr, index_context)

        assert result == 2  # 5 - 3 = 2
        assert isinstance(result, int)
