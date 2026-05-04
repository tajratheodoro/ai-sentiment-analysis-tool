from pydantic import BaseModel, ConfigDict, Field, field_validator


class AnalyzeRequest(BaseModel):
    feedback: str = Field(..., min_length=3, max_length=2000)

    @field_validator("feedback")
    @classmethod
    def normalize_feedback(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise ValueError("Feedback must contain at least 3 characters.")
        if len(cleaned) > 2000:
            raise ValueError("Feedback must contain at most 2000 characters.")
        return cleaned


class AnalysisResponse(BaseModel):
    id: int | None = None
    feedback: str
    sentiment: str

    model_config = ConfigDict(from_attributes=True)


class ReportResponse(BaseModel):
    total_feedbacks: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_percentage: float


class MessageResponse(BaseModel):
    message: str
