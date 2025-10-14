"""Tests for builder functions"""

from moai.builders import (
    cos,
    eq,
    exp,
    ge,
    gt,
    index_add,
    index_negate,
    index_sub,
    index_var,
    le,
    log,
    lt,
    negate,
    num,
    param,
    sin,
    string,
    tan,
    var,
)
from moai.expressions import Expression


class TestBasicBuilders:
    """Tests for basic builder functions"""

    def test_num_builder(self):
        """Test num() builder"""
        n = num(42)
        assert n.type == "number"
        assert n.value == 42

    def test_string_builder(self):
        """Test string() builder"""
        s = string("hello")
        assert s.type == "string"
        assert s.value == "hello"

    def test_var_builder_simple(self):
        """Test var() builder without indices"""
        x = var("x")
        assert x.type == "variable"
        assert x.name == "x"
        assert x.index_expr is None

    def test_var_builder_with_indices(self):
        """Test var() builder with indices"""
        i = index_var("i")
        x = var("x", [i])
        assert x.type == "variable"
        assert x.name == "x"
        assert x.index_expr is not None
        assert len(x.index_expr) == 1

    def test_param_builder_simple(self):
        """Test param() builder without indices"""
        p = param("cost")
        assert p.type == "parameter"
        assert p.name == "cost"
        assert p.index_expr is None

    def test_param_builder_with_indices(self):
        """Test param() builder with indices"""
        i = index_var("i")
        c = param("cost", [i])
        assert c.type == "parameter"
        assert c.name == "cost"
        assert c.index_expr is not None
        assert len(c.index_expr) == 1

    def test_index_var_builder(self):
        """Test index_var() builder"""
        i = index_var("i")
        assert i.type == "index_variable"
        assert i.name == "i"


class TestIndexBuilders:
    """Tests for index expression builders"""

    def test_index_add_builder(self):
        """Test index_add() builder - now returns BinaryOp"""
        i = index_var("i")
        n = num(1)
        expr = index_add(i, n)
        assert expr.type == "binary_op"
        assert expr.op == "add"

    def test_index_sub_builder(self):
        """Test index_sub() builder - now returns BinaryOp"""
        t = index_var("t")
        n = num(1)
        expr = index_sub(t, n)
        assert expr.type == "binary_op"
        assert expr.op == "sub"

    def test_index_negate_builder(self):
        """Test index_negate() builder - now returns UnaryOp"""
        i = index_var("i")
        expr = index_negate(i)
        assert expr.type == "unary_op"
        assert expr.op == "sub"


class TestMathBuilders:
    """Tests for mathematical function builders"""

    def test_sin_builder(self):
        """Test sin() builder"""
        x = var("x")
        expr = sin(x)
        assert Expression(expr).display() == "(sinx)"

    def test_cos_builder(self):
        """Test cos() builder"""
        x = var("x")
        expr = cos(x)
        assert Expression(expr).display() == "(cosx)"

    def test_tan_builder(self):
        """Test tan() builder"""
        x = var("x")
        expr = tan(x)
        assert Expression(expr).display() == "(tanx)"

    def test_exp_builder(self):
        """Test exp() builder"""
        x = var("x")
        expr = exp(x)
        assert Expression(expr).display() == "(expx)"

    def test_log_builder(self):
        """Test log() builder"""
        x = var("x")
        expr = log(x)
        assert Expression(expr).display() == "(logx)"

    def test_negate_builder(self):
        """Test negate() builder"""
        x = var("x")
        expr = negate(x)
        assert Expression(expr).display() == "(-x)"


class TestComparisonBuilders:
    """Tests for comparison expression builders"""

    def test_le_builder(self):
        """Test le() builder for less-than-or-equal"""
        x = var("x")
        n = num(10)
        comp = le(x, n)
        assert comp.type == "comparison"
        assert comp.op == "le"
        assert comp.display() == "x <= 10"

    def test_lt_builder(self):
        """Test lt() builder for less-than"""
        x = var("x")
        n = num(10)
        comp = lt(x, n)
        assert comp.op == "lt"
        assert comp.display() == "x < 10"

    def test_eq_builder(self):
        """Test eq() builder for equality"""
        x = var("x")
        n = num(5)
        comp = eq(x, n)
        assert comp.op == "eq"
        assert comp.display() == "x = 5"

    def test_gt_builder(self):
        """Test gt() builder for greater-than"""
        x = var("x")
        n = num(0)
        comp = gt(x, n)
        assert comp.op == "gt"
        assert comp.display() == "x > 0"

    def test_ge_builder(self):
        """Test ge() builder for greater-than-or-equal"""
        x = var("x")
        n = num(0)
        comp = ge(x, n)
        assert comp.op == "ge"
        assert comp.display() == "x >= 0"


class TestComplexExpressions:
    """Tests for building complex expressions"""

    def test_variable_with_index_expression(self):
        """Test creating a variable with complex index: x[i+1]"""
        i = index_var("i")
        n = num(1)
        idx = index_add(i, n)
        x = var("x", [idx])
        expr = Expression(x)
        assert expr.display() == "x[(i + 1)]"

    def test_variable_with_multiple_indices(self):
        """Test creating a variable with multiple indices: x[t-1,i]"""
        t = index_var("t")
        i = index_var("i")
        n = num(1)
        t_minus_1 = index_sub(t, n)
        x = var("x", [t_minus_1, i])
        expr = Expression(x)
        assert expr.display() == "x[(t - 1), i]"

    def test_parameter_with_index(self):
        """Test creating an indexed parameter: cost[i]"""
        i = index_var("i")
        c = param("cost", [i])
        expr = Expression(c)
        assert expr.display() == "cost[i]"
