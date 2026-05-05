import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import (
    AnalysisResponse,
    AnalyzeRequest,
    MessageResponse,
    ReportResponse,
)
from backend.services import SentimentService


def get_allowed_origins() -> list[str]:
    configured = os.getenv("ALLOWED_ORIGINS")
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


app = FastAPI(
    title="AI Customer Sentiment Analyzer API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)

service = SentimentService()


@app.get("/api/health", response_model=MessageResponse)
def get_health() -> MessageResponse:
    return MessageResponse(message="Sentiment API is running.")


@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze_feedback(payload: AnalyzeRequest) -> AnalysisResponse:
    try:
        return AnalysisResponse(**service.analyze_feedback(payload.feedback))
    except Exception as exc:
        # Future auth and rate limiting should be enforced before analysis.
        raise HTTPException(status_code=500, detail="Unable to analyze feedback.") from exc


@app.get("/api/history", response_model=list[AnalysisResponse])
def get_history() -> list[AnalysisResponse]:
    return [AnalysisResponse(**item) for item in service.get_history()]


@app.get("/api/report", response_model=ReportResponse)
def get_report() -> ReportResponse:
    return ReportResponse(**service.get_report())


@app.delete("/api/history", response_model=MessageResponse)
def clear_history() -> MessageResponse:
    service.clear_history()
    return MessageResponse(message="History cleared successfully.")
