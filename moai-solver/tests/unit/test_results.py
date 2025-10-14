"""
Tests for the structured results module (results.py)
"""

import pyomo.environ as pyo

from moai.builders import binop, le, num, var
from moai.constraints import Constraint
from moai.model import Model
from moai.objectives import Objective
from moai.results import (
    ConstraintResults,
    IndexedConstraintResult,
    IndexedVariableResult,
    ModelResult,
    ObjectiveResult,
    ScalarConstraintResult,
    ScalarVariableResult,
    SolverInfo,
    VariableResults,
)
from moai.sets import Set
from moai.variables import Variable


class TestScalarVariableResult:
    """Tests for ScalarVariableResult"""

    def test_scalar_variable_creation(self):
        """Test creating a scalar variable result"""
        result = ScalarVariableResult(
            name="x",
            value=5.0,
            domain="NonNegativeReals",
            lb=0.0,
            ub=10.0,
        )
        assert result.name == "x"
        assert result.value == 5.0
        assert result.domain == "NonNegativeReals"
        assert result.lb == 0.0
        assert result.ub == 10.0

    def test_scalar_variable_repr(self):
        """Test string representation"""
        result = ScalarVariableResult(name="x", value=5.0, domain="Reals")
        assert repr(result) == "x = 5.0"


class TestIndexedVariableResult:
    """Tests for IndexedVariableResult"""

    def test_indexed_variable_creation(self):
        """Test creating an indexed variable result"""
        result = IndexedVariableResult(
            name="x",
            indices=["i"],
            values={("a",): 1.0, ("b",): 2.0, ("c",): 3.0},
            domain="NonNegativeReals",
        )
        assert result.name == "x"
        assert result.indices == ["i"]
        assert len(result.values) == 3
        assert result.domain == "NonNegativeReals"

    def test_get_value_single_index(self):
        """Test getting value with single index"""
        result = IndexedVariableResult(
            name="x",
            indices=["i"],
            values={("a",): 1.0, ("b",): 2.0},
            domain="Reals",
        )
        assert result.get_value("a") == 1.0
        assert result.get_value("b") == 2.0
        assert result.get_value("c") is None

    def test_get_value_multi_index(self):
        """Test getting value with multiple indices"""
        result = IndexedVariableResult(
            name="x",
            indices=["i", "j"],
            values={("a", "x"): 1.0, ("b", "y"): 2.0},
            domain="Reals",
        )
        assert result.get_value("a", "x") == 1.0
        assert result.get_value("b", "y") == 2.0
        assert result.get_value("c", "z") is None

    def test_getitem_access(self):
        """Test bracket notation access"""
        result = IndexedVariableResult(
            name="x",
            indices=["i", "j"],
            values={("a", "x"): 1.0, ("b", "y"): 2.0},
            domain="Reals",
        )
        assert result["a", "x"] == 1.0
        assert result[("b", "y")] == 2.0
        assert result["c", "z"] is None

    def test_items_iteration(self):
        """Test iterating over items"""
        result = IndexedVariableResult(
            name="x",
            indices=["i"],
            values={("a",): 1.0, ("b",): 2.0},
            domain="Reals",
        )
        items = list(result.items())
        assert len(items) == 2
        assert (("a",), 1.0) in items
        assert (("b",), 2.0) in items


class TestVariableResults:
    """Tests for VariableResults container"""

    def test_variable_results_creation(self):
        """Test creating a variable results container"""
        scalar = ScalarVariableResult(name="x", value=5.0, domain="Reals")
        indexed = IndexedVariableResult(
            name="y",
            indices=["i"],
            values={("a",): 1.0},
            domain="Reals",
        )

        results = VariableResults(
            scalar={"x": scalar},
            indexed={"y": indexed},
        )

        assert "x" in results
        assert "y" in results
        assert results["x"] == scalar
        assert results["y"] == indexed

    def test_get_method(self):
        """Test get method"""
        scalar = ScalarVariableResult(name="x", value=5.0, domain="Reals")
        results = VariableResults(scalar={"x": scalar})

        assert results.get("x") == scalar
        assert results.get("nonexistent") is None

    def test_keys_values_items(self):
        """Test keys, values, and items methods"""
        scalar = ScalarVariableResult(name="x", value=5.0, domain="Reals")
        indexed = IndexedVariableResult(
            name="y",
            indices=["i"],
            values={("a",): 1.0},
            domain="Reals",
        )

        results = VariableResults(
            scalar={"x": scalar},
            indexed={"y": indexed},
        )

        assert set(results.keys()) == {"x", "y"}
        assert len(results.values()) == 2
        items = list(results.items())
        assert len(items) == 2


