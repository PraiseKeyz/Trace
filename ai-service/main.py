from fastapi import FastAPI
from api.score import router as score_router
from api.match import router as match_router
from api.intelligence import router as intelligence_router

app = FastAPI(
    title="Trace AI Microservice",
    description="Scoring engine, matching algorithm, intelligence generation for Trace platform",
    version="1.0.0"
)

app.include_router(score_router, prefix="/score", tags=["Score"])
app.include_router(match_router, prefix="/match", tags=["Match"])
app.include_router(intelligence_router, prefix="/intelligence", tags=["Intelligence"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Trace AI Microservice"}
