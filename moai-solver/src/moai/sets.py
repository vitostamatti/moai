from pydantic import BaseModel

SetElements = list[str] | list[int]


class Set(BaseModel):
    """Definition of a set in the MILP model"""

    name: str
    elements: SetElements

    @classmethod
    def create(cls, name: str, elements: SetElements):
        return Set(
            name=name,
            elements=elements,
        )

    def iter_elements(self):
        """Iterate over set elements"""
        return iter(self.elements)
