from typing import Literal

from pydantic import BaseModel

from .expressions import ExprType


class Objective(BaseModel):
    name: str
    expr: ExprType
    sense: Literal["min", "max"] = "min"
