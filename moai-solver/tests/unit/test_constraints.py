from moai.constraints import Constraint, Quantifier
from moai.expressions import (
    ComparisonExpression,
    NumberExpr,
    VariableExpr,
)


class TestQuantifier:
    """Tests for Quantifier model"""

    def test_create_simple_quantifier(self):
        """Test creating a simple quantifier without condition"""
        q = Quantifier.create(index="i", over="I")
        assert q.index == "i"
        assert q.over == "I"
        assert q.condition is None

    def test_create_quantifier_with_condition(self):
        """Test creating a quantifier with a condition"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=5)
        condition = ComparisonExpression.create(left=left, right=right, op="gt")

        q = Quantifier.create(index="i", over="I", condition=condition)
        assert q.index == "i"
        assert q.over == "I"
        assert q.condition is not None
        assert q.condition.op == "gt"

    def test_display_simple_quantifier(self):
        """Test display string for simple quantifier"""
        q = Quantifier.create(index="i", over="I")
        assert q.display() == "for i in I"

    def test_display_quantifier_with_condition(self):
        """Test display string for quantifier with condition"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=5)
        condition = ComparisonExpression.create(left=left, right=right, op="gt")

        q = Quantifier.create(index="i", over="I", condition=condition)
        display = q.display()
        assert display.startswith("for i in I if")
        assert ">" in display

    def test_model_validate_simple(self):
        """Test validating a simple quantifier from dict"""
        q = Quantifier.model_validate({"index": "j", "over": "J", "condition": None})
        assert q.index == "j"
        assert q.over == "J"
        assert q.condition is None

    def test_quantifier_different_index_names(self):
        """Test quantifiers with different index names"""
        q1 = Quantifier.create(index="i", over="Cities")
        q2 = Quantifier.create(index="j", over="Warehouses")
        q3 = Quantifier.create(index="t", over="TimePeriods")

        assert q1.index == "i"
        assert q2.index == "j"
        assert q3.index == "t"
        assert q1.over == "Cities"
        assert q2.over == "Warehouses"
        assert q3.over == "TimePeriods"


