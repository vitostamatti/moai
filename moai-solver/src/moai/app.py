from fastapi import FastAPI, HTTPException

from moai.model import Model, ModelData
from moai.results import ModelResult

app = FastAPI(title="MOAI API", version="0.1.0")


@app.post("/api/model/solve", response_model=ModelResult)
async def solve_model(payload: ModelData):
    """
    Solve an optimization model and return structured, typed results.

    The endpoint accepts a ModelData payload, builds the optimization model,
    solves it, and returns a ModelResult with typed variable and constraint values.
    """
    # Build model
    try:
        model = Model.from_data(payload)
    except Exception as e:
        # TODO: improve error handling
        raise HTTPException(status_code=400, detail=str(e)) from e

    # Solve model using the new solve method
    try:
        result = model.solve(solver_name="cbc")
        return result
    except Exception as e:
        # TODO: improve error handling
        raise HTTPException(status_code=500, detail=str(e)) from e
