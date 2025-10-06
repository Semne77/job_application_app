from pydantic import BaseModel, Field
from datetime import datetime

# Allowed statuses for your simple pipeline (feel free to expand)
_ALLOWED = {
    "draft",
    "submitted",
    "received",
    "interview_requested",
    "rejected",
    "onsite_requested",
    "offer",
}

class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: int
    status: str = Field(default="submitted")

    # simple validator (optional; FastAPI will 422 on invalid)
    def model_post_init(self, __context):
        if self.status not in _ALLOWED:
            raise ValueError(f"status must be one of: {', '.join(sorted(_ALLOWED))}")

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    resume_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
