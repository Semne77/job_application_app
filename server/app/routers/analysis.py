from pathlib import Path
import re
from typing import Iterable
from docx import Document                 # for .docx
from pdfminer.high_level import extract_text  # for .pdf

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Resume, Job, User
from app.core.auth import get_current_user
from app.schemas.analysis import ScoreIn, ScoreOut

router = APIRouter(prefix="/analysis", tags=["analysis"])

# a tiny stopword list to avoid scoring on very common words
_STOPWORDS = {
    "the","and","of","to","a","in","for","on","with","at","by","an","be",
    "as","is","are","that","this","from","or","it","you","your","our","we",
    "will","have","has","i","he","she","they","them","their","his","her"
}

_WORD_RE = re.compile(r"[A-Za-z][A-Za-z0-9_\-\+\.]*")


def _tokenize(text: str) -> list[str]:
    """Lowercase tokenization; filters short/common words."""
    words = [w.lower() for w in _WORD_RE.findall(text)]
    return [w for w in words if len(w) > 2 and w not in _STOPWORDS]


def _keywords(text: str) -> set[str]:
    """Turn text into a keyword set."""
    return set(_tokenize(text))


def _read_text_from_path(path: Path) -> str:
    """
    Extract text from a resume at `path`.
    - .txt   -> UTF-8 text
    - .docx  -> read with python-docx
    - .pdf   -> read with pdfminer.six
    - else   -> best-effort utf-8 decode (may be empty)
    """
    if not path.exists():
        return ""

    try:
        ext = path.suffix.lower()

        if ext == ".txt":
            return path.read_text(encoding="utf-8", errors="ignore")

        if ext == ".docx":
            try:
                doc = Document(str(path))
                return "\n".join(p.text for p in doc.paragraphs)
            except Exception:
                return ""

        if ext == ".pdf":
            try:
                return extract_text(str(path)) or ""
            except Exception:
                return ""

        # Fallback (rarely useful for binaries)
        return path.read_bytes().decode("utf-8", errors="ignore")

    except Exception:
        return ""



@router.post("/score", response_model=ScoreOut, status_code=status.HTTP_200_OK)
def score_resume(
    body: ScoreIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Compute a mock compatibility score between a user's resume and a job.
    Scoring = |overlap(job_keywords ∩ resume_keywords)| / |job_keywords| * 100
    """
    # --- fetch rows & enforce ownership ---
    resume = (
        db.query(Resume)
        .filter(Resume.id == body.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job = (
        db.query(Job)
        .filter(Job.id == body.job_id, Job.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # --- load texts ---
    resume_text = _read_text_from_path(Path(resume.file_path))
    job_text = job.description or ""

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text could not be read")
    if not job_text.strip():
        raise HTTPException(status_code=400, detail="Job description is empty")

    # --- keyword sets ---
    resume_kw = _keywords(resume_text)
    job_kw = _keywords(job_text)

    if not job_kw:
        return ScoreOut(
            score=0,
            reasons=["No meaningful keywords detected in the job description."],
            matched_keywords=[],
            missing_keywords=[],
        )

    overlap = sorted(job_kw & resume_kw)
    missing = sorted(job_kw - resume_kw)

    score = int(round(len(overlap) / max(1, len(job_kw)) * 100))

    # --- reasons (human-readable) ---
    reasons: list[str] = [
        f"Matched {len(overlap)} of {len(job_kw)} job keywords.",
    ]
    if overlap[:10]:
        reasons.append("Examples of matched keywords: " + ", ".join(overlap[:10]))
    if missing[:10]:
        reasons.append("Missing keywords to consider: " + ", ".join(missing[:10]))

    return ScoreOut(
        score=score,
        reasons=reasons,
        matched_keywords=overlap[:50],   # cap lists so the payload stays small
        missing_keywords=missing[:50],
    )
