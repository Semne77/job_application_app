from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl


class JobAnalyzeIn(BaseModel):
    """
    Accept either raw job description text OR a URL to fetch.
    At least one must be provided.
    """
    jd_text: Optional[str] = None
    url: Optional[HttpUrl] = None


class JobOut(BaseModel):
    id: int
    title: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True