class TestConstraint:
    """Tests for Constraint model"""

    def test_create_simple_constraint(self):
        """Test creating a simple constraint without quantifiers"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=10)
        expr = ComparisonExpression.create(left=left, right=right, op="le")

        c = Constraint.create(name="simple_constraint", expr=expr)
        assert c.type == "constraint"
        assert c.expr == expr
        assert c.quantifiers is None

    def test_create_constraint_with_single_quantifier(self):
        """Test creating a constraint with a single quantifier"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=5)
        expr = ComparisonExpression.create(left=left, right=right, op="eq")

        quantifier = Quantifier.create(index="i", over="I")
        c = Constraint.create(
            name="single_quantifier_constraint", expr=expr, quantifiers=[quantifier]
        )

        assert c.type == "constraint"
        assert c.quantifiers is not None
        assert len(c.quantifiers) == 1
        assert c.quantifiers[0].index == "i"

    def test_create_constraint_with_multiple_quantifiers(self):
        """Test creating a constraint with multiple quantifiers"""
        left = VariableExpr.create(name="flow", index_expr=[])
        right = NumberExpr.create(value=100)
        expr = ComparisonExpression.create(left=left, right=right, op="le")

        q1 = Quantifier.create(index="i", over="I")
        q2 = Quantifier.create(index="j", over="J")
        c = Constraint.create(
            name="multiple_quantifiers_constraint", expr=expr, quantifiers=[q1, q2]
        )

        assert c.type == "constraint"
        assert c.quantifiers is not None
        assert len(c.quantifiers) == 2
        assert c.quantifiers[0].index == "i"
        assert c.quantifiers[1].index == "j"

    def test_display_simple_constraint(self):
        """Test display string for simple constraint"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=10)
        expr = ComparisonExpression.create(left=left, right=right, op="le")

        c = Constraint.create(name="simple_constraint", expr=expr)
        display = c.display()
        assert "<=" in display or "le" in display.lower()

    def test_display_constraint_with_quantifier(self):
        """Test display string for constraint with quantifier"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=5)
        expr = ComparisonExpression.create(left=left, right=right, op="eq")

        quantifier = Quantifier.create(index="i", over="I")
        c = Constraint.create(
            name="single_quantifier_constraint", expr=expr, quantifiers=[quantifier]
        )

        display = c.display()
        assert "for i in I" in display

    def test_display_constraint_with_multiple_quantifiers(self):
        """Test display string for constraint with multiple quantifiers"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=1)
        expr = ComparisonExpression.create(left=left, right=right, op="ge")

        q1 = Quantifier.create(index="i", over="I")
        q2 = Quantifier.create(index="j", over="J")
        c = Constraint.create(
            name="multiple_quantifiers_constraint", expr=expr, quantifiers=[q1, q2]
        )

        display = c.display()
        assert "for i in I" in display
        assert "for j in J" in display

    def test_model_validate_simple(self):
        """Test validating a simple constraint from dict"""
        c = Constraint.model_validate(
            {
                "type": "constraint",
                "name": "simple_constraint",
                "expr": {
                    "type": "comparison",
                    "op": "le",
                    "left": {"type": "variable", "name": "x", "index_expr": []},
                    "right": {"type": "number", "value": 10},
                },
                "quantifiers": None,
            }
        )
        assert c.type == "constraint"
        assert c.expr.op == "le"
        assert c.quantifiers is None

    def test_model_validate_with_quantifiers(self):
        """Test validating a constraint with quantifiers from dict"""
        c = Constraint.model_validate(
            {
                "type": "constraint",
                "name": "single_quantifier_constraint",
                "expr": {
                    "type": "comparison",
                    "op": "eq",
                    "left": {"type": "variable", "name": "x", "index_expr": []},
                    "right": {"type": "number", "value": 5},
                },
                "quantifiers": [{"index": "i", "over": "I", "condition": None}],
            }
        )
        assert c.type == "constraint"
        assert isinstance(c.quantifiers, list)
        assert len(c.quantifiers) == 1
        assert c.quantifiers[0].index == "i"

    def test_constraint_comparison_operators(self):
        """Test constraints with different comparison operators"""
        var = VariableExpr.create(name="x", index_expr=[])
        num = NumberExpr.create(value=10)

        # Test all comparison operators
        operators = ["le", "ge", "eq", "lt", "gt"]
        for op in operators:
            expr = ComparisonExpression.create(
                left=var,
                right=num,
                op=op,  # pyright: ignore[reportArgumentType]
            )
            c = Constraint.create(name=f"constraint_{op}", expr=expr)
            assert c.expr.op == op

    def test_constraint_with_conditional_quantifier(self):
        """Test constraint with quantifier having a condition"""
        # Main constraint expression
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=100)
        expr = ComparisonExpression.create(left=left, right=right, op="le")

        # Quantifier condition
        cond_left = VariableExpr.create(name="demand", index_expr=[])
        cond_right = NumberExpr.create(value=0)
        condition = ComparisonExpression.create(
            left=cond_left, right=cond_right, op="gt"
        )

        quantifier = Quantifier.create(index="i", over="I", condition=condition)
        c = Constraint.create(
            name="conditional_quantifier_constraint",
            expr=expr,
            quantifiers=[quantifier],
        )
        assert isinstance(c.quantifiers, list)
        assert c.quantifiers[0].condition is not None
        assert c.quantifiers[0].condition.op == "gt"

    def test_supply_demand_constraint(self):
        """Test a typical supply constraint"""
        left = VariableExpr.create(name="supply", index_expr=[])
        right = VariableExpr.create(name="demand", index_expr=[])
        expr = ComparisonExpression.create(left=left, right=right, op="ge")

        quantifier = Quantifier.create(index="i", over="Locations")
        c = Constraint.create(
            name="supply_demand_constraint", expr=expr, quantifiers=[quantifier]
        )

        assert c.type == "constraint"
        assert c.expr.op == "ge"
        assert isinstance(c.quantifiers, list)
        assert c.quantifiers[0].over == "Locations"

    def test_capacity_constraint(self):
        """Test a typical capacity constraint"""
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=1000)
        expr = ComparisonExpression.create(left=left, right=right, op="le")

        c = Constraint.create(name="capacity_constraint", expr=expr)
        assert c.expr.op == "le"
        assert isinstance(c.expr.right, NumberExpr)
        assert c.expr.right.value == 1000