class TestConstraintResults:
    """Tests for constraint results"""

    def test_scalar_constraint_result(self):
        """Test scalar constraint result"""
        result = ScalarConstraintResult(
            name="c1",
            body_value=10.0,
            slack=0.5,
            dual=1.2,
        )
        assert result.name == "c1"
        assert result.body_value == 10.0
        assert result.slack == 0.5
        assert result.dual == 1.2

    def test_indexed_constraint_result(self):
        """Test indexed constraint result"""
        result = IndexedConstraintResult(
            name="c",
            indices=["i"],
            body_values={("a",): 10.0, ("b",): 20.0},
            slacks={("a",): 0.0, ("b",): 1.0},
            duals={("a",): 1.5, ("b",): 0.0},
        )
        assert result.get_body_value("a") == 10.0
        assert result.get_slack("b") == 1.0
        assert result.get_dual("a") == 1.5

    def test_constraint_results_container(self):
        """Test constraint results container"""
        scalar = ScalarConstraintResult(name="c1", body_value=10.0)
        indexed = IndexedConstraintResult(
            name="c2",
            indices=["i"],
            body_values={("a",): 5.0},
        )

        results = ConstraintResults(
            scalar={"c1": scalar},
            indexed={"c2": indexed},
        )

        assert "c1" in results
        assert "c2" in results
        assert results["c1"] == scalar


class TestObjectiveResult:
    """Tests for ObjectiveResult"""

    def test_objective_result_min(self):
        """Test objective result with minimization"""
        result = ObjectiveResult(name="obj", value=42.5, sense="min")
        assert result.name == "obj"
        assert result.value == 42.5
        assert result.sense == "min"
        assert "min" in repr(result)

    def test_objective_result_max(self):
        """Test objective result with maximization"""
        result = ObjectiveResult(name="obj", value=100.0, sense="max")
        assert result.sense == "max"


class TestSolverInfo:
    """Tests for SolverInfo"""

    def test_solver_info_creation(self):
        """Test creating solver info"""
        info = SolverInfo(
            solver_name="cbc",
            termination_condition="optimal",
            solve_time=1.5,
            iterations=100,
        )
        assert info.solver_name == "cbc"
        assert info.termination_condition == "optimal"
        assert info.solve_time == 1.5
        assert info.iterations == 100

    def test_solver_info_repr(self):
        """Test solver info string representation"""
        info = SolverInfo(
            solver_name="cbc",
            termination_condition="optimal",
            solve_time=1.234,
        )
        repr_str = repr(info)
        assert "cbc" in repr_str
        assert "optimal" in repr_str
        assert "1.234" in repr_str


