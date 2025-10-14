from typing import Any, cast

import pyomo.environ as pyo
from pyomo.core.base.component import ComponentData as pyoComponentData

from .constraints import Constraint
from .expressions import (
    AggregationExpression,
    BinaryOp,
    ComparisonExpression,
    ExprType,
    IndexComparisonExpr,
    IndexVariableExpr,
    NumberExpr,
    ParameterExpr,
    StringExpr,
    UnaryOp,
    VariableExpr,
)
from .objectives import Objective
from .parameters import Parameter
from .sets import Set
from .variables import Variable


def set_to_pyomo(set: Set) -> pyo.Set:
    return pyo.Set(initialize=set.elements, name=set.name)


def parameter_to_pyomo(
    parameter: Parameter,
    model: pyo.ConcreteModel,
) -> pyo.Param:
    """
    Convert a Moai ParameterDefinition to a Pyomo Param.
    """
    if isinstance(parameter.values, int | float):
        return pyo.Param(initialize=parameter.values)
    # For IndexElement values, we need to create a mapping
    if not parameter.indices:
        raise ValueError("ParameterDefinition must have indices for indexed parameters")

    set_objs = [model.component(set_name) for set_name in parameter.indices]
    if any(set_obj is None for set_obj in set_objs):
        raise ValueError(f"One or more sets {parameter.indices} not found in the model")

    index_values = {tuple(element.index): element.value for element in parameter.values}

    return pyo.Param(
        *set_objs,
        initialize=index_values,
        name=parameter.name,
    )


def var_to_pyomo(
    v: Variable,
    model: pyo.ConcreteModel | None = None,
) -> pyo.Var:
    """
    Convert a Moai Variable to a Pyomo Var."""

    kwargs: dict[str, Any] = {"name": v.name}
    match v.domain:
        case "Reals":
            kwargs["domain"] = pyo.Reals
        case "NonNegativeReals":
            kwargs["domain"] = pyo.NonNegativeReals
        case "Integers":
            kwargs["domain"] = pyo.Integers
        case "NonNegativeIntegers":
            kwargs["domain"] = pyo.NonNegativeIntegers
        case "Binary":
            kwargs["domain"] = pyo.Binary
        case _:
            raise ValueError(f"Unsupported variable domain: {v.domain}")

    # Set variable indices
    indices = []
    if v.indices:
        if model is None:
            raise ValueError("Model must be provided to resolve variable indices")
        for idx in v.indices:
            if isinstance(idx, str):
                set_name = getattr(model, idx, None)
                if set_name is None:
                    raise ValueError(f"Set {idx} not found in model.")
                indices.append(set_name)

    # Set bounds
    if v.lb is not None or v.ub is not None:
        kwargs["bounds"] = (v.lb, v.ub)

    return pyo.Var(*indices, **kwargs)


def constraint_to_pyomo(
    c: Constraint,
    model: pyo.ConcreteModel,
) -> pyo.Constraint:
    """Convert a moai constraint to a Pyomo constraint."""
    if not c.quantifiers:
        # Simple constraint without quantifiers
        expr = _parse_comparison_expression(model, c.expr)
        return pyo.Constraint(expr=expr)
    else:
        set_objs = []
        for q in c.quantifiers:
            set_obj = getattr(model, q.over, None)
            if set_obj is None:
                raise ValueError(f"Set {q.over} not found in model")
            set_objs.append(set_obj)

        def constraint_rule(m, *indices):
            if not c.quantifiers:
                return _parse_comparison_expression(m, c.expr)
            else:
                index_context: IndexContext = {
                    q.index: cast(str, indices[i]) for i, q in enumerate(c.quantifiers)
                }
                # Check all quantifier conditions - skip this combination if any condition fails
                for q in c.quantifiers:
                    if q.condition is not None:
                        # Evaluate the condition with current index context
                        condition_result = _parse_comparison_expression(
                            m, q.condition, index_context
                        )
                        # For index comparisons, the result should be a Python bool or 0/1
                        # Use pyo.value() to convert Pyomo expressions to Python values
                        try:
                            if not pyo.value(condition_result, exception=False):
                                return pyo.Constraint.Skip
                        except Exception:
                            # If it's already a Python bool, just check it
                            if not condition_result:
                                return pyo.Constraint.Skip
                return _parse_comparison_expression(m, c.expr, index_context)

        return pyo.Constraint(*set_objs, rule=constraint_rule)


def objective_to_pyomo(
    o: Objective,
    model: pyo.ConcreteModel,
) -> pyo.Objective:
    """Convert a moai objective to a Pyomo objective."""
    expr = _parse_expression(model, o.expr)
    return pyo.Objective(
        expr=expr, sense=pyo.minimize if o.sense == "min" else pyo.maximize
    )


