"""Tests for Model class"""

from moai.constraints import Constraint
from moai.expressions import (
    ComparisonExpression,
    NumberExpr,
    VariableExpr,
)
from moai.model import Model
from moai.objectives import Objective
from moai.parameters import IndexElement, Parameter
from moai.sets import Set
from moai.variables import Variable


class TestModelBasics:
    """Tests for basic Model functionality"""

    def test_create_model(self):
        model = Model(name="TestModel")
        assert model.name == "TestModel"
        assert len(model.sets) == 0
        assert len(model.parameters) == 0
        assert len(model.variables) == 0
        assert len(model.constraints) == 0
        assert model.objective is None

    def test_objective_with_variable_expression(self):
        model = Model(name="TestModel")
        # Add required variable first
        v = Variable.create(name="total_cost")
        model.add_variable(variable=v)

        var_expr = VariableExpr.create(name="total_cost", index_expr=[])
        obj = Objective(name="minimize_cost", expr=var_expr, sense="min")

        model.set_objective(objective=obj)

        assert model.objective is not None
        assert model.objective.name == "minimize_cost"

    def test_model_properties(self):
        """Test model properties are accessible"""
        model = Model(name="TestModel")
        assert isinstance(model.sets, list)
        assert isinstance(model.parameters, list)
        assert isinstance(model.variables, list)
        assert isinstance(model.constraints, list)


class TestModelSets:
    """Tests for Model set operations"""

    def test_add_set(self):
        """Test adding a set to the model"""
        model = Model(name="TestModel")
        s = Set.create(name="I", elements=[1, 2, 3])
        model.add_set(set=s)

        assert len(model.sets) == 1
        assert model.sets[0].name == "I"
        assert model.sets[0].elements == [1, 2, 3]

    def test_add_multiple_sets(self):
        """Test adding multiple sets to the model"""
        model = Model(name="TestModel")
        s1 = Set.create(name="I", elements=[1, 2, 3])
        s2 = Set.create(name="J", elements=["a", "b", "c"])

        model.add_set(set=s1)
        model.add_set(set=s2)

        assert len(model.sets) == 2
        assert model.sets[0].name == "I"
        assert model.sets[1].name == "J"

    def test_replace_set(self):
        """Test replacing a set with the same name"""
        model = Model(name="TestModel")
        s1 = Set.create(name="I", elements=[1, 2, 3])
        s2 = Set.create(name="I", elements=[4, 5, 6])

        model.add_set(set=s1)
        model.add_set(set=s2)

        assert len(model.sets) == 1
        assert model.sets[0].elements == [4, 5, 6]

    def test_get_set_by_name(self):
        """Test getting a set by name"""
        model = Model(name="TestModel")
        s = Set.create(name="I", elements=[1, 2, 3])
        model.add_set(set=s)

        result = model.get_set_by_name(name="I")
        assert result is not None
        assert result.name == "I"
        assert result.elements == [1, 2, 3]

    def test_get_set_by_name_not_found(self):
        """Test getting a non-existent set returns None"""
        model = Model(name="TestModel")
        result = model.get_set_by_name(name="NonExistent")
        assert result is None

    def test_get_set_names(self):
        """Test getting all set names"""
        model = Model(name="TestModel")
        s1 = Set.create(name="I", elements=[1, 2, 3])
        s2 = Set.create(name="J", elements=["a", "b"])

        model.add_set(set=s1)
        model.add_set(set=s2)

        names = model.get_set_names()
        assert names == ["I", "J"]

    def test_add_set_chaining(self):
        """Test that add_set returns self for chaining"""
        model = Model(name="TestModel")
        s1 = Set.create(name="I", elements=[1, 2, 3])
        s2 = Set.create(name="J", elements=["a", "b"])

        result = model.add_set(set=s1).add_set(set=s2)
        assert result is model
        assert len(model.sets) == 2