class TestModelResultFromPyomo:
    """Tests for ModelResult.from_pyomo() method"""

    def test_simple_scalar_model(self):
        """Test extracting results from a simple scalar variable model"""
        # Build a simple model
        model = (
            Model(name="test")
            .add_variable(Variable.create(name="x", domain="NonNegativeReals"))
            .add_variable(Variable.create(name="y", domain="NonNegativeReals"))
            .add_constraint(
                Constraint.create(
                    name="c1",
                    expr=le(
                        left=binop(
                            left=binop(left=num(2), op="mul", right=var("x")),
                            op="add",
                            right=binop(left=num(3), op="mul", right=var("y")),
                        ),
                        right=num(10),
                    ),
                )
            )
            .set_objective(
                Objective(
                    name="obj",
                    expr=binop(
                        left=binop(left=num(2), op="mul", right=var("x")),
                        op="add",
                        right=binop(left=num(3), op="mul", right=var("y")),
                    ),
                    sense="min",
                )
            )
        )

        # Solve
        opt = pyo.SolverFactory("cbc")
        solver_results = opt.solve(model.pyomo_model)

        # Extract results
        result = ModelResult.from_pyomo(
            status="optimal",
            pyomo_model=model.pyomo_model,
            model_data=model.to_data(),
            solver_results=solver_results,
        )

        # Verify structure
        assert result.status == "optimal"
        assert "x" in result.variables
        assert "y" in result.variables
        assert isinstance(result.variables["x"], ScalarVariableResult)
        assert isinstance(result.variables["y"], ScalarVariableResult)

        # Verify values (should be 0 for minimization without lower bound)
        x_var = result.variables["x"]
        y_var = result.variables["y"]
        assert isinstance(x_var, ScalarVariableResult)
        assert isinstance(y_var, ScalarVariableResult)
        assert x_var.value == 0.0
        assert y_var.value == 0.0

        # Verify objective
        assert result.objective is not None
        assert result.objective.name == "obj"
        assert result.objective.sense == "min"
        assert result.objective.value == 0.0

        # Verify constraint
        assert "c1" in result.constraints
        assert isinstance(result.constraints["c1"], ScalarConstraintResult)

    def test_indexed_variable_model(self):
        """Test extracting results from a model with indexed variables"""
        # Build model with indexed variables
        model = (
            Model(name="indexed_test")
            .add_set(Set.create(name="I", elements=["a", "b", "c"]))
            .add_variable(
                Variable.create(
                    name="x",
                    domain="NonNegativeReals",
                    indices=["I"],
                    ub=10.0,
                )
            )
            .set_objective(
                Objective(
                    name="obj",
                    expr=num(1),  # Simple constant objective
                    sense="min",
                )
            )
        )

        # Solve
        opt = pyo.SolverFactory("cbc")
        solver_results = opt.solve(model.pyomo_model)

        # Extract results
        result = ModelResult.from_pyomo(
            status="optimal",
            pyomo_model=model.pyomo_model,
            model_data=model.to_data(),
            solver_results=solver_results,
        )

        # Verify indexed variable structure
        assert "x" in result.variables
        var_result = result.variables["x"]
        assert isinstance(var_result, IndexedVariableResult)
        assert var_result.indices == ["I"]
        # Note: values may be empty if not used in constraints/objective
        # But structure should be correct
        assert isinstance(var_result.values, dict)

        # Test bracket access works even if values are not set
        # (returns None for unset values)
        assert var_result["a"] is None or isinstance(var_result["a"], float)
        assert var_result["b"] is None or isinstance(var_result["b"], float)
        assert var_result["c"] is None or isinstance(var_result["c"], float)

    def test_error_status(self):
        """Test handling error status"""
        model_instance = Model("test")
        model_instance.add_variable(Variable.create(name="x", domain="Reals"))

        result = ModelResult.from_pyomo(
            status="error",
            pyomo_model=model_instance.pyomo_model,
            model_data=None,
            solver_results=None,
        )

        assert result.status == "error"
        assert len(result.variables.keys()) == 0
        assert len(result.constraints.keys()) == 0
        assert result.objective is None

    def test_model_result_summary(self):
        """Test the summary method"""
        # Build and solve a simple model
        model = (
            Model(name="summary_test")
            .add_variable(Variable.create(name="x", domain="NonNegativeReals"))
            .set_objective(Objective(name="obj", expr=var("x"), sense="min"))
        )

        opt = pyo.SolverFactory("cbc")
        solver_results = opt.solve(model.pyomo_model)

        result = ModelResult.from_pyomo(
            status="optimal",
            pyomo_model=model.pyomo_model,
            model_data=model.to_data(),
            solver_results=solver_results,
        )

        # Get summary
        summary = result.summary()
        assert "OPTIMIZATION RESULTS" in summary
        assert "Status: optimal" in summary
        assert "Objective:" in summary
        assert "Variables:" in summary

    def test_model_result_repr(self):
        """Test the __repr__ method"""
        model = (
            Model(name="repr_test")
            .add_variable(Variable.create(name="x", domain="NonNegativeReals"))
            .set_objective(Objective(name="obj", expr=var("x"), sense="min"))
        )

        opt = pyo.SolverFactory("cbc")
        solver_results = opt.solve(model.pyomo_model)

        result = ModelResult.from_pyomo(
            status="optimal",
            pyomo_model=model.pyomo_model,
            model_data=model.to_data(),
            solver_results=solver_results,
        )

        repr_str = repr(result)
        assert "ModelResult" in repr_str
        assert "optimal" in repr_str


class TestModelSolveMethod:
    """Tests for the Model.solve() method that returns typed results"""

    def test_solve_returns_typed_result(self):
        """Test that Model.solve() returns a typed ModelResult"""
        model = (
            Model(name="solve_test")
            .add_variable(Variable.create(name="x", domain="NonNegativeReals", ub=10))
            .add_variable(Variable.create(name="y", domain="NonNegativeReals", ub=10))
            .set_objective(
                Objective(
                    name="obj",
                    expr=binop(left=var("x"), op="add", right=var("y")),
                    sense="min",
                )
            )
        )

        result = model.solve("cbc")

        # Verify it returns the new typed ModelResult
        assert isinstance(result, ModelResult)
        assert result.status in ["optimal", "feasible", "success"]
        assert "x" in result.variables
        assert "y" in result.variables

    def test_solve_with_solver_options(self):
        """Test solve with solver options"""
        model = (
            Model(name="options_test")
            .add_variable(Variable.create(name="x", domain="NonNegativeReals"))
            .set_objective(Objective(name="obj", expr=var("x"), sense="min"))
        )

        # Should not raise an error
        result = model.solve("cbc", seconds=60)
        assert isinstance(result, ModelResult)

    def test_solve_infeasible_model(self):
        """Test solving an infeasible model"""
        # Create an infeasible model: x >= 10 and x <= 5
        model = (
            Model(name="infeasible_test")
            .add_variable(
                Variable.create(name="x", domain="NonNegativeReals", lb=10, ub=5)
            )
            .set_objective(Objective(name="obj", expr=var("x"), sense="min"))
        )

        result = model.solve("cbc")

        # Should detect infeasibility
        assert result.status in ["infeasible", "error"]
