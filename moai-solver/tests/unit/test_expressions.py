from moai.expressions import (
    BinaryOp,
    ComparisonExpression,
    Expression,
    IndexExpression,
    IndexVariableExpr,
    NumberExpr,
    ParameterExpr,
    StringExpr,
    UnaryOp,
    VariableExpr,
)


class TestNumberExpr:
    """Tests for NumberExpr model"""

    def test_create_int_number(self):
        """Test creating a number expression with an integer"""
        num = NumberExpr.create(value=5)
        assert num.type == "number"
        assert num.value == 5

    def test_create_float_number(self):
        """Test creating a number expression with a float"""
        num = NumberExpr.create(value=3.14)
        assert num.type == "number"
        assert num.value == 3.14

    def test_model_validate_number(self):
        """Test validating a number expression from dict"""
        num = NumberExpr.model_validate({"type": "number", "value": 10})
        assert num.type == "number"
        assert num.value == 10


class TestStringExpr:
    """Tests for StringExpr model"""

    def test_create_string(self):
        """Test creating a string expression"""
        s = StringExpr.create(value="test")
        assert s.type == "string"
        assert s.value == "test"

    def test_model_validate_string(self):
        """Test validating a string expression from dict"""
        s = StringExpr.model_validate({"type": "string", "value": "hello"})
        assert s.type == "string"
        assert s.value == "hello"


class TestIndexVariableExpr:
    """Tests for IndexVariableExpr model"""

    def test_create_index_variable(self):
        """Test creating an index variable expression"""
        idx = IndexVariableExpr.create("i")
        assert idx.type == "index_variable"
        assert idx.name == "i"

    def test_model_validate_index_variable(self):
        """Test validating an index variable from dict"""
        idx = IndexVariableExpr.model_validate({"type": "index_variable", "name": "j"})
        assert idx.type == "index_variable"
        assert idx.name == "j"


class TestIndexBinaryExpr:
    """Tests for BinaryOp used as index expressions"""

    def test_create_index_add(self):
        """Test creating an index addition expression using BinaryOp"""
        left = IndexVariableExpr.create("i")
        right = NumberExpr.create(value=1)
        expr = BinaryOp.create("add", left, right)
        assert expr.type == "binary_op"
        assert expr.op == "add"
        assert expr.left == left
        assert expr.right == right

    def test_create_index_sub(self):
        """Test creating an index subtraction expression using BinaryOp"""
        left = IndexVariableExpr.create("t")
        right = NumberExpr.create(value=1)
        expr = BinaryOp.create("sub", left, right)
        assert expr.type == "binary_op"
        assert expr.op == "sub"

    def test_model_validate_index_binary(self):
        """Test validating an index binary expression from dict"""
        expr = BinaryOp.model_validate(
            {
                "type": "binary_op",
                "op": "add",
                "left": {"type": "index_variable", "name": "i"},
                "right": {"type": "number", "value": 1},
            }
        )
        assert expr.type == "binary_op"
        assert expr.op == "add"


class TestIndexUnaryExpr:
    """Tests for UnaryOp used as index expressions"""

    def test_create_index_unary_sub(self):
        """Test creating an index unary negation expression using UnaryOp"""
        inner = IndexVariableExpr.create("i")
        expr = UnaryOp.create("sub", inner)
        assert expr.type == "unary_op"
        assert expr.op == "sub"
        assert expr.expr == inner

    def test_model_validate_index_unary(self):
        """Test validating an index unary expression from dict"""
        expr = UnaryOp.model_validate(
            {
                "type": "unary_op",
                "op": "sub",
                "expr": {"type": "index_variable", "name": "j"},
            }
        )
        assert expr.type == "unary_op"
        assert expr.op == "sub"