class TestModelParameters:
    """Tests for Model parameter operations"""

    def test_add_parameter(self):
        """Test adding a parameter to the model"""
        model = Model(name="TestModel")
        p = Parameter.create(name="cost", values=5.0)
        model.add_parameter(parameter=p)

        assert len(model.parameters) == 1
        assert model.parameters[0].name == "cost"
        assert model.parameters[0].values == 5.0

    def test_add_indexed_parameter(self):
        """Test adding an indexed parameter"""
        model = Model(name="TestModel")
        # Add required set first
        s = Set.create(name="I", elements=[1, 2, 3])
        model.add_set(set=s)

        elements = [
            IndexElement(index=[1], value=5.0),
            IndexElement(index=[2], value=10.0),
        ]
        p = Parameter.create(name="cost", values=elements, indices=["I"])
        model.add_parameter(parameter=p)

        assert len(model.parameters) == 1
        assert model.parameters[0].name == "cost"
        assert model.parameters[0].indices == ["I"]

    def test_replace_parameter(self):
        """Test replacing a parameter with the same name"""
        model = Model(name="TestModel")
        p1 = Parameter.create(name="cost", values=5.0)
        p2 = Parameter.create(name="cost", values=10.0)

        model.add_parameter(parameter=p1)
        model.add_parameter(parameter=p2)

        assert len(model.parameters) == 1
        assert model.parameters[0].values == 10.0

    def test_get_parameter_by_name(self):
        """Test getting a parameter by name"""
        model = Model(name="TestModel")
        p = Parameter.create(name="cost", values=5.0)
        model.add_parameter(parameter=p)

        result = model.get_parameter_by_name(name="cost")
        assert result is not None
        assert result.name == "cost"
        assert result.values == 5.0

    def test_get_parameter_by_name_not_found(self):
        """Test getting a non-existent parameter returns None"""
        model = Model(name="TestModel")
        result = model.get_parameter_by_name(name="NonExistent")
        assert result is None

    def test_get_parameter_names(self):
        """Test getting all parameter names"""
        model = Model(name="TestModel")
        p1 = Parameter.create(name="cost", values=5.0)
        p2 = Parameter.create(name="demand", values=10.0)

        model.add_parameter(parameter=p1)
        model.add_parameter(parameter=p2)

        names = model.get_parameter_names()
        assert names == ["cost", "demand"]

    def test_add_parameter_chaining(self):
        """Test that add_parameter returns self for chaining"""
        model = Model(name="TestModel")
        p1 = Parameter.create(name="cost", values=5.0)
        p2 = Parameter.create(name="demand", values=10.0)

        result = model.add_parameter(parameter=p1).add_parameter(parameter=p2)
        assert result is model
        assert len(model.parameters) == 2


class TestModelVariables:
    """Tests for Model variable operations"""

    def test_add_variable(self):
        """Test adding a variable to the model"""
        model = Model(name="TestModel")
        v = Variable.create(name="x")
        model.add_variable(variable=v)

        assert len(model.variables) == 1
        assert model.variables[0].name == "x"

    def test_add_variable_with_domain(self):
        """Test adding a variable with specific domain"""
        model = Model(name="TestModel")
        v = Variable.create(name="x", domain="Binary")
        model.add_variable(variable=v)

        assert len(model.variables) == 1
        assert model.variables[0].domain == "Binary"

    def test_add_indexed_variable(self):
        """Test adding an indexed variable"""
        model = Model(name="TestModel")
        model.add_set(set=Set.create(name="I", elements=[1, 2, 3]))
        model.add_set(set=Set.create(name="J", elements=[1, 2, 3]))
        v = Variable.create(name="x", indices=["I", "J"])
        model.add_variable(variable=v)

        assert len(model.variables) == 1
        assert model.variables[0].indices == ["I", "J"]

    def test_replace_variable(self):
        """Test replacing a variable with the same name"""
        model = Model(name="TestModel")
        v1 = Variable.create(name="x", domain="Binary")
        v2 = Variable.create(name="x", domain="Reals")

        model.add_variable(variable=v1)
        model.add_variable(variable=v2)

        assert len(model.variables) == 1
        assert model.variables[0].domain == "Reals"

    def test_get_variable_by_name(self):
        """Test getting a variable by name"""
        model = Model(name="TestModel")
        v = Variable.create(name="x")
        model.add_variable(variable=v)

        result = model.get_variable_by_name(name="x")
        assert result is not None
        assert result.name == "x"

    def test_get_variable_by_name_not_found(self):
        """Test getting a non-existent variable returns None"""
        model = Model(name="TestModel")
        result = model.get_variable_by_name(name="NonExistent")
        assert result is None

    def test_get_variable_names(self):
        """Test getting all variable names"""
        model = Model(name="TestModel")
        v1 = Variable.create(name="x")
        v2 = Variable.create(name="y")

        model.add_variable(variable=v1)
        model.add_variable(variable=v2)

        names = model.get_variable_names()
        assert names == ["x", "y"]

    def test_add_variable_chaining(self):
        """Test that add_variable returns self for chaining"""
        model = Model(name="TestModel")
        v1 = Variable.create(name="x")
        v2 = Variable.create(name="y")

        result = model.add_variable(variable=v1).add_variable(variable=v2)
        assert result is model
        assert len(model.variables) == 2