PyomoExpression = (
    str
    | float
    | int
    | pyo.Var
    | pyo.Param
    | pyo.Expression
    | pyoComponentData
    | pyo.numeric_expr.NumericExpression
    | pyo.expr.SumExpression
    | pyo.expr.NegationExpression
    | pyo.expr.ProductExpression
    | pyo.expr.DivisionExpression
    | pyo.expr.InequalityExpression
    | pyo.expr.EqualityExpression
    | pyo.expr.NotEqualExpression
)


def _parse_binary_op(
    model: pyo.ConcreteModel,
    expr: BinaryOp,
    index_context: dict[str, Any] | None = None,
) -> PyomoExpression:
    """Convert a moai BinaryOp expression to a Pyomo expression."""
    lhs = _parse_expression(model, expr.left, index_context)
    rhs = _parse_expression(model, expr.right, index_context)

    # If both operands are scalars (not Pyomo expressions), perform Python arithmetic
    # This is important for index expressions like t-1 where t is an index variable
    lhs_is_scalar = isinstance(lhs, (int, float, str))
    rhs_is_scalar = isinstance(rhs, (int, float, str))

    if lhs_is_scalar and rhs_is_scalar:
        match expr.op:
            case "add":
                result = lhs + rhs  # type: ignore
                # Ensure integer results stay as ints (important for indexing)
                if isinstance(lhs, int) and isinstance(rhs, int):
                    return int(result)
                return result
            case "sub":
                result = lhs - rhs  # type: ignore
                if isinstance(lhs, int) and isinstance(rhs, int):
                    return int(result)
                return result
            case "mul":
                result = lhs * rhs  # type: ignore
                if isinstance(lhs, int) and isinstance(rhs, int):
                    return int(result)
                return result
            case "div":
                return lhs / rhs  # type: ignore
            case _:
                raise ValueError(f"Unsupported binary operator for scalars: {expr.op}")

    # Otherwise, create Pyomo expressions
    match expr.op:
        case "add":
            return pyo.expr.SumExpression((lhs, rhs))
        case "sub":
            return pyo.expr.SumExpression((lhs, pyo.expr.NegationExpression(rhs)))
        case "mul":
            return pyo.expr.ProductExpression((lhs, rhs))
        case "div":
            return pyo.expr.DivisionExpression((lhs, rhs))
        # case "**" | "^":
        #     return pyo.expr.PowExpression((lhs, rhs))
        # case "<=":
        #     return pyo.expr.InequalityExpression((lhs, rhs), strict=False)
        # case ">=":
        #     return pyo.expr.InequalityExpression((rhs, lhs), strict=False)
        # case "==":
        #     return pyo.expr.EqualityExpression((lhs, rhs))
        # case "!=":
        #     # return pyo.expr.NotEqualExpression((lhs, rhs)) # throws error. Invesigate more
        #     return lhs != rhs
        # case "<":
        #     return pyo.expr.InequalityExpression((lhs, rhs), strict=True)
        # case ">":
        #     return pyo.expr.InequalityExpression((rhs, lhs), strict=True)
        # case "min":
        #     return pyo.expr.MinExpression((lhs, rhs))
        # case "max":
        #     return pyo.expr.MaxExpression((lhs, rhs))
        # case "pow":
        #     return pyo.expr.PowExpression((lhs, rhs))
        case _:
            raise ValueError(f"Unsupported operator: {expr.op}")


def _parse_unary_op(
    model: pyo.ConcreteModel,
    expr: UnaryOp,
    index_context: dict[str, Any] | None = None,
) -> PyomoExpression:
    operand = _parse_expression(model, expr.expr, index_context)
    match expr.op:
        case "-":
            return pyo.numeric_expr.NegationExpression(operand)
        case "sin":
            return pyo.sin(operand)
        case "cos":
            return pyo.cos(operand)
        case "tan":
            return pyo.tan(operand)
        case "asin":
            return pyo.asin(operand)
        case "acos":
            return pyo.acos(operand)
        case "atan":
            return pyo.atan(operand)
        case "sinh":
            return pyo.sinh(operand)
        case "cosh":
            return pyo.cosh(operand)
        case "tanh":
            return pyo.tanh(operand)
        case "asinh":
            return pyo.asinh(operand)
        case "acosh":
            return pyo.acosh(operand)
        case "atanh":
            return pyo.atanh(operand)
        case "exp":
            return pyo.exp(operand)
        case "log":
            return pyo.log(operand)
        case "log10":
            return pyo.log10(operand)
        case "sqrt":
            return pyo.sqrt(operand)
        case "abs":
            return pyo.numeric_expr.AbsExpression(operand)
        case _:
            raise ValueError(f"Unsupported unary operator: {expr.op}")


