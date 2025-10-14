from typing import cast

import pyomo.environ as pyo
from openai import BaseModel
from pydantic import ConfigDict

from .constraints import Constraint
from .objectives import Objective
from .parameters import Parameter
from .parse import (
    constraint_to_pyomo,
    objective_to_pyomo,
    parameter_to_pyomo,
    set_to_pyomo,
    var_to_pyomo,
)
from .sets import Set
from .variables import Variable


# serializable model
class ModelData(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    name: str
    sets: list[Set] = []
    parameters: list[Parameter] = []
    variables: list[Variable] = []
    constraints: list[Constraint] = []
    objective: Objective | None = None


class Model:
    """Complete MOAI model"""

    def __init__(self, name: str):
        self._name = name
        self._sets: list[Set] = []
        self._parameters: list[Parameter] = []
        self._variables: list[Variable] = []
        self._constraints: list[Constraint] = []
        self._objective: Objective | None = None
        self._model = cast(pyo.ConcreteModel, pyo.ConcreteModel(name=name))

    def to_data(self) -> ModelData:
        """Convert to serializable model data"""
        return ModelData(
            name=self.name,
            sets=self.sets,
            parameters=self.parameters,
            variables=self.variables,
            constraints=self.constraints,
            objective=self.objective,
        )

    @classmethod
    def from_data(cls, data: ModelData) -> "Model":
        """Create a model from serializable model data"""
        model = cls(data.name)
        for s in data.sets:
            model.add_set(s)
        for p in data.parameters:
            model.add_parameter(p)
        for v in data.variables:
            model.add_variable(v)
        for c in data.constraints:
            model.add_constraint(c)
        if data.objective is not None:
            model.set_objective(data.objective)
        return model

    @property
    def name(self) -> str:
        """Model name"""
        return self._name

    @property
    def sets(self) -> list[Set]:
        """All sets in the model"""
        return self._sets

    @property
    def parameters(self) -> list[Parameter]:
        """All parameters in the model"""
        return self._parameters

    @property
    def variables(self) -> list[Variable]:
        """All variables in the model"""
        return self._variables

    @property
    def constraints(self) -> list[Constraint]:
        """All constraints in the model"""
        return self._constraints

    @property
    def objective(self) -> Objective | None:
        """Objective of the model"""
        return self._objective

    @property
    def pyomo_model(self) -> pyo.ConcreteModel:
        """Get the Pyomo model"""
        return self._model

    def get_set_by_name(self, name: str) -> Set | None:
        """Get a set by name"""
        for s in self.sets:
            if s.name == name:
                return s
        return None

    def get_parameter_by_name(self, name: str) -> Parameter | None:
        """Get a parameter by name"""
        for p in self.parameters:
            if p.name == name:
                return p
        return None

    def get_variable_by_name(self, name: str) -> Variable | None:
        """Get a variable by name"""
        for v in self.variables:
            if v.name == name:
                return v
        return None

    def get_constraint_by_name(self, name: str) -> Constraint | None:
        """Get a constraint by name"""
        for c in self.constraints:
            if c.name == name:
                return c
        return None

    def get_set_names(self) -> list[str]:
        """Get all set names for Pyomo model creation"""
        return [s.name for s in self.sets]

    def get_parameter_names(self) -> list[str]:
        """Get all parameter names for Pyomo model creation"""
        return [p.name for p in self.parameters]

    def get_variable_names(self) -> list[str]:
        """Get all variable names for Pyomo model creation"""
        return [v.name for v in self.variables]

    def get_constraint_names(self) -> list[str]:
        """Get all constraint names for Pyomo model creation"""
        return [c.name for c in self.constraints]

    def add_set(self, set: Set):
        """
        Add a set to the model. If a set with the same name exists, it will be replaced.
        """
        # Check if set with this name exists
        existing_index = None
        for i, s in enumerate(self._sets):
            if s.name == set.name:
                existing_index = i
                break

        if existing_index is not None:
            self._sets[existing_index] = set
        else:
            self._sets.append(set)

        # Add the variable to the model
        # remove component if exists
        if hasattr(self._model, set.name):
            self._model.del_component(set.name)
        self._model.add_component(
            set.name,
            set_to_pyomo(
                set,
            ),
        )
        return self

    def remove_set(self, set_name: str):
        """
        Remove a set from the model by name.
        """
        # Remove from internal list
        self._sets = [s for s in self._sets if s.name != set_name]

        # Remove from Pyomo model if exists
        if hasattr(self._model, set_name):
            self._model.del_component(set_name)
        return self

    def add_variable(self, variable: Variable):
        """
        Add a variable to the model. If a variable with the same name exists, it will be replaced.
        """
        # Check if variable with this name exists
        existing_index = None
        for i, v in enumerate(self._variables):
            if v.name == variable.name:
                existing_index = i
                break

        if existing_index is not None:
            self._variables[existing_index] = variable
        else:
            self._variables.append(variable)

        # remove component if exists
        if hasattr(self._model, variable.name):
            self._model.del_component(variable.name)
        self._model.add_component(
            variable.name,
            var_to_pyomo(
                variable,
                self._model,
            ),
        )
        return self

    def remove_variable(self, variable_name: str):
        """
        Remove a variable from the model by name.
        """
        # Remove from internal list
        self._variables = [v for v in self._variables if v.name != variable_name]

        # Remove from Pyomo model if exists
        if hasattr(self._model, variable_name):
            self._model.del_component(variable_name)
        return self

    def add_parameter(self, parameter: Parameter):
        """
        Add a parameter to the model. If a parameter with the same name exists, it will be replaced.
        """
        # Check if parameter with this name exists
        existing_index = None
        for i, p in enumerate(self._parameters):
            if p.name == parameter.name:
                existing_index = i
                break

        if existing_index is not None:
            self._parameters[existing_index] = parameter
        else:
            self._parameters.append(parameter)

        # remove component if exists
        if hasattr(self._model, parameter.name):
            self._model.del_component(parameter.name)
        self._model.add_component(
            parameter.name,
            parameter_to_pyomo(
                parameter,
                self._model,
            ),
        )
        return self

    def remove_parameter(self, parameter_name: str):
        """
        Remove a parameter from the model by name.
        """
        # Remove from internal list
        self._parameters = [p for p in self._parameters if p.name != parameter_name]

        # Remove from Pyomo model if exists
        if hasattr(self._model, parameter_name):
            self._model.del_component(parameter_name)
        return self

    def add_constraint(self, constraint: Constraint):
        """
        Add a constraint to the model. If a constraint with the same name exists, it will be replaced.
        """
        # Check if constraint with this name exists
        existing_index = None
        for i, c in enumerate(self._constraints):
            if c.name == constraint.name:
                existing_index = i
                break

        if existing_index is not None:
            self._constraints[existing_index] = constraint
        else:
            self._constraints.append(constraint)

        # remove component if exists
        if hasattr(self._model, constraint.name):
            self._model.del_component(constraint.name)
        self._model.add_component(
            constraint.name,
            constraint_to_pyomo(
                constraint,
                self._model,
            ),
        )
        return self

    def remove_constraint(self, constraint_name: str):
        """
        Remove a constraint from the model by name.
        """
        # Remove from internal list
        self._constraints = [c for c in self._constraints if c.name != constraint_name]

        # Remove from Pyomo model if exists
        if hasattr(self._model, constraint_name):
            self._model.del_component(constraint_name)
        return self

    def set_objective(self, objective: Objective):
        """
        Set the objective of the model. If an objective already exists, it will be replaced.
        """
        self._objective = objective
        # remove component if exists
        if hasattr(self._model, "obj"):
            self._model.del_component("obj")
        self._model.add_component(
            objective.name,
            objective_to_pyomo(
                objective,
                self._model,
            ),
        )
        return self

    def remove_objective(self):
        """
        Remove the objective from the model.
        """
        self._objective = None
        # Remove from Pyomo model if exists
        if hasattr(self._model, "obj"):
            self._model.del_component("obj")
        return self

    def solve(self, solver_name: str = "cbc", **solver_options):
        """
        Solve the optimization model and return structured results.

        Args:
            solver_name: Name of the solver to use (default: "cbc")
            **solver_options: Additional options to pass to the solver

        Returns:
            Structured ModelResult with typed variable and constraint results

        Example:
            >>> from moai.model import Model
            >>> from moai.variables import Variable
            >>> # ... build model ...
            >>> result = model.solve("cbc")
            >>> print(result.summary())
            >>> x_value = result.variables["x"].value
        """
        from .results import ModelResult as TypedModelResult

        opt = pyo.SolverFactory(solver_name)

        # Set solver options if provided
        for key, value in solver_options.items():
            opt.options[key] = value

        solver_results = opt.solve(self._model)

        # Determine status
        if solver_results.solver.status == pyo.SolverStatus.ok:
            if (
                solver_results.solver.termination_condition
                == pyo.TerminationCondition.optimal
            ):
                status = "optimal"
            elif solver_results.solver.termination_condition in [
                pyo.TerminationCondition.feasible,
                pyo.TerminationCondition.locallyOptimal,
            ]:
                status = "feasible"
            elif (
                solver_results.solver.termination_condition
                == pyo.TerminationCondition.infeasible
            ):
                status = "infeasible"
            elif (
                solver_results.solver.termination_condition
                == pyo.TerminationCondition.unbounded
            ):
                status = "unbounded"
            else:
                status = "success"
        else:
            status = "error"

        return TypedModelResult.from_pyomo(
            status=status,
            pyomo_model=self._model,
            model_data=self.to_data(),
            solver_results=solver_results,
        )