class TestModelConstraints:
    """Tests for Model constraint operations"""

    def test_add_constraint(self):
        """Test adding a constraint to the model"""
        model = Model(name="TestModel")
        # Add required variable first
        v = Variable.create(name="x")
        model.add_variable(variable=v)

        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=10)
        expr = ComparisonExpression.create(left=left, right=right, op="le")
        c = Constraint.create(name="capacity", expr=expr)

        model.add_constraint(constraint=c)

        assert len(model.constraints) == 1
        assert model.constraints[0].name == "capacity"

    def test_add_multiple_constraints(self):
        """Test adding multiple constraints"""
        model = Model(name="TestModel")
        # Add required variables first
        v1 = Variable.create(name="x")
        v2 = Variable.create(name="y")
        model.add_variable(variable=v1)
        model.add_variable(variable=v2)

        left1 = VariableExpr.create(name="x", index_expr=[])
        right1 = NumberExpr.create(value=10)
        expr1 = ComparisonExpression.create(left=left1, right=right1, op="le")
        c1 = Constraint.create(name="capacity", expr=expr1)

        left2 = VariableExpr.create(name="y", index_expr=[])
        right2 = NumberExpr.create(value=5)
        expr2 = ComparisonExpression.create(left=left2, right=right2, op="ge")
        c2 = Constraint.create(name="demand", expr=expr2)

        model.add_constraint(constraint=c1)
        model.add_constraint(constraint=c2)

        assert len(model.constraints) == 2
        assert model.constraints[0].name == "capacity"
        assert model.constraints[1].name == "demand"

    def test_replace_constraint(self):
        """Test replacing a constraint with the same name"""
        model = Model(name="TestModel")
        # Add required variable first
        v = Variable.create(name="x")
        model.add_variable(variable=v)

        left1 = VariableExpr.create(name="x", index_expr=[])
        right1 = NumberExpr.create(value=10)
        expr1 = ComparisonExpression.create(left=left1, right=right1, op="le")
        c1 = Constraint.create(name="capacity", expr=expr1)

        left2 = VariableExpr.create(name="x", index_expr=[])
        right2 = NumberExpr.create(value=20)
        expr2 = ComparisonExpression.create(left=left2, right=right2, op="le")
        c2 = Constraint.create(name="capacity", expr=expr2)

        model.add_constraint(constraint=c1)
        model.add_constraint(constraint=c2)

        assert len(model.constraints) == 1
        assert model.constraints[0].expr.op == "le"

    def test_get_constraint_by_name(self):
        """Test getting a constraint by name"""
        model = Model(name="TestModel")
        # Add required variable first
        v = Variable.create(name="x")
        model.add_variable(variable=v)

        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=10)
        expr = ComparisonExpression.create(left=left, right=right, op="le")
        c = Constraint.create(name="capacity", expr=expr)

        model.add_constraint(constraint=c)

        result = model.get_constraint_by_name(name="capacity")
        assert result is not None
        assert result.name == "capacity"

    def test_get_constraint_by_name_not_found(self):
        """Test getting a non-existent constraint returns None"""
        model = Model(name="TestModel")
        result = model.get_constraint_by_name(name="NonExistent")
        assert result is None

    def test_get_constraint_names(self):
        """Test getting all constraint names"""
        model = Model(name="TestModel")
        # Add required variables first
        v1 = Variable.create(name="x")
        v2 = Variable.create(name="y")
        model.add_variable(variable=v1)
        model.add_variable(variable=v2)

        left1 = VariableExpr.create(name="x", index_expr=[])
        right1 = NumberExpr.create(value=10)
        expr1 = ComparisonExpression.create(left=left1, right=right1, op="le")
        c1 = Constraint.create(name="capacity", expr=expr1)

        left2 = VariableExpr.create(name="y", index_expr=[])
        right2 = NumberExpr.create(value=5)
        expr2 = ComparisonExpression.create(left=left2, right=right2, op="ge")
        c2 = Constraint.create(name="demand", expr=expr2)

        model.add_constraint(constraint=c1)
        model.add_constraint(constraint=c2)

        names = model.get_constraint_names()
        assert names == ["capacity", "demand"]

    def test_add_constraint_chaining(self):
        """Test that add_constraint returns self for chaining"""
        model = Model(name="TestModel")
        # Add required variables first
        v1 = Variable.create(name="x")
        v2 = Variable.create(name="y")
        model.add_variable(variable=v1)
        model.add_variable(variable=v2)

        left1 = VariableExpr.create(name="x", index_expr=[])
        right1 = NumberExpr.create(value=10)
        expr1 = ComparisonExpression.create(left=left1, right=right1, op="le")
        c1 = Constraint.create(name="capacity", expr=expr1)

        left2 = VariableExpr.create(name="y", index_expr=[])
        right2 = NumberExpr.create(value=5)
        expr2 = ComparisonExpression.create(left=left2, right=right2, op="ge")
        c2 = Constraint.create(name="demand", expr=expr2)

        result = model.add_constraint(constraint=c1).add_constraint(constraint=c2)
        assert result is model
        assert len(model.constraints) == 2


