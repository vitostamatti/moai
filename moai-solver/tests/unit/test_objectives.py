"""Tests for Objective model"""

from moai.expressions import (
    BinaryOp,
    Expression,
    NumberExpr,
    VariableExpr,
)
from moai.objectives import Objective


class TestObjective:
    """Tests for Objective model"""

    def test_create_minimize_objective_simple(self):
        """Test creating a minimization objective with simple expression"""
        expr = NumberExpr.create(value=5)
        obj = Objective(name="min_obj", expr=expr, sense="min")
        assert obj.sense == "min"
        assert obj.expr == expr

    def test_create_maximize_objective_simple(self):
        """Test creating a maximization objective with simple expression"""
        expr = NumberExpr.create(value=10)
        obj = Objective(name="max_obj", expr=expr, sense="max")
        assert obj.sense == "max"
        assert obj.expr == expr

    def test_default_sense_is_minimize(self):
        """Test that default sense is minimize"""
        expr = VariableExpr.create(name="x", index_expr=[])
        obj = Objective(name="default_min_obj", expr=expr)
        assert obj.sense == "min"

    def test_objective_with_variable_expression(self):
        """Test creating objective with variable expression"""
        var_expr = VariableExpr.create(name="x", index_expr=[])
        obj = Objective(name="var_obj", expr=var_expr, sense="min")
        assert obj.expr.type == "variable"
        assert obj.expr.name == "x"

    def test_objective_with_binary_expression(self):
        """Test creating objective with binary expression"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=5)
        expr = Expression(BinaryOp.create(op="mul", left=left, right=right))
        obj = Objective(name="bin_obj", expr=expr.root, sense="max")
        assert obj.sense == "max"
        assert obj.expr.type == "binary_op"

    def test_objective_with_complex_expression(self):
        """Test creating objective with complex nested expression"""
        # Objective: minimize 2*x + 3*y
        x = VariableExpr.create(name="x", index_expr=[])
        y = VariableExpr.create(name="y", index_expr=[])
        two = NumberExpr.create(value=2)
        three = NumberExpr.create(value=3)

        term1 = BinaryOp.create(op="mul", left=two, right=x)
        term2 = BinaryOp.create(op="mul", left=three, right=y)
        expr = BinaryOp.create(op="add", left=term1, right=term2)

        obj = Objective(name="complex_obj", expr=expr, sense="min")
        assert obj.sense == "min"
        assert obj.expr.type == "binary_op"
        assert obj.expr.op == "add"

    def test_model_validate_minimize(self):
        """Test validating a minimize objective from dict"""
        obj = Objective.model_validate(
            {
                "name": "minimize_cost",
                "expr": {"type": "number", "value": 5},
                "sense": "min",
            }
        )
        assert obj.sense == "min"
        assert obj.expr.type == "number"
        assert obj.expr.value == 5

    def test_model_validate_maximize(self):
        """Test validating a maximize objective from dict"""
        obj = Objective.model_validate(
            {
                "name": "max_profit_obj",
                "expr": {"type": "variable", "name": "profit", "index_expr": []},
                "sense": "max",
            }
        )
        assert obj.sense == "max"
        assert obj.expr.type == "variable"
        assert obj.expr.name == "profit"

    def test_model_validate_default_sense(self):
        """Test validating objective without sense (should default to min)"""
        obj = Objective.model_validate(
            {"name": "default_min_obj", "expr": {"type": "number", "value": 10}}
        )
        assert obj.sense == "min"

    def test_objective_with_indexed_variable(self):
        """Test creating objective with indexed variable"""
        var_expr = VariableExpr.create(
            name="x", index_expr=[NumberExpr.create(value=1)]
        )
        obj = Objective(name="var_obj", expr=var_expr, sense="min")
        assert obj.expr.type == "variable"
        assert obj.expr.name == "x"
        assert var_expr.index_expr is not None
        assert len(var_expr.index_expr) == 1

    def test_minimize_cost_objective(self):
        """Test typical cost minimization objective"""
        cost = VariableExpr.create(name="total_cost", index_expr=[])
        obj = Objective(name="min_cost_obj", expr=cost, sense="min")
        assert obj.sense == "min"
        assert cost.name == "total_cost"

    def test_maximize_profit_objective(self):
        """Test typical profit maximization objective"""
        profit = VariableExpr.create(name="total_profit", index_expr=[])
        obj = Objective(name="max_profit_obj", expr=profit, sense="max")
        assert obj.sense == "max"
        assert profit.name == "total_profit"
