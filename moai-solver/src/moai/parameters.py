"""
Parameter definitions for MILP models
"""

from pydantic import BaseModel

IndexValue = str | int


class IndexElement(BaseModel):
    """Single indexed element with a value"""

    index: list[IndexValue]
    value: float

    def matches_index(self, index: list[IndexValue]) -> bool:
        """Check if this element matches the given index"""
        return self.index == index


class Parameter(BaseModel):
    """Definition of a parameter in the MILP model"""

    name: str
    indices: list[str]  # Reference to set names, not index variables
    values: list[IndexElement] | float | int

    def get_value(self, index: list[str | int]) -> float:
        """Get the value for a specific index"""
        if isinstance(self.values, int | float):
            return self.values
        for element in self.values:
            if element.matches_index(index):
                return element.value
        raise KeyError(f"No value found for index {index}")

    def has_index(self, index: list[str | int]) -> bool:
        """Check if the parameter has a value for the given index"""
        if isinstance(self.values, int | float):
            return True
        if not self.indices:
            return False
        if len(index) != len(self.indices):
            raise ValueError(
                f"Index length {len(index)} does not match parameter indices length {len(self.indices)}"
            )
        return any(element.matches_index(index) for element in self.values)

    @classmethod
    def create(
        cls,
        name: str,
        values: list[IndexElement] | float | int,
        indices: list[str] | None = None,
    ) -> "Parameter":
        """Factory method to create a ParameterDefinition"""
        return Parameter(
            name=name,
            indices=indices or [],
            values=values,
        )