class TestModelObjective:
    """Tests for Model objective operations"""

    def test_set_objective_minimize(self):
        """Test setting a minimize objective"""
        model = Model(name="TestModel")
        expr = NumberExpr.create(value=5)
        obj = Objective(name="cost", expr=expr, sense="min")

        model.set_objective(objective=obj)

        assert model.objective is not None
        assert model.objective.name == "cost"
        assert model.objective.sense == "min"

    def test_set_objective_maximize(self):
        """Test setting a maximize objective"""
        model = Model(name="TestModel")
        expr = NumberExpr.create(value=10)
        obj = Objective(name="profit", expr=expr, sense="max")

        model.set_objective(objective=obj)

        assert model.objective is not None
        assert model.objective.name == "profit"
        assert model.objective.sense == "max"

    def test_replace_objective(self):
        """Test replacing an existing objective"""
        model = Model(name="TestModel")

        expr1 = NumberExpr.create(value=5)
        obj1 = Objective(name="cost", expr=expr1, sense="min")

        expr2 = NumberExpr.create(value=10)
        obj2 = Objective(name="profit", expr=expr2, sense="max")

        model.set_objective(objective=obj1)
        model.set_objective(objective=obj2)

        assert model.objective is not None
        assert model.objective.name == "profit"
        assert model.objective.sense == "max"

    def test_set_objective_chaining(self):
        """Test that set_objective returns self for chaining"""
        model = Model(name="TestModel")
        expr = NumberExpr.create(value=5)
        obj = Objective(name="cost", expr=expr, sense="min")

        result = model.set_objective(objective=obj)
        assert result is model

    def test_objective_with_variable_expression(self):
        """Test setting an objective with variable expression"""
        model = Model(name="TestModel")
        model.add_variable(variable=Variable.create(name="total_cost"))

        obj = Objective(
            name="minimize_cost",
            expr=VariableExpr.create(name="total_cost", index_expr=[]),
            sense="min",
        )

        model.set_objective(objective=obj)

        assert model.objective is not None
        assert model.objective.expr.type == "variable"


