from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, RootModel


class NumberExpr(BaseModel):
    """Numeric literal in an expression"""

    type: Literal["number"]
    value: float | int

    @classmethod
    def create(cls, value: float | int) -> NumberExpr:
        return NumberExpr(type="number", value=value)


class StringExpr(BaseModel):
    """String literal in an expression"""

    type: Literal["string"]
    value: str

    @classmethod
    def create(cls, value: str) -> StringExpr:
        return StringExpr(type="string", value=value)


# Note: IndexBinaryExpr and IndexUnaryExpr have been removed.
# Use BinaryOp and UnaryOp for all expressions, including index expressions.
# Validation of index expressions is done at build/parse time.


class IndexVariableExpr(BaseModel):
    """Index variable reference in an expression"""

    type: Literal["index_variable"]
    name: str

    @classmethod
    def create(cls, name: str) -> IndexVariableExpr:
        return IndexVariableExpr(type="index_variable", name=name)


class VariableExpr(BaseModel):
    """Variable reference in an expression"""

    type: Literal["variable"]
    name: str
    index_expr: list[IndexExprType] | None

    @classmethod
    def create(
        cls, name: str, index_expr: list[IndexExprType] | None = None
    ) -> VariableExpr:
        return VariableExpr(type="variable", name=name, index_expr=index_expr)


class ParameterExpr(BaseModel):
    """Parameter reference in an expression"""

    type: Literal["parameter"]
    name: str
    index_expr: list[IndexExprType] | None

    @classmethod
    def create(
        cls, name: str, index_expr: list[IndexExprType] | None = None
    ) -> ParameterExpr:
        return ParameterExpr(type="parameter", name=name, index_expr=index_expr)


UnaryOpType = Literal["sub", "sin", "cos", "tan", "exp", "log"]


class UnaryOp(BaseModel):
    """Unary operation in an expression"""

    type: Literal["unary_op"]
    op: UnaryOpType
    expr: ExprType

    @classmethod
    def create(cls, op: UnaryOpType, expr: ExprType) -> UnaryOp:
        return UnaryOp(type="unary_op", op=op, expr=expr)


BinaryOpType = Literal["add", "sub", "mul", "div"]


class BinaryOp(BaseModel):
    """Binary operation in an expression"""

    type: Literal["binary_op"]
    op: BinaryOpType
    left: ExprType
    right: ExprType

    @classmethod
    def create(cls, op: BinaryOpType, left: ExprType, right: ExprType) -> BinaryOp:
        return BinaryOp(type="binary_op", op=op, left=left, right=right)


# IndexExprType is now a subset of the main ExprType
# It includes basic expressions but excludes VariableExpr and ParameterExpr to avoid circular dependencies
# StringExpr is included for string literals in indices
# More complex validation can be done at parse/build time if needed
IndexExprType = StringExpr | NumberExpr | IndexVariableExpr | BinaryOp | UnaryOp

binary_op_to_symbol = {
    "add": "+",
    "sub": "-",
    "mul": "*",
    "div": "/",
}

unary_op_to_symbol = {
    "sin": "sin",
    "cos": "cos",
    "tan": "tan",
    "exp": "exp",
    "log": "log",
    "sub": "-",
}


def index_expr_to_string(expr: IndexExprType) -> str:
    """Convert an index expression to a string representation."""
    if expr.type == "number":
        return str(expr.value)
    elif expr.type == "string":
        return expr.value
    elif expr.type == "index_variable":
        return expr.name
    elif expr.type == "unary_op":
        # For unary ops, we need to handle the nested expr carefully
        # Since UnaryOp.expr is ExprType, we handle it recursively
        if isinstance(
            expr.expr, NumberExpr | StringExpr | IndexVariableExpr | BinaryOp | UnaryOp
        ):
            return f"({unary_op_to_symbol[expr.op]}{index_expr_to_string(expr.expr)})"
        else:
            # Variable or Parameter in index - shouldn't happen in valid index expressions
            raise ValueError(f"Invalid expression type in index: {expr.expr.type}")
    elif expr.type == "binary_op":
        # For binary ops, handle both sides
        left_str = ""
        right_str = ""
        if isinstance(
            expr.left, NumberExpr | StringExpr | IndexVariableExpr | BinaryOp | UnaryOp
        ):
            left_str = index_expr_to_string(expr.left)  # type: ignore
        else:
            raise ValueError(f"Invalid expression type in index: {expr.left.type}")

        if isinstance(
            expr.right, NumberExpr | StringExpr | IndexVariableExpr | BinaryOp | UnaryOp
        ):
            right_str = index_expr_to_string(expr.right)  # type: ignore
        else:
            raise ValueError(f"Invalid expression type in index: {expr.right.type}")

        return f"({left_str} {binary_op_to_symbol[expr.op]} {right_str})"
    return str(expr)  # Fallback for unexpected types


