from pydantic import BaseModel

class ScoreIn(BaseModel):
    resume_id: int
    job_id: int

class ScoreOut(BaseModel):
    score: int                   # 0..100
    reasons: list[str]           # human-readable notes
    matched_keywords: list[str]  # keywords found in BOTH
    missing_keywords: list[str]  # keywords in job, missing from resume