class TestModelIntegration:
    """Integration tests for Model with multiple components"""

    def test_complete_model_building(self):
        """Test building a complete model with all components"""
        model = Model(name="ProductionModel")

        # Add sets
        products = Set.create(name="Products", elements=["A", "B", "C"])
        model.add_set(set=products)

        # Add parameters
        cost = Parameter.create(name="cost", values=5.0)
        model.add_parameter(parameter=cost)

        # Add variables
        x = Variable.create(name="x", domain="NonNegativeReals")
        model.add_variable(variable=x)

        # Add constraint
        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=100)
        expr = ComparisonExpression.create(left=left, right=right, op="le")
        capacity = Constraint.create(name="capacity", expr=expr)
        model.add_constraint(constraint=capacity)

        # Set objective
        obj_expr = VariableExpr.create(name="x", index_expr=[])
        objective = Objective(name="minimize_cost", expr=obj_expr, sense="min")
        model.set_objective(objective=objective)

        # Verify
        assert len(model.sets) == 1
        assert len(model.parameters) == 1
        assert len(model.variables) == 1
        assert len(model.constraints) == 1
        assert model.objective is not None

    def test_method_chaining(self):
        """Test chaining all add methods"""
        model = Model(name="ChainedModel")

        s = Set.create(name="I", elements=[1, 2, 3])
        p = Parameter.create(name="cost", values=5.0)
        v = Variable.create(name="x")

        left = VariableExpr.create(name="x", index_expr=[])
        right = NumberExpr.create(value=10)
        expr = ComparisonExpression.create(left=left, right=right, op="le")
        c = Constraint.create(name="limit", expr=expr)

        obj_expr = VariableExpr.create(name="x", index_expr=[])
        # Use different name for objective to avoid conflict with parameter
        obj = Objective(name="objective", expr=obj_expr, sense="min")

        result = (
            model.add_set(set=s)
            .add_parameter(parameter=p)
            .add_variable(variable=v)
            .add_constraint(constraint=c)
            .set_objective(objective=obj)
        )

        assert result is model
        assert len(model.sets) == 1
        assert len(model.parameters) == 1
        assert len(model.variables) == 1
        assert len(model.constraints) == 1
        assert model.objective is not None

    def test_model_with_indexed_components(self):
        """Test model with indexed sets, parameters, and variables"""
        model = Model(name="IndexedModel")

        # Add indexed set
        s = Set.create(name="I", elements=[1, 2, 3, 4, 5])
        model.add_set(set=s)

        # Add indexed parameter
        elements = [
            IndexElement(index=[1], value=10.0),
            IndexElement(index=[2], value=20.0),
            IndexElement(index=[3], value=30.0),
        ]
        p = Parameter.create(name="cost", values=elements, indices=["I"])
        model.add_parameter(parameter=p)

        # Add indexed variable
        v = Variable.create(name="x", indices=["I"])
        model.add_variable(variable=v)

        assert len(model.sets) == 1
        assert model.parameters[0].indices == ["I"]
        assert model.variables[0].indices == ["I"]

    def test_empty_model_queries(self):
        """Test querying an empty model"""
        model = Model(name="EmptyModel")

        assert model.get_set_by_name(name="I") is None
        assert model.get_parameter_by_name(name="cost") is None
        assert model.get_variable_by_name(name="x") is None
        assert model.get_constraint_by_name(name="limit") is None
        assert model.objective is None

        assert model.get_set_names() == []
        assert model.get_parameter_names() == []
        assert model.get_variable_names() == []
        assert model.get_constraint_names() == []

    def test_model_update_components(self):
        """Test updating model components multiple times"""
        model = Model(name="UpdateModel")

        # Add initial components
        s1 = Set.create(name="I", elements=[1, 2, 3])
        v1 = Variable.create(name="x", domain="Binary")

        model.add_set(set=s1)
        model.add_variable(variable=v1)

        assert model.sets[0].elements == [1, 2, 3]
        assert model.variables[0].domain == "Binary"

        # Update components
        s2 = Set.create(name="I", elements=[1, 2, 3, 4, 5])
        v2 = Variable.create(name="x", domain="Reals")

        model.add_set(set=s2)
        model.add_variable(variable=v2)

        assert len(model.sets) == 1
        assert len(model.variables) == 1
        assert model.sets[0].elements == [1, 2, 3, 4, 5]
        assert model.variables[0].domain == "Reals"