class IndexExpression(RootModel[IndexExprType]):
    def display(self) -> str:
        """A string representation of the index expression."""
        return index_expr_to_string(self.root)


class IndexComparisonExpr(BaseModel):
    """Comparison expression for aggregation conditions"""

    type: Literal["index_comparison"]
    left: IndexExprType
    right: IndexExprType
    op: Literal["le", "lt", "eq", "gt", "ge", "ne"]

    @classmethod
    def create(
        cls,
        left: IndexExprType,
        right: IndexExprType,
        op: Literal["le", "lt", "eq", "gt", "ge", "ne"],
    ) -> IndexComparisonExpr:
        return IndexComparisonExpr(
            type="index_comparison", left=left, right=right, op=op
        )


def expr_to_string(expr: ExprType) -> str:
    """Convert an expression to a string representation."""
    if expr.type == "number":
        return str(expr.value)
    elif expr.type == "string":
        return expr.value
    elif expr.type == "index_variable":
        return expr.name
    elif expr.type == "variable":
        if expr.index_expr:
            index_str = ", ".join(index_expr_to_string(e) for e in expr.index_expr)
            return f"{expr.name}[{index_str}]"
        return expr.name
    elif expr.type == "parameter":
        if expr.index_expr:
            index_str = ", ".join(index_expr_to_string(e) for e in expr.index_expr)
            return f"{expr.name}[{index_str}]"
        return expr.name
    elif expr.type == "unary_op":
        return f"({unary_op_to_symbol[expr.op]}{expr_to_string(expr.expr)})"
    elif expr.type == "binary_op":
        return f"({expr_to_string(expr.left)} {binary_op_to_symbol[expr.op]} {expr_to_string(expr.right)})"
    elif expr.type == "aggregation":
        # Handle aggregation expressions
        bindings_str = ", ".join(
            f"{b.index_var} in {b.set_name}" for b in expr.bindings
        )
        return f"{expr.op}({expr_to_string(expr.expr)} for {bindings_str})"
    return str(expr)  # Fallback for unexpected types


ComparisonOpType = Literal["le", "lt", "eq", "gt", "ge", "ne"]
comparison_op_to_symbol = {
    "le": "<=",
    "lt": "<",
    "eq": "=",
    "gt": ">",
    "ge": ">=",
    "ne": "!=",
}


class ComparisonExpression(BaseModel):
    """A comparison expression in the optimization problem."""

    type: Literal["comparison"]
    left: ExprType
    right: ExprType
    op: ComparisonOpType

    def display(self) -> str:
        """A string representation of the comparison expression."""

        left_str = Expression(self.left).display()
        right_str = Expression(self.right).display()
        return f"{left_str} {comparison_op_to_symbol[self.op]} {right_str}"

    @classmethod
    def create(
        cls,
        left: ExprType,
        right: ExprType,
        op: ComparisonOpType,
    ) -> ComparisonExpression:
        return ComparisonExpression(type="comparison", left=left, right=right, op=op)


AggOpType = Literal["sum", "prod", "min", "max"]


class IndexBinding(BaseModel):
    """Binding of an index variable to a set in an aggregation expression."""

    type: Literal["index_binding"]
    index_var: str
    set_name: str

    @classmethod
    def create(cls, index: str, over: str) -> IndexBinding:
        return IndexBinding(type="index_binding", index_var=index, set_name=over)


class AggregationExpression(BaseModel):
    """An aggregation expression in the optimization problem."""

    type: Literal["aggregation"]
    op: AggOpType
    expr: ExprType
    bindings: list[IndexBinding]
    condition: IndexComparisonExpr | None

    @classmethod
    def create(
        cls,
        op: AggOpType,
        expr: ExprType,
        indices: list[IndexBinding],
        condition: IndexComparisonExpr | None = None,
    ) -> AggregationExpression:
        return AggregationExpression(
            type="aggregation",
            op=op,
            expr=expr,
            bindings=indices,
            condition=condition,
        )


# Update ExprType to include AggregationExpression now that it's defined
# This allows aggregations to be used in binary operations and comparisons
ExprType = (
    NumberExpr
    | StringExpr
    | IndexVariableExpr
    | VariableExpr
    | ParameterExpr
    | BinaryOp
    | UnaryOp
    | AggregationExpression
)


class Expression(
    RootModel[ExprType]
):  # Use Any temporarily, will be updated after ExprType is defined
    def display(self) -> str:
        """A string representation of the expression."""
        return expr_to_string(self.root)
