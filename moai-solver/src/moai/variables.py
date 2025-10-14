from typing import Literal

from pydantic import BaseModel, Field

VariableDomain = Literal[
    "Binary", "NonNegativeIntegers", "NonNegativeReals", "Reals", "Integers"
]


class Variable(BaseModel):
    """Definition of a variable in the MILP model"""

    name: str
    indices: list[str] = Field(
        description="Reference to the set names of the variable to be indexed over",
    )
    domain: VariableDomain
    lb: float | None = None
    ub: float | None = None

    @classmethod
    def create(
        cls,
        name: str,
        domain: VariableDomain = "NonNegativeReals",
        lb: float | None = None,
        ub: float | None = None,
        indices: list[str] | None = None,
    ) -> "Variable":
        """Factory method to create a VariableDefinition"""
        if indices is None:
            indices = []
        return Variable(
            name=name,
            indices=list(indices),
            domain=domain,
            lb=lb,
            ub=ub,
        )

    @property
    def dimension(self) -> int:
        """Get the dimension of the variable (number of indices)"""
        return len(self.indices)

    def is_continuous(self) -> bool:
        """Check if the variable is continuous"""
        return self.domain in ["NonNegativeReals", "Reals"]

    def is_integer(self) -> bool:
        """Check if the variable is integer"""
        return self.domain in ["NonNegativeIntegers", "Integers", "Binary"]

    def is_binary(self) -> bool:
        """Check if the variable is binary"""
        return self.domain == "Binary"
