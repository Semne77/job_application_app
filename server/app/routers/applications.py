from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Application, Job, Resume, User
from app.core.auth import get_current_user
from app.schemas.applications import ApplicationCreate, ApplicationOut

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def create_application(
    body: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure the job belongs to the current user
    job = (
        db.query(Job)
        .filter(Job.id == body.job_id, Job.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Ensure the resume belongs to the current user
    resume = (
        db.query(Resume)
        .filter(Resume.id == body.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Create application row
    app = Application(
        user_id=current_user.id,
        job_id=job.id,
        resume_id=resume.id,
        status=body.status,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

@router.get("", response_model=list[ApplicationOut])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.id.desc())
        .all()
    )
    return rows
