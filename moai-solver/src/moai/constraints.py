from typing import Literal

from pydantic import BaseModel

from .expressions import ComparisonExpression


class Quantifier(BaseModel):
    """A quantifier in the optimization problem."""

    index: str
    over: str
    condition: "ComparisonExpression | None"

    def display(self) -> str:
        """A string representation of the quantifier."""
        if self.condition:
            return f"for {self.index} in {self.over} if {self.condition.display()}"
        return f"for {self.index} in {self.over}"

    @classmethod
    def create(
        cls, index: str, over: str, condition: "ComparisonExpression | None" = None
    ) -> "Quantifier":
        return Quantifier(index=index, over=over, condition=condition)


class Constraint(BaseModel):
    """A constraint in the optimization problem."""

    type: Literal["constraint"]
    name: str
    expr: ComparisonExpression
    quantifiers: "list[Quantifier] | None" = None

    @classmethod
    def create(
        cls,
        name: str,
        expr: ComparisonExpression,
        quantifiers: "list[Quantifier] | None" = None,
    ) -> "Constraint":
        return Constraint(
            type="constraint", name=name, expr=expr, quantifiers=quantifiers
        )

    def display(self) -> str:
        """A string representation of the constraint."""
        return f"{self.expr.display()} " + (
            ", ".join(q.display() for q in self.quantifiers) if self.quantifiers else ""
        )
