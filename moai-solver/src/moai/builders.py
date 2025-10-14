from .expressions import (
    BinaryOp,
    BinaryOpType,
    ComparisonExpression,
    ExprType,
    IndexExprType,
    IndexVariableExpr,
    NumberExpr,
    ParameterExpr,
    StringExpr,
    UnaryOp,
    UnaryOpType,
    VariableExpr,
)


def var(
    name: str,
    index_expr: list[IndexExprType] | None = None,
) -> VariableExpr:
    """Helper function to create a Variable reference

    Args:
        name: Variable name
        index_expr: Index expressions

    Returns:
        Variable expression
    """
    return VariableExpr(
        type="variable",
        name=name,
        index_expr=index_expr,
    )


def param(name: str, index_expr: list[IndexExprType] | None = None) -> ParameterExpr:
    """Helper function to create a Parameter reference

    Args:
        name: Parameter name
        index_expr: Index expressions

    Returns:
        Parameter expression
    """
    return ParameterExpr(type="parameter", name=name, index_expr=index_expr)


def num(value: float | int) -> NumberExpr:
    """Helper function to create a Number literal

    Args:
        value: Numeric value

    Returns:
        Number expression
    """
    return NumberExpr(type="number", value=value)


def string(value: str) -> StringExpr:
    """Helper function to create a String literal

    Args:
        value: String value

    Returns:
        String expression
    """
    return StringExpr(type="string", value=value)


def binop(
    left: ExprType,
    right: ExprType,
    op: BinaryOpType,
) -> BinaryOp:
    """Helper function to create a binary operation expression

    Args:
        left: Left operand expression
        right: Right operand expression
        op: Operator as a string (e.g., "add", "sub", "mul", "div")

    Returns:
        BinaryOp expression wrapped in Expression
    """
    return BinaryOp(type="binary_op", op=op, left=left, right=right)


def unary_op(operand: ExprType, op: UnaryOpType) -> UnaryOp:
    """Helper function to create a unary operation expression

    Args:
        operand: Operand expression
        op: Operator as a string (e.g., "sub", "sin", "cos")

    Returns:
        UnaryOp expression wrapped in Expression
    """
    return UnaryOp(type="unary_op", op=op, expr=operand)


# Mathematical function builders
def sin(argument: ExprType) -> UnaryOp:
    """Helper function to create sin(x) expression"""
    return UnaryOp(type="unary_op", op="sin", expr=argument)


def cos(argument: ExprType) -> UnaryOp:
    """Helper function to create cos(x) expression"""
    return UnaryOp(type="unary_op", op="cos", expr=argument)


def tan(argument: ExprType) -> UnaryOp:
    """Helper function to create tan(x) expression"""
    return UnaryOp(type="unary_op", op="tan", expr=argument)


def exp(argument: ExprType) -> UnaryOp:
    """Helper function to create exp(x) expression"""
    return UnaryOp(type="unary_op", op="exp", expr=argument)


def log(argument: ExprType) -> UnaryOp:
    """Helper function to create log(x) expression"""
    return UnaryOp(type="unary_op", op="log", expr=argument)


# Unary operator builders
def negate(operand: ExprType) -> UnaryOp:
    """Helper function to create -x expression"""
    return UnaryOp(type="unary_op", op="sub", expr=operand)


# Comparison builders
def le(left: ExprType, right: ExprType) -> ComparisonExpression:
    """Helper function to create less-than-or-equal comparison: left <= right"""
    return ComparisonExpression.create(left, right, "le")


def lt(left: ExprType, right: ExprType) -> ComparisonExpression:
    """Helper function to create less-than comparison: left < right"""
    return ComparisonExpression.create(left, right, "lt")


def eq(left: ExprType, right: ExprType) -> ComparisonExpression:
    """Helper function to create equality comparison: left = right"""
    return ComparisonExpression.create(left, right, "eq")


def gt(left: ExprType, right: ExprType) -> ComparisonExpression:
    """Helper function to create greater-than comparison: left > right"""
    return ComparisonExpression.create(left, right, "gt")


def ge(left: ExprType, right: ExprType) -> ComparisonExpression:
    """Helper function to create greater-than-or-equal comparison: left >= right"""
    return ComparisonExpression.create(left, right, "ge")


# Index expression builders
def index_var(name: str) -> IndexVariableExpr:
    """Helper function to create an IndexVariable reference"""
    return IndexVariableExpr(type="index_variable", name=name)


def index_add(left: IndexExprType, right: IndexExprType) -> BinaryOp:
    """Helper function to create index addition: left + right"""
    return BinaryOp.create("add", left, right)


def index_sub(left: IndexExprType, right: IndexExprType) -> BinaryOp:
    """Helper function to create index subtraction: left - right"""
    return BinaryOp.create("sub", left, right)


def index_negate(expr: IndexExprType) -> UnaryOp:
    """Helper function to create index negation: -expr"""
    return UnaryOp.create("sub", expr)
