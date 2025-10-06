from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Job, User
from app.core.auth import get_current_user
from app.schemas.answers import AnswerIn, AnswerDraft, AnswersOut

router = APIRouter(prefix="/answers", tags=["answers"])


def _draft_answer(question: str, job_title: str) -> str:
    """
    Tiny, deterministic template so we can unit test later.
    Replace this with a call to your LLM/agent when ready.
    """
    return (
        f"**Question:** {question}\n\n"
        f"**Draft:** For the {job_title} role, I’d use a concise STAR structure:\n"
        f"- **Situation/Task:** Briefly set context relevant to the question.\n"
        f"- **Action:** 2–3 concrete actions I took (tools, frameworks, teamwork).\n"
        f"- **Result:** Quantify impact if possible (time saved, defects reduced, revenue gained).\n"
        f"- **Tie-back:** Close by aligning with the {job_title} responsibilities."
    )


@router.post("/draft", response_model=AnswersOut, status_code=status.HTTP_200_OK)
def draft_answers(
    body: AnswerIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not body.prompts:
        raise HTTPException(status_code=422, detail="prompts cannot be empty")

    # Ensure the job exists and belongs to the current user
    job = (
        db.query(Job)
        .filter(Job.id == body.job_id, Job.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    drafts = [
        AnswerDraft(question=q, draft=_draft_answer(q, job.title or "target"))
        for q in body.prompts
        if q and q.strip()
    ]
    if not drafts:
        raise HTTPException(status_code=422, detail="No valid prompts provided")

    return AnswersOut(job_id=body.job_id, answers=drafts)