class TestIndexExpression:
    """Tests for IndexExpression root model"""

    def test_display_index_variable(self):
        """Test displaying an index variable"""
        expr = IndexExpression.model_validate({"type": "index_variable", "name": "i"})
        assert expr.display() == "i"

    def test_display_index_number(self):
        """Test displaying a number in index"""
        expr = IndexExpression.model_validate({"type": "number", "value": 5})
        assert expr.display() == "5"

    def test_display_index_string(self):
        """Test displaying a string in index"""
        expr = IndexExpression.model_validate({"type": "string", "value": "a"})
        assert expr.display() == "a"

    def test_display_index_binary_add(self):
        """Test displaying index binary addition: i+1 using BinaryOp"""
        expr = IndexExpression.model_validate(
            {
                "type": "binary_op",
                "op": "add",
                "left": {"type": "index_variable", "name": "i"},
                "right": {"type": "number", "value": 1},
            }
        )
        assert expr.display() == "(i + 1)"

    def test_display_index_binary_sub(self):
        """Test displaying index binary subtraction: t-1 using BinaryOp"""
        expr = IndexExpression.model_validate(
            {
                "type": "binary_op",
                "op": "sub",
                "left": {"type": "index_variable", "name": "t"},
                "right": {"type": "number", "value": 1},
            }
        )
        assert expr.display() == "(t - 1)"

    def test_display_index_unary(self):
        """Test displaying index unary negation: -i using UnaryOp"""
        expr = IndexExpression.model_validate(
            {
                "type": "unary_op",
                "op": "sub",
                "expr": {"type": "index_variable", "name": "i"},
            }
        )
        assert expr.display() == "(-i)"

    def test_display_nested_index_binary(self):
        """Test displaying nested index binary: (i+1)+2 using BinaryOp"""
        expr = IndexExpression.model_validate(
            {
                "type": "binary_op",
                "op": "add",
                "left": {
                    "type": "binary_op",
                    "op": "add",
                    "left": {"type": "index_variable", "name": "i"},
                    "right": {"type": "number", "value": 1},
                },
                "right": {"type": "number", "value": 2},
            }
        )
        assert expr.display() == "((i + 1) + 2)"


class TestVariableExpr:
    """Tests for VariableExpr model"""

    def test_create_simple_variable(self):
        """Test creating a simple variable without indices"""
        var = VariableExpr.create("x")
        assert var.type == "variable"
        assert var.name == "x"
        assert var.index_expr is None

    def test_create_indexed_variable(self):
        """Test creating an indexed variable"""
        indices: list = [IndexVariableExpr.create("i")]
        var = VariableExpr.create("x", indices)
        assert var.type == "variable"
        assert var.name == "x"
        assert var.index_expr == indices

    def test_model_validate_simple_variable(self):
        """Test validating a simple variable from dict"""
        var = VariableExpr.model_validate(
            {"type": "variable", "name": "y", "index_expr": None}
        )
        assert var.type == "variable"
        assert var.name == "y"

    def test_model_validate_indexed_variable(self):
        """Test validating an indexed variable from dict"""
        var = VariableExpr.model_validate(
            {
                "type": "variable",
                "name": "x",
                "index_expr": [{"type": "index_variable", "name": "i"}],
            }
        )
        assert var.type == "variable"
        assert var.name == "x"
        assert var.index_expr is not None
        assert len(var.index_expr) == 1


class TestParameterExpr:
    """Tests for ParameterExpr model"""

    def test_create_simple_parameter(self):
        """Test creating a simple parameter without indices"""
        param = ParameterExpr.create("p")
        assert param.type == "parameter"
        assert param.name == "p"
        assert param.index_expr is None

    def test_create_indexed_parameter(self):
        """Test creating an indexed parameter"""
        indices: list = [IndexVariableExpr.create("i")]
        param = ParameterExpr.create("c", indices)
        assert param.type == "parameter"
        assert param.name == "c"
        assert param.index_expr == indices

    def test_model_validate_simple_parameter(self):
        """Test validating a simple parameter from dict"""
        param = ParameterExpr.model_validate(
            {"type": "parameter", "name": "alpha", "index_expr": None}
        )
        assert param.type == "parameter"
        assert param.name == "alpha"

    def test_model_validate_indexed_parameter(self):
        """Test validating an indexed parameter from dict"""
        param = ParameterExpr.model_validate(
            {
                "type": "parameter",
                "name": "cost",
                "index_expr": [{"type": "index_variable", "name": "i"}],
            }
        )
        assert param.type == "parameter"
        assert param.name == "cost"
        assert param.index_expr is not None
        assert len(param.index_expr) == 1