def _parse_variable(
    model: pyo.ConcreteModel,
    expr: VariableExpr,
    index_context: dict[str, Any] | None = None,
) -> PyomoExpression:
    """Convert a moai Variable expression to a Pyomo variable."""
    # Handle special case for index variables
    if expr.name.startswith("_idx_") and index_context:
        index_name = expr.name[5:]  # Remove "_idx_" prefix
        if index_name in index_context:
            return index_context[index_name]
        else:
            raise ValueError(f"Index variable {index_name} not found in context")

    v = getattr(model, expr.name, None)
    if v is None:
        raise ValueError(f"Variable {expr.name} not found in model.")
    if not isinstance(v, pyo.Var):
        raise ValueError(f"Expected variable {expr.name} to be a Pyomo Var.")

    if expr.index_expr and not index_context:
        raise ValueError(
            f"Variable {expr.name} requires index expressions but no index context provided"
        )
    if expr.index_expr and index_context:
        # Build index tuple from context
        index_values = []
        for index_expr in expr.index_expr:
            index_values.append(_parse_expression(model, index_expr, index_context))
        if len(index_values) == 1:
            return v[index_values[0]]
        else:
            return v[tuple(index_values)]
    return v


def _parse_parameter(
    model: pyo.ConcreteModel,
    expr: ParameterExpr,
    index_context: dict[str, Any] | None = None,
) -> PyomoExpression:
    """Convert a moai Parameter expression to a Pyomo parameter."""
    p = getattr(model, expr.name, None)
    if p is None:
        raise ValueError(f"Parameter {expr.name} not found in model.")

    if not isinstance(p, pyo.Param):
        raise ValueError(f"Expected parameter {expr.name} to be a Pyomo Param.")

    if expr.index_expr and index_context:
        index_values = []
        for index_expr in expr.index_expr:
            index_values.append(_parse_expression(model, index_expr, index_context))
        if len(index_values) == 1:
            return p[index_values[0]]
        else:
            return p[tuple(index_values)]
    return p


def _parse_comparison_expression(
    model: pyo.ConcreteModel,
    expr: ComparisonExpression,
    index_context: dict[str, Any] | None = None,
):
    """Convert a moai ComparisonExpression to a Pyomo expression."""
    lhs: PyomoExpression = _parse_expression(model, expr.left, index_context)
    rhs: PyomoExpression = _parse_expression(model, expr.right, index_context)

    match expr.op:
        case "le":
            return pyo.expr.InequalityExpression((lhs, rhs), strict=False)
        case "ge":
            return pyo.expr.InequalityExpression((rhs, lhs), strict=False)
        case "eq":
            return pyo.expr.EqualityExpression((lhs, rhs))
        case "ne":
            # return pyo.expr.NotEqualExpression((lhs, rhs)) # throws error. Investigate more
            return lhs != rhs
        case "lt":
            return pyo.expr.InequalityExpression((lhs, rhs), strict=True)
        case "gt":
            return pyo.expr.InequalityExpression((rhs, lhs), strict=True)
        case _:
            raise ValueError(f"Unsupported comparison operator: {expr.op}")


def _parse_index_comparison_expression(
    model: pyo.ConcreteModel,
    expr: IndexComparisonExpr,
    index_context: dict[str, Any] | None = None,
):
    """Convert a moai IndexComparisonExpression to a boolean result.

    This is used for conditions in aggregation expressions.
    """
    lhs = _parse_expression(model, expr.left, index_context)
    rhs = _parse_expression(model, expr.right, index_context)

    match expr.op:
        case "le":
            return lhs <= rhs  # type: ignore
        case "ge":
            return lhs >= rhs  # type: ignore
        case "eq":
            return lhs == rhs  # type: ignore
        case "ne":
            return lhs != rhs  # type: ignore
        case "lt":
            return lhs < rhs  # type: ignore
        case "gt":
            return lhs > rhs  # type: ignore
        case _:
            raise ValueError(f"Unsupported comparison operator: {expr.op}")


IndexContext = dict[str, str | int | float]


