from __future__ import annotations

import re
from html import unescape
from typing import List

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.db.models import Job, User
from app.schemas.jobs import JobAnalyzeIn, JobOut

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _strip_html(html: str) -> str:
    """Very simple HTML → text conversion (good enough for mock)."""
    text = unescape(html)
    text = re.sub(r"<script.*?>.*?</script>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<style.*?>.*?</style>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _guess_title(text: str) -> str:
    """
    Heuristic: prefer a 'Title:' line; otherwise first non-empty short line.
    """
    # Try explicit “Title: …”
    m = re.search(r"(?:job\s*)?title\s*[:\-]\s*(.+)", text, flags=re.I)
    if m:
        return m.group(1).strip()[:120]

    # Otherwise first non-empty line (split on periods or newlines)
    for line in re.split(r"[\n\.]+", text):
        s = line.strip()
        if 2 <= len(s) <= 120:
            return s
    return "Untitled role"


@router.post("/analyze", response_model=JobOut, status_code=status.HTTP_201_CREATED)
async def analyze_job(
    body: JobAnalyzeIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    - If `url` provided, fetch the page and extract text (very simple parser).
    - If only `jd_text` provided, use it directly.
    - Create a `Job` record for this user and return it.
    """
    if not body.jd_text and not body.url:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either jd_text or url",
        )

    text = body.jd_text or ""
    if body.url:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(str(body.url))
            if resp.status_code != 200 or not resp.text:
                raise HTTPException(400, f"Failed to fetch URL (status {resp.status_code})")
            text = _strip_html(resp.text)
        except httpx.HTTPError as e:
            raise HTTPException(400, f"Error fetching URL: {e!s}")

    if not text or len(text.strip()) < 5:
        raise HTTPException(400, "Job description appears to be empty")

    title = _guess_title(text)
    # Optional: trim description to something reasonable
    description = text[:20000]

    row = Job(user_id=current_user.id, title=title, description=description)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=List[JobOut])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return this user's jobs (newest first).
    """
    rows = (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )
    return rows