class TestUnaryOp:
    """Tests for UnaryOp model"""

    def test_create_unary_sub(self):
        """Test creating a unary negation"""
        var = VariableExpr.create("x")
        expr = UnaryOp.create("sub", var)
        assert expr.type == "unary_op"
        assert expr.op == "sub"
        assert expr.expr == var

    def test_create_unary_sin(self):
        """Test creating a sine unary operation"""
        var = VariableExpr.create("theta")
        expr = UnaryOp.create("sin", var)
        assert expr.type == "unary_op"
        assert expr.op == "sin"

    def test_create_unary_cos(self):
        """Test creating a cosine unary operation"""
        var = VariableExpr.create("theta")
        expr = UnaryOp.create("cos", var)
        assert expr.op == "cos"

    def test_create_unary_tan(self):
        """Test creating a tangent unary operation"""
        var = VariableExpr.create("theta")
        expr = UnaryOp.create("tan", var)
        assert expr.op == "tan"

    def test_create_unary_exp(self):
        """Test creating an exponential unary operation"""
        var = VariableExpr.create("x")
        expr = UnaryOp.create("exp", var)
        assert expr.op == "exp"

    def test_create_unary_log(self):
        """Test creating a logarithm unary operation"""
        var = VariableExpr.create("x")
        expr = UnaryOp.create("log", var)
        assert expr.op == "log"

    def test_model_validate_unary_op(self):
        """Test validating a unary operation from dict"""
        expr = UnaryOp.model_validate(
            {
                "type": "unary_op",
                "op": "sin",
                "expr": {"type": "variable", "name": "x", "index_expr": None},
            }
        )
        assert expr.type == "unary_op"
        assert expr.op == "sin"


class TestBinaryOp:
    """Tests for BinaryOp model"""

    def test_create_binary_add(self):
        """Test creating a binary addition"""
        left = NumberExpr.create(value=5)
        right = NumberExpr.create(value=10)
        expr = BinaryOp.create(op="add", left=left, right=right)
        assert expr.type == "binary_op"
        assert expr.op == "add"
        assert expr.left == left
        assert expr.right == right

    def test_create_binary_sub(self):
        """Test creating a binary subtraction"""
        left = VariableExpr.create("x")
        right = NumberExpr.create(value=3)
        expr = BinaryOp.create(op="sub", left=left, right=right)
        assert expr.op == "sub"

    def test_create_binary_mul(self):
        """Test creating a binary multiplication"""
        left = VariableExpr.create("x")
        right = ParameterExpr.create("c")
        expr = BinaryOp.create(op="mul", left=left, right=right)
        assert expr.op == "mul"

    def test_create_binary_div(self):
        """Test creating a binary division"""
        left = VariableExpr.create("x")
        right = NumberExpr.create(value=2)
        expr = BinaryOp.create(op="div", left=left, right=right)
        assert expr.op == "div"

    def test_model_validate_binary_op(self):
        """Test validating a binary operation from dict"""
        expr = BinaryOp.model_validate(
            {
                "type": "binary_op",
                "op": "mul",
                "left": {"type": "number", "value": 5},
                "right": {"type": "number", "value": 3},
            }
        )
        assert expr.type == "binary_op"
        assert expr.op == "mul"

    def test_nested_binary_ops(self):
        """Test creating nested binary operations: (x + 2) * 3"""
        inner = BinaryOp.create(
            op="add", left=VariableExpr.create("x"), right=NumberExpr.create(value=2)
        )
        outer = BinaryOp.create(op="mul", left=inner, right=NumberExpr.create(value=3))
        assert outer.type == "binary_op"
        assert outer.op == "mul"
        assert outer.left == inner