def _parse_expression(
    model: pyo.ConcreteModel,
    expr: ExprType,
    index_context: IndexContext | None = None,
) -> PyomoExpression:
    """Convert a moai expression to a Pyomo expression.

    Args:
        model: The Pyomo model
        expr: The moai expression to convert
        index_context: Dictionary mapping index variables to their current values
    """
    if isinstance(expr, StringExpr):
        return expr.value
    if isinstance(expr, NumberExpr):
        return expr.value
    elif isinstance(expr, IndexVariableExpr):
        if index_context is None:
            raise ValueError("Index context is required for index variables")
        index_name = expr.name
        if index_name not in index_context:
            raise ValueError(f"Index variable {index_name} not found in context")
        return index_context[index_name]
    elif isinstance(expr, VariableExpr):
        return _parse_variable(model, expr, index_context)
    elif isinstance(expr, ParameterExpr):
        return _parse_parameter(model, expr, index_context)
    elif isinstance(expr, BinaryOp):
        return _parse_binary_op(model, expr, index_context)
    elif isinstance(expr, UnaryOp):
        return _parse_unary_op(model, expr, index_context)
    elif isinstance(expr, AggregationExpression):
        return _parse_aggregation(model, expr, index_context)
    else:
        raise ValueError(f"Unsupported expression type: {type(expr)}")


def _parse_sum(
    model: pyo.ConcreteModel,
    expr: AggregationExpression,
    index_context: dict[str, Any] | None = None,
):
    """Convert a moai Sum expression to a Pyomo sum expression.

    This function handles multiple bindings by creating nested loops (Cartesian product)
    over all the sets. For each combination of index values, it:
    1. Checks if the condition (if any) is satisfied
    2. If satisfied, evaluates the expression and adds it to the sum

    Args:
        model: The Pyomo model
        expr: The aggregation expression with bindings and optional condition
        index_context: Existing index context (from outer scope)

    Returns:
        Sum of all terms that satisfy the condition
    """
    from itertools import product

    # Collect all sets for the bindings
    sets = []
    for binding in expr.bindings:
        set_obj = getattr(model, binding.set_name, None)
        if set_obj is None:
            raise ValueError(f"Set {binding.set_name} not found in model")
        sets.append(set_obj)

    # Create the Cartesian product of all sets
    terms = []

    for combination in product(*sets):
        # Start with the outer index context (includes quantifier variables)
        bindings_context = index_context.copy() if index_context else {}

        # Map each index variable to its corresponding value in this combination
        for i, binding in enumerate(expr.bindings):
            bindings_context[binding.index_var] = combination[i]

        # Check the condition if present
        if expr.condition is not None:
            condition_result = _parse_index_comparison_expression(
                model, expr.condition, bindings_context
            )
            # Skip this term if condition is not satisfied
            if not condition_result:
                continue

        # Parse the inner expression with this context
        term = _parse_expression(model, expr.expr, bindings_context)
        terms.append(term)

    # Return sum of all terms
    if not terms:
        return 0
    elif len(terms) == 1:
        return terms[0]
    else:
        return sum(terms)


def _parse_aggregation(
    model: pyo.ConcreteModel,
    expr: AggregationExpression,
    index_context: dict[str, Any] | None = None,
):
    """Convert a moai aggregation expression to a Pyomo expression.

    Routes to the appropriate aggregation function based on the operator.
    """
    if expr.op == "sum":
        return _parse_sum(model, expr, index_context)
    else:
        raise ValueError(f"Unsupported aggregation operator: {expr.op}")


# def _parse_set_operation(
#     model: pyo.ConcreteModel,
#     expr: SetOperation,
#     index_context: Optional[Dict[str, Any]] = None,
# ) -> bool:
#     """Convert a moai SetOperation expression to a boolean result."""
#     left_val = parse_expression(model, expr.left, index_context)
#     right_val = parse_expression(model, expr.right, index_context)

#     # Handle membership operations
#     if expr.op == "in":
#         # Check if left_val is in right_val
#         if isinstance(right_val, str):
#             # If right_val is a string, treat it as a set name and get the actual set
#             set_obj = getattr(model, right_val, None)
#             if isinstance(set_obj, pyo.Set):
#                 return left_val in set_obj
#         elif hasattr(right_val, "__contains__"):
#             return left_val in right_val
#         return False

#     elif expr.op == "not_in":
#         # Check if left_val is not in right_val
#         if isinstance(right_val, str):
#             # If right_val is a string, treat it as a set name and get the actual set
#             set_obj = getattr(model, right_val, None)
#             if isinstance(set_obj, pyo.Set):
#                 return left_val not in set_obj
#         elif hasattr(right_val, "__contains__"):
#             return left_val not in right_val
#         return True

#     else:
#         raise ValueError(f"Unsupported set operation: {expr.op}")


# def _parse_index_variable(
#     _: pyo.ConcreteModel,
#     expr: IndexVariable,
#     index_context: IndexContext | None = None,
# ):
#     """Convert a moai IndexVariable expression to a Pyomo index variable."""
#     if index_context is None:
#         raise ValueError("Index context is required for index variables")

#     index_name = expr.name
#     if index_name not in index_context:
#         raise ValueError(f"Index variable {index_name} not found in context")

#     return index_context[index_name]
