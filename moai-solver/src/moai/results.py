from typing import Any, Literal

import pyomo.environ as pyo
from pydantic import BaseModel, Field

from moai.parameters import IndexValue


class ScalarVariableResult(BaseModel):
    """Result for a scalar (non-indexed) variable"""

    name: str
    value: float | None
    domain: str
    lb: float | None = None
    ub: float | None = None

    def __repr__(self) -> str:
        return f"{self.name} = {self.value}"


class IndexedVariableResult(BaseModel):
    """Result for an indexed variable"""

    name: str
    indices: list[str]  # Set names
    values: dict[tuple[IndexValue, ...], float]  # Index tuple -> value
    domain: str
    lb: float | None = None
    ub: float | None = None

    def __repr__(self) -> str:
        return f"{self.name}[{', '.join(self.indices)}] with {len(self.values)} values"

    def get_value(self, *index: IndexValue) -> float | None:
        """Get value for a specific index"""
        key = tuple(index) if len(index) > 1 else (index[0],) if index else ()
        return self.values.get(key)

    def items(self):
        """Iterate over (index, value) pairs"""
        return self.values.items()

    def __getitem__(self, index: IndexValue | tuple[IndexValue, ...]) -> float | None:
        """Access value by index using bracket notation"""
        if not isinstance(index, tuple):
            index = (index,)
        return self.values.get(index)


class VariableResults(BaseModel):
    """Container for all variable results"""

    scalar: dict[str, ScalarVariableResult] = Field(default_factory=dict)
    indexed: dict[str, IndexedVariableResult] = Field(default_factory=dict)

    def get(self, name: str) -> ScalarVariableResult | IndexedVariableResult | None:
        """Get a variable result by name"""
        return self.scalar.get(name) or self.indexed.get(name)

    def __getitem__(
        self, name: str
    ) -> ScalarVariableResult | IndexedVariableResult | None:
        """Access variable results using bracket notation"""
        return self.get(name)

    def __contains__(self, name: str) -> bool:
        """Check if a variable exists in results"""
        return name in self.scalar or name in self.indexed

    def keys(self):
        """Get all variable names"""
        return list(self.scalar.keys()) + list(self.indexed.keys())

    def values(self):
        """Get all variable results"""
        return list(self.scalar.values()) + list(self.indexed.values())

    def items(self):
        """Iterate over (name, result) pairs"""
        yield from self.scalar.items()
        yield from self.indexed.items()


class ScalarConstraintResult(BaseModel):
    """Result for a scalar (non-indexed) constraint"""

    name: str
    body_value: float | None
    slack: float | None = None
    dual: float | None = None

    def __repr__(self) -> str:
        return f"{self.name}: body={self.body_value}, slack={self.slack}"


class IndexedConstraintResult(BaseModel):
    """Result for an indexed constraint"""

    name: str
    indices: list[str]  # Set names
    body_values: dict[tuple[IndexValue, ...], float]
    slacks: dict[tuple[IndexValue, ...], float | None] = Field(default_factory=dict)
    duals: dict[tuple[IndexValue, ...], float | None] = Field(default_factory=dict)

    def __repr__(self) -> str:
        return f"{self.name}[{', '.join(self.indices)}] with {len(self.body_values)} constraints"

    def get_body_value(self, *index: IndexValue) -> float | None:
        """Get body value for a specific index"""
        key = tuple(index) if len(index) > 1 else (index[0],) if index else ()
        return self.body_values.get(key)

    def get_slack(self, *index: IndexValue) -> float | None:
        """Get slack value for a specific index"""
        key = tuple(index) if len(index) > 1 else (index[0],) if index else ()
        return self.slacks.get(key)

    def get_dual(self, *index: IndexValue) -> float | None:
        """Get dual value for a specific index"""
        key = tuple(index) if len(index) > 1 else (index[0],) if index else ()
        return self.duals.get(key)

    def items(self):
        """Iterate over (index, body_value) pairs"""
        return self.body_values.items()

    def __getitem__(self, index: IndexValue | tuple[IndexValue, ...]) -> float | None:
        """Access body value by index using bracket notation"""
        if not isinstance(index, tuple):
            index = (index,)
        return self.body_values.get(index)


class ConstraintResults(BaseModel):
    """Container for all constraint results"""

    scalar: dict[str, ScalarConstraintResult] = Field(default_factory=dict)
    indexed: dict[str, IndexedConstraintResult] = Field(default_factory=dict)

    def get(self, name: str) -> ScalarConstraintResult | IndexedConstraintResult | None:
        """Get a constraint result by name"""
        return self.scalar.get(name) or self.indexed.get(name)

    def __getitem__(
        self, name: str
    ) -> ScalarConstraintResult | IndexedConstraintResult | None:
        """Access constraint results using bracket notation"""
        return self.get(name)

    def __contains__(self, name: str) -> bool:
        """Check if a constraint exists in results"""
        return name in self.scalar or name in self.indexed

    def keys(self):
        """Get all constraint names"""
        return list(self.scalar.keys()) + list(self.indexed.keys())

    def values(self):
        """Get all constraint results"""
        return list(self.scalar.values()) + list(self.indexed.values())

    def items(self):
        """Iterate over (name, result) pairs"""
        yield from self.scalar.items()
        yield from self.indexed.items()