class TestExpression:
    """Tests for Expression root model"""

    def test_display_simple_number(self):
        """Test displaying a simple number expression"""
        expr = Expression.model_validate({"type": "number", "value": 42})
        assert expr.display() == "42"

    def test_display_simple_variable(self):
        """Test displaying a simple variable"""
        expr = Expression.model_validate(
            {"type": "variable", "name": "x", "index_expr": None}
        )
        assert expr.display() == "x"

    def test_display_indexed_variable(self):
        """Test displaying an indexed variable: x[i]"""
        expr = Expression.model_validate(
            {
                "type": "variable",
                "name": "x",
                "index_expr": [{"type": "index_variable", "name": "i"}],
            }
        )
        assert expr.display() == "x[i]"

    def test_display_multi_indexed_variable(self):
        """Test displaying a multi-indexed variable: x[i,j]"""
        expr = Expression.model_validate(
            {
                "type": "variable",
                "name": "x",
                "index_expr": [
                    {"type": "index_variable", "name": "i"},
                    {"type": "index_variable", "name": "j"},
                ],
            }
        )
        assert expr.display() == "x[i, j]"

    def test_display_variable_with_index_expr(self):
        """Test displaying variable with index expression: x[t-1,i] using BinaryOp"""
        expr = Expression.model_validate(
            {
                "type": "variable",
                "name": "x",
                "index_expr": [
                    {
                        "type": "binary_op",
                        "op": "sub",
                        "left": {"type": "index_variable", "name": "t"},
                        "right": {"type": "number", "value": 1},
                    },
                    {"type": "index_variable", "name": "i"},
                ],
            }
        )
        assert expr.display() == "x[(t - 1), i]"

    def test_display_simple_parameter(self):
        """Test displaying a simple parameter"""
        expr = Expression.model_validate(
            {"type": "parameter", "name": "p", "index_expr": None}
        )
        assert expr.display() == "p"

    def test_display_indexed_parameter(self):
        """Test displaying an indexed parameter: cost[i]"""
        expr = Expression.model_validate(
            {
                "type": "parameter",
                "name": "cost",
                "index_expr": [{"type": "index_variable", "name": "i"}],
            }
        )
        assert expr.display() == "cost[i]"

    def test_display_binary_add(self):
        """Test displaying binary addition: 5 + 10"""
        expr = Expression.model_validate(
            {
                "type": "binary_op",
                "op": "add",
                "left": {"type": "number", "value": 5},
                "right": {"type": "number", "value": 10},
            }
        )
        assert expr.display() == "(5 + 10)"

    def test_display_binary_sub(self):
        """Test displaying binary subtraction: x - 3"""
        expr = Expression.model_validate(
            {
                "type": "binary_op",
                "op": "sub",
                "left": {"type": "variable", "name": "x", "index_expr": None},
                "right": {"type": "number", "value": 3},
            }
        )
        assert expr.display() == "(x - 3)"

    def test_display_binary_mul(self):
        """Test displaying binary multiplication: x * 2"""
        expr = Expression.model_validate(
            {
                "type": "binary_op",
                "op": "mul",
                "left": {"type": "variable", "name": "x", "index_expr": None},
                "right": {"type": "number", "value": 2},
            }
        )
        assert expr.display() == "(x * 2)"

    def test_display_binary_div(self):
        """Test displaying binary division: x / 2"""
        expr = Expression.model_validate(
            {
                "type": "binary_op",
                "op": "div",
                "left": {"type": "variable", "name": "x", "index_expr": None},
                "right": {"type": "number", "value": 2},
            }
        )
        assert expr.display() == "(x / 2)"

    def test_display_unary_sub(self):
        """Test displaying unary negation: -x"""
        expr = Expression.model_validate(
            {
                "type": "unary_op",
                "op": "sub",
                "expr": {"type": "variable", "name": "x", "index_expr": None},
            }
        )
        assert expr.display() == "(-x)"

    def test_display_unary_sin(self):
        """Test displaying sine function: sin(x)"""
        expr = Expression.model_validate(
            {
                "type": "unary_op",
                "op": "sin",
                "expr": {"type": "variable", "name": "x", "index_expr": None},
            }
        )
        assert expr.display() == "(sinx)"

    def test_display_unary_cos(self):
        """Test displaying cosine function: cos(x)"""
        expr = Expression.model_validate(
            {
                "type": "unary_op",
                "op": "cos",
                "expr": {"type": "variable", "name": "x", "index_expr": None},
            }
        )
        assert expr.display() == "(cosx)"

    def test_display_unary_tan(self):
        """Test displaying tangent function: tan(x)"""
        expr = Expression.model_validate(
            {
                "type": "unary_op",
                "op": "tan",
                "expr": {"type": "variable", "name": "x", "index_expr": None},
            }
        )
        assert expr.display() == "(tanx)"

    def test_display_unary_exp(self):
        """Test displaying exponential function: exp(x)"""
        expr = Expression.model_validate(
            {
                "type": "unary_op",
                "op": "exp",
                "expr": {"type": "variable", "name": "x", "index_expr": None},
            }
        )
        assert expr.display() == "(expx)"

    def test_display_unary_log(self):
        """Test displaying logarithm function: log(x)"""
        expr = Expression.model_validate(
            {
                "type": "unary_op",
                "op": "log",
                "expr": {"type": "variable", "name": "x", "index_expr": None},
            }
        )
        assert expr.display() == "(logx)"

    def test_display_nested_binary_ops(self):
        """Test displaying nested binary operations: (x + 2) * 3"""
        expr = Expression.model_validate(
            {
                "type": "binary_op",
                "op": "mul",
                "left": {
                    "type": "binary_op",
                    "op": "add",
                    "left": {"type": "variable", "name": "x", "index_expr": None},
                    "right": {"type": "number", "value": 2},
                },
                "right": {"type": "number", "value": 3},
            }
        )
        assert expr.display() == "((x + 2) * 3)"

    def test_display_expr_with_variables(self):
        """Test displaying expression with variables: (x + 2) * (-y)"""
        expr = Expression.model_validate(
            {
                "type": "binary_op",
                "op": "mul",
                "left": {
                    "type": "binary_op",
                    "op": "add",
                    "left": {"type": "variable", "name": "x", "index_expr": None},
                    "right": {"type": "number", "value": 2},
                },
                "right": {
                    "type": "unary_op",
                    "op": "sub",
                    "expr": {"type": "variable", "name": "y", "index_expr": None},
                },
            }
        )
        assert expr.display() == "((x + 2) * (-y))"

    def test_display_expr_with_parameter_and_variables(self):
        """Test displaying expression with parameter and variables: p * (x + 2)"""
        expr = Expression.model_validate(
            {
                "type": "binary_op",
                "op": "mul",
                "left": {"type": "parameter", "name": "p", "index_expr": None},
                "right": {
                    "type": "binary_op",
                    "op": "add",
                    "left": {"type": "variable", "name": "x", "index_expr": None},
                    "right": {"type": "number", "value": 2},
                },
            }
        )
        assert expr.display() == "(p * (x + 2))"

    def test_display_complex_nested_expr(self):
        """Test displaying complex nested expression"""
        expr = Expression.model_validate(
            {
                "type": "binary_op",
                "op": "add",
                "left": {
                    "type": "binary_op",
                    "op": "mul",
                    "left": {"type": "number", "value": 2},
                    "right": {
                        "type": "unary_op",
                        "op": "sin",
                        "expr": {
                            "type": "variable",
                            "name": "x",
                            "index_expr": None,
                        },
                    },
                },
                "right": {
                    "type": "binary_op",
                    "op": "div",
                    "left": {"type": "parameter", "name": "p", "index_expr": None},
                    "right": {"type": "number", "value": 3},
                },
            }
        )
        assert expr.display() == "((2 * (sinx)) + (p / 3))"


