from pydantic import BaseModel
from typing import List

class AnswerIn(BaseModel):
    job_id: int
    prompts: List[str]

class AnswerDraft(BaseModel):
    question: str
    draft: str

class AnswersOut(BaseModel):
    job_id: int
    answers: List[AnswerDraft]