class ObjectiveResult(BaseModel):
    """Result for the objective function"""

    name: str
    value: float | None
    sense: Literal["min", "max"]

    def __repr__(self) -> str:
        return f"{self.name} ({self.sense}): {self.value}"


class SolverInfo(BaseModel):
    """Information about the solver and solution process"""

    solver_name: str | None = None
    termination_condition: str | None = None
    solve_time: float | None = None
    iterations: int | None = None
    nodes: int | None = None

    def __repr__(self) -> str:
        parts = []
        if self.solver_name:
            parts.append(f"solver={self.solver_name}")
        if self.termination_condition:
            parts.append(f"status={self.termination_condition}")
        if self.solve_time is not None:
            parts.append(f"time={self.solve_time:.3f}s")
        return f"SolverInfo({', '.join(parts)})"


class ModelResult(BaseModel):
    """
    Structured and typed results from an optimization model.

    This class provides a rich interface for accessing optimization results
    with proper typing and structure that respects the model definition.
    """

    model_config = {"arbitrary_types_allowed": True}

    status: Literal[
        "success", "error", "optimal", "feasible", "infeasible", "unbounded"
    ]
    variables: VariableResults = Field(default_factory=VariableResults)
    constraints: ConstraintResults = Field(default_factory=ConstraintResults)
    objective: ObjectiveResult | None = None
    solver_info: SolverInfo = Field(default_factory=SolverInfo)

    @classmethod
    def from_pyomo(
        cls,
        status: Literal[
            "success", "error", "optimal", "feasible", "infeasible", "unbounded"
        ],
        pyomo_model: pyo.ConcreteModel,
        model_data: "Any" = None,  # ModelData type to avoid circular import
        solver_results: Any = None,
    ) -> "ModelResult":
        """
        Create a ModelResult from a Pyomo model with structured, typed results.

        Args:
            status: Solution status
            pyomo_model: The solved Pyomo model
            model_data: Optional ModelData object for enhanced type information
            solver_results: Optional Pyomo solver results for additional metadata

        Returns:
            A structured ModelResult with typed variable and constraint results
        """
        if status == "error":
            return ModelResult(
                status=status,
                solver_info=cls._extract_solver_info(solver_results),
            )

        # Build lookup for model structure
        var_info = {}
        constraint_info = {}

        if model_data:
            for var in model_data.variables:
                var_info[var.name] = {
                    "indices": var.indices,
                    "domain": var.domain,
                    "lb": var.lb,
                    "ub": var.ub,
                }
            for constraint in model_data.constraints:
                constraint_info[constraint.name] = {
                    "indices": [q.over for q in constraint.quantifiers]
                    if constraint.quantifiers
                    else [],
                }

        # Extract variable results
        variables = cls._extract_variable_results(pyomo_model, var_info)

        # Extract constraint results
        constraints = cls._extract_constraint_results(pyomo_model, constraint_info)

        # Extract objective
        objective = cls._extract_objective_result(pyomo_model)

        # Extract solver info
        solver_info = cls._extract_solver_info(solver_results)

        return ModelResult(
            status=status,
            variables=variables,
            constraints=constraints,
            objective=objective,
            solver_info=solver_info,
        )

    @staticmethod
    def _extract_variable_results(
        pyomo_model: pyo.ConcreteModel, var_info: dict
    ) -> VariableResults:
        """Extract variable results from Pyomo model"""
        scalar_vars = {}
        indexed_vars = {}

        for v in pyomo_model.component_objects(pyo.Var, active=True):
            var_name = v.name
            info = var_info.get(var_name, {})
            indices = info.get("indices", [])
            domain = info.get("domain", "Unknown")
            lb = info.get("lb")
            ub = info.get("ub")

            if v.is_indexed():
                # Indexed variable
                values = {}
                for idx in v:
                    if v[idx].value is not None:
                        # Normalize index to tuple
                        if isinstance(idx, tuple):
                            values[idx] = v[idx].value
                        else:
                            values[(idx,)] = v[idx].value

                indexed_vars[var_name] = IndexedVariableResult(
                    name=var_name,
                    indices=indices,
                    values=values,
                    domain=domain,
                    lb=lb,
                    ub=ub,
                )
            else:
                # Scalar variable
                scalar_vars[var_name] = ScalarVariableResult(
                    name=var_name,
                    value=v.value,
                    domain=domain,
                    lb=lb,
                    ub=ub,
                )

        return VariableResults(scalar=scalar_vars, indexed=indexed_vars)

    @staticmethod
    def _extract_constraint_results(
        pyomo_model: pyo.ConcreteModel, constraint_info: dict
    ) -> ConstraintResults:
        """Extract constraint results from Pyomo model"""
        scalar_constraints = {}
        indexed_constraints = {}

        for c in pyomo_model.component_objects(pyo.Constraint, active=True):
            constraint_name = c.name
            info = constraint_info.get(constraint_name, {})
            indices = info.get("indices", [])

            if c.is_indexed():
                # Indexed constraint
                body_values = {}
                slacks = {}
                duals = {}

                for idx in c:
                    if c[idx].body is not None:
                        # Normalize index to tuple
                        if isinstance(idx, tuple):
                            key = idx
                        else:
                            key = (idx,)

                        body_values[key] = pyo.value(c[idx].body)

                        # Try to get slack and dual
                        try:
                            slacks[key] = c[idx].slack()
                        except (AttributeError, ValueError):
                            slacks[key] = None

                        try:
                            if hasattr(pyomo_model, "dual"):
                                dual_val = pyomo_model.dual[c[idx]]  # type: ignore
                                duals[key] = (
                                    pyo.value(dual_val)
                                    if dual_val is not None
                                    else None
                                )
                            else:
                                duals[key] = None
                        except (AttributeError, KeyError, TypeError):
                            duals[key] = None

                indexed_constraints[constraint_name] = IndexedConstraintResult(
                    name=constraint_name,
                    indices=indices,
                    body_values=body_values,
                    slacks=slacks,
                    duals=duals,
                )
            else:
                # Scalar constraint
                body_value = pyo.value(c.body) if c.body is not None else None

                slack = None
                try:
                    slack = c.slack()
                except (AttributeError, ValueError):
                    pass

                dual = None
                try:
                    if hasattr(pyomo_model, "dual"):
                        dual_val = pyomo_model.dual[c]  # type: ignore
                        dual = pyo.value(dual_val) if dual_val is not None else None
                except (AttributeError, KeyError, TypeError):
                    pass

                scalar_constraints[constraint_name] = ScalarConstraintResult(
                    name=constraint_name,
                    body_value=body_value,
                    slack=slack,
                    dual=dual,
                )

        return ConstraintResults(scalar=scalar_constraints, indexed=indexed_constraints)

    @staticmethod
    def _extract_objective_result(
        pyomo_model: pyo.ConcreteModel,
    ) -> ObjectiveResult | None:
        """Extract objective result from Pyomo model"""
        for obj in pyomo_model.component_objects(pyo.Objective, active=True):
            if obj.expr is not None:
                value = pyo.value(obj.expr)
                sense = "min" if obj.sense == pyo.minimize else "max"
                return ObjectiveResult(name=obj.name, value=value, sense=sense)
        return None

    @staticmethod
    def _extract_solver_info(solver_results: Any) -> SolverInfo:
        """Extract solver information from Pyomo solver results"""
        if solver_results is None:
            return SolverInfo()

        info = SolverInfo()

        try:
            # Extract solver name
            if hasattr(solver_results, "solver"):
                if hasattr(solver_results.solver, "name"):
                    info.solver_name = solver_results.solver.name

            # Extract termination condition
            if hasattr(solver_results, "solver"):
                if hasattr(solver_results.solver, "termination_condition"):
                    info.termination_condition = str(
                        solver_results.solver.termination_condition
                    )

            # Extract solve time
            if hasattr(solver_results, "solver"):
                if hasattr(solver_results.solver, "time"):
                    info.solve_time = solver_results.solver.time

            # Extract iteration count
            if hasattr(solver_results, "problem"):
                if hasattr(solver_results.problem, "number_of_iterations"):
                    info.iterations = solver_results.problem.number_of_iterations

            # Extract node count (for MIP solvers)
            if hasattr(solver_results, "problem"):
                if hasattr(solver_results.problem, "number_of_nodes"):
                    info.nodes = solver_results.problem.number_of_nodes

        except Exception:
            # Silently fail if we can't extract solver info
            pass

        return info

    def __repr__(self) -> str:
        parts = [f"ModelResult(status={self.status})"]
        if self.objective:
            parts.append(f"  {self.objective}")
        parts.append(f"  Variables: {len(self.variables.keys())}")
        parts.append(f"  Constraints: {len(self.constraints.keys())}")
        if self.solver_info.solver_name:
            parts.append(f"  {self.solver_info}")
        return "\n".join(parts)

    def summary(self) -> str:
        """Get a human-readable summary of the results"""
        lines = [
            "=" * 60,
            "OPTIMIZATION RESULTS",
            "=" * 60,
            f"Status: {self.status}",
        ]

        if self.objective:
            lines.extend(
                [
                    "",
                    "Objective:",
                    f"  {self.objective.name} ({self.objective.sense}): {self.objective.value}",
                ]
            )

        if self.variables.keys():
            lines.extend(["", "Variables:"])
            for name, result in self.variables.items():
                if isinstance(result, ScalarVariableResult):
                    lines.append(f"  {name} = {result.value}")
                else:
                    lines.append(
                        f"  {name}[{', '.join(result.indices)}]: {len(result.values)} values"
                    )

        if self.constraints.keys():
            lines.extend(["", f"Constraints: {len(self.constraints.keys())} total"])

        if self.solver_info.solver_name:
            lines.extend(["", "Solver Info:", f"  {self.solver_info}"])

        lines.append("=" * 60)
        return "\n".join(lines)