class TestComparisonExpression:
    """Tests for ComparisonExpression model"""

    def test_create_comparison_le(self):
        """Test creating a less-than-or-equal comparison"""
        left = VariableExpr.create("x")
        right = NumberExpr.create(value=10)
        comp = ComparisonExpression.create(left, right, "le")
        assert comp.type == "comparison"
        assert comp.op == "le"
        assert comp.left == left
        assert comp.right == right

    def test_create_comparison_lt(self):
        """Test creating a less-than comparison"""
        left = VariableExpr.create("x")
        right = NumberExpr.create(value=10)
        comp = ComparisonExpression.create(left, right, "lt")
        assert comp.op == "lt"

    def test_create_comparison_eq(self):
        """Test creating an equality comparison"""
        left = VariableExpr.create("x")
        right = NumberExpr.create(value=5)
        comp = ComparisonExpression.create(left, right, "eq")
        assert comp.op == "eq"

    def test_create_comparison_gt(self):
        """Test creating a greater-than comparison"""
        left = VariableExpr.create("x")
        right = NumberExpr.create(value=0)
        comp = ComparisonExpression.create(left, right, "gt")
        assert comp.op == "gt"

    def test_create_comparison_ge(self):
        """Test creating a greater-than-or-equal comparison"""
        left = VariableExpr.create("x")
        right = NumberExpr.create(value=0)
        comp = ComparisonExpression.create(left, right, "ge")
        assert comp.op == "ge"

    def test_display_comparison_le(self):
        """Test displaying less-than-or-equal comparison: x <= 10"""
        comp = ComparisonExpression.model_validate(
            {
                "type": "comparison",
                "left": {"type": "variable", "name": "x", "index_expr": None},
                "op": "le",
                "right": {"type": "number", "value": 10},
            }
        )
        assert comp.display() == "x <= 10"

    def test_display_comparison_lt(self):
        """Test displaying less-than comparison: x < 10"""
        comp = ComparisonExpression.model_validate(
            {
                "type": "comparison",
                "left": {"type": "variable", "name": "x", "index_expr": None},
                "op": "lt",
                "right": {"type": "number", "value": 10},
            }
        )
        assert comp.display() == "x < 10"

    def test_display_comparison_eq(self):
        """Test displaying equality comparison: x = 5"""
        comp = ComparisonExpression.model_validate(
            {
                "type": "comparison",
                "left": {"type": "variable", "name": "x", "index_expr": None},
                "op": "eq",
                "right": {"type": "number", "value": 5},
            }
        )
        assert comp.display() == "x = 5"

    def test_display_comparison_gt(self):
        """Test displaying greater-than comparison: x > 0"""
        comp = ComparisonExpression.model_validate(
            {
                "type": "comparison",
                "left": {"type": "variable", "name": "x", "index_expr": None},
                "op": "gt",
                "right": {"type": "number", "value": 0},
            }
        )
        assert comp.display() == "x > 0"

    def test_display_comparison_ge(self):
        """Test displaying greater-than-or-equal comparison: x >= 0"""
        comp = ComparisonExpression.model_validate(
            {
                "type": "comparison",
                "left": {"type": "variable", "name": "x", "index_expr": None},
                "op": "ge",
                "right": {"type": "number", "value": 0},
            }
        )
        assert comp.display() == "x >= 0"

    def test_display_comparison_with_complex_exprs(self):
        """Test displaying comparison with complex expressions: (x + 2) <= (y * 3)"""
        comp = ComparisonExpression.model_validate(
            {
                "type": "comparison",
                "left": {
                    "type": "binary_op",
                    "op": "add",
                    "left": {"type": "variable", "name": "x", "index_expr": None},
                    "right": {"type": "number", "value": 2},
                },
                "op": "le",
                "right": {
                    "type": "binary_op",
                    "op": "mul",
                    "left": {"type": "variable", "name": "y", "index_expr": None},
                    "right": {"type": "number", "value": 3},
                },
            }
        )
        assert comp.display() == "(x + 2) <= (y * 3)"

    def test_model_validate_comparison(self):
        """Test validating a comparison expression from dict"""
        comp = ComparisonExpression.model_validate(
            {
                "type": "comparison",
                "left": {"type": "number", "value": 5},
                "op": "eq",
                "right": {"type": "number", "value": 5},
            }
        )
        assert comp.type == "comparison"
        assert comp.op == "eq"
        assert comp.display() == "5 = 5"
